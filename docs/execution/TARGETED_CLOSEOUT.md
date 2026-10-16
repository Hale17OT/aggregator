# Targeted closeout — 16 October 2026

Delivered at the bounded checkpoint, with open defects and review gates below. This ledger distinguishes implementation, test results, artifact inspection and owner approval. Current evidence root: `output/targeted-closeout-20261016/`. Staff/MFA stays paused. No media regeneration, migration, retained-data reset, external delivery or release authorization.

## Defects and supported causes

1. **Original normal-main media/caption incident: OPEN, not explained.** Prior `native-recording-failed-load.mp4` shows the failure after a vertical item change and recovery through Retry. The available old log does not identify the failed HTTP/video/caption stage. Passing retries and separately reproduced races do not establish its cause.
2. **Separately reproduced native races: repaired; 52 unit/widget tests and three actual-service targeted runs passed.** The mounted player lacked item/revision update handling; late error handling checked mounted but not the active attempt. Controller/binding/generation guards now cover initialization, captions, speed, restore and readiness. Captions and initialized video must both be ready before presentation. Retirement detaches ownership, cancels its caption request/body and disposes its own controller. Global bounded stage diagnostics contain sanitized IDs/status only. Pending/active ownership epochs prevent stale retirement from cancelling a successor or Radio. Permanent caption denial does not advertise blind Retry. Video plugin HTTP classification remains limited.
3. **Newsroom narrow settings overflow: repaired and verified in the bounded browser checks.** Nonwrapping transport and unconstrained tooltips caused 367px document width at 320px. Toolbar/settings wrap; narrow screens place controls below the picture with intact targets and focus. Twelve initial stress cases passed after a second tooltip repair. Independent review found the central Play anchor depended on the expanded controls height; a separate picture wrapper now anchors it. Final built verification passed: original broadcast regression, twelve exact measured-font 2x/long-label/focus cases plus actual fullscreen entry/exit, and twelve matched stress captures in reflow-after-3.
4. **Native unnecessary Clips rebuilds: candidate 1 implemented.** Previously ProgrammeVideo's outer ValueListenableBuilder rebuilt the entire ClipSurface for every controller notification. Clips now sits outside it; selected-value listeners update play/mute state, active caption text and progress. Static metadata/action/navigation widgets remain stable on clock-only changes. A red/green widget identity test verifies 20 ticks. Theme/member/seek state remains reactive. Long-form Newsroom still has its separate dynamic builder; no whole-app zero-rebuild claim. Three matched repeats per artifact completed: median UI p95 1.464→0.786ms, raster3.236→3.658ms. Candidate1 retained for UI benefit; raster worsened0.422ms. Original mixed raster gate remains failed.

## Verification ledger

- `.cache/targeted-tests6.log`: 52 native unit/widget tests passed; `.cache/targeted-analyze7.log`: clean analyzer. These include both completion orders, stale A/B responses, Retry, permanent caption denial, retired ownership, successor ownership and actual stream-subscription cancellation. Stream test uses a fake HttpClientResponse with a real StreamController, not an HTTP socket.
- `evidence/reflow-before`, `reflow-after`, `reflow-after-2`: failure retained; 12 after-2 cases passed. Nested 200% CSS stress compounds inherited sizes; it is not OS/browser zoom certification.
- Native targeted instrumentation attempts 1/2 failed an immediate route-exit assertion before transition completion. Attempt 2 accidentally retained the same assertion due to an ineffective helper replacement. Both failures preserved. The corrected harness waits for actual route removal before asserting ownership, without changing product behavior.
- Preservation-before: verified PostgreSQL55441 identity and 12 migration checksums; 23 renditions/93 hashes; both original APK hashes; retained member-row digests. Session/progress changes excluded as legitimate activity.
- Independent security and web source/image reviews are in adjacent `targeted-independent-*-review.md` files. They are separate reviewers, not owner approval.

## Brand supplement

The explicitly authorized parallel asset task provides an original simplified masthead-derived A, web favicon/touch/social/loading assets, Android launcher/splash and iOS source assets. See `docs/design/BRAND_SYSTEM.md` and run-root `brand/`. Existing newspaper masthead and media are unchanged. Installed Android inspection and owner approval remain separate; iOS build is not verified.

## Open gates

Original unexplained incident; existing web callback 7ms/CPU4 failures; native raster budget; physical Android; TalkBack; normal-speed watching/listening blocked by available tool policy; owner approval; native Figma; iOS. Recordings and sampled frames are not listening or motion approval. Native chooser opening is not delivery or recipient receipt. Production release remains unauthorized.

## Additional verified results

