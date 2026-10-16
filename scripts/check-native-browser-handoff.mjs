/* global location */
import { chromium } from 'playwright';
import {spawnSync} from 'node:child_process';
import {writeFileSync} from 'node:fs';
import assert from 'node:assert/strict';
const adb='C:/Android/Sdk/platform-tools/adb.exe',device='emulator-5554';
const run=(...args)=>{const r=spawnSync(adb,['-s',device,...args],{encoding:'utf8',windowsHide:true,timeout:15000,maxBuffer:4*1024*1024});if(r.status!==0)throw Error(`Scoped Android command failed (exit ${r.status}, ${r.error?.code??'no spawn error'})`);return r.stdout;};
const pause=ms=>new Promise(ok=>setTimeout(ok,ms));
const report={at:new Date().toISOString(),scope:'Actual Android app + desktop Chrome captured-mail approval + actual Android callback. Same-device Chrome remains owner-blocked; this is an explicitly assisted cross-device test.',checks:[],transportWarnings:[]};
async function readLog(){for(let attempt=1;attempt<=3;attempt++){try{return run('logcat','-d','-s','flutter');}catch(e){report.transportWarnings.push({attempt,error:e.message});if(attempt===3)throw e;await pause(500);}}}
let browser;
try {
 const earlier=new Set([...(await readLog()).matchAll(/AGG_NATIVE_PENDING ([a-f0-9-]{36})/g)].map(m=>m[1]));
 let id;for(let i=0;i<240&&!id;i++){const log=await readLog();id=[...log.matchAll(/AGG_NATIVE_PENDING ([a-f0-9-]{36})/g)].map(m=>m[1]).find(value=>!earlier.has(value));if(!id)await pause(500);}
 assert.ok(id,'Device did not create a handoff');
 browser=await chromium.launch({channel:'chrome'});const context=await browser.newContext();const page=await context.newPage();
 await page.goto('http://127.0.0.1:3000/auth/native?id='+id);
 await page.getByRole('link',{name:'Sign in or create an account',exact:true}).click();
 const email=`native-device-${Date.now()}@example.test`;
 await page.getByLabel('Email address').fill(email);
 await page.getByRole('button',{name:'Send sign-in link',exact:true}).click();
 await page.getByRole('heading',{name:'Check the captured mailbox'}).waitFor();
 let link;for(let i=0;i<50&&!link;i++){const box=await(await fetch('http://127.0.0.1:8025/api/v1/messages?limit=100')).json();const item=box.messages.find(m=>m.To.some(t=>t.Address===email));if(item){const mail=await(await fetch('http://127.0.0.1:8025/api/v1/message/'+item.ID)).json();link=mail.Text.match(/http:\/\/127\.0\.0\.1:3000\/auth\/confirm#[^\s]+/)?.[0];}else await pause(200);}
 assert.ok(link,'Captured local mail unavailable');await page.goto(link);await page.waitForFunction(()=>!location.hash);
 assert.equal((await context.request.get('http://127.0.0.1:3000/api/v1/me/session')).status(),401);
 await page.getByRole('button',{name:'Confirm sign in',exact:true}).click();
 await page.getByRole('button',{name:'Approve native reader',exact:true}).waitFor();
 const response=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/v1/auth/native/approve');
 await page.getByRole('button',{name:'Approve native reader',exact:true}).click();
 const approved=await response;assert.equal(approved.status(),200);const callback=(await approved.json()).data.callback;
 const url=new URL(callback);assert.equal(url.protocol,'aggregator-local:');assert.equal(url.searchParams.size,2);
 // Return the actual one-use callback, without printing it or altering identity.
 assert.match(url.searchParams.get('code'),/^[a-zA-Z0-9._-]+$/);assert.match(url.searchParams.get('state'),/^[a-zA-Z0-9_-]+$/);
 run('shell','am','start','-a','android.intent.action.VIEW','-d',"'"+callback+"'",'test.example.aggregator.aggregator_mobile.localdemo');
 report.checks.push('Real native proof start, browser preflight/binding, captured mail, unauthenticated GET, explicit confirmation/approval and Android URI dispatch');
 let done=false;for(let i=0;i<180&&!done;i++){const log=await readLog();done=log.slice(log.lastIndexOf('AGG_NATIVE_PENDING '+id)).includes('AGG_NATIVE_MEMBER_DONE');if(!done)await pause(500);}assert.ok(done,'Native member journey did not complete');
 const interests=(await(await context.request.get('http://127.0.0.1:3000/api/v1/me/interests')).json()).data;
 assert.equal(interests.rules.length,1);assert.equal(interests.rules[0].target,'agg:team:manchester-city-men');assert.equal(interests.rules[0].competition,undefined);
 const bookmarks=(await(await context.request.get('http://127.0.0.1:3000/api/v1/me/bookmarks')).json()).data;assert.equal(bookmarks.length,1);assert.ok(bookmarks[0].savedVersionId);
 report.checks.push('Actual native onboarding team path and article Save persisted; same real browser account refetches exact team scope and saved version');
 const prefs=(await(await context.request.get('http://127.0.0.1:3000/api/v1/me/preferences')).json()).data;assert.equal(prefs.playbackSpeed,1.25);
 // Real browser fetch supplies its own Origin/cookies; only the synchronizer token
 // returned by that browser session is used. No fabricated native Origin.
 const changed=await page.evaluate(async ({version,articleId})=>{
  const session=(await(await fetch('/api/v1/me/session')).json()).data;
  const headers={'Content-Type':'application/json','X-CSRF-Token':session.csrfToken};
  const preference=await fetch('/api/v1/me/preferences',{method:'PATCH',headers,body:JSON.stringify({lockVersion:version,playbackSpeed:1})});
  const removal=await fetch('/api/v1/me/bookmarks/'+articleId,{method:'DELETE',headers,body:'{}'});
  return [preference.status,removal.status];
 },{version:prefs.lockVersion,articleId:bookmarks[0].articleId});assert.deepEqual(changed,[200,204]);
 let refetched=false;for(let i=0;i<120&&!refetched;i++){const log=await readLog();refetched=log.slice(log.lastIndexOf('AGG_NATIVE_PENDING '+id)).includes('AGG_NATIVE_REFETCH_DONE');if(!refetched)await pause(500);}assert.ok(refetched,'Native conflict/refetch did not complete');
 report.checks.push('Native speed preference persisted; real browser edits it and removes bookmark; native UI hits real409, retains draft, explicitly reloads and applies web value, sees removal');
 report.status='passed';
}catch(e){report.status='failed';report.error=e.name+': '+String(e.message).replace(/http[^\s]+/g,'[private URL omitted]');process.exitCode=1;}finally{await browser?.close();writeFileSync(process.argv[2] || 'docs/engineering/flutter-closeout/native-browser-assisted.json',JSON.stringify(report,null,2));console.log(JSON.stringify({status:report.status,checks:report.checks,error:report.error}));}

