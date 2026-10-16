# Local source-to-draft engine — connected checkpoint, 14 October 2026

Authorized 13 October 2026. Staff/MFA remains paused; no external providers,
reader promotion or media work. Previous stability STOP is superseded only for
this connected checkpoint. C110.05/E237.64 GiB preflight; scoped E: temporary paths.

## Schema-to-service mapping and migration review

WP05/F19/F20: sources, source_reviews, source_endpoints, rights_grants supply
identity, suitability, endpoints and independent use decisions. Trusted fixture
provisioning is separate from document manifests. No human reviewer is fabricated.
WP06/F20: source_items, source_item_versions, source_observations and processing_jobs
hold stable identity, raw/extraction lineage, every operation and durable completion.
WP07/F06: supplied transcript intervals are stored alongside normalized text;
link-only video and feed metadata cannot become evidence.
WP08/F07/F21: story_clusters/cluster_items and reporting_origins/item_origins keep
machine event candidates separate from simulated fixture origin declarations.
WP09/F22: evidence_spans, claims and claim_evidence bind exact UTF-16 normalized
spans to candidate propositions. Existing composite keys enforce version binding.
WP10/F23: articles remain draft with null public pointer; article_versions,
variants/blocks/claims/sources/citations and generation_runs retain output lineage.

Migration0008 preserves0001–0007. Reviewed gaps: old UNIQUE(item_id,content_hash)
cannot represent a parser or rights revision of identical raw bytes; replace with
item/raw/parser/grant/metadata-context identity. Add operation key and bounded candidate key.
Small permitted bodies use private PostgreSQL bytea in source_payloads (256KiB
limit), not a public asset path. evidence_packages freezes canonical manifests.
Runtime is append-only; no ownership, member/session, grant mutation, review,
publication event or outbox privileges. Insert guards reject published pointers
and impersonated/approved versions even under SET ROLE. Provisioning supplies
agg_pipeline/agg_pipeline_login only on isolated harness targets.

Serialization boundary: local engine operations take a transaction advisory lock,
and lock source/grant rows against concurrent revocation while reading/committing.
Present-day access re-evaluates policy, latest observation and origin declarations.
Exports are escaped private snapshots; exported bytes cannot later be recalled.
Retention access fails closed; privileged purge is separate from immutable runtime.

Installed parser review: ultrahtml1.7.0 MIT uses a non-executing syntax tree;
sax1.6.1 BlueOak-1.0.0 strict XML parser does not fetch DTDs. Reject declarations
and entities anyway; no browser, fetch or network adapter. Promote these already
locked versions to direct dependencies, with no framework/package upgrade.
Primary references: https://github.com/natemoo-re/ultrahtml and
https://github.com/isaacs/sax-js; installed source/README inspected.

All five connected local increments are implemented and verified below. STOP here; no full WP05–WP10 completion or release approval is claimed.

## Connected implementation and invariants

The reusable services are packages/editorial/input.mjs, policy.mjs, repository.mjs,
draft.mjs and report.mjs. scripts/editorial-provision.mjs is a separate trusted
test prerequisite channel; it reads fixtures/editorial-policy.json, never grants
from document content. The runtime runner imports neither the bootstrap driver
nor that policy file. Changing a document or adding an item cannot mint a grant.

Input: fixtures/editorial-input/manifest.json and its original local documents.
There are nine article/transcript items: four Alder Lock reports (including a
credited reprint and supplied timed interview), four Juniper Library reports,
and an unrelated similarly named theatre event. One RSS discovery sample and
one video-only metadata item make11 imports. Correction, hostile HTML, external
entity and oversized fixtures are separate. No expected final article or output
UUID exists in these production inputs. Test expectations stay in the test script.

Both real story packages contain11 paragraph claim candidates and four source
entries. Standard includes all selected claims; brief selects one attributed
paragraph per source. Citation ordinals remain version-wide; both variants retain
the complete bibliography. Numeric-text conflict candidates are retained without
averaging or choosing a winner. Exact quotation is not entailment verification.

Existing source/evidence/article tables remain authoritative. Added source_payloads
holds bounded actual raw bytes, normalized text and supplied transcript segments.
Added evidence_packages holds canonical manifest/digest and cluster revision.
processing_jobs/generation_runs record atomic durable completions and operation
keys, not a distributed workflow. Failed precommit operations roll back and retry;
this does not claim a simulated uncertain-commit fault or durable failure queue.
Observations have immutable operation keys and a generated order independent of
BEGIN/wall-clock timestamps. Upgrade backfills that order before adding identity.
No source version is overwritten when A→B→A or parser/context changes occur.

