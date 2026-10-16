/* global document, URLSearchParams */
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
const b=await chromium.launch({channel:'chrome',headless:true}),checks=[];
try{
 const p=await b.newPage();const root='http://127.0.0.1:3000';
 const catalog=(await(await p.request.get(root+'/api/v1/programmes')).json()).data;
 const radio=catalog.find(p=>p.programmeId==='radio-alderwick-evening-shuttle-full');
 const broadcast=catalog.find(p=>p.kind==='broadcast'&&p.videoRendition&&p.articleSlugs.includes('alderwick-evening-shuttle'));
 await p.goto(root+'/articles/alderwick-evening-shuttle');
 await p.getByRole('link',{name:'Listen to this story',exact:true}).click();
 await p.locator('.receiver-object').waitFor();assert.ok(p.url().includes(radio.programmeId));
 assert.equal(await p.locator('audio').evaluate(a=>a.paused),true);
 await p.getByRole('button',{name:'Play selected edition',exact:true}).click();await p.waitForFunction(()=>!document.querySelector('audio').paused);
 await p.locator('audio').evaluate(a=>a.dataset.handoff='root');
 await p.getByRole('link',{name:'Read this story',exact:true}).click();await p.locator('#sources').waitFor();
 assert.equal(await p.locator('audio').getAttribute('data-handoff'),'root');assert.equal(await p.locator('audio').evaluate(a=>a.paused),false);
 checks.push('Article selects its matching narration paused; explicit play survives navigation on the same root audio');
 await p.getByRole('link',{name:'Watch this story',exact:true}).click();await p.locator('video').waitFor();
 assert.equal(await p.locator('video').evaluate(v=>v.paused),true);
 await p.locator('.broadcast-controls').getByRole('button',{name:'Play',exact:true}).click();await p.waitForFunction(()=>!document.querySelector('video').paused);
 assert.equal(await p.locator('audio').evaluate(a=>a.paused),true);checks.push('Matching Newsroom starts only by gesture and owns sound');
 const section=broadcast.segments.find(s=>s.blockIds.length===1&&s.startMs>15000);
 const query=new URLSearchParams({programme:broadcast.programmeId,story:section.articleSlug,version:section.articleVersionId,block:section.blockIds[0]});
 await p.goto(root+'/newsroom?'+query);await p.waitForFunction(()=>document.querySelector('video')?.readyState>=1);
 const expected=broadcast.segments.find(s=>s.blockIds.length===1&&s.blockIds[0]===section.blockIds[0]).startMs/1000;
 assert.ok(Math.abs(await p.locator('video').evaluate(v=>v.currentTime)-expected)<.2);assert.equal(await p.locator('video').evaluate(v=>v.paused),true);
 checks.push('Shared section maps to that edit’s own measured boundary, paused');
 await p.goto(root+'/articles/alderwick-rain-gardens');const rainVideo=catalog.some(p=>p.videoRendition&&p.articleSlugs.includes('alderwick-rain-gardens'));
 if(!rainVideo){assert.equal(await p.getByRole('link',{name:'Watch this story',exact:true}).count(),0);await p.getByText('Video not prepared for this version',{exact:true}).waitFor();}
 await p.goto(root+'/newsroom?programme=not-prepared');await p.getByRole('status').filter({hasText:'not prepared'}).waitFor();assert.equal(await p.locator('video').count(),0);
 await p.goto(root+`/radio?programme=${radio.programmeId}&story=alderwick-evening-shuttle&version=stale`);await p.getByRole('status').filter({hasText:'not prepared'}).waitFor();assert.equal(await p.locator('.receiver-object').count(),0);assert.equal(await p.getByRole('button',{name:'Play selected edition',exact:true}).isDisabled(),true);
 checks.push('Missing broadcast and stale requested revision cannot select an unrelated default');
 await writeFile('docs/engineering/programme-handoff.json',JSON.stringify({at:new Date().toISOString(),status:'PASS',checks,scope:'Guest browser correctness; member preferences and new treatment coverage are separate.'},null,2));console.log(checks);
}finally{await b.close();}

