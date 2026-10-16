# Complete relational data dictionary

Reference baseline; SQL definitions and service constraints must be tested together.

## users | Identity

Minimal account identity; no inferred sensitive attributes.

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
email_normalized text UNIQUE
email_verified_at timestamptz
display_name text
status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','suspended','deleting','deleted'))
created_at timestamptz NOT NULL DEFAULT now()
deleted_at timestamptz
```

Normalize/verify email in the service. Delete or minimize identity fields on confirmed deletion. Authorize by immutable id, not email.

## auth_identities | Identity

Bind a verified identity-provider subject to one member.

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE
provider text NOT NULL
subject text NOT NULL
created_at timestamptz NOT NULL DEFAULT now()
UNIQUE (provider, subject)
```

Identity linking requires reauthentication; provider/subject uniqueness prevents duplicate account bindings.

## sessions | Identity

Revocable first-party sessions; raw bearer values are never stored.

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE
token_hash text NOT NULL UNIQUE
created_at timestamptz NOT NULL DEFAULT now()
expires_at timestamptz NOT NULL
last_seen_at timestamptz NOT NULL DEFAULT now()
mfa_verified_at timestamptz
revoked_at timestamptz
CHECK (expires_at > created_at)
```

Use cryptographic token hashes and secure cookies. Staff role change revokes or re-evaluates privileged sessions.

## auth_challenges | Identity

Single-use passwordless sign-in challenges.

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
email_normalized text NOT NULL
token_hash text NOT NULL UNIQUE
purpose text NOT NULL CHECK (purpose IN ('sign_in','link_identity','reauthenticate'))
return_path text
expires_at timestamptz NOT NULL
consumed_at timestamptz
created_at timestamptz NOT NULL DEFAULT now()
```

Consume atomically with expiry validation. Return path must be same-origin allowlisted; purge expired rows promptly.

## roles | Identity

Fixed application capability bundles.

```sql
code text PRIMARY KEY
name text NOT NULL
capabilities jsonb NOT NULL DEFAULT '[]'::jsonb
```

Seed reader, editor, publisher, curator, rights_reviewer, operator and administrator. Application validates the capability vocabulary.

## user_roles | Identity

Audited staff and reader role assignments.

```sql
user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE
role_code text NOT NULL REFERENCES roles(code)
assigned_by uuid REFERENCES users(id) ON DELETE SET NULL
assigned_at timestamptz NOT NULL DEFAULT now()
PRIMARY KEY (user_id, role_code)
```

Do not allow application readers to self-assign. Administrator changes are transactional with audit.

## user_preferences | Reader

Presentation preferences and explicit home mode.

```sql
user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE
theme text NOT NULL DEFAULT 'system' CHECK (theme IN ('light','dark','system'))
text_size text NOT NULL DEFAULT 'standard' CHECK (text_size IN ('small','standard','large'))
reduce_motion boolean NOT NULL DEFAULT false
home_mode text NOT NULL DEFAULT 'editorial' CHECK (home_mode IN ('editorial','following'))
language text NOT NULL DEFAULT 'en'
timezone text NOT NULL DEFAULT 'UTC'
lock_version integer NOT NULL DEFAULT 0
updated_at timestamptz NOT NULL DEFAULT now()
```

Validate IANA timezone and language in contracts. OS reduced motion overrides decorative user motion preferences.

## consents | Identity

Versioned consent decisions rather than one mutable checkbox.

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id uuid REFERENCES users(id) ON DELETE CASCADE
anonymous_key_hash text
purpose text NOT NULL
policy_version text NOT NULL
granted boolean NOT NULL
recorded_at timestamptz NOT NULL DEFAULT now()
CHECK (num_nonnulls(user_id, anonymous_key_hash) = 1)
```

Store minimal pseudonymous anonymous consent only where needed; deletion and expiry follow the specific purpose.

## topics | Reader

Editorial desks and topic metadata.

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
slug text NOT NULL UNIQUE
name text NOT NULL
scope text NOT NULL
status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived'))
sort_order integer NOT NULL DEFAULT 0
```

Seed the six launch desks. Route aliases for renamed slugs are handled by the redirects table.

## topic_follows | Reader

Only explicitly selected topic interests.

```sql
user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE
topic_id uuid NOT NULL REFERENCES topics(id)
created_at timestamptz NOT NULL DEFAULT now()
PRIMARY KEY (user_id, topic_id)
```

This relation powers For you. No inferred political, health or religious classification is stored.

## sources | Sources

