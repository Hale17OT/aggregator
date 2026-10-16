# Decisions and unresolved gates

2026-10-12. Specification pack 1.0 remains unchanged.

| ID | Decision / proposal | Authority and status |
|---|---|---|
| D001 | Extend preparation to safe local code, disposable DB tests and native edits in the identified Aggregator Figma file. | Explicit user brief supersedes starter session restriction. No public release or paid services. |
| D002 | Use the specified Nuxt/Vue 3, Express/TypeScript, PostgreSQL architecture and existing WP dependency graph. | User-confirmed technical baseline; fixture preparation can precede unresolved WP01 operating approvals. It does not complete downstream gates. |
| D003 | First visual review is SC04, SC05, SC01 and SC20, using Newsreader/Manrope/IBM Plex Mono and supplied semantic colors. | Native file cU1bmSQP5Nh5PX0WayfEpT. On 2026-10-12 owner said “I like the direction keep the direction and improve on it.” Direction accepted; detailed coverage and full WP02 sign-off remain outstanding. |
| D004 | Keep SQL as reference until separately executed in an identified disposable database. | Schema §1/10; PostgreSQL 18 reference. No existing database assumed. |
| D005 | Source availability and rights revocation are distinct. An unavailable original may retain permitted metadata; revoked supporting rights triggers revalidation/suppression. | PRD F05/F25 and schema §9. Fixture cases must distinguish these. |
| D006 | UTF-8 normalized-text “character offsets” are ambiguous for JS UTF-16 and Unicode code points. Propose explicit Unicode code-point offsets with checksum-bound normalization before real extraction. | TRD §4 / evidence_spans; proposal pending implementation contract tests. |
| D007 | Source count is version-wide, including evidence/context bibliography, while eligibility threshold excludes context and related links. | PRD §3 and schema §6–7. Keep counts clearly named. |

Unresolved WP01: operating entity/markets, approved content and transcript paths, jurisdiction/privacy basis, region/hosting, model data terms, vendor budgets, editorial staffing and named release owners. No approval inferred. Trademark/domain checks remain undone. Continue fictional local engineering only.

No material scope contradiction found beyond the explicitly superseded starter boundary. SQL integrity, dependency compatibility, fonts and bridge capabilities require actual verification rather than assumptions.

## D008 — Focused newspaper refinement, 12 October 2026

The user’s current attached request authorizes refining SC01/SC04 in native Figma and the local application, preserving architecture and prior review frames. It explicitly chooses a centered blackletter masthead, roughly 3/6/3 Home composition, and centered H1 immediately followed by relevant imagery. This supersedes the old left-aligned wordmark, 8/4 Home and article-opening rail for these two screens. Newsreader/Manrope, warm paper/forest and the dark theme remain.

Original synthetic illustration plus locally authored route SVG/video are fictional contextual media, not evidence. Add bounded optional media fields to the existing fixture contract only; selections/credits bind the approval digest, denied display permission omits media, and no new database schema/ranking/ingestion service is introduced. Existing release/source-rights/identity/audit blockers remain. See [implementation and evidence](design/NEWSPAPER_REFINEMENT.md).

## D009 — Bounded controls refinement, 12 October 2026

The current user request authorizes native Figma and local custom controls while retaining the newspaper composition. Use independently authored Vue/CSS after browser inspection of the Dqnamo Tactile/Dynamic references; no explicit reuse grant was found on reviewed pages, and no code is copied. Standard/Brief and evidence/source returns remain real SSR links. SC05 is currently an inline section, so its back control returns to the claim; this pass does not introduce a modal. A real client clipboard action may enhance the toolbar, with honest pending/outcome states and no fake timers. Danger and unimplemented-service states remain development specimens. CSS handles the simple motion; Motion for Vue is mentioned in the design specification but is not installed, and no new runtime is necessary. Both the newspaper and controls increments await owner review. See [handoff](design/CONTROLS_REFINEMENT.md).


## D010 — Owner acceptance and cancelled packaging, 12 October 2026

Owner accepts the current buttons as sufficient to continue and cancels review packaging. Preserve newspaper layout, centered blackletter masthead, article opening/media, themes and custom controls. This supersedes D009's pending-controls-review statement only; it does not approve all screens, complete WP02 or authorize release. Resume safe local WP03/WP04 engineering without another button design pass.

