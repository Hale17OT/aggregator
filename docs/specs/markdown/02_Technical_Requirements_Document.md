# The Aggregator
## Technical Requirements Document

Version 1.0 | Engineering baseline | 8 October 2026

## 1. Architecture decisions and system boundary

Build a TypeScript modular monolith with independently deployed web, API and worker processes. Use Vue 3 through Nuxt with server-side rendering for public pages, Express for the domain API, PostgreSQL for the authoritative data model, Redis/BullMQ for queues and bounded caching, and S3-compatible object storage for permitted private source assets. Use an edge/CDN layer for safe public article responses. Nuxt provides universal rendering suitable for the proposed public-content experience; this is the reason for using it rather than a client-only Vue application. [R17]

Use a maintained, mutually compatible dependency set, pinned by lockfile and recorded in an architecture decision at project initialization. PostgreSQL 18-compatible SQL is the schema baseline; verify the selected managed service and extension support. Do not use “latest” unconstrained in production manifests. Vite remains part of the Vue development toolchain, not a separate competing frontend. React, Kafka, Kubernetes, a standalone vector database, microservice splitting and Temporal are not launch dependencies.

Repository boundaries: apps/web for reader and staff interfaces; apps/api for HTTP and authorization; apps/worker for ingestion, extraction, generation, publication propagation and retention; packages/contracts for validated request/event schemas; packages/domain for policies and state transitions; packages/db for migrations and repositories; packages/design-tokens for shared tokens; packages/test-fixtures for approved synthetic or licensed fixtures. Staff and reader routes can share one web app, but privileged modules must not enter the public bundle unnecessarily.

Domain modules are Identity, Source Governance, Intake, Evidence, Editorial, Publishing, Reader, Reporting and Operations. They communicate through typed in-process services and transactional outbox events. Modules may share PostgreSQL, but no module may bypass the publication or rights service by directly updating a status column.

External dependencies are explicit: approved publisher feeds/APIs, scoped YouTube display services if approved, a permitted model-processing vendor, an OIDC provider, transactional email and infrastructure telemetry. Provider-specific adapters are replaceable. No reader request depends synchronously on an AI call.

## 2. End-to-end data path

T01 Source approval establishes exact identity, topic suitability and an active rights grant. T02 Scheduled discovery reads approved metadata with endpoint-specific quotas. T03 Intake safely fetches only allowed content and records content hash, original URL and independent timestamps. T04 Extraction produces normalized text and locators, never silently overwriting the raw version. T05 Deduplication identifies repeated copies; clustering groups a bounded event. T06 Claim extraction builds evidence spans and provenance. T07 An evidence pack freezes item versions, permissions, claims and independent origins. T08 A model produces structured article variants. T09 deterministic and reviewer checks validate the draft. T10 approved publication atomically changes the public version and creates outbox events. T11 edge/search/social representations refresh. T12 updates or rights withdrawal re-evaluate every affected derivative.

Public requests read only approved publication projections. Internal source text, evidence excerpts beyond their public-display grant, private review notes and prompts are never returned by a public article endpoint. A public evidence drawer is a carefully filtered projection, not the internal reviewer response with CSS-hidden fields.

## 3. Source adapters and permission checks

Every endpoint has an adapter type, allowlisted hostname/channel identifier, credential secret reference, minimum poll interval, quota class, allowed MIME types, maximum payload, owner and status. Credential material is stored in a secret manager, not PostgreSQL, source URLs, logs or frontend variables. Permission is checked at discovery, fetch, storage, model transfer, rendering and publication; it is not a one-time onboarding checkbox.

Rights grants specify use flags, content/territory/provider scope, approval evidence, start/expiry, raw-text retention, maximum public excerpt if contractually defined, media rules and withdrawal behavior. Unknown is deny. Article generation requires explicit processing and derivative-synthesis permission. An internal threshold for text overlap can trigger review, but it is not a legal safe-harbor word limit.

RSS/Atom adapters accept conditional requests and source-provided entry IDs. A feed may permit discovery without permitting full-article retrieval. Licensed API adapters use documented cursors and honor contract fields. Approved webpage adapters do not defeat authentication, CAPTCHAs or paywalls. Authorized document inputs preserve issuer, source URI and license and pass malware/type/size checks. Search engines may help staff discover candidates, but snippets are not an evidence substitute.

