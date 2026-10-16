-- CL04: local native reader transport. Captured mailbox assurance is unchanged.
ALTER TABLE sessions ADD COLUMN transport text NOT NULL DEFAULT 'web' CHECK(transport IN ('web','native'));
ALTER TABLE sessions ADD COLUMN native_client_id text;
ALTER TABLE sessions ADD CONSTRAINT native_client_transport CHECK((transport='web' AND native_client_id IS NULL) OR (transport='native' AND native_client_id='aggregator-local'));
CREATE TABLE native_handoffs (
 id uuid PRIMARY KEY, challenge text NOT NULL CHECK(challenge ~ '^[A-Za-z0-9_-]{43}$'),
 state text NOT NULL CHECK(state ~ '^[A-Za-z0-9_-]{43}$'), browser_hash text,
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(), expires_at timestamptz NOT NULL DEFAULT clock_timestamp()+interval '15 minutes',
 user_id uuid REFERENCES users(id), account_version integer, authorizing_session uuid REFERENCES sessions(id),
 code_hash text, code_expires_at timestamptz, consumed_at timestamptz,
 CHECK(browser_hash IS NULL OR browser_hash ~ '^[a-f0-9]{64}$'), CHECK(code_hash IS NULL OR code_hash ~ '^[a-f0-9]{64}$')
);
ALTER TABLE native_handoffs ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON native_handoffs FROM PUBLIC,agg_member,agg_session_runtime,agg_pipeline;

CREATE OR REPLACE FUNCTION public.lookup_fixture_session(selector uuid) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE owner_id uuid; u public.users%ROWTYPE; s public.sessions%ROWTYPE;
BEGIN
 SELECT user_id INTO owner_id FROM public.sessions WHERE id=selector;
 IF owner_id IS NULL THEN RETURN NULL; END IF;
 SELECT * INTO u FROM public.users WHERE id=owner_id FOR UPDATE;
 SELECT * INTO s FROM public.sessions WHERE id=selector AND user_id=owner_id FOR UPDATE;
 IF s.id IS NULL THEN RETURN NULL; END IF;
 RETURN jsonb_build_object('session',to_jsonb(s),'account',jsonb_build_object('id',u.id,'displayName',u.display_name,'status',u.status,'sessionVersion',u.session_version,'roles',(SELECT coalesce(jsonb_agg(role_code),'[]'::jsonb) FROM public.user_roles WHERE user_id=u.id)));
END $$;

CREATE FUNCTION public.start_native_handoff(selector uuid, proof text, flow_state text) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
 IF proof !~ '^[A-Za-z0-9_-]{43}$' OR flow_state !~ '^[A-Za-z0-9_-]{43}$' THEN RETURN false; END IF;
 IF NOT public.local_auth_rate('native-start-global',60) THEN RETURN false; END IF;
 DELETE FROM public.native_handoffs WHERE expires_at<clock_timestamp()-interval '1 day';
 INSERT INTO public.native_handoffs(id,challenge,state) VALUES(selector,proof,flow_state); RETURN true;
END $$;
CREATE FUNCTION public.bind_native_handoff(selector uuid, browser text) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
 IF browser !~ '^[a-f0-9]{64}$' THEN RETURN false; END IF;
 UPDATE public.native_handoffs SET browser_hash=browser WHERE id=selector AND expires_at>clock_timestamp() AND consumed_at IS NULL AND (browser_hash IS NULL OR browser_hash=browser);
 RETURN FOUND;
