import 'package:flutter/material.dart';
import 'data.dart';
import 'main.dart';

class PreferencesPage extends StatefulWidget {
  const PreferencesPage({super.key});
  @override
  State<PreferencesPage> createState() => _PreferencesState();
}

class _PreferencesState extends State<PreferencesPage> {
  Json? saved, draft;
  String? error;
  bool busy = false;
  @override
  void initState() {
    super.initState();
    load();
  }

  Future<void> load() async {
    try {
      final v = await api.request('/api/v1/me/preferences', member: true);
      if (mounted) {
        setState(() {
          saved = v;
          draft = Map<String, dynamic>.from(v);
          error = null;
        });
        member.applyPreferences(v);
      }
    } catch (e) {
      if (mounted) setState(() => error = e.toString());
    }
  }

  Future<void> save() async {
    if (draft == null) return;
    setState(() => busy = true);
    final patch = {...draft!}..remove('updatedAt');
    try {
      final v = await api.request(
        '/api/v1/me/preferences',
        method: 'PATCH',
        body: patch,
        member: true,
      );
      if (mounted) {
        setState(() {
          saved = v;
          draft = Map<String, dynamic>.from(v);
          error = null;
        });
        member.applyPreferences(v);
        member.historyChanged();
      }
    } catch (e) {
      if (mounted) {
        setState(
          () => error =
              '$e Draft kept. Reload to compare with the current saved version.',
        );
      }
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (draft == null) {
      return error == null
          ? const Center(child: CircularProgressIndicator())
          : FailureView(error!, load);
    }
    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        Text('Preferences', style: Theme.of(context).textTheme.headlineLarge),
        if (error != null) Text(error!),
        const SizedBox(height: 18),
        select('Theme', 'theme', ['system', 'light', 'dark']),
        select('Home edition', 'homeMode', ['editorial', 'following']),
        select('Reading size', 'textSize', ['small', 'standard', 'large']),
        SwitchListTile(
          title: const Text('Reduce motion'),
          value: draft!['reduceMotion'],
          onChanged: (v) => setState(() => draft!['reduceMotion'] = v),
        ),
        select('Playback speed', 'playbackSpeed', [.75, 1, 1.25, 1.5]),
        select('Newsroom anchors', 'anchorCount', [1, 2]),
        select('Media treatment', 'mediaTreatment', [
          'narration_over_visual',
          'clip_then_comment',
        ]),
        SwitchListTile(
          title: const Text('Keep listening history'),
          subtitle: const Text(
            'Only this account’s opted-in exact recording progress is saved.',
          ),
          value: draft!['listeningHistory'],
          onChanged: (v) => setState(() => draft!['listeningHistory'] = v),
        ),
        Wrap(
          spacing: 12,
          children: [
            FilledButton(
              onPressed: busy ? null : save,
              child: const Text('Save preferences'),
            ),
            OutlinedButton(
              onPressed: busy ? null : load,
              child: const Text('Discard draft and reload'),
            ),
          ],
        ),
        TextButton(
          onPressed: busy
              ? null
              : () async {
                  try {
                    await listeningSync.clear();
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text(
                            'History cleared. Saving preferences resumes opted-in progress recording.',
                          ),
                        ),
                      );
                    }
                  } catch (e) {
                    if (mounted) setState(() => error = e.toString());
                  }
                },
          child: const Text('Clear account listening history'),
        ),
      ],
    );
  }

  Widget select(String label, String key, List<Object> values) => Padding(
    padding: const EdgeInsets.only(bottom: 16),
    child: DropdownButtonFormField<Object>(
      icon: const Icon(Icons.expand_more),
      key: ValueKey('$key-${saved?['lockVersion']}'),
      initialValue: draft![key],
      isExpanded: true,
      decoration: InputDecoration(labelText: label),
      items: values
          .map(
            (v) => DropdownMenuItem(
              value: v,
              child: Text(v.toString().replaceAll('_', ' ')),
            ),
          )
          .toList(),
      onChanged: busy ? null : (v) => setState(() => draft![key] = v),
    ),
  );
}

class AccountQueue extends StatefulWidget {
  const AccountQueue({super.key});
  @override
  State<AccountQueue> createState() => _QueueState();
}

class _QueueState extends State<AccountQueue> {
  Json? state;
  List<Programme> programmes = [];
  String? error;
  bool busy = false;
  @override
  void initState() {
    super.initState();
    load();
  }

