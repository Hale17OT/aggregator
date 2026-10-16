# The Aggregator
## Backend and Database Schema

Version 1.0 | “Background Schema” interpretation | 8 October 2026

## 1. Scope and delivered schema artifacts

This document defines the backend data model, relationships, constraints, public/private projections and retention behavior. The companion engineering/001_launch_schema.sql is a PostgreSQL 18-compatible reference DDL for the full launch target. engineering/002_v1_extensions.sql is optional future-release DDL. engineering/data_dictionary.md and .json contain every column definition, key, nullability/default and table note. engineering/entity_relationships.mmd is an editable core-provenance ER diagram.

The reference DDL is not a deployed database or proof of production authorization. Cross-row publication policy, digest calculation, immutable editorial semantics, role grants and retention orchestration require the domain services and tests specified here. Do not apply this planning file directly to an existing database. Convert it into reviewed incremental migrations and validate against a disposable PostgreSQL instance before adoption.

The schema is deliberately relational because the product must answer more than “which URLs were used?” It must identify the exact retrieved version, the evidence span, the claim, the displayed block, the approved article version and the permission governing each use. A JSON array of URLs attached to an article cannot enforce those relationships.

## 2. Backend module-to-storage map

Identity owns users, authentication, sessions, role assignments and consent. Reader owns explicit preferences, follows and bookmarks. Source Governance owns source identities, ownership, suitability reviews, rights grants and endpoints. Intake owns item identities, retrieved versions and observations. Evidence owns origins, clusters, spans and claims. Editorial owns draft structures, generation, validation and review. Publishing owns article identity, the current version, source numbering, history, corrections and redirects. Operations and Governance own jobs, outbox, audit, reports, privacy and retention work.

PostgreSQL is the system of record. Object storage holds only large, permitted source bodies, documents and assets behind private access controls. Redis holds expendable dispatch/cache state, never the sole copy of job or publication truth. Search indexes are derived from safe public article variants. Optional embeddings are another rights-bound derivative, not a separate source of truth.

## 3. Conventions and lifecycle semantics

Use UUID primary keys for durable objects, timestamptz for observed instants and explicit locale/variant fields. UTC is the stored instant format; user timezone is presentation/scheduling context. Store source publication, source modification, fetch observation, evidence cutoff and product publication separately. A missing original date is null and visibly unknown, not replaced with the fetch date.

Text IDs such as role codes, adapter keys and feature flags are controlled vocabularies. JSONB is limited to extensible validated adapter metadata, structured claim values, permission scope, job payloads and typed diagnostics. Do not use JSONB to hide critical relationships that need foreign keys. URL syntax and network safety are service validations, not trusted because a value fits a text column.

Draft content may change before approval. Once used in a published version, a narrative, claim or evidence manifest is semantically immutable. Changes create a new approval unit. Availability, revocation and legally required deletion are explicit state changes; “immutable” does not mean retaining prohibited text forever. Restricted content can be purged while a minimal lawful tombstone remains.

Same content observed again may point to an existing source-item version; source_observations records the new retrieval/availability event. This preserves changes and reversions without confusing “last checked” with “originally published.” Exact hashes are not semantic clustering, and a source URL is not an independence identifier.

## 4. Table inventory and integrity responsibilities

### Identity

**users** — Minimal account identity; no inferred sensitive attributes. Key fields: id, email_normalized, email_verified_at, display_name, status, created_at, deleted_at. Normalize/verify email in the service. Delete or minimize identity fields on confirmed deletion. Authorize by immutable id, not email.

**auth_identities** — Bind a verified identity-provider subject to one member. Key fields: id, user_id, provider, subject, created_at. Identity linking requires reauthentication; provider/subject uniqueness prevents duplicate account bindings.

**sessions** — Revocable first-party sessions; raw bearer values are never stored. Key fields: id, user_id, token_hash, created_at, expires_at, last_seen_at, mfa_verified_at, revoked_at. Use cryptographic token hashes and secure cookies. Staff role change revokes or re-evaluates privileged sessions.

