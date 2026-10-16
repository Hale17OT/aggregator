# The Aggregator
## Implementation Plan
**Version 1.0 | 8 October 2026 | Dependency-aware delivery and acceptance baseline**

## 1. Purpose and authority

This plan turns the PRD, TRD, App Flow, Figma Design Brief and Backend/Database Schema into a sequenced delivery program. It is a plan, not a claim that any application, Figma file, production database or provider integration has already been implemented. The structured companion planning/implementation_backlog.json is intended for import or translation into an issue tracker after owner review; it is not tied to a particular tool.

Resolve conflicts by preserving the PRD's user outcomes and safety/attribution invariants, then recording an explicit architecture or product decision. A design shortcut cannot weaken source attribution, a schema convenience cannot bypass rights checks, and a release deadline cannot make unsupported content publishable. Update all affected documents and the relevant F/SC/FL/WP identifiers when scope changes.

## 2. Program assumptions and team responsibilities

The proposed launch is an English responsive web product with optional reader accounts and a human-operated newsroom. It uses the Vue/Nuxt, Express and PostgreSQL baseline from the TRD. The budget, jurisdiction, content agreements, model/vendor contracts and public brand remain owner decisions. Public access starts only after the source-use path and operating obligations are approved.

A workable team combines a product owner, technical lead, frontend capability, backend/AI capability, platform/security capability, product designer, QA and an editorial lead with a second qualified reviewer for high-risk coverage. Roles may be combined, but independent high-risk human approvals may not be represented by one person using two accounts. Obtain qualified legal/privacy review for the markets and content uses actually selected.

Product owns scope and acceptance. Editorial owns source eligibility, origin judgments, factual quality and corrections. Design owns the Figma system and accessibility specifications. Engineering owns enforceable controls and data integrity. Security/privacy review owns the assessment of safeguards, not daily editorial truth decisions. The release owner records the go/no-go decision and rollback authority.

## 3. Phase sequence and critical path

| Phase | Outcome | Prerequisite / exit decision |
|---|---|---|
| P00 | Product, rights, operating model and risk decisions | A lawful, contract-compatible evidence path is viable. |
| P01 | Figma foundations, complete representative screens and fixtures | Reader/newsroom direction approved with accessibility and state coverage. |
| P02 | Repository, database, identity and authorization | Repeatable builds and migrations; isolated environments; access-control tests. |
| P03 | Governed sources, safe intake and permissioned video evidence | Source and use eligibility can be enforced before content transfer. |
| P04 | Clustering, origins, claims, generation and validators | Reproducible evidence packs and blocking checks pass on labeled fixtures. |
| P05 | Reader experience, search, citations and member features | Complete readable HTML with bottom attribution and safe public projections. |
| P06 | Newsroom, publication, corrections and withdrawal | Full human-reviewed publication loop works without bypasses. |
| P07 | Hardening, operational rehearsal and controlled launch | Acceptance, security, accessibility, deletion and recovery gates pass. |
| P08 | Opt-in communications, suggestions and selected languages | Launch is stable; consent, localization and moderation addenda are approved. |
| P09 | Demand-led expansion | Each selected feature receives its own budget and design/technical addendum. |

The principal dependency chain is WP01 -> WP03 -> WP04 -> WP05 -> WP06 -> WP08 -> WP09 -> WP10 -> WP14 -> WP15 -> WP18 -> WP19 -> WP20. Video WP07 must also finish before the launch evidence pack path is accepted. Reader work WP11 can proceed with fictional fixtures while ingestion and evidence services are being built. Figma WP02 and repository work WP03 can run in parallel after the necessary initial decisions.

Security, privacy, accessibility and observability begin in P00-P02 and are tested throughout; P07 is their consolidated verification gate, not the first time they are considered. A blocked source license need not halt safe fixture-based UI work, but it blocks ingestion of unpermissioned material and public publication using it.

## 4. Work-package backlog

Effort bands below are planning estimates in person-days for implementation and local verification, not elapsed-time promises. They exclude waiting for contracts, procurement and unresolved owner decisions. They are not a quote or evidence of measured productivity. Re-estimate after WP01-WP04 and the first end-to-end vertical slice. Integrate continuously; do not postpone all testing to the final packages.

