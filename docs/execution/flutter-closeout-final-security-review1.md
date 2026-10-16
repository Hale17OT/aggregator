# Final artifact security review 1

**Historical, invalidated candidate:** the APK reviewed here was superseded after an actual short-screen Clips sizing defect. This report remains evidence for that older artifact; it must not count as one of two final sweeps on the replacement unchanged candidate. See `flutter-closeout-final-security-review2.md`.

Independent bounded read-only review, 2026-10-16. No emulator, browser, build or database operation was performed. This is actual artifact/source inspection plus examination of existing test evidence, not a device sweep or owner acceptance.

## Artifact identity and packaged configuration

Independently SHA256-hashed `output/flutter-closeout/aggregator-local-demo.apk` before and after inspection: **80965fc71c45cc9ba613511e6e0133ac112699c153fff08c7801e500d967e537**, 158682792 bytes. Both hashes match the clean snapshot report and candidate record.

Used the installed Android aapt tool only to read this APK's binary manifest and network configuration. Saved outputs: `docs/engineering/flutter-closeout/final-review-manifest.txt` and `final-review-network.txt`. The delivered artifact is explicitly **debuggable**, has backup disabled, and denies general cleartext traffic. Its compiled network-security override permits cleartext only for exact `127.0.0.1` without subdomains. The callback filter is `aggregator-local://auth/callback`. Exported launcher/media components remain present; the AndroidX profile receiver requires DUMP permission. These settings support the authorized loopback local demo and are not production-hardening approval.

Read actual ZIP notice entries and hashed their bytes, saved in `final-review-notices.json`. Guava Apache text matches the previously verified upstream-license hash; both Flutter and native JUnit EPL copies and the dependency's LICENSE-junit.txt match the official-artifact license hash. Guava/JUnit identification notices are included. This verifies the reviewed notices are packaged, not complete legal coverage for every transitive dependency. No MP4/WAV ZIP entries appeared in this bounded ZIP listing. The integrator owns the separate comprehensive payload/credential-pattern scan; it was deliberately not duplicated.

## Source/snapshot consistency

Compared 45 product entries from the clean snapshot manifest against the current repository: Dart lib, Android app source, assets, Pub manifest/lock and app Gradle configuration. **Zero differences** at inspection. Clean-snapshot logs report formatting 22 files with zero changes, analyzer no issues, **32 tests passed**, and successful localDemo debug main-entry APK build. These are read and corroborated logs, not independently rerun tests. The source manifest/report identifies a new project directory using shared installed SDK/dependency caches; this is not hermetic or byte-for-byte reproducibility across machines.

Read candidate record timestamp 2026-10-16T02:53:06.105Z: 442 apps/packages/scripts/root-config entries; aggregate fingerprint `2527f4669f757ff949c1d8715b7845e7ffd5f49e3a858b5af7d30a34c5b79a66`; 23 original renditions and 93 original asset hashes. The helper now includes scripts and root configuration, resolving the earlier coverage concern. Report/script edits can change the aggregate while product files stay frozen. The current candidate identity is recorded here rather than asserted permanent. Original media preservation is evidence from the hash-verifying helper, not independent playback of all assets by this reviewer.

## Actual journey evidence inspected

Parsed all six XML result files in `reader-20261016-054646` and `member-20261016-054848` under `output/flutter-closeout/android/`:

- Reader runs 1, 2 and 3 each contain three tests, zero failures/errors: scoped discovery/article/Back context, 200% text/reduced motion, and explicit unavailable-recording behavior.
- Member runs 1, 2 and 3 each contain one test, zero failures/errors: approved handoff, taxonomy and durable owned data.

Read the accompanying member browser reports. Their scope is explicitly Android application plus **desktop Chrome assisted captured-mail approval and Android callback**, with browser readback of native team/save writes and cross-client preference/bookmark/conflict checks. This is not same-device Chrome, physical hardware, iOS, or external mail verification.

These instrumentation runs precede the clean main-entry APK build and use test harness entrypoints. Product-source consistency supports their relevance, but does not make those instrumented APK bytes identical to this delivered main APK. Final main-APK interaction/endurance evidence and unchanged-candidate device sweeps remain separate integrator gates.

## Findings and limits

No new demonstrated P0/P1 emerged from this artifact/configuration/consistency inspection. Earlier scoped security repairs and dependency graph audit remain relevant with their recorded limits. Root npm high findings, profile performance failure, local-demo assurance, SDK integration-test runtime inclusion, full transitive notices and platform/owner accessibility/listening gaps are not converted into passes. The previously documented SQL expiry-versus-lock-wait edge remains an unexercised lower-priority limitation. This review does not authorize production release or claim final device acceptance.
