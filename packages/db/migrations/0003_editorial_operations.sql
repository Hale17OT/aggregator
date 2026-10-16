-- WP04: ordered extraction of the preserved launch reference. Transaction owned by runner.
-- Stable public article identity and current safe version pointer.
CREATE TABLE articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_id uuid NOT NULL REFERENCES story_clusters(id),
  slug text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','withdrawn','archived')),
  current_version_id uuid,
  lock_version integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  first_published_at timestamptz,
  UNIQUE (id, cluster_id)
);

-- One content-and-evidence approval unit.
CREATE TABLE article_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL,
  cluster_id uuid NOT NULL,
  version_number integer NOT NULL CHECK (version_number > 0),
  state text NOT NULL DEFAULT 'draft' CHECK (state IN ('queued','generating','draft','in_review','approved','published','rejected','withdrawn','redacted')),
  headline text NOT NULL,
  deck text NOT NULL DEFAULT '',
  content_hash text NOT NULL,
  evidence_hash text NOT NULL,
  approval_hash text NOT NULL,
  risk text NOT NULL DEFAULT 'normal' CHECK (risk IN ('normal','high')),
  evidence_cutoff_at timestamptz NOT NULL,
  created_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  published_at timestamptz,
  change_summary text,
  FOREIGN KEY (article_id, cluster_id) REFERENCES articles(id, cluster_id),
  UNIQUE (article_id, version_number),
  UNIQUE (id, article_id),
  UNIQUE (id, cluster_id)
);

-- Pre-reviewed reading length/language within a version.
CREATE TABLE article_variants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid NOT NULL REFERENCES article_versions(id),
  language text NOT NULL DEFAULT 'en',
  variant text NOT NULL CHECK (variant IN ('standard','brief')),
  reading_seconds integer CHECK (reading_seconds >= 0),
  search_text tsvector,
  UNIQUE (version_id, language, variant),
  UNIQUE (id, version_id)
);

-- Ordered structured article content including factual headlines/decks.
CREATE TABLE article_blocks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id uuid NOT NULL,
  version_id uuid NOT NULL,
  position integer NOT NULL CHECK (position >= 0),
  block_type text NOT NULL CHECK (block_type IN ('headline','deck','heading','paragraph','key_point','quote','uncertainty','disclosure')),
  text_content text NOT NULL,
  is_factual boolean NOT NULL DEFAULT true,
  FOREIGN KEY (variant_id, version_id) REFERENCES article_variants(id, version_id),
  UNIQUE (variant_id, position),
  UNIQUE (id, version_id)
);

-- Claims selected into one article version.
CREATE TABLE article_claims (
  version_id uuid NOT NULL,
  claim_id uuid NOT NULL,
  cluster_id uuid NOT NULL,
  material boolean NOT NULL DEFAULT true,
  FOREIGN KEY (version_id, cluster_id) REFERENCES article_versions(id, cluster_id),
  FOREIGN KEY (claim_id, cluster_id) REFERENCES claims(id, cluster_id),
  PRIMARY KEY (version_id, claim_id)
);

-- Every factual displayed block links to its reviewed claims.
CREATE TABLE block_claims (
  block_id uuid NOT NULL,
  version_id uuid NOT NULL,
  claim_id uuid NOT NULL,
  FOREIGN KEY (block_id, version_id) REFERENCES article_blocks(id, version_id),
  FOREIGN KEY (version_id, claim_id) REFERENCES article_claims(version_id, claim_id),
  PRIMARY KEY (block_id, claim_id)
);

-- Stable numbered bibliography for an article version.
CREATE TABLE article_sources (
  version_id uuid NOT NULL REFERENCES article_versions(id),
  source_version_id uuid NOT NULL REFERENCES source_item_versions(id),
  ordinal integer NOT NULL CHECK (ordinal > 0),
  usage text NOT NULL CHECK (usage IN ('evidence','context','related')),
  public_locator jsonb NOT NULL DEFAULT '{}'::jsonb,
  PRIMARY KEY (version_id, source_version_id),
  UNIQUE (version_id, ordinal)
);

