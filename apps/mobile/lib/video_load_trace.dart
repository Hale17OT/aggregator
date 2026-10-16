import 'dart:convert';
import 'package:flutter/foundation.dart';

/// Bounded local diagnostics. No URLs, payloads, credentials or uploads.
class VideoLoadTrace {
  static int _sequence = 0;
  static int begin() => ++_sequence;
  static final events = <Map<String, Object>>[];
  static void add(
    int attempt,
    String item,
    String rendition,
    String stage, {
    String outcome = 'ok',
    int? status,
  }) {
    String safe(String value) => value
        .replaceAll(RegExp('[^a-zA-Z0-9_-]'), '')
        .substring(
          0,
          value.replaceAll(RegExp('[^a-zA-Z0-9_-]'), '').length.clamp(0, 96),
        );
    if (events.length >= 100) events.removeAt(0);
    events.add({
      'attempt': attempt,
      'item': safe(item),
      'rendition': safe(rendition),
      'stage': stage,
      'outcome': outcome,
      'status': ?status,
    });
    if (const bool.fromEnvironment('LOCAL_DEMO')) {
      debugPrint('AGG_VIDEO_LOAD ${jsonEncode(events.last)}');
    }
  }
}
