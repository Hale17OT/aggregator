# Final notification-icon candidate: two bounded security review sweeps

The previous two artifact reviews are historical candidate reviews. This document records **two separate read-only security/artifact sweeps on the same replacement APK**, not two complete UI/media journeys. No emulator, browser, build, database mutation or product edit was performed by this reviewer.

Artifact: `output/flutter-closeout/aggregator-local-demo.apk`, SHA256 **48806fb446eaa6ae8f0bdbf5b8ba99a2db62d3a56185871e0caa88fb14fc23c0**, 158683454 bytes. Clean snapshot: `.cache/flutter-repro-20261016-062708`.

## Sweep 1 — actual package, configuration and product consistency

Read and independently hashed the delivered APK. Decoded the APK's binary Android manifest, network configuration and new notification drawable using installed aapt (inspection only). Evidence is saved as `final-review3-manifest.txt`, `final-review3-network.txt`, `final-review3-icon.txt` and `final-review3-notices.json` under `docs/engineering/flutter-closeout/`.

The actual drawable contains a 24dp vector with one opaque white path and no filled background, matching the original monochrome newspaper icon source. The manifest remains a debuggable local demo with backup disabled, general cleartext disabled, and compiled network configuration allowing only exact 127.0.0.1 without subdomains. No new general-network permission or credential transport was introduced by the icon repair. Seven actual Guava/JUnit notice/license entries were independently hashed; all match the previously verified bytes. This is bounded notice verification, not complete legal coverage.

Compared all 46 scoped product entries in the new snapshot manifest to current source: **zero differences**. Scope covers Dart lib, app Android source, assets, Pub manifest/lock and app Gradle configuration. `final-review3-sweep1.json` records the timestamp, count and APK identity. Product identity was stable for this sweep.

## Sweep 2 — fresh identity check and raw regression evidence

In a separate tool pass, re-read the build/test evidence and independently rehashed the same delivered APK and the same 46 product entries. **APK unchanged; zero product differences**, recorded in `final-review3-sweep2.json`. Read the source diff from the preceding snapshot: main.dart adds only `androidNotificationIcon: 'drawable/aggregator_notification'`; the corresponding new drawable is packaged and decoded above. No auth/account/media-ownership source change is implicated by this final repair.

Inspected the new snapshot logs: analyzer reports no issues and all **33 unit/widget tests passed**. These are verified saved execution logs, not tests rerun by this reviewer. Read `apk-final.json`: it binds to this exact APK hash, reports no bundled programme media or defined credential-pattern candidates, and scans 228912774 uncompressed bytes. The integrator ran this payload scan; this reviewer inspected the report and checked its artifact binding.

Parsed raw XML results, saved as `final-review3-test-evidence.json`:

- `guest-20261016-061539`: three runs, two tests each, zero failures/errors; guest attribution/media and existing-rendition initialization/seeking.
- `reader-20261016-061838`: three runs, three tests each, zero failures/errors; discovery/Back, text/reduced motion, unavailable recording.
- `member-20261016-054848`: three runs, one test each, zero failures/errors; approved handoff, taxonomy and durable data. Prior browser report inspection explicitly identifies desktop-browser-assisted approval, not same-device Chrome.
- `endurance-20261016-055216`: three tests, zero failures/errors; recorded rendition checks, transition/full-recording endurance and guest media checks.

These instrumentation results **precede the final notification icon APK** and use test entrypoints. Member and endurance evidence also precede the short-screen layout repair. Unchanged relevant auth/media source supports bounded relevance, but these records are not whole journeys rerun on the final main-entry APK. The integrator's final main-APK controls/captures remain separate evidence. The two sweeps here do not convert older instrumentation into final-artifact device tests.

## Outcome and unresolved gates

No new source/artifact-demonstrated P0/P1 was found in these two bounded sweeps. Actual package notices, loopback configuration, notification drawable and source consistency were checked against the final identified artifact. No claim of exhaustive security testing, owner acceptance, physical-device/iPhone verification, same-device browser approval or subjective listening is made. Full transitive notice coverage, root npm high findings, measured profile-performance failure and earlier documented SQL expiry-under-lock-wait limitation remain tracked. This local debug APK is not production release authorization.
