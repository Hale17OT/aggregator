import 'dart:async';
import 'dart:convert';
import 'dart:math';
import 'package:flutter/services.dart';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:crypto/crypto.dart';
import 'package:app_links/app_links.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:go_router/go_router.dart';
import 'data.dart';
import 'main.dart';
import 'preferences.dart';

class MemberState extends ChangeNotifier {
  final Api api;
  final FlutterSecureStorage storage;
  Json? session;
  String? error;
  ThemeMode theme = ThemeMode.system;
  double readingScale = 1;
  bool reduceMotion = false;
  String homeMode = 'editorial';
  double playbackSpeed = 1;
  int anchorCount = 1;
  String mediaTreatment = 'narration_over_visual';
  void Function(double)? onPlaybackPreference;
  void applyPreferences(Json prefs) {
    final speed = prefs['playbackSpeed'];
    playbackSpeed = speed is num ? speed.toDouble().clamp(.75, 1.5) : 1;
    anchorCount = prefs['anchorCount'] == 2 ? 2 : 1;
    mediaTreatment = prefs['mediaTreatment'] == 'clip_then_comment'
        ? 'clip_then_comment'
        : 'narration_over_visual';
    onPlaybackPreference?.call(playbackSpeed);
    homeMode = prefs['homeMode'] == 'following' ? 'following' : 'editorial';
    readingScale = switch (prefs['textSize']) {
      'small' => .9,
      'large' => 1.2,
      _ => 1,
    };
    reduceMotion = prefs['reduceMotion'] == true;
    applyTheme(prefs['theme'] ?? 'system');
  }

  int historyRevision = 0;
  void historyChanged() {
    historyRevision++;
    notifyListeners();
  }

  String? verifier, state, pending;
  StreamSubscription<Uri>? links;
  void Function(String)? onNavigate;
  int authEpoch = 0;
  bool signingIn = false;
  Future<void> acceptCodeCredential(String credential, int epoch) async {
    if (epoch != authEpoch) return;
    await stored(() async {
      if (epoch != authEpoch) return;
      await storage.write(key: 'native-session', value: credential);
      if (epoch != authEpoch) await storage.delete(key: 'native-session');
    });
    if (epoch != authEpoch) return;
    api.clear();
    api.credential = credential;
    final current = await api.request('/api/v1/me/session', member: true);
    if (epoch != authEpoch) return;
    session = current;
    error = null;
    notifyListeners();
    try {
      final prefs = await api.request('/api/v1/me/preferences', member: true);
      if (epoch != authEpoch) return;
      applyPreferences(prefs);
      final interests = await api.request('/api/v1/me/interests', member: true);
      if (epoch == authEpoch) {
        onNavigate?.call(
          interests['status'] == 'not_started' ? '/interests' : '/profile',
        );
      }
    } catch (_) {
      if (epoch == authEpoch) {
        error =
            'Signed in. Preferences or interests could not be loaded; retry them in Profile.';
        notifyListeners();
        onNavigate?.call('/profile');
      }
    }
  }

  Future<void> storageTail = Future.value();
  Future<void> stored(Future<void> Function() action) {
    final work = storageTail.then((_) => action());
    storageTail = work.catchError((Object _) {});
    return work;
  }

  MemberState(this.api, {FlutterSecureStorage? secureStorage})
    : storage = secureStorage ?? const FlutterSecureStorage();
  void toggleTheme() {
    theme = theme == ThemeMode.dark ? ThemeMode.light : ThemeMode.dark;
    notifyListeners();
  }

  void applyTheme(String value) {
    theme = switch (value) {
      'dark' => ThemeMode.dark,
      'light' => ThemeMode.light,
      _ => ThemeMode.system,
    };
    notifyListeners();
  }

  Future<void> restore() async {
    try {
      api.credential = await storage.read(key: 'native-session');
      if (api.credential != null) {
        session = await api.request('/api/v1/me/session', member: true);
        applyPreferences(
          await api.request('/api/v1/me/preferences', member: true),
        );
      }
    } catch (_) {
      api.clear();
      session = null;
      error =
          'Saved session unavailable. Sign in again; no plaintext fallback is used.';
    }
    notifyListeners();
  }

