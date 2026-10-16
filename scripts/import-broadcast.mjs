// Trusted local derivative import. No HTTP generation/publication endpoint.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { Buffer } from 'node:buffer';
import { resolve, join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createFixtureRepository } from '../packages/test-fixtures/src/index.ts';
import { programmeRoot,hash,atomicJson,eligible,verifiedAsset,claim } from '../packages/programme/src/store.ts';
const variant=process.argv[2];if(!['solo','duo'].includes(variant))throw Error('Use solo or duo');const requestedId=process.argv[3];if(requestedId&&!/^[a-z0-9-]{3,90}$/.test(requestedId))throw Error('BAD_PROGRAMME_ID');const reportTag=requestedId||variant,programmeId=requestedId||'newsroom-alderwick-'+variant;
const latest=JSON.parse(await readFile(resolve('.cache/broadcast',`latest-${reportTag}-full.json`),'utf8'));
const out=resolve(latest.out),renderRoot=resolve('.cache/broadcast/renders');if(!out.startsWith(renderRoot+String.fromCharCode(process.platform==='win32'?92:47)))throw Error('UNKNOWN_RENDER_TARGET');
const report=JSON.parse(await readFile(join(out,'render.json'),'utf8'));
const repo=createFixtureRepository();const programme=JSON.parse(await readFile(join(programmeRoot,'manifests',report.baseRenditionKey+'.json'),'utf8'));
if(!eligible(programme,repo)||programme.programmeId!==programmeId||programme.variant!==variant||report.mode!=='full'||report.startSeconds!==0||Math.abs(report.durationSeconds*1000-programme.durationMs)>.01)throw Error('INELIGIBLE_OR_INCOMPLETE_RENDER');
const probe=report.probe,video=probe.streams.find(s=>s.codec_type==='video'),audio=probe.streams.find(s=>s.codec_type==='audio');
if(video?.codec_name!=='h264'||video.width!==1280||video.height!==720||video.avg_frame_rate!=='30/1'||audio?.codec_name!=='aac'||Math.abs(Number(audio.duration)-programme.durationMs/1000)>.05||Math.abs(Number(video.duration)-programme.durationMs/1000)>1/30+.01)throw Error('INVALID_STREAMS');
const full=await readFile(join(out,'programme.mp4'));if(hash(full)!==report.videoHash)throw Error('RENDER_CHECKSUM_MISMATCH');
const ffmpeg=resolve('.cache/tools/ffmpeg/ffmpeg-9.0.2-essentials_build/bin/ffmpeg.exe');
const decode=spawnSync(ffmpeg,['-v','error','-i',join(out,'programme.mp4'),'-f','null','-'],{encoding:'utf8',windowsHide:true,timeout:120000});if(decode.status!==0)throw Error('DECODE_FAILED');
const sourceMap=JSON.parse(await readFile(join(out,'sourcemap.json'),'utf8'));
if(sourceMap.baseRenditionKey!==programme.renditionKey||JSON.stringify(sourceMap.revisions)!==JSON.stringify(programme.revisions)||JSON.stringify(sourceMap.sources)!==JSON.stringify(programme.sources))throw Error('SOURCE_BINDING_MISMATCH');
const expectedSegments=programme.segments.map(s=>({id:s.id,startMs:s.startMs,endMs:s.endMs,sourceIds:s.sourceIds,blockIds:s.blockIds,claimIds:s.claimIds,visual:s.visual}));
if(JSON.stringify(sourceMap.sourceAssets)!==JSON.stringify(programme.assets)||JSON.stringify(sourceMap.segments.map(({phonemeShapes,...s})=>{if(!Array.isArray(phonemeShapes)||phonemeShapes.some(v=>!['A','B','C','D','E','F','G','H','X'].includes(v)))throw Error('INVALID_DERIVED_CUES');return s;}))!==JSON.stringify(expectedSegments))throw Error('SEGMENT_BINDING_MISMATCH');
const stamp=t=>{const v=Math.round(t);return `${String(Math.floor(v/3600000)).padStart(2,'0')}:${String(Math.floor(v/60000)%60).padStart(2,'0')}:${String(Math.floor(v/1000)%60).padStart(2,'0')}.${String(v%1000).padStart(3,'0')}`;};
const expectedCues=programme.segments.flatMap(s=>{const phrases=s.text.match(/[^.!?;:]+[.!?;:]+|[^.!?;:]+$/g)||[s.text],weight=phrases.reduce((n,p)=>n+p.length,0);let cursor=s.startMs;return phrases.map((phrase,i)=>{const end=i===phrases.length-1?s.endMs:cursor+(s.endMs-s.startMs)*phrase.length/weight;const cue=`${stamp(cursor)} --> ${stamp(end)}\n${s.speakerId==='clip'?'Illustration narrator':s.speakerId==='eli'?'Eli':'Ada'}: ${phrase.trim()}\n`;cursor=end;return cue;});});
const expectedVtt='WEBVTT\n\nNOTE Sentence captions use exact narration segment boundaries; internal sentence divisions are proportionally estimated, not word alignment.\n\n'+expectedCues.join('\n');
if(await readFile(join(out,'captions.vtt'),'utf8')!==expectedVtt)throw Error('CAPTION_BINDING_MISMATCH');
await mkdir(join(programmeRoot,'derivatives'),{recursive:true});
const extra=[];for(const [file,type,mime,ext] of [['programme.mp4','video','video/mp4','mp4'],['poster.png','image','image/png','png'],['captions.vtt','captions','text/vtt; charset=utf-8','vtt'],['sourcemap.json','source-map','application/json','json']]){
 const bytes=await readFile(join(out,file)),id=hash(bytes),storageKey=id+'.'+ext;
 try{await writeFile(join(programmeRoot,'assets',storageKey),bytes,{flag:'wx'});}catch(error){if(error.code!=='EEXIST'||hash(await readFile(join(programmeRoot,'assets',storageKey)))!==id)throw error;}
 extra.push({id,storageKey,type,mime,hash:id,bytes:bytes.length,availability:'available',permissions:{display:true,transform:true,audio:true,broadcast:true},provenance:'Original fictional directed broadcast; inherits exact vetted article/evidence/rights revisions',engine:report.encoder,voice:'Existing approved local Kokoro soundtrack; unchanged',modelRevision:report.artRevision,...(type==='video'?{durationMs:programme.durationMs,width:1280,height:720}:type==='image'?{width:1280,height:720}:{})});
}
const videoKey=hash(JSON.stringify({base:programme.renditionKey,art:report.sourceHash,render:report.identity,assets:extra.map(a=>a.hash)}));
const url=i=>'/api/v1/programme-assets/'+extra[i].id;
programme.videoRendition={url:url(0),posterUrl:url(1),captionUrl:url(2),sourceMapUrl:url(3),renditionKey:videoKey,durationMs:programme.durationMs,width:1280,height:720,fps:30};programme.assets.push(...extra);
if(!eligible(programme,repo)||!(await Promise.all(programme.assets.map(a=>verifiedAsset(programme,a.id)))).every(Boolean))throw Error('FAILED_BEFORE_READY');
const bytes=Buffer.from(JSON.stringify(programme,null,2)),manifestHash=hash(bytes);await writeFile(join(programmeRoot,'derivatives',manifestHash+'.json'),bytes,{flag:'wx'}).catch(e=>{if(e.code!=='EEXIST')throw e;});
const unlock=await claim(hash('broadcast-derivative-index'));if(!unlock)throw Error('DERIVATIVE_INDEX_BUSY');
try{let index={};try{index=JSON.parse(await readFile(join(programmeRoot,'derivatives','index.json'),'utf8'));}catch{/* First local import. */}index[programme.renditionKey]=manifestHash;await atomicJson(join(programmeRoot,'derivatives','index.json'),index);}finally{await unlock();}
await atomicJson(resolve('docs/engineering',`broadcast-${reportTag}-render.json`),{...report,baseRenditionKey:undefined,baseRenditionSha256:report.baseRenditionKey,videoRendition:{...programme.videoRendition,renditionKey:undefined,renditionSha256:programme.videoRendition.renditionKey},assetFiles:extra.map(a=>join(programmeRoot,'assets',a.storageKey)),manifestHash,checks:['decode','complete unchanged soundtrack','1280x720 30fps H264/AAC','current rights/evidence eligibility','immutable manifest and assets'],ownerVisualMotionAcceptance:'pending',directHumanListeningReview:'not performed by tooling'});
console.log(JSON.stringify({programmeId:programme.programmeId,videoRendition:programme.videoRendition,manifestHash}));



