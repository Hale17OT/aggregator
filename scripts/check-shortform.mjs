/* global document, innerWidth */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdirSync,writeFileSync} from 'node:fs';
const dir='output/shortform-rebuild/verification/web';mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({channel:'chrome'}),results=[];
try {
 for(let run=1;run<=3;run++){
  const context=await browser.newContext({viewport:{width:1280,height:640},recordVideo:run===3?{dir,size:{width:1280,height:640}}:undefined});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:3000/clips');const video=page.locator('video');await video.waitFor();
  await page.getByRole('button',{name:'Play',exact:true}).first().click();await page.waitForFunction(()=>document.querySelector('video')?.currentTime>1);
  const caption=await page.locator('.clip-caption').boundingBox(),meta=await page.locator('.clip-meta').boundingBox(); assert(caption.y+caption.height<=meta.y,'Captions must not overlap metadata');
  const bounds=await video.boundingBox();await page.mouse.click(bounds.x+bounds.width*.25,bounds.y+bounds.height*.35);
  assert(await video.evaluate(v=>v.paused));
  await page.locator('.clip-feed').focus();await page.keyboard.press('ArrowDown');await page.waitForFunction(()=>document.querySelector('video')?.dataset.index==='1');
  assert(await video.evaluate(v=>v.paused));
  await page.getByRole('button',{name:'Play',exact:true}).first().click();await page.waitForFunction(()=>document.querySelector('video')?.currentTime>1);
  const slider=page.getByRole('slider',{name:'Clip position'}),s=await slider.boundingBox();
  await page.mouse.move(s.x+s.width*.2,s.y+s.height/2);await page.mouse.down();await page.mouse.move(s.x+s.width*.5,s.y+s.height/2,{steps:8});await page.mouse.up();
  await page.waitForFunction(()=>document.querySelector('video')?.currentTime>10);
  const sought=await video.evaluate(v=>v.currentTime);await page.getByRole('button',{name:'Sources',exact:true}).click();await page.getByRole('dialog').waitFor();assert(await video.evaluate(v=>v.paused));assert(await page.getByRole('dialog').getByRole('link',{name:'Exact original item'}).count()>=3);
  await page.screenshot({path:`${dir}/run${run}-sources.png`});await page.getByRole('button',{name:'Close',exact:true}).click();assert(await video.evaluate(v=>v.paused));assert(Math.abs(await video.evaluate(v=>v.currentTime)-sought)<2);
  const current=await video.getAttribute('src');await page.locator('.clip-meta a').click();await page.waitForURL('**/articles/**');await page.goBack();await video.waitFor();assert.equal(await video.getAttribute('src'),current);assert(await video.evaluate(v=>v.paused));
  await page.getByRole('button',{name:'More',exact:true}).click();await page.getByRole('dialog').waitFor();await page.keyboard.press('Escape');assert(await video.evaluate(v=>v.paused));
  await page.screenshot({path:`${dir}/run${run}-paused-return.png`});assert.deepEqual(errors,[]);results.push({run,passed:true,sought,errors});await context.close();
 }
 for(const [width,height] of [[1440,900],[1280,720],[1280,640],[1024,768],[390,844],[360,740],[320,568]]){
  const page=await browser.newPage({viewport:{width,height}});await page.goto('http://127.0.0.1:3000/clips');await page.locator('video').waitFor();
  const geometry=await page.evaluate(()=>{const r=document.querySelector('video').getBoundingClientRect(),c=document.querySelector('.clip-layout').getBoundingClientRect();return {centerError:Math.abs(r.x+r.width/2-c.x-c.width/2),overflow:document.documentElement.scrollWidth>innerWidth,video:{width:r.width,height:r.height},actions:[...document.querySelectorAll('.clip-rail button')].map(b=>{const a=b.getBoundingClientRect();return {width:a.width,height:a.height,bottom:a.bottom};})};});
  assert(geometry.centerError<=2);assert(!geometry.overflow);assert(geometry.actions.every(a=>a.width>=44&&a.height>=44&&a.bottom<=height));await page.screenshot({path:`${dir}/${width}x${height}.png`});results.push({width,height,geometry});await page.close();
 }
 const nojs=await browser.newPage({javaScriptEnabled:false});const clips=await(await fetch('http://127.0.0.1:4000/api/v1/clips')).json();await nojs.goto('http://127.0.0.1:3000/clips/'+clips.data[0].programmeId);assert(await nojs.locator('#sources a').count()>=3);await nojs.close();
} finally {await browser.close();writeFileSync(`${dir}/results.json`,JSON.stringify(results,null,2));}
