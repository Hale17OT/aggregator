-- Reader-only own-account actions. No Google-side revocation or staff authority.
CREATE OR REPLACE FUNCTION public.reader_account_action(action text, authorizing uuid, target uuid DEFAULT NULL) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE u public.users%ROWTYPE; s public.sessions%ROWTYPE; moment timestamptz;
BEGIN
 SELECT * INTO u FROM public.users WHERE id=nullif(current_setting('aggregator.user_id',true),'')::uuid FOR UPDATE;
 SELECT * INTO s FROM public.sessions WHERE id=authorizing AND user_id=u.id FOR UPDATE;
 moment:=clock_timestamp();
 IF u.id IS NULL OR u.status<>'active' OR s.id IS NULL OR s.revoked_at IS NOT NULL OR s.expires_at<=moment OR s.last_seen_at+s.idle_timeout_ms*interval '1 millisecond'<=moment OR s.account_version<>u.session_version OR s.created_at<moment-interval '15 minutes'
 OR NOT ((s.authentication_method='google' AND s.assurance='provider-verified') OR (s.authentication_method='captured-mail' AND s.assurance='local-demo'))
 OR EXISTS(SELECT FROM public.user_roles WHERE user_id=u.id AND role_code<>'reader') THEN RETURN false; END IF;
 IF action='revoke-other' THEN
  UPDATE public.sessions SET revoked_at=moment WHERE user_id=u.id AND id<>authorizing AND (target IS NULL OR id=target) AND revoked_at IS NULL;
  RETURN true;
 ELSIF action='delete-account' AND target IS NULL THEN
  DELETE FROM public.source_bookmarks WHERE user_id=u.id;
  DELETE FROM public.bookmarks WHERE user_id=u.id;
  DELETE FROM public.listening_progress WHERE user_id=u.id;
  DELETE FROM public.listening_queues WHERE user_id=u.id;
  DELETE FROM public.topic_follows WHERE user_id=u.id;
  DELETE FROM public.interest_states WHERE user_id=u.id;
  DELETE FROM public.user_preferences WHERE user_id=u.id;
  DELETE FROM public.consents WHERE user_id=u.id;
  UPDATE public.auth_identities SET email_claim=NULL,email_claim_verified=false WHERE user_id=u.id; -- Minimal provider/subject tombstone blocks implicit re-creation.
  DELETE FROM public.reader_auth_attempts WHERE user_id=u.id;
  DELETE FROM public.native_handoffs WHERE user_id=u.id;
  DELETE FROM public.auth_challenges WHERE email_normalized=u.email_normalized;
  DELETE FROM public.sessions WHERE user_id=u.id;
  DELETE FROM public.user_roles WHERE user_id=u.id;
  UPDATE public.users SET email_normalized=NULL,email_verified_at=NULL,display_name=NULL,status='deleted',deleted_at=moment,session_version=session_version+1,profile_revision=profile_revision+1 WHERE id=u.id;
  RETURN true;
 END IF;
 RETURN false;
END $$;
REVOKE ALL ON FUNCTION public.reader_account_action(text,uuid,uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reader_account_action(text,uuid,uuid) TO agg_member;


CREATE OR REPLACE FUNCTION public.redeem_native_code(selector uuid, code_hash text, binding text, new_session uuid, session_hash text, csrf text) RETURNS boolean
LANGUAGE plpgsql SECURITY DEFINER SET search_path=pg_catalog AS $$
DECLARE c public.auth_challenges%ROWTYPE; u public.users%ROWTYPE; moment timestamptz;
BEGIN
 IF code_hash !~ '^[a-f0-9]{64}$' OR binding !~ '^[a-f0-9]{64}$' OR session_hash !~ '^[a-f0-9]{64}$' OR csrf !~ '^[a-f0-9]{64}$' THEN RETURN false; END IF;
 IF NOT public.local_auth_rate('native-code-verify-global',120) THEN RETURN false; END IF;
 SELECT * INTO c FROM public.auth_challenges WHERE id=selector;
 IF c.id IS NULL OR c.return_path<>'/native-code' OR c.browser_hash<>binding THEN RETURN false; END IF;
 PERFORM pg_advisory_xact_lock(hashtextextended('native-code:'||c.email_normalized,0));
 IF NOT public.local_auth_rate('native-code-verify:'||selector::text,5) THEN RETURN false; END IF;
 SELECT * INTO c FROM public.auth_challenges WHERE id=selector;
 moment:=clock_timestamp();
 IF c.consumed_at IS NOT NULL OR c.expires_at<=moment OR c.token_hash<>code_hash OR c.browser_hash<>binding THEN RETURN false; END IF;
 INSERT INTO public.users(email_normalized,display_name) VALUES(c.email_normalized,split_part(c.email_normalized,'@',1)) ON CONFLICT(email_normalized) DO NOTHING;
 SELECT * INTO u FROM public.users WHERE email_normalized=c.email_normalized FOR UPDATE;
 IF u.status<>'active' OR EXISTS(SELECT FROM public.user_roles WHERE user_id=u.id AND role_code<>'reader') THEN RETURN false; END IF;
 SELECT * INTO c FROM public.auth_challenges WHERE id=selector FOR UPDATE;
 moment:=clock_timestamp();
 IF c.id IS NULL OR c.consumed_at IS NOT NULL OR c.expires_at<=moment OR c.token_hash<>code_hash OR c.browser_hash<>binding THEN RETURN false; END IF;
 INSERT INTO public.user_roles(user_id,role_code) VALUES(u.id,'reader') ON CONFLICT DO NOTHING;
 INSERT INTO public.user_preferences(user_id) VALUES(u.id) ON CONFLICT DO NOTHING;
 UPDATE public.auth_challenges SET consumed_at=clock_timestamp() WHERE id=selector;
 INSERT INTO public.sessions(id,user_id,token_hash,created_at,expires_at,last_seen_at,account_version,authentication_method,assurance,idle_timeout_ms,csrf_token,transport,native_client_id)
 VALUES(new_session,u.id,session_hash,moment,moment+interval '12 hours',moment,u.session_version,'captured-mail','local-demo',1800000,csrf,'native','aggregator-local');
 RETURN true;
END $$;

