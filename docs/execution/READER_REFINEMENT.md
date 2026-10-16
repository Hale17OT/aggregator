# Reader experience refinement — active 14 October 2026

Owner correction; no new acceptance or release authorization. Staff/MFA paused. Existing 24 stories, 23 programmes, migrations 0001–0011 retained. No media rendering or schema changes.

## Implementation ownership
Home page / edition service: shared paper inset, scope-bound eligible search before pagination, canonical legacy links. Masthead: peer format navigation. MediaKey/ControlIcon: shared presentation; each actual media element remains state authority. ClipFeed: independent centered picture, finite scrolling. InterestEditor: shared onboarding/preferences hierarchy and explicit native selection. paperFold: inert current sheet over destination semantic HTML, bounded teardown.

## Baseline and decisions
Capacity C99/E234 GiB; workspace temp/browser paths. Baseline screenshots and geometry: output/playwright/reader-refinement/before. Matched three-repeat Radio timing: output/playwright/performance/refinement-before. Historical/current failed gate remains unchanged pending matched final results.

Home shell previously had zero inner padding, and its white spread began exactly at briefing text. Repair shared logical inset and paper background; keep asymmetric columns. Search/category previously used DiscoveryListing instead of Home. Snapshot scope now includes normalized query and category, with owner/mode checks.

Official references inspected: https://support.google.com/youtube/answer/7631406?hl=en (focused controls/seek keyboard); https://blog.youtube/news-and-events/youtube-shorts-experience-updates-features/ (portrait overlay hierarchy); https://github.com/Nodlik/StPageFlip (HTML soft/hard page candidate). No live authenticated TikTok/Reels interface inspection claimed. Chose bounded original clipped sheet/underside: no dependency, fixed book dimensions or persistent duplicate reader. Native Figma edits pending; no bridge writes claimed.

## Verification
In progress. Functional, motion/visual, performance, listening and owner acceptance remain separate. No completion claim from build alone.

## Measured corrections and evidence so far
Desktop Home and category page: shell x80/width1280 at1440; actual outer columns inset32px on both sides (previously0). Phone shared inset18px. The masthead rules align with those text edges. Filtered sparse editions do not repeat unrelated fixed articles.

Initial interaction suite: Home/category/search, explicit Next/Previous at normal speed with quarter/half/three-quarter frames, eight portrait centerline measurements, real playback/pause/seek/source panel and paused Back passed. Centerline error below0.01px. Portrait fitting uses measured page-chrome height; compact Clips heading preserves room in short windows.

Real-member tests passed core identity/setup/team-only scope/409 retention/personalization/privacy/hide/mute/bookmark/restart, then caught320px action-row overflow. Repair adds bounded grid columns and wrapped narrow actions. An earlier recording selector still expected the removed team link; corrected to actual native checkbox, not weakened data assertions. Final rerun pending.

22 mixed journeys passed unchanged lifecycle budget: warm1844 nodes/425 listeners, same root audio, no accumulated video/portal/fold. Chrome154,Edge155,Firefox157,WebKit27.2 passed bounded page2 reduced-motion, taxonomy navigation, H264/AAC play/pause and complete sources. Physical-device, screen-reader and listening acceptance remain unrun.

First-party YouTube references were accessible. TikTok support URL was inaccessible and Instagram help returned429; no live inspection of either interface claimed.

## Reproduction commands
Run individually in PowerShell at the repository root. Keep the existing supervisor; finish build before any browser checks.

```powershell
. ./scripts/stability-env.ps1
./scripts/npm.ps1 run build
./scripts/npm.ps1 run demo:restart-web
./scripts/npm.ps1 run demo:restart-api
# Only if supervisor is actually stopped: ./scripts/npm.ps1 run demo:start
# Existing retained PG55441; no reset/reseed/profile change.
& $aggregatorNode scripts/check-refinement-suite.mjs
& $aggregatorNode scripts/capture-reader-refinement.mjs after
& $aggregatorNode scripts/measure-refinement-performance.mjs --phase refinement-after --scenario radio --repeats 3
```

The baseline command used the original `measure-performance.mjs --phase refinement-before --scenario radio --repeats 3`. The final copy only changes the renamed Home navigation selector, preserving timings, work, catalogue and thresholds. Fresh baseline p95 was5.6–5.7ms, distinct from the previous checkpoint's7.2–7.4ms FAIL. Neither result erases the historical failure or explains the machine variation.


