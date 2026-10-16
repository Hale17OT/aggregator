import 'package:flutter_test/flutter_test.dart';
import 'package:aggregator_mobile/data.dart';
import 'package:aggregator_mobile/member.dart';
import 'auth_lifecycle_test.dart' show TestApi, DelayedStorage;

Programme programme(String id, String variant, String treatment) => Programme({
  'programmeId': id,
  'renditionKey': 'recording-$id',
  'durationMs': 60000,
  'segments': <Json>[],
  'sources': <Json>[],
  'variant': variant,
  'mediaTreatment': treatment,
});

void main() {
  test(
    'playback preference clamps numeric bounds and resets missing settings',
    () {
      final state = MemberState(TestApi());
      final speeds = <double>[];
      state.onPlaybackPreference = speeds.add;
      for (final sample in <double, double>{
        -10: .75,
        .75: .75,
        1.25: 1.25,
        10: 1.5,
      }.entries) {
        state.applyPreferences({'playbackSpeed': sample.key});
        expect(state.playbackSpeed, sample.value);
        expect(speeds.last, sample.value);
      }
      state.applyPreferences({
        'playbackSpeed': '1.5',
        'anchorCount': 99,
        'mediaTreatment': 'unsupported',
      });
      expect(state.playbackSpeed, 1);
      expect(state.anchorCount, 1);
      expect(state.mediaTreatment, 'narration_over_visual');
      state.applyPreferences({});
      expect(speeds.last, 1);
    },
  );

  test(
    'saved playback preferences apply and logout restores defaults',
    () async {
      final storage = DelayedStorage();
      final state = MemberState(TestApi(), secureStorage: storage);
      final speeds = <double>[];
      state.onPlaybackPreference = speeds.add;
      state.applyPreferences({
        'playbackSpeed': 1.25,
        'anchorCount': 2,
        'mediaTreatment': 'clip_then_comment',
      });
      expect(state.playbackSpeed, 1.25);
      expect(state.anchorCount, 2);
      expect(state.mediaTreatment, 'clip_then_comment');
      expect(speeds, [1.25]);
      await state.logout();
      expect(state.playbackSpeed, 1);
      expect(state.anchorCount, 1);
      expect(state.mediaTreatment, 'narration_over_visual');
      expect(speeds, [1.25, 1]);
    },
  );

  test(
    'explicit programme identity beats preferences; unavailable identity falls back',
    () {
      final rows = [
        programme('arbitrary-a', 'solo', 'narration_over_visual'),
        programme('unrelated-b', 'duo', 'clip_then_comment'),
        programme('independent-c', 'duo', 'narration_over_visual'),
      ];
      expect(
        preferredProgrammeIndex(
          rows,
          requestedId: 'arbitrary-a',
          anchorCount: 2,
          treatment: 'clip_then_comment',
        ),
        0,
      );
      expect(
        preferredProgrammeIndex(
          rows,
          requestedId: 'missing',
          anchorCount: 2,
          treatment: 'clip_then_comment',
        ),
        1,
      );
      expect(preferredProgrammeIndex(rows, anchorCount: 2), 2);
      expect(preferredProgrammeIndex(rows, anchorCount: 1), 0);
    },
  );

  test(
    'selection falls back to variant then first item without slug assumptions',
    () {
      final rows = [
        programme('zeta', 'solo', 'clip_then_comment'),
        programme('alpha', 'duo', 'clip_then_comment'),
      ];
      expect(preferredProgrammeIndex(rows, anchorCount: 2), 1);
      final onlyRadio = [
        programme('opaque-id', 'full', 'narration_over_visual'),
      ];
      expect(preferredProgrammeIndex(onlyRadio, anchorCount: 2), 0);
      expect(
        preferredProgrammeIndex(rows.reversed.toList(), anchorCount: 2),
        0,
      );
    },
  );
}
