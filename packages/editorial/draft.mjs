import { z } from 'zod';
import { canonical,hash,metadataUrl } from './input.mjs';
const blockSchema=z.strictObject({text:z.string().min(1),claimId:z.uuid(),sourceId:z.uuid()});
export const outputSchema=z.strictObject({provider:z.literal('local-extractive'),method:z.literal('attributed paragraph extraction'),template:z.literal('extractive/1'),reviewRequired:z.literal(true),headline:z.string(),standard:z.array(blockSchema).min(1),brief:z.array(blockSchema).min(1)});
export function generate(manifest){
 const blocks=manifest.claims.map(c=>({text:`${c.attribution} reports: “${c.text}”`,claimId:c.id,sourceId:c.sourceId}));
 return outputSchema.parse({provider:'local-extractive',method:'attributed paragraph extraction',template:'extractive/1',reviewRequired:true,headline:`Unreviewed fictional briefing: ${manifest.event.entity} (${manifest.event.date})`,standard:blocks,brief:blocks.filter((b,i)=>manifest.sources.find(s=>s.id===b.sourceId)&&blocks.findIndex(x=>x.sourceId===b.sourceId)===i)});
}
export function validateOutput(output,manifest){
 const errors=[];if(!outputSchema.safeParse(output).success)return ['OUTPUT_SCHEMA'];
 if(manifest.sources.length<3)errors.push('INSUFFICIENT_ITEMS');
 const origins=new Set(manifest.sources.flatMap(s=>s.origins.filter(o=>o.counts_for_independence&&o.declaration==='fictional-test-declaration').map(o=>o.origin_key)));if(origins.size<2)errors.push('INSUFFICIENT_DECLARED_ORIGINS');
 for(const s of manifest.sources){try{metadataUrl(s.url);}catch{errors.push('UNSUPPORTED_URL');}}
 for(const variant of [output.standard,output.brief])for(const b of variant){const c=manifest.claims.find(c=>c.id===b.claimId);if(!c||c.sourceId!==b.sourceId||!manifest.sources.some(s=>s.id===b.sourceId))errors.push('UNKNOWN_CITATION');else if(b.text!==`${c.attribution} reports: “${c.text}”`)errors.push('UNSUPPORTED_TEXT');}
 if(manifest.claims.some(c=>!output.standard.some(b=>b.claimId===c.id)))errors.push('MISSING_MATERIAL_CLAIM');return [...new Set(errors)];
}
const signature=text=>text.toLowerCase().replace(/[\d.,]+/g,'#');
export async function freezeAndDraft(repo,eventKey){return repo.transaction(async()=>{
 const versions=(await repo.currentVersions()).filter(v=>hash(canonical(v.metadata.item.event))===eventKey&&v.eligibility!=='metadata_only').sort((a,b)=>a.canonical_url<b.canonical_url?-1:a.canonical_url>b.canonical_url?1:0);
 if(versions.length<3)throw Error('INSUFFICIENT_ITEMS');
 if(versions.length>40||versions.reduce((n,v)=>n+v.normalized_text.split('\n\n').length,0)>1000)throw Error('PACKAGE_SIZE');
 const sources=[];for(const v of versions){const decisions=await repo.eligible(v);if(decisions.some(d=>!d.allowed))throw Error('RIGHTS_INVALID');sources.push({id:v.id,itemId:v.item_id,title:v.title,url:v.canonical_url,rawHash:v.content_hash,normalizedHash:v.normalized_hash,parser:v.extraction_version,grantId:v.rights_grant_id,decisions,origins:await repo.origins(v)});}
 if(new Set(sources.flatMap(s=>s.origins.filter(o=>o.counts_for_independence&&o.declaration==='fictional-test-declaration').map(o=>o.origin_key))).size<2)throw Error('INSUFFICIENT_DECLARED_ORIGINS');
 let cluster=(await repo.query('SELECT * FROM story_clusters WHERE candidate_key=$1',[eventKey]))[0];if(!cluster)cluster=await repo.insert('story_clusters',{label:versions[0].metadata.item.event.entity,candidate_key:eventKey});
 // Idempotent generation fingerprints exact current sources and governance, not a slug.
 const key=hash(canonical({eventKey,revision:cluster.revision,sources,adapter:'extractive/1'}));const prior=(await repo.query('SELECT * FROM generation_runs WHERE idempotency_key=$1',[key]))[0];if(prior)return {digest:prior.evidence_hash,versionId:prior.version_id,replayed:true};
 const claims=[];for(const v of versions){await repo.db.query('INSERT INTO cluster_items(cluster_id,source_version_id,match_method) VALUES($1,$2,$3) ON CONFLICT DO NOTHING',[cluster.id,v.id,'machine: exact entity/date/topic/place; review required']);
  let offset=0;for(const text of v.normalized_text.split('\n\n')){const start=v.normalized_text.indexOf(text,offset),end=start+text.length;offset=end+2;if(!text)continue;
   const segment=v.segments.find(s=>s.startChar===start&&s.endChar===end);if(v.normalized_text.slice(start,end)!==text||hash(v.normalized_text)!==v.normalized_hash)throw Error('LOCATOR_INVALID');
   const locatorHash=hash(canonical({version:v.id,normalizedHash:v.normalized_hash,parser:v.extraction_version,start,end,text,startMs:segment?.startMs??null,endMs:segment?.endMs??null}));
   const span=await repo.insert('evidence_spans',{source_version_id:v.id,start_char:start,end_char:end,start_ms:segment?.startMs??null,end_ms:segment?.endMs??null,excerpt_text:text,locator_hash:locatorHash,quality:'needs_review',retention_until:v.retention_until});
   const claim=await repo.insert('claims',{cluster_id:cluster.id,proposition:text,attribution:v.title,status:'unresolved',claim_hash:hash(text),structured_values:JSON.stringify({provenance:'machine-paragraph-candidate',numbers:text.match(/\d+(?:[.,]\d+)*/g)||[],offsetUnit:'UTF-16'})});
   await repo.insert('claim_evidence',{claim_id:claim.id,evidence_span_id:span.id,source_version_id:v.id,relation:'supports',rationale:'Machine exact quotation; semantic support unreviewed'});
   claims.push({id:claim.id,text,sourceId:v.id,spanId:span.id,start,end,startMs:span.start_ms,endMs:span.end_ms,locatorHash,attribution:v.title});
  }
 }
 const conflicts=[];for(let i=0;i<claims.length;i++)for(let j=i+1;j<claims.length;j++){const a=claims[i],b=claims[j];if(a.sourceId!==b.sourceId&&a.text!==b.text&&signature(a.text)===signature(b.text)){await repo.insert('claim_evidence',{claim_id:a.id,evidence_span_id:b.spanId,source_version_id:b.sourceId,relation:'contradicts',rationale:'Machine numeric-text conflict candidate; no automatic resolution'});conflicts.push({claimId:a.id,otherClaimId:b.id,relation:'contradicts',provenance:'machine-candidate'});}}
 const manifest={format:'evidence-package/1',event:versions[0].metadata.item.event,clusterId:cluster.id,clusterRevision:cluster.revision,policy:'purpose-policy/1',offsetUnit:'UTF-16',sources,claims,conflicts,editorialApproval:false,originAssurance:'simulated fixture declarations; not reviewed human origins'};
 const digest=hash(canonical(manifest));await repo.insert('evidence_packages',{digest,cluster_id:cluster.id,cluster_revision:cluster.revision,manifest:JSON.stringify(manifest)});
 const output=generate(manifest),errors=validateOutput(output,manifest);if(errors.length)throw Error(errors.join(','));
 const article=await repo.insert('articles',{cluster_id:cluster.id,slug:'private-'+digest});
 const version=await repo.insert('article_versions',{article_id:article.id,cluster_id:cluster.id,version_number:1,headline:output.headline,content_hash:hash(canonical(output)),evidence_hash:digest,approval_hash:hash(canonical({output,digest})),evidence_cutoff_at:new Date(),change_summary:'Mechanical extractive output; unreviewed; private only'});
 for(let i=0;i<sources.length;i++)await repo.insert('article_sources',{version_id:version.id,source_version_id:sources[i].id,ordinal:i+1,usage:'evidence'});
 for(const c of claims){await repo.insert('article_claims',{version_id:version.id,claim_id:c.id,cluster_id:cluster.id});await repo.insert('claim_citations',{version_id:version.id,claim_id:c.id,source_version_id:c.sourceId,evidence_span_id:c.spanId});}
 for(const variant of ['standard','brief']){const v=await repo.insert('article_variants',{version_id:version.id,variant});for(let i=0;i<output[variant].length;i++){const b=output[variant][i],block=await repo.insert('article_blocks',{variant_id:v.id,version_id:version.id,position:i,block_type:'quote',text_content:b.text});await repo.insert('block_claims',{block_id:block.id,version_id:version.id,claim_id:b.claimId});}}
 await repo.insert('generation_runs',{cluster_id:cluster.id,version_id:version.id,idempotency_key:key,provider:output.provider,model:'none',prompt_version:output.template,evidence_hash:digest,input_manifest:JSON.stringify({digest,output}),status:'succeeded',finished_at:new Date()});
 await repo.insert('validation_results',{version_id:version.id,approval_hash:version.approval_hash,check_code:'STRUCTURE_ONLY',check_version:'1',result:'pass',severity:'info',details:JSON.stringify({editorialReview:false,originReview:false,publication:false})});await repo.audit('draft.extractive',version.id);for(const v of versions)if((await repo.eligible(v)).some(d=>!d.allowed))throw Error('PERMISSION_EXPIRED_BEFORE_COMMIT');return {digest,versionId:version.id,replayed:false};
 });}
