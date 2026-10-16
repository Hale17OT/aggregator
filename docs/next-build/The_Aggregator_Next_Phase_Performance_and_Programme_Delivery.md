# The Aggregator — next phase: performance and repeatable programme delivery

**Prepared 13 October 2026. Execution instructions for the existing Codex workspace.**

## Assignment and outcome

Continue from the **Radio interaction and presenter performance checkpoint**. The owner likes the progress but reports laggy animations. Treat that report as an unresolved product defect even though the functional suites passed.

This phase has two ordered objectives:

1. Diagnose and fix actual interface, playback, or baked-animation stutter without undoing the accepted visual quality.
2. Complete the connection between reading, listening, watching, and member preferences, then prove the existing local programme pipeline works for more than one showcase story.

Do not deliver another aesthetic rebuild, another test-count-only report, or another promotional video in place of a fix. Run the increments below in order, continuing through unblocked work. Measure the performance improvement before expanding content generation.

This is an additive execution phase, not a replacement for the PRD/TRD/backlog. Map work to the existing F/SC/FL/WP and Radio/Newsroom/Membership identifiers; do not invent completion of whole work packages.

## 0. Inspect the actual state and preserve boundaries

Read AGENTS.md, current execution/status files, the latest interaction/performance checkpoint, the shared-control handoff, programme contracts, and the relevant original requirements. Locate actual paths. Older summaries are historical: do not rebuild accounts, PostgreSQL adapters, selectors, knobs, or videos that now exist.

Inspect these current boundaries before editing: RadioDial/RadioReceiver; the root programme-audio composable; queue animation; shared Reka Select/Combobox wrappers; prepared-video player; ProgrammeTranscript and MemberProgressSync; broadcast scene/performance code; renderer/importer; existing programme manifest and asset eligibility checks.

Preserve:

- The newspaper, blackletter masthead, accepted buttons, custom form controls, radio cabinet, original presenters, captions, and full attribution.
- The retained local PostgreSQL database, captured-mail sign-in, member records, queue, progress, and preferences.
- The one persistent native Radio audio element and the prepared video's sole sound/time authority when watching.
- Existing cookie/CSRF/ownership, revision, source-permission, approval-digest, and asset-eligibility checks.
- Keyboard/range/non-drag alternatives to the knobs. Volume remains session-only unless a separately justified existing requirement says otherwise.
- Current dependency/security/notice gates. Do not suppress findings to finish this phase.

Staff/MFA remains paused. Do not implement staff impersonation, publishing, real ingestion, external email, paid providers, telemetry uploads, cloud rendering, billing, commits, pushes, or public deployment. Do not treat local fixture eligibility as approval to process real reporting.

The existing supervisor owns the running application. Inspect its status; do not start a duplicate. Build once, use the owned restart commands, wait for readiness, and then test. Never run reader checks while replacing their served build directory.

Before benchmark/render work, record free workspace/system-temp space and relevant owned processes. Stop or pause only this project's verified unnecessary render/showcase tasks, not unrelated processes. Do not delete user files or blanket-clear caches. Do not reset, reseed, or replace the retained demo database.

## 1. Reproduce lag and establish an honest baseline

### 1.1 Classify the problem before fixing it

Keep separate entries for:

- **UI responsiveness/frame pacing:** knob lag, dropdown opening, queue transitions, page scroll, toolbar/route changes.
- **Media playback:** buffering, decode/rendered-frame loss, seeking delays, competing playback owners, unnecessary reloads.
- **Baked presenter motion:** pose holds, discontinuous interpolation, repeated frames, gesture/camera cadence already present in the video file.
- **Environment contention:** render/encoding jobs, concurrent builds, disk pressure, instrumentation overhead, browser launch flags, or unsupported acceleration.

A slow renderer does not by itself prove that its completed video stutters. A stuttering screen recording does not by itself prove the application stutters. Record the layer supported by each observation.

The existing programmes are reported as 1280×720 at 30fps. Do not judge their expected frame cadence against a 60fps UI target. Do not assume 30fps explains a hitch without inspecting timing and playback. Source cadence, display refresh, and callbacks are different measurements. [R03, R04, R05]

### 1.2 Baseline conditions

Use the built application, not HMR, for acceptance measurements. Record browser version, launch flags, viewport, display refresh when discoverable, device-pixel ratio, CPU/RAM, relevant GPU/decoder information when available, OS, power mode when knowable, app/asset hashes, and actual media rate.

