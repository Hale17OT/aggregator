# Local programme delivery and coverage

13 October 2026. RNM-F02/SC02, RNM-F03/SC03, RNM-F05/SC05 and RNM-FL01; existing WP04 identity and editorial release dependencies remain separate.

All stories are explicitly fictional existing article revisions. No source ingestion, external delivery, paid model calls, uploads, publication or retained-database reset occurred. Original animated presenters are not photorealistic. Native Figma remains pending.

## Prepared catalogue

| Programme ID | Story / version | Format / treatment | Duration | Ready |
|---|---|---|---:|---|
| `newsroom-shuttle-solo-visual` | evening shuttle / `00000000-0000-4000-8000-000000000002` | Ada; narration over attributed visuals |129.675s|Imported H264/AAC, captions, poster, source map|
| `newsroom-shuttle-duo-visual` | same | Ada/Eli; narration over attributed visuals |138.400s|Imported|
| `newsroom-shuttle-solo-clip` | same | Ada; illustration narrator followed by presenter commentary |148.550s|Imported|
| `newsroom-shuttle-duo-clip` | same | Ada/Eli; illustration narrator followed by presenter commentary |157.275s|Imported|
| `newsroom-gardens-solo-visual` | rain gardens / `00000000-0000-4000-8000-000000000102` | Ada; attributed typographic evidence |77.250s|Imported|
| `newsroom-gardens-duo-visual` | same | Ada/Eli; attributed typographic evidence |80.150s|Imported|
| `newsroom-alderwick-solo` | evening shuttle / same current revision | Original mixed edit, Ada |148.550s|Existing programme rerendered for demonstrated continuous-camera repair|
| `newsroom-alderwick-duo` | same | Original mixed edit, Ada/Eli |157.275s|Existing programme rerendered for demonstrated continuous-camera repair|
| `radio-civic-evening` | evening shuttle + rain gardens, full existing narration | Civic evening: transport/public spaces |330.975s|Ready WAV, exact chapters/source bindings|
| `radio-field-notes` | river thermometers + rain gardens, full existing narration | Field notes: measurement/uncertainty |149.450s|Ready WAV, different selected stories/order|

The previous six single-story full/brief Radio recordings and original selected edition remain available, yielding17 catalogue entries (nine Radio, eight videos). Rain-garden clip/commentary, river Newsroom video, and additional voices are not prepared. A saved preference for an unavailable combination yields an explicit unavailable state and named temporary alternatives; it does not silently play another story or overwrite the preference.

The two primary treatments have different scripts, durations and edits: the visual treatment removes the illustration-narrator segment; the clip treatment keeps its separate introduction/narrator and following presenter commentary. Gardens uses honest attributed text evidence rather than shuttle imagery. Shot intention, gesture timing, labels and evidence text are segment data; no gardens-specific Vue page or renderer slug branch was added.

## Identity, rights and import boundary

`docs/next-build/programme-delivery.json` is the sole allowlisted recipe configuration. Only the existing three fictional stories and validated source programmes are accepted. Preparation identity includes configuration, article/evidence revisions, input asset identities, script, voice/model and preparation code. Video identity additionally includes renderer/performance source and settings, treatment/anchors, output hashes and source bindings. Old referenced assets remain intact until a validated replacement is indexed.

Preparation reuses compatible immutable speech/PCM and cues, lazily loads the local CPU speech model only on a cache miss, and never performs remote model retrieval. The single-machine filesystem spool uses exact-key ownership and dead-PID recovery; an additional worker claim prohibits simultaneous recipe workers. Work is sequential, encoding uses two threads, each owned child has a20-minute deadline, and workspace free space must exceed2GiB. This is not a distributed processing-jobs system. System-drive free space fell from5.9GB to about1GB during the run; browser temporary files were moved to the workspace drive, with no unrelated cache deletion or process termination.

Spool records describe the last executed stage, not aggregate catalogue readiness: re-running `prepare` confirms audio/scene preparation and does not promote a video in that stage. Existing validated derivative-index entries remain served. Use the eligibility-filtered `/api/v1/programmes` response and import report for current prepared-video availability; do not read a stage-local `videoReady:false` as revocation of an already imported rendition.

Import verifies full duration, H264/AAC1280×72030fps, checksum, decode, current article/evidence/rights eligibility, exact source assets/segment timing/block/claim/source/visual binding, and exact caption text and proportional sentence timings. Renderer-derived phoneme shape names are separately validated; they are not falsely compared to absent raw phonemes in the base speech manifest. Sentence subdivisions remain estimated, not word alignment. Protected video/ancillary URLs reevaluate current eligibility; withdrawal of the shuttle blocks its six videos without disabling unrelated garden programmes. Already delivered bytes cannot be recalled.

Evidence: `programme-checks.json` (17 PCM/manifest results), `broadcast-assets-checks.json` (10 HTTP groups), `import-binding-checks.json` (altered captions/map rejected before promotion), `delivery-recovery.json` (injected prepare/render failure, safe retry, competing worker refusal), `programme-delivery-preparation.json` (all eight repeated requests reused), `broadcast-*-render.json` (complete immutable file paths and render identities). One unrelated dead-PID lock predating this run was preserved and explicitly distinguished from tested job cleanup.

## Cross-format and member behavior

