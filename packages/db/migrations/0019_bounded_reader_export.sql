-- Read-only, owner-scoped consent export. No direct runtime consent-table grant.
CREATE FUNCTION public.reader_consent_export() RETURNS jsonb
LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog AS $$
 SELECT coalesce(jsonb_agg(to_jsonb(c)),'[]'::jsonb) FROM (
 SELECT id,purpose,policy_version,granted,recorded_at FROM public.consents
 WHERE user_id=nullif(current_setting('aggregator.user_id',true),'')::uuid
 ORDER BY recorded_at DESC,id LIMIT 101) c
$$;
REVOKE ALL ON FUNCTION public.reader_consent_export() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reader_consent_export() TO agg_member;
CREATE OR REPLACE FUNCTION public.reader_profile() RETURNS jsonb
LANGUAGE sql SECURITY DEFINER SET search_path=pg_catalog AS $$
 SELECT jsonb_build_object('id',u.id,'displayName',u.display_name,'revision',u.profile_revision,'joinedAt',u.created_at,
 'emailMethod',CASE WHEN u.email_normalized IS NOT NULL THEN jsonb_build_object('email',u.email_normalized,'assurance','local captured mail only') END,
 'providers',(SELECT coalesce(jsonb_agg(jsonb_build_object('provider',a.provider,'email',a.email_claim,'emailClaimVerified',a.email_claim_verified)),'[]'::jsonb) FROM public.auth_identities a WHERE a.user_id=u.id),
 'sessions',(SELECT coalesce(jsonb_agg(jsonb_build_object('id',s.id,'transport',s.transport,'method',s.authentication_method,'createdAt',s.created_at,'lastActiveAt',s.last_seen_at,'expiresAt',s.expires_at) ORDER BY s.created_at DESC),'[]'::jsonb) FROM (SELECT * FROM public.sessions WHERE user_id=u.id AND revoked_at IS NULL AND expires_at>clock_timestamp() AND account_version=u.session_version AND last_seen_at+idle_timeout_ms*interval '1 millisecond'>clock_timestamp() ORDER BY created_at DESC LIMIT 100) s))
 FROM public.users u WHERE u.id=nullif(current_setting('aggregator.user_id',true),'')::uuid AND u.status='active'
$$;