Run a normal foreground baseline with no simultaneous build/render/showcase. Separate warm and cold loading; do not compare cold-before with warm-after. Repeat the same scripted workload at least three times per target scenario.

Capture diagnostic traces separately from lightweight metric runs and presentation recordings. Screen capture, tracing, or open tooling can influence performance. Verify an improvement with heavy instrumentation off as well as with diagnostic evidence.

A 4× CPU slowdown is a separate diagnostic condition, not a physical mobile-device certificate. Record it separately. Do not switch hardware, resolution, browser flags, content, or motion settings between the before/after measurements without disclosing the change.

### 1.3 Reproduce these interactions

- Play Radio and repeatedly drag the actual volume dial through its range for 10 seconds; include seam crossing, endpoint reversal, centre dead zone, and cancellation.
- Drag the story dial, preview without seeking, release once, then interact with a dropdown during continuing audio.
- Open and navigate edition/rate/voice controls; exercise pointer, keyboard, outside dismissal, and Escape.
- Add/reorder/remove guest-queue items while retaining focus, then navigate Home → article → Radio.
- Play a sustained presenter passage and the existing 100–155 second comparison interval at 1×; open a selector, scroll the transcript, and seek.
- Test actual supported playback rates, Light/Dark, and 390/834/1440 widths. Retain 320px correctness checks.
- Alternate Radio and Newsroom, then repeat the navigation/interaction loop 20 times to expose accumulating listeners, elements, callbacks, or resources.

Use actual pointer/key operations. Updating a range value in code does not measure the visible knob interaction.

### 1.4 Collect evidence that explains a fault

Use Chrome runtime traces, supported Long Animation Frame/Long Task observations, layout/paint activity, event latency, and targeted Vue update information. Feature-detect observers; unavailable instrumentation is not a zero-cost result. [R01, R02, R06]

Record p50/p95/p99 and worst foreground animation callback intervals, long-frame counts, handler/update work, and an explicitly named pointer-to-update/paint proxy. RAF timing alone does not prove displayed compositor FPS. Distinguish supported presentation timestamps from a next-RAF estimate.

Use Event Timing/INP-related evidence for discrete interactions where applicable, but measure continuous dial manipulation separately. Do not call a short automated local session a field INP assessment. [R07]

For video, record quality-counter **deltas** over specified intervals, buffering events, media-time advancement, seeks, and relevant request/decoder evidence. `totalVideoFrames` includes dropped frames: label counters correctly. Use requestVideoFrameCallback metadata where available; a skipped/delayed JavaScript callback alone is not proof of a dropped displayed frame. [R03, R04]

Create docs/engineering/PERFORMANCE_BASELINE.md plus machine-readable measurements using existing conventions. List each reproduced issue, trace location, suspected cause, and how the fix will be tested. If a complaint cannot yet be reproduced, keep it open and continue the other identified cases; do not mark it fixed by inference.

## 2. Fix the hot paths without stripping the product's motion

Treat the following as hypotheses to inspect, not a mandatory list of unproven refactors. Change the measured bottlenecks first, one coherent change at a time.

### 2.1 Radio dial responsiveness

Keep the verified angular mathematics and cancellation behavior. During active dragging, the control must follow input directly rather than easing toward an old target.

- Process sufficient pointer samples to preserve incremental angle/seam/dead-zone correctness; do not discard intermediate angular deltas before integrating them.
- Coalesce visual DOM writes to the rendering cadence. The latest valid volume must reach the native audio path promptly, not after a 200ms debounce or only on release.
- Keep volume updates separate from expensive whole-page reactive work. Keep story preview local; release must commit exactly one final selection and preserve paused/playing state.
- If a frame is pending at release, use the latest accumulated state for the final commit. A paused hidden-tab RAF must not lose a completed command.
- Read geometry at deliberate times, cache it during stable interaction, and invalidate safely for resize/scroll/layout changes. Do not alternate layout writes and fresh bounding-box reads on every pointer event.
- Rotate the intended pointer/knob layer with a transform; do not repaint or rotate the entire cabinet. Avoid a CSS transition or spring chasing every direct-drag update.
- Preserve capture, single primary pointer, centre reset, Escape, blur, unmount, error and revision cancellation. Test keyboard/step/range paths against the same state.

Do not call a responsive visual needle proof of audible loudness change on platforms that restrict programmatic volume. Preserve the existing device-volume message.

