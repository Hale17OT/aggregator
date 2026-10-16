// Isolated layout checks with synthetic in-memory API responses only.
// These tests do not verify retained persistence, authentication or real network behavior.
import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:aggregator_mobile/data.dart';
import 'package:aggregator_mobile/main.dart' as app;
import 'package:aggregator_mobile/reader.dart';
import 'package:aggregator_mobile/member.dart';

class LayoutApi extends Fake implements Api {
  @override
  Future<dynamic> request(
    String path, {
    String method = 'GET',
    Json? body,
    bool member = false,
  }) async {
    if (path.contains('/edition')) {
      return {
        'data': [],
        'meta': {'page': 2, 'pages': 3, 'total': 0, 'token': 'layout-only'},
      };
    }
    if (path == '/api/v1/me/interests') {
      return {
        'rules': [],
        'hiddenStories': [],
        'revision': 1,
        'status': 'not_started',
      };
    }
    if (path.startsWith('/api/v1/interests/catalogue')) {
      return [
        {
          'id': 'test:sports',
          'label': 'Sports',
          'hasChildren': true,
          'kind': 'topic',
          'competitions': [],
        },
      ];
    }
    throw StateError('Unexpected test API request: $path');
  }
}

void main() {
  Future<void> mount(
    WidgetTester t,
    Widget child, {
    double scale = 2,
    double height = 480,
  }) async {
    t.view.physicalSize = Size(320, height);
    t.view.devicePixelRatio = 1;
    addTearDown(t.view.resetPhysicalSize);
    addTearDown(t.view.resetDevicePixelRatio);
    app.api = LayoutApi();
    await t.pumpWidget(
      MaterialApp(
        theme: app.paperTheme(Brightness.light),
        home: MediaQuery(
          data: MediaQueryData(
            size: Size(320, height),
            textScaler: TextScaler.linear(scale),
          ),
          child: Scaffold(body: child),
        ),
      ),
    );
    await t.pumpAndSettle();
  }

  testWidgets(
    'Offline retry remains reachable at large text in short viewport',
    (t) async {
      var retried = false;
      await mount(
        t,
        app.FailureView(ApiFailure(0, 'OFFLINE'), () => retried = true),
        height: 240,
      );
      expect(
        t.takeException(),
        isNull,
        reason: 'Offline recovery must not overflow its available body',
      );
      await t.ensureVisible(find.text('Retry'));
      await t.tap(find.text('Retry'));
      await t.pump();
      expect(retried, isTrue);
    },
  );
  testWidgets(
    'Home pagination remains laid out and reachable at 200 percent text',
    (t) async {
      await mount(t, const HomePage(query: {}));
      await t.scrollUntilVisible(
        find.text('Next'),
        200,
        scrollable: find.byType(Scrollable).first,
      );
      await t.pump();
      expect(
        t.takeException(),
        isNull,
        reason: 'Previous/Next must wrap instead of overflowing320px',
      );
      expect(find.text('Previous').hitTestable(), findsOneWidget);
      expect(find.text('Next').hitTestable(), findsOneWidget);
    },
  );
  testWidgets('Interest navigation and selection actions fit large text', (
    t,
  ) async {
    await mount(t, const InterestsPage(), scale: 2.5);
    await t.scrollUntilVisible(
      find.text('Explore'),
      150,
      scrollable: find.byType(Scrollable).first,
    );
    await t.pump();
    expect(
      t.takeException(),
      isNull,
      reason: 'Explore and Mute actions must remain inside320px',
    );
    expect(find.text('Explore').hitTestable(), findsOneWidget);
    expect(find.text('Mute').hitTestable(), findsOneWidget);
  });
  testWidgets('Offline retry semantics expose enabled accessible action', (
    t,
  ) async {
    final handle = t.ensureSemantics();
    await mount(t, app.FailureView('Offline', () {}), scale: 1.3);
    final semantics = t.getSemantics(
      find.widgetWithText(OutlinedButton, 'Retry'),
    );
    expect(semantics.getSemanticsData().hasAction(SemanticsAction.tap), isTrue);
    expect(semantics.label, contains('Retry'));
    handle.dispose();
  });
}