Editorial source identity independent of individual items.

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
slug text NOT NULL UNIQUE
name text NOT NULL
source_type text NOT NULL CHECK (source_type IN ('publisher','channel','institution','specialist'))
home_url text NOT NULL
identity_key text NOT NULL UNIQUE
status text NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed','discovery_only','active','suspended','archived'))
public_rationale text
review_due_at timestamptz
created_at timestamptz NOT NULL DEFAULT now()
lock_version integer NOT NULL DEFAULT 0
```

identity_key is a verified canonical domain or channel/institution identifier. Public suitability scope is not a universal truth ranking.

## source_ownerships | Sources

Time-bounded disclosed ownership relationships.

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
source_id uuid NOT NULL REFERENCES sources(id)
owner_name text NOT NULL
owner_key text NOT NULL
valid_from date
valid_to date
verification_url text
verified_at timestamptz
CHECK (valid_to IS NULL OR valid_from IS NULL OR valid_to >= valid_from)
```

Ownership and independent reporting origins are distinct concepts. Unknown ownership remains unknown.

## source_reviews | Sources

Append-only editorial source suitability decisions.

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
source_id uuid NOT NULL REFERENCES sources(id)
reviewer_id uuid REFERENCES users(id) ON DELETE SET NULL
decision text NOT NULL CHECK (decision IN ('approve','restrict','reject','suspend'))
topic_scope jsonb NOT NULL DEFAULT '[]'::jsonb
rationale text NOT NULL
reviewed_at timestamptz NOT NULL DEFAULT now()
expires_at timestamptz
```

Detailed private review is separated from sources.public_rationale. Changing a decision means inserting another record.

## rights_grants | Sources

Scoped, versioned permission decisions for processing and display.

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
source_id uuid NOT NULL REFERENCES sources(id)
grant_key text NOT NULL
revision integer NOT NULL CHECK (revision > 0)
status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','revoked','expired'))
allow_discovery boolean NOT NULL DEFAULT false
allow_fetch boolean NOT NULL DEFAULT false
allow_store boolean NOT NULL DEFAULT false
allow_model boolean NOT NULL DEFAULT false
allow_synthesis boolean NOT NULL DEFAULT false
allow_public_excerpt boolean NOT NULL DEFAULT false
allow_media boolean NOT NULL DEFAULT false
scope jsonb NOT NULL DEFAULT '{}'::jsonb
agreement_reference text NOT NULL
approved_by uuid REFERENCES users(id) ON DELETE SET NULL
starts_at timestamptz NOT NULL
ends_at timestamptz
raw_retention_days integer CHECK (raw_retention_days >= 0)
public_excerpt_limit integer CHECK (public_excerpt_limit >= 0)
revoked_at timestamptz
UNIQUE (grant_key, revision)
UNIQUE (id, source_id)
CHECK (ends_at IS NULL OR ends_at > starts_at)
```

Scope must include exact content, territory and approved downstream providers where relevant. Grant revision is immutable; revocation is an auditable state change. No permission defaults to true.

## source_endpoints | Sources

Provider-specific discovery and fetch configuration.

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
source_id uuid NOT NULL REFERENCES sources(id)
adapter text NOT NULL CHECK (adapter IN ('rss','atom','licensed_api','approved_web','publisher_upload','youtube_display'))
endpoint_url text NOT NULL
secret_reference text
allowed_hosts jsonb NOT NULL DEFAULT '[]'::jsonb
configuration jsonb NOT NULL DEFAULT '{}'::jsonb
status text NOT NULL DEFAULT 'paused' CHECK (status IN ('active','paused','failed'))
poll_interval_seconds integer NOT NULL DEFAULT 900 CHECK (poll_interval_seconds >= 60)
next_poll_at timestamptz
UNIQUE (source_id, adapter, endpoint_url)
```

Store references to credentials only. JSON contains non-secret validated adapter settings, limits, quota buckets and cursor.

## source_items | Evidence

Stable identity of an original article, document or video.

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
source_id uuid NOT NULL REFERENCES sources(id)
provider_item_key text NOT NULL
kind text NOT NULL CHECK (kind IN ('article','video','document','transcript','audio'))
canonical_url text NOT NULL
first_seen_at timestamptz NOT NULL DEFAULT now()
UNIQUE (source_id, provider_item_key)
UNIQUE (id, source_id)
```

Different URLs can refer to one item; conservative canonicalization must preserve semantic parameters. URL may be a publisher transcript URL with separately associated video.

