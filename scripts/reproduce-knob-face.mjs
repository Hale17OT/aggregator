/* global document */
import {chromium} from 'playwright';
import {mkdir,writeFile,copyFile} from 'node:fs/promises';
const out='output/playwright/interactive-controls';await mkdir(out,{recursive:true});
await mkdir('.cache/performance-baseline',{recursive:true});
for(const name of ['solo','duo'])await copyFile(`docs/engineering/broadcast-${name}-render.json`,`.cache/performance-baseline/${name}.json`);
await copyFile('packages/broadcast/scene.mjs','.cache/performance-baseline/scene.mjs');
const browser=await chromium.launch({channel:'chrome',headless:true});
try{const page=await browser.newPage({viewport:{width:1440,height:1050}});await page.goto('http://127.0.0.1:3000/radio');await page.locator('.rotary-knob').first().waitFor();await page.getByRole('button',{name:'Play selected edition',exact:true}).click();await page.waitForFunction(()=>document.querySelector('audio').currentTime>.2);await page.getByRole('button',{name:'Pause',exact:true}).first().click();
const results=[];for(const control of ['volume-control','chapter-control']){const face=page.locator(`.${control} .rotary-knob`);const box=await face.boundingBox();const before=await page.locator('audio').evaluate(a=>({volume:a.volume,time:a.currentTime,src:a.src}));await page.mouse.move(box.x+box.width-4,box.y+box.height/2);await page.mouse.down();for(let i=0;i<=20;i++){const a=-Math.PI*i/20;await page.mouse.move(box.x+box.width/2+24*Math.cos(a),box.y+box.height/2+24*Math.sin(a));}await page.mouse.up();const after=await page.locator('audio').evaluate(a=>({volume:a.volume,time:a.currentTime,src:a.src}));results.push({control,before,after,faceTag:await face.evaluate(e=>e.tagName),changed:JSON.stringify(before)!==JSON.stringify(after)});}
await page.screenshot({path:`${out}/before-controls.png`});await writeFile('docs/engineering/knob-reproduction.json',JSON.stringify({at:new Date().toISOString(),results},null,2));console.log(results);
}finally{await browser.close();}