### WP01 / P00 - Confirm product, operating entity and permitted source paths

**Accountable delivery roles:** Product owner + editorial lead + qualified counsel. **Depends on:** No prior work package. **Feature coverage:** Cross-cutting program gate. **Effort:** 4-8 person-days.

Resolve launch markets, source contracts, publisher-transcript permissions, reuse boundaries, privacy basis, editorial staffing and sustainable spend. Assess the current YouTube API policy before enabling any API-derived aggregation; do not infer permission from an accessible endpoint.

**Deliverables:** Signed decision register; source-rights matrix; market/privacy review; budget cap; initial risk taxonomy.

**Exit gate:** At least one viable permitted discovery-to-evidence path is approved. Without that path, use fictional or explicitly authorized fixtures only; no public launch.

### WP02 / P01 - Define fixtures and approve the editorial design foundation

**Accountable delivery roles:** Product designer + editorial lead. **Depends on:** WP01. **Feature coverage:** Cross-cutting program gate. **Effort:** 6-10 person-days.

Build the Figma pages, variables, grids, type scale and core component states from the Design Brief. Create clearly fictional sample articles with full bottom bibliographies, long titles, conflicting evidence, removed sources and high-risk review examples.

**Deliverables:** Approved reader/newsroom direction; shared token names; fixture corpus; screen coverage inventory.

**Exit gate:** SC01-SC06 and SC16-SC21 cover the primary reading, evidence, review and correction paths at required responsive widths. Accessibility annotations are present.

### WP03 / P02 - Create repository, contracts and isolated environments

**Accountable delivery roles:** Technical lead + platform engineer. **Depends on:** WP01. **Feature coverage:** Cross-cutting program gate. **Effort:** 5-8 person-days.

Scaffold Nuxt/Vue, Express and worker applications with shared TypeScript contracts, linting, tests, CI, migration tooling and secrets references. Provision separate development, staging and production boundaries. Lock dependencies and review licenses.

**Deliverables:** Reproducible local stack; baseline CI; secret scanning; preview deployment; architecture decision records.

**Exit gate:** A clean checkout builds and runs fixtures without production credentials. CI cannot deploy production from an untrusted branch or preview.

### WP04 / P02 - Implement identity, authorization and database foundations

**Accountable delivery roles:** Backend engineer + security reviewer. **Depends on:** WP03. **Feature coverage:** F11, F27. **Effort:** 7-11 person-days.

Execute the reference schema in disposable PostgreSQL; refine it into ordered migrations. Add session and email/OIDC flows, staff MFA, role checks, safe account linking and transaction-local identity where RLS is used. Add ownership tests for every member route.

**Deliverables:** Migration test report; identity flows; role matrix implementation; non-owner database test role.

**Exit gate:** Fresh install and upgrade tests pass. Cross-account reads, forged role changes, replayed email links and unverified account linking are rejected.

### WP05 / P03 - Build source governance and rights-aware intake

**Accountable delivery roles:** Backend engineer + editorial lead. **Depends on:** WP01, WP04. **Feature coverage:** F15, F18, F19. **Effort:** 7-11 person-days.

Implement source organizations, endpoint approval, versioned rights grants, credibility reviews, expiry and retention policies. Represent each intended use separately. Add newsroom source screens and explain why an ineligible source is blocked.

**Deliverables:** SC07-SC08 public directory; SC17-SC18 governance screens; approval and expiry service.

**Exit gate:** A source may be credible yet prohibited for synthesis. Expired, mismatched or withdrawn permission fails every content-transfer gate.

### WP06 / P03 - Implement bounded retrieval and immutable item versions

**Accountable delivery roles:** Backend engineer + platform engineer. **Depends on:** WP05. **Feature coverage:** F20. **Effort:** 8-12 person-days.

Add permitted RSS/API/HTML or supplied-document adapters, canonicalization, restricted outbound networking, safe parsing, robots/provider checks, content hashing, retrieval observations and provenance. Quarantine unsupported formats and weak extraction.

**Deliverables:** Fixture-backed adapter interface; SSRF controls; source observations; version deduplication; retry/dead-letter behavior.

