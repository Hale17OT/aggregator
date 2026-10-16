import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:video_player/video_player.dart';
import 'package:video_player_platform_interface/video_player_platform_interface.dart';
import 'package:aggregator_mobile/data.dart';
import 'package:aggregator_mobile/media.dart';
import 'package:aggregator_mobile/listening_sync.dart';
import 'package:aggregator_mobile/main.dart' as app;
import 'package:aggregator_mobile/players.dart';
import 'package:aggregator_mobile/shortform.dart';
import 'package:aggregator_mobile/member.dart';

class ReviewVideoApi extends Fake implements Api {
  bool delayCaptions = false;
  final pendingCaptions = <Completer<String>>[];
  @override
  int generation = 0;
  @override
  Uri asset(String path) => Uri.parse('http://127.0.0.1:4000$path');
  @override
  Future<String> captions(
    String path, {
    CaptionCancellation? cancellation,
  }) async {
    if (delayCaptions) {
      final pending = Completer<String>();
      pendingCaptions.add(pending);
      return pending.future;
    }
    return 'WEBVTT\n\n00:00:00.000 --> 00:01:00.000\nFictional test caption\n';
  }
}

class ReviewVideoSync extends Fake implements ListeningSync {
  @override
  int operation = 0;
  final writes = <String>[];
  @override
  void write(Programme p, String rendition, Duration position) {
    writes.add(rendition);
  }
}

class ReviewVideoMedia extends Fake implements MediaCoordinator {
  @override
  final videoPositions = <String, Duration>{};
  @override
  VideoPlayerController? video;
  @override
  String owner = 'none';
  @override
  int? videoAccountGeneration;
  @override
  void detach(VideoPlayerController c) {
    if (video == c) {
      video = null;
      owner = 'none';
    }
  }
}

class ReviewVideoPlatform extends VideoPlayerPlatform {
  final streams = <int, StreamController<VideoEvent>>{};
  final seeks = <Duration>[];
  int next = 0;
  bool delayed = false;
  bool failNext = false;
  @override
  Future<void> init() async {}
  void initializePlayer(int id) => streams[id]!.add(
    VideoEvent(
      eventType: VideoEventType.initialized,
      size: const Size(1920, 1080),
      duration: const Duration(seconds: 60),
    ),
  );
  @override
  Future<int?> createWithOptions(VideoCreationOptions options) async {
    final id = next++;
    streams[id] = StreamController<VideoEvent>();
    if (failNext) {
      failNext = false;
      streams[id]!.addError(
        PlatformException(
          code: 'ReviewVideoUnavailable',
          message: 'Controlled source failure',
        ),
      );
    } else if (!delayed) {
      initializePlayer(id);
    }
    return id;
  }

  @override
  Stream<VideoEvent> videoEventsFor(int id) => streams[id]!.stream;
  @override
  Future<void> dispose(int id) async {
    await streams[id]?.close();
  }

  @override
  Future<void> pause(int id) async {}
  @override
  Future<void> play(int id) async {}
  @override
  Future<void> setLooping(int id, bool looping) async {}
  @override
  Future<void> setVolume(int id, double volume) async {}
  @override
  Future<void> setPlaybackSpeed(int id, double speed) async {}
  @override
  Future<Duration> getPosition(int id) async => Duration.zero;
  @override
  Future<void> seekTo(int id, Duration position) async {
    seeks.add(position);
  }

  @override
  Widget buildView(int id) => const SizedBox.expand();
}