Canonical JSON recursively sorts object keys; ordered source URLs use binary
string comparison, origin rows use the harness C collation, and ordered claim and
variant arrays remain explicit. Digests are reproducible for the same persisted
versions. Fresh databases create new UUID identities and therefore new digests;
byte-identical digests across independently provisioned databases are not claimed.

Permissions are rechecked before input reading, after extraction, before commit,
freeze, and private access/export. Normalized stored content also waits for current
use eligibility. The governance lock serializes local operations and holds SHARE
locks on source/grant/endpoint/origin/cluster governance; a competing revocation
writer blocks until the operation ends. After revocation, later access/export fails.
Time expiry is rechecked before commit. Bytes already read and offline exports
cannot be recalled. No public excerpt, narration or broadcast authorization follows
from permission to synthesize; no downstream media adapter exists here.

Purging expired content is an explicit owner-only function, pipeline_purge_expired.
It removes raw/extracted payloads and excerpts and redacts affected draft/package
content while keeping hashes/keys and a minimal audit tombstone. Runtime cannot
call it or update/delete history. No automatic scheduler is installed. This local
fixture mechanism does not approve a production retention policy.

The input root is fixed and realpath checked, including Windows junctions,
non-single-link files, descriptor identity and changed-file checks. Limits:256KiB
per payload,40 manifest items,48 parser levels,10,000 nodes,200 HTML paragraphs,
500 transcript segments,1,000 package claims and1,000 current items. Parser budget
is2 seconds; runner child budget45 seconds; PostgreSQL statements15 seconds.
HTML uses a syntax tree with active-content subtrees dropped, not a browser.
Strict SAX discovery rejects DTD/entity declarations; feeds never supply evidence
text. Private HTML escapes all content and has a restrictive CSP with no script.
External providers are absent, not disabled endpoints waiting for user input.
A later network adapter requires separate authorization, destination/redirect
checks and connection-bound IP validation; a domain allowlist alone is insufficient.

## Verified commands

Run from E:/Hale/Coding/Personal/aggregator. Each npm wrapper command is a separate
PowerShell invocation (the wrapper exits its calling shell). No browser downloads
or global settings are needed. For scoped temporary paths, dot-source the existing
preflight in the same invocation before a command:

~~~powershell
. ./scripts/stability-env.ps1
./scripts/npm.ps1 run test:editorial-engine
~~~

~~~powershell
. ./scripts/stability-env.ps1
./scripts/npm.ps1 run editorial:demo
~~~

Both commands start a fresh attested PG18 pipeline profile on127.0.0.1:55442,
check actual data directory/system identifier/database/server major version before
SQL, provision separate owner/runtime capabilities, and stop their owned cluster.
The retained member target55441 is never repointed or migrated. Database directories
and exports remain on E:. The demo command also inspects persisted results from a
new runner process before stopping; it does not reseed between runner processes.
latest-demo.json gives the exact retained-on-disk test target and report paths.
The old .cache/pipeline-target.json points at a stopped target after completion;
do not manually start a second server or point the web supervisor at it.

Additional commands actually verified in this phase:

~~~powershell
./scripts/npm.ps1 run test:db
./scripts/npm.ps1 test
./scripts/npm.ps1 run lint
./scripts/npm.ps1 run typecheck
./scripts/npm.ps1 run build
./scripts/npm.ps1 run demo:restart-web
./scripts/npm.ps1 run test:browser
./scripts/npm.ps1 run test:local-auth
./scripts/npm.ps1 run check:licenses
./scripts/npm.ps1 run check:secrets
~~~

Direct pinned Node commands (after dot-sourcing stability-env.ps1):

~~~powershell
& $aggregatorNode scripts/check-programme-handoff.mjs
& $aggregatorNode scripts/check-editorial-reports.mjs
& $aggregatorNode --import tsx scripts/check-editorial-preservation.mjs before
& $aggregatorNode --import tsx scripts/check-editorial-preservation.mjs after
~~~

The retained demo is running at http://127.0.0.1:3000 with local mailbox8025.
Only if it is stopped, the verified existing startup command is
./scripts/npm.ps1 run demo:start. No duplicate supervisor was started. The first
web restart was mistakenly issued before the build finished; that web process
failed and its owned supervisor stopped. After build completion and checking all
owned ports were free, demo:start restored the same retained target. A read-only
before/after snapshot verified all six member tables and seven migration checksums.
No member reset/reseed occurred. No browser suite ran during build replacement.

## Verification and truthful limits