## source_item_versions | Evidence

Immutable retrieved/extracted item revision and permission lineage.

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
item_id uuid NOT NULL
source_id uuid NOT NULL
rights_grant_id uuid NOT NULL
revision integer NOT NULL CHECK (revision > 0)
title text NOT NULL
author text
source_published_at timestamptz
source_modified_at timestamptz
fetched_at timestamptz NOT NULL DEFAULT now()
fetched_url text NOT NULL
language text NOT NULL
content_hash text NOT NULL
normalized_hash text
body_object_key text
extraction_version text
transcript_provenance text
associated_video_url text
duration_ms bigint CHECK (duration_ms >= 0)
eligibility text NOT NULL DEFAULT 'needs_review' CHECK (eligibility IN ('metadata_only','needs_review','eligible','denied','withdrawn'))
retention_until timestamptz
metadata_refresh_due_at timestamptz
metadata jsonb NOT NULL DEFAULT '{}'::jsonb
FOREIGN KEY (item_id, source_id) REFERENCES source_items(id, source_id)
FOREIGN KEY (rights_grant_id, source_id) REFERENCES rights_grants(id, source_id)
UNIQUE (item_id, revision)
UNIQUE (item_id, content_hash)
UNIQUE (id, item_id)
```

A changed body creates another version. Restricted API metadata, independently licensed transcripts and raw bodies need distinct retention rules, including any public attribution metadata subject to refresh.

## source_observations | Evidence

Each retrieval/availability check, including repeated unchanged content.

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
item_id uuid NOT NULL REFERENCES source_items(id)
source_version_id uuid
endpoint_id uuid REFERENCES source_endpoints(id)
observed_at timestamptz NOT NULL DEFAULT now()
http_status integer CHECK (http_status BETWEEN 100 AND 599)
requested_url text NOT NULL
final_url text
etag text
last_modified text
availability text NOT NULL CHECK (availability IN ('available','unchanged','unavailable','denied'))
FOREIGN KEY (source_version_id, item_id) REFERENCES source_item_versions(id, item_id)
```

Unchanged fetches point to the existing checksum version. An A-B-A content sequence is preserved by observations without duplicating source content. Apply provider metadata retention to these records too.

## media_assets | Evidence

Owned or licensed illustrative/document assets.

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
source_version_id uuid REFERENCES source_item_versions(id)
rights_grant_id uuid REFERENCES rights_grants(id)
object_key text NOT NULL UNIQUE
mime_type text NOT NULL
byte_size bigint NOT NULL CHECK (byte_size >= 0)
checksum text NOT NULL
alt_text text
credit text
is_owned boolean NOT NULL DEFAULT false
retention_until timestamptz
CHECK (is_owned OR rights_grant_id IS NOT NULL)
```

YouTube audiovisual files are not downloaded into this table. Only separately permitted assets or owned product visuals belong here.

## reporting_origins | Evidence

Independently established underlying reporting/primary origin.

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
origin_key text NOT NULL UNIQUE
label text NOT NULL
origin_type text NOT NULL CHECK (origin_type IN ('original_reporting','primary_document','wire_report','unknown'))
verified_by uuid REFERENCES users(id) ON DELETE SET NULL
verified_at timestamptz
rationale text
```

A wire story reproduced by many publishers remains one origin. Unknown origins do not satisfy independence gates.

## item_origins | Evidence

Many-to-many provenance of an item revision.

```sql
source_version_id uuid NOT NULL REFERENCES source_item_versions(id)
origin_id uuid NOT NULL REFERENCES reporting_origins(id)
relationship text NOT NULL CHECK (relationship IN ('original','reprint','derived','cites'))
counts_for_independence boolean NOT NULL DEFAULT false
rationale text
PRIMARY KEY (source_version_id, origin_id)
```

Independence eligibility is a reviewed judgment. New source revisions can alter attribution and invalidate article approval.

## story_clusters | Evidence

