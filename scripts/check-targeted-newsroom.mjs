/* global document,innerWidth,getComputedStyle */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdirSync,existsSync,writeFileSync} from 'node:fs';
const iteration=process.argv[2];if(!/^[1-9][0-9]*$/.test(iteration||''))throw Error('Explicit iteration required');
const dir=`output/targeted-closeout-20261016/evidence/newsroom-extra-${iteration}`;
if(existsSync(dir))throw Error('Occupied evidence');mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({channel:'chrome'}),results=[];
try {
 for(const width of [320,360,390])for(const height of [568,900])for(const theme of ['light','dark']){
  const page=await browser.newPage({viewport:{width,height}});
  await page.goto(`http://127.0.0.1:3000/newsroom?theme=${theme}`);
  await page.waitForFunction(()=>document.querySelector('video')?.readyState>=1);
  const play=page.getByRole('button',{name:'Start programme',exact:true});
  const anchor=()=>play.evaluate(e=>{const b=e.getBoundingClientRect(),p=e.closest('.broadcast-screen').getBoundingClientRect();return {x:b.x+b.width/2-p.x,y:b.y+b.height/2-p.y,width:p.width,height:p.height};});
  const before=await anchor();
  await page.getByLabel('Video settings',{exact:true}).click();
  const after=await anchor();assert(Math.abs(before.y-after.y)<1,'Play stays anchored to picture');assert(after.y>0&&after.y<after.height&&after.x>0&&after.x<after.width,'Play within actual picture');
  await page.evaluate(()=>{
   const elements=[...document.querySelectorAll('.prepared-broadcast button,.prepared-broadcast summary,.prepared-broadcast label,.prepared-broadcast span')];
   const sizes=elements.map(e=>parseFloat(getComputedStyle(e).fontSize));
   elements.forEach((e,i)=>{e.style.fontSize=`${sizes[i]*2}px`;});
   document.querySelector('.video-settings>button').textContent='Use the accessible native video controls for this programme';
  });
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'2x measured text/long label reflow');
  const controls=page.locator('.prepared-broadcast button:visible,.prepared-broadcast summary:visible,.prepared-broadcast input:visible');
  for(let i=0;i<await controls.count();i++){
   const c=controls.nth(i);await c.focus();await c.scrollIntoViewIfNeeded();
   assert(await c.evaluate(e=>document.activeElement===e),'focus reachable');
   const r=await c.boundingBox();assert(r.width>=24&&r.x>=0&&r.x+r.width<=width+1,'target fits width');
  }
  await page.locator('.broadcast-controls').scrollIntoViewIfNeeded();
  await page.screenshot({path:`${dir}/${width}-${height}-${theme}.png`});
  results.push({width,height,theme,text:'Each pre-change computed font size doubled; not OS/browser zoom',focus:'all visible controls programmatically focused and scrolled into view; not a complete Tab-order audit'});
  await page.close();
 }
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.goto('http://127.0.0.1:3000/newsroom');await page.locator('video').waitFor();
 await page.getByRole('button',{name:'Fullscreen stage',exact:true}).click();
 await page.waitForFunction(()=>!!document.fullscreenElement);
 await page.evaluate(()=>document.exitFullscreen());await page.waitForFunction(()=>!document.fullscreenElement);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));results.push({fullscreen:'entered and exited actual Fullscreen API'});
}finally{await browser.close();writeFileSync(dir+'/results.json',JSON.stringify(results,null,2));}