## D011 — Local migrations and isolation, 12 October 2026

The current user request authorizes a fresh disposable PostgreSQL 18 target and ordered migrations. Reference SQL remains unchanged; migrations 0001–0003 preserve its launch DDL, and 0004 adds explicit least-privilege isolation. Source-version/media rights are conservatively bound by a composite FK; incompatible rows fail upgrade and require review rather than automatic deletion. This hardening interprets exact provenance requirements; independent media grants would require a separately reviewed model change. Only the newly established 0003-to-0004 upgrade path is verified.

Reader/member/worker DB roles cannot stand in for application authentication or Publisher capability checks. The public index is a limited projection, not a publishing service. Session middleware, identity assurance, staff MFA, transactional publication and outbox remain separate work. See [foundation checkpoint](engineering/FOUNDATION_CHECKPOINT.md).

## D012 — Unpatched dependencies remain an enforcing blocker

Registry/advisory review found no compatible published patch for braces or node-forge. Retain Nuxt 4.6.1 and existing simple-git/parser overrides; do not force the audit-suggested framework downgrade or suppress 11 high findings. Passing builds do not waive the audit gate. License inventory/available notices are recorded; target-distribution notice gaps remain open before redistribution. Hosted CI has not run.


## D013 — Fixture application identity boundary, 12 October 2026

The current request authorizes server-validated fixture sessions and reader-owned preferences/bookmarks through real Express and fixed Nuxt routes. Use opaque 256-bit random session secrets with server-side verifiers; fixture issuance stays in a non-HTTP local-test harness and fails in production. Authentication remains explicitly fixture-only, never staff MFA. Preserve schema role names and deny every staff action/unknown capability. Ownership always comes from validated request context.

Fixture lifetime is deliberately 30 minutes idle / 12 hours absolute for all test accounts, rather than claiming the proposed 30-day production reader policy is approved. Local loopback cookies omit Secure under a nonproduction profile; HTTPS uses Secure/__Host-. Writes require exact Origin plus session-bound synchronizer CSRF, not SameSite alone. Preferences require expected lockVersion; bookmark PUT/DELETE are caller-scoped and idempotent. Unavailable saved items retain only an owner-visible tombstone, not withdrawn content.

Schema gap: 0001 does not persist account session-version, session authentication method/assurance or CSRF representation. Runtime interfaces record these for fixture verification only. Do not rewrite 0001–0004; review an additive migration in the next PostgreSQL adapter increment. [Contracts, access matrix, checks and limits](engineering/IDENTITY_CHECKPOINT.md). No deployment, external identity, paid provider or publication authorization is inferred.


## D014 — PostgreSQL member/session boundary, 13 October 2026

The current user request authorizes additive migration 0005, durable adapters and real API restart/concurrency verification against the existing verified disposable PostgreSQL 18 harness. Migrations 0001–0004 and originals remain unchanged. Legacy sessions lack new proof and are preserved but revoked. Active fixtures explicitly retain fixture-only assurance and null MFA; durable random synchronizer CSRF is separate from the stored bearer verifier.

Use a restricted selector-scoped SECURITY DEFINER lookup because the member role has neither verified identity nor private-table access at authentication bootstrap. Fixed pg_catalog search_path, qualified objects, controlled NOLOGIN owner and revoked PUBLIC execution are mandatory. Runtime never inherits migration/maintenance roles. All protected work shares one checked-out transaction; account-before-session locks serialize member operations and account/role/session invalidation. Only verified server context sets the transaction-local GUC. Maintenance role/version/audit changes are atomic and non-HTTP. Ambiguous commits return failure and discard the connection without claiming rollback certainty.

Public news remains the existing safe fictional memory projection. DB article/version prerequisites are unpublished seed metadata for FK integrity, not a publishing operation. Runtime metadata distinguishes memory from PostgreSQL. Added pg/@types/pg 8.23.1 (MIT); audit still reports 11 high findings. [Complete rationale, evidence and remaining gates](engineering/POSTGRES_IDENTITY_CHECKPOINT.md). No external identity, staff MFA, account UI, release or full WP04 approval is inferred.