### 2.2 Playback-derived visuals and Vue updates

Inspect whether playback time is invalidating unrelated pages, queue rows, controls, or immutable manifest trees. Keep component inputs stable and high-frequency state local; use targeted immutable/shallow boundaries only where profiling justifies them. Do not use memoization that freezes a required state change. [R06, R08]

- Retain one root Radio element. Opening a selector or changing a label must not recreate it.
- Interpolate the existing 50ms audio-envelope samples against actual playback time for a smooth meter, rather than turning the envelope into a random animation or a 20Hz stepped needle.
- Stop visible-only meter/knob ornament updates when not relevant; resynchronize from actual media time when they return. Paused/buffering/error meters rest as before.
- Avoid updating every transcript line each frame. Find the active cue efficiently and update the meaningful changed state. Auto-scroll only when appropriate and do not fight a reader manually scrolling or selecting text.
- Do not write progress/preferences or request eligibility on every paint. Preserve correctness with the existing bounded persistence cadence and operation/asset checks; never trade away withdrawal enforcement for performance.
- Clean up watchers, observers, frame callbacks, subscriptions, temporary object URLs, and nonpersistent media on lifecycle transitions. The legitimate root player is not a leak to remove.
- Speech models, FFmpeg, renderer assets and Brag tooling stay outside public frontend bundles and page-request hot paths.

### 2.3 CSS, popups and queue animation

Prefer transform/opacity where they deliver the same intended effect without repeated layout/paint. Profile gradients, shadows, blur, filters, SVG effects, sticky layers and backdrop combinations rather than deleting the radio's material detail by default. Use compositor-layer hints sparingly and only with evidence. [R09, R10]

Keep Reka behavior and one animation owner for each property. Do not let Motion, AutoAnimate and CSS compete over a popup's position/size. Animate a small surface/content wrapper without animating the positioning engine's authoritative offsets.

Cache or simplify static expensive decorative layers when justified. Keep the visual result and acceptable text clarity; do not flatten interactive controls into inaccessible screenshots.

Keep AutoAnimate confined to justified list changes. Batch queue mutations and retain stable keys. Do not animate the entire application or repeatedly reorder options while they have pointer/keyboard focus. Preserve existing queue-focus repairs.

Use brief interruptible state transitions. Preserve purposeful movement in normal mode; reduced-motion remains a separate user choice. Do not “fix lag” by globally setting all durations to zero, hiding presenters, removing the tactile face, disabling touch, or deleting the queue animation indiscriminately.

## 3. Diagnose Newsroom stutter at the correct layer

### 3.1 Player and asset delivery

Compare the same eligible file in the normal Newsroom and a temporary, local test-only minimal player using the same protected asset route. Never introduce a public static-file bypass for this comparison.

If it is smooth in the minimal player but not the product, inspect reactive work, overlays, clipping/effects, transcript updates, duplicate video instances, or source reassignment. If both exhibit faults, inspect buffering, asset delivery, decoder information and the file itself before changing UI animation libraries.

Audit existing media range behavior, including appropriate bounded Range handling and response metadata. Avoid buffering an entire file synchronously for every request. Preserve eligibility on applicable new media/ancillary requests, and do not make long-lived unrestricted caching a workaround for latency. Already delivered bytes cannot be recalled. [R11]

During Newsroom playback, the muxed video's clock and soundtrack remain authoritative. Radio pauses and cannot resume underneath it. Pause obsolete video instances; do not preload or decode all programme variants just to populate a select.

Use a video-frame-aware observation path where helpful, with feature-detected fallback, but keep per-frame work minimal. Do not run a second independent audio clock. Reconcile captions, transcript and progress after seek/rate/revision changes without resetting the video for routine UI updates.

### 3.2 File timing and authored motion

If the problem is present in the file, inspect decoded timestamps, frame ordering and a motion-rich sample. Check deterministic scene evaluation at the intended frame time, actual clip offsets, coarse pose/cue quantization, unintended holds, and discontinuities between authored tracks.

A static shot can legitimately contain similar frames. Silence can legitimately contain a resting mouth. Do not label either a dropped frame automatically.

Fix unintended discontinuities while retaining intentional lip closures, gesture stops, and shot cuts. Do not smooth across an editorial cut, blur captions, change the soundtrack speed, or smooth away consonants to hide the problem.

