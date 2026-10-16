-- WP04: ordered extraction of the preserved launch reference. Transaction owned by runner.
-- Editorial desks and topic metadata.
CREATE TABLE topics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  scope text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived')),
  sort_order integer NOT NULL DEFAULT 0
);

-- Only explicitly selected topic interests.
CREATE TABLE topic_follows (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  topic_id uuid NOT NULL REFERENCES topics(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, topic_id)
);

-- Editorial source identity independent of individual items.
CREATE TABLE sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  source_type text NOT NULL CHECK (source_type IN ('publisher','channel','institution','specialist')),
  home_url text NOT NULL,
  identity_key text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed','discovery_only','active','suspended','archived')),
  public_rationale text,
  review_due_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  lock_version integer NOT NULL DEFAULT 0
);

-- Time-bounded disclosed ownership relationships.
CREATE TABLE source_ownerships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES sources(id),
  owner_name text NOT NULL,
  owner_key text NOT NULL,
  valid_from date,
  valid_to date,
  verification_url text,
  verified_at timestamptz,
  CHECK (valid_to IS NULL OR valid_from IS NULL OR valid_to >= valid_from)
);

-- Append-only editorial source suitability decisions.
CREATE TABLE source_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES sources(id),
  reviewer_id uuid REFERENCES users(id) ON DELETE SET NULL,
  decision text NOT NULL CHECK (decision IN ('approve','restrict','reject','suspend')),
  topic_scope jsonb NOT NULL DEFAULT '[]'::jsonb,
  rationale text NOT NULL,
  reviewed_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz
);

-- Scoped, versioned permission decisions for processing and display.
CREATE TABLE rights_grants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES sources(id),
  grant_key text NOT NULL,
  revision integer NOT NULL CHECK (revision > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','revoked','expired')),
  allow_discovery boolean NOT NULL DEFAULT false,
  allow_fetch boolean NOT NULL DEFAULT false,
  allow_store boolean NOT NULL DEFAULT false,
  allow_model boolean NOT NULL DEFAULT false,
  allow_synthesis boolean NOT NULL DEFAULT false,
  allow_public_excerpt boolean NOT NULL DEFAULT false,
  allow_media boolean NOT NULL DEFAULT false,
  scope jsonb NOT NULL DEFAULT '{}'::jsonb,
  agreement_reference text NOT NULL,
  approved_by uuid REFERENCES users(id) ON DELETE SET NULL,
  starts_at timestamptz NOT NULL,
  ends_at timestamptz,
  raw_retention_days integer CHECK (raw_retention_days >= 0),
  public_excerpt_limit integer CHECK (public_excerpt_limit >= 0),
  revoked_at timestamptz,
  UNIQUE (grant_key, revision),
  UNIQUE (id, source_id),
  CHECK (ends_at IS NULL OR ends_at > starts_at)
);

-- Provider-specific discovery and fetch configuration.
CREATE TABLE source_endpoints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES sources(id),
  adapter text NOT NULL CHECK (adapter IN ('rss','atom','licensed_api','approved_web','publisher_upload','youtube_display')),
  endpoint_url text NOT NULL,
  secret_reference text,
  allowed_hosts jsonb NOT NULL DEFAULT '[]'::jsonb,
  configuration jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'paused' CHECK (status IN ('active','paused','failed')),
  poll_interval_seconds integer NOT NULL DEFAULT 900 CHECK (poll_interval_seconds >= 60),
  next_poll_at timestamptz,
  UNIQUE (source_id, adapter, endpoint_url)
);

-- Stable identity of an original article, document or video.
CREATE TABLE source_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id uuid NOT NULL REFERENCES sources(id),
  provider_item_key text NOT NULL,
  kind text NOT NULL CHECK (kind IN ('article','video','document','transcript','audio')),
  canonical_url text NOT NULL,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (source_id, provider_item_key),
  UNIQUE (id, source_id)
);

-- Immutable retrieved/extracted item revision and permission lineage.
CREATE TABLE source_item_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL,
  source_id uuid NOT NULL,
  rights_grant_id uuid NOT NULL,
  revision integer NOT NULL CHECK (revision > 0),
  title text NOT NULL,
  author text,
  source_published_at timestamptz,
  source_modified_at timestamptz,
  fetched_at timestamptz NOT NULL DEFAULT now(),
  fetched_url text NOT NULL,
  language text NOT NULL,
  content_hash text NOT NULL,
  normalized_hash text,
  body_object_key text,
  extraction_version text,
  transcript_provenance text,
  associated_video_url text,
  duration_ms bigint CHECK (duration_ms >= 0),
  eligibility text NOT NULL DEFAULT 'needs_review' CHECK (eligibility IN ('metadata_only','needs_review','eligible','denied','withdrawn')),
  retention_until timestamptz,
  metadata_refresh_due_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  FOREIGN KEY (item_id, source_id) REFERENCES source_items(id, source_id),
  FOREIGN KEY (rights_grant_id, source_id) REFERENCES rights_grants(id, source_id),
  UNIQUE (item_id, revision),
  UNIQUE (item_id, content_hash),
  UNIQUE (id, item_id)
);