  Future<void> load() async {
    try {
      final data = await Future.wait([
        api.request('/api/v1/me/listening', member: true),
        api.request('/api/v1/programmes'),
      ]);
      if (mounted) {
        setState(() {
          state = data[0];
          programmes = (data[1] as List).map((p) => Programme(p)).toList();
          error = null;
        });
      }
    } catch (e) {
      if (mounted) setState(() => error = e.toString());
    }
  }

  Future<void> change(List<String> ids) async {
    if (busy) return;
    setState(() => busy = true);
    try {
      final v = await api.request(
        '/api/v1/me/queue',
        method: 'PUT',
        member: true,
        body: {'revision': state!['revision'], 'programmeIds': ids},
      );
      if (mounted) setState(() => state = v);
    } catch (e) {
      if (mounted) {
        setState(
          () => error = '$e No automatic overwrite. Refresh before retrying.',
        );
      }
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (state == null) {
      return error == null
          ? const CircularProgressIndicator()
          : FailureView(error!, load);
    }
    final ids = (state!['queue'] as List).cast<String>();
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Account queue',
          style: Theme.of(context).textTheme.headlineMedium,
        ),
        if (error != null) Text(error!),
        for (var i = 0; i < ids.length; i++)
          ListTile(
            title: Text(
              programmes.where((p) => p.id == ids[i]).firstOrNull?.title ??
                  'Programme unavailable',
            ),
            subtitle: Text('${i + 1}'),
            trailing: Wrap(
              children: [
                IconButton(
                  tooltip: 'Move up',
                  onPressed: busy || i == 0
                      ? null
                      : () {
                          final next = [...ids];
                          final item = next.removeAt(i);
                          next.insert(i - 1, item);
                          change(next);
                        },
                  icon: const Icon(Icons.arrow_upward),
                ),
                IconButton(
                  tooltip: 'Remove from queue',
                  onPressed: busy ? null : () => change([...ids]..removeAt(i)),
                  icon: const Icon(Icons.close),
                ),
              ],
            ),
          ),
        if (ids.isEmpty) const Text('No queued programmes.'),
        DropdownButton<String>(
          icon: const Icon(Icons.expand_more),
          isExpanded: true,
          hint: const Text('Add a programme'),
          items: programmes
              .where((p) => !ids.contains(p.id))
              .map(
                (p) => DropdownMenuItem(
                  value: p.id,
                  child: Text(
                    p.title,
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
              )
              .toList(),
          onChanged: busy ? null : (id) => change([...ids, id!]),
        ),
        TextButton.icon(
          onPressed: load,
          icon: const Icon(Icons.refresh),
          label: const Text('Refetch account queue'),
        ),
        Text('Recent listening', style: Theme.of(context).textTheme.titleLarge),
        for (final progress in state!['progress'])
          ListTile(
            title: Text(
              programmes
                      .where((p) => p.id == progress['programmeId'])
                      .firstOrNull
                      ?.title ??
                  'Recording unavailable',
            ),
            subtitle: Text(
              '${(progress['positionMs'] / 60000).floor()} minutes • saved recording revision',
            ),
            onTap: () async {
              final p = programmes
                  .where((p) => p.id == progress['programmeId'])
                  .firstOrNull;
              if (p == null) {
                setState(
                  () => error =
                      'This recording is no longer available. Refresh the account queue.',
                );
                return;
              }
              final identity = api.generation;
              final rendition = p.kind == 'radio'
                  ? p.raw['renditionKey']
                  : p.video?['renditionKey'];
              if (progress['renditionKey'] != rendition) {
                setState(
                  () => error =
                      'The saved position belongs to a different recording revision. Open the programme from its catalogue to start it safely.',
                );
                return;
              }
              if (p.kind == 'radio') {
                final expected = media.epoch + 1;
                await media.loadRadio(p);
                if (!mounted ||
                    api.generation != identity ||
                    media.epoch != expected ||
                    media.programme?.id != p.id ||
                    media.error.value != null) {
                  return;
                }
                await media.radio.seek(
                  Duration(milliseconds: progress['positionMs']),
                );
                if (!mounted ||
                    api.generation != identity ||
                    media.epoch != expected) {
                  return;
                }
                router.go('/radio');
              } else {
                media.videoPositions[p.video!['renditionKey']] = Duration(
                  milliseconds: progress['positionMs'],
                );
                router.go(
                  Uri(
                    path: p.kind == 'clip' ? '/clips' : '/newsroom',
                    queryParameters: {'programme': p.id},
                  ).toString(),
                );
              }
            },
          ),
      ],
    );
  }
}
