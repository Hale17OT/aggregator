import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:aggregator_mobile/paper_turn.dart';
import 'package:aggregator_mobile/players.dart';

void main() {
  Widget sheet(
    int page, {
    bool reduce = false,
    bool platformReduce = false,
    int direction = 1,
  }) => MaterialApp(
    home: MediaQuery(
      data: MediaQueryData(disableAnimations: platformReduce),
      child: Scaffold(
        body: PaperTurn(
          spreadKey: page,
          reduceMotion: reduce,
          direction: direction,
          child: SizedBox(width: 300, height: 240, child: Text('Spread $page')),
        ),
      ),
    ),
  );
  testWidgets('Reduced motion skips old sheet for app and platform settings', (
    t,
  ) async {
    for (final platform in [false, true]) {
      await t.pumpWidget(sheet(1));
      await t.pumpWidget(sheet(2, reduce: !platform, platformReduce: platform));
      expect(find.text('Spread 1'), findsNothing);
      expect(find.text('Spread 2'), findsOneWidget);
      expect(t.binding.transientCallbackCount, 0);
      await t.pumpWidget(const SizedBox());
    }
  });
  testWidgets(
    'Reversal keeps current semantics, bounded old sheet and settles',
    (t) async {
      final semantics = t.ensureSemantics();
      await t.pumpWidget(sheet(1));
      await t.pumpWidget(sheet(2));
      await t.pump(const Duration(milliseconds: 200));
      expect(find.text('Spread 1'), findsOneWidget);
      expect(find.bySemanticsLabel('Spread 1'), findsNothing);
      expect(find.bySemanticsLabel('Spread 2'), findsOneWidget);
      await t.pumpWidget(sheet(1, direction: -1));
      await t.pump(const Duration(milliseconds: 200));
      expect(find.text('Spread 1'), findsOneWidget);
      expect(find.text('Spread 2'), findsOneWidget);
      await t.pumpAndSettle();
      expect(find.text('Spread 2'), findsNothing);
      expect(t.binding.transientCallbackCount, 0);
      semantics.dispose();
    },
  );
  testWidgets('Disposing mid turn cancels ticker without delayed exception', (
    t,
  ) async {
    await t.pumpWidget(sheet(1));
    await t.pumpWidget(sheet(2));
    await t.pump(const Duration(milliseconds: 200));
    await t.pumpWidget(const SizedBox());
    await t.pump(const Duration(seconds: 2));
    expect(t.takeException(), isNull);
    expect(t.binding.transientCallbackCount, 0);
  });
  testWidgets(
    'Enabling reduced motion mid turn immediately removes animated sheet',
    (t) async {
      await t.pumpWidget(sheet(1));
      await t.pumpWidget(sheet(2));
      await t.pump(const Duration(milliseconds: 200));
      await t.pumpWidget(sheet(2, reduce: true));
      expect(find.text('Spread 1'), findsNothing);
      expect(t.binding.transientCallbackCount, 0);
    },
  );

  double value = .5;
  final commits = <double>[];
  Future<void> dial(WidgetTester t, [double initial = .5]) async {
    value = initial;
    commits.clear();
    await t.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: StatefulBuilder(
            builder: (c, setState) => HardwareDial(
              label: 'Story',
              value: value,
              onPreview: (v) => setState(() => value = v),
              onCommit: commits.add,
            ),
          ),
        ),
      ),
    );
  }

  Offset point(WidgetTester t, double angle) =>
      t.getCenter(find.byKey(const ValueKey('radio-dial-face'))) +
      Offset(math.sin(angle) * 38, -math.cos(angle) * 38);
  Future<TestGesture> begin(WidgetTester t, double angle) async {
    final g = await t.startGesture(point(t, angle));
    await g.moveTo(point(t, angle + .6));
    await t.pump();
    return g;
  }

  testWidgets('Actual face cancellation restores preview and never commits', (
    t,
  ) async {
    await dial(t);
    final g = await begin(t, 0);
    await g.moveTo(point(t, 1.2));
    await t.pump();
    expect(value, greaterThan(.5));
    expect(commits, isEmpty);
    await g.cancel();
    await t.pump();
    expect(value, .5);
    expect(commits, isEmpty);
  });
  testWidgets('Actual face seam crosses continuously without endpoint jump', (
    t,
  ) async {
    await dial(t);
    final g = await begin(t, 2.1);
    await g.moveTo(point(t, 3.05));
    await t.pump();
    final before = value;
    await g.moveTo(point(t, -3.05));
    await t.pump();
    expect(value - before, closeTo((2 * math.pi - 6.1) / 4.7, .015));
    expect(commits, isEmpty);
    await g.up();
    await t.pump();
    expect(commits, hasLength(1));
    expect(commits.single, value);
  });
  testWidgets('Actual face clamps endpoints and supports immediate reversal', (
    t,
  ) async {
    await dial(t, .95);
    final g = await begin(t, 0);
    await g.moveTo(point(t, 1.4));
    await t.pump();
    expect(value, 1);
    await g.moveTo(point(t, 2));
    await t.pump();
    expect(value, 1);
    await g.moveTo(point(t, 1.6));
    await t.pump();
    expect(value, lessThan(1));
    for (double a = 1.0; a >= -5; a -= .5) {
      await g.moveTo(point(t, a));
      await t.pump();
    }
    expect(value, 0);
    await g.up();
    await t.pump();
    expect(commits, [0]);
  });
  testWidgets(
    'Semantic adjustment and visible alternatives clamp with one commit',
    (t) async {
      final handle = t.ensureSemantics();
      await dial(t, .98);
      final face = find.byKey(const ValueKey('radio-dial-face'));
      final node = t.getSemantics(face);
      expect(
        node.getSemanticsData().hasAction(SemanticsAction.increase),
        isTrue,
      );
      t.binding.performSemanticsAction(
        SemanticsActionEvent(
          type: SemanticsAction.increase,
          nodeId: node.id,
          viewId: t.view.viewId,
        ),
      );
      await t.pump();
      expect(value, 1);
      expect(commits, [1]);
      await t.tap(find.byTooltip('Decrease Story'));
      await t.pump();
      expect(value, .95);
      expect(commits, [1, .95]);
      handle.dispose();
    },
  );
  testWidgets('Keyboard can focus and adjust dial without pointer dragging', (
    t,
  ) async {
    await dial(t);
    await t.sendKeyEvent(LogicalKeyboardKey.tab);
    await t.pump();
    await t.sendKeyEvent(LogicalKeyboardKey.arrowRight);
    await t.pump();
    expect(value, greaterThan(.5));
    expect(commits, hasLength(1));
  });
}