**Exit gate:** Redirects to private addresses, DNS rebinding fixtures, oversized files, parser bombs and prompt-bearing source text cannot escape the ingestion boundary. A-B-A content observations remain accurate.

### WP07 / P03 - Implement the permissioned video evidence path

**Accountable delivery roles:** Backend engineer + editorial reviewer. **Depends on:** WP05, WP06. **Feature coverage:** F06. **Effort:** 4-7 person-days.

Support independently licensed publisher-supplied transcripts with source version, segment timing and declared provenance. Add safe exact-video links and optional policy-compliant player rendering. Keep API display metadata separate from transcript evidence and retention rules.

**Deliverables:** Transcript import validation; timestamp citations; related-video fallback; deletion/availability fixtures.

**Exit gate:** A linked video without permitted transcript evidence never supports a claim or contributes to the evidence-source threshold. No arbitrary caption scraper is introduced.

### WP08 / P04 - Implement story clustering and reporting-origin review

**Accountable delivery roles:** Backend/AI engineer + editor. **Depends on:** WP06. **Feature coverage:** F07, F21. **Effort:** 7-11 person-days.

Create clustering candidates, duplicate and syndication detection, structured event identity, merge/split review and reporting-origin associations. Store uncertain origins explicitly. Freeze revisions so later clustering changes cannot silently rewrite history.

**Deliverables:** SC19 cluster review; independent-origin fixture labels; merge/split validation; evidence manifest skeleton.

**Exit gate:** Reprints count once for origin independence. Recurring events and same-name entities do not automatically merge. Manual changes invalidate affected evidence digests.

### WP09 / P04 - Build claims, locators and reproducible evidence packs

**Accountable delivery roles:** Backend/AI engineer + editor. **Depends on:** WP07, WP08. **Feature coverage:** F22. **Effort:** 8-12 person-days.

Extract atomic candidate claims and structured numeric/date context. Resolve evidence spans and support/contradiction/context relations. Add human review and immutable approved pack hashing, including rights versions and origin judgments.

**Deliverables:** Claim/evidence service; side-by-side source inspection; evidence pack JSON schema; reverse impact traversal.

**Exit gate:** A reported allegation is not promoted to an established fact. Every eligible locator resolves to its exact permitted source version; contradictory evidence remains visible to reviewers.

### WP10 / P04 - Integrate structured generation and publication validators

**Accountable delivery roles:** AI/backend engineer + QA + editor. **Depends on:** WP09. **Feature coverage:** F23. **Effort:** 9-14 person-days.

Implement model-provider abstraction, policy-bound inputs, schema-constrained output, standard/brief variants, deterministic checks and advisory model checks. Record model/prompt versions, token/cost metadata and retry limits. Evaluate before choosing a provider/model.

**Deliverables:** Generation contract; held-out evaluation suite; numeric/quote/attribution validators; cost accounting; model rollback procedure.

**Exit gate:** Unsupported IDs/URLs, omitted material citations, unreviewed contradiction resolution, rights failures and stale approvals are hard publication failures. No tool-enabled model can fetch or publish.

### WP11 / P05 - Build server-rendered discovery and search

**Accountable delivery roles:** Frontend engineer + backend engineer. **Depends on:** WP02, WP04. **Feature coverage:** F01, F02, F03. **Effort:** 7-11 person-days.

Implement home, topic hubs, version-safe public projections, related-story trails, URL-restorable filters, load-more pagination and PostgreSQL search. Work from fixtures while content services are being completed.

**Deliverables:** SC01-SC03; feed/search contracts; empty/error/stale states; keyboard paths; responsive layouts.

**Exit gate:** Anonymous requests never expose drafts or raw source text. Search excludes withdrawn material, including old snippets. Back navigation restores reader context.

### WP12 / P05 - Build article, citations and evidence reading surfaces

**Accountable delivery roles:** Frontend engineer + backend engineer. **Depends on:** WP02, WP09, WP11. **Feature coverage:** F04, F05, F09, F10. **Effort:** 9-14 person-days.

Implement the structured article renderer, brief/standard switching, inline source anchors, version-stable numbering, bottom bibliography, source inspection, related video distinction, print and link sharing. Preserve complete article/source HTML without JavaScript.

