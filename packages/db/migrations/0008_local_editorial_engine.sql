-- WP05–WP10 local subset. Existing raw hashes remain raw hashes; parser and
-- grant changes produce a new immutable representation of the same bytes.
ALTER TABLE source_item_versions DROP CONSTRAINT source_item_versions_item_id_content_hash_key;
ALTER TABLE source_item_versions ADD COLUMN representation_context_hash text NOT NULL DEFAULT '';
CREATE UNIQUE INDEX source_representation_identity ON source_item_versions
 (item_id,content_hash,coalesce(extraction_version,''),rights_grant_id,representation_context_hash);
ALTER TABLE source_observations ADD COLUMN operation_key text UNIQUE;
-- A transaction may begin before waiting for another import. Wall-clock/BEGIN
-- timestamps are not a safe current-observation pointer; use durable order.
ALTER TABLE source_observations ADD COLUMN observation_order bigint;
WITH ranked AS (SELECT id,row_number() OVER(ORDER BY observed_at,id) AS n FROM source_observations)
 UPDATE source_observations o SET observation_order=r.n FROM ranked r WHERE o.id=r.id;
ALTER TABLE source_observations ALTER COLUMN observation_order SET NOT NULL;
ALTER TABLE source_observations ALTER COLUMN observation_order ADD GENERATED ALWAYS AS IDENTITY;
SELECT setval(pg_get_serial_sequence('source_observations','observation_order'),
 coalesce((SELECT max(observation_order)+1 FROM source_observations),1),false);
CREATE UNIQUE INDEX observation_order_identity ON source_observations(observation_order);
ALTER TABLE source_observations ALTER COLUMN observed_at SET DEFAULT clock_timestamp();
CREATE UNIQUE INDEX source_item_url_identity ON source_items(source_id,canonical_url);
ALTER TABLE story_clusters ADD COLUMN candidate_key text UNIQUE;
CREATE TABLE source_payloads (
 source_version_id uuid PRIMARY KEY REFERENCES source_item_versions(id),
 raw_bytes bytea NOT NULL, normalized_text text NOT NULL,
 segments jsonb NOT NULL DEFAULT '[]',
 CHECK(octet_length(raw_bytes)<=262144), CHECK(jsonb_typeof(segments)='array')
);
CREATE TABLE evidence_packages (
 digest text PRIMARY KEY CHECK(length(digest)=64),
 cluster_id uuid NOT NULL REFERENCES story_clusters(id),
 cluster_revision integer NOT NULL CHECK(cluster_revision>0),
 manifest jsonb NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now()
);
-- Retention is the explicit exception to immutable content. This function is
-- owner-only (PUBLIC defaults revoked); runtime cannot erase evidence/history.
-- It preserves hashes/keys, not revoked text. Exported offline copies cannot be recalled.
CREATE FUNCTION pipeline_purge_expired() RETURNS integer LANGUAGE plpgsql
 SET search_path=pg_catalog,public AS $$
DECLARE v record; p record; removed integer:=0;
BEGIN
 PERFORM pg_advisory_xact_lock(18051300);
 FOR v IN SELECT sv.id FROM public.source_item_versions sv JOIN public.source_payloads b ON b.source_version_id=sv.id WHERE sv.retention_until<=now() LOOP
  FOR p IN SELECT digest FROM public.evidence_packages WHERE manifest->'sources' @> jsonb_build_array(jsonb_build_object('id',v.id)) LOOP
   UPDATE public.article_blocks SET text_content='[retention tombstone]',is_factual=false WHERE version_id IN (SELECT id FROM public.article_versions WHERE evidence_hash=p.digest);
   UPDATE public.article_versions SET state='redacted',headline='[retention tombstone]',deck='',change_summary='Payload purged by retention maintenance' WHERE evidence_hash=p.digest;
   UPDATE public.generation_runs SET input_manifest=jsonb_build_object('digest',p.digest,'tombstone','retention') WHERE evidence_hash=p.digest;
   UPDATE public.evidence_packages SET manifest=jsonb_build_object('tombstone','retention','originalDigest',p.digest) WHERE digest=p.digest;
  END LOOP;
  UPDATE public.claims SET proposition='[retention tombstone]',attribution=NULL,structured_values='{}',status='rejected' WHERE id IN (SELECT claim_id FROM public.claim_evidence WHERE source_version_id=v.id);
  UPDATE public.evidence_spans SET excerpt_text=NULL,quality='rejected' WHERE source_version_id=v.id;
  DELETE FROM public.source_payloads WHERE source_version_id=v.id;
  UPDATE public.source_item_versions SET title='[retention tombstone]',author=NULL,transcript_provenance=NULL,eligibility='withdrawn',metadata=jsonb_build_object('tombstone','retention') WHERE id=v.id;
  INSERT INTO public.audit_events(actor_token,action,resource_type,resource_id,reason,correlation_id) VALUES('machine:retention-maintenance','source.purge','source_version',v.id::text,'retention deadline',gen_random_uuid());
  removed:=removed+1;
 END LOOP;
 RETURN removed;