  String random() => base64UrlEncode(
    List<int>.generate(32, (_) => Random.secure().nextInt(256)),
  ).replaceAll('=', '');
  Future<void> signIn() async {
    if (signingIn) return;
    signingIn = true;
    notifyListeners();
    final epoch = ++authEpoch;
    final proof = List<int>.generate(
      32,
      (_) => Random.secure().nextInt(256),
    ).map((v) => v.toRadixString(16).padLeft(2, '0')).join();
    String? attempt;
    try {
      final started = await api.request(
        '/api/v1/native/auth/google/start',
        method: 'POST',
        body: {'proof': proof, 'action': 'sign-in'},
      );
      attempt = started['id'];
      if (epoch != authEpoch) return;
      final token = await const MethodChannel('aggregator/google-identity')
          .invokeMethod<String>('signIn', {
            'nonce': started['nonce'],
            'serverClientId': started['serverClientId'],
          });
      if (epoch != authEpoch || token == null) return;
      final result = await api.request(
        '/api/v1/native/auth/google/exchange',
        method: 'POST',
        body: {'id': attempt, 'proof': proof, 'credential': token},
      );
      if (epoch != authEpoch) return;
      await acceptCodeCredential(result['credential'], epoch);
    } on PlatformException catch (e) {
      if (epoch == authEpoch) {
        error = e.code == 'cancelled'
            ? 'Sign-in cancelled.'
            : 'Google sign-in unavailable. Check the account selector and local service.';
        notifyListeners();
      }
    } catch (_) {
      if (epoch == authEpoch) {
        error = 'Google sign-in could not finish. Start a new attempt.';
        notifyListeners();
      }
    } finally {
      if (attempt != null) {
        try {
          await api.request(
            '/api/v1/native/auth/google/cancel',
            method: 'POST',
            body: {'id': attempt, 'proof': proof},
          );
        } catch (_) {}
      }
      signingIn = false;
      notifyListeners();
    }
  }

  Future<void> legacyBrowserSignIn() async {
    final epoch = ++authEpoch;
    try {
      verifier = random();
      state = random();
      final challenge = base64UrlEncode(
        sha256.convert(utf8.encode(verifier!)).bytes,
      ).replaceAll('=', '');
      final r = await api.request(
        '/api/v1/native/auth/start',
        method: 'POST',
        body: {
          'client': 'aggregator-local',
          'redirect': 'aggregator-local://auth/callback',
          'challenge': challenge,
          'state': state,
        },
      );
      if (epoch != authEpoch) return;
      pending = r['id'];
      final url = Uri.parse(r['authorizationUrl']);
      if (url.origin != 'http://127.0.0.1:3000' || url.path != '/auth/native') {
        throw const FormatException('Unsafe browser destination');
      }
      await launchUrl(url, mode: LaunchMode.externalApplication);
    } catch (_) {
      if (epoch != authEpoch) return;
      error = 'Could not start sign-in. Check the local service and retry.';
      notifyListeners();
    }
  }

  void listenLinks() {
    links = AppLinks().uriLinkStream.listen((u) => unawaited(callback(u)));
  }

  Future<void> callback(Uri u) async {
    final epoch = authEpoch;
    try {
      if (u.scheme != 'aggregator-local' ||
          u.host != 'auth' ||
          u.hasPort ||
          u.path != '/callback' ||
          u.fragment.isNotEmpty ||
          u.userInfo.isNotEmpty ||
          u.queryParametersAll.length != 2 ||
          u.queryParametersAll.values.any((v) => v.length != 1) ||
          u.queryParameters['state'] != state ||
          state == null ||
          pending == null ||
          verifier == null) {
        throw const FormatException('Unsolicited callback');
      }
      final code = u.queryParameters['code'];
      if (code == null) throw const FormatException('Missing code');
      final proof = verifier, id = pending;
      state = null;
      verifier = null;
      pending = null;
      final r = await api.request(
        '/api/v1/native/auth/exchange',
        method: 'POST',
        body: {
          'client': 'aggregator-local',
          'redirect': 'aggregator-local://auth/callback',
          'id': id,
          'code': code,
          'verifier': proof,
        },
      );
      if (epoch != authEpoch) return;
      await stored(() async {
        if (epoch != authEpoch) return;
        await storage.write(key: 'native-session', value: r['credential']);
        if (epoch != authEpoch) await storage.delete(key: 'native-session');
      });
      if (epoch != authEpoch) return;
      api.clear();
      api.credential = r['credential'];
      session = await api.request('/api/v1/me/session', member: true);
      if (epoch != authEpoch) return;
      error = null;
      notifyListeners();
      final prefs = await api.request('/api/v1/me/preferences', member: true);
      if (epoch != authEpoch) return;
      applyPreferences(prefs);
      final interests = await api.request('/api/v1/me/interests', member: true);
      if (epoch == authEpoch) {
        onNavigate?.call(
          interests['status'] == 'not_started' ? '/interests' : '/library',
        );
      }
    } catch (_) {
      if (epoch != authEpoch) return;
      error =
          'Sign-in handoff rejected or secure storage unavailable. Start a new sign-in.';
      notifyListeners();
    }
  }

