import { createHash } from 'node:crypto';
import { draftSchema, publicArticleSchema, type Draft, type Variant } from '../../contracts/src/index.js';

export function digest(draft:Draft):string {
  // Explicit approval unit excludes mutable lifecycle and review log.
  const {id,versionId,version,slug,topic,headline,deck,headerClaimIds,cutoff,risk,correction,sources,claims,variants,leadMedia,inlineMedia}=draft;
  return createHash('sha256').update(JSON.stringify({id,versionId,version,slug,topic,headline,deck,headerClaimIds,cutoff,risk,correction,sources,claims,variants,leadMedia,inlineMedia})).digest('hex');
}
export function validateDraft(input:unknown,now=new Date()):string[]{
  const parsed=draftSchema.safeParse(input);if(!parsed.success)return ['INVALID_CONTRACT'];const d=parsed.data;
  const errors=new Set<string>();const sourceMap=new Map(d.sources.map(s=>[s.id,s]));const claimMap=new Map(d.claims.map(c=>[c.id,c]));
  if(sourceMap.size!==d.sources.length||new Set(d.sources.map(s=>s.ordinal)).size!==d.sources.length)errors.add('DUPLICATE_SOURCE');
  if(claimMap.size!==d.claims.length)errors.add('DUPLICATE_CLAIM');
  const eligible=d.sources.filter(s=>s.role==='evidence'&&s.eligible&&s.rights.sourceApproved&&s.rights.model&&s.rights.synthesis&&!s.rights.revoked&&Date.parse(s.rights.expiresAt)>now.getTime());
  const eligibleIds=new Set(eligible.map(s=>s.id));
  if(new Set(eligible.map(s=>s.itemId)).size<3)errors.add('INSUFFICIENT_ITEMS');
  if(new Set(eligible.filter(s=>s.originVerified).map(s=>s.originId)).size<2)errors.add('INSUFFICIENT_ORIGINS');
  for(const s of d.sources){
    if(s.role!=='related'&&(!s.rights.sourceApproved||!s.rights.model||!s.rights.synthesis||s.rights.revoked||Date.parse(s.rights.expiresAt)<=now.getTime()))errors.add('RIGHTS_INVALID');
    if(s.locator&&(!s.locator.validated||s.locator.startMs>=s.locator.endMs||s.locator.endMs>s.locator.durationMs))errors.add('INVALID_LOCATOR');
  }
  for(const c of d.claims){if(!c.reviewed||!c.sourceIds.some(s=>eligibleIds.has(s)))errors.add('UNREVIEWED_CLAIM');for(const sid of c.sourceIds)if(!sourceMap.has(sid))errors.add('UNKNOWN_SOURCE');}
  for(const cid of d.headerClaimIds)if(!claimMap.has(cid))errors.add('HEADER_CLAIM_MISSING');
  for(const blocks of Object.values(d.variants))for(const b of blocks){
    for(const cid of b.claimIds){const claim=claimMap.get(cid);if(!claim)errors.add('UNKNOWN_CLAIM');else if(!b.sourceIds.some(s=>claim.sourceIds.includes(s)&&eligibleIds.has(s)))errors.add('CLAIM_CITATION_MISMATCH');}
    for(const sid of b.sourceIds)if(!sourceMap.has(sid)||!b.claimIds.some(cid=>claimMap.get(cid)?.sourceIds.includes(sid)))errors.add('INVALID_CITATION');
  }
  return [...errors];
}
export function publicationBlockers(draft:Draft,now=new Date()):string[]{
  const errors=validateDraft(draft,now);const current=digest(draft);const latest=new Map<string,Draft['reviews'][number]>();
  for(const review of [...draft.reviews].sort((a,b)=>a.sequence-b.sequence))if(review.digest===current)latest.set(review.reviewerId,review);
  if([...latest.values()].filter(r=>r.decision==='approve').length<(draft.risk==='high'?2:1))errors.push('CURRENT_APPROVALS_REQUIRED');
  return errors;
}
export function publicProjection(draft:Draft,variant:Variant){
  if(draft.state!=='published')return null;
  if(publicationBlockers(draft).length)return null;
  return publicArticleSchema.parse({...draft,leadMedia:draft.leadMedia?.displayPermitted?draft.leadMedia:null,inlineMedia:draft.inlineMedia.filter(m=>m.media.displayPermitted),variant,blocks:draft.variants[variant],sources:draft.sources.filter(s=>s.role!=='related'),disclosure:'Fictional development fixture. AI-assisted writing; simulated editorial review, not real publication.'});
}

export interface PublicationRepository { get(slug:string):Draft|undefined; list():Draft[]; }
// Deterministic disposable adapter only. No DB atomicity or authenticated review is implied.
export class FixtureRepository implements PublicationRepository {
  private records=new Map<string,Draft>(); private keys=new Map<string,{fingerprint:string;result:Draft}>();private locks=new Map<string,number>();
  constructor(drafts:Draft[]){for(const draft of drafts)this.records.set(draft.slug,structuredClone(draft));}
  get(slug:string){const d=this.records.get(slug);return d?structuredClone(d):undefined;}
  list(){return [...this.records.values()].map(d=>structuredClone(d));}
  publish(slug:string,expectedDigest:string,expectedLock:number,key:string,capability:string,now:Date){
    if(capability!=='publisher')throw new Error('FORBIDDEN');
    const fingerprint=JSON.stringify([slug,expectedDigest,expectedLock]);const previous=this.keys.get(key);if(previous){if(previous.fingerprint!==fingerprint)throw new Error('IDEMPOTENCY_CONFLICT');return structuredClone(previous.result);}
    const d=this.records.get(slug);if(!d)throw new Error('NOT_FOUND');
    if(d.state!=='in_review'||digest(d)!==expectedDigest||(this.locks.get(slug)||0)!==expectedLock)throw new Error('STALE_VERSION');
    const errors=publicationBlockers(d,now);if(errors.length)throw new Error(errors.join(','));
    const result={...structuredClone(d),state:'published' as const};this.records.set(slug,result);this.locks.set(slug,expectedLock+1);this.keys.set(key,{fingerprint,result});return structuredClone(result);
  }
  withdraw(slug:string){const d=this.records.get(slug);if(d){d.state='withdrawn';this.locks.set(slug,(this.locks.get(slug)||0)+1);}}
}
