import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:aggregator_mobile/main.dart' as app;
import 'package:aggregator_mobile/shortform.dart';
import 'package:aggregator_mobile/reader.dart';
import 'package:video_player/video_player.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  Future<void> until(
    WidgetTester t,
    bool Function() ready,
    String label,
  ) async {
    for (var i = 0; i < 200; i++) {
      await t.pump(const Duration(milliseconds: 100));
      if (ready()) return;
    }
    fail('Timed out: $label');
  }

  VideoPlayerController player(WidgetTester t) =>
      t.widget<VideoPlayer>(find.byType(VideoPlayer).first).controller;
  testWidgets(
    'Real shortform tap swipe scrub sources story and owner continuity',
    (t) async {
      await app.main();
      app.router.go('/radio');
      await until(
        t,
        () => find.byTooltip('Play Radio').evaluate().isNotEmpty,
        'Radio',
      );
      await t.tap(find.byTooltip('Play Radio').first);
      await until(t, () => app.media.radio.player.playing, 'Radio playing');
      await t.tap(find.text('Clips').last);
      await until(
        t,
        () => find.byType(VideoPlayer).evaluate().isNotEmpty,
        'Clip prepared',
      );
      expect(app.media.radio.player.playing, isTrue);
      final firstStart = player(t).value.position.inMilliseconds;
      await t.tap(find.byTooltip('Play video').first);
      await until(
        t,
        () =>
            player(t).value.isPlaying &&
            player(t).value.position.inMilliseconds > firstStart + 700,
        'Clip advances',
      );
      expect(app.media.radio.player.playing, isFalse);
      final picture = find.byType(VideoPlayer);
      final rect = t.getRect(picture);
      await t.tapAt(rect.topLeft + Offset(rect.width * .25, rect.height * .3));
      await until(t, () => !player(t).value.isPlaying, 'picture tap pauses');
      expect(player(t).value.isPlaying, isFalse);
      final first = t
          .widget<ClipSurface>(find.byType(ClipSurface))
          .programme
          .id;
      await t.dragFrom(
        rect.topLeft + Offset(rect.width * .25, rect.height * .6),
        const Offset(0, -180),
      );
      await until(
        t,
        () =>
            find.byType(ClipSurface).evaluate().isNotEmpty &&
            t.widget<ClipSurface>(find.byType(ClipSurface)).programme.id !=
                first &&
            find.byType(VideoPlayer).evaluate().isNotEmpty,
        'Swipe advances',
      );
      expect(player(t).value.isPlaying, isFalse);
      final second = t
          .widget<ClipSurface>(find.byType(ClipSurface))
          .programme
          .id;
      final secondStart = player(t).value.position.inMilliseconds;
      await t.tap(find.byTooltip('Play video').first);
      await until(
        t,
        () =>
            player(t).value.isPlaying &&
            player(t).value.position.inMilliseconds > secondStart + 600,
        'Second advances',
      );
      await t.drag(find.byType(Slider), const Offset(110, 0));
      await until(
        t,
        () => player(t).value.position.inSeconds > 5,
        'Committed scrub',
      );
      final controller = player(t), position = controller.value.position;
      await t.tap(find.text('Sources'));
      await until(
        t,
        () => find.text('Original sources').hitTestable().evaluate().isNotEmpty,
        'Sources sheet visible',
      );
      expect(controller.value.isPlaying, isFalse);
      Navigator.of(t.element(find.byType(ClipSurface))).pop();
      await until(
        t,
        () => find.text('Original sources').evaluate().isEmpty,
        'Sources closed',
      );
      expect(player(t), same(controller));
      expect(
        (controller.value.position - position).inSeconds.abs(),
        lessThan(2),
      );
      await t.tap(find.textContaining('Read story').first);
      await until(
        t,
        () => find.byType(ArticlePage).evaluate().isNotEmpty,
        'actual article route',
      );
      app.router.pop();
      await until(
        t,
        () =>
            find.byType(ArticlePage).evaluate().isEmpty &&
            find.text('More').hitTestable().evaluate().isNotEmpty,
        'article Back finishes',
      );
      expect(player(t).value.isPlaying, isFalse);
      await t.tap(find.text('More'));
      await until(
        t,
        () => find.text('Playback speed').evaluate().isNotEmpty,
        'More opens after pause',
      );
      expect(find.text('Playback speed'), findsOneWidget);
      Navigator.of(t.element(find.byType(ClipSurface))).pop();
      await until(
        t,
        () => find.text('Playback speed').evaluate().isEmpty,
        'More closed',
      );
      expect(player(t).value.isPlaying, isFalse);
      for (var i = 0; i < 20; i++) {
        final oldController = player(t);
        await t.tap(find.byTooltip(i.isEven ? 'Previous clip' : 'Next clip'));
        await until(
          t,
          () =>
              find.byType(VideoPlayer).evaluate().isNotEmpty &&
              player(t) != oldController,
          'Settled transition',
        );
        expect(find.byType(VideoPlayer), findsOneWidget);
        expect(
          t.widget<ClipSurface>(find.byType(ClipSurface)).programme.id,
          i.isEven ? first : second,
        );
        expect(player(t).value.isPlaying, isFalse);
      }
      app.router.go('/');
      await t.pump(const Duration(seconds: 1));
      expect(app.media.radio.player.playing, isFalse);
      expect(t.takeException(), isNull);
    },
  );
}
