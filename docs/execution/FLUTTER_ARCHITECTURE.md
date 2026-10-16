# Local native reader decisions

Installed Flutter3.38.1/Dart3.10.0 are pinned for this increment; no blanket SDK upgrade. Dependency resolution selects SDK-compatible releases in pubspec.lock. Architecture uses explicit repositories/DTOs, ChangeNotifier for account/media ownership, bounded ValueListenables/streams for playback and go_router. This is one state approach, following [Flutter architecture recommendations](https://docs.flutter.dev/app-architecture/recommendations).

The existing Express API remains authoritative. Dart HttpClient uses fixed loopback destinations, rejects redirects, bounds timeouts/response sizes and never retries writes. Anonymous eligible media carries no account headers. Original HTTPS source links open externally without credentials. Production transport is deliberately unconfigured and rejects local-demo initialization; Android HTTP permission is domain-scoped in localDemo resources only. No release signing identity.

Native identity follows an external-browser, S256 proof-bound handoff based on [RFC8252](https://www.rfc-editor.org/rfc/rfc8252) and [RFC7636](https://www.rfc-editor.org/rfc/rfc7636). It is a local extension, not certified OAuth/OIDC. Browser explicit captured-mail confirmation and separate approval remain required. Durable pending codes are single-use and issue a distinct session transport. Existing web Origin/CSRF is unchanged. Platform secure storage has no plaintext fallback and backups are disabled, following the [plugin documentation](https://pub.dev/packages/flutter_secure_storage).

[audio_service](https://pub.dev/packages/audio_service) owns the persistent Radio notification handler with just_audio and speech audio_session. Foreground video uses [video_player](https://pub.dev/packages/video_player), muxed sound only, bounded active controllers and required caption fetching. Interruption currently pauses without automatic resume, avoiding a newer user-pause override. Actual platform behavior requires emulator/device verification.

Fonts are losslessly unpacked from existing licensed WOFF2 assets into TTF using installed fontTools4.62.1; original OFL notices accompany the three fonts. No new artwork, programme rendering or media bundling. All catalogue content is loaded from existing eligibility-controlled routes.

Independent security architecture findings: flutter-closeout-security-review.md. Final bounded runtime/manifest, notices and transitive review evidence is now in FLUTTER_CLOSEOUT.md and flutter-closeout-final-security-review3.md. Root npm findings and human/platform gates remain open; the original architecture paragraph is not a release claim.