**auth_challenges** — Single-use passwordless sign-in challenges. Key fields: id, email_normalized, token_hash, purpose, return_path, expires_at, consumed_at, created_at. Consume atomically with expiry validation. Return path must be same-origin allowlisted; purge expired rows promptly.

**roles** — Fixed application capability bundles. Key fields: code, name, capabilities. Seed reader, editor, publisher, curator, rights_reviewer, operator and administrator. Application validates the capability vocabulary.

**user_roles** — Audited staff and reader role assignments. Key fields: user_id, role_code, assigned_by, assigned_at. Do not allow application readers to self-assign. Administrator changes are transactional with audit.

**consents** — Versioned consent decisions rather than one mutable checkbox. Key fields: id, user_id, anonymous_key_hash, purpose, policy_version, granted, recorded_at. Store minimal pseudonymous anonymous consent only where needed; deletion and expiry follow the specific purpose.

### Reader

**user_preferences** — Presentation preferences and explicit home mode. Key fields: user_id, theme, text_size, reduce_motion, home_mode, language, timezone, lock_version, updated_at. Validate IANA timezone and language in contracts. OS reduced motion overrides decorative user motion preferences.

**topics** — Editorial desks and topic metadata. Key fields: id, slug, name, scope, status, sort_order. Seed the six launch desks. Route aliases for renamed slugs are handled by the redirects table.

**topic_follows** — Only explicitly selected topic interests. Key fields: user_id, topic_id, created_at. This relation powers For you. No inferred political, health or religious classification is stored.

**bookmarks** — Private saved article identity and first-viewed version. Key fields: user_id, article_id, saved_version_id, created_at. Current safe content opens by default. Saved historical references never authorize access to withdrawn text.

### Sources

**sources** — Editorial source identity independent of individual items. Key fields: id, slug, name, source_type, home_url, identity_key, status, public_rationale, review_due_at, created_at, lock_version. identity_key is a verified canonical domain or channel/institution identifier. Public suitability scope is not a universal truth ranking.

**source_ownerships** — Time-bounded disclosed ownership relationships. Key fields: id, source_id, owner_name, owner_key, valid_from, valid_to, verification_url, verified_at. Ownership and independent reporting origins are distinct concepts. Unknown ownership remains unknown.

**source_reviews** — Append-only editorial source suitability decisions. Key fields: id, source_id, reviewer_id, decision, topic_scope, rationale, reviewed_at, expires_at. Detailed private review is separated from sources.public_rationale. Changing a decision means inserting another record.

**rights_grants** — Scoped, versioned permission decisions for processing and display. Key fields: id, source_id, grant_key, revision, status, allow_discovery, allow_fetch, allow_store, allow_model, allow_synthesis, allow_public_excerpt, allow_media, scope, agreement_reference, approved_by, starts_at, ends_at, raw_retention_days, public_excerpt_limit, revoked_at. Scope must include exact content, territory and approved downstream providers where relevant. Grant revision is immutable; revocation is an auditable state change. No permission defaults to true.

**source_endpoints** — Provider-specific discovery and fetch configuration. Key fields: id, source_id, adapter, endpoint_url, secret_reference, allowed_hosts, configuration, status, poll_interval_seconds, next_poll_at. Store references to credentials only. JSON contains non-secret validated adapter settings, limits, quota buckets and cursor.

### Evidence

**source_items** — Stable identity of an original article, document or video. Key fields: id, source_id, provider_item_key, kind, canonical_url, first_seen_at. Different URLs can refer to one item; conservative canonicalization must preserve semantic parameters. URL may be a publisher transcript URL with separately associated video.

**source_item_versions** — Immutable retrieved/extracted item revision and permission lineage. Key fields: id, item_id, source_id, rights_grant_id, revision, title, author, source_published_at, source_modified_at, fetched_at, fetched_url, language, content_hash, normalized_hash, body_object_key, extraction_version, transcript_provenance, associated_video_url, duration_ms, eligibility, retention_until, metadata_refresh_due_at, metadata. A changed body creates another version. Restricted API metadata, independently licensed transcripts and raw bodies need distinct retention rules, including any public attribution metadata subject to refresh.

