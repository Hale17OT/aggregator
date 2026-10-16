# Native reader local demonstration

This is a Flutter widget application using the existing API and unchanged programme assets. It is not a WebView and does not bundle recordings. Android local-demo package: `test.example.aggregator.aggregator_mobile.localdemo`. The production flavor deliberately has no configured API or signing identity.

## Local services and device

Use the already-running owned stack at web3000/API4000/mailbox8025. Do not start a second supervisor. If the owned stack is stopped, the existing root command is `./scripts/npm.ps1 run demo:start`. It refuses occupied ports rather than replacing other services. The retained database stays on55441 and is never forwarded to Android.

Select an authorized emulator/device with ADB. `./scripts/mobile-loopback.ps1 -Device emulator-5554` forwards only3000/4000/8025 on that device. No LAN listener, firewall change or database forwarding is needed. A physical device must first be authorized by its owner; emulator results are not physical-device evidence.

From the repository root, `./scripts/mobile-demo.ps1 -Device emulator-5554` builds the main application entrypoint, installs with `-r` to retain app data, launches it, and prints the APK SHA256. The intermediate APK path can also be replaced by instrumentation builds; always run the main-entry build before distributing a demo APK. No app/device reset or unrelated uninstall is part of this command.

APK: `apps/mobile/build/app/outputs/flutter-apk/app-localdemo-debug.apk`.

## Identity and data

Sign-in opens the real browser confirmation/approval page. Only fictional example.test addresses are permitted; email is captured locally, never delivered externally. Browser Origin and CSRF checks remain enforced. Native sessions use a separately scoped bearer credential in secure platform storage after one-use proof-bound exchange. The app does not accept web session cookies, fabricated Origin or submitted role claims. Native access is ordinary reader access; staff/MFA remains paused.

Browser first-run agreements are owner actions. SDK licence acceptance does not accept Chrome terms. Interrupted or unsolicited callbacks fail closed. A pending handoff lost with process death requires a fresh sign-in; this is not an authenticated session.

Guest reading and media work without an account. Library, interests, preferences, queue and opt-in history use the existing owned PostgreSQL services. Errors and409 conflicts must remain visible; no hidden offline write queue is used. Video and Radio have distinct rendition identities and never copy unrelated clocks.

## Checks

Dot-source `scripts/flutter-env.ps1` before Flutter commands to keep caches/temp on E:. From apps/mobile use `flutter analyze`, `flutter test`, and `dart format --output=none --set-exit-if-changed lib test integration_test`.

The project instrumentation wrapper is `./scripts/mobile-test.ps1 -Suite guest -Repeats 3 -Device emulator-5554`; `-Suite endurance` additionally checks repeated transitions and full recordings. Actual outcomes, failed attempts and source fingerprints belong in the closeout evidence, not this command guide. Passing an intermediate build does not freeze the product or satisfy owner review.

`-Suite reader -Repeats 3` checks real category/search intersection, standard/brief bibliography, Back context, unavailable recordings and large-text/reduced-motion routes. `-Suite member -Repeats 3` uses actual native controls and an owned desktop Chrome helper for captured-mail approval, typed team selection, Save, cross-client preference conflict/refetch and bookmark removal. This is labelled desktop-assisted authentication, not a same-device Chrome result. It creates dedicated fictional example.test accounts and never resets existing data.

`./scripts/mobile-repro.ps1` copies mobile source into a new project-owned directory, resolves the existing lock offline, checks formatting/analysis/tests, and builds the normal local-demo entrypoint. It shares installed SDK and dependency caches, does not install its output and does not claim bit-for-bit reproducibility. Final run identities and limitations are in `docs/engineering/flutter-closeout/`.

iOS source/configuration is included. No macOS/Xcode build, signing, iPhone playback or VoiceOver result has been verified on this Windows host. Production release, owner appearance/motion acceptance, subjective listening and physical-device accessibility remain separate gates.
