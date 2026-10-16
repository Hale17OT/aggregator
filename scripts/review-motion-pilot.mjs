
import {readFile,writeFile,mkdir,copyFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {spawnSync} from 'node:child_process';
import {chromium} from 'playwright';
import {pathToFileURL} from 'node:url';
const dir=resolve('output/review/delivery-motion');await mkdir(dir,{recursive:true});
const before=JSON.parse(await readFile('.cache/delivery-baseline/duo.json','utf8')),latest=JSON.parse(await readFile('.cache/broadcast/latest-duo-pilot.json','utf8'));
const ff=resolve('.cache/tools/ffmpeg/ffmpeg-9.0.2-essentials_build/bin/ffmpeg.exe');
const result=spawnSync(ff,['-v','error','-y','-ss','35','-i',before.assetFiles[0],'-t','55','-c:v','libx264','-preset','fast','-crf','19','-c:a','aac','-threads','2','-movflags','+faststart',join(dir,'before.mp4')],{windowsHide:true,encoding:'utf8'});if(result.status!==0)throw Error(result.stderr);
await copyFile(join(latest.out,'programme.mp4'),join(dir,'after.mp4'));
await writeFile(join(dir,'index.html'),`<!doctype html><html lang="en"><meta charset="utf-8"><title>Same-audio motion pilot</title><style>body{background:#eee9d9;color:#173e30;font:18px system-ui;margin:24px}.pair{display:flex;gap:16px}section{width:50%}video{width:100%}button{padding:12px}</style><h1>Same audio · 35–90 seconds · 1×</h1><p>Before and after camera continuity repair. Uncut source passages; original animated presenters. One soundtrack, from After. This is motion review, not performance timing evidence.</p><button onclick="for(const v of document.querySelectorAll('video')){v.currentTime=0;v.playbackRate=1;v.play()}">Play both at normal speed</button><div class="pair"><section><h2>Before</h2><video id="before" src="before.mp4" controls muted></video></section><section><h2>After</h2><video id="after" src="after.mp4" controls></video></section></div><p>Full programme captions/source maps remain in the application. These excerpts isolate motion and use the same original source WAV.</p></html>`);
const browser=await chromium.launch({channel:'chrome',headless:true}),frames=[];
try{const p=await browser.newPage({viewport:{width:1600,height:850}});await p.goto(pathToFileURL(join(dir,'index.html')).href);await p.getByRole('button').click();let last=0;for(const t of[9,10,20,40,54]){await p.waitForTimeout((t-last)*1000);last=t;frames.push(await p.locator('video').evaluateAll(vs=>vs.map(v=>({id:v.id,time:v.currentTime,rate:v.playbackRate,paused:v.paused,quality:v.getVideoPlaybackQuality().droppedVideoFrames}))));await p.screenshot({path:join(dir,`playing-${t}.png`)});console.log('Normal-speed sample '+t);}await writeFile(join(dir,'playback-review.json'),JSON.stringify({at:new Date().toISOString(),range:[35,90],frames,identity:latest.identity,status:'Played at 1x; screenshots require separate visual inspection',subjectiveListening:'not performed'},null,2));}finally{await browser.close();}

