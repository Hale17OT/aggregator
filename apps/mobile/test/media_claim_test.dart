import 'dart:async';
import 'package:flutter_test/flutter_test.dart';
import 'package:just_audio/just_audio.dart';
import 'package:video_player/video_player.dart';
import 'package:video_player_platform_interface/video_player_platform_interface.dart';
import 'package:aggregator_mobile/media.dart';
import 'video_identity_review_test.dart'
    show ReviewVideoApi, ReviewVideoPlatform;

class ClaimPlayer extends Fake implements AudioPlayer {
  @override
  Future<void> play() async {}
  @override
  Stream<Duration> get positionStream => const Stream.empty();
}

class ClaimRadio extends Fake implements RadioHandler {
  @override
  late MediaCoordinator coordinator;
  @override
  final player = ClaimPlayer();
  var gate = Completer<void>();
  @override
  Future<void> pause() => gate.future;
}

void main() {
  TestWidgetsFlutterBinding.ensureInitialized();
  test('Retiring a video cancels a pending ownership claim', () async {
    VideoPlayerPlatform.instance = ReviewVideoPlatform();
    final radio = ClaimRadio(),
        coordinator = MediaCoordinator(ReviewVideoApi(), radio);
    final c = VideoPlayerController.networkUrl(
      Uri.parse('http://127.0.0.1/video'),
    );
    await c.initialize();
    final pending = coordinator.claimVideo(c);
    coordinator.detach(c);
    radio.gate.complete();
    await pending;
    expect(coordinator.video, isNull);
    expect(coordinator.owner, 'none');
    expect(c.value.isPlaying, isFalse);
    await coordinator.claimVideo(c);
    expect(coordinator.video, isNull);
    await c.dispose();
    coordinator.dispose();
  });
  test(
    'Retiring an obsolete claim never cancels the newer Radio owner',
    () async {
      VideoPlayerPlatform.instance = ReviewVideoPlatform();
      final radio = ClaimRadio(),
          coordinator = MediaCoordinator(ReviewVideoApi(), radio);
      final c = VideoPlayerController.networkUrl(
        Uri.parse('http://127.0.0.1/video'),
      );
      await c.initialize();
      final pending = coordinator.claimVideo(c);
      await coordinator.playRadio();
      final epoch = coordinator.epoch;
      coordinator.detach(c);
      expect(coordinator.epoch, epoch);
      expect(coordinator.owner, 'radio');
      radio.gate.complete();
      await pending;
      expect(coordinator.owner, 'radio');
      expect(coordinator.video, isNull);
      coordinator.video = c;
      coordinator.detach(c);
      expect(coordinator.epoch, epoch);
      expect(coordinator.owner, 'radio');
      await c.dispose();
      coordinator.dispose();
    },
  );
  test('Retiring active A does not cancel a newer pending video B', () async {
    VideoPlayerPlatform.instance = ReviewVideoPlatform();
    final radio = ClaimRadio(),
        coordinator = MediaCoordinator(ReviewVideoApi(), radio);
    final a = VideoPlayerController.networkUrl(Uri.parse('http://127.0.0.1/a'));
    final b = VideoPlayerController.networkUrl(Uri.parse('http://127.0.0.1/b'));
    await a.initialize();
    await b.initialize();
    radio.gate.complete();
    await coordinator.claimVideo(a);
    radio.gate = Completer<void>();
    final pending = coordinator.claimVideo(b);
    final epoch = coordinator.epoch;
    coordinator.detach(a);
    expect(coordinator.epoch, epoch);
    radio.gate.complete();
    await pending;
    expect(coordinator.video, same(b));
    expect(coordinator.owner, 'video');
    coordinator.detach(b);
    await a.dispose();
    await b.dispose();
    coordinator.dispose();
  });
}
