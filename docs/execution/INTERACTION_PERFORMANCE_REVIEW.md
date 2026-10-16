# Radio interaction and presenter performance checkpoint

13 October 2026. Existing application refined, not rebuilt. Staff/MFA PAUSED. Retained PostgreSQL, member data, captured-mail sign-in, newspaper, general controls, native root audio and eligibility-controlled prepared video preserved. No migrations/reset/reseed, paid call, external email, asset upload, commit, push, publication or new supervisor.

Playable review hub (local-only evidence: `../../output/review/quality-rebuild.html`) · [Radio](http://127.0.0.1:3000/radio) · [Newsroom](http://127.0.0.1:3000/newsroom).

## Implemented

The former knob faces were decorative spans; reproducing actual pointer arcs left volume/time unchanged. `RadioDial.vue` now owns the face input and captures the primary pointer. Relative angular deltas cross the seam safely, a center dead zone resets the angle, clamped raw values reverse immediately at stops, and capture/Escape/blur/revision/error/unmount cancel cleanly. Volume changes the same native root element immediately; native setter limitations expose a device-volume message. Mute remembers a nonzero value. Volume remains session-only because the existing preference schema has no volume field. Story drag updates preview text only; release commits one seek while retaining pause/play state. Keyboard, step buttons and synchronized native ranges remain alternatives.

`performance.mjs` refines existing artwork with parameter-level mouth coarticulation, immediate closure shapes, continuous lids, authored gaze/brow/attention handoffs, independent head motion, constrained connected arm geometry and deliberate gestures with rests. No new camera cuts or narration were added. Same-audio range 100–155 seconds was played at 1× before/after. An initially too-low hand rest was repaired before the final pilot and full programme renders. New immutable identities cover scene and performance code plus programme/render inputs.

Both complete updated programmes are integrated through the existing eligibility import. Solo 148.55s / 4,457 frames; duo 157.275s / 4,719 frames. H.264/AAC 1280×720, 30fps. Video remains the sole Newsroom time/sound authority. Full render reports list exact content files under `.cache/programmes/assets`; the review hub links them relatively. Original animated presenters, not photorealism.

Shared controls are adopted on Radio, Newsroom, Search, Sign in, Library and Preferences. [Inventory, tokens, migration checklist and native exceptions](../design/INTERACTIVE_CONTROLS_HANDOFF.md). [Pinned repository-use and license decisions](../engineering/REFINEMENT_REPOSITORIES.md). AutoAnimate is confined to the guest queue; Reka supplies accessible Select/Combobox primitives. img2threejs informed an executed bounded object/pivot study, evaluated NOT ADOPTED; incomplete character tooling is not a presenter dependency. Brag's actual inspected/planned/composed/checked/rendered local workflow produced a separate 24-second showcase.

## Deliverables

- Uncut actual knob recording (local-only evidence: `../../output/playwright/interactive-controls/knob-interaction.mp4`), before (local-only evidence: `../../output/playwright/interactive-controls/before-controls.png`), after (local-only evidence: `../../output/playwright/interactive-controls/dials-light-1440.png`). Native captureStream is source-media capture, not post-gain loudness proof; wall-time audio alignment is approximate.
- 55-second normal-speed comparison (local-only evidence: `../../output/review/performance/comparison.mp4`), full-size before (local-only evidence: `../../output/review/performance/before.mp4`), full-size after (local-only evidence: `../../output/review/performance/after.mp4`). One unchanged-narration soundtrack; no extra edit boundaries. Source range and original file paths in comparison.json.
- Complete solo record and file locations (local-only evidence: `../engineering/broadcast-solo-render.json`), complete duo (local-only evidence: `../engineering/broadcast-duo-render.json`); selectable captions/sources in actual Newsroom.
- Actual selection/validation recording (local-only evidence: `../../output/playwright/interactive-controls/selection-validation.mp4`), silent. No corrected address was submitted.
- Brag showcase (local-only evidence: `../../output/review/brag/brag.mp4`), poster (local-only evidence: `../../output/review/brag/poster.png`), storyboard (local-only evidence: `../../output/review/brag/brag-plan.md`). Edited presentation, separate from verification.

## Verification and limits

Functional: 14 direct-dial groups plus seven edge groups, ten enhanced-control groups, six member-control groups, six rendered contrast measurements, eleven real sign-in/member groups including owned API restart, 17 Radio groups, 15 prepared-video groups, four asset eligibility groups, seven performance groups across 4,766 frames and five scene groups. Unit suite 33 passes; types/lint/build/worker and clean lockfile installation pass. The clean snapshot preceded the final queue focus repair; that follow-up passed three queue groups, types, lint and a fresh build/owned restart separately. Reader 36 cases/12 Pretext observations; newspaper 32 cases/14 journeys/four media checks. Reports under docs/engineering carry exact dates and scope. These are local checks, not hosted CI.

Both full programmes and the comparison/raw recordings/showcase actually played at 1× through their endings in Chrome, with advancing screenshots inspected. Sustained medium/handoff shots were reviewed; this is sampled visual review, not a claim of frame-by-frame inspection. OWNER visual/motion acceptance remains pending. Direct subjective listening, physical-device volume/touch, assistive technology and other browser engines were not performed. Hidden-tab behavior remains partial. Baked video does not become motionless under CSS reduced motion.

Faults encountered: reader tests launched while the existing build directory was being replaced hit missing assets; after build and owned restart, both reader suites passed. A full render stalled before watchdog hardening; only its verified owned process tree was stopped, then complete renders succeeded. Injected renderer failure exits and leaves no matching owned FFmpeg process; frame/encoder waits now time out. System drive temporary space was low; Hyperframes-only TEMP/TMP was redirected to workspace E:, preserving unrelated files. Showcase full check passed with zero errors, 12/12 contrast and two nested-layout warnings; actual frames were inspected. No contrast/security gate was disabled.

Root audit remains 11 high; isolated speech runtime three high/four moderate remain prior open findings. Product license inventory: 861 locked, 787 installed; 22 distribution-notice follow-ups. Reka and AutoAnimate added 17 exact lock entries, lifecycle scripts disabled. tslib 0BSD was reviewed before adding its license classification. Secret-scan canary/redaction and worktree pass; generated cache artifacts are outside source scan coverage. No release authorization or whole WP02/WP03/WP04 completion is implied.

## Exact local commands

Run from `E:\Hale\Coding\Personal\aggregator`. The demo is already supervised; do not start another copy. If stopped, `./scripts/npm.ps1 run demo:start` uses the retained target. Verified after edits: `./scripts/npm.ps1 run build` then `./scripts/npm.ps1 run demo:restart-web`. Owned API-only restart: `./scripts/npm.ps1 run demo:restart-api`. Reader :3000, API :4000, captured mailbox :8025, retained PostgreSQL :55441.

Use direct Node for argument-bearing render commands; PowerShell/npm forwarding dropped bare options during one benchmark attempt:

```powershell
$node = './.cache/runtime/node-v22.22.3-win-x64/node.exe'
& $node scripts/render-broadcast.mjs --mode pilot --variant duo --start 100 --duration 55
# Inspect the pilot before these full runs.
& $node scripts/render-broadcast.mjs --mode full --variant solo --pilot-reviewed
& $node scripts/render-broadcast.mjs --mode full --variant duo --pilot-reviewed
& $node --import tsx scripts/import-broadcast.mjs solo
& $node --import tsx scripts/import-broadcast.mjs duo
& $node scripts/build-performance-comparison.mjs
& $node scripts/record-knob-interaction.mjs
& $node scripts/record-control-selection.mjs
& $node scripts/build-brag-showcase.mjs
./scripts/hyperframes-local.ps1 check .cache/brag-showcase
./scripts/hyperframes-local.ps1 render .cache/brag-showcase --output E:/Hale/Coding/Personal/aggregator/output/review/brag/brag-render.mp4 --quality high --fps 30 --low-memory-mode
& $node scripts/finish-brag-showcase.mjs
& $node scripts/inspect-refinement-artifacts.mjs
& $node scripts/build-refinement-review.mjs
```

The render files record the exact renderer hash used; later diagnostic-comment/watchdog maintenance can create a new render identity without changing the performance. Existing files are never overwritten under an old content hash. Isolated showcase runtime remains `.cache/showcase-tools` (Hyperframes 0.8.152); wrapper forbids publish/auth commands, removes provider credentials, and disables telemetry/update/automatic installs.

Verification commands: `./scripts/npm.ps1 run lint`, `run typecheck`, `test`, `run build`, `run check:repro`, `run check:licenses`, `run check:secrets`, `run test:member:demo`, `run test:radio:ui`, `run test:broadcast:ui`, `run test:broadcast:assets`, `run test:browser`, `run test:newspaper`. Focused companions run with `$node`: `check-radio-dials.mjs`, `check-dial-edges.mjs`, `check-enhanced-controls.mjs`, `check-controls-member.mjs`, `check-control-contrast.mjs`, `check-queue-refinement.mjs`, `check-performance.mjs`, `check-broadcast-scene.mjs`.

Principal changed files: components RadioDial/RadioReceiver/ControlSelect/ControlCombobox/ControlSwitch; root useProgrammeAudio and useQueueAnimation; Radio/Newsroom/Search/Sign-in/Library/Preferences pages; prepared-video player; fields.css; packages/broadcast/performance.mjs and scene.mjs; renderer, test companions and review builders; exact dependency locks/licenses and this handoff. No backend/schema changes this refinement. Next bounded work is owner performance/listening review and remaining accessibility/device checks. Staff/MFA stays paused until the owner changes that boundary.