Bounded event/question grouping with revision.

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
label text NOT NULL
event_start_at timestamptz
event_end_at timestamptz
status text NOT NULL DEFAULT 'candidate' CHECK (status IN ('candidate','ready','merged','archived'))
merged_into_id uuid REFERENCES story_clusters(id)
revision integer NOT NULL DEFAULT 1 CHECK (revision > 0)
created_at timestamptz NOT NULL DEFAULT now()
CHECK (event_end_at IS NULL OR event_start_at IS NULL OR event_end_at >= event_start_at)
CHECK (merged_into_id IS NULL OR merged_into_id <> id)
```

Merge/split logic also prevents cycles and invalidates evidence packs transactionally. Similarity does not override event/date distinctions.

## cluster_items | Evidence

Membership of exact item versions in event clusters.

```sql
cluster_id uuid NOT NULL REFERENCES story_clusters(id)
source_version_id uuid NOT NULL REFERENCES source_item_versions(id)
match_method text NOT NULL
reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL
added_at timestamptz NOT NULL DEFAULT now()
PRIMARY KEY (cluster_id, source_version_id)
```

An item may discuss multiple events; many-to-many membership is intentional.

## evidence_spans | Evidence

Checksum-bound text/page/time locator.

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
source_version_id uuid NOT NULL REFERENCES source_item_versions(id)
start_char integer CHECK (start_char >= 0)
end_char integer
page_number integer CHECK (page_number > 0)
start_ms bigint CHECK (start_ms >= 0)
end_ms bigint
excerpt_text text
locator_hash text NOT NULL
quality text NOT NULL DEFAULT 'needs_review' CHECK (quality IN ('needs_review','verified','rejected'))
retention_until timestamptz
UNIQUE (id, source_version_id)
CHECK ((start_char IS NULL AND end_char IS NULL) OR (start_char IS NOT NULL AND end_char IS NOT NULL AND end_char > start_char))
CHECK ((start_ms IS NULL AND end_ms IS NULL) OR (start_ms IS NOT NULL AND end_ms IS NOT NULL AND end_ms > start_ms))
```

Validate char offsets against exact normalized content and times against duration. Public excerpt permission is checked separately from private retention.

## claims | Evidence

Atomic checkable propositions tied to an event cluster.

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
cluster_id uuid NOT NULL REFERENCES story_clusters(id)
proposition text NOT NULL
attribution text
reference_time timestamptz
structured_values jsonb NOT NULL DEFAULT '{}'::jsonb
status text NOT NULL DEFAULT 'unresolved' CHECK (status IN ('corroborated','attributed','disputed','unresolved','rejected'))
risk text NOT NULL DEFAULT 'normal' CHECK (risk IN ('normal','high'))
claim_hash text NOT NULL
UNIQUE (id, cluster_id)
```

A semantic change creates a new claim ID or revision in application logic; existing reviewed article mappings must not silently inherit edits.

## claim_evidence | Evidence

Support, contradiction or context edge to exact evidence.

```sql
claim_id uuid NOT NULL REFERENCES claims(id)
evidence_span_id uuid NOT NULL
source_version_id uuid NOT NULL
relation text NOT NULL CHECK (relation IN ('supports','contradicts','context'))
verified_by uuid REFERENCES users(id) ON DELETE SET NULL
verified_at timestamptz
rationale text
FOREIGN KEY (evidence_span_id, source_version_id) REFERENCES evidence_spans(id, source_version_id)
PRIMARY KEY (claim_id, evidence_span_id, source_version_id)
```

The span must belong to the asserted source version. Text matching alone cannot set verified_by.

## articles | Publishing

Stable public article identity and current safe version pointer.

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
cluster_id uuid NOT NULL REFERENCES story_clusters(id)
slug text NOT NULL UNIQUE
status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','withdrawn','archived'))
current_version_id uuid
lock_version integer NOT NULL DEFAULT 0
created_at timestamptz NOT NULL DEFAULT now()
first_published_at timestamptz
UNIQUE (id, cluster_id)
```

The current-version composite foreign key is added after article_versions exists. Public visibility is checked at serving time.

## article_versions | Publishing

One content-and-evidence approval unit.

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
article_id uuid NOT NULL
cluster_id uuid NOT NULL
version_number integer NOT NULL CHECK (version_number > 0)
state text NOT NULL DEFAULT 'draft' CHECK (state IN ('queued','generating','draft','in_review','approved','published','rejected','withdrawn','redacted'))
headline text NOT NULL
deck text NOT NULL DEFAULT ''
content_hash text NOT NULL
evidence_hash text NOT NULL
approval_hash text NOT NULL
risk text NOT NULL DEFAULT 'normal' CHECK (risk IN ('normal','high'))
evidence_cutoff_at timestamptz NOT NULL
created_by uuid REFERENCES users(id) ON DELETE SET NULL
created_at timestamptz NOT NULL DEFAULT now()
published_at timestamptz
change_summary text
FOREIGN KEY (article_id, cluster_id) REFERENCES articles(id, cluster_id)
UNIQUE (article_id, version_number)
UNIQUE (id, article_id)
UNIQUE (id, cluster_id)
```

Hashes cover every factual surface, variant, claim, citation, origin and grant revision. Publication append-only history determines whether content is immutable.

## article_variants | Publishing

Pre-reviewed reading length/language within a version.

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
version_id uuid NOT NULL REFERENCES article_versions(id)
language text NOT NULL DEFAULT 'en'
variant text NOT NULL CHECK (variant IN ('standard','brief'))
reading_seconds integer CHECK (reading_seconds >= 0)
search_text tsvector
UNIQUE (version_id, language, variant)
UNIQUE (id, version_id)
```