Video evidence is deliberately separated from video display. The default evidence route is a publisher-supplied, separately licensed transcript with an original publisher identifier and an optional associated YouTube URL. Official caption downloads require edit permission; even successful authorization does not itself establish all derivative-use rights. Do not use third-party transcript scrapers. [R07]

Before enabling a YouTube API connector, the rights owner must document an approved use boundary for API-data handling, cross-channel use and model processing. A compliance ambiguity is an integration blocker; it is not resolved by assuming all “aggregation” is allowed. Keep individual display metadata in a separate permission/retention class and do not build channel truth scores or cross-platform engagement metrics from it. Use the provider's current compliance guidance and seek clarification where necessary. [R08, R25]

Quota accounting is endpoint/bucket-specific. Do not hardcode historical assumptions that every method shares one unit bucket. Read the project's actual allocation, reserve capacity for required metadata refresh and availability checks, and pause optional discovery before exhausting it. Store a dated quota configuration and alert on drift. [R09]

## 4. Fetching, parsing and source-version integrity

T03 security defaults: HTTPS only; no URL credentials; allowlisted ports; exact parsed-host validation; up to five individually validated redirects; 5-second connect and 20-second total fetch deadlines; 2 MB feed and 10 MB HTML limits; 25 MB authorized document limits; and bounded decompression. These are proposed safe starting limits, configurable downward by adapter. Resolve and validate IPv4/IPv6 before each connection; block private, loopback, link-local, reserved and cloud-metadata networks; bind the connection to the checked address and enforce egress controls. Apply the same rules to editor-entered URLs and external media. [R18]

Sanitize extraction outside the privileged API process. Never execute page JavaScript for ordinary intake. Parse HTML to a constrained text representation; detect boilerplate, language, truncation and missing body. PDFs run in a resource-limited worker. OCR is an explicit reviewed fallback, not an invisible recovery. On poor extraction, use needs_review or rejected rather than an empty evidence pack.

Canonicalization removes known tracking parameters while retaining semantic query parameters. Retain requested, fetched and canonical URLs and every relevant redirect. Stable provider IDs are preferred when available. Exact-content hashes deduplicate bytes; normalized-text hashes identify equivalent text; neither automatically merges events. Updated source content creates a new source_item_version. Store source publication and modified timestamps as supplied, with a reliability flag, separately from fetched_at and observed_at.

Evidence locators use UTF-8 normalized-text character offsets against a checksum-bound version, with page number for documents or start/end milliseconds for aligned transcripts. Store a short quoted excerpt only where retention permits. A timestamp must lie within the known duration and refer to a validated segment. Without alignment, show an exact video URL and “timestamp unavailable.”

## 5. Clustering, independent origins and evidence packs

T05 begins with deterministic identity and exact-duplicate rules, then entity/time/topic candidate retrieval and semantic similarity where permissioned. Optional embeddings live in PostgreSQL through a separately approved extension and model-versioned index; they are not required for the initial vertical slice. Calibrate thresholds on labeled event pairs containing reprints, follow-ups, recurring announcements and same-name entities.

The origin model is distinct from source ownership. Two outlets with different owners may use one wire origin; two reports under one parent may contain separate reporting but need documented reviewer judgment. Store one or more origins per source-item version, with attribution evidence and reviewer confidence. Unknown origin is unknown, not automatically independent. Publication requires at least two independently established origins across three eligible items.

The evidence pack is a reproducible manifest: cluster revision; selected source versions and rights-grant versions; supported claims; contradictions and unresolved questions; locator IDs; reporting-origin grouping; editorial risk; prompt policy version; and an ordered source list. Its digest changes when any included content, claim, permission or origin judgment changes. Do not build prompts from the current mutable body of a source after the pack is frozen.

Each claim is atomic enough to check. A numeric proposition stores the value, unit, reference time, geography and attribution as structured metadata when available. Claims have supports, contradicts and context edges. A source reporting a statement supports “X said Y”; it does not automatically support Y. Keep original and normalized units to detect accidental conversion.

