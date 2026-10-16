-- RNM-F04: captured mailbox assurance is explicitly not internet email verification.
ALTER TABLE auth_challenges ADD COLUMN browser_hash text;
CREATE TABLE local_auth_limits (bucket text PRIMARY KEY, window_start timestamptz NOT NULL, attempts integer NOT NULL CHECK(attempts>0));
ALTER TABLE sessions DROP CONSTRAINT session_fixture_proof;
ALTER TABLE sessions ADD CONSTRAINT session_local_proof CHECK (revoked_at IS NOT NULL OR (
 ((authentication_method='fixture' AND assurance='fixture-only') OR (authentication_method='captured-mail' AND assurance='local-demo'))
 AND mfa_verified_at IS NULL AND token_hash ~ '^[a-f0-9]{64}$' AND csrf_token ~ '^[a-f0-9]{64}$'
 AND csrf_token IS NOT NULL AND last_seen_at>=created_at AND last_seen_at<expires_at));

CREATE FUNCTION public.local_auth_rate(key text, maximum integer) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE n integer;
BEGIN
 INSERT INTO public.local_auth_limits(bucket,window_start,attempts) VALUES(key,clock_timestamp(),1)
 ON CONFLICT(bucket) DO UPDATE SET
 attempts=CASE WHEN local_auth_limits.window_start < clock_timestamp()-interval '15 minutes' THEN 1 ELSE local_auth_limits.attempts+1 END,
 window_start=CASE WHEN local_auth_limits.window_start < clock_timestamp()-interval '15 minutes' THEN clock_timestamp() ELSE local_auth_limits.window_start END
 RETURNING attempts INTO n;
 RETURN n<=maximum;
END $$;

CREATE FUNCTION public.request_local_signin(selector uuid, email text, verifier text, browser text, destination text) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
 IF email !~ '^[a-z0-9._+-]{1,64}@example[.]test$' OR verifier !~ '^[a-f0-9]{64}$' OR browser !~ '^[a-f0-9]{64}$'
 OR destination NOT IN ('/library','/preferences','/radio','/newsroom','/') THEN RETURN false; END IF;
 IF NOT public.local_auth_rate('requests-global',60) THEN RETURN false; END IF;
 IF NOT public.local_auth_rate('request:'||email,5) THEN RETURN false; END IF;
 DELETE FROM public.auth_challenges WHERE expires_at<clock_timestamp()-interval '1 day';
 UPDATE public.auth_challenges SET consumed_at=clock_timestamp() WHERE email_normalized=email AND purpose='sign_in' AND consumed_at IS NULL;
 INSERT INTO public.auth_challenges(id,email_normalized,token_hash,purpose,return_path,expires_at,browser_hash)
 VALUES(selector,email,verifier,'sign_in',destination,clock_timestamp()+interval '15 minutes',browser);
 RETURN true;
END $$;

CREATE FUNCTION public.redeem_local_signin(selector uuid, verifier text, browser text, session_id uuid, session_verifier text, csrf text) RETURNS text
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c public.auth_challenges%ROWTYPE; u public.users%ROWTYPE; moment timestamptz:=clock_timestamp();
BEGIN
 IF NOT public.local_auth_rate('verify-global',120) THEN RETURN NULL; END IF;
 IF NOT public.local_auth_rate('verify:'||browser,20) THEN RETURN NULL; END IF;
 SELECT * INTO c FROM public.auth_challenges WHERE id=selector FOR UPDATE;
 IF c.id IS NULL OR c.consumed_at IS NOT NULL OR c.expires_at<=moment OR c.purpose<>'sign_in'
 OR c.token_hash<>verifier OR c.browser_hash<>browser OR c.browser_hash IS NULL
 OR session_verifier !~ '^[a-f0-9]{64}$' OR csrf !~ '^[a-f0-9]{64}$' THEN RETURN NULL; END IF;
 -- All creation, consumption and issuance share the calling transaction.
 INSERT INTO public.users(email_normalized,display_name) VALUES(c.email_normalized,split_part(c.email_normalized,'@',1)) ON CONFLICT(email_normalized) DO NOTHING;
 SELECT * INTO u FROM public.users WHERE email_normalized=c.email_normalized FOR UPDATE;
 IF u.status<>'active' OR EXISTS(SELECT FROM public.user_roles WHERE user_id=u.id AND role_code<>'reader') THEN RETURN NULL; END IF;
 INSERT INTO public.user_roles(user_id,role_code) VALUES(u.id,'reader') ON CONFLICT DO NOTHING;
 INSERT INTO public.user_preferences(user_id) VALUES(u.id) ON CONFLICT DO NOTHING;
 UPDATE public.auth_challenges SET consumed_at=moment WHERE id=c.id;
 INSERT INTO public.sessions(id,user_id,token_hash,created_at,expires_at,last_seen_at,account_version,authentication_method,assurance,idle_timeout_ms,csrf_token)
 VALUES(session_id,u.id,session_verifier,moment,moment+interval '12 hours',moment,u.session_version,'captured-mail','local-demo',1800000,csrf);
 RETURN c.return_path;
END $$;

CREATE OR REPLACE FUNCTION public.touch_fixture_session(selector uuid, observed_at timestamptz) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
 PERFORM public.lookup_fixture_session(selector);
 UPDATE public.sessions s SET last_seen_at=greatest(s.last_seen_at,observed_at)
 FROM public.users u WHERE s.id=selector AND u.id=s.user_id AND u.status='active' AND u.session_version=s.account_version AND s.revoked_at IS NULL
 AND ((s.authentication_method='fixture' AND s.assurance='fixture-only') OR (s.authentication_method='captured-mail' AND s.assurance='local-demo'))
 AND s.mfa_verified_at IS NULL AND observed_at>=s.created_at AND observed_at<s.expires_at
 AND observed_at<s.last_seen_at+s.idle_timeout_ms*interval '1 millisecond';
 RETURN FOUND;
END $$;
REVOKE ALL ON FUNCTION public.local_auth_rate(text,integer),public.request_local_signin(uuid,text,text,text,text),public.redeem_local_signin(uuid,text,text,uuid,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_local_signin(uuid,text,text,text,text),public.redeem_local_signin(uuid,text,text,uuid,text,text) TO agg_session_runtime;
