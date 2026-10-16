import { createHash } from 'node:crypto';
import { createReadStream } from 'node:fs';
import { readFile, mkdir, writeFile, rename, open, unlink, stat, realpath } from 'node:fs/promises';
import { resolve, dirname, sep } from 'node:path';
import { digest, publicProjection, publicationBlockers, type PublicationRepository } from '../../domain/src/publication.js';
import type { Programme } from '../../contracts/src/programme.js';

export const programmeRoot=resolve(process.cwd(),'.cache/programmes');
export const hash=(data:string|Buffer)=>createHash('sha256').update(data).digest('hex');
// Trusted local content-addressed storage only. Recheck path/stat on every request;
// changed size/mtime/ctime/inode invalidates byte verification, never source eligibility.
const verifiedFiles=new Map<string,string>();
export async function atomicJson(path:string,value:unknown){await mkdir(dirname(path),{recursive:true});const temp=`${path}.${process.pid}.tmp`;await writeFile(temp,JSON.stringify(value,null,2));await rename(temp,path);}
export function eligible(programme:Programme,repo:PublicationRepository){
  if(programme.kind==='clip'&&(!programme.videoRendition||programme.durationMs<30000||programme.durationMs>120000))return false;
  if(programme.schemaVersion!==1||programme.status!=='ready'||!programme.revisions.length||!programme.segments.length)return false;
  if(programme.mediaTreatment){
    if(programme.kind!=='broadcast'||!['narration_over_visual','clip_then_comment'].includes(programme.mediaTreatment))return false;
    if(programme.mediaTreatment==='narration_over_visual'&&programme.segments.some(s=>s.speakerId==='clip'))return false;
    if(programme.mediaTreatment==='clip_then_comment'&&!programme.segments.some((s,i)=>s.speakerId==='clip'&&s.visual?.kind==='video'&&s.visual.treatment==='clip_then_comment'&&programme.segments.slice(i+1).some(next=>next.speakerId==='ada'||next.speakerId==='eli')))return false;
  }
  if(programme.scenePlan&&(programme.scenePlan.version!==1||programme.scenePlan.style!=='attributed-text'||programme.kind!=='broadcast'||!programme.mediaTreatment))return false;
  for(const revision of programme.revisions){const draft=repo.get(revision.slug);if(!draft||!publicProjection(draft,'standard')||publicationBlockers(draft).length||draft.versionId!==revision.versionId||digest(draft)!==revision.digest)return false;}
  let end=0;
  for(const segment of programme.segments){const draft=repo.get(segment.articleSlug);if(!draft||draft.versionId!==segment.articleVersionId||segment.startMs!==end||segment.endMs<=segment.startMs||!Number.isFinite(segment.endMs)||!segment.text.trim()||!segment.blockIds.length||!segment.claimIds.length||!segment.sourceIds.length)return false;
    const blocks=[...draft.variants.standard,...draft.variants.brief];if(segment.blockIds.some(id=>!blocks.some(b=>b.id===id))||segment.claimIds.some(id=>!draft.claims.some(c=>c.id===id))||segment.sourceIds.some(id=>!draft.sources.some(s=>s.id===id&&s.role!=='related')))return false;
    if(programme.scenePlan){const s=segment.scene;if(!s||!['opening','medium','wide','shoulder','image','clip','evidence','recap'].includes(s.camera)||typeof s.heading!=='string'||s.heading.length>200||typeof s.body!=='string'||s.body.length>2000||typeof s.attribution!=='string'||s.attribution.length>500)return false;const g=s.gesture;if(g&&(!['introduction','emphasis','contrast','evidence','closing'].includes(g.gesture)||![g.start,g.peak,g.end,g.intensity].every(Number.isFinite)||g.start<0||g.peak<=g.start||g.end<=g.peak||g.end>(segment.endMs-segment.startMs)/1000||g.intensity<0||g.intensity>1))return false;}
    if(segment.claimIds.some(id=>!draft.claims.find(c=>c.id===id)?.sourceIds.some(id=>segment.sourceIds.includes(id))))return false;
    if(segment.visual&&(!/^\/api\/v1\/programme-assets\/[a-f0-9]{64}$/.test(segment.visual.url)||!programme.assets.some(a=>segment.visual!.url.endsWith(a.id)&&a.permissions.transform&&a.permissions.broadcast&&a.permissions.display)))return false;
    end=segment.endMs;
  }
  if(programme.videoRendition){const v=programme.videoRendition;
    if(!['broadcast','clip'].includes(programme.kind)||!/^[a-f0-9]{64}$/.test(v.renditionKey)||v.durationMs!==programme.durationMs||v.width!==(programme.kind==='clip'?720:1280)||v.height!==(programme.kind==='clip'?1280:720)||v.fps!==30)return false;
    for(const [url,type] of [[v.url,'video'],[v.posterUrl,'image'],[v.captionUrl,'captions'],[v.sourceMapUrl,'source-map']]){
      if(!url||!/^\/api\/v1\/programme-assets\/[a-f0-9]{64}$/.test(url))return false;
      const a=programme.assets.find(a=>url.endsWith(a.id));if(!a||a.type!==type||!a.permissions.transform||!a.permissions.broadcast||!a.permissions.display)return false;
      if(type==='video'&&(!a.permissions.audio||a.mime!=='video/mp4'))return false;
    }
  }
  return end===programme.durationMs&&programme.assets.every(a=>a.availability==='available'&&a.permissions.display&&a.permissions.broadcast&&(a.type!=='audio'||a.permissions.audio));
}
export async function programmes(repo:PublicationRepository):Promise<Programme[]>{
  try{const index=JSON.parse(await readFile(resolve(programmeRoot,'index.json'),'utf8')) as string[];if(!Array.isArray(index)||index.length>100)return [];
    let derivatives:Record<string,string>={};try{derivatives=JSON.parse(await readFile(resolve(programmeRoot,'derivatives','index.json'),'utf8'));}catch{/* Audio remains available without prepared video. */}
    const output:Programme[]=[];for(const key of index){if(!/^[a-f0-9]{64}$/.test(key))continue;try{let p=JSON.parse(await readFile(resolve(programmeRoot,'manifests',`${key}.json`),'utf8')) as Programme;
      if(!eligible(p,repo)||!(await Promise.all(p.assets.map(a=>verifiedAsset(p,a.id,true)))).every(Boolean))continue;
      const derivative=derivatives[key];if(derivative&&/^[a-f0-9]{64}$/.test(derivative)){try{const bytes=await readFile(resolve(programmeRoot,'derivatives',derivative+'.json'));if(hash(bytes)!==derivative)throw Error('CORRUPT_DERIVATIVE');const rendered=JSON.parse(bytes.toString('utf8')) as Programme;
        // The prepared video may add assets, never replace its approved base content or timing.
        const {videoRendition:_video,assets:_assets,...base}=rendered;const {assets:baseAssets,...expected}=p;
        void _video;void _assets;
        if(JSON.stringify(base)!==JSON.stringify(expected)||!baseAssets.every(a=>rendered.assets.some(b=>JSON.stringify(a)===JSON.stringify(b)))||!rendered.videoRendition||!eligible(rendered,repo)||!(await Promise.all(rendered.assets.map(a=>verifiedAsset(rendered,a.id,true)))).every(Boolean))throw Error('INVALID_DERIVATIVE');p=rendered;
      }catch{/* Failed/stale video is omitted; current validated audio/transcript remain usable. */}}
      output.push(p);
    }catch{/* Missing/corrupt manifests are unavailable. */}}return output;
  }catch{return [];}
}
export async function verifiedAsset(programme:Programme,id:string,metadataOnly=false){
  const asset=programme.assets.find(a=>a.id===id);if(!asset||!/^[a-f0-9]{64}\.(wav|webm|svg|png|mp4|vtt|json)$/.test(asset.storageKey))return null;
  const extension=asset.storageKey.split('.').at(-1)!;const mime:Record<string,string>={wav:'audio/wav',webm:'video/webm',svg:'image/svg+xml',png:'image/png',mp4:'video/mp4',vtt:'text/vtt; charset=utf-8',json:'application/json'};
  if(asset.id!==asset.hash||asset.storageKey!==`${asset.hash}.${extension}`||asset.mime!==mime[extension])return null;
  try{const root=await realpath(resolve(programmeRoot,'assets'));const path=await realpath(resolve(root,asset.storageKey));if(!path.startsWith(root+sep))return null;
    const info=await stat(path);if(!info.isFile()||info.size!==asset.bytes)return null;
    const stamp=[asset.hash,info.size,info.mtimeMs,info.ctimeMs,info.ino].join(':');
    if(metadataOnly){if(verifiedFiles.get(path)!==stamp){const digest=createHash('sha256');for await(const chunk of createReadStream(path))digest.update(chunk);if(digest.digest('hex')!==asset.hash){verifiedFiles.delete(path);return null;}const after=await stat(path);if(after.size!==info.size||after.mtimeMs!==info.mtimeMs||after.ctimeMs!==info.ctimeMs)return null;if(verifiedFiles.size>=256)verifiedFiles.delete(verifiedFiles.keys().next().value!);verifiedFiles.set(path,stamp);}return {asset,path,stamp,data:Buffer.alloc(0)};}
    const data=await readFile(path);if(hash(data)!==asset.hash)return null;return {asset,path,stamp,data};
  }catch{return null;}
}
// Single-machine trusted bootstrap queue. Dead PID recovery is deliberate; no elapsed lease can
// steal an active long render. PostgreSQL processing_jobs integration remains a separate boundary.
export async function claim(key:string){
  if(!/^[a-f0-9]{64}$/.test(key))throw Error('BAD_JOB_KEY');await mkdir(resolve(programmeRoot,'jobs'),{recursive:true});const path=resolve(programmeRoot,'jobs',`${key}.lock`);
  for(let attempt=0;attempt<2;attempt++){try{const file=await open(path,'wx');await file.writeFile(JSON.stringify({pid:process.pid,startedAt:new Date().toISOString()}));await file.close();return async()=>{await unlink(path).catch(()=>{});};}
    catch(error){if((error as NodeJS.ErrnoException).code!=='EEXIST')throw error;const owner=JSON.parse(await readFile(path,'utf8'));let alive=true;try{process.kill(owner.pid,0);}catch(e){alive=(e as NodeJS.ErrnoException).code!=='ESRCH';}if(alive)return null;await unlink(path).catch(()=>{});}}
  return null;
}
export function parseRange(value:string|undefined,length:number):{start:number;end:number}|null|false {
  if(!value)return null;const match=/^bytes=(\d*)-(\d*)$/.exec(value);if(!match||(!match[1]&&!match[2]))return false;
  const start=match[1]?Number(match[1]):Math.max(0,length-Number(match[2]));let end=match[2]&&match[1]?Number(match[2]):length-1;
  if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||start>=length||end<start)return false;end=Math.min(end,length-1);return {start,end};
}

