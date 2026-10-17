-- Cluster provisioning, not a schema-history rewrite. Run only after target attestation.
DO $$ BEGIN
 IF NOT EXISTS(SELECT FROM pg_roles WHERE rolname='agg_live_source') THEN
  CREATE ROLE agg_live_source NOLOGIN NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
 END IF;
 IF NOT EXISTS(SELECT FROM pg_roles WHERE rolname='agg_live_source_login') THEN
  CREATE ROLE agg_live_source_login LOGIN INHERIT NOSUPERUSER NOCREATEDB NOCREATEROLE NOBYPASSRLS;
 END IF;
 IF EXISTS(SELECT FROM pg_roles WHERE rolname IN ('agg_live_source','agg_live_source_login') AND (rolsuper OR rolcreatedb OR rolcreaterole OR rolbypassrls)) THEN RAISE EXCEPTION 'Unsafe source role'; END IF;
 IF EXISTS(SELECT FROM pg_auth_members m JOIN pg_roles r ON r.oid=m.member JOIN pg_roles p ON p.oid=m.roleid WHERE r.rolname='agg_live_source_login' AND p.rolname<>'agg_live_source') THEN RAISE EXCEPTION 'Unexpected source membership'; END IF;
 IF EXISTS(SELECT FROM pg_auth_members m JOIN pg_roles r ON r.oid=m.member WHERE r.rolname='agg_live_source') THEN RAISE EXCEPTION 'Unexpected source role inheritance'; END IF;
END $$;
GRANT agg_live_source TO agg_live_source_login;
GRANT CONNECT ON DATABASE aggregator_identity TO agg_live_source_login;
GRANT USAGE ON SCHEMA public TO agg_live_source;
GRANT EXECUTE ON FUNCTION public.pipeline_target(),public.pipeline_governance_lock() TO agg_live_source;
GRANT SELECT ON public.sources,public.rights_grants,public.source_endpoints TO agg_live_source;
GRANT SELECT,INSERT ON public.source_items,public.source_item_versions,public.source_payloads,public.source_observations,public.audit_events TO agg_live_source;
GRANT USAGE ON SEQUENCE public.source_observations_observation_order_seq TO agg_live_source;
-- No member/account access, grant editing, synthesis, article creation or publication.
