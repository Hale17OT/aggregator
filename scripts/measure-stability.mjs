/* global document, window, requestAnimationFrame, cancelAnimationFrame, PerformanceObserver, performance */
import {chromium} from 'playwright';
import {readFile,writeFile,readdir,mkdir} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const arg=(n,d)=>process.argv.includes('--'+n)?process.argv[process.argv.indexOf('--'+n)+1]:d;
const phase=arg('phase','control'),cpu=Number(arg('cpu','4')),repeats=Number(arg('repeats','3')),headed=process.argv.includes('--headed'),trace=process.argv.includes('--trace');
assert.match(phase,/^[a-z0-9-]+$/);const dir=`output/playwright/stability/${phase}`;await mkdir(dir,{recursive:true});
const hash=createHash('sha256');for(const f of(await readdir('apps/web/.output/public/_nuxt')).filter(f=>/\.(js|css)$/.test(f)).sort())hash.update(f).update(await readFile('apps/web/.output/public/_nuxt/'+f));
const catalog=(await(await fetch('http://127.0.0.1:3000/api/v1/programmes')).json()).data.map(x=>({id:x.programmeId,revision:x.renditionKey,video:x.videoRendition?.renditionKey}));
const browser=await chromium.launch({channel:'chrome',headless:!headed});
const report={at:new Date().toISOString(),phase,cpu,headed,trace,browser:browser.version(),viewport:{width:1440,height:1000},theme:'light',motion:'default',rate:1,flags:'Playwright defaults; no recording; trace only if explicitly labelled',clientSha256:hash.digest('hex'),serverSha256:createHash('sha256').update(await readFile('apps/web/.output/server/index.mjs')).digest('hex'),catalog,runs:[]};
const q=(a,p)=>[...a].sort((x,y)=>x-y)[Math.min(a.length-1,Math.floor(a.length*p))];const stats=a=>({n:a.length,p50:q(a,.5),p95:q(a,.95),p99:q(a,.99),max:Math.max(...a)});
async function instrument(p){await p.evaluate(()=>{window.__stability={events:[],frames:[],loaf:[],observers:[],last:0,raf:0};const m=window.__stability;const tick=t=>{if(m.last)m.frames.push(t-m.last);m.last=t;m.raf=requestAnimationFrame(tick);};m.raf=requestAnimationFrame(tick);m.handler=e=>{const el=e.target.closest?.('button,[role=combobox],[role=option]');if(!el)return;const start=performance.now(),type=e.type;requestAnimationFrame(()=>requestAnimationFrame(()=>m.events.push({type,ms:performance.now()-start})));};document.addEventListener('pointerdown',m.handler,true);document.addEventListener('keydown',m.handler,true);const o=new PerformanceObserver(list=>{for(const e of list.getEntries())m.loaf.push({duration:e.duration,scripts:e.scripts.map(s=>({url:s.sourceURL,fn:s.sourceFunctionName,char:s.sourceCharPosition,invoker:s.invoker,duration:s.duration,layout:s.forcedStyleAndLayoutDuration}))});});o.observe({type:'long-animation-frame'});m.observers.push(o);});}
async function finish(p){return p.evaluate(()=>{const m=window.__stability;cancelAnimationFrame(m.raf);document.removeEventListener('pointerdown',m.handler,true);document.removeEventListener('keydown',m.handler,true);m.observers.forEach(o=>o.disconnect());return{events:m.events,frames:m.frames,loaf:m.loaf,visibility:document.visibilityState};});}
try{for(let r=0;r<repeats;r++){const context=await browser.newContext({viewport:report.viewport}),p=await context.newPage(),cdp=await context.newCDPSession(p);await cdp.send('Emulation.setCPUThrottlingRate',{rate:cpu});
if(trace)await cdp.send('Tracing.start',{categories:'devtools.timeline,v8.execute,disabled-by-default-devtools.timeline.stack',transferMode:'ReturnAsStream'});
const run={repeat:r,popups:[]};for(const mode of ['radio','newsroom']){
await p.goto('http://127.0.0.1:3000/'+(mode==='radio'?'radio?programme=alderwick-evening-edition&theme=light':'newsroom?programme=newsroom-shuttle-duo-clip&theme=light'));
// Use the existing default edition explicitly through its current option, without reducing the catalogue.
if(mode==='radio'){await p.goto('http://127.0.0.1:3000/radio?theme=light');await p.getByRole('button',{name:'Play selected edition',exact:true}).click();}
else await p.locator('.broadcast-controls').getByRole('button',{name:'Play',exact:true}).click();
const media=p.locator(mode==='radio'?'audio':'video');await p.waitForFunction(tag=>document.querySelector(tag)?.currentTime>.2,mode==='radio'?'audio':'video');await media.evaluate(v=>{v.currentTime=10;v.playbackRate=1;v.dataset.stability='same';});
const selector=p.getByRole('combobox',{name:mode==='radio'?'Edition preset':'Media treatment',exact:true});await selector.scrollIntoViewIfNeeded();await p.waitForTimeout(300);await instrument(p);
const openings=[];for(let i=0;i<(trace?4:31);i++){
await p.evaluate(()=>{window.__openStart=0;const h=()=>{window.__openStart=performance.now();document.removeEventListener('pointerdown',h,true);};document.addEventListener('pointerdown',h,true);});
await selector.click();await p.getByRole('option').first().waitFor();await p.waitForFunction(()=>{const list=document.querySelector('[role=listbox]');return list&&list.contains(document.activeElement);});
const ready=await p.evaluate(()=>performance.now()-window.__openStart);const options=await p.getByRole('option').count();
await p.keyboard.press('ArrowDown');await p.keyboard.press('n');await p.keyboard.press('Escape');await p.getByRole('listbox').waitFor({state:'detached'});assert.ok(await selector.evaluate(e=>e===document.activeElement));
await p.waitForTimeout(170);openings.push({cold:i===0,focusReadyMs:ready,options});}
const data=await finish(p);run.popups.push({mode,openings,warmFocusReady:stats(openings.slice(1).map(x=>x.focusReadyMs)),proxy:stats(data.events.map(x=>x.ms)),...data,media:await media.evaluate(v=>({same:v.dataset.stability==='same',paused:v.paused,time:v.currentTime,src:v.currentSrc}))});assert.equal(run.popups.at(-1).media.paused,false);
if(mode==='radio'){await instrument(p);const queueOps=[];for(let cycle=0;cycle<(trace?1:3);cycle++){
for(let i=0;i<5;i++){await p.getByRole('button',{name:'Add to guest queue',exact:true}).click();await p.waitForTimeout(180);queueOps.push('add');}
for(let i=0;i<3;i++){await p.getByRole('button',{name:'Move down',exact:true}).first().click();await p.waitForTimeout(180);queueOps.push('reorder');}
for(let i=0;i<5;i++){await p.getByRole('button',{name:'Remove',exact:true}).first().click();await p.waitForTimeout(180);queueOps.push('remove');}}
const d=await finish(p);run.queue={operations:queueOps,proxy:stats(d.events.map(x=>x.ms)),cadence:stats(d.frames),...d};assert.equal(await p.locator('.programme-queue li').count(),0);}
}
if(trace){const done=new Promise(resolve=>cdp.once('Tracing.tracingComplete',resolve));await cdp.send('Tracing.end');const {stream}=await done;let raw='';for(;;){const chunk=await cdp.send('IO.read',{handle:stream});raw+=chunk.data;if(chunk.eof)break;}await cdp.send('IO.close',{handle:stream});await writeFile(`${dir}/trace.json`,raw);}
report.runs.push(run);await context.close();await writeFile(`${dir}/results.json`,JSON.stringify(report,null,2));console.log(`${phase} ${r+1}: ${run.popups.map(x=>x.mode+' p95 '+x.warmFocusReady.p95.toFixed(1)).join(', ')} queue ${run.queue.proxy.p95.toFixed(1)}`);
}}finally{await browser.close();await writeFile(`${dir}/results.json`,JSON.stringify(report,null,2));}