**source_observations** — Each retrieval/availability check, including repeated unchanged content. Key fields: id, item_id, source_version_id, endpoint_id, observed_at, http_status, requested_url, final_url, etag, last_modified, availability. Unchanged fetches point to the existing checksum version. An A-B-A content sequence is preserved by observations without duplicating source content. Apply provider metadata retention to these records too.

**media_assets** — Owned or licensed illustrative/document assets. Key fields: id, source_version_id, rights_grant_id, object_key, mime_type, byte_size, checksum, alt_text, credit, is_owned, retention_until. YouTube audiovisual files are not downloaded into this table. Only separately permitted assets or owned product visuals belong here.

**reporting_origins** — Independently established underlying reporting/primary origin. Key fields: id, origin_key, label, origin_type, verified_by, verified_at, rationale. A wire story reproduced by many publishers remains one origin. Unknown origins do not satisfy independence gates.

**item_origins** — Many-to-many provenance of an item revision. Key fields: source_version_id, origin_id, relationship, counts_for_independence, rationale. Independence eligibility is a reviewed judgment. New source revisions can alter attribution and invalidate article approval.

**story_clusters** — Bounded event/question grouping with revision. Key fields: id, label, event_start_at, event_end_at, status, merged_into_id, revision, created_at. Merge/split logic also prevents cycles and invalidates evidence packs transactionally. Similarity does not override event/date distinctions.

**cluster_items** — Membership of exact item versions in event clusters. Key fields: cluster_id, source_version_id, match_method, reviewed_by, added_at. An item may discuss multiple events; many-to-many membership is intentional.

**evidence_spans** — Checksum-bound text/page/time locator. Key fields: id, source_version_id, start_char, end_char, page_number, start_ms, end_ms, excerpt_text, locator_hash, quality, retention_until. Validate char offsets against exact normalized content and times against duration. Public excerpt permission is checked separately from private retention.

**claims** — Atomic checkable propositions tied to an event cluster. Key fields: id, cluster_id, proposition, attribution, reference_time, structured_values, status, risk, claim_hash. A semantic change creates a new claim ID or revision in application logic; existing reviewed article mappings must not silently inherit edits.

**claim_evidence** — Support, contradiction or context edge to exact evidence. Key fields: claim_id, evidence_span_id, source_version_id, relation, verified_by, verified_at, rationale. The span must belong to the asserted source version. Text matching alone cannot set verified_by.

### Publishing

**articles** — Stable public article identity and current safe version pointer. Key fields: id, cluster_id, slug, status, current_version_id, lock_version, created_at, first_published_at. The current-version composite foreign key is added after article_versions exists. Public visibility is checked at serving time.

**article_versions** — One content-and-evidence approval unit. Key fields: id, article_id, cluster_id, version_number, state, headline, deck, content_hash, evidence_hash, approval_hash, risk, evidence_cutoff_at, created_by, created_at, published_at, change_summary. Hashes cover every factual surface, variant, claim, citation, origin and grant revision. Publication append-only history determines whether content is immutable.

**article_variants** — Pre-reviewed reading length/language within a version. Key fields: id, version_id, language, variant, reading_seconds, search_text. Translations are V1 and require separately recorded validation/approval coverage. Search text contains only the product narrative, not source bodies.

**article_blocks** — Ordered structured article content including factual headlines/decks. Key fields: id, variant_id, version_id, position, block_type, text_content, is_factual. Renderer accepts a constrained structure, not arbitrary model HTML. Header fields must agree with headline/deck blocks under canonical hashing.

**article_claims** — Claims selected into one article version. Key fields: version_id, claim_id, cluster_id, material. Composite keys prevent attaching a claim from a different event cluster without an explicit remapping.

**block_claims** — Every factual displayed block links to its reviewed claims. Key fields: block_id, version_id, claim_id. The publish service requires mappings for every material factual block across both variants, including key points and headings when factual.