**Deliverables:** SC04-SC05; safe source-link resolver; responsive evidence drawer/page; print stylesheet; accessible anchor navigation.

**Exit gate:** Every displayed citation resolves correctly. Both variants show version-wide source entries with clear per-view usage labels. The bottom bibliography is present without login or JavaScript.

### WP13 / P05 - Build member preferences and public accountability pages

**Accountable delivery roles:** Frontend engineer + backend engineer. **Depends on:** WP04, WP11. **Feature coverage:** F12, F13, F17. **Effort:** 5-8 person-days.

Implement explicit topic follows, saved articles, accessible settings, methodology pages and publication-safe metadata. Add canonical URLs, sitemap updates, version-aware Article structured data, branded social previews and noindex controls for staff/private pages. Store only necessary preferences. Explain how articles are synthesized, reviewed and corrected without implying a numerical truth rating.

**Deliverables:** SC10-SC12 and SC15; account-bound persistence; current-safe-version bookmarks; public metadata/sitemap tests.

**Exit gate:** Readers can browse sources without onboarding. Account preferences do not leak to other members; removed articles display a clear saved-item status.

### WP14 / P06 - Build newsroom review and atomic publication

**Accountable delivery roles:** Frontend engineer + backend engineer + editor. **Depends on:** WP09, WP10, WP12. **Feature coverage:** F24. **Effort:** 9-14 person-days.

Implement queues, assignment, workbench, factual-block inspection, approve/request-changes/reject, high-risk dual approval and idempotent publication. Bind approvals to the exact content/evidence digest and optimistic concurrency token.

**Deliverables:** SC16/SC20; transactional publish service; immutable public version pointer; publication/outbox events; review audit.

**Exit gate:** Stale digest, missing approval, fewer than three eligible evidence items, fewer than two established origins or critical validation failure blocks publication. Concurrent requests cannot publish inconsistent content.

### WP15 / P06 - Build reporting, corrections and rights withdrawal

**Accountable delivery roles:** Backend + frontend engineers + editorial lead. **Depends on:** WP05, WP14. **Feature coverage:** F08, F16, F25. **Effort:** 7-11 person-days.

Implement anonymous issue reporting with version/claim context, triage, revision history, corrective re-review and immediate emergency suppression. Traverse source dependencies through bodies, variants, caches, prompts and other derivatives when rights are withdrawn.

**Deliverables:** SC06/SC14/SC21; correction state machine; withdrawal runbook; source impact report; restoration workflow.

**Exit gate:** An emergency withdrawal suppresses all public variants and stale edge representations. Restoring an unsafe previous version is impossible without a fresh permitted review.

### WP16 / P07 - Implement jobs, telemetry, budgets and incident controls

**Accountable delivery roles:** Platform engineer + backend engineer. **Depends on:** WP03, WP10, WP14. **Feature coverage:** F26, F29. **Effort:** 6-10 person-days.

Add queue visibility, request/job correlation, outbox reconciliation, retry/replay safeguards, metrics with privacy-safe dimensions, model-spend thresholds and feature flags. Prove that the public read path survives AI/provider unavailability.

**Deliverables:** SC22-SC23; cost and failure dashboards; alert routing; pause/replay runbooks; dependency kill switches.

**Exit gate:** Repeated job delivery produces one intended effect. Exhausted budget stops new generation, never causes fallback to unreviewed content. Operators can reconcile lost Redis state from durable records.

### WP17 / P07 - Implement export, deletion and retention execution

**Accountable delivery roles:** Backend engineer + privacy owner. **Depends on:** WP04, WP05, WP15. **Feature coverage:** F28. **Effort:** 5-8 person-days.

Implement verified privacy requests, private expiring exports, session revocation, minimum-retention rules, derivative deletion and restore-time deletion-ledger replay. Separate staff audit obligations from ordinary reader deletion.

**Deliverables:** SC25; retention scheduler; per-target completion evidence; backup/restore privacy procedure.

**Exit gate:** A 202 receipt is not shown as completed erasure. Cross-account exports are blocked; expired links fail; restoring a backup does not resurrect deleted reader data or withdrawn source content.

