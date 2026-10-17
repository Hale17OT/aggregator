import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'data.dart';
import 'main.dart';

class ProfilePage extends StatefulWidget {
  const ProfilePage({super.key});
  @override
  State<ProfilePage> createState() => _ProfileState();
}

class _ProfileState extends State<ProfilePage> {
  final name = TextEditingController();
  Json? profile;
  String? error;
  bool busy = false;
  @override
  void initState() {
    super.initState();
    if (member.session != null) load();
  }

  @override
  void dispose() {
    name.dispose();
    super.dispose();
  }

  Future<void> load() async {
    final epoch = member.authEpoch;
    try {
      final result = await api.request('/api/v1/me/profile', member: true);
      if (!mounted || epoch != member.authEpoch) return;
      setState(() {
        profile = result;
        name.text = result['displayName'];
      });
    } catch (_) {
      if (mounted) {
        setState(
          () => error = 'Profile unavailable. Your saved values are unchanged.',
        );
      }
    }
  }

  Future<void> save() async {
    if (busy || profile == null) return;
    final epoch = member.authEpoch;
    setState(() {
      busy = true;
      error = null;
    });
    try {
      final result = await api.request(
        '/api/v1/me/profile',
        method: 'PATCH',
        member: true,
        body: {'revision': profile!['revision'], 'displayName': name.text},
      );
      if (!mounted || epoch != member.authEpoch) return;
      setState(() => profile = result);
    } catch (_) {
      if (mounted && epoch == member.authEpoch) {
        setState(
          () => error =
              'Could not save, or another client saved first. Your draft name is retained.',
        );
      }
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  Future<void> privacy(String action) async {
    if (busy) return;
    final epoch = member.authEpoch;
    if (action == 'delete-account') {
      final input = TextEditingController();
      final agreed = await showDialog<bool>(
        context: context,
        builder: (dialog) => AlertDialog(
          title: const Text('Delete Aggregator account'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'Removes your sign-in links, preferences, interests, saves, queue and history and invalidates sessions. Your Google account is not deleted. A pseudonymous provider/subject security tombstone and existing private backups remain; backup cleanup is an outstanding operator task.',
                ),
                TextField(
                  controller: input,
                  decoration: const InputDecoration(
                    labelText: 'Type DELETE MY AGGREGATOR ACCOUNT',
                  ),
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialog, false),
              child: const Text('Cancel'),
            ),
            TextButton(
              onPressed: () {
                if (input.text == 'DELETE MY AGGREGATOR ACCOUNT') {
                  Navigator.pop(dialog, true);
                }
              },
              child: const Text('Delete account'),
            ),
          ],
        ),
      );
      input.dispose();
      if (agreed != true || !mounted || epoch != member.authEpoch) return;
    }
    setState(() => busy = true);
    try {
      if (action == 'export') {
        final data = await api.request('/api/v1/me/export', member: true);
        if (!mounted || epoch != member.authEpoch) return;
        await showDialog<void>(
          context: context,
          builder: (dialog) => AlertDialog(
            title: const Text('Your private data export'),
            content: SingleChildScrollView(
              child: SelectableText(
                const JsonEncoder.withIndent('  ').convert(data),
              ),
            ),
            actions: [
              TextButton(
                onPressed: () => Navigator.pop(dialog),
                child: const Text('Close'),
              ),
            ],
          ),
        );
      } else if (action == 'clear-history') {
        await listeningSync.clear();
      } else {
        await api.request(
          '/api/v1/me/account-action',
          method: 'POST',
          member: true,
          body: {
            'action': action,
            'confirmation': action == 'delete-account'
                ? 'DELETE MY AGGREGATOR ACCOUNT'
                : 'REVOKE OTHER SESSIONS',
          },
        );
        if (epoch != member.authEpoch) return;
        if (action == 'delete-account') {
          await member.logout();
        } else {
          await load();
        }
      }
    } catch (_) {
      if (mounted && epoch == member.authEpoch) {
        setState(
          () => error =
              'Action unavailable. Sensitive changes require sign-in within 15 minutes. Your draft is retained.',
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
      Text('Your Profile', style: Theme.of(context).textTheme.headlineLarge),
      if (error != null) Text(error!, semanticsLabel: error),
      if (member.session == null) ...[
        const Text('Sign in to synchronize your interests and preferences.'),
        FilledButton(
          onPressed: member.signingIn ? null : member.signIn,
          child: const Text('Continue with Google'),
        ),
        TextButton(
          onPressed: () => context.push('/sign-in/code'),
          child: const Text('Local captured-mail code'),
        ),
        TextButton(
          onPressed: member.toggleTheme,
          child: const Text('Change guest device appearance'),
        ),
      ],
      if (member.session != null && profile == null && error == null)
        const LinearProgressIndicator(),
      if (profile != null) ...[
        Align(
          alignment: Alignment.centerLeft,
          child: CircleAvatar(
            child: Text(
              (profile!['displayName'] as String).trim().isEmpty
                  ? 'R'
                  : (profile!['displayName'] as String)
                        .trim()
                        .characters
                        .first
                        .toUpperCase(),
            ),
          ),
        ),
        const SizedBox(height: 12),
        TextField(
          controller: name,
          maxLength: 80,
          decoration: const InputDecoration(labelText: 'Display name'),
        ),
        FilledButton(
          onPressed: busy ? null : save,
          child: Text(busy ? 'Saving…' : 'Save account details'),
        ),
        const SizedBox(height: 24),
        Text(
          'Connected sign-in methods',
          style: Theme.of(context).textTheme.titleLarge,
        ),
        for (final p in profile!['providers'])
          ListTile(
            title: const Text('Google'),
            subtitle: Text(p['email'] ?? 'Email not supplied'),
          ),
        if (profile!['emailMethod'] != null)
          ListTile(
            title: Text(profile!['emailMethod']['email']),
            subtitle: const Text('Local captured-mail assurance only'),
          ),
        const Text(
          'Local captured-mail ownership cannot link a real Google account.',
        ),
        ListTile(
          title: const Text('Your interests'),
          trailing: const Icon(Icons.chevron_right),
          onTap: () => context.push('/interests'),
        ),
        ListTile(
          title: const Text('Reading, media and privacy preferences'),
          trailing: const Icon(Icons.chevron_right),
          onTap: () => context.push('/preferences'),
        ),
        Text('Active sessions', style: Theme.of(context).textTheme.titleLarge),
        for (final s in profile!['sessions'])
          ListTile(
            title: Text('${s['transport']} · ${s['method']}'),
            subtitle: Text('Last active ${s['lastActiveAt']}'),
          ),
        OutlinedButton(
          onPressed: member.logout,
          child: const Text('Sign out of this session'),
        ),
        Text('Privacy and data', style: Theme.of(context).textTheme.titleLarge),
        const Text(
          'Private to your account. Sensitive actions require a recent sign-in. These controls do not remove your Google account.',
        ),
        for (final entry in {
          'revoke-other': 'Revoke other Aggregator sessions',
          'clear-history': 'Clear listening history',
          'export': 'Read my data export',
          'delete-account': 'Delete Aggregator account',
        }.entries)
          OutlinedButton(
            onPressed: busy ? null : () => privacy(entry.key),
            child: Text(entry.value),
          ),
      ],
    ],
  );
}