-- Public claim reference to an included source and verified span.
CREATE TABLE claim_citations (
  version_id uuid NOT NULL,
  claim_id uuid NOT NULL,
  source_version_id uuid NOT NULL,
  evidence_span_id uuid NOT NULL,
  FOREIGN KEY (version_id, claim_id) REFERENCES article_claims(version_id, claim_id),
  FOREIGN KEY (version_id, source_version_id) REFERENCES article_sources(version_id, source_version_id),
  FOREIGN KEY (claim_id, evidence_span_id, source_version_id) REFERENCES claim_evidence(claim_id, evidence_span_id, source_version_id),
  PRIMARY KEY (version_id, claim_id, evidence_span_id)
);

-- Multiple desks with at most one primary designation.
CREATE TABLE article_topics (
  article_id uuid NOT NULL REFERENCES articles(id),
  topic_id uuid NOT NULL REFERENCES topics(id),
  is_primary boolean NOT NULL DEFAULT false,
  PRIMARY KEY (article_id, topic_id)
);

-- Context links and ongoing-story relationships.
CREATE TABLE article_relations (
  article_id uuid NOT NULL REFERENCES articles(id),
  related_article_id uuid NOT NULL REFERENCES articles(id),
  relation text NOT NULL CHECK (relation IN ('background','follow_up','related')),
  position integer NOT NULL DEFAULT 0,
  PRIMARY KEY (article_id, related_article_id),
  CHECK (article_id <> related_article_id)
);

-- Private saved article identity and first-viewed version.
CREATE TABLE bookmarks (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  article_id uuid NOT NULL REFERENCES articles(id),
  saved_version_id uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (saved_version_id, article_id) REFERENCES article_versions(id, article_id),
  PRIMARY KEY (user_id, article_id)
);

-- Reproducible generation attempts and measured usage.
CREATE TABLE generation_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_id uuid NOT NULL REFERENCES story_clusters(id),
  version_id uuid,
  FOREIGN KEY (version_id, cluster_id) REFERENCES article_versions(id, cluster_id),
  idempotency_key text NOT NULL UNIQUE,
  provider text NOT NULL,
  model text NOT NULL,
  prompt_version text NOT NULL,
  evidence_hash text NOT NULL,
  input_manifest jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL CHECK (status IN ('queued','running','succeeded','failed','canceled')),
  input_tokens bigint CHECK (input_tokens >= 0),
  output_tokens bigint CHECK (output_tokens >= 0),
  cost_amount numeric(14,6) CHECK (cost_amount >= 0),
  cost_currency char(3),
  started_at timestamptz,
  finished_at timestamptz,
  error_code text
);

-- Digest-bound individual validation outcomes.
CREATE TABLE validation_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid NOT NULL REFERENCES article_versions(id),
  approval_hash text NOT NULL,
  check_code text NOT NULL,
  check_version text NOT NULL,
  result text NOT NULL CHECK (result IN ('pass','warn','fail')),
  severity text NOT NULL CHECK (severity IN ('info','major','critical')),
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Work ownership without conferring approval.
CREATE TABLE review_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid NOT NULL REFERENCES article_versions(id),
  reviewer_id uuid NOT NULL REFERENCES users(id),
  assigned_by uuid REFERENCES users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','completed','canceled')),
  due_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Human decisions bound to immutable approval digest.
CREATE TABLE editorial_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id uuid NOT NULL REFERENCES article_versions(id),
  reviewer_id uuid NOT NULL REFERENCES users(id),
  approval_hash text NOT NULL,
  decision text NOT NULL CHECK (decision IN ('approve','changes_requested','reject','revoke')),
  notes text,
  reviewed_at timestamptz NOT NULL DEFAULT now()
);

-- Durable append-only publication, correction and withdrawal history.
CREATE TABLE publication_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES articles(id),
  version_id uuid,
  actor_id uuid REFERENCES users(id) ON DELETE SET NULL,
  event_type text NOT NULL CHECK (event_type IN ('publish','update','correct','withdraw','restore','redact')),
  reason text NOT NULL,
  idempotency_key text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (version_id, article_id) REFERENCES article_versions(id, article_id)
);

-- Version-specific factual/attribution/rights reports.
CREATE TABLE reader_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES articles(id),
  version_id uuid NOT NULL,
  claim_id uuid,
  reporter_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  contact_email text,
  category text NOT NULL,
  message text NOT NULL,
  evidence_url text,
  severity text NOT NULL DEFAULT 'normal' CHECK (severity IN ('normal','urgent')),
  status text NOT NULL DEFAULT 'received' CHECK (status IN ('received','triaged','investigating','action_required','no_change','resolved','duplicate')),
  receipt_token_hash text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (id, article_id),
  FOREIGN KEY (version_id, article_id) REFERENCES article_versions(id, article_id),
  FOREIGN KEY (version_id, claim_id) REFERENCES article_claims(version_id, claim_id)
);

