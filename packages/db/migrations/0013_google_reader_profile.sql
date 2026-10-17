-- Google is a reader identity, not staff/MFA or permission to publish.
ALTER TABLE users ADD COLUMN profile_revision integer NOT NULL DEFAULT 0 CHECK(profile_revision>=0);
ALTER TABLE auth_identities ADD COLUMN email_claim text;
ALTER TABLE auth_identities ADD COLUMN email_claim_verified boolean NOT NULL DEFAULT false;
CREATE UNIQUE INDEX one_provider_per_member ON auth_identities(user_id,provider);
ALTER TABLE sessions DROP CONSTRAINT session_local_proof;
ALTER TABLE sessions ADD CONSTRAINT session_reader_proof CHECK(revoked_at IS NOT NULL OR (
 ((authentication_method='fixture' AND assurance='fixture-only') OR
  (authentication_method='captured-mail' AND assurance='local-demo') OR
  (authentication_method='google' AND assurance='provider-verified'))
 AND mfa_verified_at IS NULL AND token_hash ~ '^[a-f0-9]{64}$'
 AND csrf_token IS NOT NULL AND csrf_token ~ '^[a-f0-9]{64}$'
 AND last_seen_at>=created_at AND last_seen_at<expires_at));

CREATE TABLE reader_auth_attempts (
 id uuid PRIMARY KEY, transport text NOT NULL CHECK(transport IN ('web','native')),
 action text NOT NULL CHECK(action IN ('sign-in','link','reauthenticate')),
 binding_hash text NOT NULL CHECK(binding_hash ~ '^[a-f0-9]{64}$'),
 nonce text NOT NULL UNIQUE CHECK(nonce ~ '^[a-f0-9]{64}$'),
 user_id uuid REFERENCES users(id), authorizing_session uuid REFERENCES sessions(id),
 created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 expires_at timestamptz NOT NULL DEFAULT clock_timestamp()+interval '5 minutes', consumed_at timestamptz,
 CHECK((action='sign-in' AND user_id IS NULL AND authorizing_session IS NULL) OR
       (action<>'sign-in' AND user_id IS NOT NULL AND authorizing_session IS NOT NULL))
);
ALTER TABLE reader_auth_attempts ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON reader_auth_attempts FROM PUBLIC,agg_member,agg_pipeline,agg_session_runtime;

CREATE FUNCTION public.start_google_attempt(selector uuid, channel text, intent text, binding text, challenge text, actor_session uuid DEFAULT NULL) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE owner_id uuid; s public.sessions%ROWTYPE;
BEGIN
 IF channel NOT IN ('web','native') OR intent NOT IN ('sign-in','link','reauthenticate') OR binding !~ '^[a-f0-9]{64}$' OR challenge !~ '^[a-f0-9]{64}$' THEN RETURN false; END IF;
 IF NOT public.local_auth_rate('google-start-global',120) OR NOT public.local_auth_rate('google-start:'||binding,12) THEN RETURN false; END IF;
 IF intent<>'sign-in' THEN
  SELECT * INTO s FROM public.sessions WHERE id=actor_session;
  owner_id:=nullif(current_setting('aggregator.user_id',true),'')::uuid;
  IF owner_id IS NULL OR s.user_id IS DISTINCT FROM owner_id OR s.revoked_at IS NOT NULL OR s.expires_at<=clock_timestamp() OR s.authentication_method<>'google' OR s.assurance<>'provider-verified' OR (intent='link' AND s.created_at<clock_timestamp()-interval '15 minutes') THEN RETURN false; END IF;
 END IF;
 UPDATE public.reader_auth_attempts SET consumed_at=clock_timestamp() WHERE binding_hash=binding AND consumed_at IS NULL;
 DELETE FROM public.reader_auth_attempts WHERE expires_at<clock_timestamp()-interval '1 day';
 INSERT INTO public.reader_auth_attempts(id,transport,action,binding_hash,nonce,user_id,authorizing_session) VALUES(selector,channel,intent,binding,challenge,owner_id,actor_session);
 RETURN true;