  Future<void> logout() async {
    final epoch = ++authEpoch;
    final retiring = api.forRevocation();
    api.clear();
    session = null;
    state = null;
    readingScale = 1;
    reduceMotion = false;
    homeMode = 'editorial';
    playbackSpeed = 1;
    anchorCount = 1;
    mediaTreatment = 'narration_over_visual';
    onPlaybackPreference?.call(1);
    theme = ThemeMode.system;
    verifier = null;
    pending = null;
    notifyListeners();
    String? failure;
    onNavigate?.call('/library');
    final localRemoval = stored(() => storage.delete(key: 'native-session'))
        .then<String?>(
          (_) => null,
          onError: (Object _) =>
              'Signed out in memory; secure-storage removal failed. Retry clearing local sign-in before closing the app.',
        );
    try {
      await retiring.request(
        '/api/v1/auth/logout',
        method: 'POST',
        body: {},
        member: true,
      );
    } catch (_) {
      failure = 'Signed out locally. Server revocation could not be confirmed.';
    }
    try {
      failure = (await localRemoval) ?? failure;
    } catch (_) {
      failure =
          'Signed out in memory; secure-storage removal failed. Retry sign-out before closing the app.';
    }
    try {
      await const MethodChannel(
        'aggregator/google-identity',
      ).invokeMethod<void>('signOut');
    } catch (_) {
      failure = [
        ?failure,
        'Google selector state could not be cleared; your Google account was not removed.',
      ].join(' ');
    }
    if (epoch != authEpoch) return;
    error = failure;
    notifyListeners();
  }
}

class LibraryPage extends StatefulWidget {
  const LibraryPage({super.key});
  @override
  State<LibraryPage> createState() => _LibraryState();
}

class _LibraryState extends State<LibraryPage> {
  Future<dynamic>? bookmarks;
  @override
  void initState() {
    super.initState();
    member.addListener(changed);
    changed();
  }

  void changed() {
    if (mounted) {
      setState(() {
        bookmarks = member.session == null
            ? null
            : api.request('/api/v1/me/bookmarks', member: true);
      });
    }
  }

