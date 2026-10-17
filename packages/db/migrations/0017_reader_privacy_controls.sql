-- Reader-only own-account actions. No Google-side revocation or staff authority.
CREATE FUNCTION public.reader_account_action(action text, authorizing uuid, target uuid DEFAULT NULL) RETURNS boolean
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
  DELETE FROM public.auth_identities WHERE user_id=u.id;
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