- Three targeted native runs in `instrumentation/targeted-20261016-174322`: all six actual recordings, delayed old A error after B/new A, explicit Retry, twenty route exits per run, one video and no obsolete ownership. The injected adapter delays already-fetched caption completion; it is not an assertion about the historical incident. The diagnostic ring bound is checked; exhaustive heap/leak analysis is not claimed.
- Root41 tests, typecheck, lint and production build passed; owned web restarted after build. Original Newsroom regression, three web Clips journeys, web negative cases, three actual member Save/Unsave/failure journeys, reader SSR/browser checks and programme handoffs pass. Radio face pointer/touch/keyboard regression passes after correcting its obsolete Read label. Shared-control regression passes after replacing its removed Desk-dropdown expectations with current newspaper semantic category/search GET contracts. The original failures and original copied harnesses remain in checks/*-1; repaired checks are *-2. No product behavior or performance thresholds were weakened.
- CI static validation passed; no hosted CI run occurred. Secret scanner canary/redaction passed, but raw scan **FAILS with eight findings**: four SHA256 file fingerprint entries in prior final-artifact metadata duplicated in preserved baseline. All eight match the actual referenced current files byte-for-byte. Classification and redacted raw report are preserved. No scanner exemptions were added. The prior scan report remains historical; it must not be cited as this run's pass.
- Native test harness third attempt completed its cycles but checked an early obsolete event after it had been evicted from the deliberately bounded100-entry ring. The assertion was moved immediately after the stale-response scenario; no production ring-size change. Original failed attempt retained.
- Baseline native tall-paused.png actually captures the initial loading spinner; use picture-paused.png for its ready paused state. Final capture helper now explicitly waits for the actual Play control before its initial paused capture; the original evidence is not overwritten.

## Stronger-oracle repetitions (retained attempts)

The three earlier targeted passes used a weaker playback clock predicate. A later harness requires isPlaying plus a fresh 300ms advance, identifies the exact old caption attempt, and checks the expected clip. Its first run stopped at the eighteenth cycle: attempt22 had completed both video and captions and retired; there was no attempt23 before the timeout. This is an unresolved route/catalogue-stage failure, not evidence that a caption request failed. A diagnostic reproduction is pending. Android decoder disposal warnings occurred, but without a new initialization they do not establish the timeout cause.

Three later short-form runs pass with explicit actual playback advance and source/article/More arrival/removal checks (`.cache/targeted-native-shortform3.log`). Earlier failures of picture-pause and sheet-readiness assertions are retained. Additional expected-item/paused assertions were added afterward and require a fresh run before being counted.

## Independently reproduced catalogue transport defect

The diagnostic rerun (`targeted-20261016-182753`) displayed FailureView before creating a PageView/controller. The following run (`targeted-20261016-183314`, failure7-stages.txt) classified the actual exception as CONNECTION_CLOSED_BEFORE_HEADERS on the catalogue GET. This supports a pre-header transport close, not a caption parse failure or PageStorage mismatch. The exact reason the connection closed (including an idle-pool race) is not established.

`data.dart` now permits one fresh isolated-connection retry only for that precise HttpException on GET/no-body reads and caption reads, conditional on current identity/cancellation. Writes, HTTP denials, unrelated failures and obsolete/cancelled work do not use it. The fresh client closes in finally. No server/security configuration changed. A real loopback server test destroys the first socket before headers then returns content; bounded/cancelled/denied cases are separately tested. `.cache/targeted-tests7.log`: 56 passed. Analyzer initially found one brace-style issue; repaired, final clean result is recorded separately. The original normal-main incident remains OPEN because its old logs do not identify this transport failure.

The repaired stronger targeted journey passed **three consecutive runs** in `instrumentation/targeted-20261016-184019` (`.cache/targeted-native-integration8.log`). Each covers six real clips, exact obsolete-attempt rejection, explicit caption Retry, fresh playing clock advance, twenty route exits, paused arrival, one video and no retired ownership. Earlier failing runs remain. This verifies the current repair under that workload; it does not retrospectively establish the original recording's cause. `.cache/targeted-analyze9.log` is clean.

The final stronger mixed short-form journey also passed **three consecutive runs** in `instrumentation/shortform-20261016-185401` (`.cache/targeted-native-shortform4.log`). It includes actual playing clock advance, picture tap, swipe, seek, Sources/story/Back, More, expected item and paused-state assertions across twenty changes. Artifact JSONs explicitly identify the instrumentation entrypoint and hash. This is not a claim of three runs of every register case or of the final normal-main binary.

## Native member follow-up failures

Three pre-handoff attempts failed and were retained (`targeted-native-member*.log`, corresponding instrumentation/member folders). The third reported pre-header closure, but its original lastFailure field lacked per-operation correlation; that diagnostic is consistent with, not conclusive proof of, the sign-in request cause. Writes now use a fresh scoped connection and execute once, never automatic retries. Read retry behavior is unchanged. Final diagnostic storage is one sanitized status/code record with a safe operation category and request sequence, without URLs, credentials or payloads.

The fresh-write attempt proceeded through actual captured-mail approval and created a native session, then a protected follow-up returned503 and the test timed out on Sports. PostgreSQL's19:20:28 error records a lock timeout while lookup_fixture_session locks the users tuple; no lock timeout or security gate was changed. This failure is retained and distinct from the original media incident. A bounded final member attempt follows. The earlier three media repetitions predate only fresh-write isolation and diagnostic changes; they must not be described as three tests of the later exact main APK.

The bounded final member attempt **passed** (`instrumentation/member-20261016-192530`, `.cache/targeted-native-member5.log`). It used actual captured-mail approval, native handoff, durable owned interests/member operations and normal sign-out. Desktop-browser assistance is not same-device Android Chrome verification. The earlier connection/503 attempts remain failures; one later pass does not resolve the intermittent account-row lock timeout. Final Flutter unit/widget suite: **57 passed** (`targeted-tests10.log`); analyzer clean (`targeted-analyze12.log`).

## Matched profile protocol and failed setup

The initial three baseline timings did not verify matching account state and are diagnostic only. `final-matched/before-1` and `matched-retry/before-1` then failed the playback-before30s requirement: the actual cold-start/audio-handler/UI-tree sequence consumed the startup window. Those attempts are retained and are not valid before/after measurements. The old emulator zero-frame gfxinfo sentinel is likewise not timing evidence.

The revised **playback-matched** diagnostic copies preserved baseline Dart source and current Dart source into separate workspace snapshots, using the identical `scripts/profile-playback-entry.dart` template in both. Both use current unchanged Android/platform assets and package locks. This measures first actual playback +30–45s after a30s playback warm-up, independently of cold launch; cold first30s playback samples are also retained. A100ms state observer is identical in both artifacts and is removed with the timing callback at completion. Any observed playback interruption rejects the comparison. Three repeats per artifact, same first56.375s clip, guest UI,1080×2424/density420/font1/Android36 emulator; no simultaneous build/browser/recording. UI and raster p95 remain separate;16.7ms budget is unchanged. This narrower playback diagnostic does not clear the historical mixed-workload gate or certify physical hardware. Full source snapshot hashes are in `profile/playback-source-manifest.json`.

That first playback series also failed setup: repeat1 recorded96 non-playing observer samples, and repeat2 produced Android's **Process system isn't responding** dialog (`profile/system-anr.png`, retained UI XML). No valid comparison was claimed. The owned Aggregator_Local process was shut down through `adb emu kill`, its exit verified, then the same workspace AVD was cold-started with `-no-snapshot-load` (no wipe/reset, no duplicate). Scoped forwarding was restored. A new `playback-restarted` series uses the same two already-built profile APKs and unchanged timing/budget criteria; failed pre-restart evidence remains intact.

The restarted setup exposed an independent measurement-harness problem: UIAutomator's idle query repeatedly timed out during moving video, then observed the already-ended recording. `playback-restarted/before-1` is retained as failed setup. Final `playback-noidle` uses the same binaries/template/budget but runs no UI-tree queries during playback. Actual accessible Play is located/tapped beforehand; the diagnostic starts only on the real controller's isPlaying state, emits after45s and rejects observed interruptions. UI-tree checks still verify guest state and the ready actual clip before input. This is a measurement-overhead correction, not a weaker playback test; real gesture/paused-state coverage remains in the separate integration/main captures.

### Measured decision

`profile/playback-noidle/comparison.json`: all six repeats completed with zero observed interruptions. UI p95 repeats before **1.464/1.547/1.360ms**, after **0.777/0.786/0.845ms**; median1.464→0.786ms. Raster before **3.236/3.357/3.083ms**, after **3.658/3.563/3.778ms**; median3.236→3.658ms. Candidate1 is retained for repeatable UI benefit and directly verified static-widget isolation, with the **+0.422ms raster increase explicitly retained as an adverse measurement**, not a raster improvement. All samples fit16.7ms in this narrow workload; the old mixed-workload raster FAIL and web callback/CPU4 limits are not cleared. No second optimization candidate, broad paint rewrite or reduced media quality was introduced.

### Final review repair

Normal-main candidate1 SHA256`4f68806fb50f0a760ee4488d560b124dacc2caeae25cbf417b091413e009ff78` and its captures remain preserved. Independent final image review found a concrete low-contrast Retry/icon on the dark Clips failure surface. FailureView now accepts the actual surface foreground; catalogue and programme errors explicitly supply white for Clips, including when the account's paper theme is light. The error icon, text, Retry label and border remain legible without layout/control redesign. Two theme regressions assert text contrast≥4.5 and real Retry activation. Final suite59PASS (`targeted-tests-r2-fixed.log`), analyzer clean (`targeted-analyze-r2-final.log`). An initial wrong Radio call-site edit failed compilation and a later brace-style finding are retained in the earlier r2 logs; both repaired before APK generation.

The final normal APK uses revisionr2 paths. Profile binaries predate only the launcher-label and error-foreground changes; successful playback rendering/selection code is unchanged, but profile artifacts are not relabelled as the final main binary. The actual launcher label's inherited mojibake was repaired to `The Aggregator - Local`; package/signing identity stayed unchanged. Installed launcher/splash captures are actual OS surfaces, not the asset preview or an imposed startup timer.


## Final delivery and unchanged-candidate review

Final normal `lib/main.dart` localDemo debug APK: `output/targeted-closeout-20261016/main/aggregator-targeted-local-demo-r2.apk`, SHA256 `ed68ceb0f00cbddb5e33a8983aaac6d1141567b8e276dba1fe2e370be0eaa8e1`. In-place install and pulled installed APK match; no data clearing. Final preservation and artifact audits are `preservation/preservation-after-r2.json`, `final-fingerprints-r2.json` and `final-artifact-audit.json`. All23/93,12 migration checksums, prior member-row digests and493/488 APKs preserved. API catalogue IDs match; APK contains no programme media. Capacity at closeout: C80.12GiB/E197.64GiB free.

Final full-viewport native recordings: `evidence/native-after-r2/interaction-uncut.mp4`110.9294s and `evidence/native-retry-after-r2/interaction-uncut.mp4`59.984856s. Both have no audio track. Explicitly induced loss of owned4000 loopback forwarding produced a visible error; restoring forwarding and real Retry recovered the same item paused, then deliberate Play advanced it. Forwarding restored. This does not reproduce or explain the original493 incident.

Fresh desktop journey: `evidence/web-journey-after-r2/`41.84s uncut1280×720 WebM with actual Play, picture pause, next, drag seek, Sources/Back, article/Back, More and final paused state. Assertions and full-viewport PNGs are in that folder. The earlier4.24s recording is retained and is not labelled a full walkthrough. Recordings are not normal-speed watching or subjective listening; tool-policy limitation remains. Actual source modal still and prior full-frame states inspected.

Final review sweep1: parent read-only installed/source/build/catalogue/asset audit and test-log review. Sweep2: independent reviewer inspected r2 installed identity and actual failure/recovery/2× transcript stills, confirming the prior dark-on-dark Retry defect repaired; parent also inspected final desktop still. Source/security reviewer independently reviewed transport/member evidence. These are bounded reviews, not repeated complete device journeys or owner acceptance. See adjacent independent review files.

### Verified build, install and local launch commands

Run from repository root in PowerShell. Owned services are already running; do not start a duplicate supervisor.

```powershell
. ./scripts/flutter-env.ps1
Push-Location apps/mobile
flutter test
flutter analyze
flutter build apk --debug --flavor localDemo --target lib/main.dart --dart-define=LOCAL_DEMO=true --no-pub
Pop-Location
./scripts/mobile-loopback.ps1 -Device emulator-5554
& C:/Android/Sdk/platform-tools/adb.exe -s emulator-5554 install -r output/targeted-closeout-20261016/main/aggregator-targeted-local-demo-r2.apk
& C:/Android/Sdk/platform-tools/adb.exe -s emulator-5554 shell am start -n test.example.aggregator.aggregator_mobile.localdemo/test.example.aggregator.aggregator_mobile.MainActivity
```

Root tests/typecheck/lint/build ran through `./scripts/npm.ps1`; `run demo:restart-web` replaced only the owned web after its build. Browser checks never ran while replacing the served build. `.cache/run-targeted-main-r2.ps1` records the actual build/copy/install/capture sequence. Named immutable browser runs use `node scripts/run-targeted-check.mjs check-shortform.mjs 1` (existing run1 now intentionally refuses overwrite). Final desktop recording command: `. ./scripts/stability-env.ps1; & $aggregatorNode scripts/capture-targeted-web-journey.mjs after-r2` (also refuses overwrite). Profile command uses `scripts/measure-targeted-native.ps1 -PlaybackWindow -Series playback-noidle`; diagnostic APKs and failed setup attempts remain distinct. No rendering command was run in this pass.

Stop at this checkpoint. Original unexplained incident, account lock-timeout intermittency, historical performance gates, raw classified scan findings and unavailable human/platform reviews remain open. No production release or owner acceptance is implied.
