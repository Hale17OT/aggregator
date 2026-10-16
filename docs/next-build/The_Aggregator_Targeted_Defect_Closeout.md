# The Aggregator — targeted web/Flutter defect closeout

Prepared 16 October 2026. Continuation brief, not a claim of completed implementation or visual approval.

## Basis and intended outcome

The uploaded **Short-form corrective pass — 16 October 2026** reports that the revised web and native Clips layouts are implemented. It also reports an unresolved media/caption-load failure after navigation in the final main-app recording, a failing Newsroom 320px overflow assertion, and native static content rebuilding with controller progress while the raster-performance gate remains failed. These are the next work items. The report alone does not establish their root causes or approve the new appearance.

Execute this local defect-repair phase when the owner sends this brief to Codex. This extends previous stopping boundaries only for this scope. Continue through the connected repairs and final delivery; do not create a new app, redesign Clips again, regenerate programmes, or return only a plan.

The desired output is the same product, with its known navigation/loading and small-screen defects repaired, a measured reduction in unnecessary native work where established, and a newly identified normal-app APK. Keep genuinely unresolved performance and human-review gates open.

## 1. Inspect the current candidate and preserve it

Read AGENTS.md, the current canonical project status, SHORTFORM_ACCEPTANCE.md, SHORTFORM_REBUILD_DEFECTS.md, the latest native/web implementation, and the final-artifact and installed-identity records. Resolve paths from the repository; do not use historical next-task paragraphs as current instructions.

The reported main-entry baseline is:

- `output/shortform-rebuild/aggregator-shortform-local-demo.apk`
- SHA256 `493da1c98c960c15e4174cdb889e761ee96a1c864e491a695f48b8fb22e94ce8`
- Earlier preserved APK: `output/flutter-closeout/aggregator-local-demo.apk`, SHA256 `48806fb446eaa6ae8f0bdbf5b8ba99a2db62d3a56185871e0caa88fb14fc23c0`.

Verify rather than assume those identities. Preserve both files. Record the actual current source, locks, served web build, installed package, emulator configuration, and profile/instrumentation identities. Different entrypoints and build modes must remain explicitly distinguished.

Preserve all 23 programme renditions and 93 original asset files; migration 0012 and preceding checksums; retained account/member records; native sign-in and scoped bearer transport; browser cookie/CSRF controls; source eligibility; and the private editorial boundary.

Existing example.test test accounts may be used. Test-specific mutations must affect only owned test records and must not clear retained user data. Session activity and playback progress are legitimate mutable values, not immutable-preservation assertions.

Use the existing supervisor, environment wrappers, and authorized Aggregator_Local emulator. Inspect capacity now and keep temporary work scoped to the workspace. Build, restart, test, profile, and record sequentially rather than replacing served assets during a journey. No new supervisor, data reset, reseed, emulator wipe, database repointing, or global configuration change.

## 2. Repair the navigation-associated media/caption failure first

The report says Retry recovered the same clip, but its cause remains unresolved. A subsequent passing run is not the explanation. Do not suppress the failure, hide captions, or add an indefinite retry loop.

Locate the final normal-app recording, logs, relevant item/revision, route sequence, and timestamps. Identify whether the original failing operation was video initialization, protected media HTTP, caption HTTP/parsing, a stale async completion, or another step. These are hypotheses, not established causes.

Add bounded, local, redacted diagnostics where necessary: route/player attempt identity, programme/revision/internal asset identity, load stage, request status, cancellation, lifecycle state, and error category. Never log credentials, authorization headers, sign-in links, full sensitive URLs, source payloads, or secure-storage contents. Do not introduce telemetry uploads.

Check the existing flow before editing:

- Clip A loading while the reader switches to B, then returns to A.
- Previous controller disposal while its media or caption work is pending.
- Sources, More, story navigation, Back, and application pause/resume.
- Video-ready and caption-ready arriving in either order.
- A slow old request completing after the newest request.
- Retry tapped repeatedly, or navigation occurring while Retry is pending.
- Protected resources becoming unavailable or a request failing normally.

Bind each attempt to the actual current item, revision, and controller/route generation. Cancel abandoned work where supported, and reject late completions before they alter the new screen. A mounted check alone is insufficient when the same mounted component now displays a different clip. Do not classify a deliberate cancellation of an old attempt as a new-item playback failure.

Reuse the existing exclusive media owner. Leaving a video releases only that video's ownership. An obsolete callback must not steal ownership, restart Radio, resurrect a disposed video, or apply the wrong captions.

Use the existing caption/transcript policy explicitly. Where the contract requires captions before playback, retain it. Otherwise a caption-only fault must remain visible and offer the permitted transcript/retry path; it is not a captions-success result. Never play one clip with another clip's cue text. Do not globally drop caption readiness checks to avoid the error.

Retry must address the same requested item/revision after current eligibility checks. Preserve the user's pause intent and seek only when the matching rendition supports it. If the revision is stale or no longer eligible, show that state rather than substituting another recording or bypassing protected URLs. Do not retry permanent permission or withdrawn-content failures as transient errors.

