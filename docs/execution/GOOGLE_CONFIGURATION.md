# Scoped Google configuration — 17 October 2026

Connected existing Chrome Console tab inspected: project **Aggregator**, ID `resonant-prism-511822-m0`. Initial client inventory reported no OAuth clients; the three additive configurations below were then created. No new browser/profile, cookies, billing, IAM or project was created.

Additive plan:

- Web application: `Aggregator local web and backend`; JavaScript origin `http://127.0.0.1:3000` matches existing APP_ORIGIN. Callback-to-JSON GIS flow, so no redirect URI. Its client ID is also the native backend audience. Localhost aliases are not implicitly accepted.
- Android: package `test.example.aggregator.aggregator_mobile.localdemo`; existing debug certificate SHA-1 `65:4C:4B:3B:38:E5:A5:91:63:D1:16:18:4E:18:A0:91:53:EC:03:9B`; SHA-256 `0C:28:A7:D4:2E:A0:3E:97:BB:00:BF:1B:0B:92:E0:F3:99:91:B1:43:5D:03:E9:3E:C9:D5:60:93:02:2E:4E:FB`. Derived by apksigner verify --print-certs from preserved normal-main APK, not its file hash. Delivered normal-main r4 was installed on emulator-5554; apksigner certificate and installed APK pull verified.
- iOS: existing Runner bundle ID `test.example.aggregator.aggregatorMobile`; team/App Store IDs unknown, do not invent. Source configuration only on Windows; build/device gate pending.

Only basic identity; no AI-agent checkbox, unrelated scopes, production consent publication or credential rotation. ID-token exchange needs no web client secret. Any generated secret remains in Console and is neither copied nor logged. Public client IDs will be recorded after actual creation. Local runtime identifier configuration uses ignored `.cache/google-local.json` (no secret required).

Created and confirmed in Console: Web client 561423491735-1vddcmrfjfmghq4n16kofsg1taktpp2a.apps.googleusercontent.com; Android client 561423491735-t2he7rg2ec1vhs3lla2aojo58jt2n7ve.apps.googleusercontent.com. Both are public identifiers. Android uses the package/certificate above. OAuth remains in testing. No credential JSON or secret downloaded.

iOS client created: 561423491735-h4qbut1m4qu5o5qo6n62mqdl0jmjdk8d.apps.googleusercontent.com, bound to existing Runner bundle ID. Team/App Store fields left empty; optional Firebase App Check and AI-agent features not enabled. Official SDK9.0.0 source/SPM and per-attempt nonce integration added; Xcode/iOS build and device verification remain pending.

Scope-specific correction: Google official app-state guidance (https://developers.google.com/identity/protocols/oauth2/production-readiness/overview) exempts basic openid/email/profile from the Testing allowlist requirement. Zero listed test users is observed configuration, NOT proof that this identity-only flow is blocked. Do not require test-user creation or production publishing merely to test it. The actual remaining owner gate is interactive Google login/MFA/consent on the emulator and web; truthful Branding contacts only if Console/provider requires them. Earlier requests treating test users as a prerequisite were overly broad.
