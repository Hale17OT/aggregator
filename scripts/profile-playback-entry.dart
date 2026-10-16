// Diagnostic template copied beside each preserved source tree; not main APK.
import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter/widgets.dart';
import 'main.dart' as app;

Future<void> main() async {
  if (!kProfileMode || !const bool.fromEnvironment('LOCAL_DEMO')) {
    throw StateError('Profile localDemo diagnostic only');
  }
  WidgetsFlutterBinding.ensureInitialized();
  await app.main();
  final cold = <List<int>>[], warm = <List<int>>[];
  Stopwatch? clock;
  var finished = false;
  var interruptions = 0;
  void collect(List<FrameTiming> frames) {
    final elapsed = clock?.elapsedMilliseconds;
    if (elapsed == null || elapsed >= 45000 || finished) return;
    final bucket = elapsed < 30000 ? cold : warm;
    for (final frame in frames) {
      if (bucket.length >= 10000) throw StateError('Sample cap exceeded');
      bucket.add([frame.buildDuration.inMicroseconds, frame.rasterDuration.inMicroseconds]);
    }
  }
  Map<String, Object> summarize(List<List<int>> rows) {
    if (rows.isEmpty) return {'frames': 0};
    return {
      'frames': rows.length,
      for (var i = 0; i < 2; i++)
        ['ui', 'raster'][i]: (() {
          final values = rows.map((r) => r[i]).toList()..sort();
          return {'p95Ms': values[((values.length - 1) * .95).ceil()] / 1000,
            'p99Ms': values[((values.length - 1) * .99).ceil()] / 1000,
            'over16_7Percent': 100 * values.where((v) => v > 16700).length / values.length};
        })(),
    };
  }
  SchedulerBinding.instance.addTimingsCallback(collect);
  Timer.periodic(const Duration(milliseconds: 100), (timer) {
    final playing = app.media.video?.value.isPlaying == true;
    if (clock == null && playing) clock = Stopwatch()..start();
    if (clock == null) return;
    if (!playing) interruptions++;
    if (clock!.elapsedMilliseconds < 45000) return;
    finished = true;
    SchedulerBinding.instance.removeTimingsCallback(collect);
    timer.cancel();
    debugPrint('AGG_PROFILE ${jsonEncode({'seconds': 45, 'window': 'Actual first playback +30–45 seconds', 'coldFirst30Seconds': summarize(cold), 'warm': summarize(warm), 'interruptions': interruptions, 'scope': 'Same diagnostic template in preserved baseline and candidate. Emulator only.'})}');
  });
}