END $$;
CREATE FUNCTION pipeline_target() RETURNS jsonb LANGUAGE sql SECURITY DEFINER
 SET search_path=pg_catalog AS $$ SELECT jsonb_build_object('data',current_setting('data_directory'),
 'systemIdentifier',system_identifier::text,'port',inet_server_port(),'database',current_database()) FROM pg_control_system() $$;
CREATE FUNCTION pipeline_governance_lock() RETURNS void LANGUAGE plpgsql SECURITY DEFINER
 SET search_path=pg_catalog,public AS $$ BEGIN
 PERFORM pg_advisory_xact_lock(18051300);
 LOCK TABLE public.sources,public.rights_grants,public.source_endpoints,
 public.reporting_origins,public.item_origins,public.story_clusters IN SHARE MODE;
 END $$;
GRANT EXECUTE ON FUNCTION pipeline_target(),pipeline_governance_lock() TO agg_pipeline;
-- Provisioning supplies this NOLOGIN role. It cannot grant itself membership.
GRANT USAGE ON SCHEMA public TO agg_pipeline;
GRANT USAGE ON SEQUENCE source_observations_observation_order_seq TO agg_pipeline;
GRANT SELECT ON sources,source_reviews,rights_grants,source_endpoints,
 reporting_origins,item_origins TO agg_pipeline;
GRANT SELECT,INSERT ON source_items,source_item_versions,source_observations,
 source_payloads,story_clusters,cluster_items,evidence_spans,claims,claim_evidence,
 evidence_packages,articles,article_versions,article_variants,article_blocks,
 article_claims,block_claims,article_sources,claim_citations,generation_runs,
 validation_results,processing_jobs,audit_events TO agg_pipeline;
-- No update/delete privilege: raw versions/packages/outputs are append-only for
-- runtime. Retention deletion is a separate privileged maintenance operation.
CREATE FUNCTION local_draft_only() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_TABLE_NAME='articles' THEN
  IF NEW.status<>'draft' OR NEW.current_version_id IS NOT NULL OR NEW.first_published_at IS NOT NULL THEN
   RAISE EXCEPTION 'Local runner cannot publish' USING ERRCODE='42501';
  END IF;
 ELSE
  IF NEW.state<>'draft' OR NEW.created_by IS NOT NULL OR NEW.published_at IS NOT NULL THEN
   RAISE EXCEPTION 'Local runner cannot approve or impersonate' USING ERRCODE='42501';
  END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER local_article_guard BEFORE INSERT ON articles FOR EACH ROW
 WHEN (pg_has_role(current_user,'agg_pipeline','member')) EXECUTE FUNCTION local_draft_only();
CREATE TRIGGER local_version_guard BEFORE INSERT ON article_versions FOR EACH ROW
 WHEN (pg_has_role(current_user,'agg_pipeline','member')) EXECUTE FUNCTION local_draft_only();
CREATE FUNCTION machine_evidence_only() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
 IF TG_TABLE_NAME='evidence_spans' THEN
  IF NEW.quality<>'needs_review' THEN RAISE EXCEPTION 'Machine cannot verify evidence' USING ERRCODE='42501'; END IF;
 ELSIF TG_TABLE_NAME='claim_evidence' THEN
  IF NEW.verified_by IS NOT NULL OR NEW.verified_at IS NOT NULL THEN RAISE EXCEPTION 'Machine cannot impersonate review' USING ERRCODE='42501'; END IF;
 ELSIF TG_TABLE_NAME='cluster_items' THEN
  IF NEW.reviewed_by IS NOT NULL THEN RAISE EXCEPTION 'Machine cannot impersonate review' USING ERRCODE='42501'; END IF;
 END IF;
 RETURN NEW;
END $$;
CREATE TRIGGER local_span_guard BEFORE INSERT ON evidence_spans FOR EACH ROW
 WHEN (pg_has_role(current_user,'agg_pipeline','member')) EXECUTE FUNCTION machine_evidence_only();
CREATE TRIGGER local_edge_guard BEFORE INSERT ON claim_evidence FOR EACH ROW
 WHEN (pg_has_role(current_user,'agg_pipeline','member')) EXECUTE FUNCTION machine_evidence_only();
CREATE TRIGGER local_cluster_guard BEFORE INSERT ON cluster_items FOR EACH ROW
 WHEN (pg_has_role(current_user,'agg_pipeline','member')) EXECUTE FUNCTION machine_evidence_only();