Translations are V1 and require separately recorded validation/approval coverage. Search text contains only the product narrative, not source bodies.

## article_blocks | Publishing

Ordered structured article content including factual headlines/decks.

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
variant_id uuid NOT NULL
version_id uuid NOT NULL
position integer NOT NULL CHECK (position >= 0)
block_type text NOT NULL CHECK (block_type IN ('headline','deck','heading','paragraph','key_point','quote','uncertainty','disclosure'))
text_content text NOT NULL
is_factual boolean NOT NULL DEFAULT true
FOREIGN KEY (variant_id, version_id) REFERENCES article_variants(id, version_id)
UNIQUE (variant_id, position)
UNIQUE (id, version_id)
```

Renderer accepts a constrained structure, not arbitrary model HTML. Header fields must agree with headline/deck blocks under canonical hashing.

## article_claims | Publishing

Claims selected into one article version.

```sql
version_id uuid NOT NULL
claim_id uuid NOT NULL
cluster_id uuid NOT NULL
material boolean NOT NULL DEFAULT true
FOREIGN KEY (version_id, cluster_id) REFERENCES article_versions(id, cluster_id)
FOREIGN KEY (claim_id, cluster_id) REFERENCES claims(id, cluster_id)
PRIMARY KEY (version_id, claim_id)
```

Composite keys prevent attaching a claim from a different event cluster without an explicit remapping.

## block_claims | Publishing

Every factual displayed block links to its reviewed claims.

```sql
block_id uuid NOT NULL
version_id uuid NOT NULL
claim_id uuid NOT NULL
FOREIGN KEY (block_id, version_id) REFERENCES article_blocks(id, version_id)
FOREIGN KEY (version_id, claim_id) REFERENCES article_claims(version_id, claim_id)
PRIMARY KEY (block_id, claim_id)
```

The publish service requires mappings for every material factual block across both variants, including key points and headings when factual.

## article_sources | Publishing

Stable numbered bibliography for an article version.

```sql
version_id uuid NOT NULL REFERENCES article_versions(id)
source_version_id uuid NOT NULL REFERENCES source_item_versions(id)
ordinal integer NOT NULL CHECK (ordinal > 0)
usage text NOT NULL CHECK (usage IN ('evidence','context','related'))
public_locator jsonb NOT NULL DEFAULT '{}'::jsonb
PRIMARY KEY (version_id, source_version_id)
UNIQUE (version_id, ordinal)
```

Store source identity, not model-generated URLs. Numbering is stable for the entire version; related items never count toward evidence requirements.

## claim_citations | Publishing

Public claim reference to an included source and verified span.

```sql
version_id uuid NOT NULL
claim_id uuid NOT NULL
source_version_id uuid NOT NULL
evidence_span_id uuid NOT NULL
FOREIGN KEY (version_id, claim_id) REFERENCES article_claims(version_id, claim_id)
FOREIGN KEY (version_id, source_version_id) REFERENCES article_sources(version_id, source_version_id)
FOREIGN KEY (claim_id, evidence_span_id, source_version_id) REFERENCES claim_evidence(claim_id, evidence_span_id, source_version_id)
PRIMARY KEY (version_id, claim_id, evidence_span_id)
```

These foreign keys prevent a valid-looking citation to a source/span outside the selected version and claim.

## article_topics | Publishing

Multiple desks with at most one primary designation.

```sql
article_id uuid NOT NULL REFERENCES articles(id)
topic_id uuid NOT NULL REFERENCES topics(id)
is_primary boolean NOT NULL DEFAULT false
PRIMARY KEY (article_id, topic_id)
```

A partial unique index enforces at most one primary topic; publish service requires exactly one.

## article_relations | Publishing

Context links and ongoing-story relationships.

```sql
article_id uuid NOT NULL REFERENCES articles(id)
related_article_id uuid NOT NULL REFERENCES articles(id)
relation text NOT NULL CHECK (relation IN ('background','follow_up','related'))
position integer NOT NULL DEFAULT 0
PRIMARY KEY (article_id, related_article_id)
CHECK (article_id <> related_article_id)
```

Public projection checks visibility of both ends and caps reader recommendations to three.

## bookmarks | Reader

Private saved article identity and first-viewed version.

```sql
user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE
article_id uuid NOT NULL REFERENCES articles(id)
saved_version_id uuid
created_at timestamptz NOT NULL DEFAULT now()
FOREIGN KEY (saved_version_id, article_id) REFERENCES article_versions(id, article_id)
PRIMARY KEY (user_id, article_id)
```

Current safe content opens by default. Saved historical references never authorize access to withdrawn text.

## generation_runs | Workflow

Reproducible generation attempts and measured usage.

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
cluster_id uuid NOT NULL REFERENCES story_clusters(id)
version_id uuid
FOREIGN KEY (version_id, cluster_id) REFERENCES article_versions(id, cluster_id)
idempotency_key text NOT NULL UNIQUE
provider text NOT NULL
model text NOT NULL
prompt_version text NOT NULL
evidence_hash text NOT NULL
input_manifest jsonb NOT NULL DEFAULT '{}'::jsonb
status text NOT NULL CHECK (status IN ('queued','running','succeeded','failed','canceled'))
input_tokens bigint CHECK (input_tokens >= 0)
output_tokens bigint CHECK (output_tokens >= 0)
cost_amount numeric(14,6) CHECK (cost_amount >= 0)
cost_currency char(3)
started_at timestamptz
finished_at timestamptz
error_code text
```