## 6. Generation contract and evaluation

T08 uses a provider abstraction that receives an approved evidence pack and returns validated JSON. Model choice is an implementation evaluation, not a promise about a named model's current performance. Record provider, model identifier, prompt/template version, evidence digest, input/output tokens, measured billable cost, start/end time, attempt and result status. Vendor terms must permit the supplied data, disallow training where required and implement the agreed retention boundary.

Output schema includes headline, deck, key points, blocks for standard and brief variants, referenced claim IDs, proposed source IDs, uncertainty statements and omitted-evidence reasons. The model cannot invent source IDs, URLs, authors, timestamps or evidence it has not received. Source URLs are resolved by the application. Generation has no tools, browsing, credentials or write permissions. Retrieved text is delimited as untrusted data; instructions contained in it do not become instructions to the application. Isolation and policy enforcement, rather than prompt wording alone, are the controls. [R19]

T09 checks JSON shape; allowed IDs; 100% material-claim linkage across both variants; appropriate entailment/attribution; numeric and date consistency; quote fidelity; contradiction preservation; editorial risk; rights validity; source independence; and excessive overlap with original text. Model-based checks are advisory alongside deterministic rules and human verification. Checks have pass/warn/fail outcomes with structured reasons. Any critical fail blocks approval and publication.

Evaluation fixtures cover unsupported dates, swapped entities, numbers with different units, misleading causal wording, falsely attributed quotes, stale stories, syndication, source injection, unavailable transcripts, poor OCR, deleted sources and conflicting counts. Maintain a held-out set with human labels; record evaluator disagreement. A new model/prompt is shadow-tested against the same fixtures and a fresh sample before promotion. Known defects become permanent regressions.

## 7. Editorial state and publication transaction

Draft lifecycle: queued -> generating -> draft -> in_review -> approved -> published. Generation failure returns to a reasoned failure state. Review can return a draft for changes or reject it. Any content/evidence change creates a new digest and invalidates all prior approvals; editors cannot patch a published narrative in place. A new version moves through the same lifecycle while the previous safe version remains public.

T10 publish request contains article_id, candidate_version_id, expected_content_hash and expected_article_lock_version. In one database transaction: lock the article; verify current pointer/lock version; verify rights, eligibility, validation and required distinct approvals; set the current version; append publication event; increment lock version; insert outbox events. Commit once. Duplicate idempotency keys return the original result. Concurrent stale requests return 409, never last-writer-wins.

Normal stories require one valid human approval. Review decisions are append-only; a reviewer can revoke or replace their decision without changing the content digest. Publication considers only the latest decision per reviewer and digest under the article lock, not every historical approve row. High-risk stories require two distinct approvers with Publisher capability for the final act. Approval records are bound to the complete content-and-evidence digest. An administrator can assign privileges but cannot publish by bypassing these checks. A withdrawal action can immediately suppress publication without waiting for two reviewers; it records an incident reason and requires follow-up.

Publication events distinguish initial publication, update, correction, withdrawal and restoration. Restoration is a newly reviewed safe version, not automatic rollback to an unsafe one. Public history redacts material that must no longer be retained or displayed. Preserve only permitted metadata and non-reversible audit evidence when text retention is prohibited.

## 8. HTTP API contract

Use /api/v1, JSON, ISO 8601 UTC timestamps, UUID resource IDs and explicit language/variant fields. Request/response validation is shared with generated TypeScript types. Responses use {data, meta}; errors use {error: {code, message, requestId, fieldErrors}}. Cursor pagination defaults to 20 and caps at 50, with a stable sort tie-breaker. Do not expose database error strings or infer missing authorization from the client UI.

