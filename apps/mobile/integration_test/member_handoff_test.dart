import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:aggregator_mobile/main.dart' as app;

// Desktop-browser-assisted device verification. No credential issuer or direct
// session injection: the real browser completes captured mail + explicit approval.
void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  testWidgets(
    'Real approved handoff, native taxonomy and durable owned data',
    (t) async {
      await app.main();
      Future<void> wait(
        bool Function() condition,
        String label, {
        int seconds = 30,
      }) async {
        final clock = Stopwatch()..start();
        while (clock.elapsed.inSeconds < seconds) {
          await t.pump(const Duration(milliseconds: 100));
          if (condition()) return;
        }
        fail(
          'Timed out: $label; visible member error=${app.member.error}; transport=${app.api.lastFailureOperation}#${app.api.lastFailureAttempt}/${app.api.requestSequence}:${app.api.lastFailure?.status}:${app.api.lastFailure?.code}',
        );
      }

      if (app.member.session != null) await app.member.logout();
      app.router.go('/library');
      await wait(
        () => find
            .text('Sign in in your browser')
            .hitTestable()
            .evaluate()
            .isNotEmpty,
        'guest Library',
      );
      await t.tap(find.text('Sign in in your browser'));
      await wait(() => app.member.pending != null, 'real proof-bound start');
      // The non-secret request UUID is already visible in the approval URL.
      // The host helper keeps it private; proof/state/credentials are never logged.
      debugPrint('AGG_NATIVE_PENDING ${app.member.pending}');
      await wait(
        () => app.member.session != null,
        'explicit browser approval and device callback',
        seconds: 180,
      );
      expect(await app.member.storage.read(key: 'native-session'), isNotEmpty);
      await wait(
        () => find.text('Your interests').evaluate().isNotEmpty,
        'new-account native onboarding',
      );
      Future<void> explore(String label) async {
        final tile = find.ancestor(
          of: find.text(label),
          matching: find.byType(Card),
        );
        await wait(() => tile.evaluate().isNotEmpty, label);
        await t.ensureVisible(tile);
        final button = find
            .descendant(of: tile, matching: find.text('Explore'))
            .hitTestable();
        await wait(
          () => button.evaluate().isNotEmpty,
          '$label visible navigation',
        );
        await t.tap(button);
        await t.pump(const Duration(milliseconds: 250));
      }

      await explore('Sports');
      await explore('Football (soccer)');
      await explore('Premier League');
      final team = find.text('Manchester City — men’s first team');
      await wait(() => team.evaluate().isNotEmpty, 'typed team');
      await t.ensureVisible(team);
      await t.tap(
        find.ancestor(of: team, matching: find.byType(CheckboxListTile)),
      );
      await t.ensureVisible(find.text('Save interests'));
      await t.tap(find.text('Save interests'));
      await t.pump(const Duration(seconds: 1));
      final interests = await app.api.request(
        '/api/v1/me/interests',
        member: true,
      );
      expect(interests['status'], 'completed');
      expect(
        (interests['rules'] as List).single['target'],
        'agg:team:manchester-city-men',
      );
      expect((interests['rules'] as List).single['competition'], isNull);
      final articles = await app.api.request('/api/v1/articles') as List;
      app.router.go('/article/${articles.first['slug']}');
      await wait(
        () => find.text('Save').hitTestable().evaluate().isNotEmpty,
        'native attributed article',
      );
      await t.tap(find.text('Save'));
      await wait(
        () => find.text('Saved to your Library').evaluate().isNotEmpty,
        'durable bookmark',
      );
      final bookmarks =
          await app.api.request('/api/v1/me/bookmarks', member: true) as List;
      expect(bookmarks.length, 1);
      expect(bookmarks.first['savedVersionId'], isNotEmpty);
      app.router.go('/preferences');
      await wait(
        () => find.text('Playback speed').evaluate().isNotEmpty,
        'durable media preferences',
      );
      Future<void> chooseSpeed(String value) async {
        await t.ensureVisible(find.text('Playback speed'));
        await t.tap(find.text('Playback speed'));
        await t.pump(const Duration(milliseconds: 250));
        await wait(
          () => find.text(value).hitTestable().evaluate().isNotEmpty,
          'speed option',
        );
        await t.tap(find.text(value).hitTestable().last);
        await t.pump(const Duration(milliseconds: 250));
      }

      await chooseSpeed('1.25');
      await t.ensureVisible(find.text('Save preferences'));
      await t.tap(find.text('Save preferences'));
      await wait(() => app.member.playbackSpeed == 1.25, 'saved speed applied');
      final savedPreferences = await app.api.request(
        '/api/v1/me/preferences',
        member: true,
      );
      expect(savedPreferences['playbackSpeed'], 1.25);
      await chooseSpeed(
        '0.75',
      ); // Unsaved draft deliberately races the web edit.
      expect(t.takeException(), isNull);
      debugPrint('AGG_NATIVE_MEMBER_DONE');
      var webChanged = false;
      for (var i = 0; i < 60 && !webChanged; i++) {
        final current = await app.api.request(
          '/api/v1/me/preferences',
          member: true,
        );
        webChanged = current['lockVersion'] > savedPreferences['lockVersion'];
        await t.pump(const Duration(milliseconds: 250));
      }
      expect(webChanged, isTrue);
      await t.ensureVisible(find.text('Save preferences'));
      await t.tap(find.text('Save preferences'));
      await wait(
        () => find.textContaining('Draft kept.').evaluate().isNotEmpty,
        'real optimistic conflict preserves draft',
      );
      await t.ensureVisible(find.text('Discard draft and reload'));
      await t.tap(find.text('Discard draft and reload'));
      await wait(
        () => app.member.playbackSpeed == 1,
        'web value refetched and applied',
      );
      final removed =
          await app.api.request('/api/v1/me/bookmarks', member: true) as List;
      expect(
        removed,
        isEmpty,
        reason: 'Same web account removal reaches native',
      );
      app.router.go('/clips');
      await wait(
        () => find.text('Save').hitTestable().evaluate().isNotEmpty,
        'native Clip Save action',
      );
      await t.pump(const Duration(seconds: 1));
      await t.tap(find.text('Save'));
      await wait(
        () => find.text('Saved').hitTestable().evaluate().isNotEmpty,
        'Clip bookmark persisted',
      );
      final clipSaved =
          await app.api.request('/api/v1/me/bookmarks', member: true) as List;
      expect(clipSaved.length, 1);
      expect(clipSaved.single['savedVersionId'], isNotEmpty);
      await t.tap(find.text('Saved'));
      await wait(
        () => find.text('Save').hitTestable().evaluate().isNotEmpty,
        'Clip bookmark removed',
      );
      expect(
        await app.api.request('/api/v1/me/bookmarks', member: true),
        isEmpty,
      );
      app.router.go('/library');
      await wait(
        () => find.text('Sign out').evaluate().isNotEmpty,
        'member Library',
      );
      expect(t.takeException(), isNull);
      debugPrint('AGG_NATIVE_REFETCH_DONE');
      await t.tap(find.text('Sign out'));
      await wait(
        () => find.text('Sign in in your browser').evaluate().isNotEmpty,
        'owned test account signs out normally',
      );
      expect(app.api.credential, isNull);
    },
    timeout: const Timeout(Duration(minutes: 5)),
  );
}