input_manifest contains IDs/hashes rather than an unrestricted full prompt. Full prompt storage needs the same source permissions and retention.

## validation_results | Workflow

Digest-bound individual validation outcomes.

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
version_id uuid NOT NULL REFERENCES article_versions(id)
approval_hash text NOT NULL
check_code text NOT NULL
check_version text NOT NULL
result text NOT NULL CHECK (result IN ('pass','warn','fail'))
severity text NOT NULL CHECK (severity IN ('info','major','critical'))
details jsonb NOT NULL DEFAULT '{}'::jsonb
created_at timestamptz NOT NULL DEFAULT now()
```

Publish selects results for the exact current digest and required check versions; old passing checks are not reusable after edits.

## review_assignments | Workflow

Work ownership without conferring approval.

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
version_id uuid NOT NULL REFERENCES article_versions(id)
reviewer_id uuid NOT NULL REFERENCES users(id)
assigned_by uuid REFERENCES users(id) ON DELETE SET NULL
status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','completed','canceled'))
due_at timestamptz
created_at timestamptz NOT NULL DEFAULT now()
```

Assignments may be reassigned with audit. High-risk approval distinctness is by actual reviewer identity, not assignment row count.

## editorial_reviews | Workflow

Human decisions bound to immutable approval digest.

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
version_id uuid NOT NULL REFERENCES article_versions(id)
reviewer_id uuid NOT NULL REFERENCES users(id)
approval_hash text NOT NULL
decision text NOT NULL CHECK (decision IN ('approve','changes_requested','reject','revoke'))
notes text
reviewed_at timestamptz NOT NULL DEFAULT now()
```

Application selects the exact digest and correct reviewer capabilities. Reviews are append-only; new decisions on changed drafts carry new digests.

## publication_events | Publishing

Durable append-only publication, correction and withdrawal history.

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
article_id uuid NOT NULL REFERENCES articles(id)
version_id uuid
actor_id uuid REFERENCES users(id) ON DELETE SET NULL
event_type text NOT NULL CHECK (event_type IN ('publish','update','correct','withdraw','restore','redact'))
reason text NOT NULL
idempotency_key text NOT NULL UNIQUE
created_at timestamptz NOT NULL DEFAULT now()
FOREIGN KEY (version_id, article_id) REFERENCES article_versions(id, article_id)
```

Inserted in the same transaction as the public pointer change and outbox. Public reason is scrubbed of private report details.

## reader_reports | Governance

