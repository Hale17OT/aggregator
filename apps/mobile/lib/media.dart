import 'dart:async';
import 'package:audio_service/audio_service.dart';
import 'package:audio_session/audio_session.dart';
import 'package:flutter/foundation.dart';
import 'package:just_audio/just_audio.dart';
import 'package:video_player/video_player.dart';
import 'data.dart';

class RadioHandler extends BaseAudioHandler with SeekHandler {
  final AudioPlayer player = AudioPlayer();
  late MediaCoordinator coordinator;
  RadioHandler() {
    player.playbackEventStream.listen(
      (event) {
        playbackState.add(
          PlaybackState(
            controls: [
              MediaControl.skipToPrevious,
              player.playing ? MediaControl.pause : MediaControl.play,
              MediaControl.skipToNext,
            ],
            systemActions: const {
              MediaAction.seek,
              MediaAction.seekForward,
              MediaAction.seekBackward,
            },
            androidCompactActionIndices: const [0, 1, 2],
            processingState: const {
              ProcessingState.idle: AudioProcessingState.idle,
              ProcessingState.loading: AudioProcessingState.loading,
              ProcessingState.buffering: AudioProcessingState.buffering,
              ProcessingState.ready: AudioProcessingState.ready,
              ProcessingState.completed: AudioProcessingState.completed,
            }[player.processingState]!,
            playing: player.playing,
            updatePosition: player.position,
            bufferedPosition: player.bufferedPosition,
            speed: player.speed,
          ),
        );
      },
      onError: (Object e) {
        coordinator.error.value = 'Recording unavailable. Retry explicitly.';
      },
    );
  }
  @override
  Future<void> play() => coordinator.playRadio();
  @override
  Future<void> pause() => player.pause();
  @override
  Future<void> seek(Duration position) => player.seek(position);
  @override
  Future<void> skipToNext() => coordinator.chapter(1);
  @override
  Future<void> skipToPrevious() => coordinator.chapter(-1);
  @override
  Future<void> stop() async {
    await player.stop();
    await super.stop();
  }
}

class MediaCoordinator extends ChangeNotifier {
  final Api api;
  final RadioHandler radio;
  final error = ValueNotifier<String?>(null);
  Programme? programme;
  VideoPlayerController? video;
  String owner = 'none';
  int epoch = 0;
  final _retiredVideos = Expando<bool>();
  VideoPlayerController? _pendingVideo;
  int? _pendingVideoEpoch;
  int? _videoOwnerEpoch;
  int? radioAccountGeneration, videoAccountGeneration;
  Timer? sleepTimer;
  String sleepChoice = 'off';
  int? stopAtMs;
  double preferredSpeed = 1;
  Future<void> setPlaybackSpeed(double speed) async {
    preferredSpeed = speed;
    try {
      await radio.player.setSpeed(speed);
    } catch (_) {
      error.value =
          'The playback speed could not be applied. Retry the preference.';
    }
  }

  final videoPositions = <String, Duration>{};
  MediaCoordinator(this.api, this.radio) {
    radio.coordinator = this;
    radio.player.positionStream.listen((p) {
      if (stopAtMs != null && p.inMilliseconds >= stopAtMs!) {
        stopAtMs = null;
        sleepChoice = 'off';
        notifyListeners();
        unawaited(radio.pause());
      }
    });
  }
  Future<void> configure() async {
    final session = await AudioSession.instance;
    await session.configure(const AudioSessionConfiguration.speech());
    session.becomingNoisyEventStream.listen((_) {
      unawaited(radio.pause());
      unawaited(video?.pause());
    });
    session.interruptionEventStream.listen((event) {
      if (event.begin && owner == 'radio') {
        unawaited(radio.pause());
      }
      // VideoPlayer's native renderer owns its audio focus. The old Radio
      // focus request loses focus when we intentionally hand off to video;
      // treating that old loss as a video interruption pauses the new owner.
    });
  }

