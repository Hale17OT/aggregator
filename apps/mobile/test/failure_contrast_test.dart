import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:aggregator_mobile/main.dart';

void main() {
  for (final brightness in Brightness.values) {
    testWidgets('Dark Clips error stays legible in $brightness paper theme', (
      t,
    ) async {
      var retries = 0;
      const background = Color(0xff101512);
      await t.pumpWidget(
        MaterialApp(
          theme: paperTheme(brightness),
          home: Scaffold(
            backgroundColor: background,
            body: FailureView(
              'Required captions unavailable',
              () => retries++,
              foreground: Colors.white,
            ),
          ),
        ),
      );
      final button = t.widget<OutlinedButton>(find.byType(OutlinedButton));
      final foreground = button.style!.foregroundColor!.resolve({})!;
      expect(
        (foreground.computeLuminance() + .05) /
            (background.computeLuminance() + .05),
        greaterThanOrEqualTo(4.5),
      );
      expect(
        t.widget<Icon>(find.byIcon(Icons.cloud_off_outlined)).color,
        foreground,
      );
      expect(button.style!.side!.resolve({})!.color, foreground);
      await t.tap(find.text('Retry'));
      await t.pump();
      expect(retries, 1);
      expect(t.takeException(), isNull);
    });
  }
}
