# Bounded stability closeout — 13 October 2026

**Bounded closeout complete. Lower-resource UI cost remains OPEN.** All three candidate changes were reverted; the functioning application, accepted design and imported media are unchanged. Browser setup, safe execution tooling and evidence were improved. The owned retained demo remains running. No further feature phase is started.

Active brief: `docs/next-build/The_Aggregator_Stability_Closeout_and_Low_Resource_UI.md`. WP18/F30/F31 follow-up only. Staff/MFA paused; no programme generation, resets, dependency upgrade or publication.

Capacity preflight passes: C109.88GiB/E238.22GiB. Project policy reserves10GiB on C and20GiB on E, with estimated6GiB scratch. `scripts/stability-env.ps1` verifies workspace paths and scopes TEMP/TMP/browser cache to the child process. Existing owned services are healthy; no render/build/benchmark process preceded this run. No deletion performed.

Matched baseline: `output/playwright/stability/control/results.json`; unchanged17-entry catalogue, same built client/server identities, Chrome154, CPU4×,1440×1000 Light/default motion, programme time set to10s before each workload, media1×. Three independent contexts;31 actual edition/treatment popup openings each, keyboard exploration/typeahead/Escape/focus return,39 queue operations through0→5→0 entries per repeat. Current data is not reduced. Baseline warm focus-ready p95: Radio107.1/114.4/96.5ms, Newsroom76.5/64.8/78.6ms; queue next-two-RAF proxy p95 25.7/25.5/25.5ms. Focus-ready includes automation observation latency; it is not INP or compositor timing. Cold first-open is recorded separately. Queue checks include180ms to cover the150ms animation and settled state; popup close settles170ms.

Frozen candidate criterion, recorded before source edits: retain a focused change only if its target primary metric improves in all three matched repeats, with median p95 improvement at least20% AND greater than the baseline three-run p95 range. Primary queue metric: next-two-RAF event proxy; primary popup metric: warm focus-ready p95, corroborated by event proxy and trace. No material regression in non-target metrics, selection/focus/scroll/accessibility or unchanged reference gate. No moving required work outside the measured/settled interval. At most three implementation candidates; failed evidence retained and changes reverted.

Candidate hypotheses awaiting diagnostic attribution: (1) project full-depth queue persistence watch traverses data it never saves; project only ordered IDs. (2–3) reserve for trace-supported popup work, not speculative library replacement. Original reference thresholds remain discrete p95<100ms, callback p95≤7ms/p99≤11.2ms, visible-video dropped fraction<0.5%, and stable20-journey teardown.

Candidate1 tested: ordered-ID watch only. CPU4 queue p95 24.4/22.2/24.1ms versus25.7/25.5/25.5ms; median improvement5.5%, below20%. REVERTED. No claim that deep watch was the dominant bottleneck.
Candidate2: popup layout/style containment; trace showed forced style work at Popper getComputedStyle(zIndex), alongside document layout and ResizeObserver work. Test the same CSS-only isolation without changing focus, scroll locking, portal, options or animation. No size containment or state caching.


Candidate2 CPU4 popup p95 Radio108.5/115.9/103.0ms and Newsroom80.4/76.3/80.0ms; queue27.4/27.8/28.4ms. No improvement: REVERTED.
Candidate3 (final budget slot): stabilize Radio static speed/sleep option arrays. These inline arrays are recreated on parent updates and propagate new identities to unrelated select subtrees; test whether avoiding that render work materially improves queue feedback. Dynamic catalogue options and all values remain intact. Same frozen queue criterion; no combining rejected changes.


Candidate3 CPU4 queue p95 23.3/23.7/22.0ms; median improvement8.6%, below20%. Radio popup112.6/113.7/102.2ms, Newsroom75.3/79.3/75.0ms. REVERTED. Three-candidate budget exhausted. Original application sources restored; lower-resource cost remains OPEN. No framework rewrite or threshold change.