Final inspection found two further presentation defects and repairs: saved-interest tiles could appear before their account load completed, and a late caption-track load left Clips cues behind the new control bar. The editor now gates selection display on saved-state readiness; the caption track applies its raised line position on actual track load. These are being retested before checkpoint completion. Group choices-within counts use the typed navigation graph and do not select ancestors. Cancel unsaved changes restores the loaded saved rules.

No dependency or lockfile change was introduced. No migrations were edited or applied in this pass. All retained programme rendition IDs are compared with the starting catalogue in the final build identity report. The original11-high dependency finding and historical isolated-speech findings remain open; no fresh audit or release certification is implied by these UI tests.

## Final verified checkpoint

Final focused checks PASS: visual matrix, real member503/409 and Preferences scope/reload/API restart,22 lifecycle journeys, captures, matched measurement and build/catalogue identity. Earlier full connected suite also passes four engines, physical pointer/emulated touch, media edge cases and reader/member/source-link regressions.41 units, typecheck, lint, build and worker pass; secret canary/redaction/worktree scan passed. Hosted CI not run.

Matched performance: [{"dial": {"p95": 5.6, "p99": 5.7}, "queue": {"p95": 5.7, "p99": 5.7}, "controls": {"p95": 5.7, "p99": 11}, "discreteP95": 10.6, "audioPreserved": true}, {"dial": {"p95": 5.7, "p99": 5.7}, "queue": {"p95": 5.6, "p99": 5.7}, "controls": {"p95": 5.6, "p99": 5.7}, "discreteP95": 10.5, "audioPreserved": true}, {"dial": {"p95": 5.6, "p99": 5.7}, "queue": {"p95": 5.6, "p99": 5.7}, "controls": {"p95": 5.7, "p99": 11.1}, "discreteP95": 13, "audioPreserved": true}] before; [{"dial": {"p95": 5.6, "p99": 5.7}, "queue": {"p95": 5.6, "p99": 5.7}, "controls": {"p95": 5.6, "p99": 5.7}, "discreteP95": 10.1, "audioPreserved": true}, {"dial": {"p95": 5.6, "p99": 5.7}, "queue": {"p95": 5.6, "p99": 5.7}, "controls": {"p95": 5.7, "p99": 5.7}, "discreteP95": 10.5, "audioPreserved": true}, {"dial": {"p95": 5.6, "p99": 5.7}, "queue": {"p95": 5.6, "p99": 5.7}, "controls": {"p95": 5.6, "p99": 5.7}, "discreteP95": 10.6, "audioPreserved": true}] after. Current paired gate **PASS** with unchanged thresholds. Historical callback FAIL and CPU4 OPEN remain in the record; no causation claim.

Final warm lifecycle: 1844 nodes / 425 listeners, one persistent audio element. Build/client SHA256: `09814c71d36ed9eb58f8884abb58a58b8ead5eb21a33ef620f303be1dce5a678`.24 stories/23 unchanged programme renditions; no schema/dependency/media changes.

Local review with all captures and playable recordings (local-only evidence: `../../output/review/reader-refinement.html`). Member and interest recording (local-only evidence: `../../output/playwright/reader-refinement/members/page@ee0add9b41e0f549e63ef522142a3267.webm`). Paper turn recording (local-only evidence: `../../output/playwright/reader-refinement/journeys/page@2545ce634a10538165563e5a366b9952.webm`).

Changed components: Home index and legacy search/topic redirects; PublicationMasthead/main.css; ControlIcon/MediaKey; AppAudioHost,RadioReceiver,BroadcastVideoPlayer,ClipFeed,SaveStory; shared InterestEditor and Preferences; paperFold utility. Existing edition API/member proxy/domain gain validated q/topic and scope binding; taxonomy browsing gains typed inclusion/navigation annotations. Tests and handoff updated.

Limits: native Figma edits unperformed; owner visual/motion acceptance pending; subjective listening, physical devices, screen readers and genuine hidden-tab verification unperformed. Short viewports intentionally show a smaller fitted portrait. Source declarations remain fictional; no real reporting, model generation, staff/MFA, production or release readiness is claimed. Original dependency findings remain open. No reset/reseed, new rendering, upload, commit, push or deployment.
