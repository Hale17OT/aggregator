import 'dart:async';
import 'data.dart';
import 'media.dart';
import 'member.dart';

/// Opt-in exact-rendition progress; never queues writes while offline.
class ListeningSync {
  final Api api;
  final MediaCoordinator media;
  final MemberState member;
  String? owner;
  int epoch = 0;
  int operation = 0;
  bool consent = false, conflict = false;
  bool clearing = false;
  Future<void>? pending;
  final revisions = <String, int>{};
  DateTime last = DateTime.fromMillisecondsSinceEpoch(0);
  ListeningSync(this.api, this.media, this.member) {
    member.addListener(refresh);
    media.radio.player.positionStream.listen((position) {
      final p = media.programme;
      if (media.owner == 'radio' &&
          p != null &&
          media.radioAccountGeneration == api.generation) {
        write(p, p.raw['renditionKey'], position);
      }
    });
    refresh();
  }
  Future<void> refresh() async {
    if (clearing) return;
    final next = member.session?['user']['id'] as String?;
    if (next == owner && member.historyRevision == epoch) return;
    owner = next;
    media.videoPositions.clear();
    epoch = member.historyRevision;
    final history = epoch, generation = api.generation, task = ++operation;
    consent = false;
    conflict = false;
    revisions.clear();
    if (next == null) return;
    try {
      final prefs = await api.request('/api/v1/me/preferences', member: true);
      final state = await api.request('/api/v1/me/listening', member: true);
      if (generation != api.generation ||
          owner != next ||
          history != epoch ||
          task != operation) {
        return;
      }
      consent = prefs['listeningHistory'];
      for (final item in state['progress']) {
        revisions[item['programmeId']] = item['revision'];
      }
    } catch (_) {
      if (generation == api.generation &&
          history == epoch &&
          task == operation) {
        consent = false;
      }
    }
  }

  void write(Programme programme, String rendition, Duration position) {
    if (clearing ||
        !consent ||
        owner == null ||
        pending != null ||
        conflict ||
        DateTime.now().difference(last).inSeconds < 15) {
      return;
    }
    last = DateTime.now();
    pending = send(
      programme,
      rendition,
      position,
    ).whenComplete(() => pending = null);
  }

  Future<void> send(
    Programme programme,
    String rendition,
    Duration position,
  ) async {
    final generation = api.generation, history = member.historyRevision;
    try {
      final result = await api.request(
        '/api/v1/me/progress',
        method: 'PUT',
        member: true,
        body: {
          'programmeId': programme.id,
          'renditionKey': rendition,
          'positionMs': position.inMilliseconds,
          'revision': revisions[programme.id] ?? 0,
        },
      );
      if (generation == api.generation && history == member.historyRevision) {
        revisions[programme.id] = result['revision'];
      }
    } catch (e) {
      if (generation == api.generation &&
          history == member.historyRevision &&
          e is ApiFailure &&
          e.status == 409) {
        conflict = true;
      }
    }
  }

  Future<void> clear() async {
    if (clearing) throw ApiFailure(409, 'HISTORY_CLEAR_PENDING');
    final generation = api.generation;
    final task = ++operation;
    clearing = true;
    consent = false;
    try {
      // Finish an already sent write before the caller deletes server history.
      await pending;
      if (generation != api.generation || task != operation) {
        throw ApiFailure(409, 'IDENTITY_CHANGED');
      }
      await api.request(
        '/api/v1/me/progress',
        method: 'DELETE',
        body: {},
        member: true,
      );
      if (generation != api.generation || task != operation) return;
      revisions.clear();
      conflict = false;
      media.videoPositions.clear();
      // The user can opt back in deliberately through Preferences; clearing
      // history must not immediately recreate the deleted current position.
    } finally {
      clearing = false;
      if (generation != api.generation) {
        refresh();
      }
    }
  }
}