void main() {
  test(
    'Caption cancellation aborts once, including late request attachment',
    () {
      var aborts = 0;
      final first = CaptionCancellation();
      first.attach(() => aborts++);
      first.cancel();
      first.cancel();
      expect(aborts, 1);
      final late = CaptionCancellation()..cancel();
      late.attach(() => aborts++);
      expect(aborts, 2);
      final finished = CaptionCancellation();
      finished.attach(() => aborts++);
      finished.release();
      finished.cancel();
      expect(aborts, 2);
    },
  );
  late ReviewVideoApi api;
  late ReviewVideoSync sync;
  late ReviewVideoMedia media;
  late ReviewVideoPlatform platform;
  final programme = Programme({
    'programmeId': 'review-broadcast',
    'title': 'Fictional review programme',
    'renditionKey': 'audio-rendition',
    'durationMs': 60000,
    'segments': <dynamic>[],
    'sources': <dynamic>[],
    'articleSlugs': ['fictional'],
    'videoRendition': {
      'renditionKey': 'video-rendition',
      'url': '/video',
      'captionUrl': '/caption',
    },
  });
  setUp(() {
    api = ReviewVideoApi();
    sync = ReviewVideoSync();
    media = ReviewVideoMedia();
    platform = ReviewVideoPlatform();
    VideoPlayerPlatform.instance = platform;
    app.api = api;
    app.member = MemberState(api);
    app.listeningSync = sync;
    app.media = media;
  });
  Future<void> mount(WidgetTester tester) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(body: ProgrammeVideo(programme: programme, clip: false)),
      ),
    );
    await tester.pump();
    await tester.pump();
  }

  VideoPlayerController controller(WidgetTester tester) =>
      tester.widget<VideoPlayer>(find.byType(VideoPlayer).first).controller;
  Future<void> remove(WidgetTester tester) async {
    await tester.pumpWidget(const SizedBox());
    await tester.pump();
  }

  testWidgets(
    'Short Clip canvas contains the picture and keeps item actions reachable',
    (tester) async {
      tester.view.physicalSize = const Size(320, 240);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);
      await tester.pumpWidget(
        MaterialApp(
          home: Scaffold(
            body: ProgrammeVideo(programme: programme, clip: true),
          ),
        ),
      );
      await tester.pump();
      await tester.pump();
      final picture = find.byType(VideoPlayer);
      expect(tester.getSize(picture).height, lessThanOrEqualTo(240));
      expect(tester.getCenter(picture).dx, closeTo(160, .5));
      await tester.ensureVisible(find.text('Sources'));
      await tester.pump();
      expect(find.text('Sources').hitTestable(), findsOneWidget);
      expect(find.text('Share').hitTestable(), findsOneWidget);
      expect(tester.takeException(), isNull);
      await remove(tester);
    },
  );

  testWidgets(
    'Clips retains a picture and usable actions at large text and landscape',
    (tester) async {
      addTearDown(tester.view.resetPhysicalSize);
      addTearDown(tester.view.resetDevicePixelRatio);
      tester.view.devicePixelRatio = 1;
      for (final sample in [
        (const Size(320, 368), 2.0),
        (const Size(640, 172), 1.0),
      ]) {
        tester.view.physicalSize = sample.$1;
        await tester.pumpWidget(
          MaterialApp(
            home: MediaQuery(
              data: MediaQueryData(
                size: sample.$1,
                textScaler: TextScaler.linear(sample.$2),
              ),
              child: Scaffold(
                body: ProgrammeVideo(programme: programme, clip: true),
              ),
            ),
          ),
        );
        await tester.pump();
        await tester.pump();
        final picture = find.byType(VideoPlayer);
        expect(tester.getSize(picture).height, greaterThan(0));
        expect(
          tester.getSize(picture).height,
          lessThanOrEqualTo(sample.$1.height),
        );
        expect(tester.getCenter(picture).dx, closeTo(sample.$1.width / 2, .5));
        expect(
          find.byIcon(Icons.source_outlined).hitTestable(),
          findsOneWidget,
        );
        expect(
          find.byIcon(Icons.ios_share_outlined).hitTestable(),
          findsOneWidget,
        );
        expect(tester.takeException(), isNull);
        await remove(tester);
      }
    },
  );

  testWidgets('Clips More navigation wraps at twice text size', (tester) async {
    tester.view.physicalSize = const Size(320, 568);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);
    await tester.pumpWidget(
      MaterialApp(
        builder: (context, child) => MediaQuery(
          data: MediaQuery.of(
            context,
          ).copyWith(textScaler: const TextScaler.linear(2)),
          child: child!,
        ),
        home: Scaffold(body: ProgrammeVideo(programme: programme, clip: true)),
      ),
    );
    await tester.pump();
    await tester.pump();
    await tester.tap(find.byIcon(Icons.more_horiz));
    await tester.pumpAndSettle();
    await tester.scrollUntilVisible(
      find.text('Next clip'),
      100,
      scrollable: find
          .descendant(
            of: find.byType(ListView),
            matching: find.byType(Scrollable),
          )
          .last,
    );
    await tester.pumpAndSettle();
    expect(find.text('Next clip').hitTestable(), findsOneWidget);
    expect(tester.takeException(), isNull);
    await remove(tester);
  });

  testWidgets(
    'Mounted video replaces item and rejects an old caption failure',
    (tester) async {
      api.delayCaptions = true;
      Future<void> show(String id) async {
        final p = Programme({
          ...programme.raw,
          'programmeId': id,
          'videoRendition': {
            ...programme.video!,
            'renditionKey': id,
            'url': '/$id',
            'captionUrl': '/$id.vtt',
          },
        });
        await tester.pumpWidget(
          MaterialApp(
            home: Scaffold(
              body: ProgrammeVideo(
                key: const ValueKey('same-route'),
                programme: p,
                clip: true,
              ),
            ),
          ),
        );
        await tester.pump();
      }

      await show('a');
      await show('b');
      expect(api.pendingCaptions.length, 2);
      api.pendingCaptions[1].complete(
        'WEBVTT\n\n00:00:00.000 --> 00:01:00.000\nOnly B\n',
      );
      await tester.pump();
      await tester.pump();
      api.pendingCaptions[0].completeError(
        const FormatException('old captions'),
      );
      await tester.pump();
      await tester.pump();
      expect(
        find.text('Video or required captions unavailable.'),
        findsNothing,
      );
      expect(controller(tester).dataSource, endsWith('/b'));
      await remove(tester);
    },
  );

  testWidgets('Position ticks do not reconstruct the static Clip surface', (
    tester,
  ) async {
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(body: ProgrammeVideo(programme: programme, clip: true)),
      ),
    );
    await tester.pump();
    await tester.pump();
    final before = tester.widget<ClipSurface>(find.byType(ClipSurface));
    final c = controller(tester);
    for (var i = 1; i <= 20; i++) {
      c.value = c.value.copyWith(position: Duration(milliseconds: i * 100));
      await tester.pump();
    }
    expect(
      identical(before, tester.widget<ClipSurface>(find.byType(ClipSurface))),
      isTrue,
    );
    await remove(tester);
  });

  for (final captionFirst in [true, false]) {
    testWidgets('Caption/video completion order $captionFirst requires both', (
      tester,
    ) async {
      api.delayCaptions = true;
      platform.delayed = true;
      await mount(tester);
      if (captionFirst) {
        api.pendingCaptions.single.complete(
          'WEBVTT\n\n00:00:00.000 --> 00:01:00.000\nCorrect cue\n',
        );
      } else {
        platform.initializePlayer(0);
      }
      await tester.pump();
      await tester.pump();
      expect(find.byType(VideoPlayer), findsNothing);
      if (captionFirst) {
        platform.initializePlayer(0);
      } else {
        api.pendingCaptions.single.complete(
          'WEBVTT\n\n00:00:00.000 --> 00:01:00.000\nCorrect cue\n',
        );
      }
      await tester.pump();
      await tester.pump();
      expect(find.byType(VideoPlayer), findsOneWidget);
      expect(controller(tester).value.isPlaying, isFalse);
      await remove(tester);
    });
  }
  testWidgets(
    'Repeated Retry creates only one current attempt and does not autoplay',
    (tester) async {
      api.delayCaptions = true;
      await mount(tester);
      api.pendingCaptions.single.completeError(const FormatException('broken'));
      await tester.pump();
      await tester.pump();
      final retry = tester
          .widget<OutlinedButton>(find.widgetWithText(OutlinedButton, 'Retry'))
          .onPressed!;
      retry();
      retry();
      await tester.pump();
      expect(api.pendingCaptions.length, 2);
      api.pendingCaptions.last.complete(
        'WEBVTT\n\n00:00:00.000 --> 00:01:00.000\nRecovered same item\n',
      );
      await tester.pump();
      await tester.pump();
      expect(controller(tester).dataSource, endsWith('/video'));
      expect(controller(tester).value.isPlaying, isFalse);
      await remove(tester);
    },
  );
  testWidgets('Permanent caption denial offers no blind Retry', (tester) async {
    api.delayCaptions = true;
    await mount(tester);
    api.pendingCaptions.single.completeError(ApiFailure(403, 'DENIED'));
    await tester.pump();
    await tester.pump();
    expect(find.text('Retry'), findsNothing);
    expect(find.textContaining('no longer available'), findsOneWidget);
    await remove(tester);
  });
  testWidgets(
    'Leaving while caption request is pending ignores its late success',
    (tester) async {
      api.delayCaptions = true;
      await mount(tester);
      await remove(tester);
      api.pendingCaptions.single.complete(
        'WEBVTT\n\n00:00:00.000 --> 00:01:00.000\nObsolete\n',
      );
      await tester.pump();
      await tester.pump();
      expect(tester.takeException(), isNull);
      expect(media.video, isNull);
    },
  );

  testWidgets(
    'Live video dispose after history clear cannot restore deleted position',
    (tester) async {
      await mount(tester);
      final c = controller(tester);
      c.value = c.value.copyWith(position: const Duration(seconds: 23));
      sync.operation++;
      media.videoPositions.clear();
      await remove(tester);
      expect(media.videoPositions, isEmpty);
    },
  );
  testWidgets(
    'Live video dispose after logout cannot seed next account resume',
    (tester) async {
      await mount(tester);
      final c = controller(tester);
      c.value = c.value.copyWith(position: const Duration(seconds: 23));
      api.generation++;
      media.videoPositions.clear();
      await remove(tester);
      expect(media.videoPositions, isEmpty);
    },
  );
  testWidgets(
    'Unchanged guest navigation preserves paused exact-video position',
    (tester) async {
      await mount(tester);
      final c = controller(tester);
      c.value = c.value.copyWith(position: const Duration(seconds: 23));
      await remove(tester);
      expect(
        media.videoPositions['video-rendition'],
        const Duration(seconds: 23),
      );
      expect(media.videoPositions.containsKey('audio-rendition'), isFalse);
    },
  );
  testWidgets('Playing prepared video sends actual video rendition identity', (
    tester,
  ) async {
    await mount(tester);
    final c = controller(tester);
    media.video = c;
    media.owner = 'video';
    media.videoAccountGeneration = api.generation;
    c.value = c.value.copyWith(
      isPlaying: true,
      position: const Duration(seconds: 5),
    );
    expect(sync.writes, isNotEmpty);
    expect(sync.writes.every((key) => key == 'video-rendition'), isTrue);
    api.generation++;
    final count = sync.writes.length;
    c.value = c.value.copyWith(position: const Duration(seconds: 6));
    expect(
      sync.writes.length,
      count,
      reason: 'Old account playback must not write to new owner',
    );
    await remove(tester);
  });
  testWidgets(
    'Delayed initialization never applies pre-clear cached position',
    (tester) async {
      platform.delayed = true;
      media.videoPositions['video-rendition'] = const Duration(seconds: 23);
      await mount(tester);
      sync.operation++;
      platform.initializePlayer(0);
      await tester.pump();
      await tester.pump();
      expect(platform.seeks, isEmpty);
      expect(controller(tester).value.position, Duration.zero);
      await remove(tester);
    },
  );
  testWidgets(
    'Explicit retry captures the current history epoch after failed load',
    (tester) async {
      platform.failNext = true;
      await mount(tester);
      expect(find.text('Retry'), findsOneWidget);
      sync.operation++;
      api.generation++;
      await tester.tap(find.text('Retry'));
      await tester.pump();
      await tester.pump();
      expect(find.text('Retry'), findsNothing);
      final c = controller(tester);
      c.value = c.value.copyWith(position: const Duration(seconds: 12));
      await remove(tester);
      expect(
        media.videoPositions['video-rendition'],
        const Duration(seconds: 12),
      );
    },
  );
}