| Surface | Routes and method | Contract |
|---|---|---|
| Discovery | GET /articles; GET /topics; GET /topics/:slug/articles | Published projection; opaque cursor; editorial or authenticated explicit-follow ordering. |
| Reading | GET /articles/:slug; GET /articles/:id/versions/:version | Variant/language selection; safe historical state; full bibliography in response. |
| Evidence | GET /articles/:id/versions/:version/sources; GET .../claims/:claimId | Public-safe attribution and evidence explanation only; same version throughout. |
| Search | GET /search?q=&topic=&from=&to=&sourceType=&sort= | Published full-text index only; parameterized filters; no raw source corpus. |
| Directory | GET /sources; GET /sources/:slug | Public profile excluding contracts, private reviews and credentials. |
| Authentication | POST /auth/email; POST /auth/email/verify; GET /auth/oidc/start; GET /auth/oidc/callback; POST /auth/logout | Single-use challenges, CSRF/state/nonce checks, safe return path. |
| Preferences | GET/PATCH /me/preferences; PUT/DELETE /me/follows/:topicId | Ownership enforced from session, not submitted user_id. |
| Bookmarks | GET /me/bookmarks; PUT/DELETE /me/bookmarks/:articleId | Idempotent, private; current safe version plus original saved version. |
| Reports | POST /reports | Article/version/claim context; optional contact; rate limits; 202 receipt. |
| Privacy | POST /me/export; POST /me/deletion; GET /me/privacy-requests/:id | Reauthentication; 202 asynchronous request; expiring signed export. |
| Sources | GET/POST /staff/sources; PATCH /staff/sources/:id; POST .../reviews; POST .../rights | Role checks, reason, optimistic concurrency and audit. |
| Evidence work | GET /staff/clusters; POST .../:id/merge; POST .../:id/split; GET .../:id/evidence | Reviewable origin/claim changes; stale pack invalidation. |
| Generation | POST /staff/clusters/:id/generations; GET /staff/jobs/:id | 202 + job ID; permission/budget checks; bounded retries. |
| Review | GET/PATCH /staff/versions/:id; POST .../submit; POST .../approve; POST .../reject | Expected digest required for mutation and approval. |
| Publish | POST /staff/articles/:id/publish; POST .../withdraw; POST .../restore | Idempotency key; transactional policy checks; 409 stale version. |
| Operations | GET /staff/operations; POST /staff/jobs/:id/replay; PATCH /staff/flags/:key | Operator scope; replay reason; audited kill switches. |
| Administration | GET /staff/users; PUT/DELETE /staff/users/:id/roles/:role | Administrator scope; MFA and reauthentication. |

All modifying browser requests use anti-CSRF protection and origin checks. Return 401 for missing authentication, 403 for forbidden capability, 404 for inaccessible private objects, 409 for concurrency conflict, 422 for validly parsed but unacceptable input, 429 for throttling and 503 for transient unavailable dependencies. Retry-After accompanies retryable limits. No public arbitrary-URL fetch route exists.

## 9. Identity and data isolation

Use secure, HttpOnly, SameSite cookies over TLS. Store only hashed opaque session tokens and hashed one-time email tokens; no browser-local access tokens. Rotate sessions at sign-in and role elevation. Proposed defaults are 15-minute email links, 30-day reader sessions with revocation, and 12-hour staff sessions with 30-minute privileged inactivity timeout. Sensitive staff actions require recent authentication. These defaults require a documented threat-model review.

Google sign-in uses OIDC state, nonce and PKCE where applicable, with validated issuer/audience. Account linking requires an existing authenticated session and verified identity, not a matching unverified email. Request no YouTube permission for reading or signing in. Staff MFA enrollment/recovery must use an established identity implementation; do not hand-roll cryptography or recovery factors.

Use least-privilege database roles and explicit service-layer ownership checks. Where row-level security is enabled, set the request identity transaction-locally and test under the actual non-owner application role; database owners and privileged roles can bypass ordinary policies. RLS is defense in depth, not a substitute for endpoint authorization. [R22]

## 10. Queues, retries and idempotency

PostgreSQL is authoritative for job status and the transactional outbox; Redis is a dispatch accelerator. An outbox relay uses short row locks and records dispatch attempts. Workers claim jobs with a lease and update status transactionally. A reconciliation job re-enqueues eligible orphaned work after Redis loss. Do not claim exactly-once execution: processing is at least once and effects are idempotent. [R20]

Idempotency keys include endpoint/source item version/action for intake; evidence digest/prompt/model/variant set for generation; article/version/digest for publication; and user/channel/edition for notifications. Enforce uniqueness in PostgreSQL, not only Redis. Cache hits are scoped to permissions and deletion state; a revoked grant invalidates associated cached outputs.

