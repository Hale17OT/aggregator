# Short-form corrective pass — 16 October 2026

The actual web and Flutter Clips shells have been corrected. Owner visual approval is pending; functional results are not visual acceptance. See [48-case register](SHORTFORM_ACCEPTANCE.md), [repair ledger](SHORTFORM_REBUILD_DEFECTS.md), [reference analysis](../design/SHORTFORM_REFERENCE_AND_GAP.md), and single owner packet (local-only evidence: `../../output/review/shortform-rebuild.html`).

## Delivered implementation

Web /clips and native Clips now use a route-specific dark media canvas, contained centred portrait, compact playback/mute controls, separate vertical clip navigation, Save/Sources/Share/More rail, concise story metadata, protected captions and thin interactive progress. Home/articles retain their newspaper identity. Original media/controller ownership, Radio knobs, Newsroom long-form controls, account services and migration 0012 remain intact. Sources/More/story/system actions pause; real gestures and keyboard alternatives operate existing players. Save uses existing member repositories with owner/context guards. No fictional social counters or delivery claims.

Native More navigation wraps at enlarged text; compact captions scroll and the transcript remains available. Web caption checks cover all six clips at opening/middle/end and desktop/phone sizes, including action occlusion checks. Full portrait containment means embedded source graphics are small on very short screens; this is documented rather than hidden by cropping.

## Artifact and preservation

New main-entry localDemo debug APK: output/shortform-rebuild/aggregator-shortform-local-demo.apk. SHA256 493da1c98c960c15e4174cdb889e761ee96a1c864e491a695f48b8fb22e94ce8. Installation uses adb install -r, without uninstall/data clearing. Installed base.apk is pulled and fingerprinted in after/native/installed-identity.json. Instrumentation and profile builds are different artifacts, not byte-identical main-build tests.

Original output/flutter-closeout/aggregator-local-demo.apk remains SHA256 48806fb446eaa6ae8f0bdbf5b8ba99a2db62d3a56185871e0caa88fb14fc23c0. Intermediate failed/reviewed candidates remain separately named. final-artifact.json records source, lockfile and served web-build fingerprints. Preservation manifests verify all 23 renditions/93 original assets, PostgreSQL system identifier/12 migration checksums, and pre-existing retained member-row digests. New example.test test accounts are additive. Sessions/playback progress legitimately change and are not claimed immutable.

Capacity at final repair: C:80.85 GiB, E:202.26 GiB free. Owned loopback services are reused; no duplicate supervisor or retained-data reset.

## Verification scope

- Root 41 tests, typecheck, lint and web build pass. Native 39 unit/widget tests pass; analyzer clean. The new More regression actually opens and scrolls the enlarged-text sheet. Initial lazy-list test setup failure is retained.
- Three web mixed journeys: actual play clock, picture tap, keyboard item change, pointer seek, source sheet and paused article Back. Three captured-mail member journeys verify Save/Unsave/API readback, Library sharing and honest failed-write feedback. Negative tests verify rejected play, scrub cancellation, share cancellation, finite end and 20 item/20 route lifecycle counts.
- Native three repeated core journeys use actual media, Radio ownership, picture tap/swipe/seek, sources/article Back and 20 clip transitions. One assisted real-member journey verifies interests/preferences/conflict handling and Clip Save/Unsave API readback. That assisted desktop-browser handoff is not same-device Chrome approval or three repetitions of every acceptance case.
- Six existing web regression scripts pass: reader, shared controls, programme handoff, actual Radio knobs, retained member demo and chevrons. Newsroom's refreshed test opens its real settings disclosure, then FAILS the existing 320px overflow assertion. This is retained as an open long-form reflow defect.
- Main APK full-viewport captures/uncut input recording are separate from integration results. 54 web cue captures check full normal-size cue fit, metadata separation and unobstructed actions. Actual native tall/compact/landscape, enlarged caption scrolling, More/transcript, sources and system chooser are supplied.
- Bounded APK payload scan finds no matches for its three credential patterns and no bundled programme files. This is not comprehensive security certification. Existing dependency findings remain unresolved.

Raw reports: output/shortform-rebuild/verification; output/flutter-closeout/android; docs/engineering/shortform-rebuild. Original failed attempts remain in .cache logs and candidate capture folders.

## Performance and remaining acceptance

The unchanged web 7ms callback gate, CPU4 popup issue and native mixed-workload raster failure remain OPEN. A matched single-emulator profile comparison of original source versus the pre-final More-wrap candidate measured warm UI p95 13.781→10.293ms and raster p95 44.316→37.723ms; both raster results fail 16.7ms. Earlier runs varied substantially. This is diagnostic evidence, not causal attribution, final-main timing or gate clearance. Android gfxinfo returned zero Flutter frames and was rejected as invalid timing evidence. Native static content still rebuilds with controller progress.

