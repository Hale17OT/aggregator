import {canonical,hash} from './input.mjs';
export async function registerReviewedSources(client,proposal){
 if(proposal.reviewerKind!=='agent-license-review'||proposal.humanApproval!==false||proposal.sources.length>3)throw Error('REGISTRY_PROVENANCE');
 const result=[];
 for(const source of proposal.sources){
  const existing=(await client.query('SELECT id,home_url FROM public.sources WHERE slug=$1',[source.slug])).rows[0];
  const home=new URL(source.feed).origin+'/';
  if(existing&&existing.home_url!==home)throw Error('SOURCE_IDENTITY_CONFLICT');
  const id=existing?.id||(await client.query(`INSERT INTO public.sources(slug,name,source_type,home_url,identity_key,status,public_rationale,review_due_at) VALUES($1,$2,$3,$4,$5,'active',$6,clock_timestamp()+interval '7 days') RETURNING id`,[source.slug,source.name,source.type,home,'reviewed-local:'+source.slug,'Attributed publisher text only; agent license review, no independent corroboration or human editorial approval'])).rows[0].id;
  const scope={provenance:'reviewed-public-license',readerText:true,endpoint:source.feed,license:source.license,items:source.items,reviewerKind:'agent-license-review',humanEditorialApproval:false,policyHash:hash(canonical(source))};
  const grant=(await client.query('SELECT revision,scope FROM public.rights_grants WHERE grant_key=$1 ORDER BY revision DESC LIMIT 1',[source.grantKey])).rows[0];
  const revision=source.policyRevision||1;
  if(grant&&grant.scope.policyHash!==scope.policyHash&&revision!==grant.revision+1)throw Error('GRANT_REVISION_REVIEW_REQUIRED');
  if(!grant||grant.scope.policyHash!==scope.policyHash){
   await client.query(`INSERT INTO public.rights_grants(source_id,grant_key,revision,status,allow_discovery,allow_fetch,allow_store,allow_public_excerpt,scope,agreement_reference,starts_at,ends_at,raw_retention_days,public_excerpt_limit) VALUES($1,$2,$5,'active',true,true,true,true,$3,$4,clock_timestamp(),clock_timestamp()+interval '7 days',7,30000)`,[id,source.grantKey,scope,source.terms,revision]);
   await client.query(`INSERT INTO public.source_reviews(source_id,decision,rationale,expires_at) VALUES($1,'restrict',$2,clock_timestamp()+interval '7 days')`,[id,'Agent review of current official terms and exact content hashes. Text only; exceptions withheld. Not human approval, truth verification, synthesis or media permission.']);
  }
  await client.query(`INSERT INTO public.source_endpoints(source_id,adapter,endpoint_url,allowed_hosts,configuration,status,poll_interval_seconds) VALUES($1,'rss',$2,$3,$4,'active',900) ON CONFLICT(source_id,adapter,endpoint_url) DO UPDATE SET configuration=EXCLUDED.configuration`,[id,source.feed,JSON.stringify(source.hosts),JSON.stringify({key:'local-reader-feed',polling:'explicit-local-supervised-config',minimumIntervalSeconds:900})]);
  result.push({source:source.slug,reviewedItems:source.items.length});
 }
 return result;
}
