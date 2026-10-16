import {chromium} from 'playwright';
import {mkdirSync,writeFileSync,existsSync} from 'node:fs';
const phase=process.argv[2];
if(!['before','after'].includes(phase))throw Error('Explicit before/after capture phase required');
const dir=`output/targeted-closeout-20261016/evidence/web-${phase}`;
if(existsSync(dir))throw Error('Immutable capture occupied');mkdirSync(dir,{recursive:true});
const browser=await chromium.launch({channel:'chrome'}),results=[];
try {for(const [width,height] of [[1440,900],[1280,640],[390,844]]){
 const page=await browser.newPage({viewport:{width,height}});
 await page.goto('http://127.0.0.1:3000/clips');await page.locator('video').waitFor();await page.waitForTimeout(900);
 await page.screenshot({path:`${dir}/${width}x${height}-paused.png`});
 const play=page.getByRole('button',{name:'Play',exact:true});await play.first().click();await page.waitForTimeout(1600);
 results.push({width,height,state:await page.locator('video').evaluate(v=>({paused:v.paused,time:v.currentTime,rect:JSON.stringify(v.getBoundingClientRect())}))});
 await page.screenshot({path:`${dir}/${width}x${height}-playing.png`});
 await page.getByRole('button',{name:'Sources',exact:true}).click();await page.waitForTimeout(200);
 await page.screenshot({path:`${dir}/${width}x${height}-sources.png`});await page.close();
}}finally{await browser.close();writeFileSync(`${dir}/states.json`,JSON.stringify(results,null,2));}

