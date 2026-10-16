import 'dart:async';
import 'package:flutter_test/flutter_test.dart';
import 'package:just_audio/just_audio.dart';
import 'package:aggregator_mobile/data.dart';
import 'package:aggregator_mobile/media.dart';
import 'package:aggregator_mobile/member.dart';
import 'package:aggregator_mobile/listening_sync.dart';

// Only platform playback and HTTP are replaced. The production ListeningSync
// and MemberState implement all identity, consent and clear ordering below.
class ReviewPlayer extends Fake implements AudioPlayer {
  @override
  Stream<Duration> get positionStream => const Stream.empty();
}

class ReviewRadio extends Fake implements RadioHandler {
  @override
  final AudioPlayer player = ReviewPlayer();
}

class ReviewMedia extends Fake implements MediaCoordinator {
  @override
  final RadioHandler radio = ReviewRadio();
  @override
  final Map<String, Duration> videoPositions = {};
}

class ReviewApi extends Fake implements Api {
  @override
  int generation = 0;
  @override
  String? credential = 'owner-a';
  Completer<dynamic>? preferencesGate;
  Completer<dynamic>? deleteGate;
  final deletes = <String?>[];
  int progressWrites = 0;

  @override
  void clear() {
    generation++;
    credential = null;
  }

  @override
  Future<dynamic> request(
    String path, {
    String method = 'GET',
    Json? body,
    bool member = false,
  }) async {
    if (path.endsWith('/preferences')) {
      return preferencesGate == null
          ? {'listeningHistory': true}
          : await preferencesGate!.future;
    }
    if (path.endsWith('/listening')) return {'progress': <dynamic>[]};
    if (path.endsWith('/progress') && method == 'DELETE') {
      deletes.add(credential);
      return await deleteGate?.future;
    }
    if (path.endsWith('/progress') && method == 'PUT') {
      progressWrites++;
      return {'revision': 1};
    }
    throw StateError('Unexpected $method $path');
  }
}

Future<void> flushAsync() => Future<void>.delayed(Duration.zero);

void main() {
  test(
    'Clear started by A cannot delete B history after pending write drains',
    () async {
      final api = ReviewApi();
      final member = MemberState(api);
      final sync = ListeningSync(api, ReviewMedia(), member);
      sync.owner = 'owner-a';
      sync.consent = true;
      final write = Completer<void>();
      sync.pending = write.future;
      final clearing = sync.clear();
      final rejected = expectLater(
        clearing,
        throwsA(
          isA<ApiFailure>().having((e) => e.code, 'code', 'IDENTITY_CHANGED'),
        ),
      );
      api.clear();
      api.credential = 'owner-b';
      member.session = {
        'user': {'id': 'owner-b'},
      };
      await sync.refresh();
      write.complete();
      await rejected;
      expect(api.deletes, isEmpty);
      member.dispose();
    },
  );

  test('A refresh started before Clear cannot restore stale consent', () async {
    final api = ReviewApi()..preferencesGate = Completer<dynamic>();
    final member = MemberState(api)
      ..session = {
        'user': {'id': 'owner-a'},
      };
    final sync = ListeningSync(api, ReviewMedia(), member);
    await sync.clear();
    api.preferencesGate!.complete({'listeningHistory': true});
    await flushAsync();
    expect(api.deletes, ['owner-a']);
    expect(sync.consent, isFalse);
    member.dispose();
  });

  test(
    'Preference refresh during an active DELETE cannot restart history writes',
    () async {
      final api = ReviewApi()..deleteGate = Completer<dynamic>();
      final member = MemberState(api)
        ..session = {
          'user': {'id': 'owner-a'},
        };
      final sync = ListeningSync(api, ReviewMedia(), member);
      await flushAsync();
      expect(sync.consent, isTrue);
      final clearing = sync.clear();
      await flushAsync();
      expect(api.deletes, ['owner-a']);
      // Simulates a successful preferences save while deletion is in flight.
      member.historyChanged();
      await flushAsync();
      final consentDuringDelete = sync.consent;
      final p = Programme({
        'programmeId': 'fixture-radio',
        'renditionKey': 'fixture-rendition',
        'durationMs': 60000,
        'segments': <dynamic>[],
        'sources': <dynamic>[],
      });
      sync.write(p, 'fixture-rendition', const Duration(seconds: 20));
      await flushAsync();
      api.deleteGate!.complete(null);
      await clearing;
      expect(
        consentDuringDelete,
        isFalse,
        reason:
            'An active clear suppresses even newly triggered consent refreshes',
      );
      expect(
        api.progressWrites,
        0,
        reason:
            'A new progress write must not race after DELETE and recreate history',
      );
      member.dispose();
    },
  );
}
