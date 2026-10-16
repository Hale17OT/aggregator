import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const root='http://127.0.0.1:3000';
await mkdir('docs/engineering/evidence',{recursive:true});
const browser=await chromium.launch({channel:'chrome',headless:true});
const report={date:new Date().toISOString(),browser:browser.version(),checks:[],pretext:[],limitations:['Not a screen-reader audit or WCAG certification','Not representative performance measurements','Publication adapter is disposable memory']};
try{
  for(const javaScriptEnabled of [true,false]){
    const context=await browser.newContext({javaScriptEnabled,reducedMotion:'reduce'});const page=await context.newPage();
    for(const width of [320,360,390,768,834,1024,1440,1920])for(const theme of ['light','dark']){
      await page.setViewportSize({width,height:900});
      await page.goto(`${root}/articles/corrected-source-unavailable?theme=${theme}&variant=brief`);
      await page.locator('#sources').waitFor();await page.evaluate(()=>document.fonts.ready);
      assert.equal(await page.locator('.source-entry').count(),4);
      assert.equal(await page.locator('#source-4').getByText('Used in the full article',{exact:false}).count(),1);
      assert.equal(await page.getByRole('heading',{name:'Sources and evidence'}).count(),1);
      assert.ok(await page.locator('.correction').count()>=2);
      const measure=await page.evaluate(()=>({viewport:innerWidth,content:document.documentElement.scrollWidth,theme:document.documentElement.dataset.theme,missing:[...document.querySelectorAll('.citations a')].filter(a=>!document.querySelector(a.getAttribute('href'))).length}));
      assert.ok(measure.content<=width+1,`overflow at ${width} ${theme} JS=${javaScriptEnabled}`);assert.equal(measure.missing,0);assert.equal(measure.theme,theme);
      await page.locator('.sources-jump').click();assert.ok(page.url().endsWith('#sources'));
      report.checks.push({width,theme,javaScriptEnabled,bibliography:'pass',anchors:'pass',reflow:'pass',correction:'pass'});
      if(javaScriptEnabled&&[390,1440].includes(width)&&theme==='light')await page.screenshot({path:`docs/engineering/evidence/article-${width}.png`,fullPage:true});
    }
    await page.goto(`${root}/articles/long-headline`);await page.setViewportSize({width:320,height:900});await page.locator('h1').waitFor();
    await page.evaluate(()=>{for(const e of document.querySelectorAll('h1,h2,h3,p,a')){const s=getComputedStyle(e);e.style.fontSize=parseFloat(s.fontSize)*2+'px';e.style.lineHeight='1.6';}});
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    report.checks.push({javaScriptEnabled,longHeadline:'pass',textEnlargement:'200% at 320px, no horizontal overflow'});
    await page.goto(`${root}/articles/alderwick-evening-shuttle`);await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement?.textContent),'Skip to content');await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>document.activeElement?.id),'main');
    report.checks.push({javaScriptEnabled,keyboardSkip:'pass',reducedMotion:'context enabled; no animated reader controls'});
    await context.close();
  }
  const context=await browser.newContext();const page=await context.newPage();
  for(const width of [320,360,390,768,834,1024,1440,1920]){
    await page.setViewportSize({width,height:900});await page.goto(`${root}/lab/pretext`);
    const measured=await page.waitForFunction(()=>{const r=JSON.parse(document.querySelector('#measurement-result')?.textContent||'{}');return r.state==='measured'?r:false;});
    report.pretext.push({viewport:width,...await measured.jsonValue()});
  }
  await page.locator('#measured-title').evaluate(e=>{e.style.fontSize='48px';e.style.lineHeight='60px';});
  const enlarged=await page.waitForFunction(()=>{const r=JSON.parse(document.querySelector('#measurement-result')?.textContent||'{}');return r.state==='measured'&&r.font.includes('48px')?r:false;});report.pretext.push({textEnlargement:'200%',...await enlarged.jsonValue()});
  await page.goto(`${root}/lab/pretext?fail=library`);await page.waitForFunction(()=>document.querySelector('#measurement-result')?.textContent.includes('css-fallback'));assert.ok(await page.locator('#measured-title').isVisible());report.pretext.push({libraryFailure:'CSS remains visible'});
  await context.close();
  const failedFonts=await browser.newContext();await failedFonts.route(/\.(woff2?|ttf)(\?|$)/,route=>route.abort());const fallback=await failedFonts.newPage();await fallback.goto(`${root}/lab/pretext`);await fallback.waitForFunction(()=>document.querySelector('#measurement-result')?.textContent.includes('measured'));report.pretext.push({failedFonts:true,...JSON.parse(await fallback.locator('#measurement-result').innerText())});await failedFonts.close();
  const noJs=await browser.newContext({javaScriptEnabled:false});const staticPage=await noJs.newPage();await staticPage.goto(`${root}/lab/pretext`);assert.ok(await staticPage.locator('#measured-title').isVisible());report.pretext.push({noJavaScript:'CSS remains visible'});await noJs.close();
  await writeFile('docs/engineering/browser-checks.json',JSON.stringify(report,null,2)+'\n');console.log(`${report.checks.length} browser checks passed; ${report.pretext.length} Pretext observations recorded.`);
}finally{await browser.close();}
