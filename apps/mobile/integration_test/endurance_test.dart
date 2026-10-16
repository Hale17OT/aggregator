import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:aggregator_mobile/main.dart' as app;
import 'package:aggregator_mobile/data.dart';
import 'package:video_player/video_player.dart';
import 'guest_journeys_test.dart' as guest;

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  guest.main();
  testWidgets(
    'Twenty route and twenty Clip transitions, then uninterrupted full recordings',
    (t) async {
      await t.pumpWidget(const app.AggregatorApp());
      Future<void> wait(
        bool Function() ready,
        String label, {
        int seconds = 20,
      }) async {
        final elapsed = Stopwatch()..start();
        while (elapsed.elapsed.inSeconds < seconds) {
          await t.pump(const Duration(milliseconds: 100));
          if (ready()) return;
        }
        fail('Timed out: $label');
      }

      final rows = (await app.api.request('/api/v1/programmes') as List)
          .map((v) => Programme(v))
          .toList();
      Future<void> open(Programme p) async {
        app.router.go(
          Uri(
            path: p.kind == 'clip' ? '/clips' : '/newsroom',
            queryParameters: {'programme': p.id},
          ).toString(),
        );
        final play = find
            .descendant(
              of: find.byKey(ValueKey(p.id)),
              matching: find.byTooltip('Play video'),
            )
            .hitTestable();
        await wait(
          () =>
              play.evaluate().isNotEmpty &&
              find.byType(VideoPlayer).evaluate().isNotEmpty,
          p.id,
        );
        await t.tap(play.first);
        await wait(
          () => app.media.video?.value.isPlaying == true,
          '${p.id} play',
        );
        expect(app.media.radio.player.playing, isFalse);
      }

      final clips = rows.where((p) => p.kind == 'clip').toList();
      for (var i = 0; i < 20; i++) {
        await open(clips[i % clips.length]);
        app.router.go(i.isEven ? '/library' : '/');
        await wait(() => app.media.video == null, 'route disposal $i');
        expect(t.takeException(), isNull);
      }
      for (var i = 0; i < 20; i++) {
        await open(clips[i % clips.length]);
        await app.media.video!.pause();
        expect(t.takeException(), isNull);
      }
      app.router.go('/radio');
      await wait(() => app.media.video == null, 'final Clip disposal');
      final radio =
          (rows.where((p) => p.kind == 'radio').toList()
                ..sort((a, b) => b.duration.compareTo(a.duration)))
              .first;
      await app.media.loadRadio(radio, play: true);
      await wait(() => app.media.radio.player.playing, 'longest Radio start');
      final began = DateTime.now();
      debugPrint(
        'ENDURANCE Radio start ${radio.id} duration=${radio.duration.inMilliseconds}',
      );
      await wait(
        () =>
            app.media.radio.player.position >=
            app.media.radio.player.duration! -
                const Duration(milliseconds: 300),
        'longest Radio completion',
        seconds: radio.duration.inSeconds + 45,
      );
      expect(
        DateTime.now().difference(began).inSeconds,
        greaterThan(radio.duration.inSeconds - 3),
      );
      await app.media.radio.pause();
      for (final variant in ['solo', 'duo']) {
        final p = rows.firstWhere(
          (p) => p.kind == 'broadcast' && p.raw['variant'] == variant,
        );
        app.media.videoPositions.remove(p.video!['renditionKey']);
        await open(p);
        final controller = app.media.video!;
        final began = DateTime.now();
        debugPrint(
          'ENDURANCE video start ${p.id} duration=${controller.value.duration.inMilliseconds}',
        );
        await wait(
          () => controller.value.isCompleted,
          '$variant full completion',
          seconds: controller.value.duration.inSeconds + 45,
        );
        expect(
          DateTime.now().difference(began).inSeconds,
          greaterThan(controller.value.duration.inSeconds - 3),
        );
        expect(controller.value.hasError, isFalse);
        expect(t.takeException(), isNull);
      }
      app.router.go('/');
      await wait(() => app.media.video == null, 'endurance cleanup');
    },
    timeout: const Timeout(Duration(minutes: 20)),
  );
}
