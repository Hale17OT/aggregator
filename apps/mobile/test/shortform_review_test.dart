import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:video_player/video_player.dart';
import 'package:video_player_platform_interface/video_player_platform_interface.dart';
import 'package:aggregator_mobile/data.dart';
import 'package:aggregator_mobile/main.dart' as app;
import 'package:aggregator_mobile/member.dart';
import 'package:aggregator_mobile/shortform.dart';
import 'video_identity_review_test.dart' show ReviewVideoPlatform;

class ClipReviewApi extends Fake implements Api {
  @override
  int generation = 0;
  final writes = <String>[];
  Completer<void>? writeGate;
  @override
  Future<dynamic> request(
    String path, {
    String method = 'GET',
    Json? body,
    bool member = false,
  }) async {
    if (method != 'GET') {
      writes.add('$method:$path');
      await writeGate?.future;
      return null;
    }
    if (path.startsWith('/api/v1/articles/')) return {'id': 'article-review'};
    if (path == '/api/v1/me/bookmarks') return <Json>[];
    throw StateError('Unexpected test request');
  }
}

class ClipReviewPlatform extends ReviewVideoPlatform {
  Completer<void>? pauseGate;
  int pauses = 0;
  @override
  Future<void> pause(int id) async {
    pauses++;
    await pauseGate?.future;
  }
}

void main() {
  late ClipReviewApi api;
  late ClipReviewPlatform platform;
  late VideoPlayerController controller;
  final programme = Programme({
    'programmeId': 'arbitrary-review-clip',
    'title': 'Fictional review item',
    'renditionKey': 'audio',
    'durationMs': 60000,
    'segments': <Json>[],
    'sources': <Json>[],
    'articleSlugs': ['fictional'],
  });

  Future<void> mount(WidgetTester tester) async {
    api = ClipReviewApi();
    platform = ClipReviewPlatform();
    VideoPlayerPlatform.instance = platform;
    app.api = api;
    app.member = MemberState(api)
      ..session = {
        'user': {'id': 'owner-a'},
      };
    controller = VideoPlayerController.networkUrl(
      Uri.parse('http://127.0.0.1/video'),
    );
    await tester.runAsync(controller.initialize);
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: ValueListenableBuilder<VideoPlayerValue>(
            valueListenable: controller,
            builder: (context, value, child) => ClipSurface(
              controller: controller,
              programme: programme,
              index: 0,
              count: 6,
            ),
          ),
        ),
      ),
    );
    await tester.pump();
    await tester.pump();
  }

  Future<void> clean(WidgetTester tester) async {
    await tester.pumpWidget(const SizedBox());
    await tester.runAsync(controller.dispose);
    app.member.dispose();
  }

  testWidgets(
    'item rail exposes actionable semantics and at least 48px bounds',
    (tester) async {
      final handle = tester.ensureSemantics();
      await mount(tester);
      for (final label in ['Save', 'Sources', 'Share', 'More']) {
        final node = tester.getSemantics(find.bySemanticsLabel(label));
        expect(
          node.getSemanticsData().hasAction(SemanticsAction.tap),
          isTrue,
          reason: '$label must be operable without a picture gesture',
        );
        expect(node.rect.width, greaterThanOrEqualTo(48));
        expect(node.rect.height, greaterThanOrEqualTo(48));
      }
      expect(
        tester.getSize(find.byType(Slider)).height,
        greaterThanOrEqualTo(48),
      );
      await clean(tester);
      handle.dispose();
    },
  );

  testWidgets(
    'Save paused under owner A cannot send after owner B replaces it',
    (tester) async {
      await mount(tester);
      platform.pauseGate = Completer<void>();
      await tester.tap(find.text('Save'));
      await tester.pump();
      expect(platform.pauses, greaterThan(0));
      api.generation++;
      app.member.session = {
        'user': {'id': 'owner-b'},
      };
      app.member.historyChanged();
      platform.pauseGate!.complete();
      await tester.pump();
      await tester.pump();
      expect(api.writes, isEmpty);
      expect(find.text('Saved to Library'), findsNothing);
      await clean(tester);
    },
  );

  testWidgets('late Save result cannot announce success for a replaced owner', (
    tester,
  ) async {
    await mount(tester);
    api.writeGate = Completer<void>();
    await tester.tap(find.text('Save'));
    await tester.pump();
    expect(api.writes, ['PUT:/api/v1/me/bookmarks/article-review']);
    api.generation++;
    app.member.session = null;
    app.member.historyChanged();
    api.writeGate!.complete();
    await tester.pump();
    await tester.pump();
    expect(find.text('Saved to Library'), findsNothing);
    expect(find.text('Saved'), findsNothing);
    await clean(tester);
  });

  testWidgets('paused scrub cancel rolls back without moving the feed', (
    tester,
  ) async {
    await mount(tester);
    await controller.seekTo(const Duration(seconds: 10));
    await tester.pump();
    final range = tester.getRect(find.byType(Slider));
    final gesture = await tester.startGesture(range.center);
    await gesture.moveBy(const Offset(70, 0));
    await tester.pump();
    await gesture.cancel();
    await tester.pump();
    expect(platform.seeks.last, const Duration(seconds: 10));
    expect(controller.value.isPlaying, isFalse);
    expect(find.text('1/6'), findsOneWidget);
    await clean(tester);
  });
}
