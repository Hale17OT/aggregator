/* global window, requestAnimationFrame, cancelAnimationFrame */
import {chromium} from 'playwright';
import {writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome',headless:true}),rows=[];
try{
 for(const mode of ['unchanged','isolated-paint','hidden-diagnostic-only']){
  const p=await browser.newPage({viewport:{width:1440,height:1000}});
  await p.goto('http://127.0.0.1:3000/radio');await p.getByRole('button',{name:'Play selected edition',exact:true}).click();
  if(mode==='isolated-paint')await p.addStyleTag({content:'.meter-lights{contain:paint;padding:3px;margin:-3px;transform:translateZ(0)}'});
  if(mode==='hidden-diagnostic-only')await p.addStyleTag({content:'.signal-strip{visibility:hidden}'});
  const face=p.getByRole('slider',{name:'Volume knob',exact:true});await face.scrollIntoViewIfNeeded();await p.waitForTimeout(1000);
  await p.evaluate(()=>{window.__frames=[];let last=0;const cb=t=>{if(last)window.__frames.push(t-last);last=t;window.__frame=requestAnimationFrame(cb);};window.__frame=requestAnimationFrame(cb);});
  const b=await face.boundingBox(),cx=b.x+b.width/2,cy=b.y+b.height/2;await p.mouse.move(cx+24,cy);await p.mouse.down();
  for(let i=0;i<150;i++){const a=Math.sin(i/40)*Math.PI*1.6;await p.mouse.move(cx+24*Math.cos(a),cy+24*Math.sin(a));await p.waitForTimeout(33);}await p.mouse.up();
  const frames=await p.evaluate(()=>{cancelAnimationFrame(window.__frame);return window.__frames;});const sorted=[...frames].sort((a,b)=>a-b);rows.push({mode,frames,p95:sorted[Math.floor(sorted.length*.95)],p99:sorted[Math.floor(sorted.length*.99)]});await p.close();
 }
 await writeFile('output/playwright/performance/candidate/meter-diagnostic.json',JSON.stringify({scope:'Runtime CSS isolation experiment; hidden ornament is a diagnostic condition only, never a shipped repair.',rows},null,2));console.log(rows.map(({mode,p95,p99})=>({mode,p95,p99})));
}finally{await browser.close();}