-- Public change notice connected to private investigation.
CREATE TABLE corrections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid NOT NULL REFERENCES articles(id),
  report_id uuid,
  FOREIGN KEY (report_id, article_id) REFERENCES reader_reports(id, article_id),
  from_version_id uuid NOT NULL,
  to_version_id uuid,
  public_note text NOT NULL,
  severity text NOT NULL CHECK (severity IN ('minor','material','critical')),
  created_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (from_version_id, article_id) REFERENCES article_versions(id, article_id),
  FOREIGN KEY (to_version_id, article_id) REFERENCES article_versions(id, article_id)
);

-- Source- or article-scoped suppression and remediation.
CREATE TABLE takedowns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id uuid REFERENCES articles(id),
  source_version_id uuid REFERENCES source_item_versions(id),
  rights_grant_id uuid REFERENCES rights_grants(id),
  reason_code text NOT NULL,
  private_reason text NOT NULL,
  public_reason text,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','suppressed','remediating','completed')),
  requested_by uuid REFERENCES users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  CHECK (num_nonnulls(article_id, source_version_id, rights_grant_id) >= 1)
);

-- Scheduled endpoint poll/fetch attempts and counters.
CREATE TABLE ingestion_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_id uuid NOT NULL REFERENCES source_endpoints(id),
  status text NOT NULL CHECK (status IN ('queued','running','succeeded','partial','failed')),
  started_at timestamptz,
  finished_at timestamptz,
  item_count integer NOT NULL DEFAULT 0 CHECK (item_count >= 0),
  error_code text,
  correlation_id uuid NOT NULL DEFAULT gen_random_uuid()
);

-- Authoritative job state, attempts and lease.
CREATE TABLE processing_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  job_type text NOT NULL,
  idempotency_key text NOT NULL UNIQUE,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','running','succeeded','failed','quarantined','canceled')),
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  max_attempts integer NOT NULL DEFAULT 5 CHECK (max_attempts > 0),
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  lease_until timestamptz,
  last_error_code text,
  correlation_id uuid NOT NULL DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Transactional events for cache, search, jobs and retention effects.
CREATE TABLE outbox_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  aggregate_type text NOT NULL,
  aggregate_id uuid NOT NULL,
  event_type text NOT NULL,
  dedupe_key text NOT NULL UNIQUE,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  dispatched_at timestamptz,
  attempts integer NOT NULL DEFAULT 0 CHECK (attempts >= 0)
);

-- Append-only minimal action record.
CREATE TABLE audit_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_token text NOT NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text NOT NULL,
  reason text,
  correlation_id uuid NOT NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- User export/deletion workflow with secure expiry.
CREATE TABLE privacy_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  subject_token text NOT NULL,
  request_type text NOT NULL CHECK (request_type IN ('export','delete')),
  status text NOT NULL DEFAULT 'requested' CHECK (status IN ('requested','confirmed','queued','processing','completed','failed','canceled')),
  export_object_key text,
  export_expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

-- Auditable source and personal-data purge work.
CREATE TABLE retention_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  privacy_request_id uuid REFERENCES privacy_requests(id),
  takedown_id uuid REFERENCES takedowns(id),
  resource_type text NOT NULL,
  resource_id text NOT NULL,
  action text NOT NULL CHECK (action IN ('delete','refresh','redact','invalidate')),
  due_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN ('queued','processing','completed','failed')),
  policy_version text NOT NULL,
  result jsonb NOT NULL DEFAULT '{}'::jsonb,
  completed_at timestamptz
);

-- Minimal first-party events for defined product metrics.
CREATE TABLE analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name text NOT NULL,
  anonymous_session_hash text,
  article_id uuid REFERENCES articles(id),
  version_id uuid,
  CHECK (version_id IS NULL OR article_id IS NOT NULL),
  FOREIGN KEY (version_id, article_id) REFERENCES article_versions(id, article_id),
  properties jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);

