import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:aggregator_mobile/main.dart' as app;
import 'package:aggregator_mobile/data.dart';
import 'package:aggregator_mobile/players.dart';
import 'package:video_player/video_player.dart';

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  Future<void> until(
    WidgetTester t,
    bool Function() ready,
    String label,
  ) async {
    for (var n = 0; n < 150; n++) {
      await t.pump(const Duration(milliseconds: 100));
      if (ready()) return;
    }
    fail('Timed out: $label');
  }

  testWidgets(
    'Real guest API, attribution, hardware and exclusive native media',
    (t) async {
      await app.main();
      // This project-owned emulator may retain the preceding member-test session.
      // Exercise normal revocation, never clear storage or reset account data.
      if (app.member.session != null) await app.member.logout();
      app.router.go('/');
      await until(
        t,
        () => find.textContaining('24 matching stories').evaluate().isNotEmpty,
        'API edition',
      );
      expect(app.member.session, isNull);
      await t.scrollUntilVisible(
        find.text('Next'),
        600,
        scrollable: find.byType(Scrollable).first,
      );
      await t.tap(find.text('Next'));
      await until(
        t,
        () => find.textContaining('Page 2 of').evaluate().isNotEmpty,
        'Next edition spread',
      );
      final homeScroll = t.state<ScrollableState>(
        find.byType(Scrollable).first,
      );
      expect(
        homeScroll.position.pixels,
        0,
        reason: 'The incoming spread starts in view, not at its footer',
      );
      app.router.go('/');
      await until(
        t,
        () => find.textContaining('Page 1 of').evaluate().isNotEmpty,
        'Original edition restored',
      );
      await t.tap(find.text('Radio'));
      await until(
        t,
        () => find.byType(HardwareDial).evaluate().length == 2,
        'Radio hardware',
      );
      await t.tap(find.byTooltip('Play Radio').first);
      await until(
        t,
        () =>
            app.media.radio.player.playing &&
            app.media.radio.player.duration != null,
        'Actual recording',
      );
      final root = app.media.radio.player;
      await root.setVolume(.5);
      await t.pump(const Duration(milliseconds: 200));
      final face = find.descendant(
        of: find.byType(HardwareDial).first,
        matching: find.byKey(const ValueKey('radio-dial-face')),
      );
      await t.ensureVisible(face);
      final gesture = await t.startGesture(
        t.getCenter(face) + const Offset(24, 0),
      );
      await gesture.moveBy(const Offset(0, -12));
      await t.pump(const Duration(milliseconds: 100));
      await gesture.moveBy(const Offset(-18, -12));
      await t.pump(const Duration(milliseconds: 100));
      // Continue the actual arc after crossing Android's touch-slop threshold.
      await gesture.moveBy(const Offset(-20, 0));
      await t.pump(const Duration(milliseconds: 100));
      await gesture.up();
      await t.pump(const Duration(milliseconds: 200));
      expect(
        root.volume,
        isNot(.5),
        reason: 'Actual visible face changes supported native gain',
      );
      final catalogue = (await app.api.request('/api/v1/programmes') as List)
          .map((v) => Programme(v));
      final other = catalogue.firstWhere(
        (p) => p.kind == 'radio' && p.id != app.media.programme!.id,
      );
      await app.media.loadRadio(other, play: true);
      await until(
        t,
        () => find.text(other.title).evaluate().length >= 2,
        'Cabinet synchronizes with root handoff',
      );
      await root.seek(
        Duration(milliseconds: other.chapters.first['endMs'] - 350),
      );
      app.media.sleep('story');
      await until(t, () => !root.playing, 'Sleep at real story boundary');
      expect(app.media.sleepChoice, 'off');
      await app.media.playRadio();
      app.member.applyPreferences({
        'playbackSpeed': 1.25,
        'anchorCount': 2,
        'mediaTreatment': 'clip_then_comment',
      });
      await until(
        t,
        () => root.speed == 1.25,
        'Preference affects actual Radio speed',
      );
      await t.tap(find.text('Newsroom'));
      await until(
        t,
        () => find.byType(VideoPlayer).evaluate().isNotEmpty,
        'Preferred Newsroom recording',
      );
      final preferred = t.widget<ProgrammeVideo>(find.byType(ProgrammeVideo));
      expect(preferred.programme.raw['variant'], 'duo');
      expect(preferred.programme.raw['mediaTreatment'], 'clip_then_comment');
      expect(
        t
            .widget<VideoPlayer>(find.byType(VideoPlayer))
            .controller
            .value
            .playbackSpeed,
        1.25,
      );
      expect(
        root.playing,
        isTrue,
        reason: 'Paused preferred video does not steal Radio',
      );
      await t.tap(find.text('Home'));
      await t.pump(const Duration(seconds: 1));
      app.member.applyPreferences({});
      await until(t, () => root.speed == 1, 'Default speed restored');
      expect(app.media.radio.player, same(root));
      expect(root.playing, isTrue);
      await t.tap(find.text('Clips'));
      await until(
        t,
        () => find.byType(VideoPlayer).evaluate().isNotEmpty,
        'Portrait video',
      );
      expect(
        root.playing,
        isTrue,
        reason: 'Preparing a paused clip does not steal sound',
      );
      await t.tap(find.byTooltip('Play video').first);
      await until(
        t,
        () => app.media.video?.value.isPlaying == true,
        'Explicit video play',
      );
      expect(root.playing, isFalse);
      final firstClip = t
          .widget<ProgrammeVideo>(find.byType(ProgrammeVideo))
          .programme
          .id;
      await t.fling(find.byType(PageView), const Offset(0, -650), 1200);
      await until(
        t,
        () =>
            find.byType(ProgrammeVideo).evaluate().isNotEmpty &&
            t
                    .widget<ProgrammeVideo>(find.byType(ProgrammeVideo))
                    .programme
                    .id !=
                firstClip,
        'Actual vertical gesture advances finite Clips',
      );
      await until(
        t,
        () => find.byType(VideoPlayer).evaluate().isNotEmpty,
        'Next Clip prepared paused',
      );
      expect(
        t
            .widget<VideoPlayer>(find.byType(VideoPlayer))
            .controller
            .value
            .isPlaying,
        isFalse,
      );
      await t.tap(find.text('Library'));
      await t.pump(const Duration(seconds: 1));
      expect(app.media.video, isNull);
      expect(root.playing, isFalse);
      expect(find.text('Sign in in your browser'), findsOneWidget);
      expect(t.takeException(), isNull);
    },
  );
  testWidgets(
    'Every existing rendition initializes and seeks without catalogue bundling',
    (t) async {
      await t.pumpWidget(const app.AggregatorApp());
      await t.pump(const Duration(milliseconds: 200));
      final rows = (await app.api.request('/api/v1/programmes') as List)
          .map((j) => Programme(j))
          .toList();
      expect(rows.length, 23);
      for (final p in rows) {
        if (p.kind == 'radio') {
          await app.media.loadRadio(p);
          expect(app.media.error.value, isNull, reason: p.id);
          await app.media.radio.seek(const Duration(seconds: 2));
          expect(app.media.radio.player.duration, isNotNull, reason: p.id);
        } else {
          app.router.go(
            Uri(
              path: p.kind == 'clip' ? '/clips' : '/newsroom',
              queryParameters: {'programme': p.id},
            ).toString(),
          );
          await until(
            t,
            () =>
                find.byKey(ValueKey(p.id)).evaluate().isNotEmpty &&
                find.byType(VideoPlayer).evaluate().isNotEmpty,
            p.id,
          );
          final play = find
              .descendant(
                of: find.byKey(ValueKey(p.id)),
                matching: find.byTooltip('Play video'),
              )
              .hitTestable();
          await until(
            t,
            () => play.evaluate().isNotEmpty,
            '${p.id} visible transport',
          );
          await t.tap(play.first);
          await until(
            t,
            () => app.media.video?.value.isPlaying == true,
            '${p.id} playing',
          );
          await app.media.video!.seekTo(const Duration(seconds: 2));
          await app.media.video!.pause();
        }
        expect(t.takeException(), isNull, reason: p.id);
      }
      app.router.go('/');
      await until(
        t,
        () => app.media.video == null,
        'Video disposed after leaving programme route',
      );
      expect(app.media.video, isNull);
      expect(app.media.radio.player.playing, isFalse);
    },
  );
}