-- Each retrieval/availability check, including repeated unchanged content.
CREATE TABLE source_observations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES source_items(id),
  source_version_id uuid,
  endpoint_id uuid REFERENCES source_endpoints(id),
  observed_at timestamptz NOT NULL DEFAULT now(),
  http_status integer CHECK (http_status BETWEEN 100 AND 599),
  requested_url text NOT NULL,
  final_url text,
  etag text,
  last_modified text,
  availability text NOT NULL CHECK (availability IN ('available','unchanged','unavailable','denied')),
  FOREIGN KEY (source_version_id, item_id) REFERENCES source_item_versions(id, item_id)
);

-- Owned or licensed illustrative/document assets.
CREATE TABLE media_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_version_id uuid REFERENCES source_item_versions(id),
  rights_grant_id uuid REFERENCES rights_grants(id),
  object_key text NOT NULL UNIQUE,
  mime_type text NOT NULL,
  byte_size bigint NOT NULL CHECK (byte_size >= 0),
  checksum text NOT NULL,
  alt_text text,
  credit text,
  is_owned boolean NOT NULL DEFAULT false,
  retention_until timestamptz,
  CHECK (is_owned OR rights_grant_id IS NOT NULL)
);

-- Independently established underlying reporting/primary origin.
CREATE TABLE reporting_origins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  origin_key text NOT NULL UNIQUE,
  label text NOT NULL,
  origin_type text NOT NULL CHECK (origin_type IN ('original_reporting','primary_document','wire_report','unknown')),
  verified_by uuid REFERENCES users(id) ON DELETE SET NULL,
  verified_at timestamptz,
  rationale text
);

-- Many-to-many provenance of an item revision.
CREATE TABLE item_origins (
  source_version_id uuid NOT NULL REFERENCES source_item_versions(id),
  origin_id uuid NOT NULL REFERENCES reporting_origins(id),
  relationship text NOT NULL CHECK (relationship IN ('original','reprint','derived','cites')),
  counts_for_independence boolean NOT NULL DEFAULT false,
  rationale text,
  PRIMARY KEY (source_version_id, origin_id)
);

-- Bounded event/question grouping with revision.
CREATE TABLE story_clusters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label text NOT NULL,
  event_start_at timestamptz,
  event_end_at timestamptz,
  status text NOT NULL DEFAULT 'candidate' CHECK (status IN ('candidate','ready','merged','archived')),
  merged_into_id uuid REFERENCES story_clusters(id),
  revision integer NOT NULL DEFAULT 1 CHECK (revision > 0),
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (event_end_at IS NULL OR event_start_at IS NULL OR event_end_at >= event_start_at),
  CHECK (merged_into_id IS NULL OR merged_into_id <> id)
);

-- Membership of exact item versions in event clusters.
CREATE TABLE cluster_items (
  cluster_id uuid NOT NULL REFERENCES story_clusters(id),
  source_version_id uuid NOT NULL REFERENCES source_item_versions(id),
  match_method text NOT NULL,
  reviewed_by uuid REFERENCES users(id) ON DELETE SET NULL,
  added_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (cluster_id, source_version_id)
);

-- Checksum-bound text/page/time locator.
CREATE TABLE evidence_spans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  source_version_id uuid NOT NULL REFERENCES source_item_versions(id),
  start_char integer CHECK (start_char >= 0),
  end_char integer,
  page_number integer CHECK (page_number > 0),
  start_ms bigint CHECK (start_ms >= 0),
  end_ms bigint,
  excerpt_text text,
  locator_hash text NOT NULL,
  quality text NOT NULL DEFAULT 'needs_review' CHECK (quality IN ('needs_review','verified','rejected')),
  retention_until timestamptz,
  UNIQUE (id, source_version_id),
  CHECK ((start_char IS NULL AND end_char IS NULL) OR (start_char IS NOT NULL AND end_char IS NOT NULL AND end_char > start_char)),
  CHECK ((start_ms IS NULL AND end_ms IS NULL) OR (start_ms IS NOT NULL AND end_ms IS NOT NULL AND end_ms > start_ms))
);

-- Atomic checkable propositions tied to an event cluster.
CREATE TABLE claims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cluster_id uuid NOT NULL REFERENCES story_clusters(id),
  proposition text NOT NULL,
  attribution text,
  reference_time timestamptz,
  structured_values jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'unresolved' CHECK (status IN ('corroborated','attributed','disputed','unresolved','rejected')),
  risk text NOT NULL DEFAULT 'normal' CHECK (risk IN ('normal','high')),
  claim_hash text NOT NULL,
  UNIQUE (id, cluster_id)
);

-- Support, contradiction or context edge to exact evidence.
CREATE TABLE claim_evidence (
  claim_id uuid NOT NULL REFERENCES claims(id),
  evidence_span_id uuid NOT NULL,
  source_version_id uuid NOT NULL,
  relation text NOT NULL CHECK (relation IN ('supports','contradicts','context')),
  verified_by uuid REFERENCES users(id) ON DELETE SET NULL,
  verified_at timestamptz,
  rationale text,
  FOREIGN KEY (evidence_span_id, source_version_id) REFERENCES evidence_spans(id, source_version_id),
  PRIMARY KEY (claim_id, evidence_span_id, source_version_id)
);