Version-specific factual/attribution/rights reports.

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
article_id uuid NOT NULL REFERENCES articles(id)
version_id uuid NOT NULL
claim_id uuid
reporter_user_id uuid REFERENCES users(id) ON DELETE SET NULL
contact_email text
category text NOT NULL
message text NOT NULL
evidence_url text
severity text NOT NULL DEFAULT 'normal' CHECK (severity IN ('normal','urgent'))
status text NOT NULL DEFAULT 'received' CHECK (status IN ('received','triaged','investigating','action_required','no_change','resolved','duplicate'))
receipt_token_hash text NOT NULL UNIQUE
created_at timestamptz NOT NULL DEFAULT now()
UNIQUE (id, article_id)
FOREIGN KEY (version_id, article_id) REFERENCES article_versions(id, article_id)
FOREIGN KEY (version_id, claim_id) REFERENCES article_claims(version_id, claim_id)
```

Optional email is private PII, encrypted under deployment policy and excluded from logs/public corrections. Rate-limit before creating rows.

## corrections | Governance

Public change notice connected to private investigation.

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
article_id uuid NOT NULL REFERENCES articles(id)
report_id uuid
FOREIGN KEY (report_id, article_id) REFERENCES reader_reports(id, article_id)
from_version_id uuid NOT NULL
to_version_id uuid
public_note text NOT NULL
severity text NOT NULL CHECK (severity IN ('minor','material','critical'))
created_at timestamptz NOT NULL DEFAULT now()
FOREIGN KEY (from_version_id, article_id) REFERENCES article_versions(id, article_id)
FOREIGN KEY (to_version_id, article_id) REFERENCES article_versions(id, article_id)
```

The two versions must belong to the same article. A withdrawal may have no replacement version.

## takedowns | Governance

Source- or article-scoped suppression and remediation.

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
article_id uuid REFERENCES articles(id)
source_version_id uuid REFERENCES source_item_versions(id)
rights_grant_id uuid REFERENCES rights_grants(id)
reason_code text NOT NULL
private_reason text NOT NULL
public_reason text
status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','suppressed','remediating','completed'))
requested_by uuid REFERENCES users(id) ON DELETE SET NULL
created_at timestamptz NOT NULL DEFAULT now()
completed_at timestamptz
CHECK (num_nonnulls(article_id, source_version_id, rights_grant_id) >= 1)
```

Impact traversal finds all variants, blocks, prompts, excerpts, assets, search/cache entries and future messages. More than one target is permitted when explicit.

## ingestion_runs | Operations

Scheduled endpoint poll/fetch attempts and counters.

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
endpoint_id uuid NOT NULL REFERENCES source_endpoints(id)
status text NOT NULL CHECK (status IN ('queued','running','succeeded','partial','failed'))
started_at timestamptz
finished_at timestamptz
item_count integer NOT NULL DEFAULT 0 CHECK (item_count >= 0)
error_code text
correlation_id uuid NOT NULL DEFAULT gen_random_uuid()
```

Source text is not stored in error messages. Provider-specific quota consumption is validated metadata.

## processing_jobs | Operations

Authoritative job state, attempts and lease.

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
job_type text NOT NULL
idempotency_key text NOT NULL UNIQUE
payload jsonb NOT NULL DEFAULT '{}'::jsonb
status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','succeeded','failed','quarantined','canceled'))
attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0)
max_attempts integer NOT NULL DEFAULT 5 CHECK (max_attempts > 0)
next_attempt_at timestamptz NOT NULL DEFAULT now()
lease_until timestamptz
last_error_code text
correlation_id uuid NOT NULL DEFAULT gen_random_uuid()
created_at timestamptz NOT NULL DEFAULT now()
updated_at timestamptz NOT NULL DEFAULT now()
```

Payload is schema-validated identifiers, not credentials or raw content. PostgreSQL uniqueness survives Redis loss.

## outbox_events | Operations

Transactional events for cache, search, jobs and retention effects.

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
aggregate_type text NOT NULL
aggregate_id uuid NOT NULL
event_type text NOT NULL
dedupe_key text NOT NULL UNIQUE
payload jsonb NOT NULL DEFAULT '{}'::jsonb
created_at timestamptz NOT NULL DEFAULT now()
dispatched_at timestamptz
attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0)
```

Consumers are idempotent. dispatched_at indicates dispatch, not proof that every downstream side effect succeeded.

## audit_events | Governance