## D015 — Owner-authorized local product run, 13 October 2026

The owner extended the earlier one-checkpoint boundary to ten increments. Namespaced RNM-F/SC/FL IDs are additive; numbered original specifications stay unchanged. Reader Newsroom is a public on-demand synthetic programme, distinct from the private Editorial desk. Existing control acceptance is sufficient to proceed, not whole-screen, whole-WP or release approval.

Use one native root audio element as the master clock. Prepared Radio, solo and duo scripts are distinct version/rights-bound renditions, with measured sentence boundaries and Rhubarb mouth cues. Kokoro/voices, local illustration and generated route footage are explicitly synthetic/original fiction. The narrow single-workstation filesystem spool persists assets/jobs with exclusive claims and atomic readiness; it is not the later distributed PostgreSQL processing_jobs integration. Revocable assets are checked through internal-ID API requests rather than permanently open static URLs. Model/runtime license and audit evidence remain separate from root dependencies; worker findings do not disappear because its runtime is isolated.

Migrations 0006/0007 extend the existing identity system rather than replacing it. Captured Mailpit delivery permits fictional example.test addresses and browser-bound explicit one-use confirmation. It grants local-demo reader assurance, never verified real email ownership or staff MFA. Runtime remains non-owner; atomic DB rate limits, session issuance and RLS listening ownership apply. A currently validated new rendition can replace a hidden obsolete progress rendition at expected revision zero; same-rendition concurrent writes still conflict. No guest history is uploaded automatically.

The retained demo target is harness-owned PostgreSQL18 on127.0.0.1:55441 with explicit idempotent FK seed and no member reset; disposable tests remain55440. Supervisor stop/restart acts only on its own processes, refuses occupied ports and preserves accounts/mail. Reset archives an ownership-verified stopped target through a deliberate separate command. This trusted-workstation profile is not production database security.

New-source permission and approval invalidation are rechecked by publicProjection on every read, including after source model/sourceApproved flags change. Source discovery and derived programmes use that same current projection. Changed content/media rights require a fresh digest-bound review. Owner visual/listening review, native Figma additions, physical-device background checks and existing release gates remain separate evidence states.

## 14 October 2026 — local engine subset, WP05–WP10

Reuse existing source/origin/claim/article tables rather than a second editorial model. Migration0008 adds bounded private SQL payload storage and frozen manifests. Raw byte identity is distinct from parser, grant and metadata-context identity; identical bytes under a changed representation create a new immutable version. Duplicate original URL aliases fail for review rather than inflating item counts. Retained member startup stays on0001–0007.

The narrow extractive output schema maps to existing article variant/block/citation tables but deliberately cannot satisfy the public Draft contract’s human-reviewed claim/approval requirements. Exact paragraph quotation is a machine candidate, not verified entailment. Simulated origin declarations live in a separate trusted policy file, never in document payload authority. Context grouping is an exact metadata heuristic and remains candidate-only.

Fictional small payloads use PostgreSQL bytea rather than an additional object-store service (256KiB cap). Local engine operations serialize through an advisory lock and governance table locks; this is a bounded transactional runner, not a distributed queue. Owner-only expiry purge is an explicit immutability exception, replacing derivative content with tombstones while preserving hashes/keys. No automatic maintenance scheduler or real-source retention policy is authorized.


## 14 October reader completion

Reuse topics/follows and explicit typed relations: 390 authored subjects plus six declared entities are not all global entities. Only the reviewed football IPTC mapping is used. Original article_topics is article-bound; 0010 adds exact version assertions and 0011 limits runtime reads to the public projection. Earlier 0009 prose is corrected here without rewriting its checksum.

Explicit matching is independent of passive history. One rule per target supports optional team AND competition scope; mutes win. Opaque edition tokens are owner-bound, bounded and expiring. API restart expires cached editions honestly; durable interests remain.

Clip progress is exact-rendition and consent-gated. Six fictional evidence-graphic videos use the existing local voice and permission model. Existing 17 programmes remain. Native caption tracks use established explicit cleanup. Sign-in reading return context stores only a validated public route with a 15-minute expiry, never credentials or authority; server redirect constraints remain intact.
