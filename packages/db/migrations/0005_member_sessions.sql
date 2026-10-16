-- Additive WP04 fixture identity persistence. Existing proof is never manufactured.
ALTER TABLE users ADD COLUMN session_version integer NOT NULL DEFAULT 0 CHECK (session_version >= 0);
ALTER TABLE sessions ADD COLUMN account_version integer NOT NULL DEFAULT 0 CHECK (account_version >= 0);
ALTER TABLE sessions ADD COLUMN authentication_method text NOT NULL DEFAULT 'legacy-invalid';
ALTER TABLE sessions ADD COLUMN assurance text NOT NULL DEFAULT 'unverified';
ALTER TABLE sessions ADD COLUMN idle_timeout_ms integer NOT NULL DEFAULT 1800000 CHECK (idle_timeout_ms > 0 AND idle_timeout_ms <= 43200000);
ALTER TABLE sessions ADD COLUMN csrf_token text;
-- Old records have no durable assurance/CSRF proof: preserve them, but revoke them.
UPDATE sessions SET revoked_at=coalesce(revoked_at,now());
ALTER TABLE sessions ADD CONSTRAINT session_fixture_proof CHECK (
  revoked_at IS NOT NULL OR (authentication_method='fixture' AND assurance='fixture-only'
  AND mfa_verified_at IS NULL AND token_hash ~ '^[a-f0-9]{64}$'
  AND csrf_token IS NOT NULL AND csrf_token ~ '^[a-f0-9]{64}$'
  AND last_seen_at >= created_at AND last_seen_at < expires_at));

-- Bootstrap cannot read private tables directly. A selector-scoped lookup is needed
-- before the application has verified identity; returning an entire table is not.
-- Lock order everywhere: account first, then session. All names are qualified.
CREATE FUNCTION public.lookup_fixture_session(selector uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE owner_id uuid; account_row public.users%ROWTYPE; session_row public.sessions%ROWTYPE;
BEGIN
  SELECT s.user_id INTO owner_id FROM public.sessions s WHERE s.id=selector;
  IF owner_id IS NULL THEN RETURN NULL; END IF;
  SELECT * INTO account_row FROM public.users u WHERE u.id=owner_id FOR UPDATE;
  SELECT * INTO session_row FROM public.sessions s WHERE s.id=selector AND s.user_id=owner_id FOR UPDATE;
  IF session_row.id IS NULL THEN RETURN NULL; END IF;
  RETURN jsonb_build_object('session',jsonb_build_object(
    'id',session_row.id,'user_id',session_row.user_id,'token_hash',session_row.token_hash,
    'created_at',session_row.created_at,'expires_at',session_row.expires_at,'last_seen_at',session_row.last_seen_at,
    'revoked_at',session_row.revoked_at,'mfa_verified_at',session_row.mfa_verified_at,
    'account_version',session_row.account_version,'authentication_method',session_row.authentication_method,
    'assurance',session_row.assurance,'idle_timeout_ms',session_row.idle_timeout_ms,'csrf_token',session_row.csrf_token),
    'account',jsonb_build_object(
    'id',account_row.id,'displayName',account_row.display_name,'status',account_row.status,
    'sessionVersion',account_row.session_version,'roles',(SELECT coalesce(jsonb_agg(r.role_code),'[]'::jsonb) FROM public.user_roles r WHERE r.user_id=owner_id)));
END $$;
CREATE FUNCTION public.touch_fixture_session(selector uuid, observed_at timestamptz) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
  PERFORM public.lookup_fixture_session(selector);
  UPDATE public.sessions s SET last_seen_at=greatest(s.last_seen_at,observed_at)
  FROM public.users u WHERE s.id=selector AND u.id=s.user_id AND u.status='active'
  AND u.session_version=s.account_version AND s.revoked_at IS NULL
  AND s.authentication_method='fixture' AND s.assurance='fixture-only' AND s.mfa_verified_at IS NULL
  AND observed_at >= s.created_at AND observed_at < s.expires_at
  AND observed_at < s.last_seen_at + s.idle_timeout_ms * interval '1 millisecond';
  RETURN FOUND;
END $$;
CREATE FUNCTION public.revoke_fixture_session(selector uuid, observed_at timestamptz) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
  PERFORM public.lookup_fixture_session(selector);
  UPDATE public.sessions SET revoked_at=coalesce(revoked_at,observed_at) WHERE id=selector;
END $$;
REVOKE ALL ON FUNCTION public.lookup_fixture_session(uuid),public.touch_fixture_session(uuid,timestamptz),public.revoke_fixture_session(uuid,timestamptz) FROM PUBLIC;
GRANT USAGE ON SCHEMA public TO agg_session_runtime,agg_fixture_maintenance;
GRANT EXECUTE ON FUNCTION public.lookup_fixture_session(uuid),public.touch_fixture_session(uuid,timestamptz),public.revoke_fixture_session(uuid,timestamptz) TO agg_session_runtime;
-- Trusted non-HTTP fixture maintenance only; never inherited by API runtime.
GRANT SELECT(id,display_name,status,session_version),UPDATE(status,session_version) ON users TO agg_fixture_maintenance;
GRANT SELECT(id,user_id,revoked_at),INSERT,UPDATE(revoked_at) ON sessions TO agg_fixture_maintenance;
GRANT SELECT,INSERT,DELETE ON user_roles TO agg_fixture_maintenance;
GRANT INSERT ON audit_events TO agg_fixture_maintenance;

-- Read-only target attestation for restricted runtime startup/connection checks.
CREATE FUNCTION public.fixture_target_identity() RETURNS jsonb
LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog AS $$
SELECT jsonb_build_object('directory',current_setting('data_directory'),'system',system_identifier::text,
 'database',current_database(),'host',inet_server_addr(),'port',inet_server_port(),'version',current_setting('server_version_num'))
FROM pg_catalog.pg_control_system()
$$;
-- pg_control_system requires the bootstrap to grant this narrowly to the function owner.
REVOKE ALL ON FUNCTION public.fixture_target_identity() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.fixture_target_identity() TO agg_session_runtime,agg_fixture_maintenance;
