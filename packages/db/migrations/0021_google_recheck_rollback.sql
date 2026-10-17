CREATE OR REPLACE FUNCTION public.finish_google_attempt(selector uuid, channel text, binding text, challenge text,
 verified_subject text, verified_email text, verified_email_flag boolean, suggested_name text,
 new_session uuid, session_proof text, csrf text) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE a public.reader_auth_attempts%ROWTYPE; u public.users%ROWTYPE; provider_owner uuid; s public.sessions%ROWTYPE; moment timestamptz:=clock_timestamp();
BEGIN
 IF verified_subject !~ '^[A-Za-z0-9_-]{1,255}$' OR session_proof !~ '^[a-f0-9]{64}$' OR csrf !~ '^[a-f0-9]{64}$' OR length(verified_email)>320 OR length(suggested_name)>120 THEN RETURN false; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('google:'||verified_subject,0));
 SELECT * INTO a FROM public.reader_auth_attempts WHERE id=selector;
 IF a.id IS NULL OR a.transport<>channel OR a.binding_hash<>binding OR a.nonce<>challenge OR a.consumed_at IS NOT NULL OR a.expires_at<=moment THEN RETURN false; END IF;
 BEGIN -- Rejected final recheck must undo tentative signup/link writes.
 SELECT user_id INTO provider_owner FROM public.auth_identities WHERE provider='https://accounts.google.com' AND subject=verified_subject;
 IF a.action='sign-in' THEN
  IF provider_owner IS NULL THEN
   -- Never select/upsert users by provider email; fixture ownership is not Google ownership.
   INSERT INTO public.users(display_name) VALUES(coalesce(nullif(suggested_name,''),'Reader')) RETURNING * INTO u;
   INSERT INTO public.auth_identities(user_id,provider,subject,email_claim,email_claim_verified) VALUES(u.id,'https://accounts.google.com',verified_subject,verified_email,verified_email_flag);
   INSERT INTO public.user_roles(user_id,role_code) VALUES(u.id,'reader');
   INSERT INTO public.user_preferences(user_id) VALUES(u.id);
  ELSE SELECT * INTO u FROM public.users WHERE id=provider_owner FOR UPDATE;
  END IF;
 ELSE
  SELECT * INTO u FROM public.users WHERE id=a.user_id FOR UPDATE;
  SELECT * INTO s FROM public.sessions WHERE id=a.authorizing_session FOR UPDATE;
  moment:=clock_timestamp();
  IF s.last_seen_at+s.idle_timeout_ms*interval '1 millisecond'<=moment THEN RAISE no_data_found; END IF;
  IF s.id IS NULL OR s.user_id<>u.id OR s.revoked_at IS NOT NULL OR s.expires_at<=moment OR s.account_version<>u.session_version OR s.authentication_method<>'google' OR s.assurance<>'provider-verified' OR (a.action='link' AND s.created_at<moment-interval '15 minutes') THEN RAISE no_data_found; END IF;
  IF a.action='reauthenticate' AND provider_owner IS DISTINCT FROM u.id THEN RAISE no_data_found; END IF;
  IF a.action='link' THEN
   IF provider_owner IS NOT NULL AND provider_owner<>u.id THEN RAISE no_data_found; END IF;
   IF EXISTS(SELECT FROM public.auth_identities WHERE user_id=u.id AND provider='https://accounts.google.com' AND subject<>verified_subject) THEN RAISE no_data_found; END IF;
   INSERT INTO public.auth_identities(user_id,provider,subject,email_claim,email_claim_verified) VALUES(u.id,'https://accounts.google.com',verified_subject,verified_email,verified_email_flag) ON CONFLICT(provider,subject) DO NOTHING;
  END IF;
 END IF;
 IF u.status<>'active' OR EXISTS(SELECT FROM public.user_roles WHERE user_id=u.id AND role_code<>'reader') THEN RAISE no_data_found; END IF;
 SELECT * INTO a FROM public.reader_auth_attempts WHERE id=selector FOR UPDATE;
 IF a.id IS NULL OR a.consumed_at IS NOT NULL OR a.expires_at<=clock_timestamp() THEN RAISE no_data_found; END IF;
 UPDATE public.reader_auth_attempts SET consumed_at=clock_timestamp() WHERE id=selector;
 INSERT INTO public.sessions(id,user_id,token_hash,created_at,expires_at,last_seen_at,account_version,authentication_method,assurance,idle_timeout_ms,csrf_token,transport,native_client_id)
 VALUES(new_session,u.id,session_proof,moment,moment+interval '12 hours',moment,u.session_version,'google','provider-verified',1800000,csrf,channel,CASE WHEN channel='native' THEN 'aggregator-local' END);
 RETURN true;
 EXCEPTION WHEN no_data_found THEN RETURN false;
 END;
END $$;

