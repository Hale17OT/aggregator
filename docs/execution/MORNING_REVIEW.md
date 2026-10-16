# Morning review — 13 October 2026

The local demo is running at **http://127.0.0.1:3000**. Captured mail: **http://127.0.0.1:8025**. See [ten-increment results](OVERNIGHT_PLAN.md) and [criterion results](ACCEPTANCE_RESULTS.md).

## Startup

From PowerShell in the existing workspace:

```powershell
cd E:\Hale\Coding\Personal\aggregator
./scripts/npm.ps1 run demo:start
```

It is already running at this checkpoint; do not launch a duplicate. The supervisor owns loopback Nuxt 3000, Express 4000, Mailpit 8025/1025, PostgreSQL 18 on 55441, an offline derivative validator and control 4301. Unknown targets are refused. The verified workspace database is retained; ordinary startup does not reset members.

```powershell
./scripts/npm.ps1 run demo:restart-api
./scripts/npm.ps1 run demo:stop
```

Clean dependency/tool reproduction before starting:

```powershell
./scripts/npm.ps1 ci
./scripts/npm.ps1 run tools:mailpit
./scripts/install-programme-tools.ps1
./scripts/npm.ps1 run programmes:generate
./scripts/npm.ps1 run build
./scripts/npm.ps1 run demo:start
```

Setup downloads pinned reviewed tools/models; normal generation/playback uses local assets. PostgreSQL uses the existing PostgreSQL 18 binaries (default C:/Program Files/PostgreSQL/18/bin); its data clusters are workspace-local. No system service/elevation is needed. Reset is separate: after stopping, `./scripts/npm.ps1 run demo:reset -- --confirm-reset-local-demo` verifies ownership and archives retained state. Reset was not executed during validation.

## Walkthrough

1. Open Home, browse a desk or Search, then a fictional article. Inspect Standard/Brief, inline media, citations and full bibliography. Twelve distinct stories span four desks; some dispatches deliberately have no image.
2. Open Radio, select the Alderwick edition and press Play. Navigate Home → article → Radio: the same audio element continues. Seek chapters, adjust rate and inspect sources. Hard reload offers resume and requires Play.
3. Open Newsroom, select solo then duo and press Play. Seek into the route illustration. Original Ada/Eli figures, mouth cues, captions, lower thirds and muted visuals follow one audio clock. Meaningful clip speech is in that soundtrack. Format switching pauses at a shared story boundary.
4. Open Sign in with a fictional address such as `morning-reader@example.test`. Open Mailpit on port 8025, follow the link and explicitly confirm. Preview GET alone does not authenticate. This proves captured-mail access, not external email ownership.
5. Save a story, visit My library, add/reorder the account queue and change Preferences. Opt into history, play and pause to save progress. Restart the API, then reload: session and data persist. Clear history deletes progress; logout revokes the session. Guest history is never silently uploaded.

Actual light/dark desktop/mobile captures and ordered interaction evidence (local-only evidence: `../../output/review/product-review.html`). This is the new product review, not reopened button packaging. No credential-bearing confirmation pages were captured.

## Actual media

Kokoro-js 1.2.1 uses pinned q8 model revision `1939ad2a8e416c0acfeecc08a694d14ef25f2231`: Ada `af_heart`, Eli `am_michael`, fictional clip narrator `am_puck`. Real WAVs are 24 kHz mono PCM. Rhubarb 1.14.0 estimates mouth cues; original SVG presenters render three mouth poses. Sentence timing derives from generated sample counts, not guessed equal intervals.

| Recording | Measured duration |
|---|---:|
| Shuttle full / brief | 253.725 / 87.275 seconds |
| Rain gardens full / brief | 77.250 / 50.700 seconds |
| River thermometers full / brief | 72.200 / 51.975 seconds |
| Continuous Radio edition | 261.550 seconds (4:21.55) |
| Newsroom solo / duo | 148.550 / 157.275 seconds |

