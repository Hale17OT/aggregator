/* global document,innerWidth */
import {chromium} from 'playwright';
import {mkdirSync,existsSync,writeFileSync,readFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const phase=process.argv[2];if(!['before','after'].includes(phase))throw Error('Explicit phase required');
const iteration=process.argv[3];if(iteration&&!/^[1-9][0-9]*$/.test(iteration))throw Error('Invalid iteration');
const out=`output/targeted-closeout-20261016/evidence/reflow-${phase}${iteration?'-'+iteration:''}`;
if(existsSync(out))throw Error('Immutable capture destination occupied');mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'chrome'}),results=[];
try{
 for(const width of [320,360,390])for(const theme of ['light','dark'])for(const scale of [1,2]){
 const page=await browser.newPage({viewport:{width,height:568},reducedMotion:'reduce'});
 await page.goto(`http://127.0.0.1:3000/newsroom?theme=${theme}`);
 await page.locator('.broadcast-picture video').waitFor();
 await page.getByLabel('Video settings',{exact:true}).click();
 if(scale===2)await page.evaluate(()=>{for(const e of document.querySelectorAll('.prepared-broadcast button,.prepared-broadcast summary,.prepared-broadcast label,.prepared-broadcast span'))e.style.fontSize='200%';});
 await page.locator('.prepared-broadcast').scrollIntoViewIfNeeded();
 const geometry=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,offenders:[...document.querySelectorAll('body *')].map(e=>({tag:e.tagName,cls:typeof e.className==='string'?e.className:'svg',right:e.getBoundingClientRect().right,width:e.getBoundingClientRect().width})).filter(r=>r.right>innerWidth+1&&r.width>0)}));
 await page.screenshot({path:`${out}/${width}-${theme}-${scale}.png`});results.push({width,theme,scale,...geometry});await page.close();
 if(phase==='after')assert(geometry.scrollWidth<=width+1,JSON.stringify(geometry));
 }
}finally{await browser.close();writeFileSync(`${out}/results.json`,JSON.stringify({at:new Date().toISOString(),sourceHash:createHash('sha256').update(readFileSync('apps/web/app/components/BroadcastVideoPlayer.vue')).digest('hex'),results},null,2));}
