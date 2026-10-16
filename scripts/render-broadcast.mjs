/* global document, Image, Blob, clearTimeout */
import { readFile, writeFile, mkdir, readdir, stat } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createHash } from 'node:crypto';
import { spawn, spawnSync } from 'node:child_process';
import { once } from 'node:events';
import { performance } from 'node:perf_hooks';
import { Buffer } from 'node:buffer';
import { chromium } from 'playwright';
import { ART_REVISION, renderSvg, sceneAt } from '../packages/broadcast/scene.mjs';

const args=process.argv.slice(2),get=(key,fallback)=>{const i=args.indexOf('--'+key);return i<0?fallback:args[i+1];};
const mode=get('mode','benchmark'),variant=get('variant','duo'),programmeId=get('programme','newsroom-alderwick-'+variant),reportTag=args.includes('--programme')?programmeId:variant;if(!/^[a-z0-9-]{3,90}$/.test(programmeId))throw Error('BAD_PROGRAMME_ID');
if(!['benchmark','pilot','full','stills'].includes(mode)||!['solo','duo'].includes(variant))throw Error('BAD_RENDER_ARGUMENT');
if(mode==='full'&&!args.includes('--pilot-reviewed'))throw Error('INSPECT_PILOT_BEFORE_FULL_RENDER');
const root=resolve('.cache/programmes'),outRoot=resolve('.cache/broadcast/renders');await mkdir(outRoot,{recursive:true});
const hash=b=>createHash('sha256').update(b).digest('hex');
const index=JSON.parse(await readFile(join(root,'index.json'),'utf8'));let programme;
for(const key of index){const item=JSON.parse(await readFile(join(root,'manifests',key+'.json'),'utf8'));if(item.programmeId===programmeId)programme=item;}
if(!programme||programme.variant!==variant)throw Error('PROGRAMME_MISSING_OR_WRONG_VARIANT');
const voices={ada:'af_heart',eli:'am_michael',clip:'am_puck'};
for(const s of programme.segments){if(s.speakerId==='clip')continue;const key=hash(JSON.stringify([s.text,voices[s.speakerId],'1939ad2a8e416c0acfeecc08a694d14ef25f2231','1.2.1',1]));const raw=JSON.parse(await readFile(resolve('.cache/speech-sentences',key+'.json'),'utf8'));s.phonemeCues=raw.mouthCues.map(c=>({startMs:s.startMs+c.start*1000,endMs:Math.min(s.endMs,s.startMs+c.end*1000),value:c.value}));}
const sourceHash=hash(Buffer.concat([await readFile('packages/broadcast/scene.mjs'),await readFile('packages/broadcast/performance.mjs')]));const rendererHash=hash(await readFile('scripts/render-broadcast.mjs'));const identity=hash(JSON.stringify({base:programme.renditionKey,sourceHash,rendererHash,mode,start:get('start',null),duration:get('duration',null),fps:30,size:[1280,720],bakeCaptions:mode!=='full'&&!args.includes('--no-bake-captions')}));
const out=join(outRoot,identity);await mkdir(out,{recursive:true});
let completed;try{completed=JSON.parse(await readFile(join(out,'render.json'),'utf8'));}catch{/* Only incomplete render directories may be resumed. */}
if(completed){if(hash(await readFile(join(out,'programme.mp4')))!==completed.videoHash)throw Error('IMMUTABLE_RENDER_HASH_MISMATCH');await writeFile(resolve('.cache/broadcast',`latest-${reportTag}-${mode}.json`),JSON.stringify({out,identity,programmeId:programme.programmeId},null,2));console.log(JSON.stringify({cached:true,out,identity}));process.exit(0);}
const ffmpeg=get('ffmpeg',process.env.AGGREGATOR_FFMPEG||resolve('.cache/tools/ffmpeg/ffmpeg-9.0.2-essentials_build/bin/ffmpeg.exe'));
const ffprobe=get('ffprobe',ffmpeg.replace(/ffmpeg\.exe$/,'ffprobe.exe'));
function run(cmd,argv){const r=spawnSync(cmd,argv,{encoding:'utf8',windowsHide:true,maxBuffer:8*1024*1024});if(r.status!==0)throw Error(`TOOL_FAILED ${cmd}: ${r.stderr?.slice(-1800)}`);return r.stdout;}
const encoder=run(ffmpeg,['-version']).split('\n')[0];
const prepare=resolve('.cache/broadcast/prepared');await mkdir(prepare,{recursive:true});const picture=programme.assets.find(a=>a.mime==='image/png'),clip=programme.assets.find(a=>a.mime==='video/webm'),audio=programme.assets.find(a=>a.type==='audio');
const photo=picture?join(prepare,picture.id+'.jpg'):null;if(picture)try{await stat(photo);}catch{run(ffmpeg,['-v','error','-i',join(root,'assets',picture.storageKey),'-vf','scale=1280:-1','-q:v','3','-frames:v','1',photo]);}
const frames=clip?join(prepare,clip.id):null;if(frames)await mkdir(frames,{recursive:true});if(clip&&(await readdir(frames)).length<450)run(ffmpeg,['-v','error','-y','-i',join(root,'assets',clip.storageKey),'-vf','fps=30,scale=1280:720','-q:v','3',join(frames,'%05d.jpg')]);
const frameFiles=frames?(await readdir(frames)).filter(s=>s.endsWith('.jpg')).sort():[];const assetData=photo?{picture:'data:image/jpeg;base64,'+(await readFile(photo)).toString('base64')}:{};
const browser=await chromium.launch({channel:'chrome',headless:true});let page;try{page=await browser.newPage({viewport:{width:1280,height:720}});await page.setContent('<html><body style="margin:0"><canvas width="1280" height="720"></canvas></body></html>');}catch(error){await browser.close();throw error;}
async function bounded(work,label,ms=20000){let timer;try{return await Promise.race([work,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error(label)),ms);})]);}finally{clearTimeout(timer);}}
async function frame(time){const s=sceneAt(programme,time);let clipFrame;if(s.shot==='clip'){const position=Math.max(0,time-(s.segment.visual?.offsetMs||s.segment.startMs));const n=Math.min(frameFiles.length-1,Math.floor(position/1000*30));clipFrame='data:image/jpeg;base64,'+(await readFile(join(frames,frameFiles[n]))).toString('base64');}const svg=renderSvg(programme,time,{...assetData,clipFrame,bakeCaptions:mode!=='full'&&!args.includes('--no-bake-captions')});return page.evaluate(async svg=>{const image=new Image();const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml'}));try{image.src=url;await Promise.race([image.decode(),new Promise((_,reject)=>setTimeout(()=>reject(Error('SVG_DECODE_TIMEOUT')),10000))]);const canvas=document.querySelector('canvas');canvas.getContext('2d').drawImage(image,0,0,1280,720);return canvas.toDataURL('image/jpeg',.91).split(',')[1];}finally{image.src='';URL.revokeObjectURL(url);}},svg);}
let start=Number(get('start',mode==='pilot'?(args.includes('--programme')?'0':'60'):'0')),duration=Number(get('duration',mode==='benchmark'?'3':mode==='pilot'?String(Math.min(55,programme.durationMs/1000)):String(programme.durationMs/1000)));
if(!Number.isFinite(start)||!Number.isFinite(duration)||start<0||duration<=0||start+duration>programme.durationMs/1000+.001)throw Error('BAD_RENDER_RANGE');
const reviewTimes=[2,8,15,27,40,48,65,73,82,91,98,108,122,143,programme.durationMs/1000-.3];
await writeFile(join(out,'scene-programme.json'),JSON.stringify(programme,null,2));
const before=performance.now();let peakMemory=0;let ownedEncoder;
try{
 for(const t of (mode==='stills'?reviewTimes:[2,65,73,82,98]).filter(t=>t<programme.durationMs/1000)){const jpg=Buffer.from(await frame(t*1000),'base64');await writeFile(join(out,`frame-${String(t).replace('.','-')}.jpg`),jpg);}
 const jpg=Buffer.from(await frame(2500),'base64');await writeFile(join(out,'poster.jpg'),jpg);run(ffmpeg,['-v','error','-y','-i',join(out,'poster.jpg'),join(out,'poster.png')]);
 if(mode!=='stills'){
 const output=join(out,'programme.mp4');const ff=spawn(ffmpeg,['-hide_banner','-loglevel','error','-y','-f','image2pipe','-framerate','30','-vcodec','mjpeg','-i','pipe:0','-ss',String(start),'-i',join(root,'assets',audio.storageKey),'-map','0:v:0','-map','1:a:0','-t',String(duration),'-c:v','libx264','-preset','fast','-crf','19','-pix_fmt','yuv420p','-r','30','-c:a','aac','-b:a','160k','-ar','48000','-movflags','+faststart','-threads','2',output],{windowsHide:true,stdio:['pipe','ignore','pipe']});ownedEncoder=ff;let error='';ff.stderr.on('data',d=>{error+=d;});const ended=once(ff,'close');ff.stdin.on('error',()=>{});
 const count=Math.ceil(duration*30);for(let i=0;i<count;i++){if(Number(get('fail-after-frames','-1'))===i)throw Error('INJECTED_RENDER_FAILURE');const jpeg=Buffer.from(await bounded(frame((start+i/30)*1000),"FRAME_STALLED"),'base64');if(!ff.stdin.write(jpeg))await bounded(once(ff.stdin,'drain'),"ENCODER_STALLED");peakMemory=Math.max(peakMemory,process.memoryUsage().rss);if(i%300===0)console.log(`${variant}/${mode}: ${i}/${count} frames`);}ff.stdin.end();const [code]=await ended;if(code!==0)throw Error('ENCODE_FAILED '+error.slice(-1000));
 const probe=JSON.parse(run(ffprobe,['-v','error','-show_format','-show_streams','-of','json',output]));run(ffmpeg,['-v','error','-i',output,'-f','null','-']);
 const bytes=await readFile(output);const report={identity,artRevision:ART_REVISION,sourceHash,rendererHash,baseRenditionKey:programme.renditionKey,programmeId:programme.programmeId,mode,startSeconds:start,durationSeconds:duration,videoHash:hash(bytes),bytes:bytes.length,elapsedSeconds:(performance.now()-before)/1000,peakNodeRssBytes:peakMemory,encoder,concurrency:1,encoderThreads:2,frameCount:count,frameAccurateClip:'FFmpeg decoded constant 30fps JPEG sequence indexed from source offset; no HTML seek race',probe,qualitativeReview:'pending',createdAt:new Date().toISOString()};await writeFile(join(out,'render.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({out,...report,probe:undefined}));
 }
 const format=t=>{const v=Math.round(t);return `${String(Math.floor(v/3600000)).padStart(2,'0')}:${String(Math.floor(v/60000)%60).padStart(2,'0')}:${String(Math.floor(v/1000)%60).padStart(2,'0')}.${String(v%1000).padStart(3,'0')}`;};
 const captionCues=programme.segments.flatMap(s=>{const phrases=s.text.match(/[^.!?;:]+[.!?;:]+|[^.!?;:]+$/g)||[s.text];let cursor=s.startMs;const weights=phrases.reduce((n,p)=>n+p.length,0);return phrases.map((phrase,i)=>{const end=i===phrases.length-1?s.endMs:cursor+(s.endMs-s.startMs)*phrase.length/weights;const cue={startMs:cursor,endMs:end,text:phrase.trim(),speaker:s.speakerId};cursor=end;return cue;});});
 await writeFile(join(out,'captions.vtt'),'WEBVTT\n\nNOTE Sentence captions use exact narration segment boundaries; internal sentence divisions are proportionally estimated, not word alignment.\n\n'+captionCues.map(s=>`${format(s.startMs)} --> ${format(s.endMs)}\n${s.speaker==='clip'?'Illustration narrator':s.speaker==='eli'?'Eli':'Ada'}: ${s.text}\n`).join('\n'));
 await writeFile(join(out,'sourcemap.json'),JSON.stringify({baseRenditionKey:programme.renditionKey,artRevision:ART_REVISION,revisions:programme.revisions,sourceAssets:programme.assets,sources:programme.sources,segments:programme.segments.map(s=>({id:s.id,startMs:s.startMs,endMs:s.endMs,sourceIds:s.sourceIds,blockIds:s.blockIds,claimIds:s.claimIds,visual:s.visual,phonemeShapes:[...new Set(s.phonemeCues?.map(c=>c.value)||[])]}))},null,2));
 await writeFile(resolve('.cache/broadcast',`latest-${reportTag}-${mode}.json`),JSON.stringify({out,identity,programmeId:programme.programmeId},null,2));
}finally{if(ownedEncoder&&ownedEncoder.exitCode===null&&ownedEncoder.signalCode===null){ownedEncoder.stdin.destroy();const closed=once(ownedEncoder,'close');ownedEncoder.kill();await Promise.race([closed,new Promise(resolve=>setTimeout(resolve,1500))]);}await browser.close();}







