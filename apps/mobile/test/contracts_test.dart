import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:aggregator_mobile/data.dart';
import 'package:aggregator_mobile/players.dart';

void main() {
  test('Article refuses silent loss of attribution', () {
    expect(
      () => Article({
        'id': 'a',
        'versionId': 'v',
        'slug': 's',
        'headline': 'h',
        'deck': 'd',
        'blocks': [],
      }),
      throwsFormatException,
    );
  });
  test('Production refuses the unconfigured local transport', () {
    expect(() => Api(), throwsStateError);
  });
  testWidgets(
    'Actual dial face previews then commits once and exposes alternatives',
    (tester) async {
      var value = .5, commits = 0;
      await tester.pumpWidget(
        MaterialApp(
          home: StatefulBuilder(
            builder: (c, setState) => Scaffold(
              body: HardwareDial(
                label: 'Volume',
                value: value,
                onPreview: (v) => setState(() => value = v),
                onCommit: (v) {
                  commits++;
                },
              ),
            ),
          ),
        ),
      );
      final face = find.byKey(const ValueKey('radio-dial-face'));
      final start = tester.getCenter(face);
      final gesture = await tester.startGesture(start);
      await gesture.moveBy(const Offset(25, -25));
      await tester.pump();
      expect(commits, 0);
      await gesture.up();
      await tester.pump();
      expect(commits, 1);
      await tester.tap(find.byTooltip('Increase Volume'));
      await tester.pump();
      expect(commits, 2);
    },
  );
}
