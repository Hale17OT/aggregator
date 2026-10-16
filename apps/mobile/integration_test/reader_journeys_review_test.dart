// Review-authored connected tests: real app, loopback API and complete catalogue.
// No server mocks, fixture replacement, account reset or external source launch.
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:video_player/video_player.dart';
import 'package:aggregator_mobile/main.dart' as app;
import 'package:aggregator_mobile/reader.dart';
import 'package:aggregator_mobile/players.dart';
import 'package:aggregator_mobile/data.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  var started = false;
  Future<void> until(
    WidgetTester t,
    bool Function() ready,
    String label,
  ) async {
    for (var i = 0; i < 150; i++) {
      await t.pump(const Duration(milliseconds: 100));
      if (ready()) return;
    }
    debugPrint(
      'Reader timeout visible text: ${t.widgetList<Text>(find.byType(Text)).map((w) => w.data).toList()}',
    );
    fail('Timed out: $label');
  }

  Future<void> start(WidgetTester t) async {
    if (!started) {
      await app.main();
      started = true;
    } else {
      await t.pumpWidget(const app.AggregatorApp());
    }
    if (app.member.session != null) await app.member.logout();
    await app.media.radio.pause();
    app.router.go('/');
    await until(
      t,
      () => find.textContaining('24 matching stories').evaluate().isNotEmpty,
      'complete eligible Home',
    );
    expect((await app.api.request('/api/v1/programmes') as List).length, 23);
  }

  Uri route() => app.router.routeInformationProvider.value.uri;
  Future<void> visibleTap(WidgetTester t, Finder target) async {
    await t.ensureVisible(target);
    await until(
      t,
      () => target.hitTestable().evaluate().isNotEmpty,
      'uncovered tappable control',
    );
    await t.tap(target.hitTestable());
    await t.pump(const Duration(milliseconds: 100));
  }

  void bibliographyMatches(WidgetTester t, Json expected) {
    final actual = t
        .widgetList<SourceTile>(find.byType(SourceTile))
        .map((s) => s.source)
        .toList();
    final wanted = (expected['sources'] as List).cast<Json>();
    expect(
      actual.map((s) => [s['id'], s['ordinal'], s['url']]).toList(),
      wanted.map((s) => [s['id'], s['ordinal'], s['url']]).toList(),
    );
    expect(find.byType(SelectionArea), findsWidgets);
    for (final source in actual) {
      expect(Uri.parse(source['url']).scheme, 'https');
      final tile = find.byWidgetPredicate(
        (w) => w is SourceTile && w.source['id'] == source['id'],
      );
      final button = t.widget<ListTile>(
        find.descendant(of: tile, matching: find.byType(ListTile)),
      );
      expect(
        button.onTap,
        isNotNull,
        reason: 'Original source remains an actionable affordance',
      );
    }
  }

  testWidgets(
    'J01 J02 real scoped discovery, article variants and Back context',
    (t) async {
      await start(t);
      await until(
        t,
        () =>
            find.byType(DropdownButtonFormField<String>).evaluate().isNotEmpty,
        'live topic metadata',
      );
      await visibleTap(t, find.byType(DropdownButtonFormField<String>).first);
      await until(
        t,
        () => find.text('Climate').evaluate().isNotEmpty,
        'Climate option',
      );
      await t.tap(find.text('Climate').last);
      await t.pump(const Duration(milliseconds: 500));
      await until(
        t,
        () => route().queryParameters['topic'] == 'climate',
        'category URL',
      );
      await until(
        t,
        () => find.byType(TextField).evaluate().isNotEmpty,
        'category Home search field after navigation',
      );
      await t.enterText(find.byType(TextField).first, 'rain');
      await visibleTap(t, find.byTooltip('Search articles'));
      await until(
        t,
        () => route().queryParameters['q'] == 'rain',
        'search URL',
      );
      expect(route().queryParameters['topic'], 'climate');
      final expected =
          await app.api.request('/api/v1/edition?topic=climate&q=rain') as Json;
      final total = expected['meta']['total'];
      await until(
        t,
        () => find
            .textContaining('$total matching stories')
            .evaluate()
            .isNotEmpty,
        'intersection response',
      );
      final expectedTitles = (expected['data'] as List)
          .map((r) => r['article']['headline'])
          .toList();
      await until(
        t,
        () => find.byType(StoryTile).evaluate().length == expectedTitles.length,
        'outgoing spread removed after filtered response',
      );
      final actualTitles = t
          .widgetList<StoryTile>(find.byType(StoryTile))
          .map((w) => w.article.title)
          .toList();
      expect(actualTitles, expectedTitles);
      expect(
        expectedTitles,
        isNotEmpty,
        reason: 'Fixture query must exercise a real story',
      );
      final scopedUri = route().toString();
      final slug = expected['data'][0]['article']['slug'] as String;
      final standard =
          await app.api.request('/api/v1/articles/$slug?variant=standard')
              as Json;
      final brief =
          await app.api.request('/api/v1/articles/$slug?variant=brief') as Json;
      await visibleTap(t, find.text('Read with sources').first);
      await until(
        t,
        () => find.text('Read brief').evaluate().isNotEmpty,
        'standard article',
      );
      expect(t.widget<ArticlePage>(find.byType(ArticlePage)).slug, slug);
      await until(
        t,
        () => find.text(standard['blocks'][0]['text']).evaluate().isNotEmpty,
        'standard body from API',
      );
      bibliographyMatches(t, standard);
      await visibleTap(t, find.text('Read brief'));
      await until(
        t,
        () =>
            t.widgetList<SourceTile>(find.byType(SourceTile)).length ==
                (brief['sources'] as List).length &&
            find.text('Read standard').evaluate().isNotEmpty,
        'brief article',
      );
      // Wait for exact response content, not merely the toggle's optimistic label.
      final briefText = brief['blocks'][0]['text'] as String;
      await until(
        t,
        () => find.text(briefText).evaluate().isNotEmpty,
        'brief body from API',
      );
      bibliographyMatches(t, brief);
      await visibleTap(t, find.text('Sources ↓'));
      await until(
        t,
        () => find.text('Sources').hitTestable().evaluate().isNotEmpty,
        'bibliography jump',
      );
      await visibleTap(t, find.text('Read standard'));
      await until(
        t,
        () => find.text(standard['blocks'][0]['text']).evaluate().isNotEmpty,
        'standard body restored',
      );
      bibliographyMatches(t, standard);
      app.router.pop();
      await t.pump(const Duration(milliseconds: 300));
      expect(
        route().toString(),
        scopedUri,
        reason: 'Article Back preserves category/query context',
      );
      expect(app.member.session, isNull);
    },
  );

  testWidgets(
    'Missing requested programme never silently substitutes a recording',
    (t) async {
      await start(t);
      for (final path in ['/newsroom', '/clips']) {
        app.router.go('$path?programme=missing-review-recording');
        await until(
          t,
          () => find
              .textContaining('requested recording is unavailable')
              .evaluate()
              .isNotEmpty,
          '$path honest unavailable state',
        );
        expect(find.byType(VideoPlayer), findsNothing);
        expect(app.media.radio.player.playing, isFalse);
        expect(
          route().queryParameters['programme'],
          'missing-review-recording',
        );
      }
    },
  );

  testWidgets(
    'J15 200 percent text and reduced motion across actual primary routes',
    (t) async {
      await start(t);
      final oldScale = app.member.readingScale,
          oldMotion = app.member.reduceMotion;
      try {
        // Local presentation settings only; no member preference writes.
        app.member.readingScale = 2;
        app.member.reduceMotion = true;
        app.member.applyTheme('light');
        for (final path in ['/', '/radio', '/newsroom', '/clips', '/library']) {
          app.router.go(path);
          await until(
            t,
            () => find.byType(CircularProgressIndicator).evaluate().isEmpty,
            '$path settled actual data',
          );
          await t.pump(const Duration(milliseconds: 800));
          expect(
            t.takeException(),
            isNull,
            reason: '$path must not overflow at200percent',
          );
          for (final label in [
            'Home',
            'Radio',
            'Newsroom',
            'Clips',
            'Library',
          ]) {
            expect(
              find.text(label).hitTestable(),
              findsOneWidget,
              reason: 'Primary $label remains reachable on $path',
            );
          }
          final context = t.element(find.byType(app.ReaderShell));
          expect(MediaQuery.disableAnimationsOf(context), isTrue);
          expect(MediaQuery.textScalerOf(context).scale(10), 20);
          if (path == '/clips') {
            await until(
              t,
              () => find.byType(VideoPlayer).evaluate().isNotEmpty,
              'large text Clip picture',
            );
            final first = t
                .widget<ProgrammeVideo>(find.byType(ProgrammeVideo))
                .programme
                .id;
            await t.ensureVisible(find.byType(VideoPlayer));
            await t.fling(find.byType(VideoPlayer), const Offset(0, -90), 800);
            await until(
              t,
              () =>
                  find.byType(ProgrammeVideo).evaluate().isNotEmpty &&
                  t
                          .widget<ProgrammeVideo>(find.byType(ProgrammeVideo))
                          .programme
                          .id !=
                      first,
              'reduced-motion picture swipe uses direct page jump',
            );
            expect(t.takeException(), isNull);
          }
        }
      } finally {
        app.member.readingScale = oldScale;
        app.member.reduceMotion = oldMotion;
        app.member.applyTheme('system');
        app.router.go('/');
        await app.media.radio.pause();
      }
    },
  );
}
