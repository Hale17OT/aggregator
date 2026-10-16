# Reader completion checkpoint — 14 October 2026

Owner-authorized local reader implementation. Staff/MFA remains paused. Private source-to-draft output remains private. Existing newspaper, controls, 17 prior programmes and retained members are preserved. This is not release or real-news authorization.

## Feature matrix

| Outcome | Implemented | Verification / remaining gate |
|---|---|---|
| Centered dropdown | One shared original SVG in Select/Combobox. Portalled combobox has its own bounded scroll area for the expanded catalogue. | 64 real trigger cases, four widths and Light/Dark; before/after crops and control regressions. Owner acceptance pending. |
| Six Clips | Six original 720×1280/30fps H264/AAC videos across five stories/four desks,32.825–109.325s. Captions, sources, transcript, finite feed, permalink, save, exact-section article links, exclusive playback and paused restoration. | Pilot inspected before expansion; all six decoded; encoded duration boundaries, range/revocation/corruption, play rejection/native pause/end/wheel/keyboard/Back tests. Physical touch, subjective listening and owner quality acceptance not claimed. |
| Durable interests |390 authored topics/24 groups plus six typed entities. Exact Sports→Football→Premier League→Manchester City men's team; team scopes, follow/mute, skip/zero/clear, private durable edits and readable saved labels. | PostgreSQL/API owner/CSRF/concurrent200/409/restart; actual browser409 draft preservation. Current catalogue has no retired nodes; future retirement UI is not certified. |
| Personalization | Exact-version material subjects; explicit topic/entity/team-AND-competition matching; mutes/hides/reasons; owner-bound editions and honest sparse coverage. Independent of passive history. | Two real local accounts receive different relevant/empty feeds; repeat Clip save creates one article bookmark. No invented real-team news. |
| Paper pagination |24 distinct fictional stories, four six-slot spreads, stable opaque edition, URLs, Previous/Next, rightward/reversed animation, reduced motion, cancellation and failed-request retention. | Painted-direction measurement, recording, three-page/Back/no-JS, rapid navigation and failure tests. Bounded in-memory edition cache expires honestly on API restart. |
| Integrated reader | Available Read/Radio/Newsroom/Clips links, section identity rather than cross-script seconds; hubs, source directory, methodology and Clips-only saved filter. | Preserved source/member/media regressions and new mixed journeys. Native Figma remains pending; no live-provider/staff functionality implied. |

## Database and taxonomy

Retained PG18 stays on55441, system7695936575750370884. Product startup explicitly pins0001–0011. Original0001–0008 bytes were preserved. 0009 extends topics/follows and private interest state;0010 adds exact version subject assertions;0011 restricts runtime assertion reads to the current public projection. The inaccurate earlier0009 comment about article_topics being version-bound is corrected in DECISIONS without changing its checksum.

Each upgrade used a private custom dump, distinct attested clone restore and full ordered tests before retained mutation. Backups stay under `.cache/completion-backups`, outside review assets. Eight member-state table hashes and11 migration checksums matched across a real owned full restart. Fresh/upgrade/no-op/checksum/rollback passed42 SQL assertions/six role groups. Evidence: `docs/engineering/completion-upgrade*.json`, `retained-reader-upgrade*.json`, `completion-full-restart.json`, `READER_INTEREST_MIGRATION_REVIEW.md`.

The396-concept authored catalogue is not every global entity. Official IPTC snapshot2026-07-02 contains1393 concepts under CC BY4.0, retained separately rather than imported wholesale. Only reviewed football mapping medtop:20001065 is used; other topics remain authored/unmapped. Metadata/checksum: `docs/engineering/interest-metadata.json`. Real-team identity has no invented news or logo. Positive team reporting uses explicitly fictional Juniper Athletic.

## Morning walkthrough