**article_sources** — Stable numbered bibliography for an article version. Key fields: version_id, source_version_id, ordinal, usage, public_locator. Store source identity, not model-generated URLs. Numbering is stable for the entire version; related items never count toward evidence requirements.

**claim_citations** — Public claim reference to an included source and verified span. Key fields: version_id, claim_id, source_version_id, evidence_span_id. These foreign keys prevent a valid-looking citation to a source/span outside the selected version and claim.

**article_topics** — Multiple desks with at most one primary designation. Key fields: article_id, topic_id, is_primary. A partial unique index enforces at most one primary topic; publish service requires exactly one.

**article_relations** — Context links and ongoing-story relationships. Key fields: article_id, related_article_id, relation, position. Public projection checks visibility of both ends and caps reader recommendations to three.

**publication_events** — Durable append-only publication, correction and withdrawal history. Key fields: id, article_id, version_id, actor_id, event_type, reason, idempotency_key, created_at. Inserted in the same transaction as the public pointer change and outbox. Public reason is scrubbed of private report details.

**redirects** — Stable internal route aliases for renamed article/topic slugs. Key fields: from_path, to_path, status_code, created_at. Service restricts both paths to same-origin routes and prevents redirect cycles; preserve safe version/claim parameters.

### Workflow

**generation_runs** — Reproducible generation attempts and measured usage. Key fields: id, cluster_id, version_id, idempotency_key, provider, model, prompt_version, evidence_hash, input_manifest, status, input_tokens, output_tokens, cost_amount, cost_currency, started_at, finished_at, error_code. input_manifest contains IDs/hashes rather than an unrestricted full prompt. Full prompt storage needs the same source permissions and retention.

**validation_results** — Digest-bound individual validation outcomes. Key fields: id, version_id, approval_hash, check_code, check_version, result, severity, details, created_at. Publish selects results for the exact current digest and required check versions; old passing checks are not reusable after edits.

**review_assignments** — Work ownership without conferring approval. Key fields: id, version_id, reviewer_id, assigned_by, status, due_at, created_at. Assignments may be reassigned with audit. High-risk approval distinctness is by actual reviewer identity, not assignment row count.

**editorial_reviews** — Human decisions bound to immutable approval digest. Key fields: id, version_id, reviewer_id, approval_hash, decision, notes, reviewed_at. Application selects the exact digest and correct reviewer capabilities. Reviews are append-only; new decisions on changed drafts carry new digests.

### Governance

**reader_reports** — Version-specific factual/attribution/rights reports. Key fields: id, article_id, version_id, claim_id, reporter_user_id, contact_email, category, message, evidence_url, severity, status, receipt_token_hash, created_at. Optional email is private PII, encrypted under deployment policy and excluded from logs/public corrections. Rate-limit before creating rows.

**corrections** — Public change notice connected to private investigation. Key fields: id, article_id, report_id, from_version_id, to_version_id, public_note, severity, created_at. The two versions must belong to the same article. A withdrawal may have no replacement version.

**takedowns** — Source- or article-scoped suppression and remediation. Key fields: id, article_id, source_version_id, rights_grant_id, reason_code, private_reason, public_reason, status, requested_by, created_at, completed_at. Impact traversal finds all variants, blocks, prompts, excerpts, assets, search/cache entries and future messages. More than one target is permitted when explicit.

**audit_events** — Append-only minimal action record. Key fields: id, actor_token, action, resource_type, resource_id, reason, correlation_id, metadata, created_at. actor_token is a pseudonymous staff/service reference, not an email. Map to identity separately under retention policy. No source bodies, passwords or secrets.

**privacy_requests** — User export/deletion workflow with secure expiry. Key fields: id, user_id, subject_token, request_type, status, export_object_key, export_expires_at, created_at, completed_at. Keep the minimum deletion-ledger evidence after account identity is removed. A status token is not sufficient authorization for export.

**retention_tasks** — Auditable source and personal-data purge work. Key fields: id, privacy_request_id, takedown_id, resource_type, resource_id, action, due_at, status, policy_version, result, completed_at. Use one task per derived target with durable outcome. Refresh obligations and deletion deadlines are distinct from job retry deadlines.

