import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/services.dart';
import 'package:audio_service/audio_service.dart';
import 'package:go_router/go_router.dart';
import 'data.dart';
import 'media.dart';
import 'reader.dart';
import 'players.dart';
import 'member.dart';
import 'profile.dart';
import 'code_sign_in.dart';
import 'preferences.dart';
import 'listening_sync.dart';

late Api api;
late MediaCoordinator media;
late MemberState member;
late GoRouter router;
late ListeningSync listeningSync;
Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  LicenseRegistry.addLicense(() async* {
    yield LicenseEntryWithLineBreaks([
      'Guava (Android)',
    ], await rootBundle.loadString('assets/licenses/guava-APACHE-2.0.txt'));
    yield LicenseEntryWithLineBreaks([
      'JUnit (Android integration runtime)',
    ], await rootBundle.loadString('assets/licenses/junit-EPL-1.0.txt'));
    for (final font in ['manrope', 'newsreader', 'unifrakturmaguntia']) {
      yield LicenseEntryWithLineBreaks([
        font,
      ], await rootBundle.loadString('assets/fonts/$font-LICENSE.txt'));
    }
  });
  api = Api();
  debugPrint('Reader startup: audio handler');
  final handler = await AudioService.init(
    builder: () => RadioHandler(),
    config: const AudioServiceConfig(
      androidNotificationChannelId: 'test.example.aggregator.radio',
      androidNotificationChannelName: 'Aggregator Radio',
      androidNotificationIcon: 'drawable/aggregator_notification',
      androidNotificationOngoing: true,
    ),
  );
  media = MediaCoordinator(api, handler);
  debugPrint('Reader startup: audio session');
  await media.configure();
  debugPrint('Reader startup: secure session');
  member = MemberState(api);
  member.onPlaybackPreference = (speed) =>
      unawaited(media.setPlaybackSpeed(speed));
  await member.restore();
  debugPrint('Reader startup: router');
  listeningSync = ListeningSync(api, media, member);
  router = GoRouter(
    initialLocation: '/',
    routes: [
      ShellRoute(
        builder: (c, s, child) =>
            ReaderShell(location: s.uri.path, child: child),
        routes: [
          GoRoute(
            path: '/',
            builder: (c, s) => HomePage(
              query: s.uri.queryParameters,
              defaultMode: member.homeMode,
            ),
          ),
          GoRoute(path: '/radio', builder: (c, s) => const RadioPage()),
          GoRoute(
            path: '/newsroom',
            builder: (c, s) => VideoCatalogue(
              clips: false,
              requestedId: s.uri.queryParameters['programme'],
            ),
          ),
          GoRoute(
            path: '/clips',
            builder: (c, s) => VideoCatalogue(
              clips: true,
              requestedId: s.uri.queryParameters['programme'],
            ),
          ),
          GoRoute(path: '/library', builder: (c, s) => const LibraryPage()),
          GoRoute(path: '/profile', builder: (c, s) => const ProfilePage()),
          GoRoute(
            path: '/sign-in/code',
            builder: (c, s) => const CodeSignInPage(),
          ),
          GoRoute(path: '/interests', builder: (c, s) => const InterestsPage()),
          GoRoute(
            path: '/preferences',
            builder: (c, s) => const PreferencesPage(),
          ),
          GoRoute(
            path: '/article/:slug',
            builder: (c, s) => ArticlePage(
              slug: s.pathParameters['slug']!,
              section: s.uri.queryParameters['section'],
            ),
          ),
        ],
      ),
    ],
    errorBuilder: (c, s) => Scaffold(
      body: SafeArea(
        child: Center(
          child: TextButton(
            onPressed: () => c.go('/'),
            child: const Text('This link is unavailable. Return Home.'),
          ),
        ),
      ),
    ),
  );
  member.onNavigate = router.go;
  member.listenLinks();
  runApp(const AggregatorApp());
}

class AggregatorApp extends StatelessWidget {
  const AggregatorApp({super.key});
  @override
  Widget build(BuildContext context) => ListenableBuilder(
    listenable: member,
    builder: (c, _) => MaterialApp.router(
      title: 'The Aggregator',
      debugShowCheckedModeBanner: false,
      routerConfig: router,
      theme: paperTheme(Brightness.light),
      darkTheme: paperTheme(Brightness.dark),
      themeMode: member.theme,
      builder: (context, child) => MediaQuery(
        data: MediaQuery.of(context).copyWith(
          textScaler: TextScaler.linear(
            MediaQuery.textScalerOf(context).scale(1) * member.readingScale,
          ),
          disableAnimations:
              MediaQuery.disableAnimationsOf(context) || member.reduceMotion,
        ),
        child: child!,
      ),
    ),
  );
}

