# Web and Flutter local closeout — 16 October 2026

Status: delivered local implementation candidate with explicit incomplete acceptance gates. This record does not grant owner acceptance or production release. The criterion-level record is acceptance.json (local-only evidence: `../engineering/flutter-closeout/acceptance.json`); historical failed attempts remain in [the defect log](FLUTTER_CLOSEOUT_DEFECTS.md).

Frozen main-entry APK: `output/flutter-closeout/aggregator-local-demo.apk`, SHA256 `48806fb446eaa6ae8f0bdbf5b8ba99a2db62d3a56185871e0caa88fb14fc23c0` (see candidate.json for exact bytes). It was built from a clean source directory with unchanged lockfile, clean format/analyzer and33 passing unit/widget checks. This stable copy is distinct from the build-directory APK overwritten by instrumentation. All23 renditions/93 original asset files match their baseline bytes. See candidate identity (local-only evidence: `../engineering/flutter-closeout/candidate.json`), clean reproduction (local-only evidence: `../engineering/flutter-closeout/native-repro.json`) and [actual APK review](flutter-closeout-final-security-review3.md).

## Delivered implementation

The existing web newspaper and its owned services are preserved. Short-height web Clips now keeps a useful centered portrait picture, with scrolling controls rather than shrinking the picture to an unusable thumbnail. Existing category/search newspaper, controls, hierarchical interests and paper turn remain in the actual pages.

`apps/mobile/` is a Flutter widget application, not a WebView. Home, Radio, Newsroom, Clips and Library are primary destinations. It reads the real 24-story API and streams the existing 23 rendition catalogue. Articles provide selectable standard/brief text, inline illustrations, claim-linked citations and full original-source bibliography. Home category/query intersection and pagination use the existing edition API.

Radio uses one persistent AudioService/just_audio owner, physical cabinet controls, directly operable volume/chapter faces and preview-before-commit chapter selection. Prepared video owns its sound and clock; Clips has finite picture-swipe paging, button alternatives, captions, sources and paused return. Saved playback speed is applied to actual players; Newsroom uses saved anchor/treatment preferences unless an exact recording was requested. Missing explicit recordings show an unavailable state instead of silently playing something else.

Native captured-mail sign-in uses the reviewed browser approval plus one-use S256-bound handoff, secure platform storage and restricted bearer transport. It does not fabricate Origin, accept role headers or bypass browser CSRF. Native interests, preferences, bookmarks, queue and opt-in listening history use existing member services. Retained PostgreSQL on55441 received additive migration0012 only after backup/clone/rollback and preservation checks. Original migration history and private pipeline remain intact. Staff/MFA stays paused.

## Evidence and limits

- Root unit/typecheck/lint/build/worker checks passed. A secret scan initially matched93 content-addressed media keys; a narrowly reviewed path-and-value exception was added after verifying every key against its own asset hash. The canary and rerun passed. CI configuration was checked locally; hosted CI was not run.
- Web ten-script regression and bounded Chrome/Edge/Firefox/WebKit checks passed. The unchanged7ms callback p95 gate failed around7.3–7.5ms; the older CPU4 popup issue remains open.
- Native guest/catalogue repeats exercise real pointer faces, root ownership, all23 recording initializations/seeks, sleep boundary and saved playback defaults. Reader/member final repeated journeys are recorded separately in their actual output folders; a build alone is not their acceptance.
- Pre-layout-repair endurance `endurance-20261016-055216` passed all3 tests in12m56s:20 route exits,20 Clip transitions, full330.975-second Radio,148.566-second solo and157.275-second duo playback. This uses the instrumentation entrypoint before the final picture-size-only repair; playback/lifecycle code was unchanged. It is not identical main-APK bytes. Earlier intermediate passes and the failed logout setup remain preserved.
- Reader `reader-20261016-061838` passed3 fresh runs of3 tests each: real category/query intersection, exact standard/brief bibliography, Sources jump, Back context, explicit unavailable recordings and2×text/reduced-motion routes. Member `member-20261016-054848` passed3 actual assisted approval/onboarding/Save/preference-conflict/refetch/removal journeys. Independent reviewers read the actual XML and browser results.
- Actual profile-mode emulator measurements failed the unchanged raster frame budget. `native-profile.json` identifies the measured intermediate APK and scenario; these are not physical-device timings, decoder dropped-frame counts or input latency.
- Assisted native sign-in used real desktop Chrome confirmation/approval and Android callback delivery. Same-device Android Chrome first-run agreements are a separate owner action. SDK licence acceptance does not accept browser terms.
- Independent AI reviewers inspected source and actual captured frames. Repair reviews are distinguished from final unchanged-candidate sweeps. Silent recordings and frame inspection do not establish subjective listening or owner motion acceptance.