Append-only minimal action record.

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
actor_token text NOT NULL
action text NOT NULL
resource_type text NOT NULL
resource_id text NOT NULL
reason text
correlation_id uuid NOT NULL
metadata jsonb NOT NULL DEFAULT '{}'::jsonb
created_at timestamptz NOT NULL DEFAULT now()
```

actor_token is a pseudonymous staff/service reference, not an email. Map to identity separately under retention policy. No source bodies, passwords or secrets.

## privacy_requests | Governance

User export/deletion workflow with secure expiry.

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id uuid REFERENCES users(id) ON DELETE SET NULL
subject_token text NOT NULL
request_type text NOT NULL CHECK (request_type IN ('export','delete'))
status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','confirmed','queued','processing','completed','failed','canceled'))
export_object_key text
export_expires_at timestamptz
created_at timestamptz NOT NULL DEFAULT now()
completed_at timestamptz
```

Keep the minimum deletion-ledger evidence after account identity is removed. A status token is not sufficient authorization for export.

## retention_tasks | Governance

Auditable source and personal-data purge work.

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
privacy_request_id uuid REFERENCES privacy_requests(id)
takedown_id uuid REFERENCES takedowns(id)
resource_type text NOT NULL
resource_id text NOT NULL
action text NOT NULL CHECK (action IN ('delete','refresh','redact','invalidate'))
due_at timestamptz NOT NULL
status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','processing','completed','failed'))
policy_version text NOT NULL
result jsonb NOT NULL DEFAULT '{}'::jsonb
completed_at timestamptz
```

Use one task per derived target with durable outcome. Refresh obligations and deletion deadlines are distinct from job retry deadlines.

## analytics_events | Operations

Minimal first-party events for defined product metrics.

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
event_name text NOT NULL
anonymous_session_hash text
article_id uuid REFERENCES articles(id)
version_id uuid
CHECK (version_id IS NULL OR article_id IS NOT NULL)
FOREIGN KEY (version_id, article_id) REFERENCES article_versions(id, article_id)
properties jsonb NOT NULL DEFAULT '{}'::jsonb
occurred_at timestamptz NOT NULL DEFAULT now()
expires_at timestamptz NOT NULL
```

Allowlist event properties; no raw query, full URL containing secrets, email or source body. Consent and bot/staff exclusion are service policies.

## feature_flags | Operations

Audited rollout, budget and kill-switch configuration.

```sql
key text PRIMARY KEY
value jsonb NOT NULL
revision integer NOT NULL DEFAULT 1 CHECK (revision > 0)
updated_by uuid REFERENCES users(id) ON DELETE SET NULL
updated_at timestamptz NOT NULL DEFAULT now()
```

Separate intake, generation, publication, video display and emergency suppression flags. Configuration schemas are versioned.

## redirects | Publishing

Stable internal route aliases for renamed article/topic slugs.

```sql
from_path text PRIMARY KEY
to_path text NOT NULL
status_code integer NOT NULL DEFAULT 301 CHECK (status_code IN (301,308))
created_at timestamptz NOT NULL DEFAULT now()
CHECK (from_path <> to_path)
```

Service restricts both paths to same-origin routes and prevents redirect cycles; preserve safe version/claim parameters.

## notification_preferences | V1

Explicit communication opt-in; not enabled at launch.

```sql
user_id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE
enabled boolean NOT NULL DEFAULT false
cadence text NOT NULL DEFAULT 'weekly' CHECK (cadence IN ('daily','weekly'))
timezone text NOT NULL DEFAULT 'UTC'
quiet_start time
quiet_end time
confirmed_at timestamptz
updated_at timestamptz NOT NULL DEFAULT now()
```

V1 migration only. Consent and timezone validation are required; later story-specific subscriptions need an extension relation.

## notification_deliveries | V1

Idempotent future digest/alert deliveries.

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE
channel text NOT NULL CHECK (channel IN ('email'))
edition_key text NOT NULL
status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','sending','sent','suppressed','failed','ambiguous'))
provider_message_id text
idempotency_key text NOT NULL UNIQUE
article_version_ids jsonb NOT NULL DEFAULT '[]'::jsonb
scheduled_at timestamptz NOT NULL
sent_at timestamptz
UNIQUE (user_id, channel, edition_key)
```

Provider idempotency/reconciliation is necessary after ambiguous timeout. JSON version IDs require service validation and pre-send publication checks.

## source_suggestions | V1

Quarantined reader suggestions, never direct fetch commands.

```sql
id uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE
url text NOT NULL
reason text NOT NULL
article_id uuid REFERENCES articles(id)
status text NOT NULL DEFAULT 'quarantined' CHECK (status IN ('quarantined','reviewing','accepted','rejected','duplicate'))
created_at timestamptz NOT NULL DEFAULT now()
```

V1 moderation is required before any network fetch. Unknown URL data is escaped in staff tools.