-- Audited rollout, budget and kill-switch configuration.
CREATE TABLE feature_flags (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
  updated_by uuid REFERENCES users(id) ON DELETE SET NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Stable internal route aliases for renamed article/topic slugs.
CREATE TABLE redirects (
  from_path text PRIMARY KEY,
  to_path text NOT NULL,
  status_code integer NOT NULL DEFAULT 301 CHECK (status_code IN (301,308)),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (from_path <> to_path)
);

ALTER TABLE articles ADD CONSTRAINT fk_current_version_same_article
  FOREIGN KEY (current_version_id, id) REFERENCES article_versions(id, article_id)
  DEFERRABLE INITIALLY DEFERRED;

-- A publication transaction must require exactly one primary topic,
-- complete variant/block/claim coverage, current scoped rights, three distinct
-- eligible items, two verified reporting origins, and digest-bound human approvals.
-- These cross-row/domain rules are intentionally NOT claimed as enforced by DDL.

-- Append-only audit records. A privileged retention migration must explicitly
-- disable/replace this trigger under an audited legal retention procedure.
CREATE FUNCTION reject_audit_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'audit_events is append-only';
END;
$$;
CREATE TRIGGER audit_events_append_only
BEFORE UPDATE OR DELETE ON audit_events
FOR EACH ROW EXECUTE FUNCTION reject_audit_mutation();

CREATE INDEX ix_sessions_user_active ON sessions(user_id, expires_at) WHERE revoked_at IS NULL;
CREATE INDEX ix_sources_review_due ON sources(review_due_at) WHERE status = 'active';
CREATE INDEX ix_grants_expiry ON rights_grants(ends_at) WHERE status = 'active';
CREATE INDEX ix_endpoints_poll ON source_endpoints(next_poll_at) WHERE status = 'active';
CREATE INDEX ix_items_source ON source_items(source_id, first_seen_at DESC);
CREATE INDEX ix_item_versions_item ON source_item_versions(item_id, fetched_at DESC);
CREATE INDEX ix_observations_item ON source_observations(item_id, observed_at DESC);
CREATE INDEX ix_item_versions_grant ON source_item_versions(rights_grant_id);
CREATE INDEX ix_item_versions_retention ON source_item_versions(retention_until) WHERE retention_until IS NOT NULL;
CREATE INDEX ix_item_origins_reverse ON item_origins(origin_id, source_version_id);
CREATE INDEX ix_cluster_items_reverse ON cluster_items(source_version_id, cluster_id);
CREATE INDEX ix_spans_version ON evidence_spans(source_version_id);
CREATE INDEX ix_claim_evidence_reverse ON claim_evidence(source_version_id, evidence_span_id);
CREATE INDEX ix_claims_cluster ON claims(cluster_id);
CREATE INDEX ix_articles_public ON articles(first_published_at DESC, id) WHERE status = 'published';
CREATE INDEX ix_versions_article ON article_versions(article_id, version_number DESC);
CREATE INDEX ix_variants_search ON article_variants USING GIN(search_text);
CREATE INDEX ix_article_sources_reverse ON article_sources(source_version_id, version_id);
CREATE INDEX ix_article_claims_reverse ON article_claims(claim_id, version_id);
CREATE UNIQUE INDEX uq_one_primary_topic ON article_topics(article_id) WHERE is_primary;
CREATE INDEX ix_article_topics_reverse ON article_topics(topic_id, article_id);
CREATE INDEX ix_bookmarks_recent ON bookmarks(user_id, created_at DESC);
CREATE INDEX ix_validations_digest ON validation_results(version_id, approval_hash, check_code, created_at DESC);
CREATE INDEX ix_reviews_latest ON editorial_reviews(version_id, approval_hash, reviewer_id, reviewed_at DESC, id DESC);
CREATE INDEX ix_review_queue ON review_assignments(reviewer_id, due_at) WHERE status = 'open';
CREATE INDEX ix_reports_queue ON reader_reports(status, severity, created_at);
CREATE INDEX ix_publication_history ON publication_events(article_id, created_at DESC);
CREATE INDEX ix_jobs_due ON processing_jobs(next_attempt_at) WHERE status = 'queued';
CREATE INDEX ix_outbox_pending ON outbox_events(created_at) WHERE dispatched_at IS NULL;
CREATE INDEX ix_retention_due ON retention_tasks(due_at) WHERE status IN ('queued','failed');
CREATE INDEX ix_audit_resource ON audit_events(resource_type, resource_id, created_at DESC);
CREATE INDEX ix_analytics_expiry ON analytics_events(expires_at);