Render a short same-audio pilot with the measured fix. Consider a **true** 60fps re-render only if comparison shows temporal sampling is a meaningful limitation and the device can decode the result acceptably. Re-evaluate the scene at the new frame times; duplicating 30fps frames or changing container metadata is not improved motion. Measure render time, bytes, CPU/decoder load and visual benefit. Keeping good 30fps output is an acceptable result. [R12]

Only rerender full programmes affected by a demonstrated source/renderer change. A frontend performance repair does not require regenerating every video. Preserve immutable identities, captions, source maps, import checks, and stale-resume rejection.

### 3.3 Foreground and background behavior

Use actual page visibility state. Do not fake a `visibilitychange` event or count a blurred-but-visible window as hidden-tab verification. Attempt a headed two-tab/minimized-window test with observed hidden/visible transitions and actual media position advancement. Record unsupported automation honestly. [R13]

Suspend unnecessary hidden visual work, not the underlying Radio audio. On visibility return, read current time once and update the UI; do not run a backlog of missed animation ticks. Do not change Newsroom's established playback policy or claim background/lock-screen compatibility from a desktop-only pass.

Test the existing sleep behavior under realistic visibility constraints; avoid promising exact background timing that the platform did not demonstrate. Preserve its intended deadline/stop semantics and disclose any unsupported precision.

## 4. Performance gate before content expansion

These are **proposed local acceptance budgets**, not universal standards or measurements already achieved. Freeze the conditions before comparison. Report failures; do not silently weaken budgets or change the scenario to get a pass.

Reference foreground acceptance: built application, otherwise idle verified local stack, supported browser, 1× media speed, default motion, and known display refresh. Run cold-load separately. For UI cadence, normalize the baseline to the actual display interval T where discoverable; a 60Hz example has T about 16.7ms.

- For repeated warm discrete control interactions, target a p95 input-to-visible-feedback measurement/proxy below 100ms; record at least 30 operations and identify what the timing actually measures.
- For active continuous dial/queue interactions, target p95 callback intervals no greater than 1.25T and p99 no greater than 2T, plus no unexplained >100ms app-caused stalls. Record actual samples and correlate with traces; these are not a claim of directly measured displayed FPS.
- Report long-animation-frame occurrences individually and their contributing work. Fewer >50ms frames is useful but does not alone prove a consistently smooth 60Hz interface.
- For stable foreground 1× prepared-video playback, target dropped/total frame delta below 0.5% over at least 60 seconds per complete programme, with no unexpected local rebuffering after startup. Count actual stalls and freezes separately. Isolate deliberate seeks, initial decode, rate changes and injected failures rather than hiding them in a filtered aggregate.
- Across 20 repeat journeys, no increasing population of abandoned active players, animation loops, event handlers, overlays or owned render processes. Report memory after comparable idle/settling periods; do not claim a byte-perfect plateau or equate JS heap with total process/GPU memory.
- Radio continuity, one-seek story commit, caption/source integrity, keyboard focus, no-JS articles, retained state and authorization must remain correct.

A high-refresh desktop, CPU-throttled profile, unavailable metric, or actual phone must be reported separately. If a budget is not met, explain the limiting work and remaining gap. Continue independent correctness work, but do not expand expensive rendering or declare the smoothness gate passed without evidence.

## 5. Complete Read → Listen → Watch and saved media intent

This is the product advancement after the smoothness pass, not another generic control redesign.

### 5.1 Consistent availability and handoff

Inventory existing programme-availability metadata and links. Extend/reuse them rather than inventing a parallel service.

For each eligible story/version, expose accurate reading, audio and video availability. Link the actual article to its matching narration/programme and back. An unrelated default broadcast must never open just because the selected article has no video.

Only offer working actions for available renditions. Use an honest “not prepared”/unavailable explanation where useful; do not install a fake Generate button or trigger speech/rendering from an anonymous request.

Preserve explicit play gestures. Ordinary navigation must not start sound. “Listen”/“Watch” actions should express clear user intent and select the correct media owner; handle any asynchronous autoplay rejection without lying about playback.

Move between formats using validated shared story/section anchors when such mapping exists. Do not copy raw seconds or percentage completion between full/brief/audio/solo/duo programmes with different scripts. Where mapping is absent, offer the appropriate chapter/start with a clear paused state.

Keep active source context reachable from transcript/programme to the exact article/source, with return context preserved. Captions and bibliography must not disappear because this UI is optimized.

### 5.2 Complete the existing media-treatment preference

