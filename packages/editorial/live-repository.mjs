import {Repository} from './repository.mjs';
import {Buffer} from 'node:buffer';
import {hash,canonical} from './input.mjs';
import {liveDecision} from './live-policy.mjs';
import {randomUUID} from 'node:crypto';
export class LiveRepository extends Repository {
 async importPublisherItem(source,item,observation){
  return this.transaction(async()=>{
   await this.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[source.slug+':'+item.key]);
   const grant=(await this.query(`SELECT g.*,s.status source_status,e.status endpoint_status,e.id endpoint_id FROM rights_grants g JOIN sources s ON s.id=g.source_id JOIN source_endpoints e ON e.source_id=s.id WHERE s.slug=$1 AND g.grant_key=$2 AND e.endpoint_url=$3 ORDER BY g.revision DESC LIMIT 1`,[source.slug,source.grantKey,source.feed]))[0];
   const decisions=['retrieve','store','display'].map(p=>liveDecision(grant,item,p));
   if(decisions.some(d=>!d.allowed)){
    // A known item changed beyond its exact reviewed representation. Keep only
    // an availability observation, never the unlicensed replacement body.
    if(grant){const known=(await this.query('SELECT id FROM source_items WHERE source_id=$1 AND provider_item_key=$2',[grant.source_id,item.key]))[0];
     if(known)await this.insert('source_observations',{item_id:known.id,source_version_id:null,endpoint_id:grant.endpoint_id,http_status:observation.status,requested_url:source.feed,final_url:observation.url,availability:'denied',operation_key:'live:'+randomUUID()});
    }
    return {url:item.url,status:'denied',decisions};
   }
   let original=(await this.query('SELECT * FROM source_items WHERE source_id=$1 AND provider_item_key=$2',[grant.source_id,item.key]))[0];
   if(!original)original=await this.insert('source_items',{source_id:grant.source_id,provider_item_key:item.key,kind:'article',canonical_url:item.url});
   if(original.canonical_url!==item.url)throw Error('CANONICAL_IDENTITY_CHANGED');
   const context=hash(canonical({url:item.url,title:item.title,author:item.author,published:item.publishedAt,topic:source.topic,parser:'live-feed-text/2'}));
   let version=(await this.query('SELECT * FROM source_item_versions WHERE item_id=$1 AND content_hash=$2 AND rights_grant_id=$3 AND representation_context_hash=$4',[original.id,item.contentHash,grant.id,context]))[0];
   if(!version){
    const revision=Number((await this.query('SELECT coalesce(max(revision),0)+1 n FROM source_item_versions WHERE item_id=$1',[original.id]))[0].n);
    version=await this.insert('source_item_versions',{item_id:original.id,source_id:grant.source_id,rights_grant_id:grant.id,revision,title:item.title,author:item.author,source_published_at:item.publishedAt,fetched_url:item.url,language:'en',content_hash:item.contentHash,normalized_hash:hash(item.body),extraction_version:'live-feed-text/2',representation_context_hash:context,eligibility:'eligible',retention_until:new Date(Math.min(new Date(grant.ends_at).getTime(),Date.now()+grant.raw_retention_days*86400000)),metadata:JSON.stringify({readerLane:'publisher-original',itemRightsReviewed:true,reviewerKind:'agent-license-review',humanEditorialApproval:false,topic:source.topic,transformation:'Text extracted from publisher feed; images/embeds omitted; not AI synthesis'})});
    await this.insert('source_payloads',{source_version_id:version.id,raw_bytes:Buffer.from(item.rawHtml),normalized_text:item.body,segments:'[]'});
   }
   await this.insert('source_observations',{item_id:original.id,source_version_id:version.id,endpoint_id:grant.endpoint_id,http_status:observation.status,requested_url:source.feed,final_url:observation.url,etag:observation.headers.etag||null,last_modified:observation.headers['last-modified']||null,availability:'available',operation_key:'live:'+randomUUID()});
   await this.insert('audit_events',{actor_token:'machine:local-permitted-source-runner',action:'source.import',resource_type:'source_version',resource_id:version.id,reason:'Attributed publisher text; scoped public-license review, no synthesis/media/publication approval',correlation_id:randomUUID()});
   if(['store','display'].some(p=>!liveDecision(grant,item,p).allowed))throw Error('RIGHTS_EXPIRED_BEFORE_COMMIT');
   return {url:item.url,status:'imported',itemId:original.id,versionId:version.id};
  });
 }
}