### WP18 / P07 - Complete accessibility, performance and security hardening

**Accountable delivery roles:** QA + security reviewer + frontend/platform engineers. **Depends on:** WP12, WP13, WP14, WP15, WP16, WP17. **Feature coverage:** F30, F31. **Effort:** 9-14 person-days.

Run keyboard/screen-reader/reduced-motion checks, responsive and zoom tests, dependency/security review, CSP/CSRF/XSS/SSRF abuse cases and representative load tests. Optimize only measured bottlenecks; optional media cannot block reading.

**Deliverables:** Accessibility report; load/security results; remediated critical/high defects; verified budgets; responsive comparison report.

**Exit gate:** Launch-target checks pass under the actual deployment roles and network controls. No unresolved critical security issue or inaccessible core reader/publication path remains.

### WP19 / P07 - Run editorial acceptance and recovery rehearsals

**Accountable delivery roles:** Editorial lead + QA + product owner. **Depends on:** WP14, WP15, WP18. **Feature coverage:** Cross-cutting program gate. **Effort:** 5-8 person-days.

Rehearse complete stories from permitted intake through approval, correction and source removal. Include low-risk, high-risk, conflicting, video-supported and unpublishable packs. Restore from backup; test key rotation and identity-provider outage.

**Deliverables:** Signed acceptance evidence; restore timing record; editorial staffing/capacity plan; approved go/no-go checklist.

**Exit gate:** All mandatory feature acceptance IDs pass, both article variants are reviewed, takedown and restoration drills pass, and owners explicitly accept residual noncritical risks.

### WP20 / P07 - Release a controlled edition and stabilize

**Accountable delivery roles:** Release owner + editorial lead + platform engineer. **Depends on:** WP19. **Feature coverage:** Cross-cutting program gate. **Effort:** 4-7 person-days.

Release approved topics/sources gradually, starting with a limited manually reviewed edition. Watch source freshness, failed jobs, citation defects, accessibility and cost. Maintain an incident rota and pause new publication on severe defects.

**Deliverables:** Release record; flags and rollback evidence; operational handover; prioritized post-launch defect list.

**Exit gate:** Expansion is based on observed quality, staffing and capacity, not a calendar promise. Existing verified articles remain readable during an ingestion/generation pause.

### WP21 / P08 - Add explicitly consented alerts and source suggestions

**Accountable delivery roles:** Product + frontend/backend engineers + editorial lead. **Depends on:** WP20. **Feature coverage:** F14, F32. **Effort:** 12-20 person-days.

Implement opt-in digests and story alerts, explicit saved-story subscriptions, timezone-aware preferences, unsubscribe/suppression, delivery deduplication and staff-triaged source suggestions. Specify provider/domain authentication and moderation before enabling delivery.

**Deliverables:** SC13/SC27; additive V1 migrations including story-alert subscription relation; consent/delivery tests; suppression-aware email templates.

**Exit gate:** No message is sent without the applicable consent; unsubscribing wins races with queued delivery. Suggestions cannot trigger arbitrary URL fetch or create approved sources.

### WP22 / P08 - Add one explicitly selected additional language

**Accountable delivery roles:** Localization editor + frontend/backend engineers. **Depends on:** WP20. **Feature coverage:** F33. **Effort:** 8-14 person-days.

Select a language based on readership and qualified review capacity. Add language-specific evidence provenance, source-text translation rules, locale routing/search, fallback notices and approval granularity. Each translated variant is independently reviewed against the same version evidence; never claim machine translation is a new reporting origin.

**Deliverables:** Localized design fixtures, language-linked approval/schema addendum, locale metadata and correction propagation, human-reviewed evaluation set.

**Exit gate:** Every material localized claim has permitted provenance and qualified language review. Corrections or source withdrawal invalidate every affected translation. Unreviewed fallback text is never served as published.

### WP23 / P09 - Evaluate expansion through separate approved increments

**Accountable delivery roles:** Product owner + architecture/editorial leads. **Depends on:** WP20. **Feature coverage:** F34, F35, F36, F37, F38. **Effort:** Separate estimate required.