### Operations

**ingestion_runs** — Scheduled endpoint poll/fetch attempts and counters. Key fields: id, endpoint_id, status, started_at, finished_at, item_count, error_code, correlation_id. Source text is not stored in error messages. Provider-specific quota consumption is validated metadata.

**processing_jobs** — Authoritative job state, attempts and lease. Key fields: id, job_type, idempotency_key, payload, status, attempts, max_attempts, next_attempt_at, lease_until, last_error_code, correlation_id, created_at, updated_at. Payload is schema-validated identifiers, not credentials or raw content. PostgreSQL uniqueness survives Redis loss.

**outbox_events** — Transactional events for cache, search, jobs and retention effects. Key fields: id, aggregate_type, aggregate_id, event_type, dedupe_key, payload, created_at, dispatched_at, attempts. Consumers are idempotent. dispatched_at indicates dispatch, not proof that every downstream side effect succeeded.

**analytics_events** — Minimal first-party events for defined product metrics. Key fields: id, event_name, anonymous_session_hash, article_id, version_id, properties, occurred_at, expires_at. Allowlist event properties; no raw query, full URL containing secrets, email or source body. Consent and bot/staff exclusion are service policies.

**feature_flags** — Audited rollout, budget and kill-switch configuration. Key fields: key, value, revision, updated_by, updated_at. Separate intake, generation, publication, video display and emergency suppression flags. Configuration schemas are versioned.

### V1

**notification_preferences** — Explicit communication opt-in; not enabled at launch. Key fields: user_id, enabled, cadence, timezone, quiet_start, quiet_end, confirmed_at, updated_at. V1 migration only. Consent and timezone validation are required; later story-specific subscriptions need an extension relation.

**notification_deliveries** — Idempotent future digest/alert deliveries. Key fields: id, user_id, channel, edition_key, status, provider_message_id, idempotency_key, article_version_ids, scheduled_at, sent_at. Provider idempotency/reconciliation is necessary after ambiguous timeout. JSON version IDs require service validation and pre-send publication checks.

**source_suggestions** — Quarantined reader suggestions, never direct fetch commands. Key fields: id, user_id, url, reason, article_id, status, created_at. V1 moderation is required before any network fetch. Unknown URL data is escaped in staff tools.

## 5. Critical relationship chains

**Source permission chain:** source -> rights_grant -> source_item_version. The item-version row carries source_id and composite foreign keys to both its item and grant. This prevents accidentally using one publisher's permission to process another publisher's item. Versioned grant records are checked against status, effective dates and scope before each use.

**Factual evidence chain:** source_item_version -> evidence_span -> claim_evidence -> claim. Each evidence edge includes the source-version ID, and a composite foreign key proves that the span belongs to it. Claim evidence retains whether it supports, contradicts or merely contextualizes the proposition. The prose “X alleged Y” and the proposition Y are different claims.

**Published attribution chain:** article_version -> article_claims -> claim_citations -> article_sources -> source_item_version. Additional composite keys require the citation's claim, source and span to belong to the same version-selected evidence. block_claims maps displayed factual blocks to those claims. The renderer derives citation URLs from approved source identities; it does not accept model-generated links.

**Event integrity chain:** articles and claims belong to clusters. article_versions and article_claims use composite keys to prevent cross-cluster claims from being attached accidentally. A deliberate cluster split/merge requires explicit remapping and revalidation; existing published versions must remain historically coherent or be superseded with an explanatory change.

**Version integrity chain:** articles.current_version_id and article_versions.article_id are connected by a deferred composite foreign key. Bookmarks, reports, corrections and publication events likewise ensure that a referenced version belongs to the specified article. A claim report either references a selected claim in that exact version or has no claim reference.

## 6. Publication invariants: database versus domain service

The database enforces entity uniqueness, relationship membership, one bookmark per reader/article, unique source numbering within a version, at most one primary topic, valid basic state values, nonnegative quantities and ordered locator ranges. Foreign keys prevent dangling references, but they cannot prove that a source's text really supports a sentence.