Diagnostic interpretation: separate `control-trace/trace.json` and its summary retain traced timings, not lightweight acceptance results. Warm Radio pointerdown script example80.6ms included23.5ms forced style/layout; a ResizeObserver callback added8.3ms. A21.4ms style recalculation stack resolves to Popper's `getComputedStyle(content).zIndex` during mount. The trace also contains initial document layout, so its full379-layout/557.6ms total is not attributed wholly to opening a popup. Required focus, scroll-lock and portal/positioning work stays enabled. AutoAnimate's observer/poll lifecycle patch is unchanged; the queue's low-overhead workload had no long-animation-frame entries in the matched control. Deep queue traversal and unstable static option identities were source hypotheses; their small measured improvements do not establish either as the dominant cause. Containment failed to improve required mount/focus-ready work. No claim that Reka, Vue or AutoAnimate as a whole is defective; no unsupported exact percentage split between intertwined mount/reactivity/focus work.

Compatibility setup repaired without package upgrades: installed Playwright1.64.0 CLI supplied Firefox157/revision1555 and WebKit27.2/revision2370, plus its FFmpeg1013/winldd1007 helpers, exclusively under `.cache/stability-browsers`. Used `install --no-remove --no-progress firefox webkit`; no global browser installation/dependency changes. Chrome154.0.8037.100 and Edge155.0.4283.45 remain installed consumer browsers. Official version-specific binary/path guidance: https://playwright.dev/docs/browsers.

Bounded engine results: Chrome/Edge pass reader, custom control, Radio persistence, H264/AAC start, captions/transcript, denied-video fallback and captured-mail session/logout. Matched Firefox157 also passes after the denied-asset test was isolated from a previously loaded media context; the original timeout remains archived. WebKit27.2 renders the article/four sources, custom selector/Radio persistence and H264 playback. Its inline WebM remains unready and prevents the initial full-load wait; DOMContentLoaded plus actual content checks distinguish that from missing reader HTML. WebKit media requests were not intercepted by the denied-asset route (zero intercepted requests, video ready4), so no denial/fallback result is claimed. Combined media→member smoke timed out; a fresh-context sign-in/preview/confirm/local-demo session/logout check passed separately (`stability-webkit-member.json`). No full combined WebKit journey pass or Safari/iPhone certification.

One new visibility attempt used matched headed Firefox with real tabs. It still reported visible throughout, with no visibility events; audio advanced. Background operation remains UNVERIFIED; no further retries. Manual owner check: start Radio in the normal browser, switch to a different actual tab for30seconds, return and confirm continuous audio/time; repeat with end-of-story sleep near a chapter boundary. Mobile lock-screen behavior needs its own physical test.

Control-text check passes at320px in both themes, actual keyboard operations and reduced motion, doubling computed control font sizes rather than merely changing root font-size. The initial helper incorrectly expected aria-valuenow100 instead of this dial's normalized maximum1; corrected the assertion to its declared aria-valuemax, not the application. Physical device, screen reader, subjective listening and new owner acceptance remain NOT RUN/pending. No visual redesign or new motion is retained.

Restored application identity: client SHA256 `599bb2d4bac4594b6c7a46ff9b4183de5abd9fc7fb3fb98bd7141d9d9996049a`, server-entry SHA256 `2d8cd85f2569ba4d13254866cb5be5f1ee23706afa2746e44e98621b506b31c9`; identical to the matched control and previous accepted desktop reference. The four candidate-touched/source-snapshotted files are byte-identical to control. Final CPU4 repeats: Radio warm focus-ready p95 106.6/109.8/113.3ms, Newsroom73.6/65.5/65.3ms; queue feedback p95 25.2/29.4/25.5ms. This is restored-baseline variability, not an improvement claim. Keep cold/warm/event/cadence measures separate in raw results.

## Final verification

Original unthrottled gate PASS: three repeats, dial callback p95 5.6–5.7ms/p99 10.9–11.1ms, queue p95 5.6–5.7ms, discrete two-RAF proxy p95 10.3–11.1ms. Twenty journeys stay at1,792 nodes/404 listeners, with one root audio and no abandoned video, active media, pending RAF/video callback or popup. Heap9.37→11.01MB is warm-up evidence, not total-browser memory certification. Representative solo/duo each have0/1,831 dropped frames and zero waiting in61-second visible intervals; existing files reused. Machine result: `docs/engineering/stability-results.json`.