  Future<void> loadRadio(Programme p, {bool play = false}) async {
    final token = ++epoch;
    error.value = null;
    await video?.pause();
    await radio.player.pause();
    if (token != epoch) return;
    owner = 'radio';
    programme = p;
    if (sleepChoice == 'story') {
      stopAtMs = null;
      sleepChoice = 'off';
    }
    notifyListeners();
    try {
      radio.mediaItem.add(
        MediaItem(
          id: p.id,
          title: p.title,
          album: 'The Aggregator • fictional local edition',
          duration: p.duration,
        ),
      );
      await radio.player.setUrl(api.asset(p.raw['audioUrl']).toString());
      if (token != epoch) {
        return;
      }
      await radio.player.setSpeed(preferredSpeed);
      if (token != epoch) return;
      if (play) {
        radioAccountGeneration = api.generation;
        unawaited(
          radio.player.play().catchError((Object _) {
            error.value = 'Playback could not start.';
          }),
        );
      }
    } catch (_) {
      if (token != epoch) return;
      error.value =
          'This recording could not be loaded. No alternate recording was substituted.';
    }
  }

  Future<void> playRadio() async {
    final token = ++epoch;
    await video?.pause();
    if (token != epoch) return;
    owner = 'radio';
    radioAccountGeneration = api.generation;
    notifyListeners();
    try {
      unawaited(
        radio.player.play().catchError((Object _) {
          error.value = 'Playback could not start.';
        }),
      );
    } catch (_) {
      error.value = 'Playback could not start.';
    }
  }

  Future<void> claimVideo(VideoPlayerController controller) async {
    if (_retiredVideos[controller] == true) return;
    final token = ++epoch;
    _pendingVideo = controller;
    _pendingVideoEpoch = token;
    try {
      await radio.pause();
      if (token != epoch || _retiredVideos[controller] == true) return;
      if (video != controller) await video?.pause();
      if (token != epoch ||
          _retiredVideos[controller] == true ||
          !controller.value.isInitialized) {
        return;
      }
      _pendingVideo = null;
      video = controller;
      _videoOwnerEpoch = token;
      owner = 'video';
      videoAccountGeneration = api.generation;
      notifyListeners();
      await controller.play();
    } finally {
      if (_pendingVideo == controller && _pendingVideoEpoch == token) {
        _pendingVideo = null;
        _pendingVideoEpoch = null;
      }
    }
  }

  void detach(VideoPlayerController controller) {
    _retiredVideos[controller] = true;
    if (_pendingVideo == controller) {
      if (_pendingVideoEpoch == epoch) ++epoch;
      _pendingVideo = null;
      _pendingVideoEpoch = null;
    }
    if (video == controller) {
      video = null;
      if (owner == 'video') {
        if (_videoOwnerEpoch == epoch) ++epoch;
        owner = 'none';
      }
      _videoOwnerEpoch = null;
      // Route teardown may occur during an ancestor build. Ownership changes
      // immediately; defer only the UI notification until that stack finishes.
      scheduleMicrotask(notifyListeners);
    }
  }

  Future<void> chapter(int step) async {
    final p = programme;
    if (p == null) return;
    final now = radio.player.position.inMilliseconds;
    final chapters = p.chapters;
    var i = chapters.lastIndexWhere((c) => c['startMs'] <= now);
    i = (i + step).clamp(0, chapters.length - 1);
    await radio.seek(Duration(milliseconds: chapters[i]['startMs']));
  }

  void sleep(String choice) {
    sleepTimer?.cancel();
    sleepTimer = null;
    sleepChoice = choice;
    stopAtMs = null;
    if (choice == 'story') {
      final p = programme;
      if (p != null) {
        stopAtMs = p.chapters.firstWhere(
          (c) => c['endMs'] > radio.player.position.inMilliseconds,
          orElse: () => p.chapters.last,
        )['endMs'];
      } else {
        sleepChoice = 'off';
      }
    } else if (choice != 'off') {
      sleepTimer = Timer(Duration(minutes: int.parse(choice)), () {
        sleepChoice = 'off';
        notifyListeners();
        unawaited(radio.pause());
      });
    }
    notifyListeners();
  }
}