The publish service must enforce all of the following within a locked transaction: the caller has Publisher capability and recent required authentication; exactly one primary topic exists; the proposed version belongs to the article and matches expected lock version; both required variants are complete; headline/deck fields agree with their reviewed factual blocks; every material factual block maps to claims; every material claim has a verified support or correctly attributed evidence relation; every inline source resolves; no critical validator fails; at least three distinct eligible source items and two independently established origins are present; all required grants and source approvals remain valid; and one or two distinct human approvals match the exact approval_hash according to risk. Only each reviewer's latest decision for that digest counts; a later revoke, reject or changes-requested decision invalidates their earlier approval. Review mutations and publishing use the same article lock to prevent races.

Three versions of the same source item do not count as three sources. Three reprints of one origin do not count as independent confirmation. A contextual or related item does not satisfy the evidence threshold. A source that contradicts a claim can support an accurately attributed description of the disagreement, not an unsupported resolution of it.

A publication transaction atomically updates the public pointer/status, increments lock_version, appends a publication event and inserts outbox events. It must reject stale or duplicate incompatible attempts. A rejected attempt produces no partial public state. SQL DDL alone is not claimed to enforce these cross-row and semantic invariants.

## 7. Public article representation and source numbering

The public article response contains stable article identity, selected safe version, language/variant, headline/deck, structured blocks, safe claim statuses, source entries, dates, disclosure and correction state. Exclude raw bodies, private evidence notes, contracts, generation prompts, staff-only risk rationale, reporter contacts and credentials. Reviewer responses are separate schemas, not public responses with a visibility boolean.

For each article version, article_sources assigns a stable positive ordinal. Both reading variants use the same version-wide source numbering. Render all evidence/context source entries used in the approved version at the bottom; indicate “Cited in this view” versus “Used in the full article” when necessary. The displayed total is the distinct evidence-item count for the approved version, with an optional per-view cited count. Related watch/read links form a separate section and do not contribute to the total. This avoids a different meaning for “5 sources” when a reader changes length.

A source entry resolves exact title, organization/channel, available author, original publication time, latest lawful availability observation, canonical original link, role and page/time locator. If metadata must be refreshed or deleted under a provider policy, render only what remains permitted. Never preserve restricted API metadata merely to make an old bibliography look complete. A necessary removal is disclosed and the article is re-evaluated.

Example, using fictional fixture identifiers: article A1/version 3 has source entries 1 and 2 from separate publishers reprinting origin O1, plus source 3 from primary origin O2. Claim C1 is expressed by paragraph B7 and linked to span E9 of source version S3. A citation in B7 resolves through C1/E9/S3 to bibliography entry 3. A fourth video linked only for context is shown as Related video and cannot make the evidence count four.

## 8. Indexes, search and expected queries

Included indexes cover source-review/rights expiry, due endpoint polls, source-version lineage, retention dates, reverse origin/cluster/evidence relationships, published article order, variant full-text search, source-to-article impact analysis, recent bookmarks, current-digest validation, assignments, reports, publication history, due jobs, undispatched outbox rows, retention work and audit lookup.

Public feeds query article status/current_version first, then join topics and safe version metadata. Search joins indexed article_variants to the current safe article pointer; an index match alone is not sufficient permission to return a result. Citation resolution selects article_sources by version and ordinal and then applies source visibility/retention policy. Withdrawal impact starts from grant/item-version, follows article_sources and claim_citations, and identifies every derivative and public route.

An estimated 500 full-content items/day over a 30-day permitted retention window is 15,000 bodies before duplicates. At a hypothetical 50 KB each, raw text is approximately 750 MB before originals, revisions, indexes and backups. Metadata discovery may be larger. This is only a sizing illustration; actual content-size distribution and licenses determine capacity. Do not partition prematurely. Consider time partitioning for analytics/observations only after measured row volume and query plans justify it.

## 9. Privacy, retention and deletion design