Nine immutable WAVs, version-bound manifests and original permitted visuals persist locally. Assets require current eligibility checks and internal IDs; withdrawal/revision rejects new requests. Downloaded bytes cannot be recalled. The worker is an exclusive-claim filesystem spool, not distributed PostgreSQL jobs. Public articles/search remain fictional safe projections; database article/version prerequisites are unpublished foreign-key fixtures, not live aggregation or complete editorial persistence.

## Verification

- `./scripts/npm.ps1 run test:demo`: **all 12 commands passed**. Includes 32 unit tests, lint/typecheck, programme decoding/HTTP, seven auth groups, eight listening/DB groups, 28 discovery groups, 11 member-browser groups, 17 Radio and 29 programme checks, 36 reader cases / 12 Pretext observations, and 32 newspaper contexts / 14 journeys / four media checks. Aggregate (local-only evidence: `../engineering/demo-checks.json`).
- Seven migrations: fresh install, populated additive upgrades, no-op/checksum/failure rollback, 38 SQL assertions and six role groups. PostgreSQL identity: 14 groups, two API instances, pool isolation, revocation and bounded failure without memory fallback. Migrations (local-only evidence: `../engineering/database-checks.json`), identity (local-only evidence: `../engineering/identity-db-checks.json`), listening (local-only evidence: `../engineering/listening-db-checks.json`).
- Positive progress and session/bookmark/queue/preferences survived API restart without reseeding. A full supervisor stop/start preserved six member-table snapshots and database system ID; that snapshot had zero progress rows after clear-history. Members (local-only evidence: `../engineering/member-demo-checks.json`), full cycle (local-only evidence: `../engineering/demo-cycle-checks.json`).
- Delayed actual video and actual 404 paused narration; retry/resume restored synchronization. Controls: eight contexts, 48 contrast measurements and eight behavior groups on a separate development server; the controls lab intentionally returns 404 in the built app. Recovery (local-only evidence: `../engineering/media-recovery-checks.json`), controls (local-only evidence: `../engineering/control-checks.json`).
- Clean installation, tests, lint, typecheck, build and worker passed with unchanged root lockfile. Secret scan/canary passed. CI configuration statically validated; **hosted CI NOT RUN**. Reproducibility (local-only evidence: `../engineering/reproducible-install.json`), secrets (local-only evidence: `../engineering/secret-scan.json`), CI (local-only evidence: `../engineering/ci-validation.json`).

Additional commands: `run test:db`, `run test:identity:db`, `run check:secrets`, `run check:ci`, `run check:repro` through `./scripts/npm.ps1`. Demo tests require the supervised stack. Controls were checked using Nuxt dev on port 3011 and `BROWSER_BASE=http://127.0.0.1:3011`.

## Partial or blocked

Native Figma additions: disconnected bridge. AUD07: headed/headless Chrome continued audio but remained classified visible; genuine hidden-tab behavior unverified. Physical mobile, Safari/Firefox and screen-reader checks NOT RUN. Browser 320/390/834/1440 reflow and 200% text checks are not universal accessibility certification.

Saved rate/anchor preferences affect playback; theme/text size/reduced motion apply on the client. Only prepared voices are selectable. Media-treatment preference has an explicit fallback because both treatments occur in the fixed programme rather than separate alternatives. Owner listening/visual review is pending.

Root audit: **11 high, zero critical**. Isolated speech runtime: **three high, four moderate**, no compatible fix reported. Root license inventory: 844 locked / 770 installed, 22 notice follow-ups; speech redistribution needs recorded GPL/other notices. No security gate disabled or incompatible downgrade forced. No photorealism, external email delivery, live-source aggregation, publication or release readiness claimed. WP02/WP03/WP04 remain incomplete.

Next bounded identity task: specify/test staff capability and recent-MFA assurance, including denial of all staff/publication actions to local-demo reader sessions. External identity/account linking needs separate implementation and verification. [Owner actions](OWNER_ACTIONS.md).