Inspect the actual saved enum/contract and its currently disclosed fallback. The intended outcomes remain:

- Narration over eligible illustrative footage.
- A clip played with its intended audio, followed by presenter commentary.

Prepare genuinely different eligible programme variants for one existing story, for both solo and duo. That is four truthful combinations—not four labels pointing to the same mixed programme. Use only local original/permitted visuals and audio. Voice-over permission does not follow merely from having a video link.

Each treatment needs its own appropriate script/edit/audio relationship, timing, caption/source map and immutable rendition identity. Reuse unchanged speech segments when exact inputs permit; regenerate segments whose wording or timing changed. Do not say “let's hear the clip” over a permanently muted montage.

Selecting the preference must choose the corresponding prepared treatment on the next start. Changing treatment during playback must pause and offer a meaningful boundary/confirmation without silently restarting or claiming the old seconds are equivalent. Keep preferred versus currently playing variant distinct.

For stories without that prepared combination, retain an explicit temporary alternative choice. Do not overwrite the saved preference or silently substitute a different treatment/voice/anchor count. Availability remains honest even when not every combination is produced.

Preferences and member progress remain server-owned, revision-aware and bounded in frequency. Preserve conflict/error handling and the opt-in history boundary; never upload guest history silently.

## 6. Make local programme production repeatable

Do not keep the whole programme system dependent on one hardcoded story and timestamp script. Inspect how much of the current pipeline is already data-driven; retain it and fill the actual gaps.

Provide one documented **local command/configuration path** that takes an allowlisted set of existing eligible fictional article revisions and requested supported variants through:

validated input → script/citation manifest → narration/cues → scene/media plan → pilot → complete render → validation → eligibility-controlled import.

This is local fixture production, not a live-news generator or publication system. Preserve current approval/eligibility checks and record synthetic fixture provenance. Do not mint real editorial approvals, trust arbitrary paths/URLs, ingest publishers, or allow the model to fetch/publish.

Reuse the current local filesystem claim/spool and tools unless a demonstrated limitation requires an additive change. Do not introduce Redis, distributed workers, a cloud pipeline, a new ORM or a second render stack in this phase. State that it remains single-machine production.

Requirements:

- Select stories, presenters, shot intentions, assets and source references from configuration and validated manifests—not copied Vue pages or slug-specific renderer branches.
- Keep story-specific choices as content/scene data. A per-story scene plan is valid; editing renderer code for each headline is not.
- Reuse immutable compatible outputs. Include all consequential inputs (article version, script, source/right bindings, media, voices, renderer/performance settings, treatment and anchor count) in rendition identity.
- Duplicate identical requests must not spawn duplicate work. Claims have bounded ownership and recovery; test a controlled failure and safe rerun.
- Partial, corrupt, ineligible or stale derivatives must never be promoted as ready. Import complete validated assets atomically according to the current boundary.
- Current assets stay usable until a valid replacement is imported, subject always to current eligibility. A version/right invalidation blocks affected derivatives as required; do not keep serving them merely for continuity.
- State ready/queued/running/failed/stale truthfully. Report real completed stages or indeterminate progress rather than manufactured percentage timers.
- Keep generation concurrency and encoder CPU/memory bounded; never run bulk renders during foreground performance acceptance. Record operational contention separately.
- Check disk before generation; scope temporary directories and cleanup to the owned job. Preserve referenced assets and recoverable records. No automatic deletion of retained data or unrelated caches.
- Diagnostic logs contain IDs/stages, not credentials or private member payloads. Do not export captured-mail tokens in traces or recordings.

Minimum product proof after the performance gate:

1. Reuse the existing three narrated stories to assemble at least two meaningfully selected Radio editions with accurate chapters and source maps; do not relabel an identical playlist as new coverage.
2. Complete the four solo/duo × treatment combinations for the primary story described above.
3. Produce solo and duo renditions of a **second distinct existing story** through the same pipeline, with one documented prepared treatment. Reuse existing authorized narration/assets when appropriate.
4. Do not relabel the original story or invent unsupported voices to satisfy this count. For text-only evidence, use an honest attributed typographic/evidence scene rather than unrelated stock imagery.
5. Verify all advertised outputs through the application, not only directly from files. Full continuous playback and sampled actual visual inspection are separate from subjective listening quality.