  @override
  void dispose() {
    member.removeListener(changed);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => ListView(
    padding: const EdgeInsets.all(20),
    children: [
      Text('Your Library', style: Theme.of(context).textTheme.headlineLarge),
      const SizedBox(height: 16),
      TextButton(
        onPressed: () => showLicensePage(
          context: context,
          applicationName: 'The Aggregator',
          applicationVersion: 'Local demo 1.0.0',
        ),
        child: const Text('Software and font notices'),
      ),
      if (member.error != null) Text(member.error!),
      if (member.session == null) ...[
        if (member.error != null)
          TextButton(
            onPressed: member.logout,
            child: const Text('Clear local sign-in again'),
          ),
        const Text(
          'Use Google to keep stories and interests across the web and this app. Google sign-in does not grant editorial or staff access.',
        ),
        const SizedBox(height: 12),
        FilledButton.icon(
          onPressed: member.signingIn ? null : member.signIn,
          icon: const Icon(Icons.login),
          label: const Text('Continue with Google'),
        ),
        TextButton(
          onPressed: () => context.push('/sign-in/code'),
          child: const Text('Local captured-mail code (example.test only)'),
        ),
      ] else ...[
        Text('Signed in as ${member.session!['user']['displayName']}'),
        OutlinedButton(
          onPressed: () => context.push('/profile'),
          child: const Text('Profile'),
        ),
        Wrap(
          spacing: 12,
          children: [
            OutlinedButton(
              onPressed: () => context.push('/interests'),
              child: const Text('Your interests'),
            ),
            OutlinedButton(
              onPressed: () => context.push('/preferences'),
              child: const Text('Preferences'),
            ),
            OutlinedButton(
              onPressed: member.logout,
              child: const Text('Sign out'),
            ),
            IconButton(
              tooltip: 'Refresh saved stories',
              onPressed: changed,
              icon: const Icon(Icons.refresh),
            ),
          ],
        ),
        FutureBuilder<dynamic>(
          future: bookmarks,
          builder: (c, s) {
            if (s.hasError) return FailureView(s.error!, changed);
            if (!s.hasData) return const CircularProgressIndicator();
            final rows = s.data as List;
            return Column(
              children: [
                if (rows.isEmpty) const Text('No saved stories yet.'),
                for (final b in rows)
                  ListTile(
                    title: Text(
                      b['article']?['headline'] ??
                          b['headline'] ??
                          'Saved story unavailable',
                    ),
                    subtitle: Text(
                      '${b['createdAt'] ?? ''}\nSaved version: ${b['savedVersionId'] ?? 'unavailable'}',
                    ),
                    onTap: b['article']?['slug'] == null
                        ? null
                        : () =>
                              context.push('/article/${b['article']['slug']}'),
                    trailing: IconButton(
                      tooltip: 'Remove saved story',
                      onPressed: () async {
                        try {
                          await api.request(
                            '/api/v1/me/bookmarks/${b['articleId']}',
                            method: 'DELETE',
                            body: {},
                            member: true,
                          );
                          changed();
                        } catch (e) {
                          if (c.mounted) {
                            ScaffoldMessenger.of(c).showSnackBar(
                              SnackBar(content: Text(e.toString())),
                            );
                          }
                        }
                      },
                      icon: const Icon(Icons.bookmark_remove_outlined),
                    ),
                  ),
              ],
            );
          },
        ),
        const Divider(),
        const AccountQueue(),
      ],
    ],
  );
}

class InterestsPage extends StatefulWidget {
  const InterestsPage({super.key});
  @override
  State<InterestsPage> createState() => _InterestsState();
}

class _InterestsState extends State<InterestsPage> {
  Json? saved;
  List<Json> rules = [];
  String? error, parent;
  final trail = <Json>[];
  late Future<dynamic> catalogue;
  bool busy = false;
  @override
  void initState() {
    super.initState();
    browse();
    unawaited(load());
  }

  void browse() {
    catalogue = api.request(
      '/api/v1/interests/catalogue${parent == null ? '' : '?parent=${Uri.encodeQueryComponent(parent!)}'}',
    );
  }

  Future<void> load() async {
    try {
      final s = await api.request('/api/v1/me/interests', member: true);
      if (mounted) {
        setState(() {
          saved = s;
          rules = (s['rules'] as List)
              .map((e) => Map<String, dynamic>.from(e))
              .toList();
        });
      }
    } catch (e) {
      if (mounted) setState(() => error = e.toString());
    }
  }

