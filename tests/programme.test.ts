import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { createFixtureRepository } from '../packages/test-fixtures/src/index.js';
import { digest } from '../packages/domain/src/publication.js';
import { claim, eligible, parseRange } from '../packages/programme/src/store.js';
import type { Programme } from '../packages/contracts/src/programme.js';

function fixture(){const repo=createFixtureRepository();const d=repo.get('alderwick-evening-shuttle')!;const b=d.variants.standard[0]!;const p:Programme={schemaVersion:1,programmeId:'unit-only',kind:'radio',variant:'full',title:d.headline,status:'ready',language:'en',durationMs:1000,audioUrl:'/api/v1/programme-assets/'+'a'.repeat(64),articleSlugs:[d.slug],chapters:[{articleSlug:d.slug,title:d.headline,startMs:0,endMs:1000}],segments:[{id:'segment-1',articleSlug:d.slug,articleVersionId:d.versionId,blockIds:[b.id],claimIds:b.claimIds,sourceIds:b.sourceIds,speakerId:'ada',text:b.text,displayText:b.text,startMs:0,endMs:1000,shot:'presenter',mouthCues:[]}],sources:[],syntheticDisclosure:'Unit fixture',scriptDigest:'unit',renditionKey:'unit',revisions:[{slug:d.slug,versionId:d.versionId,digest:digest(d)}],assets:[{id:'a'.repeat(64),storageKey:'a'.repeat(64)+'.wav',type:'audio',mime:'audio/wav',hash:'a'.repeat(64),bytes:44,availability:'available',permissions:{display:true,transform:true,audio:true,broadcast:true},provenance:'unit',engine:'unit',voice:'unit',modelRevision:'unit'}]};return {repo,d,p};}
test('programme only remains eligible for current published reviewed rights digest',()=>{const {repo,p}=fixture();assert.equal(eligible(p,repo),true);repo.withdraw(p.articleSlugs[0]!);assert.equal(eligible(p,repo),false);const f=fixture();const changed={get:()=>({...f.d,version:2}),list:()=>[f.d]};assert.equal(eligible(f.p,changed),false);});
test('changed approval/model/source permission invalidates article and every derivative',async()=>{const {publicProjection}=await import('../packages/domain/src/publication.js');for(const field of ['sourceApproved','model','synthesis'] as const){const {d,p}=fixture();d.sources[0]!.rights[field]=false;const repo={get:()=>d,list:()=>[d]};assert.equal(publicProjection(d,'standard'),null);assert.equal(eligible(p,repo),false);}const {d,p}=fixture();d.sources[0]!.rights.revision++;const repo={get:()=>d,list:()=>[d]};assert.equal(publicProjection(d,'standard'),null);assert.equal(eligible(p,repo),false);});
test('programme rejects unknown citations, claims, blocks, gaps and wrong duration',()=>{for(const mutate of [(p:Programme)=>{p.segments[0]!.sourceIds=['injected'];},(p:Programme)=>{p.segments[0]!.claimIds=['injected'];},(p:Programme)=>{p.segments[0]!.blockIds=['injected'];},(p:Programme)=>{p.segments[0]!.startMs=1;},(p:Programme)=>{p.durationMs=2;}]){const {p,repo}=fixture();mutate(p);assert.equal(eligible(p,repo),false);}});
test('image display permission never implies transform/broadcast permission',()=>{const {p,repo}=fixture();p.segments[0]!.visual={url:p.audioUrl,kind:'image',credit:'unit',alt:'unit',offsetMs:0,treatment:'narration_over_visual'};p.assets[0]!.permissions.transform=false;assert.equal(eligible(p,repo),false);});
test('programme forbids remote and traversal visual URLs',()=>{for(const url of ['https://example.com/media','file:///secret','/api/v1/programme-assets/../../secret']){const {p,repo}=fixture();p.segments[0]!.visual={url,kind:'image',credit:'unit',alt:'unit',offsetMs:0,treatment:'narration_over_visual'};assert.equal(eligible(p,repo),false);}});
test('bounded single range parser rejects malformed or unsatisfiable ranges',()=>{assert.equal(parseRange(undefined,100),null);assert.deepEqual(parseRange('bytes=10-20',100),{start:10,end:20});assert.deepEqual(parseRange('bytes=95-',100),{start:95,end:99});assert.deepEqual(parseRange('bytes=-5',100),{start:95,end:99});for(const bad of ['bytes=100-','bytes=10-5','bytes=0-2,8-9','bytes=-','bytes=-0','bytes=Infinity-','bytes=9007199254740999-'])assert.equal(parseRange(bad,100),false);});
test('two local workers cannot claim one logical rendition; released job is retryable',async()=>{const key=randomBytes(32).toString('hex');const first=await claim(key);assert.ok(first);assert.equal(await claim(key),null);await first();const retry=await claim(key);assert.ok(retry);await retry();});
test('prepared treatment labels and scene plans cannot bypass content or gesture boundaries',()=>{
 const {p,repo}=fixture();p.kind='broadcast';p.variant='solo';p.mediaTreatment='narration_over_visual';p.scenePlan={version:1,style:'attributed-text'};
 p.segments[0]!.scene={camera:'shoulder',heading:'Fictional plan',body:p.segments[0]!.text,attribution:'[1] Fictional notice',gesture:{gesture:'evidence',start:.1,peak:.3,end:.8,intensity:.4}};
 assert.equal(eligible(p,repo),true);
 const clip=structuredClone(p);clip.mediaTreatment='clip_then_comment';assert.equal(eligible(clip,repo),false);
 const wrong=structuredClone(p);wrong.segments[0]!.speakerId='clip';assert.equal(eligible(wrong,repo),false);
 const bad=structuredClone(p);bad.segments[0]!.scene!.gesture!.end=2;assert.equal(eligible(bad,repo),false);
 const missing=structuredClone(p);delete missing.segments[0]!.scene;assert.equal(eligible(missing,repo),false);
 repo.withdraw(p.articleSlugs[0]!);assert.equal(eligible(p,repo),false);
});
test('prepared video, poster, captions and source map require bound local assets and distinct permissions',()=>{
  const {p,repo}=fixture();p.kind='broadcast';p.variant='solo';
  const urls=['b','c','d','e'].map(x=>'/api/v1/programme-assets/'+x.repeat(64));
  p.videoRendition={url:urls[0]!,posterUrl:urls[1]!,captionUrl:urls[2]!,sourceMapUrl:urls[3]!,renditionKey:'f'.repeat(64),durationMs:1000,width:1280,height:720,fps:30};
  const types=['video','image','captions','source-map'] as const,mimes=['video/mp4','image/png','text/vtt; charset=utf-8','application/json'],extensions=['mp4','png','vtt','json'];
  for(let i=0;i<4;i++){const id=urls[i]!.split('/').at(-1)!;p.assets.push({...p.assets[0]!,id,hash:id,type:types[i]!,mime:mimes[i]!,storageKey:id+'.'+extensions[i]});}
  assert.equal(eligible(p,repo),true);
  for(const mutate of [(q:Programme)=>{q.videoRendition!.captionUrl='https://example.test/caption';},(q:Programme)=>{q.videoRendition!.durationMs=999;},(q:Programme)=>{q.assets[1]!.permissions.audio=false;},(q:Programme)=>{q.assets[2]!.permissions.transform=false;},(q:Programme)=>{q.assets.pop();}]){const q=structuredClone(p);mutate(q);assert.equal(eligible(q,repo),false);}
  repo.withdraw(p.articleSlugs[0]!);assert.equal(eligible(p,repo),false);
});