Proposed retry policy is five attempts with exponential backoff and jitter, honoring provider Retry-After. Only transient transport, 429 and selected 5xx responses retry. Invalid credentials, denied rights, unsupported files, critical validation failures and known bad input stop or quarantine immediately. Deadline, attempt and retry-budget limits are separate controls. [R21]

External email delivery in V1 uses a provider idempotency key or reconciliation before retry after an ambiguous timeout. A database sent flag alone cannot prove the provider did not accept a message. Dead-letter replay keeps the original business key and records an operator reason.

## 11. Storage, search, cache and retention

PostgreSQL holds normalized metadata, provenance relationships, approved article structures and workflow records. Store permitted large bodies/assets in private object storage with encryption and short-lived access links. Object keys include a source/version identifier rather than an untrusted URL. Public images must have their own media grant. Never expose raw storage bucket listing or make source bodies public by convention.

Public search uses PostgreSQL full-text search over safe current article variants. GIN indexes serve language-appropriate text search; sortable indexes support topic/time. Defer an external search service until measured scale warrants it. A retained raw-source corpus is not a public search feature.

Cache by article/version/language/variant and publication-state generation. A normal publish invalidates affected article, topic, home and search projections. CDN HTML TTL starts at 60 seconds with bounded safe stale fallback. An emergency withdrawal sets an edge-visible deny/tombstone state before purge and is checked before serving cached text. Rights/safety events disable stale-if-error for affected objects. Target public suppression within 60 seconds; prove it in deployment-specific tests.

Raw evidence retention is the minimum allowed by license and approved policy; propose 30 days only where permitted. The source schema supports shorter durations and deletion of excerpts, embeddings, prompts, outputs and caches. Independently licensed assets and YouTube API metadata have separate retention classes. Provider API-data refresh/delete obligations must be enforced, not overridden by an immutable-archive goal. [R08]

Proposed personal-data defaults: account data until deletion; minimal raw analytics 30 days; operational logs 30 days; minimized audit events 365 days; backup expiry 35 days; one-time exports 24 hours. Legal and source-specific requirements may shorten or justify different periods. All are configurable policy decisions, not universal legal limits. On restore, apply the deletion ledger before accepting traffic.

## 12. Performance, observability and costs

Read-path targets: monthly availability 99.9%; p95 uncached API reads <=400 ms and writes <=700 ms at the planning load; search p95 <=700 ms; p75 LCP <=2.5 seconds, INP <=200 ms and CLS <=0.1 on supported real traffic. Target initial reader JavaScript <=200 KB gzip, excluding consented third-party players; load staff and optional Three.js code separately. Reserve media dimensions and render article/source HTML before hydration. These are test gates, not measured claims.

Measure per-adapter discovery/fetch delay, extraction failure, queue age, evidence eligibility, generation failure, validation results, approval time, publish propagation and deletion latency. Distributed correlation IDs connect intake through publication. Logs contain hashes/IDs and reason codes instead of full prompts, source text, tokens or personal emails. Alerts have named owners and runbook links. A source-count chart must distinguish items, publishers and reporting origins.

Monthly cost = infrastructure + permitted source licenses + model input tokens x contracted input rate + model output tokens x output rate + authorized extraction/transcription + email + storage/egress + observability. At the planning envelope, 500 processed items/day at 2,000 input tokens each implies 1,000,000 daily extraction-input tokens; 20 article packs/day at 12,000 input tokens each adds 240,000. These are hypothetical sizing inputs, exclude output and retries, and must be replaced with measured values. Do not quote a model/vendor price that has not been procured.

Enforce per-run token ceilings, daily tenant budgets, connector quotas and retry allowances. At 80% of a configured daily generation budget, stop low-priority jobs; at 100%, pause new generation except a separately approved correction reserve. Existing safe pages remain available. A budget override requires named approval and audit.

## 13. Security, testing and release engineering