Use deterministic test delays/failures through the existing test harness, not a public fault-injection endpoint. Exercise both completion orders, late success and late failure, rapid navigation, repeated retry, and real successful recovery with the existing media. Keep the real failed attempt in evidence. If the original incident cannot be reproduced, label it unresolved and distinguish any independently reproduced race that was actually fixed.

## 3. Repair Newsroom's 320px reflow regression

Open the real long-form settings disclosure and reproduce the existing failed assertion. Identify the overflowing element and its width constraints; do not alter the test before identifying whether it represents the intended layout.

Repair the actual layout while preserving recognizable long-form controls. Controls may wrap or move secondary settings into the existing disclosure. Keep time, captions, source access, play/pause, and appropriate sound/fullscreen functionality usable.

Do not solve the problem by applying document-wide overflow hiding, clipping focus rings, reducing type to unreadable sizes, removing controls, or changing the test width to a larger one. Intentional internal vertical scrolling is acceptable for a tall settings panel when all content remains reachable.

Check 320/360/390 CSS-pixel widths, normal and short heights, both themes, enlarged text, long labels, keyboard focus, open settings, caption/error states, and fullscreen exit. Keep the portrait Clips design and Radio cabinet unchanged. Test analogous native small-constraint layouts if shared control changes affect them; do not equate CSS pixels with Android physical pixels.

Keep the original overflow test and add a regression identifying the real offending state. Retain a full-viewport before capture and after capture in comparable conditions.

## 4. Reduce native progress-driven rebuilds with measured evidence

The report identifies native static content rebuilding with controller progress. Confirm that observation on the current source with diagnostic rebuild instrumentation. It is not proof that every raster delay has the same cause.

Record the update path from the controller into `main.dart`, `players.dart`, `shortform.dart`, and the actual relevant components. Separate work associated with time/progress from changed captions, playing/buffering/error state, selection, account state, route, theme, text scale, and accessibility settings.

Localize updates to the smallest useful subtrees. Static story metadata, the item-action rail, unchanged navigation, and unchanged lists should not rebuild merely because playback position advanced. Active caption rendering should change with the cue or actual layout settings, not reconstruct all transcript content on every tick.

Use existing Flutter facilities and the current state architecture. For example, stable children outside a ValueListenableBuilder's changing builder may be suitable. This is an option to evaluate, not an instruction to install a new state library or mark everything const blindly. Theme, bookmark, error, and accessibility changes must still propagate correctly.

Inspect actual raster traces separately. Evaluate paint/layer isolation or avoidable layout/masking work only where supported by traces. Do not add RepaintBoundary everywhere, delete the visual design, turn off all animation, downscale original video, or alter its frame rate to improve a UI measurement.

Keep actual media time authoritative. Do not throttle scrubbing responsiveness, delay user input, freeze captions, or move necessary work beyond the measurement window. Remove diagnostic listeners when finished; do not accumulate them over route changes.

Use at most three focused optimization candidates after baseline capture. Retain changes supported by repeatable measurements and/or directly verified elimination of redundant work with no functional or measured regression. State which result was established. A lower rebuild count does not alone clear the raster gate.

Use matched profile-mode runs: same device/emulator, rendering backend, viewport, font scale, refresh assumptions, source media, warm-up, workload, and build mode. Keep recording/tracing overhead separate from lightweight measurements. Compare UI and raster results separately across three repeats. Do not compare a debug main APK with a profile candidate and call it improvement.

The prior report's approximately 37.7ms raster p95 is a diagnostic on a pre-final candidate, not a final-main baseline. Capture a new appropriate baseline. Preserve the established 16.7ms raster budget and identify its original workload. A failed final result remains failed; an emulator diagnostic is not physical-device certification. Retain the existing web 7ms and CPU4 limitations without reopening the entire older optimization campaign. Fix concrete new regressions introduced here.

## 5. Keep sharing and acceptance states honest

Native sharing currently establishes that a chooser opened, not delivery. Preserve that truthful behavior. If the installed Android APIs expose target selection or cancellation, map only the events actually observed. Resuming the application is not proof of a successful share, cancellation, or delivery. A destination choice is not proof of receipt by another person.

Do not expand this pass into social integrations or mandatory delivery confirmation. Keep picture playback paused on return from the system chooser and preserve its item/revision/position. Do not display “Shared successfully” based only on opening the chooser.

Small text embedded in an immutable video cannot be repaired by changing a caption widget. Retain proportionate picture containment, fullscreen where available, readable selectable captions/transcript, and relevant source/image inspection. Document any remaining source-graphic readability issue rather than cropping evidence or claiming its pixels changed.

## 6. Review through real mixed journeys

Keep the existing 48-case short-form register. Attach new defect-specific tests; do not replace it with a smaller all-green checklist. Repeated tests on the same candidate are useful, but retain which cases were actually repeated and which were assisted, automated, or not run.

After the fixes, exercise:

