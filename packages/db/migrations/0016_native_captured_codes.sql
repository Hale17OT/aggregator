-- Native code completion reuses auth_challenges and the captured-mail assurance.
-- The application supplies HMAC-SHA256 verifiers; raw codes never enter SQL.
CREATE FUNCTION public.request_native_code(selector uuid, email text, code_hash text, binding text) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
 IF email !~ '^[a-z0-9._+-]{1,64}@example[.]test$' OR code_hash !~ '^[a-f0-9]{64}$' OR binding !~ '^[a-f0-9]{64}$' THEN RETURN false; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('native-code:'||email,0));
 IF NOT public.local_auth_rate('native-code-global',60) OR NOT public.local_auth_rate('native-code:'||email,5) THEN RETURN false; END IF;
 IF EXISTS(SELECT FROM public.auth_challenges WHERE email_normalized=email AND return_path='/native-code' AND created_at>clock_timestamp()-interval '60 seconds') THEN RETURN false; END IF;
 UPDATE public.auth_challenges SET consumed_at=clock_timestamp() WHERE email_normalized=email AND return_path='/native-code' AND consumed_at IS NULL;
 INSERT INTO public.auth_challenges(id,email_normalized,token_hash,purpose,return_path,expires_at,browser_hash)
 VALUES(selector,email,code_hash,'sign_in','/native-code',clock_timestamp()+interval '10 minutes',binding);
 RETURN true;
END $$;

CREATE FUNCTION public.redeem_native_code(selector uuid, code_hash text, binding text, new_session uuid, session_hash text, csrf text) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c public.auth_challenges%ROWTYPE; u public.users%ROWTYPE; moment timestamptz;
BEGIN
 IF code_hash !~ '^[a-f0-9]{64}$' OR binding !~ '^[a-f0-9]{64}$' OR session_hash !~ '^[a-f0-9]{64}$' OR csrf !~ '^[a-f0-9]{64}$' THEN RETURN false; END IF;
 IF NOT public.local_auth_rate('native-code-verify-global',120) THEN RETURN false; END IF;
 SELECT * INTO c FROM public.auth_challenges WHERE id=selector;
 IF c.id IS NULL OR c.return_path<>'/native-code' OR c.browser_hash<>binding THEN RETURN false; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('native-code:'||c.email_normalized,0));
 IF NOT public.local_auth_rate('native-code-verify:'||selector::text,5) THEN RETURN false; END IF;
 SELECT * INTO c FROM public.auth_challenges WHERE id=selector FOR UPDATE;
 moment:=clock_timestamp();
 IF c.consumed_at IS NOT NULL OR c.expires_at<=moment OR c.token_hash<>code_hash OR c.browser_hash<>binding THEN RETURN false; END IF;
 INSERT INTO public.users(email_normalized,display_name) VALUES(c.email_normalized,split_part(c.email_normalized,'@',1)) ON CONFLICT(email_normalized) DO NOTHING;
 SELECT * INTO u FROM public.users WHERE email_normalized=c.email_normalized FOR UPDATE;
 IF u.status<>'active' OR EXISTS(SELECT FROM public.user_roles WHERE user_id=u.id AND role_code<>'reader') THEN RETURN false; END IF;
 INSERT INTO public.user_roles(user_id,role_code) VALUES(u.id,'reader') ON CONFLICT DO NOTHING;
 INSERT INTO public.user_preferences(user_id) VALUES(u.id) ON CONFLICT DO NOTHING;
 UPDATE public.auth_challenges SET consumed_at=clock_timestamp() WHERE id=selector;
 INSERT INTO public.sessions(id,user_id,token_hash,created_at,expires_at,last_seen_at,account_version,authentication_method,assurance,idle_timeout_ms,csrf_token,transport,native_client_id)
 VALUES(new_session,u.id,session_hash,moment,moment+interval '12 hours',moment,u.session_version,'captured-mail','local-demo',1800000,csrf,'native','aggregator-local');
 RETURN true;
END $$;
REVOKE ALL ON FUNCTION public.request_native_code(uuid,text,text,text),public.redeem_native_code(uuid,text,text,uuid,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.request_native_code(uuid,text,text,text),public.redeem_native_code(uuid,text,text,uuid,text,text) TO agg_session_runtime;