Use a representative new pilot to confirm script/shot/caption fit before full expansion. Do not require rerendering unchanged old outputs or another Brag showcase; the focus is working product coverage. If compute/disk limits prevent completion, leave resumable jobs and report exact missing combinations instead of presenting unavailable options as ready.

## 7. Integrated verification, evidence and stopping boundary

Run the applicable existing regression suites plus focused performance, programme-variant and cross-format tests. Follow existing command conventions; add a small documented entry point such as `test:performance` and `test:programme-delivery` only if it improves reproducibility. Do not invent successful commands in the handoff.

Test one end-to-end guest and member journey:

Home/search → correct article → matching Radio narration → manipulate actual dial/open dropdown → navigate while audio continues → choose matching Newsroom programme → only that soundtrack plays → inspect source → change prepared treatment/anchor count through the deliberate boundary → save preference/progress → API restart → resume the correct revision in a paused state.

Include missing rendition, stale revision, denied asset, interrupted fetch, invalid saved choice, failed preference save, logout and unavailable source cases. For member writes, use owned test records and keep all existing users intact. A restart is not permission to reset progress or reseed the database.

Retest foreground performance after new catalogue/variant work. Performance acceptance is on the final code, not just the earlier optimization branch. Do not run benchmarks while build artifacts or full renditions are still being replaced.

Try available additional browser engines and genuine hidden-tab behavior without changing global system configuration or making unreviewed tool downloads. Label unavailable physical mobile, Safari/Firefox, screen-reader and subjective listening tests as not run. A synthetic visibility test is useful for application logic, not evidence of native background playback.

Update:

- docs/execution/PERFORMANCE_AND_PROGRAMME_DELIVERY.md: milestone state, existing requirement mapping, resume instructions.
- docs/engineering/PERFORMANCE_BASELINE.md and PERFORMANCE_RESULTS.md with matching before/after scenarios and raw measurement references.
- Machine-readable performance and delivery results, using current conventions.
- A programme coverage matrix: story/version, audio variant, anchor count, treatment, actual ready rendition, unavailable combinations, exact verification.
- Current project status and relevant contracts/commands. Preserve historical evidence as historical, and keep native Figma pending if the bridge remains disconnected.

Finish with a compact result table:

**Issue → observed cause → implemented fix → same-condition before/after measurement → remaining limitation.**

Also give the working Read/Listen/Watch routes, completed variant coverage, safe generation/recovery commands, regression outcomes, and one normal-speed uncut interaction/playback sample. A presentation montage is not performance evidence.

Maintain separate statuses for implemented functionality, measured performance, sampled visual inspection, owner acceptance, subjective listening and device compatibility. Do not infer full WP completion or release approval.

Stop at this integration checkpoint, leaving the owned demo usable. Identify the next remaining original-backlog dependency without beginning paused staff/MFA or real-source work automatically.

**Start now with a built-app reproduction of the reported lag, fix the measured bottleneck, then advance into the programme-delivery increments. Do not return only a plan.**

---

## Technical references checked for this prompt

These support the investigation techniques; they are not measurements of The Aggregator. The budgets and phase scope above are proposed project decisions. Recheck installed versions and applicable documentation in the actual repository.

- **R01 — Chrome runtime performance profiling:** https://developer.chrome.com/docs/devtools/performance
- **R02 — Long animation frame timing:** https://developer.mozilla.org/en-US/docs/Web/API/Performance_API/Long_animation_frame_timing
- **R03 — Video frame callbacks and timing caveats:** https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/requestVideoFrameCallback
- **R04 — Video playback quality counters:** https://developer.mozilla.org/en-US/docs/Web/API/HTMLVideoElement/getVideoPlaybackQuality
- **R05 — Animation frame cadence/lifecycle:** https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
- **R06 — Vue performance and update optimizations:** https://vuejs.org/guide/best-practices/performance
- **R07 — INP scope and interpretation:** https://web.dev/articles/inp
- **R08 — Vue advanced reactivity boundaries:** https://vuejs.org/api/reactivity-advanced
- **R09 — CSS animation performance:** https://web.dev/articles/animations-guide
- **R10 — Layout thrashing:** https://web.dev/articles/avoid-large-complex-layouts-and-layout-thrashing
- **R11 — HTTP range behavior:** https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Range_requests
- **R12 — FFmpeg encoding/frame-rate documentation:** https://ffmpeg.org/ffmpeg-all.html
- **R13 — Visibility and background behavior:** https://developer.mozilla.org/en-US/docs/Web/API/Page_Visibility_API
