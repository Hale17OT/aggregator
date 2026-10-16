import {selectControl} from './select-control.mjs';
/* global document, innerWidth, Event, navigator, getComputedStyle */
import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const root=process.env.DEMO_URL||'http://127.0.0.1:3000';
const browser=await chromium.launch({channel:'chrome',headless:true});
const report={checkedAt:new Date().toISOString(),checks:[],limitations:['Functional browser evidence is not owner visual/motion acceptance.','Chromium only; physical mobile, actual hidden-tab and assistive-technology behavior remain unverified.']};
const check=(name,details={})=>report.checks.push({name,status:'PASS',...details});
await mkdir('output/review/broadcast',{recursive:true});
try{
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'}),page=await context.newPage();
 const programmes=(await (await page.request.get(root+'/api/v1/programmes')).json()).data;
 for(const variant of ['solo','duo'])assert.ok(programmes.find(p=>p.variant===variant)?.videoRendition,variant+' requires actual prepared rendition');
 await page.goto(root+'/radio');await page.getByRole('button',{name:'Play selected edition',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('audio').paused);await page.getByRole('link',{name:'Newsroom',exact:true}).click();await page.locator('.broadcast-picture video').waitFor();await page.waitForFunction(()=>document.querySelector('video').readyState>=1);assert.ok(await page.locator('audio').evaluate(a=>!a.paused));check('Opening Newsroom while Radio plays preserves root audio ownership');await page.waitForFunction(()=>document.querySelector('.broadcast-picture video').readyState>=1);
 assert.ok(await page.locator('video').evaluate(v=>v.paused&&v.currentTime===0));check('Opening Newsroom does not autoplay');
 await page.getByRole('button',{name:'Play',exact:true}).first().click();await page.waitForFunction(()=>{const v=document.querySelector('.broadcast-picture video');return !v.paused&&v.currentTime>.4;});
 assert.ok(await page.locator('audio').evaluate(a=>a.paused));check('Video owns audible playback; root WAV is paused');
 await page.locator('.audio-mini').getByRole('button',{name:'Play',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('audio').paused);assert.ok(await page.locator('video').evaluate(v=>v.paused));await page.locator('video').evaluate(v=>v.dispatchEvent(new Event('timeupdate')));await page.waitForTimeout(200);assert.equal(await page.evaluate(()=>navigator.mediaSession?.metadata?.album),'Radio');check('Returning to WAV clears video ownership even after delayed video events');await page.locator('.prepared-broadcast').getByRole('button',{name:'Play',exact:true}).click();await page.waitForFunction(()=>!document.querySelector('video').paused);
 await page.getByRole('button',{name:'Pause',exact:true}).first().click();
 const solo=programmes.find(p=>p.variant==='solo'&&p.mediaTreatment==='narration_over_visual'&&p.articleSlugs.includes('alderwick-evening-shuttle'));
 for(const seconds of [12.3,...solo.segments.filter(s=>s.visual?.kind==='video').map(s=>(s.startMs+200)/1000)]){
  await page.getByRole('slider',{name:'Programme position',exact:true}).fill(String(Number(seconds.toFixed(1))));
  await page.waitForFunction(t=>Math.abs(document.querySelector('.broadcast-picture video').currentTime-t)<.2,seconds);
  const segment=solo.segments.find(s=>seconds*1000>=s.startMs&&seconds*1000<s.endMs);
  await page.waitForFunction(id=>document.querySelector(`[id="turn-${id}"]`)?.getAttribute('aria-current')==='true',segment.id);
 }
 check('Mid-sentence and clip-boundary seeks update transcript from video clock');
 await page.getByLabel('Video settings',{exact:true}).click();
 for(const speed of ['0.75','1','1.25','1.5']){await selectControl(page,page.getByLabel('Video speed',{exact:true}),speed);assert.equal(await page.locator('video').evaluate(v=>v.playbackRate),Number(speed));}check('Video playback rates');
 await page.getByRole('slider',{name:'Volume',exact:true}).fill('0.4');assert.equal(await page.locator('video').evaluate(v=>v.volume),.4);
 await page.getByRole('button',{name:'Hide captions',exact:true}).click();assert.equal(await page.locator('video').evaluate(v=>v.textTracks[0].mode),'hidden');await page.getByRole('button',{name:'Show captions',exact:true}).click();assert.equal(await page.locator('video').evaluate(v=>v.textTracks[0].mode),'showing');check('Video volume and WebVTT caption toggle');
 await page.getByRole('slider',{name:'Programme position',exact:true}).fill('100');await selectControl(page,page.getByLabel('Presenter format'),'duo');await page.waitForFunction(()=>document.querySelector('video').readyState>=1);assert.ok(await page.locator('video').evaluate(v=>v.paused));const duo=programmes.find(p=>p.variant==='duo'&&p.mediaTreatment==='narration_over_visual'&&p.articleSlugs.includes('alderwick-evening-shuttle'));const section=solo.segments.find(s=>100000>=s.startMs&&100000<s.endMs);const article=solo.chapters.find(c=>100000>=c.startMs&&100000<c.endMs).articleSlug;assert.ok(Math.abs(await page.locator('video').evaluate(v=>v.currentTime)-(section.blockIds.length===1?(duo.segments.find(s=>s.blockIds.length===1&&s.blockIds.includes(section.blockIds[0]))?.startMs??duo.chapters.find(c=>c.articleSlug===article).startMs):duo.chapters.find(c=>c.articleSlug===article).startMs)/1000)<.2);check('Solo/duo change maps shared story and pauses');
 await page.getByRole('button',{name:'Listen instead',exact:true}).last().click();await page.waitForFunction(()=>!document.querySelector('audio').paused);assert.equal(await page.locator('.broadcast-picture video').count(),0);await page.getByRole('button',{name:'Return to video',exact:true}).click();await page.locator('video').waitFor();assert.ok(await page.locator('audio').evaluate(a=>a.paused));check('Explicit lower-motion audio alternative excludes competing video');
 for(const width of [320,390,834,1440])for(const theme of ['light','dark']){await page.setViewportSize({width,height:1000});await page.goto(root+'/newsroom?theme='+theme);await page.locator('.broadcast-picture video').waitFor();if(width<=390){await page.waitForFunction(()=>document.querySelector('video').readyState>=1);await page.getByRole('slider',{name:'Programme position',exact:true}).fill('15');await page.locator('.broadcast-mobile-caption').waitFor();assert.ok(await page.locator('.broadcast-mobile-caption').evaluate(e=>parseFloat(getComputedStyle(e).fontSize)>=14));assert.equal(await page.locator('video').evaluate(v=>v.textTracks[0].mode),'hidden');}assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'overflow '+width+' '+theme);if(width===390||width===1440)await page.screenshot({path:`output/review/broadcast/newsroom-${theme}-${width}.png`,fullPage:true});}check('320/390/834/1440 light/dark reflow with reduced-motion alternative and readable external mobile WebVTT captions');
 const nojs=await browser.newContext({javaScriptEnabled:false});const ssr=await nojs.newPage();await ssr.goto(root+'/newsroom');assert.ok(await ssr.locator('.transcript-turns li').count()>5);assert.ok(await ssr.locator('.source-entry a').count()>=3);assert.equal(await ssr.locator('video[controls]').count(),1);await nojs.close();check('SSR complete transcript/sources and native no-JavaScript video controls');
 await page.route('**/api/v1/programme-assets/**',route=>route.request().url()===root+solo.videoRendition.url?route.fulfill({status:404,body:'Unavailable'}):route.continue());await page.goto(root+'/newsroom');await page.getByText('This prepared video is unavailable.',{exact:false}).waitFor();assert.ok(await page.locator('audio').evaluate(a=>a.paused));await page.unrouteAll({behavior:'wait'});await page.getByRole('button',{name:'Retry video',exact:true}).click();await page.waitForFunction(()=>document.querySelector('video').readyState>=1);check('Missing rendition has honest failure and explicit retry recovery');
 let release;const held=new Promise(resolve=>{release=resolve;});let requested=false;
 await page.route('**/api/v1/programme-assets/**',async route=>{if(route.request().url()===root+solo.videoRendition.url){requested=true;await held;}await route.continue();});
 await page.goto(root+'/newsroom',{waitUntil:'domcontentloaded'});await page.locator('.broadcast-picture video').waitFor();await page.getByRole('button',{name:'Play',exact:true}).first().click();await page.waitForTimeout(400);assert.equal(requested,true);assert.ok(await page.locator('video').evaluate(v=>v.currentTime===0));assert.ok(await page.locator('audio').evaluate(a=>a.paused));await page.getByText('Loading prepared video…',{exact:true}).waitFor();release();await page.waitForFunction(()=>document.querySelector('video').currentTime>.2);await page.getByRole('button',{name:'Pause',exact:true}).first().click();await page.unrouteAll({behavior:'wait'});check('Held video request shows loading without second clock and resumes actual media after release');
 const account=await browser.newContext(),email=`broadcast-${Date.now()}@example.test`;
 const pre=(await (await account.request.get(root+'/api/v1/auth/preflight')).json()).data;
 const headers={origin:root,'x-csrf-token':pre.csrfToken};
 assert.equal((await account.request.post(root+'/api/v1/auth/request',{headers,data:{email}})).status(),202);
 let token;
 for(let n=0;n<30&&!token;n++){const box=await (await fetch('http://127.0.0.1:8025/api/v1/messages?limit=100')).json();const item=box.messages.find(m=>m.To.some(to=>to.Address===email));if(item){const mail=await (await fetch('http://127.0.0.1:8025/api/v1/message/'+item.ID)).json();token=mail.Text.match(/auth\/confirm#([^\s]+)/)?.[1];}else await new Promise(resolve=>setTimeout(resolve,200));}
 assert.ok(token);assert.equal((await account.request.post(root+'/api/v1/auth/confirm',{headers,data:{token}})).status(),200);
 const member=await account.newPage();const listeningLoaded=member.waitForResponse(r=>r.url().endsWith('/api/v1/me/listening')&&r.status()===200);await member.goto(root+'/newsroom');await listeningLoaded;
 await member.getByRole('button',{name:'Play',exact:true}).first().click();await member.waitForFunction(()=>document.querySelector('video').currentTime>.3);await member.getByRole('slider',{name:'Programme position',exact:true}).fill('28');await member.getByRole('button',{name:'Pause',exact:true}).first().click();
 let progress;
 for(let n=0;n<30;n++){const state=(await (await account.request.get(root+'/api/v1/me/listening')).json()).data;progress=state.progress.find(p=>p.programmeId===solo.programmeId);if(progress?.positionMs>=27000)break;await member.waitForTimeout(200);}
 assert.ok(progress?.positionMs>=27000,'Member stores actual video timeline');assert.equal(progress.renditionKey,solo.videoRendition.renditionKey);check('Durable member progress stores actual video time and video rendition identity');
 await member.reload();const persisted=(await (await account.request.get(root+'/api/v1/me/listening')).json()).data.progress.find(p=>p.programmeId===solo.programmeId);assert.equal(persisted.renditionKey,solo.videoRendition.renditionKey);assert.equal(persisted.positionMs,progress.positionMs);await member.goto(root+'/library');await member.getByRole('button',{name:/Resume at/}).first().click();await member.waitForURL('**/newsroom?**');await member.waitForFunction(()=>document.querySelector('video')?.readyState>=1);const resumed=await member.locator('video').evaluate(v=>({time:v.currentTime,paused:v.paused}));assert.ok(Math.abs(resumed.time-progress.positionMs/1000)<.2);assert.equal(resumed.paused,true);assert.ok(await member.locator('audio').evaluate(a=>a.paused));check('Library resumes matching video rendition paused at saved video time');await account.close();
 report.status='passed';await context.close();
}catch(error){report.status='failed';report.error=String(error);throw error;}finally{await browser.close();await writeFile('docs/engineering/broadcast-video-ui-checks.json',JSON.stringify(report,null,2)+'\n');}
console.log(`Prepared broadcast UI: ${report.checks.length} groups ${report.status}`);