END $$;

CREATE FUNCTION public.read_google_attempt(selector uuid, channel text, binding text) RETURNS jsonb
LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog AS $$
 SELECT jsonb_build_object('nonce',nonce,'action',action) FROM public.reader_auth_attempts
 WHERE id=selector AND transport=channel AND binding_hash=binding AND consumed_at IS NULL AND expires_at>clock_timestamp()
$$;
CREATE FUNCTION public.cancel_google_attempt(selector uuid, channel text, binding text) RETURNS void
LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog AS $$
 UPDATE public.reader_auth_attempts SET consumed_at=clock_timestamp() WHERE id=selector AND transport=channel AND binding_hash=binding AND consumed_at IS NULL
$$;

-- Called only by the trusted verifier after Google cryptography/network work has finished.
-- Serialized provider identity, then account, authorizing session, attempt, issued session.
CREATE FUNCTION public.finish_google_attempt(selector uuid, channel text, binding text, challenge text,
 verified_subject text, verified_email text, verified_email_flag boolean, suggested_name text,
 new_session uuid, session_proof text, csrf text) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE a public.reader_auth_attempts%ROWTYPE; u public.users%ROWTYPE; provider_owner uuid; s public.sessions%ROWTYPE; moment timestamptz:=clock_timestamp();
BEGIN
 IF verified_subject !~ '^[A-Za-z0-9_-]{1,255}$' OR session_proof !~ '^[a-f0-9]{64}$' OR csrf !~ '^[a-f0-9]{64}$' OR length(verified_email)>320 OR length(suggested_name)>120 THEN RETURN false; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('google:'||verified_subject,0));
 SELECT * INTO a FROM public.reader_auth_attempts WHERE id=selector;
 IF a.id IS NULL OR a.transport<>channel OR a.binding_hash<>binding OR a.nonce<>challenge OR a.consumed_at IS NOT NULL OR a.expires_at<=moment THEN RETURN false; END IF;
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
  IF s.last_seen_at+s.idle_timeout_ms*interval '1 millisecond'<=moment THEN RETURN false; END IF;
  IF s.id IS NULL OR s.user_id<>u.id OR s.revoked_at IS NOT NULL OR s.expires_at<=moment OR s.account_version<>u.session_version OR s.authentication_method<>'google' OR s.assurance<>'provider-verified' OR (a.action='link' AND s.created_at<moment-interval '15 minutes') THEN RETURN false; END IF;
  IF a.action='reauthenticate' AND provider_owner IS DISTINCT FROM u.id THEN RETURN false; END IF;
  IF a.action='link' THEN
   IF provider_owner IS NOT NULL AND provider_owner<>u.id THEN RETURN false; END IF;
   IF EXISTS(SELECT FROM public.auth_identities WHERE user_id=u.id AND provider='https://accounts.google.com' AND subject<>verified_subject) THEN RETURN false; END IF;
   INSERT INTO public.auth_identities(user_id,provider,subject,email_claim,email_claim_verified) VALUES(u.id,'https://accounts.google.com',verified_subject,verified_email,verified_email_flag) ON CONFLICT(provider,subject) DO NOTHING;
  END IF;
 END IF;
 IF u.status<>'active' OR EXISTS(SELECT FROM public.user_roles WHERE user_id=u.id AND role_code<>'reader') THEN RETURN false; END IF;
 SELECT * INTO a FROM public.reader_auth_attempts WHERE id=selector FOR UPDATE;
 IF a.consumed_at IS NOT NULL OR a.expires_at<=clock_timestamp() THEN RETURN false; END IF;
 UPDATE public.reader_auth_attempts SET consumed_at=clock_timestamp() WHERE id=selector;
 INSERT INTO public.sessions(id,user_id,token_hash,created_at,expires_at,last_seen_at,account_version,authentication_method,assurance,idle_timeout_ms,csrf_token,transport,native_client_id)
 VALUES(new_session,u.id,session_proof,moment,moment+interval '12 hours',moment,u.session_version,'google','provider-verified',1800000,csrf,channel,CASE WHEN channel='native' THEN 'aggregator-local' END);
 RETURN true;