29 engine groups pass in docs/engineering/editorial-engine-checks.json. These cover
fresh/0007 populated upgrade/reapply/checksum/DDL rollback, actual concurrent initial
imports and generation, separate-process replay, Unicode/time locators, reprints,
unknown origins, insufficient items, unchanged/raw/parser/context identities,
correction and A→B→A, skewed timestamps, denied payload reads, separate policy
channel, wrong-version composite keys, stale digests, expiry/revocation/origin impact,
transaction locking, XML/script/instruction/path/junction/size/depth cases, and
non-owner permissions/retention/no publication. Human review count and public
pointers stay zero. Rollback tests prove precommit rollback, not unknown-commit
recovery under every infrastructure failure.

Foundation:39 SQL assertions plus six existing role groups pass. The initial
foundation run failed its old table-count assertion; that failure is preserved in
output/private-editorial/foundation-initial-failure.json. The test now independently
asserts54 original tables, three earlier local-product tables and two new tables.
It did not weaken any original foreign-key/role checks.

Product preservation:36 units; lint; existing TypeScript checks; build;36 reader
checks and12 Pretext observations; four actual Radio/prepared-video handoff checks;
isolated durable sign-in/session/CSRF/logout regression; retained data hashes pass.
The new JavaScript engine uses strict runtime schemas and integration tests; the
existing TypeScript command does not statically typecheck its .mjs implementation.
No code from the engine is wired into reader/Radio/Newsroom/public APIs. Three
invented staff/import/publication URLs return404; generated private article routes
also return404. The existing programme catalogue still contains17 items.

Report anchors/bibliographies were checked in Chrome154 and desktop captures were
visually inspected. This is not owner editorial acceptance, subjective listening,
new motion acceptance, physical-device coverage or a new performance/cross-browser
campaign. CPU4 popup/list issue remains unresolved; reference thresholds unchanged.
No Figma work, rendering or programme expansion occurred.

Fresh root audit:11 high, no critical/moderate; no suppression/downgrade. Parser
versions already present in the lock were promoted to direct dependencies, with
an offline lock-only reconciliation, not an install/reproducibility claim.
861 locked records/787 installed/22 metadata-only license follow-ups remain.
Installed ultrahtml MIT and sax BlueOak license texts were inspected. Historical
isolated speech3 high/4 moderate was not re-audited. Secret canary/output redaction
and120MB worktree scan pass. No hosted CI run or release readiness is claimed.

Remaining: real source contracts, staff assurance/MFA and interfaces, human source,
origin and claim review, broader semantic grouping/entailment, provider/model
selection, distributed failure operations, scheduled production retention and
publication/outbox gates. No real-news ingestion, external delivery, paid/provider
calls, uploads, commits, pushes or deployment occurred. WP05–WP10 remain partial.
Stop at this connected engine checkpoint.

## Current inspected outputs

- alder-lock: private HTML (local-only evidence: `../../output/private-editorial/e844d170c2b432a2ad59f599863b322a167d14bee571b4920531b14ac873e566.html`), structured JSON (local-only evidence: `../../output/private-editorial/e844d170c2b432a2ad59f599863b322a167d14bee571b4920531b14ac873e566.json`), inspected capture (local-only evidence: `../../output/private-editorial/e844d170c2b432a2ad59f599863b322a167d14bee571b4920531b14ac873e566.png`).
- juniper-library: private HTML (local-only evidence: `../../output/private-editorial/0453efe0e9b17e8c3b6394708a98f11befa932b7afd8adeda20a78460b7d7c18.html`), structured JSON (local-only evidence: `../../output/private-editorial/0453efe0e9b17e8c3b6394708a98f11befa932b7afd8adeda20a78460b7d7c18.json`), inspected capture (local-only evidence: `../../output/private-editorial/0453efe0e9b17e8c3b6394708a98f11befa932b7afd8adeda20a78460b7d7c18.png`).

Inputs: [bundle manifest](../../fixtures/editorial-input/manifest.json), [separate trusted fictional declarations](../../fixtures/editorial-policy.json).

Evidence: engine lifecycle (local-only evidence: `../engineering/editorial-engine-checks.json`), foundation migrations (local-only evidence: `../engineering/database-checks.json`), report browser checks (local-only evidence: `../engineering/editorial-report-checks.json`), retained member comparison (local-only evidence: `../engineering/editorial-preservation.json`), fresh root audit (local-only evidence: `../engineering/editorial-dependency-audit.json`). Retained snapshots intentionally exclude routine last_seen_at access timestamps; they export only counts and opaque hashes.

Final capacity: C101.41GiB/E236.20GiB; no storage blocker. Pipeline cluster stopped; retained demo running. Final successful owned web restart was also verified after build completion.
