import { createHash, randomBytes } from 'node:crypto';
import type { Interests } from '../../contracts/src/interests.js';
import type { PublicArticle } from '../../contracts/src/index.js';
import { publicProjection,type PublicationRepository } from './publication.js';
import { relevance,taxonomyRevision } from './taxonomy.js';
import { AccessError } from './identity.js';
import { deskSlug } from './discovery.js';
import assertions from '../../test-fixtures/reader-subjects.json' with {type:'json'};
// Exact authored revision associations; a corrected/new revision does not inherit tags silently.
export function subjects(a:PublicArticle){
 if(!a.fixture)return a.topic==='Science'?['agg:topic:science-and-space']:a.topic==='World'?['agg:topic:world-affairs']:[];
 return assertions.find(x=>x.articleId===a.id&&x.versionId===a.versionId)?.material||[];
}
type Reason=NonNullable<ReturnType<typeof relevance>>;
interface Snapshot {scope:string;catalogue:string;owner:string;mode:string;revision:number;cutoff:string;expires:number;slots:{id:string;version:string;reason:Reason|null}[];}
const snapshots=new Map<string,Snapshot>();
export function edition(repo:PublicationRepository,input:{token?:string;page?:number;mode?:string;owner?:string;interests?:Interests;q?:string;topic?:string;available?:PublicArticle[];collection?:string}){
 const q=(input.q??'').trim().toLocaleLowerCase('en'),topic=input.topic??'';
 if(q.length>120||topic.length>120)throw new AccessError(422,'INVALID_INPUT');
 const scope=JSON.stringify([q,topic,input.collection||'sample']),terms=q.split(/\s+/).filter(Boolean);
 const page=input.page??1,mode=input.mode??'editorial',owner=input.owner??'public';if(!Number.isInteger(page)||page<1||page>100||!['editorial','following'].includes(mode))throw new AccessError(422,'INVALID_INPUT');
 if(mode==='following'&&!input.interests)throw new AccessError(401,'UNAUTHENTICATED');
 const now=Date.now(),available=input.available??repo.list().map(d=>publicProjection(d,'brief')).filter(a=>a!==null);
 const catalogue=createHash('sha256').update(JSON.stringify([taxonomyRevision,available.map(a=>[a.id,a.versionId]).sort()])).digest('hex');
 let token=input.token,s=token?snapshots.get(token):undefined;
 if(token&&(!s||s.expires<now))throw new AccessError(410,'EDITION_EXPIRED');
 if(s&&(s.owner!==owner||s.mode!==mode||s.scope!==scope))throw new AccessError(403,'FORBIDDEN');
 if(!s){const ranked=available.filter(a=>(!topic||deskSlug(a.topic)===topic||!!relevance([{target:topic,action:'follow'}],subjects(a)))&&terms.every(t=>`${a.headline} ${a.deck} ${a.blocks.map(b=>b.text).join(' ')}`.toLocaleLowerCase('en').includes(t))).map(a=>({a,reason:mode==='following'?relevance(input.interests!.rules,subjects(a)):null})).filter(x=>mode!=='following'||x.reason&&!input.interests!.hiddenStories.includes(x.a.id));
 ranked.sort((a,b)=>(b.reason?.specificity??0)-(a.reason?.specificity??0)||b.a.publishedAt.localeCompare(a.a.publishedAt)||a.a.id.localeCompare(b.a.id));
 const seen=new Set<string>();s={scope,catalogue,owner,mode,revision:input.interests?.revision??0,cutoff:new Date(now).toISOString(),expires:now+3600000,slots:ranked.filter(x=>{if(seen.has(x.a.id))return false;seen.add(x.a.id);return true;}).map(x=>({id:x.a.id,version:x.a.versionId,reason:x.reason}))};
 for(const [id,v] of snapshots)if(v.expires<now)snapshots.delete(id);if(snapshots.size>=128)snapshots.delete(snapshots.keys().next().value!);token=randomBytes(24).toString('hex');snapshots.set(token,s);
 }
 return {data:s.slots.slice((page-1)*6,page*6).map(slot=>{const article=available.find(a=>a.id===slot.id&&a.versionId===slot.version);return article?{article,reason:slot.reason,status:'available'}:{article:null,reason:null,status:'unavailable'};}),meta:{q,topic,token,page,pages:Math.max(1,Math.ceil(s.slots.length/6)),total:s.slots.length,cutoff:s.cutoff,taxonomyRevision,newEditionAvailable:s.catalogue!==catalogue||s.revision!==(input.interests?.revision??0),mode}};
}