Read/Listen/Watch availability matches the exact article version. Shared section IDs map to the target script's own section start, otherwise its story boundary; seconds/percentages are not transferred across scripts. Explicit unknown programme IDs and stale article versions never fall back to unrelated defaults. Same-page query changes apply their paused handoff too. Library resume additionally requires the exact video rendition identity.

Only media-identity/section query fields trigger a handoff. Theme-only navigation preserves the current media instance, time and playing state. New cross-format and transcript links retain explicit Light/Dark intent (`media-theme-continuity.json`). Quick interrupted Back to a newspaper section waits for the actual target with bounded observer cleanup, so asynchronous media availability cannot strand the reader at the top; existing no-JavaScript navigation is unchanged.

Newsroom shows saved preference separately from current selection. Changing anchor count or treatment pauses and maps the shared section, with a deliberate Play action to continue; changing a temporary selection does not save preferences. Prepared video owns muxed sound/time; Radio pauses only on a deliberate video playback/selection action, and listening instead removes the competing video.

`programme-delivery-ui.json` verifies an owned captured-mail member journey through Home→Read→Radio with real dial/dropdown interaction→Read→preferred duo clip video, source links, treatment change, unavailable second-story preference and temporary alternative, failed preference save, retained API restart, exact paused resume, and logout. `programme-handoff.json` covers the guest path/missing/stale revision. `broadcast-video-ui-checks.json` covers all four speeds, seeking/captions, held/denied requests, no-JS transcript and media ownership. No captured token is recorded in these artifacts.

## Exact local commands

PowerShell from `E:\Hale\Coding\Personal\aggregator`:

```powershell
$aggregatorNode = '.\.cache\runtime\node-v22.22.3-win-x64\node.exe'
# Existing owned demo is running. Use this only if stopped; it retains PG18/member data:
./scripts/npm.ps1 run demo:start
# After a source build, never during browser measurements:
./scripts/npm.ps1 run build
./scripts/npm.ps1 run demo:restart-api
./scripts/npm.ps1 run demo:restart-web

& $aggregatorNode --import tsx scripts/deliver-programmes.mjs --stage prepare
& $aggregatorNode --import tsx scripts/deliver-programmes.mjs --stage pilot
# Inspect actual normal-speed pilots before advancing. Clip pilot can include the cutaway:
& $aggregatorNode --import tsx scripts/deliver-programmes.mjs --stage pilot --id newsroom-shuttle-duo-clip --start 60
& $aggregatorNode --import tsx scripts/deliver-programmes.mjs --stage full --pilot-reviewed
& $aggregatorNode --import tsx scripts/deliver-programmes.mjs --stage import
```

These stages were executed against the retained workspace. The `--pilot-reviewed` flag records tool-assisted inspection, not owner acceptance. Full mode refuses a pilot with a different base/source/renderer identity. Repeat an interrupted stage with the same config/ID; no reset/reseed or asset purge is needed. Never delete a live claim to force concurrency. A known unrelated dead-PID claim is recovered only when its exact key is requested. Changing configuration/code can legitimately create a new identity and require a new matching pilot.

Working routes: `http://127.0.0.1:3000/articles/alderwick-evening-shuttle`, `/articles/alderwick-rain-gardens`, `/radio?programme=radio-civic-evening`, `/radio?programme=radio-field-notes`, `/newsroom?programme=<ID above>`, `/preferences`, `/library`; local captured mailbox on8025. API4000, supervisor4301, retained PostgreSQL55441; disposable-test PostgreSQL55440 remains separate.

Final timing/continuous-playback status is in `PERFORMANCE_RESULTS.md`, not inferred from import success. All eight videos and both new Radio editions reached their endings at 1× in the application; the24 lightweight video windows recorded zero drops/waits. Owner visual/motion acceptance and subjective listening remain pending; staff/MFA stays paused.

Verified regression/measurement commands (run sequentially; no builds or rendering during measurements):

```powershell
$env:TEMP = Join-Path (Get-Location) '.cache/test-tmp'
$env:TMP = $env:TEMP
./scripts/npm.ps1 run check:repro
./scripts/npm.ps1 run check:secrets
./scripts/npm.ps1 run check:ci
& $aggregatorNode scripts/check-radio-dials.mjs
& $aggregatorNode scripts/check-dial-edges.mjs
& $aggregatorNode scripts/check-programme-delivery-ui.mjs
& $aggregatorNode scripts/check-media-theme-continuity.mjs
& $aggregatorNode scripts/measure-performance.mjs --phase final --scenario radio --repeats 3
& $aggregatorNode scripts/measure-performance.mjs --phase final --scenario radio --repeats 3 --cpu 4
& $aggregatorNode scripts/measure-player-lifecycle.mjs final
& $aggregatorNode scripts/measure-performance.mjs --phase final --scenario video --repeats 3 --player app --complete
& $aggregatorNode scripts/check-complete-editions.mjs
& $aggregatorNode scripts/summarize-performance.mjs
```

The CPU4× command is diagnostic and exposes an unresolved limitation. Full playback checks take real programme time. The delivery UI test performs only an owned API restart and uses owned fictional member records. Recovery was exercised with controlled failure injection; normal recovery is simply repeating the same failed stage/ID after its owned process has exited, preserving successful immutable outputs.

