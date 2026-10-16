
import { chromium } from 'playwright';
import { mkdirSync,writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
const stage=process.argv[2]||'after',dir='output/playwright/completion';mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({channel:'chrome'}),results=[];
try{const page=await browser.newPage();for(const route of ['radio','newsroom','search','sign-in'])for(const width of [320,390,834,1440])for(const theme of ['light','dark']){
 await page.setViewportSize({width,height:1000});await page.goto(`http://127.0.0.1:3000/${route}?theme=${theme}`);await page.waitForTimeout(400);
 const controls=page.locator('.field-select,.combo-icon:has(svg)');const count=await controls.count();
 for(let i=0;i<count;i++){const control=controls.nth(i);if(!await control.isVisible())continue;
 const data=await control.evaluate(e=>{const s=e.querySelector('.field-chevron'),r=e.getBoundingClientRect(),b=s?.getBoundingClientRect();return {label:e.textContent,svg:e.querySelectorAll('.field-chevron svg').length,dy:b?Math.abs(b.y+b.height/2-r.y-r.height/2):null};});
 if(stage==='after'){assert.equal(data.svg,1);assert.ok(data.dy<.6,JSON.stringify(data));}
 results.push({route,width,theme,...data});if(i===0&&[390,1440].includes(width))await control.screenshot({path:`${dir}/${stage}-${route}-${width}-${theme}.png`});
 }
 }writeFileSync(`${dir}/chevron-${stage}.json`,JSON.stringify({at:new Date().toISOString(),browser:browser.version(),results},null,2));console.log(`${stage}: ${results.length} controls inspected`);
}finally{await browser.close();}
