export const policyVersion='purpose-policy/1';
const flags={discovery:['allow_discovery'],retrieve:['allow_fetch'],store:['allow_store'],extract:['allow_model'],synthesis:['allow_model','allow_synthesis'],excerpt:['allow_public_excerpt'],media:['allow_media']};
export function decide(row,item,purpose,now=new Date()){
 const reasons=[];if(!row)return {allowed:false,reasons:['GRANT_MISSING'],policyVersion,purpose};
 if(row.source_status!=='active')reasons.push('SOURCE_INACTIVE');
 if(row.source_slug!==item.source)reasons.push('WRONG_SOURCE');
 if(row.endpoint_status!=='active'||row.endpoint_key!==item.endpoint)reasons.push('WRONG_ENDPOINT');
 if(row.status!=='active'||row.revoked_at)reasons.push('GRANT_INACTIVE');
 if(new Date(row.starts_at)>now||!row.ends_at||new Date(row.ends_at)<=now)reasons.push('GRANT_INTERVAL');
 if(!flags[purpose]||flags[purpose].some(f=>row[f]!==true))reasons.push('WRONG_USE');
 if(row.scope?.provenance!=='fictional-test-declaration'||!row.scope?.items?.includes(item.key)||!row.scope?.kinds?.includes(item.kind)||row.scope.endpoint!==item.endpoint)reasons.push('SCOPE_MISMATCH');
 if(['store','extract','synthesis'].includes(purpose)&&!(row.raw_retention_days>0))reasons.push('RETENTION_DENIED');
 return {allowed:!reasons.length,reasons,policyVersion,purpose,grantId:row.id,revision:row.revision,sourceId:row.source_id};
}
