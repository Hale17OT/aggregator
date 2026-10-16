import pg from 'pg';
import { realpathSync } from 'node:fs';
import { resolve, sep } from 'node:path';
import { randomUUID } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { canonical,hash,safeRead,extract,parserVersion,itemSchema,locatorErrors } from './input.mjs';
import { decide } from './policy.mjs';

export async function connect(target){
 if(target.purpose!=='aggregator-isolated-pipeline'||target.port!==55442||target.database!=='aggregator_pipeline'||!realpathSync(target.data).startsWith(resolve('.cache')+sep+'pg18-pipeline-'))throw Error('TARGET_REFUSED');
 const db=new pg.Client({host:'127.0.0.1',port:55442,database:'aggregator_pipeline',user:'agg_pipeline_login',connectionTimeoutMillis:5000,statement_timeout:15000});await db.connect();
 try{const actual=(await db.query('SELECT pipeline_target() AS target')).rows[0].target;if(realpathSync(actual.data)!==realpathSync(target.data)||actual.systemIdentifier!==target.systemIdentifier||actual.port!==55442||actual.database!==target.database)throw Error('TARGET_MISMATCH');return new Repository(db);}catch(e){await db.end();throw e;}
}
export class Repository {
 constructor(db){this.db=db;}
 async close(){await this.db.end();}
 async transaction(work){await this.db.query('BEGIN');try{await this.db.query('SELECT pipeline_governance_lock()');const result=await work();await this.db.query('COMMIT');return result;}catch(e){await this.db.query('ROLLBACK');throw e;}}
 async query(sql,args=[]){return (await this.db.query(sql,args)).rows;}
 async insert(table,values){const names=Object.keys(values);return (await this.query(`INSERT INTO ${table}(${names.join(',')}) VALUES(${names.map((_,i)=>'$'+(i+1)).join(',')}) RETURNING *`,Object.values(values)))[0];}
 async policy(item){return (await this.query(`SELECT g.*,s.status AS source_status,s.slug AS source_slug,e.status AS endpoint_status,e.configuration->>'key' AS endpoint_key,e.id AS endpoint_id FROM rights_grants g JOIN sources s ON s.id=g.source_id JOIN source_endpoints e ON e.source_id=s.id AND e.configuration->>'key'=$2 WHERE g.grant_key=$1 ORDER BY g.revision DESC LIMIT 1`,[item.grant,item.endpoint]))[0];}
 async audit(action,id){await this.insert('audit_events',{actor_token:'machine:local-extractive-runner',action,resource_type:'local_pipeline',resource_id:id,reason:'fictional local processing; no human approval',correlation_id:randomUUID()});}
 async importItem(input,operation,options={}){
 const item=itemSchema.parse(input);if(!/^[a-zA-Z0-9:/_-]{1,140}$/.test(operation))throw Error('OPERATION_KEY');
 return this.transaction(async()=>{
  const row=await this.policy(item),purposes=item.kind==='feed'?['discovery','retrieve','store']:item.kind==='video'?['discovery']:['retrieve','store','extract'];
  const decisions=purposes.map(p=>decide(row,item,p));if(decisions.some(d=>!d.allowed))return {status:'denied',decisions};
  const fingerprint=hash(canonical({item,parser:options.parser||parserVersion}));
  const previous=(await this.query('SELECT payload FROM processing_jobs WHERE idempotency_key=$1',[operation]))[0];if(previous){if(previous.payload.fingerprint!==fingerprint)throw Error('IDEMPOTENCY_CONFLICT');return previous.payload.result;}
  const bytes=item.kind==='video'?Buffer.alloc(0):safeRead(item.file,options.onOpen);const parsed=extract(bytes,item.kind);
  if(purposes.some(p=>!decide(row,item,p).allowed))throw Error('PERMISSION_EXPIRED_DURING_EXTRACTION');
  if(options.failAfterParse)throw Error('INJECTED_ROLLBACK');
  const rawHash=hash(bytes);let sourceItem=(await this.query('SELECT * FROM source_items WHERE source_id=$1 AND provider_item_key=$2',[row.source_id,item.key]))[0];
  if(!sourceItem)sourceItem=await this.insert('source_items',{source_id:row.source_id,provider_item_key:item.key,kind:item.kind==='html'?'article':item.kind==='feed'?'document':item.kind,canonical_url:item.url});
  if(sourceItem.canonical_url!==item.url)throw Error('ITEM_URL_CHANGED');
  const extractionVersion=options.parser||parserVersion;
  const {file:localFile,...context}=item;void localFile;const contextHash=hash(canonical(context));
  let version=(await this.query('SELECT * FROM source_item_versions WHERE item_id=$1 AND content_hash=$2 AND extraction_version=$3 AND rights_grant_id=$4 AND representation_context_hash=$5',[sourceItem.id,rawHash,extractionVersion,row.id,contextHash]))[0];
  if(!version){const revision=Number((await this.query('SELECT coalesce(max(revision),0)+1 AS n FROM source_item_versions WHERE item_id=$1',[sourceItem.id]))[0].n);
   version=await this.insert('source_item_versions',{item_id:sourceItem.id,source_id:row.source_id,rights_grant_id:row.id,revision,title:item.title,source_published_at:item.published,fetched_url:item.url,language:item.language,content_hash:rawHash,normalized_hash:hash(parsed.text),representation_context_hash:contextHash,extraction_version:extractionVersion,transcript_provenance:parsed.provenance||null,duration_ms:parsed.durationMs||null,eligibility:['feed','video'].includes(item.kind)?'metadata_only':'needs_review',retention_until:new Date(Math.min(Date.now()+row.raw_retention_days*86400000,new Date(row.ends_at).getTime())),metadata:JSON.stringify({item,discovery:parsed.discovery,offsetUnit:'UTF-16',normalization:'NFC; paragraphs separated by two LF'})});
   await this.insert('source_payloads',{source_version_id:version.id,raw_bytes:bytes,normalized_text:parsed.text,segments:JSON.stringify(parsed.segments)});
  }
  const observation=await this.insert('source_observations',{item_id:sourceItem.id,source_version_id:version.id,endpoint_id:row.endpoint_id,requested_url:item.url,final_url:item.url,availability:'available',operation_key:operation});
  const result={status:'imported',itemId:sourceItem.id,versionId:version.id,observationId:observation.id,decisions};
  await this.insert('processing_jobs',{job_type:'local-import',idempotency_key:operation,payload:JSON.stringify({fingerprint,result}),status:'succeeded'});await this.audit('source.import',version.id);if(purposes.some(p=>!decide(row,item,p).allowed))throw Error('PERMISSION_EXPIRED_BEFORE_COMMIT');return result;
 });}
 async currentVersions(){
 const versions=await this.query(`WITH latest AS (SELECT DISTINCT ON(item_id) * FROM source_observations ORDER BY item_id,observation_order DESC) SELECT v.*,i.canonical_url,i.provider_item_key,o.id AS observation_id,o.observed_at FROM source_items i JOIN latest o ON o.item_id=i.id JOIN source_item_versions v ON v.id=o.source_version_id JOIN source_payloads p ON p.source_version_id=v.id ORDER BY i.id LIMIT 1001`);
 if(versions.length>1000)throw Error('CATALOGUE_BOUND');
 // Normalized payload access has the same current-rights boundary as extraction.
 // Called inside the governance transaction by freeze/access/export services.
 for(const v of versions){v.normalized_text='';v.segments=[];if((await this.eligible(v)).every(d=>d.allowed)){const p=(await this.query('SELECT normalized_text,segments FROM source_payloads WHERE source_version_id=$1',[v.id]))[0];Object.assign(v,p);}}
 return versions;}
 async origins(version){return this.query(`SELECT r.*,io.relationship,io.counts_for_independence,io.rationale AS declaration FROM item_origins io JOIN reporting_origins r ON r.id=io.origin_id WHERE io.source_version_id=$1 ORDER BY r.origin_key`,[version.id]);}
 async eligible(version){if(!version.metadata.item||!['needs_review','eligible'].includes(version.eligibility))return [{allowed:false,reasons:['VERSION_NOT_EVIDENCE']}];const row=await this.policy(version.metadata.item);const decisions=['extract','synthesis'].map(p=>decide(row,version.metadata.item,p));if(row?.id!==version.rights_grant_id)decisions.push({allowed:false,reasons:['GRANT_SUPERSEDED']});if(new Date(version.retention_until)<=new Date())decisions.push({allowed:false,reasons:['RETENTION_EXPIRED']});return decisions;}
 async inspectPackage(digest){return this.transaction(()=>this.checkPackage(digest));}
 async checkPackage(digest){
  const pack=(await this.query('SELECT * FROM evidence_packages WHERE digest=$1',[digest]))[0];if(!pack)throw Error('PACKAGE_MISSING');const errors=[];
  if(pack.manifest.tombstone)return {digest,usable:false,errors:['PACKAGE_REDACTED'],editorialApproved:false,publicationAllowed:false};
  if(hash(canonical(pack.manifest))!==digest)errors.push('DIGEST_MISMATCH');
  const cluster=(await this.query('SELECT revision FROM story_clusters WHERE id=$1',[pack.cluster_id]))[0];if(cluster.revision!==pack.cluster_revision)errors.push('CLUSTER_CHANGED');
  const current=await this.currentVersions();errors.push(...locatorErrors(pack.manifest,current));for(const s of pack.manifest.sources){const v=current.find(v=>v.id===s.id);if(!v){errors.push('SOURCE_SUPERSEDED');continue;}if((await this.eligible(v)).some(d=>!d.allowed))errors.push('RIGHTS_INVALID');if(canonical(await this.origins(v))!==canonical(s.origins))errors.push('ORIGIN_CHANGED');}
  return {digest,usable:!errors.length,errors:[...new Set(errors)],editorialApproved:false,publicationAllowed:false};
 }
}
