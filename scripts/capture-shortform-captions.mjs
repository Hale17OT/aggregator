/* global document */
import {chromium} from 'playwright';
import {mkdirSync,writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const out='output/shortform-rebuild/after/captions';mkdirSync(out,{recursive:true});
const clips=(await(await fetch('http://127.0.0.1:4000/api/v1/clips')).json()).data;
const browser=await chromium.launch({channel:'chrome'}),results=[];
try {for(const [width,height] of [[1280,640],[390,844],[320,568]]){
 const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
 await page.goto('http://127.0.0.1:3000/clips');
 for(let i=0;i<clips.length;i++){
  if(i)await page.getByRole('button',{name:'Next clip',exact:true}).click();
  await page.waitForFunction(i=>document.querySelector('video')?.dataset.index===String(i)&&document.querySelector('video').readyState>=1,i);
  await page.getByRole('button',{name:'Play',exact:true}).first().click();
  await page.waitForFunction(()=>document.querySelector('video').currentTime>.2);
  await page.getByRole('button',{name:'Pause',exact:true}).first().click();
  for(const fraction of [.03,.5,.95]){
   const at=Number((clips[i].durationMs/1000*fraction).toFixed(1));
   await page.getByRole('slider',{name:'Clip position'}).fill(String(at));
   await page.waitForFunction(at=>Math.abs(document.querySelector('video').currentTime-at)<.3,at);
   await page.waitForTimeout(150);
   const caption=await page.locator('.clip-caption').boundingBox(),meta=await page.locator('.clip-meta').boundingBox();assert(caption.y+caption.height<=meta.y);
   assert(await page.locator('.clip-caption').evaluate(e=>e.scrollHeight<=e.clientHeight+1),'Full normal-width cue must fit without hidden scrolling');
   for(const name of ['Save','Sources','Share','More']){
    const button=page.getByRole('button',{name,exact:true});
    assert(await button.evaluate(e=>{const r=e.getBoundingClientRect();const hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return hit===e||e.contains(hit);}), `${name} must remain unobstructed throughout captions`);
   }
   await page.screenshot({path:`${out}/${width}-${i+1}-${fraction}.png`});
   results.push({width,height,clip:clips[i].programmeId,fraction,at,paused:await page.locator('video').evaluate(v=>v.paused),caption:await page.locator('.clip-caption').innerText(),nonoverlap:true});
  }
 }
 await page.close();
}} finally {await browser.close();writeFileSync(out+'/results.json',JSON.stringify(results,null,2));}