END $$;

CREATE OR REPLACE FUNCTION public.touch_fixture_session(selector uuid, observed_at timestamptz) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
 PERFORM public.lookup_fixture_session(selector);
 UPDATE public.sessions s SET last_seen_at=greatest(s.last_seen_at,observed_at)
 FROM public.users u WHERE s.id=selector AND u.id=s.user_id AND u.status='active' AND u.session_version=s.account_version AND s.revoked_at IS NULL
 AND ((s.authentication_method='fixture' AND s.assurance='fixture-only') OR (s.authentication_method='captured-mail' AND s.assurance='local-demo') OR (s.authentication_method='google' AND s.assurance='provider-verified'))
 AND s.mfa_verified_at IS NULL AND observed_at>=s.created_at AND observed_at<s.expires_at AND observed_at<s.last_seen_at+s.idle_timeout_ms*interval '1 millisecond';
 RETURN FOUND;
END $$;

CREATE FUNCTION public.reader_profile() RETURNS jsonb
LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog AS $$
 SELECT jsonb_build_object('id',u.id,'displayName',u.display_name,'revision',u.profile_revision,'joinedAt',u.created_at,
 'emailMethod',CASE WHEN u.email_normalized IS NOT NULL THEN jsonb_build_object('email',u.email_normalized,'assurance','local captured mail only') END,
 'providers',(SELECT coalesce(jsonb_agg(jsonb_build_object('provider',a.provider,'email',a.email_claim,'emailClaimVerified',a.email_claim_verified)),'[]'::jsonb) FROM public.auth_identities a WHERE a.user_id=u.id),
 'sessions',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',s.id,'transport',s.transport,'method',s.authentication_method,'createdAt',s.created_at,'lastActiveAt',s.last_seen_at,'expiresAt',s.expires_at) ORDER BY s.created_at DESC),'[]'::jsonb) FROM public.sessions s WHERE s.user_id=u.id AND s.revoked_at IS NULL AND s.expires_at>clock_timestamp() AND s.account_version=u.session_version AND s.last_seen_at+s.idle_timeout_ms*interval '1 millisecond'>clock_timestamp()))
 FROM public.users u WHERE u.id=nullif(current_setting('aggregator.user_id',true),'')::uuid AND u.status='active'
$$;
CREATE FUNCTION public.edit_reader_profile(expected integer, new_name text) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
BEGIN
 IF length(trim(new_name)) NOT BETWEEN 1 AND 80 THEN RETURN false; END IF;
 UPDATE public.users SET display_name=trim(new_name),profile_revision=profile_revision+1 WHERE id=nullif(current_setting('aggregator.user_id',true),'')::uuid AND profile_revision=expected AND status='active';
 RETURN FOUND;
END $$;
REVOKE ALL ON FUNCTION public.start_google_attempt(uuid,text,text,text,text,uuid),public.read_google_attempt(uuid,text,text),public.cancel_google_attempt(uuid,text,text),public.finish_google_attempt(uuid,text,text,text,text,text,boolean,text,uuid,text,text),public.reader_profile(),public.edit_reader_profile(integer,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.start_google_attempt(uuid,text,text,text,text,uuid),public.read_google_attempt(uuid,text,text),public.cancel_google_attempt(uuid,text,text),public.finish_google_attempt(uuid,text,text,text,text,text,boolean,text,uuid,text,text) TO agg_session_runtime;
GRANT EXECUTE ON FUNCTION public.start_google_attempt(uuid,text,text,text,text,uuid),public.reader_profile(),public.edit_reader_profile(integer,text) TO agg_member;

