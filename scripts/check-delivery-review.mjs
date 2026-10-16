/* global document */
import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const browser=await chromium.launch({channel:'chrome',headless:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 await page.goto(pathToFileURL(resolve('output/review/performance-delivery.html')).href);
 assert.equal(await page.locator('details').count(),8);
 const video=page.locator('video').first();
 await video.evaluate(v=>{v.playbackRate=1;return v.play();});
 await page.waitForFunction(()=>document.querySelector('video').currentTime>=5);
 await video.screenshot({path:'output/review/radio-interaction-playing.png'});
 await page.waitForFunction(()=>document.querySelector('video').ended,{},{timeout:60000});
 const result=await video.evaluate(v=>({ended:v.ended,time:v.currentTime,duration:v.duration,rate:v.playbackRate,error:v.error}));
 assert.equal(result.error,null);assert.equal(result.rate,1);
 await writeFile('docs/engineering/delivery-review-playback.json',JSON.stringify({at:new Date().toISOString(),status:'PASS',result,scope:'Actual uncut recording played at normal speed; sampled pixels inspected separately, not subjective listening or lightweight timing.'},null,2));
 console.log('Local review hub and uncut Radio recording playback PASS');
} finally {await browser.close();}