User-owned tables such as preferences, follows, bookmarks and sessions cascade on a genuine account-row deletion; editorial relationships generally restrict deletion or minimize actor identity instead. Staff records referenced by approvals should be retained as minimized identities where lawful rather than removing the audit trail. The privacy service distinguishes reader deletion from staff-record obligations and records the approved basis.

Raw source bodies, excerpts, assets, embeddings and full prompt/output archives are rights-governed. Each retained object has a policy and deadline. API display metadata and independently licensed publisher transcripts are distinct data classes. A source withdrawal creates a takedown with impact traversal, public suppression and individual retention tasks. Delete cached/derived text too; a hash can be retained only where appropriate and does not grant permission to retain the original content.

The audit table is append-only to ordinary application code. Its trigger is not legal-retention magic: expiry/redaction needs a separate privileged, audited maintenance procedure. actor_token is pseudonymous and must not be an email. Strip identifying mappings when required while preserving permissible aggregate audit evidence. Do not keep sensitive content in metadata “for debugging.”

Exports are generated from an allowlisted member-data projection and stored privately with 24-hour signed access. Confirmed account deletion revokes sessions and suppresses messages before asynchronous purge. Retention work records completion per target; an HTTP 202 only means accepted, not erased. A deletion ledger is reapplied after backup restoration before traffic is admitted.

## 10. Migrations, constraints and tests

Adopt the logical schema incrementally: identity/roles first, then source governance and intake, then evidence and publication, then reader features and operations. The full reference launch DDL is useful for a disposable integration database; it is not a reason to build every UI in the first sprint. V1 tables remain outside launch migrations until the release is approved. Optional story-alert subscriptions, language QA details and V2 entitlements require their own reviewed schema extensions.

Migration discipline is expand, backfill, validate, switch readers/writers and only then contract. Run backups and restore rehearsal for destructive changes. Define transaction timeouts and bounded backfill batches. No secrets, real personal data or copyrighted fixtures are included in seed data.

Required database tests: reject a source version using another source's grant; reject a span/source mismatch; reject a citation to a source absent from the version; reject a cross-cluster claim mapping; reject a current-version pointer to another article; reject duplicate source ordinals/bookmarks; reject invalid time/character ranges; preserve two distinct review identities; demonstrate optimistic publication conflict; and verify a source withdrawal identifies all affected variants.

Required service tests: reject all unpermissioned model transfers; do not accept stale approvals; bind all factual blocks; distinguish independent origins from owners; apply separate public/private response schemas; prevent cross-user bookmarks/export access; replay jobs safely; suppress a withdrawn article at the edge; delete source derivatives; and replay deletion records after restore. Test authorization under the actual application database role, not only an owner/superuser. [R22]

## 11. Known implementation boundaries

The schema specifies the product's launch entities and explicit V1 extension placeholders, but it is not an ORM model, runnable backend service, production policy grant set or SQL integration-test report. A live PostgreSQL migration/constraint execution was not performed as part of authoring these planning documents. The Implementation Plan makes that verification a prerequisite to using the schema in application work. API-data permissions, content contracts, storage region and final retention periods remain owner/provider/legal decisions.


## References

External references were checked on 8 October 2026. Requirements, thresholds, architecture and visual choices are project proposals, not claims of measured performance. Recheck changeable provider terms before implementation.

[R07] YouTube captions.download. Caption downloads require authorization and permission to edit the video. [Open source](https://developers.google.com/youtube/v3/docs/captions/download).

[R08] YouTube API Services Developer Policies. API-data use, aggregation, storage, attribution, playback and scraping restrictions. [Open source](https://developers.google.com/youtube/terms/developer-policies).

[R18] OWASP SSRF prevention. Untrusted outbound fetch defense guidance. [Open source](https://cheatsheetseries.owasp.org/cheatsheets/Server_Side_Request_Forgery_Prevention_Cheat_Sheet.html).

[R20] BullMQ idempotent jobs. Retry-safe, small and atomic job design. [Open source](https://docs.bullmq.io/patterns/idempotent-jobs).

[R22] PostgreSQL row security. Database policy behavior and privileged-role caveats. [Open source](https://www.postgresql.org/docs/current/ddl-rowsecurity.html).