Assess paid research features, collaborative collections, audio briefings, article-grounded questions and carefully gated automatic publishing against observed demand and rights. Do not reuse launch estimates as an implementation commitment for these separate products.

**Deliverables:** An approved addendum per selected feature: user outcomes, schema/API changes, license implications, migration plan, threat model, design states and testable acceptance.

**Exit gate:** No V2 feature is enabled merely because a future navigation mockup exists. Citation access, corrections and public trust must not be degraded by monetization.

## 5. Capacity and estimation controls

The additive launch work-package envelope is **131-209 person-days**, before contingency or external waiting. Use this as a rough allocation model across engineering, design, QA and editorial setup, not as an automatic conversion to calendar weeks. People cannot work every package concurrently; handoffs, reviews and the evidence critical path determine elapsed delivery. Hold a proposed 20-30% contingency for integration and hardening until real throughput is observed. V1 has a separate 20-34 person-day preliminary envelope across communications, suggestions and localization; V2 is deliberately unestimated pending its addenda.

Editorial operation is a continuing cost, not just a launch task. At an illustrative 20 articles/day and 25-40 minutes of human verification per article, first-pass review alone is about 8.3-13.3 staff-hours/day, before second reviews, source governance, corrections and absences. Measure this with representative stories. A smaller team should begin with a smaller edition rather than omit verification; an initial 5-10 reviewed articles/day is a proposed controlled-release option, not a promised output quota.

Track work in progress, blocked days, first-pass review acceptance, repeat defects and cost per published article. Prefer a smaller approved source set and fewer topics over reduced citation coverage, unapproved transcripts, missing deletion support or weaker authorization. Remove optional polish before removing trust controls.

## 6. Vertical slices and integration checkpoints

**Slice A - read a defensible fixture:** SC01 -> SC04 -> SC05 -> original source link. Use fictional/authorized data, SSR HTML, standard/brief variants and the real source-list contract. Prove that a missing citation breaks a test and that JavaScript is not needed for attribution.

**Slice B - publish one permitted story:** approve source/use -> retrieve immutable versions -> group origins -> review claims -> generate -> validate -> human approve -> atomically publish. Keep the source set deliberately small. A single successful story is an integration checkpoint, not evidence of system-wide editorial reliability.

**Slice C - challenge the same story:** report a misleading number -> triage -> new version -> revised approvals -> public correction/history. Then revoke one source permission, suppress or revise dependent content, purge prohibited derivatives and exercise restoration. Do not launch a pipeline that can publish but cannot correct or withdraw.

**Slice D - survive failures:** stop the model provider, lose a queue lease, replay jobs, exhaust the generation budget and restore the database. Existing safe articles must remain readable; retries must not duplicate publication or communication. Reapply the deletion ledger before restored traffic.

## 7. Test strategy and evidence of completion

Every launch feature has acceptance statements in the PRD and planning/feature_register.json. Convert those statements into executable tests where possible and human test scripts where judgment is required. Preserve the feature ID, screen/flow IDs, fixture identity, tested revision, result and reviewer in the acceptance report. A green build alone does not certify editorial accuracy.

**Unit and property tests:** URL normalization and allowlists; rights-use decisions; source/version/origin counting; locator boundaries; numeric/date normalization; digest invalidation; role and ownership checks; citation numbering; consent/retention calculations; idempotency and state transitions. Property tests should explore reorderings and duplicate deliveries, not only happy-path examples.

**Database and contract tests:** fresh/upgrade migration execution in disposable PostgreSQL; every documented composite-key mismatch; current-version/article ownership; actual non-owner role behavior; locking races; outbox atomicity; public/private projection boundaries; request/response schema validation. Treat the supplied SQL as unexecuted reference DDL until these tests pass.

**Integration and end-to-end tests:** all launch FL paths and mandatory F acceptance statements, desktop/tablet/mobile, keyboard-only use, JavaScript disabled for reading/source access, reduced motion, blocked media, removed source, expired session, stale edit, duplicate publish, rights expiration during approval and failed CDN invalidation. Simulate partial failures, not just complete outages.