Separate headed CPU4× repeat: Radio cold/warm focus-ready208/140.1ms, Newsroom114.8/86.2ms; queue event proxy p95 27.7ms. This is a labelled diagnostic, not a passing slower-device gate. Raw cold, warm and event measures remain in `output/playwright/stability/final-headed/results.json`.

Build/owned web restart, lint, typecheck and36 unit tests passed. Final focused regressions passed: queue3 groups; enhanced controls10; member controls6; actual dials14 and edges7; reader36 cases/12 Pretext observations; newspaper32 cases/14 journeys/four media checks; theme continuity and guest format handoffs. Captured-mail engine checks are separate from the larger historical identity/database suites, which were not repeated. No migration, reseed or API feature work. Historical reports/screenshots were copied into `output/playwright/stability/pre-closeout-evidence` before current test reports were updated. Fresh narrow dark popup pixels were inspected; no new visual design or subjective listening acceptance is claimed.

Dependency versions and lockfile unchanged. Prior root11 high and isolated speech3 high/4 moderate findings,22 notice follow-ups and release restrictions remain open; these counts are historical audit evidence, not a fresh audit. Hosted CI, physical mobile, screen reader and subjective listening NOT RUN. Native Figma remains pending.

## Verified commands and resume boundary

PowerShell from `E:\Hale\Coding\Personal\aggregator`; run heavy commands sequentially:

```powershell
. ./scripts/stability-env.ps1
& $aggregatorNode node_modules/playwright/cli.js install --no-remove --no-progress firefox webkit
./scripts/npm.ps1 run build
./scripts/npm.ps1 run demo:restart-web
& $aggregatorNode scripts/measure-stability.mjs --phase final --cpu 4 --repeats 3
& $aggregatorNode scripts/measure-performance.mjs --phase stability-final --scenario radio --repeats 3
& $aggregatorNode scripts/measure-player-lifecycle.mjs stability-final
& $aggregatorNode scripts/measure-performance.mjs --phase stability-final --scenario video --repeats 1 --player app --ids 'newsroom-shuttle-solo-visual,newsroom-shuttle-duo-clip'
& $aggregatorNode scripts/measure-stability.mjs --phase final-headed --cpu 4 --repeats 1 --headed
& $aggregatorNode scripts/summarize-stability.mjs
./scripts/npm.ps1 run lint
./scripts/npm.ps1 run typecheck
./scripts/npm.ps1 test
```

Compatibility commands executed: `scripts/check-stability-engines.mjs` (then bounded `--remaining` and `--engine WebKit` diagnosis), `scripts/check-webkit-member.mjs`, `scripts/check-stability-visibility.mjs` (ONE attempt only), `scripts/check-stability-text.mjs`. Current reports retain the combined WebKit timeout; the separate member pass does not erase it. Do not rerun visibility without a new viable setup.

Regression scripts executed with the same `$aggregatorNode`: `check-queue-refinement.mjs`, `check-enhanced-controls.mjs`, `check-controls-member.mjs`, `check-radio-dials.mjs`, `check-dial-edges.mjs`, `check-browser.mjs`, `check-newspaper.mjs`, `check-media-theme-continuity.mjs`, `check-programme-handoff.mjs`. Their logs are in `output/playwright/stability/`.

Current demo: http://127.0.0.1:3000, `/radio`, `/newsroom`; captured mailbox8025; retained PG18 port55441. Only if stopped, use `./scripts/npm.ps1 run demo:start`. Never reset or duplicate the supervisor. This closeout does not authorize more optimization candidates or feature work. The following major product phase is the original source-governance/evidence/editorial pipeline; staff/MFA remains paused and real-source intake needs a separate owner decision. WP18 and release gates are not complete.


Final capacity C114.47GiB/E237.66GiB; verified Node temporary directory E:/Hale/Coding/Personal/aggregator/.cache/stability-tmp. No owner storage action required. Final secret scanner and real canary/redaction checks PASS; no suppression added.

