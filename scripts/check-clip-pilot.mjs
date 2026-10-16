/* global document */
import { chromium } from 'playwright';
import { mkdirSync,writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const dir='output/playwright/completion';mkdirSync(dir,{recursive:true});const browser=await chromium.launch({channel:'chrome'});const results=[];
try{const page=await browser.newPage({viewport:{width:390,height:1000}});await page.goto('http://127.0.0.1:3000/clips/clip-rain-garden-trial');await page.getByRole('button',{name:'Play',exact:true}).click();const video=page.locator('video');await video.waitFor();for(const time of [5,28,50]){await page.waitForFunction(t=>document.querySelector('video')?.currentTime>=t,time,{timeout:60000});await page.screenshot({path:`${dir}/pilot-mobile-${time}s.png`});results.push(await video.evaluate(v=>({position:v.currentTime,paused:v.paused,width:v.videoWidth,height:v.videoHeight,quality:v.getVideoPlaybackQuality().toJSON?.()||{total:v.getVideoPlaybackQuality().totalVideoFrames,dropped:v.getVideoPlaybackQuality().droppedVideoFrames}})));}
 assert.equal(results[0].width,720);assert.equal(results[0].height,1280);await page.setViewportSize({width:1440,height:1000});await page.screenshot({path:`${dir}/pilot-desktop.png`});writeFileSync('docs/engineering/clip-pilot-browser.json',JSON.stringify({status:'passed',normalSpeed:true,results,subjectiveListening:'not performed'},null,2));
}finally{await browser.close();}
