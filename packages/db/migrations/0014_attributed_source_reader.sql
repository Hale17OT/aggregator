-- Publisher-original reader lane. This does not approve synthesized articles.
CREATE FUNCTION public.reader_source_items() RETURNS jsonb LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog AS $$
 WITH latest AS (SELECT DISTINCT ON(item_id) * FROM public.source_observations ORDER BY item_id,observation_order DESC)
 SELECT coalesce(jsonb_agg(jsonb_build_object(
  'id',i.id,'versionId',v.id,'version',v.revision,'url',i.canonical_url,'headline',v.title,'author',v.author,
  'publishedAt',v.source_published_at,'modifiedAt',v.source_modified_at,'checkedAt',o.observed_at,
  'publisher',s.name,'sourceType',s.source_type,'body',p.normalized_text,'license',g.scope->>'license',
  'licenseUrl',g.agreement_reference,'topic',v.metadata->>'topic','sourceSlug',s.slug
 ) ORDER BY v.source_published_at DESC,i.id),'[]'::jsonb)
 FROM public.source_items i JOIN latest o ON o.item_id=i.id JOIN public.source_item_versions v ON v.id=o.source_version_id
 JOIN public.source_payloads p ON p.source_version_id=v.id JOIN public.sources s ON s.id=i.source_id
 JOIN public.rights_grants g ON g.id=v.rights_grant_id AND g.source_id=i.source_id
 JOIN public.source_endpoints e ON e.id=o.endpoint_id AND e.source_id=i.source_id
 WHERE s.status='active' AND e.status='active' AND o.availability IN ('available','unchanged')
 AND v.eligibility='eligible' AND v.retention_until>clock_timestamp()
 AND v.metadata->>'readerLane'='publisher-original' AND v.metadata->>'itemRightsReviewed'='true'
 AND g.status='active' AND g.revoked_at IS NULL AND g.starts_at<=clock_timestamp() AND g.ends_at>clock_timestamp()
 AND g.allow_fetch AND g.allow_store AND g.allow_public_excerpt
 AND g.scope->>'provenance'='reviewed-public-license' AND g.scope->>'readerText'='true'
 AND length(p.normalized_text)<=g.public_excerpt_limit
 AND NOT EXISTS(SELECT FROM public.rights_grants newer WHERE newer.grant_key=g.grant_key AND newer.revision>g.revision)
$$;
REVOKE ALL ON FUNCTION public.reader_source_items() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reader_source_items() TO agg_reader,agg_member,agg_session_runtime;
CREATE TABLE source_bookmarks(
 user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
 item_id uuid NOT NULL REFERENCES source_items(id),
 saved_version_id uuid NOT NULL,
 created_at timestamptz NOT NULL DEFAULT now(),
 PRIMARY KEY(user_id,item_id),
 FOREIGN KEY(saved_version_id,item_id) REFERENCES source_item_versions(id,item_id)
);
ALTER TABLE source_bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY source_bookmark_owner ON source_bookmarks TO agg_member USING(user_id=nullif(current_setting('aggregator.user_id',true),'')::uuid) WITH CHECK(user_id=nullif(current_setting('aggregator.user_id',true),'')::uuid);
GRANT SELECT,INSERT,DELETE ON source_bookmarks TO agg_member;
REVOKE ALL ON source_bookmarks FROM PUBLIC;