1. Real Clips play, tap-pause/play, item swipe/keyboard navigation, timeline seek, Sources, story link, and paused Back.
2. A→B→A with slow or failing initialization/captions, retry, and no stale cue/audio ownership.
3. Radio→Clips→Newsroom→Radio with exactly the intended sound owner and preserved pause intent.
4. Newsroom settings at 320px and enlarged text with every required control reachable.
5. Real test-member Save/Unsave, API readback, and Library agreement; genuine failed-write feedback and session expiry.
6. Native More/share/transcript at enlarged text and safe application pause/resume.
7. Twenty clip changes and twenty route exits with no accumulating controller, callback, listener, overlay, or stale request.

Repeat the critical repaired journeys three times with the actual media and services. Exercise all six clips in navigation/caption coverage; do not regenerate them. Combine targeted automated negative cases with normal-input actual-app checks. Distinguish injected failures from naturally reproduced failures.

Run relevant root tests/typecheck/lint/build, Flutter format/analyzer/unit/widget tests, protected-asset and member checks, and reader/Radio/Newsroom/short-form regressions. Finish the build before restarting or testing the served web version.

Use independent reviewers only when genuinely available. Otherwise label separate review passes as self-review. Source review, screenshots, silent recordings, decoded frames, and normal-speed listening are different evidence. Do not bypass a tool policy to view blocked video or claim playback inspection that was unavailable.

## 7. Freeze the final candidate and repair the evidence workflow

Before any edits, create a new run-specific baseline folder. Capture scripts must require a valid explicit phase, refuse an occupied immutable baseline destination, and record application identity and viewport. Do not attempt to recreate the lost earlier same-pass baseline or overwrite older evidence. Older baseline images remain explicitly historical.

Keep artifact directories separate for main debug, instrumentation, and profile builds. Give the new normal-app deliverable its own run-specific filename under an appropriate new output directory. Do not overwrite either preserved APK or label instrumentation as the final main app.

After code changes are complete, build the actual `lib/main.dart` localDemo artifact. Install it on the same authorized emulator with the existing update-in-place path, compatible package/signing identity, and no uninstall or member-data clearing. Verify the installed base APK fingerprint against the new supplied artifact. Do not link to or claim creation of a file until it exists.

Capture full-viewport desktop and native playing, paused, settings/sources, short-height, and enlarged-text states on that candidate. Include an uncut normal-input navigation/retry recording. Probe the recording's actual duration and audio streams; a silent screenrecord is not listening evidence. Diagnostic profile timing remains attached to its own exact artifact/source identity.

Run two final review sweeps after the last product change: one functional/artifact/preservation sweep and one visual/accessibility-state sweep. If either causes another product change, rebuild and repeat the affected final verification. A helper-only edit still needs its own relevant check; do not present old source fingerprints as the new full-source state.

Verify the 23 renditions/93 asset hashes, migration history/target identity, retained data boundaries, served web fingerprint, root media ownership, and installed main APK. Keep all failures and partials in the ledger; no test weakening, scanner exemptions, or fabricated all-pass status.

## 8. Deliver a short, decision-ready closeout

Update one canonical current project status, the existing defect/acceptance registers, and the owner packet rather than generating competing “final” reports.

For each targeted item give: observed failure; supported cause or explicit uncertainty; changed files; reproducer; tests and matched measurements; final status; exact evidence location.

Use explicit outcomes such as FIXED AND VERIFIED, IMPROVED BUT GATE FAILED, NOT REPRODUCED / OPEN, and NOT RUN. If the original navigation failure remains unexplained, do not declare it fixed merely because Retry or later repetitions worked.

Provide the actual new main APK path/hash, install/start commands that were verified, served web identity, and a concise owner walkthrough. Separate product-code defects from unavailable owner, physical Android, same-device sign-in, TalkBack, subjective listening, Figma, iOS, and release checks.

Continue independent authorized work while such a gate is unavailable. Do not perform another broad feature expansion to avoid reporting a remaining defect.

Stop at this connected repair checkpoint. Staff/MFA remains paused. No provider calls, new models, real ingestion, programme rendering/re-encoding, schema migrations, reset/reseed, asset uploads, commits, pushes, external email, production access, publication, or deployment are authorized.

## Reference notes for the implementation

The starting facts above come from the owner's uploaded 16 October short-form report, not an independent inspection of the repository or APK. The task sequence and repairs are proposed instructions.

Official references checked on 16 October 2026; use the documentation compatible with the repository's installed versions without upgrading frameworks merely to match these pages:

- Flutter performance best practices: https://docs.flutter.dev/perf/best-practices — localize changing widget work and investigate expensive render operations rather than attributing all jank to one cause.
- ValueListenableBuilder: https://api.flutter.dev/flutter/widgets/ValueListenableBuilder-class.html — the child parameter supports a subtree independent of the changing listenable value.
- Flutter performance profiling: https://docs.flutter.dev/perf/ui-performance — separate UI/raster costs and profile artifacts; physical-device profile measurements are needed for representative device claims.
- Android Sharesheet guidance: https://developer.android.com/training/sharing/send — consult the installed API's actual chooser feedback; do not equate system UI or target selection with downstream delivery.