  Future<void> save(String status) async {
    if (saved == null) return;
    setState(() => busy = true);
    try {
      final s = await api.request(
        '/api/v1/me/interests',
        method: 'PUT',
        member: true,
        body: {
          'revision': saved!['revision'],
          'rules': rules,
          'hiddenStories': saved!['hiddenStories'],
          'status': status,
        },
      );
      if (mounted) {
        setState(() {
          saved = s;
          error = null;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(
          () => error =
              '$e Your unsaved selections remain. Reload only when ready to discard them.',
        );
      }
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => ListView(
    padding: const EdgeInsets.all(20),
    children: [
      Text('Your interests', style: Theme.of(context).textTheme.headlineLarge),
      const Text(
        'Explore a category to navigate. Select a tile to follow it; opening it never follows it.',
      ),
      if (error != null) Text(error!),
      Wrap(
        children: [
          TextButton(
            onPressed: () => setState(() {
              trail.clear();
              parent = null;
              browse();
            }),
            child: const Text('All categories'),
          ),
          for (final node in trail)
            TextButton(
              onPressed: () => setState(() {
                parent = node['id'];
                trail.removeRange(trail.indexOf(node) + 1, trail.length);
                browse();
              }),
              child: Text(node['label']),
            ),
        ],
      ),
      FutureBuilder<dynamic>(
        future: catalogue,
        builder: (c, s) {
          if (s.hasError) return FailureView(s.error!, () => setState(browse));
          if (s.connectionState != ConnectionState.done ||
              !s.hasData ||
              saved == null) {
            return const Center(child: CircularProgressIndicator());
          }
          final rows = s.data is List
              ? s.data as List
              : (s.data['children'] ?? s.data['items'] ?? []) as List;
          return Column(
            children: [
              for (final node in rows)
                Card(
                  color:
                      rules.any(
                        (r) =>
                            r['target'] == node['id'] &&
                            r['action'] == 'follow',
                      )
                      ? Theme.of(c).colorScheme.primaryContainer
                      : null,
                  child: Column(
                    children: [
                      CheckboxListTile(
                        title: Text(node['label']),
                        subtitle: Text(
                          '${node['kind'] ?? 'topic'} • ${(node['descendantIds'] as List? ?? []).length} subtopics\n${(node['coveredBy'] as List? ?? []).where((id) => rules.any((r) => r['target'] == id && r['action'] == 'follow')).isNotEmpty ? 'Included by a broader follow. Mutes still exclude it.' : 'Explicit selection; coverage remains limited to eligible stories.'}',
                        ),
                        value: rules.any(
                          (r) =>
                              r['target'] == node['id'] &&
                              r['action'] == 'follow',
                        ),
                        onChanged: busy
                            ? null
                            : (v) => setState(() {
                                rules.removeWhere(
                                  (r) => r['target'] == node['id'],
                                );
                                if (v == true) {
                                  rules.add({
                                    'target': node['id'],
                                    'action': 'follow',
                                  });
                                }
                              }),
                      ),
                      Wrap(
                        children: [
                          if (node['hasChildren'] == true)
                            TextButton.icon(
                              onPressed: () => setState(() {
                                parent = node['id'];
                                trail.add(Map<String, dynamic>.from(node));
                                browse();
                              }),
                              icon: const Icon(Icons.chevron_right),
                              label: const Text('Explore'),
                            ),
                          TextButton(
                            onPressed: busy
                                ? null
                                : () => setState(() {
                                    final wasMuted = rules.any(
                                      (r) =>
                                          r['target'] == node['id'] &&
                                          r['action'] == 'mute',
                                    );
                                    rules.removeWhere(
                                      (r) => r['target'] == node['id'],
                                    );
                                    if (!wasMuted) {
                                      rules.add({
                                        'target': node['id'],
                                        'action': 'mute',
                                      });
                                    }
                                  }),
                            child: Text(
                              rules.any(
                                    (r) =>
                                        r['target'] == node['id'] &&
                                        r['action'] == 'mute',
                                  )
                                  ? 'Muted'
                                  : 'Mute',
                            ),
                          ),
                        ],
                      ),
                      if (node['kind'] == 'team' &&
                          (node['competitions'] as List).isNotEmpty)
                        DropdownButtonFormField<String>(
                          icon: const Icon(Icons.expand_more),
                          initialValue:
                              rules
                                  .where((r) => r['target'] == node['id'])
                                  .firstOrNull?['competition'] ??
                              '',
                          isExpanded: true,
                          decoration: const InputDecoration(
                            labelText: 'Team scope',
                          ),
                          items: [
                            const DropdownMenuItem(
                              value: '',
                              child: Text('Across competitions'),
                            ),
                            for (final league in node['competitions'])
                              DropdownMenuItem(
                                value: league['value'],
                                child: Text(league['label']),
                              ),
                          ],
                          onChanged:
                              busy ||
                                  !rules.any(
                                    (r) =>
                                        r['target'] == node['id'] &&
                                        r['action'] == 'follow',
                                  )
                              ? null
                              : (value) => setState(() {
                                  final rule = rules.firstWhere(
                                    (r) => r['target'] == node['id'],
                                  );
                                  rule.remove('competition');
                                  if (value!.isNotEmpty) {
                                    rule['competition'] = value;
                                  }
                                }),
                        ),
                    ],
                  ),
                ),
            ],
          );
        },
      ),
      const Divider(),
      Text('${rules.length} explicit choices'),
      Wrap(
        spacing: 8,
        children: [
          FilledButton(
            onPressed: busy || saved == null ? null : () => save('completed'),
            child: const Text('Save interests'),
          ),
          OutlinedButton(
            onPressed: busy ? null : load,
            child: const Text('Discard draft and reload'),
          ),
          TextButton(
            onPressed: busy || saved == null ? null : () => save('skipped'),
            child: const Text('Skip'),
          ),
        ],
      ),
    ],
  );
}
