import { Buffer } from 'node:buffer';
import { readFile,writeFile,mkdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { chromium } from 'playwright';
import { createFixtureRepository } from '../packages/test-fixtures/src/index.ts';
import { digest,publicationBlockers } from '../packages/domain/src/publication.ts';
import { programmeRoot,hash,atomicJson,eligible,claim } from '../packages/programme/src/store.ts';
const ffmpeg=resolve('.cache/tools/ffmpeg/ffmpeg-9.0.2-essentials_build/bin/ffmpeg.exe'),ffprobe=ffmpeg.replace('ffmpeg.exe','ffprobe.exe');
const scratch=resolve('.cache/clip-render');await mkdir(scratch,{recursive:true});await mkdir(resolve(programmeRoot,'assets'),{recursive:true});
const repo=createFixtureRepository(),recipes=[
 {slug:'alderwick-rain-gardens',id:'rain-garden-trial',blocks:[0,1]},
 {slug:'alderwick-river-thermometers',id:'river-placement',blocks:[0,1,2]},
 {slug:'alderwick-repair-library',id:'repair-tool-shelf',blocks:[0,1,2]},
 {slug:'alderwick-market-stalls',id:'market-arrivals',blocks:[0,1,2],sentences:1},
 {slug:'alderwick-evening-shuttle',id:'shuttle-evidence',blocks:[0,1,2]},
 {slug:'alderwick-evening-shuttle',id:'shuttle-questions',blocks:[3,5,6]},
];
const pilot=process.argv.includes('--pilot');
const rendererRevision=hash(await readFile('scripts/render-clips.mjs'));
const modelRevision='1939ad2a8e416c0acfeecc08a694d14ef25f2231';
const {KokoroTTS}=await import('../.cache/speech-runtime/node_modules/kokoro-js/dist/kokoro.js');const {env}=await import('../.cache/speech-runtime/node_modules/@huggingface/transformers/dist/transformers.node.mjs');env.allowRemoteModels=false;
const tts=await KokoroTTS.from_pretrained(resolve('.cache/speech-model'),{dtype:'q8',device:'cpu'});
function wav(samples){const b=Buffer.alloc(44+samples.length*2);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(24000,24);b.writeUInt32LE(48000,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(samples.length*2,40);for(let i=0;i<samples.length;i++)b.writeInt16LE(Math.round(Math.max(-1,Math.min(1,samples[i]))*32767),44+i*2);return b;}
async function speak(text){const path=resolve(scratch,hash(text+modelRevision)+'.wav');try{return await readFile(path);}catch{const audio=await tts.generate(text,{voice:'af_heart',speed:1});const bytes=wav(audio.audio);await writeFile(path,bytes);return bytes;}}
const run=(exe,args)=>{const r=spawnSync(exe,args,{encoding:'utf8',windowsHide:true,timeout:300000,maxBuffer:3e6});if(r.status!==0)throw Error(r.stderr.slice(-1800));return r.stdout;};
const escape=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const wrap=(s,n=27)=>{const lines=[];let line='';for(const word of s.split(/\s+/)){if((line+' '+word).length>n&&line){lines.push(line);line='';}line+=(line?' ':'')+word;}if(line)lines.push(line);return lines;};
const text=(s,x,y,size=38,n=27)=>wrap(s,n).map((line,i)=>`<text x="${x}" y="${y+i*(size*1.18)}" font-size="${size}">${escape(line)}</text>`).join('');
async function asset(bytes,ext,type,mime,extra={}){const id=hash(bytes);await writeFile(resolve(programmeRoot,'assets',id+'.'+ext),bytes);return {id,storageKey:id+'.'+ext,type,mime,hash:id,bytes:bytes.length,availability:'available',permissions:{display:true,transform:true,audio:true,broadcast:true},provenance:'Original fictional local Clip artwork and synthetic narration; no third-party footage',engine:'Kokoro 1.2.1 / original SVG / FFmpeg 9',voice:'af_heart',modelRevision,...extra};}
const url=a=>'/api/v1/programme-assets/'+a.id;
const stamp=ms=>{const n=Math.round(ms);return `${String(Math.floor(n/3600000)).padStart(2,'0')}:${String(Math.floor(n/60000)%60).padStart(2,'0')}:${String(Math.floor(n/1000)%60).padStart(2,'0')}.${String(n%1000).padStart(3,'0')}`;};
const browser=await chromium.launch({channel:'chrome'}),page=await browser.newPage({viewport:{width:720,height:1280},deviceScaleFactor:1});const results=[];
try{for(const recipe of recipes.slice(0,pilot?1:6)){
 const d=repo.get(recipe.slug);if(!d||publicationBlockers(d).length)throw Error('Ineligible clip story');const blocks=recipe.blocks.map(i=>d.variants.standard[i]).filter(Boolean);
 const parts=[{block:blocks[0],text:`Fictional local reporting. ${d.headline}.`},...blocks.flatMap(block=>(block.text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)||[]).slice(0,recipe.sentences||100).map(t=>({block,text:t.trim()}))),{block:blocks.at(-1),text:'Read the full story and its complete fictional source bibliography in The Aggregator. These reports describe a limited trial, not an established wider result.'}];
 const key=hash(JSON.stringify([recipe,parts,digest(d),rendererRevision,modelRevision]));const manifest=resolve(programmeRoot,'manifests',key+'.json');
 try{const old=JSON.parse(await readFile(manifest,'utf8'));if(eligible(old,repo)){results.push({id:old.programmeId,key,durationMs:old.durationMs,cached:true});continue;}}catch{/* render below */}
 const release=await claim(key);if(!release)throw Error('Clip render already owned');
 try{let duration=0;const audio=[],segments=[];for(const [i,part] of parts.entries()){const bytes=await speak(part.text),pcm=bytes.subarray(44);const start=duration;duration+=pcm.length/48;audio.push(pcm);segments.push({id:`clip-segment-${i+1}`,articleSlug:d.slug,articleVersionId:d.versionId,blockIds:[part.block.id],claimIds:part.block.claimIds,sourceIds:part.block.sourceIds,speakerId:'ada',text:part.text,displayText:part.text,startMs:start,endMs:duration,shot:'figure',mouthCues:[]});}
 if(duration<30000||duration>120000)throw Error(`Clip duration outside bounds: ${recipe.id} ${duration}`);
 const samples=Buffer.concat(audio),floats=new Float32Array(samples.length/2);for(let i=0;i<floats.length;i++)floats[i]=samples.readInt16LE(i*2)/32768;
 const wavBytes=wav(floats),audioPath=resolve(scratch,key+'.wav');await writeFile(audioPath,wavBytes);
 const scenes=[];for(const [i,block] of blocks.entries()){
 const sentence=block.text.split(/(?<=[.!?])\s/)[0];
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="720" height="1280"><rect width="720" height="1280" fill="#eee8da"/><g font-family="Arial,sans-serif" fill="#173e32"><rect x="0" y="0" width="720" height="14" fill="#173e32"/><text x="52" y="76" font-size="24" letter-spacing="3">THE AGGREGATOR / CLIPS</text><text x="52" y="120" font-size="21">${escape(d.topic.toUpperCase())} · FICTIONAL REPORTING</text>${text(d.headline,52,198,42,25)}<path d="M52 420H668" stroke="#173e32"/><text x="52" y="476" font-size="23">EVIDENCE NOTE ${i+1} OF ${blocks.length}</text>${text(block.heading,52,535,34,31)}<path d="M104 675H616" stroke="#739080" stroke-width="4"/>${blocks.map((b,j)=>`<circle cx="${104+j*512/Math.max(1,blocks.length-1)}" cy="675" r="${i===j?24:12}" fill="${i===j?'#b2683c':'#739080'}"/>`).join('')}${text(sentence,52,750,30,36)}<text x="52" y="1100" font-size="20">Original illustration · local synthetic voice</text><text x="52" y="1140" font-size="20">Sources and full story accompany this Clip.</text></g></svg>`;
 await page.setContent(`<style>body{margin:0}svg{display:block}</style>${svg}`);const path=resolve(scratch,`${key}-${i}.png`);await page.screenshot({path});scenes.push(path);
 }
 const totalSeconds=duration/1000;const output=resolve(scratch,key+'.mp4');
 const inputs=scenes.flatMap((p,i)=>['-loop','1','-framerate','30','-t',String(segments.filter(s=>s.blockIds.includes(blocks[i].id)).reduce((sum,s)=>sum+s.endMs-s.startMs,0)/1000),'-i',p]);
 const filters=scenes.map((_,i)=>`[${i}:v]zoompan=z='min(zoom+0.000015,1.012)':x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':d=1:s=720x1280:fps=30,setsar=1,format=yuv420p[v${i}]`).join(';')+';'+scenes.map((_,i)=>`[v${i}]`).join('')+`concat=n=${scenes.length}:v=1:a=0[v]`;
 run(ffmpeg,['-y',...inputs,'-i',audioPath,'-filter_complex',filters,'-map','[v]','-map',`${scenes.length}:a`,'-t',String(totalSeconds),'-c:v','libx264','-preset','fast','-crf','23','-threads','2','-c:a','aac','-b:a','96k','-movflags','+faststart',output]);
 const probe=JSON.parse(run(ffprobe,['-v','error','-show_streams','-show_format','-of','json',output]));const decoded=Number(probe.format.duration)*1000;if(decoded<30000||decoded>120000||Math.abs(decoded-duration)>50)throw Error('Decoded duration invalid');run(ffmpeg,['-v','error','-i',output,'-f','null','-']);
 const sound=await asset(wavBytes,'wav','audio','audio/wav',{durationMs:duration}),video=await asset(await readFile(output),'mp4','video','video/mp4',{durationMs:duration,width:720,height:1280}),poster=await asset(await readFile(scenes[0]),'png','image','image/png',{width:720,height:1280});
 const caption=await asset(Buffer.from('WEBVTT\n\n'+segments.map(s=>`${stamp(s.startMs)} --> ${stamp(s.endMs)}\n${s.text}\n`).join('\n')),'vtt','captions','text/vtt; charset=utf-8');
 const sourceMap=await asset(Buffer.from(JSON.stringify({articleVersion:d.versionId,segments,visualDescription:'Portrait evidence cards with numbered notes and an advancing position marker. Each card distinguishes the announced plan, observations and limitations; no documentary footage.'})),'json','source-map','application/json');
 const p={schemaVersion:1,programmeId:'clip-'+recipe.id,kind:'clip',variant:'brief',title:d.headline,status:'ready',language:'en',durationMs:duration,audioUrl:url(sound),articleSlugs:[d.slug],chapters:[{articleSlug:d.slug,title:d.headline,startMs:0,endMs:duration}],segments,sources:d.sources.filter(s=>segments.some(x=>x.sourceIds.includes(s.id))).map(s=>({id:s.id,ordinal:s.ordinal,publisher:s.publisher,title:s.title,url:s.url,articleSlug:d.slug})),syntheticDisclosure:'Original fictional evidence graphics with local Kokoro synthetic voice. No real news footage or photorealistic presenter. Sentence timing follows generated audio; no word-alignment claim.',scriptDigest:hash(JSON.stringify(parts)),renditionKey:key,revisions:[{slug:d.slug,versionId:d.versionId,digest:digest(d)}],videoRendition:{url:url(video),posterUrl:url(poster),captionUrl:url(caption),sourceMapUrl:url(sourceMap),renditionKey:key,durationMs:duration,width:720,height:1280,fps:30},assets:[sound,video,poster,caption,sourceMap]};
 if(!eligible(p,repo))throw Error('Clip eligibility failed');await atomicJson(manifest,p);results.push({id:p.programmeId,key,durationMs:duration,decodedDurationMs:decoded,path:resolve(programmeRoot,'assets',video.storageKey),poster:resolve(programmeRoot,'assets',poster.storageKey),fullyDecoded:true});console.log(recipe.id+': '+(duration/1000).toFixed(2)+' seconds');
 }finally{await release();}
 }
 const index=JSON.parse(await readFile(resolve(programmeRoot,'index.json'),'utf8')),keep=[];for(const key of index){const p=JSON.parse(await readFile(resolve(programmeRoot,'manifests',key+'.json'),'utf8'));if(!results.some(r=>r.id===p.programmeId))keep.push(key);}await atomicJson(resolve(programmeRoot,'index.json'),[...new Set([...keep,...results.map(r=>r.key)])]);await atomicJson('docs/engineering/clip-render'+(pilot?'-pilot':'')+'.json',{at:new Date().toISOString(),rendererHash:rendererRevision,results:results.map(({key,...r})=>({...r,manifestSha256:key})),subjectiveListening:'not performed',ownerAcceptance:'pending'});
}finally{await browser.close();}