1. Open http://127.0.0.1:3000/. Turn through pages2/3, open a story and return with Back. Repeat with reduced motion.
2. Use `/sign-in` with a new fictional `@example.test` address, then captured mailbox http://127.0.0.1:8025. Explicitly confirm; browse Sports→Football (soccer)→Premier League→Manchester City men's first team. Follow and preview honest empty coverage. Save or Skip.
3. Edit `/interests`. Follow Juniper Athletic for a positive Home example, or Climate and environment for matching Clips. Opening a group never follows it; team competition scope is explicit.
4. Open `/clips` or `/clips?mode=following`. Play, Next/wheel/PageDown, Sources/transcript, Save, Read full story, Back paused. Switch Radio/Newsroom/Clips with one sound owner.
5. Other routes: `/interests/agg:team:manchester-city-men`, `/sources`, `/methodology`, `/library`, `/preferences`, `/radio`, `/newsroom`. Anonymous article/source/Clip detail remains SSR-readable without JavaScript.

## Commands

From `E:\Hale\Coding\Personal\aggregator`, use separate PowerShell invocations for the npm wrapper. The owned demo is intended to remain running; do not start a duplicate supervisor.

```powershell
. ./scripts/stability-env.ps1
# Only if the existing supervisor is stopped:
./scripts/npm.ps1 run demo:start
# Finish build before restarting web or running browsers:
./scripts/npm.ps1 run build
./scripts/npm.ps1 run demo:restart-web
./scripts/npm.ps1 run demo:restart-api
./scripts/npm.ps1 run test:reader-completion
./scripts/npm.ps1 run test:db
./scripts/npm.ps1 test
./scripts/npm.ps1 run typecheck
./scripts/npm.ps1 run lint
./scripts/npm.ps1 run worker:check
./scripts/npm.ps1 run check:secrets
./scripts/npm.ps1 run check:licenses
```

The environment script checks capacity and scopes temporary files/browser cache to verified E: paths. Matched engines use `.cache/stability-browsers`; no global browser replacement. A clean source snapshot passed npm ci, lint, typecheck,40 tests, build and worker, with unchanged lock and guarded AutoAnimate patch; see `reproducible-install.json`.

Render commands executed: `& $aggregatorNode --import tsx scripts/render-clips.mjs --pilot`, then `& $aggregatorNode --import tsx scripts/render-clips.mjs`. Existing local Kokoro/FFmpeg caches only. Exact renderer used is archived in `.cache/clip-render/renderer-used.mjs`, with hash in `clip-render.json`. Current renderer includes later lint/report-field edits; its changed hash intentionally creates a new rendition if rerun. Reuse delivered assets for the morning demo. No old programme was regenerated.

## Evidence and limits

- Uncut page-turn / interests / Clips recording (local-only evidence: `E:/Hale/Coding/Personal/aggregator/output/playwright/completion/page@bcd22ba31e3d5f9bf7c830a421b320b7.webm`)
- Chevron before (local-only evidence: `E:/Hale/Coding/Personal/aggregator/output/playwright/completion/before-radio-390-light.png`) / after (local-only evidence: `E:/Hale/Coding/Personal/aggregator/output/playwright/completion/after-radio-390-light.png`)
- Exact team path (local-only evidence: `E:/Hale/Coding/Personal/aggregator/output/playwright/completion/sports-path.png`)
- Actual rightward turn (local-only evidence: `E:/Hale/Coding/Personal/aggregator/output/playwright/completion/paper-next-right.png`) / reverse (local-only evidence: `E:/Hale/Coding/Personal/aggregator/output/playwright/completion/paper-previous-left.png`)
- Clips screen (local-only evidence: `E:/Hale/Coding/Personal/aggregator/output/playwright/completion/clips-final.png`)

Machine results under docs/engineering: reader-completion-checks, paper-turn-checks, completion-edge-cases, completion-lifecycle, completion-engines, interests-db-checks, clip-services and clip-boundaries JSON files. Images/uncut navigation recording are under output/playwright/completion; reader-completion-checks.json identifies the current recording.

Fresh root audit11 high;861 locked licenses/787 installed,22 notice follow-ups. Historical isolated speech audit3 high/4 moderate. Secret canary/redaction/worktree and static CI checks pass; hosted CI is not run. Slower-CPU popup/list issue remains unresolved. No physical-device, screen-reader, genuine hidden-tab, subjective listening, native Figma or new owner acceptance claim. No whole WP05–WP10 completion or production readiness claim.