**AI/editorial evaluation:** start with a proposed held-out set of at least 100 diverse evidence packs, including at least 20 adversarial/error cases. This is a testing design target, not a statistical guarantee. Label support, attribution, contradiction handling, quote/numeric fidelity and unacceptable copying. Require zero known critical unsupported-claim escapes in the release set, with all deterministic gates and human approvals enforced. Report sample size, category distribution, reviewer disagreement and residual limitations rather than advertising perfect accuracy.

**Security/privacy/accessibility:** threat-model public fetch boundaries and staff writes; test authorization with hostile identifiers; review dependency and model-data paths; verify export/deletion/retention; test focus and screen readers on actual rendered controls. The WCAG 2.2 AA target needs both automated and manual assessment. Performance targets require measured traces at the load and device/network conditions stated in the TRD. [R16, R18, R19]

## 8. Release gates and go/no-go checklist

G0: operating entity, markets, editorial accountability, source-use permissions, storage region, model data terms, budget and support contacts are approved or explicitly narrowed. Unresolved legal/source-use blockers mean no public launch on real third-party content.

G1: every launch screen and primary flow has the required loading, empty, error, disabled, focus and responsive states. The four Figma prototype paths work as specified. Tokens, component inventory and handoff annotations have stable names. Figma approval does not replace implementation testing.

G2: source ingest and every downstream use fail closed on missing permission. Video evidence has provenance and valid scope. The minimum source/origin rule and all critical evidence checks are enforced server-side. Every public factual surface maps to reviewed claims, and all inline and bottom links resolve to the intended approved item.

G3: normal and high-risk approvals bind to exact digests. Stale or concurrent edits cannot bypass re-review. Corrections, emergency withdrawal, source-impact traversal and permitted restoration have been rehearsed. An Administrator role cannot silently circumvent Publisher policy.

G4: no unresolved critical/high security issue, destructive data-integrity defect or inaccessible core flow remains. Export/deletion and source purge are tested; backups restore within the proposed RPO/RTO; deletion restrictions survive restoration. Remaining noncritical defects require named ownership and explicit risk acceptance.

G5: generation cost caps, queue alerts, rights-expiry checks, edge suppression, incident routing and staff availability are operational. The release owner, editorial lead and technical/security owner record approval against a specific revision. Any failed mandatory gate is a no-go, not an invitation to hide the failing UI.

## 9. Deployment and rollback procedure

Use fixture-only development, representative authorized staging and isolated production. Apply additive migrations first, deploy compatible API/worker code, verify internal smoke tests, then expose the matching web build through a controlled rollout. Backfill in bounded jobs with progress and stop controls. Do not run destructive schema cleanup in the same release that first stops using a field.

Enable real sources one at a time after rights/adapter checks. Keep generation, video embedding, individual source adapters and public publication behind independently controllable flags. Start with a limited reviewed edition. Expand only after observing sustained quality and operational capacity; no traffic percentage substitutes for a rights or evidence gate.

For a severe factual or rights defect, suppress the affected content first and pause the relevant source/publication path. For a code defect, roll back to a compatible safe build and verify current-public-version integrity. If a database migration is not safely reversible, roll forward with a tested corrective migration; do not improvise destructive rollback. Publication restoration always rechecks permissions and required review.

## 10. Risk register and contingencies

| Risk / early signal | Prevention | Contingency / owner |
|---|---|---|
| Source or video reuse path is not permitted | Complete WP01; store per-use rights; separate API display data from licensed evidence. | Disable the blocked adapter/use. Retain links only where permitted, substitute licensed/primary sources or reduce scope. Product/legal/editorial. |
| Attractive summaries contain unsupported material | Atomic claims, deterministic checks, held-out tests and mandatory human review. | Pause publication/model promotion; investigate the evidence chain; correct affected versions. Editorial/AI lead. |
| Syndication masquerades as independent reporting | Review origins separately from publisher identity. | Mark unknown origins; require more evidence or do not publish. Editorial. |
| Editorial workload exceeds capacity | Measure review time and limit edition size. | Reduce volume/topics; do not switch to unreviewed publication. Product/editorial. |
| Model cost or quota spikes | Job budgets, recorded usage, backoff and project quota verification. | Pause low-priority generation; keep existing articles readable. Platform/product. |
| Provider removal or permission expiry affects published text | Retention deadlines and reverse dependency traversal. | Suppress, revise or withdraw and delete prohibited derivatives. Rights/editorial/platform. |
| Figma motion or dependency choices hurt reading | Pin reviewed repos; motion budget; reduced-motion and performance tests. | Remove optional animation/3D first; keep content and state feedback intact. Design/frontend. |
| Authentication, queue or CDN outage | Durable job state, read-path separation, tested denial/suppression fallback. | Freeze privileged writes; reconcile jobs; serve only safe content. Platform/security. |
| Source injection or hostile URL reaches privileged systems | No model tools; SSRF/network controls; parsing isolation; least privilege. | Quarantine input, revoke affected credentials if exposed, investigate and regression-test. Security/platform. |

