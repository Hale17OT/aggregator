// Trusted single-machine fixture production. Never called by an HTTP route.
import {readFile,writeFile,mkdir,statfs} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {createFixtureRepository} from '../packages/test-fixtures/src/index.ts';
import {publicationBlockers} from '../packages/domain/src/publication.ts';
import {programmeRoot,hash,atomicJson,claim,eligible,verifiedAsset} from '../packages/programme/src/store.ts';
import {speech,wave,decodeWave,modelRevision,voices} from '../packages/programme/local-speech.mjs';
const arg=(name,fallback)=>{const i=process.argv.indexOf('--'+name);return i<0?fallback:process.argv[i+1];};
const configPath=resolve(arg('config','docs/next-build/programme-delivery.json'));
if(configPath!==resolve('docs/next-build/programme-delivery.json'))throw Error('CONFIG_NOT_ALLOWLISTED');
const config=JSON.parse(await readFile(configPath,'utf8')),only=arg('id','all'),repo=createFixtureRepository();
const allow=new Set(['alderwick-evening-shuttle','alderwick-rain-gardens','alderwick-river-thermometers']);
if(config.schemaVersion!==1||config.fixtureOnly!==true||!Array.isArray(config.programmes)||config.programmes.length>12)throw Error('INVALID_DELIVERY_CONFIG');
const index=JSON.parse(await readFile(join(programmeRoot,'index.json'),'utf8')),bases=[];
for(const key of index){if(!/^[a-f0-9]{64}$/.test(key))throw Error('BAD_BASE_INDEX');const p=JSON.parse(await readFile(join(programmeRoot,'manifests',key+'.json'),'utf8'));bases.push(p);}
const recipes=config.programmes.filter(r=>only==='all'||r.id===only);if(!recipes.length)throw Error('UNKNOWN_RECIPE');
for(const r of recipes){if(!/^[a-z0-9-]{3,90}$/.test(r.id)||!['radio','broadcast'].includes(r.kind)||!['full','solo','duo'].includes(r.variant)||typeof r.title!=='string'||r.title.length>160||!Array.isArray(r.stories)||!r.stories.length||r.stories.length>3||r.stories.some(s=>!allow.has(s)||!repo.get(s)||publicationBlockers(repo.get(s)).length))throw Error('INELIGIBLE_RECIPE');if(r.kind==='broadcast'&&(r.stories.length!==1||!['solo','duo'].includes(r.variant)||!['narration_over_visual','clip_then_comment'].includes(r.treatment)||r.panelStyle!=='attributed-text'))throw Error('INVALID_BROADCAST_RECIPE');}
const disk=await statfs(programmeRoot);if(disk.bavail*disk.bsize<2*1024**3)throw Error('INSUFFICIENT_WORKSPACE_SPACE');
await mkdir(join(programmeRoot,'assets'),{recursive:true});const results=[];
for(const recipe of recipes){
 const inputs=recipe.kind==='radio'?recipe.stories.map(slug=>bases.find(p=>p.programmeId===`radio-${slug}-full`)):[bases.find(p=>p.programmeId===recipe.sourceProgramme)];
 if(inputs.some(p=>!p||!eligible(p,repo)||p.articleSlugs.some(s=>!recipe.stories.includes(s))))throw Error('INVALID_OR_STALE_SOURCE_PROGRAMME');
 for(const p of inputs)for(const a of p.assets)if(!await verifiedAsset(p,a.id,true))throw Error('CORRUPT_SOURCE_ASSET');
 const key=hash(JSON.stringify({recipe,inputs:inputs.map(p=>p.renditionKey),modelRevision,voices,assembly:'delivery-v1',code:hash(await readFile(import.meta.filename)),speechCode:hash(await readFile('packages/programme/local-speech.mjs'))})),path=join(programmeRoot,'manifests',key+'.json');
 const unlock=await claim(key);if(!unlock)throw Error('DELIVERY_ALREADY_RUNNING');
 try{
  let programme;try{const old=JSON.parse(await readFile(path,'utf8'));if(eligible(old,repo)&&(await Promise.all(old.assets.map(a=>verifiedAsset(old,a.id,true)))).every(Boolean))programme=old;}catch{/* Recover incomplete job from immutable inputs. */}
  if(!programme){
   await atomicJson(join(programmeRoot,'jobs',key+'.json'),{key,status:'running',stage:'speech-and-scene-plan',pid:process.pid,id:recipe.id,updatedAt:new Date().toISOString()});
   let cursor=0;const pieces=[],segments=[],visualAssets=[];let reused=0,generated=0;
   if(recipe.kind==='radio')for(const base of inputs){const audio=base.assets.find(a=>a.type==='audio');const pcm=decodeWave((await verifiedAsset(base,audio.id)).data);pieces.push(pcm);for(const s of base.segments)segments.push({...s,id:`segment-${segments.length+1}`,startMs:s.startMs+cursor/24,endMs:s.endMs+cursor/24});cursor+=pcm.length;reused++;}
   else{
    const base=inputs[0],draft=repo.get(recipe.stories[0]);let selected=base.segments.map(s=>structuredClone(s));
    if(recipe.treatment==='narration_over_visual')selected=selected.filter(s=>s.speakerId!=='clip'&&!s.text.startsWith('The next clip is an original'));
    const seenBlocks=[];
    for(let i=0;i<selected.length;i++){
     const s=selected[i],block=draft.variants.standard.find(b=>s.blockIds.length===1&&b.id===s.blockIds[0]);
     if(block&&!seenBlocks.includes(block.id))seenBlocks.push(block.id);
     if(base.kind==='radio')s.speakerId=recipe.variant==='duo'&&(block?seenBlocks.indexOf(block.id)%2===1:i===selected.length-1)?'eli':'ada';
     const take=await speech(s.text,s.speakerId||'ada');if(take.reused)reused++;else generated++;s.id=`segment-${i+1}`;s.startMs=cursor/24;cursor+=take.samples.length;s.endMs=cursor/24;pieces.push(take.samples);
     s.mouthCues=take.cues.map(c=>({startMs:s.startMs+c.start*1000,endMs:Math.min(s.endMs,s.startMs+c.end*1000),value:['X','A'].includes(c.value)?'closed':['D','E'].includes(c.value)?'wide':'open'}));
     let camera=i===0?'opening':i===selected.length-1?'recap':'medium';
     if(recipe.treatment==='clip_then_comment'&&s.speakerId!=='clip')delete s.visual;
     if(s.visual){s.visual.offsetMs=s.startMs;s.visual.treatment=recipe.treatment;camera=s.shot==='figure'?'evidence':s.visual.kind==='video'?'clip':'image';for(const a of base.assets.filter(a=>s.visual.url.endsWith(a.id)))if(!visualAssets.some(v=>v.id===a.id))visualAssets.push(a);}
     else if(block&&i>0&&selected[i-1].blockIds[0]!==s.blockIds[0])camera='shoulder';
     const seconds=(s.endMs-s.startMs)/1000;
     s.scene={camera,heading:block?.heading||draft.headline,body:s.text.match(/[^.!?]+[.!?]+|[^.!?]+$/)?.[0]?.trim()||s.text,attribution:s.sourceIds.map(id=>{const source=draft.sources.find(source=>source.id===id);return `[${source.ordinal}] ${source.publisher}`;}).join(' · '),gesture:seconds>3?{gesture:i===0?'introduction':i===selected.length-1?'closing':block?'evidence':'emphasis',start:seconds*.15,peak:seconds*.35,end:seconds*.65,intensity:.4}:undefined};
     segments.push(s);
    }
   }
   if(process.argv.includes('--fail-before-ready'))throw Error('INJECTED_FAILURE_BEFORE_READY');
   const samples=new Float32Array(cursor);let offset=0;for(const part of pieces){samples.set(part,offset);offset+=part.length;}const bytes=wave(samples),id=hash(bytes),storageKey=id+'.wav';await writeFile(join(programmeRoot,'assets',storageKey),bytes,{flag:'wx'}).catch(async e=>{if(e.code!=='EEXIST'||hash(await readFile(join(programmeRoot,'assets',storageKey)))!==id)throw e;});
   const audio={id,hash:id,storageKey,type:'audio',mime:'audio/wav',bytes:bytes.length,durationMs:cursor/24,sampleRate:24000,sampleCount:cursor,availability:'available',permissions:{display:true,transform:true,audio:true,broadcast:true},provenance:'Original fictional fixture; local cached or generated speech, no external calls',engine:'Kokoro 1.2.1',voice:recipe.variant==='duo'?'af_heart / am_michael':'af_heart',modelRevision};
   const revisions=recipe.stories.map(slug=>inputs.flatMap(p=>p.revisions).find(r=>r.slug===slug));
   programme={schemaVersion:1,programmeId:recipe.id,kind:recipe.kind,variant:recipe.variant,title:recipe.title,status:'ready',language:'en',durationMs:cursor/24,audioUrl:'/api/v1/programme-assets/'+id,articleSlugs:recipe.stories,chapters:recipe.stories.map(slug=>{const parts=segments.filter(s=>s.articleSlug===slug);return{articleSlug:slug,title:repo.get(slug).headline,startMs:parts[0].startMs,endMs:parts.at(-1).endMs};}),segments,sources:inputs.flatMap(p=>p.sources).filter((s,i,a)=>a.findIndex(t=>t.id===s.id&&t.articleSlug===s.articleSlug)===i),syntheticDisclosure:'Fictional reporting. Local synthetic voices and original animated presenters, not photorealistic people. Attributed text scenes are evidence summaries, not location footage.',scriptDigest:hash(JSON.stringify(segments)),renditionKey:key,revisions,assets:[audio,...visualAssets],...(recipe.kind==='broadcast'?{mediaTreatment:recipe.treatment,scenePlan:{version:1,style:'attributed-text'}}:{})};
   if(!eligible(programme,repo)||!(await Promise.all(programme.assets.map(a=>verifiedAsset(programme,a.id,true)))).every(Boolean))throw Error('INELIGIBLE_BEFORE_READY');await atomicJson(path,programme);results.push({id:recipe.id,key,reused,generated,durationMs:programme.durationMs});
  }else results.push({id:recipe.id,key,cached:true,durationMs:programme.durationMs});
  const releaseIndex=await claim(hash('programme-delivery-index'));if(!releaseIndex)throw Error('DELIVERY_INDEX_BUSY');try{const current=JSON.parse(await readFile(join(programmeRoot,'index.json'),'utf8')),next=[];for(const oldKey of current){const p=JSON.parse(await readFile(join(programmeRoot,'manifests',oldKey+'.json'),'utf8'));if(p.programmeId!==recipe.id)next.push(oldKey);}next.push(key);await atomicJson(join(programmeRoot,'index.json'),next);}finally{await releaseIndex();}
  await atomicJson(join(programmeRoot,'jobs',key+'.json'),{key,status:'ready',stage:recipe.kind==='radio'?'audio-ready':'audio-and-scene-ready-video-pending',id:recipe.id,updatedAt:new Date().toISOString()});console.log(recipe.id+': audio ready');
 }catch(error){await atomicJson(join(programmeRoot,'jobs',key+'.json'),{key,status:'failed',id:recipe.id,errorCategory:error.message,updatedAt:new Date().toISOString()});throw error;}finally{await unlock();}
}
await atomicJson(resolve('docs/engineering/programme-delivery-preparation.json'),{at:new Date().toISOString(),config:configPath,providerCalls:0,concurrency:1,results});



