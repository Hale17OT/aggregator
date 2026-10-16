# Replacement candidate: independent artifact security review

**Historical candidate:** superseded by the notification-icon repair and APK reviewed in `flutter-closeout-final-security-review3.md`. This earlier review is not an unchanged-candidate sweep of that final APK.

Read-only inspection on 2026-10-16. This is the first artifact security review of the replacement candidate, **not two unchanged-candidate sweeps**. The previous artifact was invalidated by an actual short-screen Clips picture-size defect. No emulator, browser, build or database actions were taken by this reviewer.

## Actual delivered artifact

Independently hashed `output/flutter-closeout/aggregator-local-demo.apk` before and after inspection. Both reads returned **0ee4b8052aeb9e5079b757baee895ea53164f1ee43d64c3119b76cab53c3d5b1**, matching the new clean-snapshot report.

Read its binary manifest and network XML with installed aapt; saved `final-review2-manifest.txt` and `final-review2-network.txt` under `docs/engineering/flutter-closeout/`. Their decoded contents are identical to the previously inspected manifest/network configuration: debuggable local demo, backup disabled, general cleartext denied, exact 127.0.0.1 cleartext exception without subdomains, and exact native callback filter. This remains local-demo configuration, not production approval.

Hashed seven actual Guava/JUnit notice/license entries in the APK. All match the previous independently verified license bytes and notice entries; `final-review2-notices.json` records each hash. The bounded ZIP listing contained zero MP4/WAV paths. The integrator's new full credential-pattern/payload scan remains separate and was not duplicated. This does not establish complete transitive license compliance.

## Product consistency and exact repair

Read `native-repro.json` and the new snapshot `.cache/flutter-repro-20261016-061245/source-manifest.json`. Compared 45 product entries (Dart lib, app Android source, assets, Pub manifests/lock and app Gradle configuration) to current repository files: **zero differences**. Compared these entries to the prior snapshot: **only `lib/players.dart` changed**, SHA256 `e2551d56bb63ef0f08aa205b57fc7770b722f13a23004e3c876e88237f9d8a9a`.

Read the exact source diff: portrait height now uses the width-bound aspect ratio and a 400-pixel minimum desired picture height within the existing scrollable content. No authentication, credential handling, media ownership, source-link or database code changed in those product entries. This narrow geometry repair reveals no new source-demonstrated P0/P1; actual short-screen fit/touch acceptance belongs to the integrator's device evidence, not this read-only inspection.

New snapshot logs show formatting 22 files with no changes, analyzer no issues, **33 tests passed**, and successful clean-directory APK build using shared SDK/dependency caches. These are inspected logs, not independently rerun checks. The previous member three-run assisted-auth evidence remains relevant to unchanged authentication source, but it is not proof of a rerun on this replacement APK.

At this review, `candidate.json` still described the previous APK/fingerprint timestamp. It must be refreshed before final handoff; this report binds directly to the independently verified replacement APK and new snapshot instead of relying on that stale aggregate record. Reader/guest repeats and final main-APK endurance were in progress and are not claimed here.

## Remaining gates

A second final review of the unchanged replacement candidate and its completed interaction evidence is still needed. Preserve all historical failures and distinct physical-device, same-device browser, iOS, accessibility, subjective-listening, owner-acceptance and production-release limitations. Root npm findings and measured profile performance failure remain unresolved. No claim of an exhaustive security audit or release certification is made.