END $$;
CREATE FUNCTION public.approve_native_handoff(selector uuid, browser text, session_selector uuid, code text) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE record jsonb; s public.sessions%ROWTYPE; pending public.native_handoffs%ROWTYPE;
BEGIN
 -- Call only after application secret authentication established transaction-local owner.
 record:=public.lookup_fixture_session(session_selector);
 SELECT * INTO s FROM public.sessions WHERE id=session_selector;
 IF s.user_id::text IS DISTINCT FROM nullif(current_setting('aggregator.user_id',true),'') OR s.transport<>'web' OR s.revoked_at IS NOT NULL OR s.expires_at<=clock_timestamp() OR s.authentication_method<>'captured-mail' OR s.assurance<>'local-demo' OR code !~ '^[a-f0-9]{64}$' THEN RETURN NULL; END IF;
 IF record->'account'->>'status'<>'active' OR (record->'account'->>'sessionVersion')::integer<>s.account_version THEN RETURN NULL; END IF;
 SELECT * INTO pending FROM public.native_handoffs WHERE id=selector FOR UPDATE;
 IF pending.id IS NULL OR pending.browser_hash IS DISTINCT FROM browser OR pending.expires_at<=clock_timestamp() OR pending.consumed_at IS NOT NULL OR pending.code_hash IS NOT NULL THEN RETURN NULL; END IF;
 UPDATE public.native_handoffs SET user_id=s.user_id,account_version=s.account_version,authorizing_session=s.id,code_hash=code,code_expires_at=clock_timestamp()+interval '2 minutes' WHERE id=selector;
 RETURN pending.state;
END $$;
CREATE FUNCTION public.exchange_native_handoff(selector uuid, proof text, code text, new_session uuid, bearer text, csrf text) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE p public.native_handoffs%ROWTYPE; u public.users%ROWTYPE; s public.sessions%ROWTYPE; moment timestamptz:=clock_timestamp();
BEGIN
 IF NOT public.local_auth_rate('native-exchange-global',120) OR NOT public.local_auth_rate('native-exchange:'||selector::text,10) THEN RETURN false; END IF;
 SELECT * INTO p FROM public.native_handoffs WHERE id=selector;
 IF p.user_id IS NULL THEN RETURN false; END IF;
 -- Consistent account -> originating session -> pending lock order.
 SELECT * INTO u FROM public.users WHERE id=p.user_id FOR UPDATE;
 SELECT * INTO s FROM public.sessions WHERE id=p.authorizing_session FOR UPDATE;
 SELECT * INTO p FROM public.native_handoffs WHERE id=selector FOR UPDATE;
 IF p.consumed_at IS NOT NULL OR p.expires_at<=moment OR p.code_expires_at<=moment OR p.code_hash IS DISTINCT FROM code OR p.challenge IS DISTINCT FROM proof OR bearer !~ '^[a-f0-9]{64}$' OR csrf !~ '^[a-f0-9]{64}$' THEN RETURN false; END IF;
 IF u.status<>'active' OR u.session_version<>p.account_version OR s.user_id<>u.id OR s.revoked_at IS NOT NULL OR s.expires_at<=moment OR s.last_seen_at+s.idle_timeout_ms*interval '1 millisecond'<=moment OR s.transport<>'web' OR s.account_version<>u.session_version THEN RETURN false; END IF;
 IF EXISTS(SELECT FROM public.user_roles WHERE user_id=u.id AND role_code<>'reader') THEN RETURN false; END IF;
 UPDATE public.native_handoffs SET consumed_at=moment WHERE id=selector;
 INSERT INTO public.sessions(id,user_id,token_hash,created_at,expires_at,last_seen_at,account_version,authentication_method,assurance,idle_timeout_ms,csrf_token,transport,native_client_id)
 VALUES(new_session,u.id,bearer,moment,least(s.expires_at,moment+interval '12 hours'),moment,u.session_version,'captured-mail','local-demo',1800000,csrf,'native','aggregator-local');
 RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.start_native_handoff(uuid,text,text),public.bind_native_handoff(uuid,text),public.approve_native_handoff(uuid,text,uuid,text),public.exchange_native_handoff(uuid,text,text,uuid,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.start_native_handoff(uuid,text,text),public.bind_native_handoff(uuid,text),public.approve_native_handoff(uuid,text,uuid,text),public.exchange_native_handoff(uuid,text,text,uuid,text,text) TO agg_session_runtime;