Native system sharing reports chooser opened/delivery unverified; selection versus cancellation is not distinguished. Tiny embedded text on short screens, complete theme/background/error permutations, physical Android, TalkBack, subjective listening, native Figma, iOS and owner visual approval remain pending. Local recording playback inspection was blocked by tool policy; recordings and sampled frame inspection do not establish normal-speed watching/listening. No claim of complete visual/motion acceptance or release readiness.

## Verified commands and local demo

Run from E:\Hale\Coding\Personal\aggregator in PowerShell. Existing services are already owned and running. If stopped, use the guarded existing `./scripts/npm.ps1 run demo:start`; never launch another supervisor. Routes: http://127.0.0.1:3000/clips, /, /radio, /newsroom, /library. API :4000; captured mailbox :8025; supervisor :4301; retained PostgreSQL :55441, all loopback.

```powershell
./scripts/npm.ps1 run build
# Wait for successful completion before restarting the served web build.
./scripts/npm.ps1 run demo:restart-web
. ./scripts/stability-env.ps1
& $aggregatorNode scripts/check-shortform.mjs
& $aggregatorNode scripts/check-shortform-failures.mjs
& $aggregatorNode scripts/check-shortform-member.mjs
& $aggregatorNode scripts/capture-shortform.mjs after
& $aggregatorNode scripts/capture-shortform-captions.mjs
& $aggregatorNode scripts/check-shortform-preservation.mjs after
. ./scripts/flutter-env.ps1
Push-Location apps/mobile
flutter test
flutter analyze
flutter build apk --debug --flavor localDemo --target lib/main.dart --dart-define=LOCAL_DEMO=true --no-pub
Pop-Location
./scripts/mobile-test.ps1 -Suite shortform -Repeats 3 -Device emulator-5554
./scripts/mobile-test.ps1 -Suite member -Repeats 1 -Device emulator-5554
./scripts/mobile-loopback.ps1 -Device emulator-5554
& C:/Android/Sdk/platform-tools/adb.exe -s emulator-5554 install -r output/shortform-rebuild/aggregator-shortform-local-demo.apk
& C:/Android/Sdk/platform-tools/adb.exe -s emulator-5554 shell am start -n test.example.aggregator.aggregator_mobile.localdemo/test.example.aggregator.aggregator_mobile.MainActivity
./scripts/capture-shortform-native.ps1
```

The selected project AVD is Aggregator_Local with ANDROID_AVD_HOME pointing to the workspace .cache/android-avd. Do not substitute/wipe another device. No new media rendering commands were run.

Next action: owner/device review of the supplied packet and explicitly scoped remaining defects. Staff/MFA remains paused; private drafts and release gates remain intact. No commit/push, paid service, live ingestion, external email, upload or deployment.

Final evidence limits: the initial same-pass web before screenshots were accidentally overwritten by a missing capture-phase argument. The packet labels preserved earlier closeout baseline images instead; exact same-pass matched before/after imagery is incomplete. Final main recording also hit one media/caption-load failure after navigation; actual Retry restored the same clip, but the cause remains unresolved. Both are retained in the defect ledger. Final web capture command is `scripts/capture-shortform.mjs after`.

Final unchanged candidate checks: main APK installed base hash equals493da1c98c960c15e4174cdb889e761ee96a1c864e491a695f48b8fb22e94ce8. Final capture rerun completed successfully; paced desktop recording32.08s and native uncut recording129.95s (container-probed, not assumed from requested recording limit). Actual 2× More capture shows wrapped Previous/Next without the earlier overflow stripe. Three final native core runs are in shortform-20261016-163008; final web build8 mixed/member/negative/cue checks pass. Lint passes after removal of an unused test-script global declaration; failed lint log retained.

Changed product components: apps/web/app/app.vue, components/AppAudioHost.vue, components/ControlIcon.vue, components/ClipFeed.vue, pages/clips/index.vue and pages/clips/[id].vue; apps/mobile/lib/main.dart, players.dart and shortform.dart; Android MainActivity local system-share adapter. Test/capture/preservation/report scripts and native review/integration tests support the changes. No API/schema/media source changes are required by this pass.

Final review closure: two independent bounded web visual sweeps, two final native artifact/capture sweeps, and two unchanged493da1 source/security/evidence sweeps are recorded in shortform-visual-review.md and shortform-final-security-review6/7.md. These are not full manual journey reruns, normal-speed watching, listening or owner acceptance. Final route/API returned200; emulator restored to1080×2424/font scale1. Native screenrecord contains video/data, no audio track. To reproduce the paced desktop evidence: `. ./scripts/stability-env.ps1` then `& $aggregatorNode scripts/record-shortform.mjs`.
