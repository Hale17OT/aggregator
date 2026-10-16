// Explicit local diagnostic entrypoint; never used by the demo APK command.
import 'dart:async';
import 'dart:convert';
import 'package:flutter/foundation.dart';
import 'package:flutter/scheduler.dart';
import 'package:flutter/widgets.dart';
import 'main.dart' as app;

Future<void> main() async {
  if (!kProfileMode || !const bool.fromEnvironment('LOCAL_DEMO')) {
    throw StateError('This diagnostic requires profile localDemo');
  }
  WidgetsFlutterBinding.ensureInitialized();
  final elapsed = Stopwatch()..start();
  final cold = <List<int>>[], warm = <List<int>>[];
  var droppedSamples = 0;
  SchedulerBinding.instance.addTimingsCallback((frames) {
    for (final frame in frames) {
      final bucket = elapsed.elapsed.inSeconds < 30 ? cold : warm;
      if (bucket.length >= 10000) {
        droppedSamples++;
        continue;
      }
      bucket.add([
        frame.buildDuration.inMicroseconds,
        frame.rasterDuration.inMicroseconds,
        frame.totalSpan.inMicroseconds,
      ]);
    }
  });
  Map<String, Object> summarize(List<List<int>> rows) {
    if (rows.isEmpty) return {'frames': 0};
    final columns = List.generate(
      3,
      (i) => rows.map((r) => r[i]).toList()..sort(),
    );
    double percentile(List<int> values, double p) =>
        values[((values.length - 1) * p).ceil()] / 1000;
    return {
      'frames': rows.length,
      for (var i = 0; i < 3; i++)
        ['ui', 'raster', 'totalSpan'][i]: {
          'p95Ms': percentile(columns[i], .95),
          'p99Ms': percentile(columns[i], .99),
          'maxMs': columns[i].last / 1000,
          'over16_7Percent':
              100 * columns[i].where((v) => v > 16700).length / rows.length,
        },
    };
  }

  Timer.periodic(const Duration(seconds: 15), (_) {
    debugPrint(
      'AGG_PROFILE ${jsonEncode({'seconds': elapsed.elapsed.inSeconds, 'coldFirst30Seconds': summarize(cold), 'warm': summarize(warm), 'droppedSamples': droppedSamples, 'scope': 'Emulator diagnostic, not physical-device certification; input and decoder counters separate'})}',
    );
  });
  await app.main();
}