Final secret scan initially classified six source-file SHA256 values as generic keys because filenames contained auth/token/secret terms. The identity report now records explicit separate path/sha256 fields. The scanner and rules were unchanged; canary/redaction and the145.23MB worktree scan pass. Redacted diagnostic evidence remains private in `.cache/completion-final-secrets-redacted.json`.

### Final reference measurements

The **current desktop callback gate fails**: dial p95 7.2/7.2/7.4ms and queue p95 7.2/7.1/7.5ms exceed the unchanged7ms limit. Dial p99 7.5–7.6ms is below11.2ms; discrete response p95 13.1/13.5/13.0ms is below100ms. An empty document in the same headless Chrome/viewport also measured p95 7.4ms, suggesting an environmental contribution without establishing causation. The gate is not normalized away or labelled passed. The historical desktop pass remains historical; CPU4 remains open.

Reused solo/duo videos dropped5/1830 (0.273%) and7/1830 (0.383%) frames respectively, both below0.5%, with zero buffering waits in61-second visible intervals. Final22 mixed journeys settle at1,841 nodes/419 listeners after warm-up, one persistent root audio and exclusive media ownership. The actual expanded catalogue is24 articles/23 programmes; no whole-catalogue causal comparison with the old17-programme fixture is claimed. See `completion-performance.json` and raw `output/playwright/performance/completion-final` reports.

Measured commands:

```powershell
& $aggregatorNode scripts/measure-performance.mjs --phase completion-final --scenario radio --repeats 3
& $aggregatorNode scripts/measure-performance.mjs --phase completion-final --scenario video --repeats 1 --player app --ids 'newsroom-shuttle-solo-visual,newsroom-shuttle-duo-clip'
& $aggregatorNode scripts/check-completion-cadence.mjs
& $aggregatorNode scripts/check-reader-regressions.mjs
```

The corrected Library regression passes. Actual CDP touchStart/move/end advances the portrait feed while paused with one mounted player; this is emulation, not physical-device certification. Detailed runbook criteria and remaining subcase gates are mapped in `docs/engineering/completion-acceptance-matrix.json`.

## Delivered portrait files

- `clip-rain-garden-trial`: 56.375s — MP4 (local-only evidence: `E:/Hale/Coding/Personal/aggregator/.cache/programmes/assets/385bec76ed9058bd7edfcfe5e0595fa3219197989da2c4aab0cfabd4bf6017ca.mp4`) — [reader](http://127.0.0.1:3000/clips/clip-rain-garden-trial)
- `clip-river-placement`: 69.175s — MP4 (local-only evidence: `E:/Hale/Coding/Personal/aggregator/.cache/programmes/assets/eb4cca9d58316668ec3dbd9c74d4efbfca8eae35aa2859ae454dcc9784ce0117.mp4`) — [reader](http://127.0.0.1:3000/clips/clip-river-placement)
- `clip-repair-tool-shelf`: 64.9s — MP4 (local-only evidence: `E:/Hale/Coding/Personal/aggregator/.cache/programmes/assets/d64eb6abf81af64dad943f3ca53fdddadfc6175cb1e7ac1d0e3e027cdc1f3db1.mp4`) — [reader](http://127.0.0.1:3000/clips/clip-repair-tool-shelf)
- `clip-market-arrivals`: 32.825s — MP4 (local-only evidence: `E:/Hale/Coding/Personal/aggregator/.cache/programmes/assets/4fbe3c3f93a00f60863b59f56e244dce96463496d67c0e12ff55e1c46e1ec14e.mp4`) — [reader](http://127.0.0.1:3000/clips/clip-market-arrivals)
- `clip-shuttle-evidence`: 100.325s — MP4 (local-only evidence: `E:/Hale/Coding/Personal/aggregator/.cache/programmes/assets/cdb4189919f4f06d3b11b666d9ff47581705de029575afea8a12d8ce8821deee.mp4`) — [reader](http://127.0.0.1:3000/clips/clip-shuttle-evidence)
- `clip-shuttle-questions`: 109.325s — MP4 (local-only evidence: `E:/Hale/Coding/Personal/aggregator/.cache/programmes/assets/eed983004c3ee85326db5e443ce3ee81af65684a66ae2a5bb861fa156fd93f80.mp4`) — [reader](http://127.0.0.1:3000/clips/clip-shuttle-questions)