ThemeData paperTheme(Brightness brightness) {
  final dark = brightness == Brightness.dark;
  final scheme = ColorScheme.fromSeed(
    seedColor: const Color(0xff174c3c),
    brightness: brightness,
    surface: dark ? const Color(0xff17231e) : const Color(0xfff8f4e9),
  );
  return ThemeData(
    colorScheme: scheme,
    scaffoldBackgroundColor: scheme.surface,
    useMaterial3: true,
    fontFamily: 'Manrope',
    dividerColor: dark ? const Color(0xff68746b) : const Color(0xffc5c3b4),
    textTheme: TextTheme(
      headlineLarge: TextStyle(
        fontFamily: 'Newsreader',
        fontSize: 32,
        height: 1.1,
        color: scheme.onSurface,
      ),
      headlineMedium: const TextStyle(
        fontFamily: 'Newsreader',
        fontSize: 26,
        height: 1.15,
      ),
      titleLarge: const TextStyle(fontFamily: 'Newsreader', fontSize: 22),
      bodyLarge: const TextStyle(
        fontFamily: 'Newsreader',
        fontSize: 19,
        height: 1.55,
      ),
    ),
    inputDecorationTheme: const InputDecorationTheme(
      border: OutlineInputBorder(),
      isDense: true,
    ),
    iconButtonTheme: IconButtonThemeData(
      style: IconButton.styleFrom(minimumSize: const Size(48, 48)),
    ),
    filledButtonTheme: FilledButtonThemeData(
      style: FilledButton.styleFrom(
        minimumSize: const Size(48, 48),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(5)),
      ),
    ),
  );
}

class ReaderShell extends StatelessWidget {
  final String location;
  final Widget child;
  const ReaderShell({super.key, required this.location, required this.child});
  static const paths = ['/', '/radio', '/newsroom', '/clips', '/library'];
  @override
  Widget build(BuildContext context) {
    final index =
        [
          '/profile',
          '/preferences',
          '/interests',
          '/sign-in/code',
        ].contains(location)
        ? 4
        : paths.indexOf(location);
    final shortform = location == '/clips';
    return AnnotatedRegion<SystemUiOverlayStyle>(
      value: shortform || Theme.of(context).brightness == Brightness.dark
          ? SystemUiOverlayStyle.light
          : SystemUiOverlayStyle.dark,
      child: Scaffold(
        backgroundColor: shortform ? const Color(0xff101512) : null,
        appBar: shortform
            ? null
            : AppBar(
                leading: IconButton(
                  tooltip: 'Profile',
                  onPressed: () => context.push('/profile'),
                  icon: const Icon(Icons.person_outline),
                ),
                title: const Text(
                  'The Aggregator',
                  style: TextStyle(fontFamily: 'Masthead', fontSize: 29),
                ),
                centerTitle: true,
                actions: [
                  IconButton(
                    tooltip: 'Light or dark theme',
                    onPressed: () => member.toggleTheme(),
                    icon: const Icon(Icons.brightness_6_outlined),
                  ),
                ],
              ),
        body: SafeArea(
          child: Column(
            children: [
              Expanded(child: child),
              if (!shortform)
                ListenableBuilder(
                  listenable: media,
                  builder: (c, _) => media.programme == null
                      ? const SizedBox.shrink()
                      : const MiniRadio(),
                ),
            ],
          ),
        ),
        bottomNavigationBar: NavigationBarTheme(
          data: shortform
              ? NavigationBarThemeData(
                  labelTextStyle: WidgetStateProperty.all(
                    const TextStyle(color: Colors.white, fontSize: 11),
                  ),
                  iconTheme: WidgetStateProperty.resolveWith(
                    (states) => IconThemeData(
                      color: states.contains(WidgetState.selected)
                          ? const Color(0xff173e30)
                          : Colors.white70,
                    ),
                  ),
                )
              : const NavigationBarThemeData(),
          child: NavigationBar(
            labelBehavior:
                shortform && MediaQuery.textScalerOf(context).scale(1) > 1.5
                ? NavigationDestinationLabelBehavior.onlyShowSelected
                : NavigationDestinationLabelBehavior.alwaysShow,
            height: shortform ? 64 : null,
            backgroundColor: shortform ? const Color(0xff18221d) : null,
            selectedIndex: index < 0 ? 0 : index,
            onDestinationSelected: (i) => context.go(paths[i]),
            destinations: const [
              NavigationDestination(icon: Icon(Icons.newspaper), label: 'Home'),
              NavigationDestination(
                icon: Icon(Icons.radio_outlined),
                label: 'Radio',
              ),
              NavigationDestination(
                icon: Icon(Icons.live_tv),
                label: 'Newsroom',
              ),
              NavigationDestination(
                icon: Icon(Icons.smart_display_outlined),
                label: 'Clips',
              ),
              NavigationDestination(
                icon: Icon(Icons.bookmarks_outlined),
                label: 'Library',
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class FailureView extends StatelessWidget {
  final Object error;
  final VoidCallback retry;
  final Color? foreground;
  const FailureView(this.error, this.retry, {super.key, this.foreground});
  @override
  Widget build(BuildContext context) => SingleChildScrollView(
    padding: const EdgeInsets.all(24),
    child: Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          Icons.cloud_off_outlined,
          color: foreground ?? DefaultTextStyle.of(context).style.color,
        ),
        Text(
          error.toString(),
          textAlign: TextAlign.center,
          style: TextStyle(color: foreground),
        ),
        const SizedBox(height: 12),
        OutlinedButton(
          style: OutlinedButton.styleFrom(
            foregroundColor:
                foreground ?? DefaultTextStyle.of(context).style.color,
            side: BorderSide(
              color:
                  foreground ??
                  DefaultTextStyle.of(context).style.color ??
                  Theme.of(context).colorScheme.onSurface,
            ),
          ),
          onPressed: retry,
          child: const Text('Retry'),
        ),
      ],
    ),
  );
}