## 11. Operational handover and post-launch iteration

At handover, provide source approval and expiry procedures, editorial review checklist, high-risk escalation, corrections/takedown playbook, rights-aware content deletion, job replay/reconciliation, spend/quotas, incident response, backup restoration, account recovery, secret rotation and model/prompt promotion runbooks. Each names an owner, trigger, allowed action, verification and escalation path.

Daily editorial operation reviews source freshness, unanswered high-severity reports and stories awaiting approval. The operations owner reviews failed/replayed jobs, budget and expired permissions. Weekly quality review samples published claims and source usage, checks reader-reported defects and adjusts staffing. Proposed 90-day source reviews are supplemented by immediate review after a credibility, ownership or rights incident.

Prioritize improvements using observed reader comprehension, source-link use, recurring errors, performance and sustainable cost. Do not optimize for engagement at the expense of evidence. V1 communications require explicit consent and suppression correctness. V2 monetization, collections, audio, article Q&A and automatic-publication changes require new scope, rights and security review before implementation.

## 12. Definition of done and handoff boundary

A work package is done only when its deliverables exist, tests and human checks pass, documentation is updated, dependencies are traceable, operational ownership is assigned and the exit gate is met. A launch feature is done only when its PRD acceptance statements pass in the integrated environment. A product launch is done only when the go/no-go gates pass for the chosen scope.

This planning package delivers specifications, proposed reference schema, design tokens and a structured backlog. It does not contain a created Figma design, completed application, executed production migration, signed content license, security certification or validated model performance. Those are explicit implementation outputs above, not implied by the presence of detailed documents.


## References

External references were checked on 8 October 2026. Requirements, thresholds, architecture and visual choices are project proposals, not claims of measured performance. Recheck changeable provider terms before implementation.

[R07] YouTube captions.download. Caption downloads require authorization and permission to edit the video. [Open source](https://developers.google.com/youtube/v3/docs/captions/download).

[R08] YouTube API Services Developer Policies. API-data use, aggregation, storage, attribution, playback and scraping restrictions. [Open source](https://developers.google.com/youtube/terms/developer-policies).

[R09] YouTube API quota calculator. Quotas and costs are endpoint-specific; verify the project allocation before launch. [Open source](https://developers.google.com/youtube/v3/determine_quota_cost).

[R10] U.S. Copyright Office Fair Use Index. U.S.-specific, fact-dependent framework; attribution is not a universal permission rule. [Open source](https://www.copyright.gov/fair-use/).

[R13] Figma variables, collections and modes. Variable-based systems; capabilities and mode counts depend on current plan. [Open source](https://help.figma.com/hc/en-us/articles/14506821864087-Overview-of-variables-collections-and-modes).

[R16] WCAG 2.2. Accessibility conformance reference; this project targets AA. [Open source](https://www.w3.org/TR/WCAG22/).

[R18] OWASP SSRF prevention. Untrusted outbound fetch defense guidance. [Open source](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html).

[R19] OWASP LLM prompt injection prevention. Treat retrieved content as untrusted data and constrain model capabilities. [Open source](https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html).

[R20] BullMQ idempotent jobs. Retry-safe, small and atomic job design. [Open source](https://docs.bullmq.io/patterns/idempotent-jobs).

[R22] PostgreSQL row security. Database policy behavior and privileged-role caveats. [Open source](https://www.postgresql.org/docs/current/ddl-rowsecurity.html).