Threats include hostile publisher content, SSRF, malicious files, prompt injection, XSS in extracted text, cross-user data access, privilege escalation, auth replay, leaked provider credentials and stale restricted caches. Apply HTML allowlists, CSP, dependency scanning, secrets scanning, parameterized SQL, egress restrictions, file sandboxing and endpoint rate limits. Administrator views escape source names and URLs too.

Testing layers: unit tests for canonicalization/rights/state machines; PostgreSQL integration tests for referential integrity and concurrency; adapter contract tests with recorded authorized fixtures; model/evidence evaluation; API authorization tests; Playwright reader/staff journeys; manual keyboard and screen-reader review; visual regression against approved Figma; load tests; and fault/restore/deletion drills. WCAG 2.2 AA is the accessibility target, with manual testing required in addition to automation. [R16]

CI validates formatting, types, tests, migration safety, artifact schemas, secrets/dependencies and production build. Deploy schema through expand/migrate/contract steps; backfill in bounded batches; avoid dropping fields in the same release that stops writing them. Run canary reads and one synthetic publish in staging. Production rollout starts read-only/canary; enable writes, intake and generation separately behind flags. Rollback software without resurrecting withdrawn content or undoing privacy requests.

Backup targets: 24-hour RPO and 4-hour RTO, validated by restore drill. Use a single primary region initially with encrypted backups in an approved location; geography and residency are owner decisions. Document outages for database, Redis, model vendor, publisher API, email and CDN separately. Approval must remain blocked if the system cannot confirm current rights or evidence integrity.

## 14. Required engineering handoff

Deliver versioned API schemas, migrations, seed fixtures, state-machine tests, adapter permission matrices, a source-to-claim-to-article walkthrough, measured quality reports, security/accessibility findings, cost dashboards, on-call runbooks and the release evidence bundle. The included SQL is a reference schema for refinement and verification, not proof that infrastructure or application authorization has been deployed. Design and flow identifiers map through planning/feature_register.json.


## References

External references were checked on 8 October 2026. Requirements, thresholds, architecture and visual choices are project proposals, not claims of measured performance. Recheck changeable provider terms before implementation.

[R07] YouTube captions.download. Caption downloads require authorization and permission to edit the video. [Open source](https://developers.google.com/youtube/v3/docs/captions/download).

[R08] YouTube API Services Developer Policies. API-data use, aggregation, storage, attribution, playback and scraping restrictions. [Open source](https://developers.google.com/youtube/terms/developer-policies).

[R09] YouTube API quota calculator. Quotas and costs are endpoint-specific; verify the project allocation before launch. [Open source](https://developers.google.com/youtube/v3/determine_quota_cost).

[R16] WCAG 2.2. Accessibility conformance reference; this project targets AA. [Open source](https://www.w3.org/TR/WCAG22/).

[R17] Nuxt rendering modes. Vue universal and hybrid rendering reference. [Open source](https://nuxt.com/docs/4.x/guide/concepts/rendering).

[R18] OWASP SSRF prevention. Untrusted outbound fetch defense guidance. [Open source](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html).

[R19] OWASP LLM prompt injection prevention. Treat retrieved content as untrusted data and constrain model capabilities. [Open source](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html).

[R20] BullMQ idempotent jobs. Retry-safe, small and atomic job design. [Open source](https://docs.bullmq.io/patterns/idempotent-jobs).

[R21] BullMQ retrying failing jobs. Bounded retry and backoff implementation reference. [Open source](https://docs.bullmq.io/guide/retrying-failing-jobs).

[R22] PostgreSQL row security. Database policy behavior and privileged-role caveats. [Open source](https://www.postgresql.org/docs/current/ddl-rowsecurity.html).

[R25] YouTube developer-policy compliance guide. Clarifications on data uses, derived metrics, playback and compliance review. [Open source](https://developers.google.com/youtube/terms/developer-policies-guide).

[R26] YouTube branding guidelines. Per-item attribution and branding requirements. [Open source](https://developers.google.com/youtube/terms/branding-guidelines).

[R27] YouTube embedded player parameters. Supported embed and playback parameters. [Open source](https://developers.google.com/youtube/player_parameters).

[R28] Google Search article structured data. Article metadata implementation reference; no ranking guarantee. [Open source](https://developers.google.com/search/docs/appearance/structured-data/article).