## Reproduce locally

Run commands from `E:\Hale\Coding\Personal\aggregator`. Reuse the owned running stack; do not start another supervisor. If it is stopped, `./scripts/npm.ps1 run demo:start` is the existing guarded startup. Web is http://127.0.0.1:3000, API4000, supervisor4301, captured mailbox8025, retained PostgreSQL55441.

```powershell
./scripts/mobile-loopback.ps1 -Device emulator-5554
./scripts/mobile-demo.ps1 -Device emulator-5554
./scripts/mobile-test.ps1 -Suite guest -Repeats 3 -Device emulator-5554
./scripts/mobile-test.ps1 -Suite reader -Repeats 3 -Device emulator-5554
./scripts/mobile-test.ps1 -Suite member -Repeats 3 -Device emulator-5554
./scripts/mobile-test.ps1 -Suite endurance -Device emulator-5554
```

Instrumentation overwrites the intermediate APK. Run `mobile-demo.ps1` afterward to install/build `lib/main.dart`, retaining application data. APK location: `apps/mobile/build/app/outputs/flutter-apk/app-localdemo-debug.apk`. Only selected-device3000/4000/8025 loopback forwarding is used; no workstation LAN exposure or database forwarding.

For Flutter checks, dot-source `./scripts/flutter-env.ps1`, enter `apps/mobile`, then run `flutter analyze`, `flutter test`, and `dart format --output=none --set-exit-if-changed lib test integration_test`. SDK/Gradle/Pub/temp caches are scoped as documented in `apps/mobile/LOCAL_DEMO.md`. `scripts/mobile-repro.ps1` is a separate clean-project/shared-cache reproduction check; its result must be read before claiming success.

## Remaining release and human gates

Root npm audit retains11 high findings. Native bounded OSV review of110 Pub packages and82 resolved Maven coordinates returned no matches; this is not a complete security/legal certification. Guava33.3.1-android and JUnit4.13.2 constraints and notices are included.

Physical Android, real headphones/interruption/battery behavior, TalkBack, subjective listening, owner design/motion acceptance, native Figma edits, iOS build and iPhone checks remain separate unverified gates. iOS source/configuration is supplied, but Windows cannot establish an Xcode build. Production startup/signing, store submission, external email, real ingestion and publication remain disabled or unauthorized. No media regeneration, catalogue bundling, reset, commit, push, upload or deployment is part of this run.


## Final main APK inspection and delivery identity

The last product change only replaces the default Flutter notification icon with a dedicated monochrome newspaper resource. The final clean project snapshot is `.cache/flutter-repro-20261016-062708`: offline locked dependencies, format, analysis,33 unit/widget tests and normal main APK build all passed. Guest061539 and reader061838 each passed three repeats after the Clip geometry repair; member054848 passed three assisted account journeys. Those instrumentation APKs precede the notification-only change; they are not byte-identical to the delivered APK. Two separate final security/artifact sweeps inspect the exact final APK; bounded visual/evidence review is separate from complete journey reruns.

Actual normal-app checks verified connection failure after removing only selected-device API forwarding, recovery through Retry after restoring forwarding, background Radio beyond60seconds and notification Pause/Resume at the same position. These first checks used the0ee4 predecessor. Final48806fb notification branding and Pause were retested. `output/flutter-closeout/android/final/` contains actual captures, sanitized media states, an uncut final interaction recording and the35.181-second final Next/Previous turn recording. Silent recordings and extracted frames do not establish normal-speed viewing or listening acceptance. The browser tool rejected local-file video playback; this was not bypassed.

Install the delivered stable APK without rebuilding or clearing member data:

```powershell
./scripts/mobile-loopback.ps1 -Device emulator-5554
& C:/Android/Sdk/platform-tools/adb.exe -s emulator-5554 install -r output/flutter-closeout/aggregator-local-demo.apk
& C:/Android/Sdk/platform-tools/adb.exe -s emulator-5554 shell am start -n test.example.aggregator.aggregator_mobile.localdemo/test.example.aggregator.aggregator_mobile.MainActivity
```

These exact install/launch commands succeeded. No programme render command is needed: all23 renditions/93 original files remain byte-identical. Final capacity check: C83.25GiB, E206.34GiB free. The delivered APK is a local-demo debug build. The criterion-level register intentionally retains partial coverage, failed performance and unverified human/platform rows; this is not completion of every acceptance criterion.
