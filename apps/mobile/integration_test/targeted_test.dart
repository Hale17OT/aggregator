import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:integration_test/integration_test.dart';
import 'package:video_player/video_player.dart';
import 'package:aggregator_mobile/main.dart' as app;
import 'package:aggregator_mobile/data.dart';
import 'package:aggregator_mobile/shortform.dart';
import 'package:aggregator_mobile/video_load_trace.dart';

// Private test adapter: actual protected requests/content, delayed completion only.
class DelayedCaptions extends Api {
  final Api actual;
  Completer<void>? gate;
  bool failNext = false;
  int calls = 0;
  DelayedCaptions(this.actual);
  @override
  Uri asset(String path) => actual.asset(path);
  @override
  Future<dynamic> request(
    String path, {
    String method = 'GET',
    Json? body,
    bool member = false,
  }) async {
    try {
      return await actual.request(
        path,
        method: method,
        body: body,
        member: member,
      );
    } on ApiFailure catch (e) {
      debugPrint('TARGETED_REQUEST_FAILURE ${e.status} ${e.code}');
      rethrow;
    }
  }

  @override
  Future<String> captions(
    String path, {
    CaptionCancellation? cancellation,
  }) async {
    calls++;
    final wait = gate;
    gate = null;
    final fail = failNext;
    failNext = false;
    final text = await actual.captions(path, cancellation: cancellation);
    await wait?.future;
    if (fail) throw const FormatException('Injected private caption failure');
    return text;
  }
}

void main() {
  IntegrationTestWidgetsFlutterBinding.ensureInitialized();
  testWidgets('Real six clips delayed A B A Retry and twenty route exits', (
    t,
  ) async {
    await app.main();
    final original = app.api, controlled = DelayedCaptions(app.api);
    controlled.generation = original.generation;
    app.api = controlled;
    Future<void> until(bool Function() ready, String label) async {
      for (var i = 0; i < 250; i++) {
        await t.pump(const Duration(milliseconds: 100));
        if (ready()) return;
      }
      final pages = t
          .widgetList<PageView>(find.byType(PageView))
          .map(
            (v) =>
                '${v.controller?.initialPage}:${v.controller?.hasClients == true ? v.controller?.page : null}',
          )
          .join(',');
      final text = t
          .widgetList<Text>(find.byType(Text))
          .map((v) => v.data)
          .whereType<String>()
          .join(' | ');
      fail(
        'Timed out: $label; route=${app.router.routeInformationProvider.value.uri}; pages=$pages; UI=$text',
      );
    }

    VideoPlayerController c() =>
        t.widget<VideoPlayer>(find.byType(VideoPlayer).first).controller;
    bool ready(String id) =>
        find.byType(ClipSurface).evaluate().isNotEmpty &&
        t.widget<ClipSurface>(find.byType(ClipSurface)).programme.id == id;
    final rows = (await original.request('/api/v1/clips')) as List;
    final ids = rows.map((r) => Programme(r).id).toList();
    expect(ids.length, 6);
    try {
      final old = Completer<void>();
      controlled.gate = old;
      controlled.failNext = true;
      app.router.go('/clips?programme=${ids[0]}');
      await until(() => controlled.calls > 0, 'old caption started');
      final oldAttempt = VideoLoadTrace.events.lastWhere(
        (e) =>
            e['item'] == ids[0] &&
            e['stage'] == 'caption-load-parse' &&
            e['outcome'] == 'start',
      )['attempt'];
      app.router.go('/clips?programme=${ids[1]}');
      await until(() => ready(ids[1]), 'B ready');
      app.router.go('/clips?programme=${ids[0]}');
      await until(() => ready(ids[0]), 'new A ready');
      final newest = c();
      old.complete();
      await until(
        () => VideoLoadTrace.events.any(
          (e) =>
              e['attempt'] == oldAttempt &&
              e['stage'] == 'caption-load-parse' &&
              e['outcome'] == 'obsolete',
        ),
        'specific obsolete caption attempt settled',
      );
      expect(c(), same(newest));
      expect(find.text('Retry'), findsNothing);
      expect(c().value.isPlaying, isFalse);
      expect(
        VideoLoadTrace.events.any((e) => e['outcome'] == 'obsolete'),
        isTrue,
      );
      controlled.failNext = true;
      app.router.go('/clips?programme=${ids[2]}');
      await until(
        () => find.text('Retry').evaluate().isNotEmpty,
        'controlled failure',
      );
      await t.tap(find.text('Retry'));
      await until(() => ready(ids[2]), 'real Retry');
      expect(c().value.isPlaying, isFalse);
      for (var i = 0; i < 20; i++) {
        final id = ids[i % 6];
        app.router.go('/clips?programme=$id');
        await until(() => ready(id), 'six-clip cycle');
        final start = c().value.position.inMilliseconds;
        await t.tap(find.byTooltip('Play video').first);
        await until(
          () =>
              c().value.isPlaying &&
              c().value.position.inMilliseconds > start + 300,
          'actual playback',
        );
        expect(c().value.caption.text, isNotEmpty);
        expect(find.byType(VideoPlayer), findsOneWidget);
        app.router.go('/library');
        await until(
          () => find.byType(VideoPlayer).evaluate().isEmpty,
          'route exit completes',
        );
        expect(app.media.video, isNull);
        expect(find.byType(VideoPlayer), findsNothing);
      }
      expect(VideoLoadTrace.events.length, lessThanOrEqualTo(100));
      expect(t.takeException(), isNull);
    } finally {
      app.api = original;
      app.router.go('/');
      await t.pump();
    }
  });
}
