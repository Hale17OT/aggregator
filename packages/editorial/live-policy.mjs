import {hash} from './input.mjs';
export function liveDecision(grant,item,purpose,now=new Date()){
 const reasons=[];
 if(!grant)return {allowed:false,reasons:['NO_REVIEWED_GRANT']};
 if(grant.source_status!=='active'||grant.endpoint_status!=='active')reasons.push('SOURCE_PAUSED');
 if(grant.status!=='active'||grant.revoked_at||new Date(grant.starts_at)>now||!grant.ends_at||new Date(grant.ends_at)<=now)reasons.push('RIGHTS_INACTIVE');
 if(grant.scope?.provenance!=='reviewed-public-license')reasons.push('RIGHTS_PROVENANCE');
 const reviewed=grant.scope?.items?.find(r=>r.url===item.url&&r.contentHash===item.contentHash);
 if(!reviewed||reviewed.decision!=='text-only')reasons.push('ITEM_REVIEW_REQUIRED');
 if(reviewed&&(reviewed.bodyHash!==hash(item.body)||reviewed.title!==item.title||reviewed.author!==item.author||reviewed.publishedAt!==item.publishedAt))reasons.push('REPRESENTATION_REVIEW_REQUIRED');
 const flag={retrieve:'allow_fetch',store:'allow_store',display:'allow_public_excerpt'}[purpose];
 if(!flag||grant[flag]!==true)reasons.push('PURPOSE_DENIED');
 if(purpose==='display'&&(!grant.scope.readerText||item.body.length>grant.public_excerpt_limit))reasons.push('DISPLAY_SCOPE');
 if(purpose==='store'&&!(grant.raw_retention_days>0))reasons.push('RETENTION_DENIED');
 return {allowed:reasons.length===0,reasons,grantId:grant.id,revision:grant.revision,reviewerKind:'agent-license-review',humanEditorialApproval:false};
}
