/* global document */
import { chromium } from 'playwright';
import { readFileSync,writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import assert from 'node:assert/strict';
const demo=JSON.parse(readFileSync('output/private-editorial/latest-demo.json','utf8'));
const browser=await chromium.launch({channel:'chrome',headless:true});const checks=[];
try{const context=await browser.newContext({viewport:{width:1200,height:900}});await context.route(/^https?:/,route=>route.abort());const page=await context.newPage();
 for(const p of demo.outputs.filter(p=>p.report)){
  const data=JSON.parse(readFileSync(p.report.json,'utf8'));await page.goto(pathToFileURL(p.report.html).href);assert.equal(await page.locator('script,iframe,img,video,audio').count(),0);
  assert.equal(await page.locator('li[id^="source-"]').count(),data.manifest.sources.length);assert.equal(await page.locator('section[id^="claim-"]').count(),data.manifest.claims.length);
  const dangling=await page.locator('a[href^="#"]').evaluateAll(links=>links.filter(a=>!document.getElementById(a.getAttribute('href').slice(1))).length);assert.equal(dangling,0);
  await page.getByRole('link',{name:'Complete bibliography',exact:true}).click();assert.ok(page.url().endsWith('#bibliography'));await page.goto(pathToFileURL(p.report.html).href);
  const shot=p.report.html.replace('.html','.png');await page.screenshot({path:shot});checks.push({digest:p.digest,readable:true,citations:data.manifest.claims.length,bibliography:data.manifest.sources.length,screenshot:shot});
 }
 await context.close();const c=await browser.newContext();const p=await c.newPage();const catalogue=(await (await p.request.get('http://127.0.0.1:3000/api/v1/programmes')).json()).data;assert.equal(catalogue.length,17);
 for(const route of ['/api/v1/editorial/import','/api/v1/staff/generations','/api/v1/staff/publish']){const r=await p.request.post('http://127.0.0.1:3000'+route,{data:{},headers:{'x-role':'publisher'}});assert.ok([401,403,404,405].includes(r.status()));checks.push({route,status:r.status(),pipelineInvoked:false});}
 for(const p of demo.outputs.filter(p=>p.report)){const r=await c.request.get('http://127.0.0.1:3000/articles/private-'+p.digest);assert.equal(r.status(),404);}
 await c.close();writeFileSync('docs/engineering/editorial-report-checks.json',JSON.stringify({at:new Date().toISOString(),status:'passed',engine:browser.version(),checks,programmes:17,limits:['Automated report structure and rendered inspection, not owner editorial approval','No fresh cross-browser/performance/listening certification']},null,2));console.log('Private reports render with complete anchors; drafts absent from reader; 17 programmes retained.');
}finally{await browser.close();}
