import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { createServer as createHttpServer } from 'node:http';
import { mkdir, writeFile } from 'node:fs/promises';
import { createApp } from '../apps/api/src/app.ts';
import { cookieProfile, sessionCookie } from '../apps/api/src/member-http.ts';
import { createFixtureRepository } from '../packages/test-fixtures/src/index.ts';
import { MemoryMemberRepository, fixtureIssuer, fixtureUsers, sessionLifetimes } from '../packages/test-fixtures/src/member.ts';

const report={date:new Date().toISOString(),status:'running',checks:[],lifetimes:sessionLifetimes,limitations:['Fixture-only memory identities, not external authentication or staff MFA','Loopback HTTP cookie exception; no deployed HTTPS browser test','Built Nuxt server and real Express API; no public fixture issuer','No screenshot, tracing or browser storage-state file is created']};
const check=name=>report.checks.push(name);
// Reserve a free port only for this owned, temporary Nuxt process.
const probe=createServer();probe.listen(0,'127.0.0.1');await once(probe,'listening');const webPort=probe.address().port;await new Promise(resolve=>probe.close(resolve));
const origin=`http://127.0.0.1:${webPort}`,store=new MemoryMemberRepository(),articles=createFixtureRepository();
const profile=cookieProfile(origin,'test');const issue=fixtureIssuer(store,{mode:'local-test',nodeEnv:'test'});
const api=createApp(articles,{identity:store,members:store,profile}).listen(0,'127.0.0.1');await once(api,'listening');
const internal=`http://127.0.0.1:${api.address().port}`;
let web,browser,hostileServer;let serverLog='';const tokens=[];
try{
 web=spawn(process.execPath,['apps/web/.output/server/index.mjs'],{env:{...process.env,NODE_ENV:'production',HOST:'127.0.0.1',PORT:String(webPort),NUXT_API_BASE:internal},stdio:['ignore','pipe','pipe'],windowsHide:true});
 web.stdout.on('data',data=>{serverLog+=data;});web.stderr.on('data',data=>{serverLog+=data;});
 let ready=false;for(let i=0;i<100;i++){if(web.exitCode!==null)throw new Error('Owned Nuxt process exited');try{if((await fetch(origin+'/api/v1/articles')).ok){ready=true;break;}}catch{/* Startup connection refused until owned server is ready. */}await new Promise(r=>setTimeout(r,100));}assert.ok(ready,'Owned Nuxt server must start');
 browser=await chromium.launch({channel:'chrome',headless:true});report.browser=browser.version();
 const contexts=[];
 for(const user of [fixtureUsers.a,fixtureUsers.b]){
   const token=await issue(user);tokens.push(token);const context=await browser.newContext();contexts.push(context);
   // Trusted bootstrap installs the exact cookie attributes; no web route mints sessions.
   const header=sessionCookie(profile,token);assert.ok(header.includes('HttpOnly')&&!header.includes('Domain=')&&!header.includes('Secure'));
   await context.addCookies([{name:profile.name,value:token,url:origin,httpOnly:true,secure:false,sameSite:'Lax'}]);
 }
 const pages=await Promise.all(contexts.map(c=>c.newPage()));await Promise.all(pages.map(p=>p.goto(origin+'/articles/alderwick-evening-shuttle')));
 const client=async(page,path,method='GET',body=undefined,csrf=undefined)=>page.evaluate(async({path,method,body,csrf})=>{
   const response=await fetch(path,{method,headers:{'content-type':'application/json',...(csrf?{'x-csrf-token':csrf}:{})},body:body===undefined?undefined:JSON.stringify(body)});
   return {status:response.status,text:await response.text(),cache:response.headers.get('cache-control')};
 },{path:'/api/v1'+path,method,body,csrf});
 const sessions=await Promise.all(pages.map(p=>client(p,'/me/session')));assert.deepEqual(sessions.map(r=>r.status),[200,200]);
 const views=sessions.map(r=>JSON.parse(r.text).data);assert.deepEqual(views.map(v=>v.user.id),[fixtureUsers.a,fixtureUsers.b]);assert.ok(sessions.every(r=>r.cache.includes('no-store')));check('Two HttpOnly fixture sessions cross fixed Nuxt-to-Express path with isolated request identity');
 for(let i=0;i<pages.length;i++){
   const page=pages[i],cookies=await contexts[i].cookies(origin);const cookie=cookies.find(c=>c.name===profile.name);assert.ok(cookie.httpOnly&&cookie.sameSite==='Lax'&&!cookie.secure&&cookie.path==='/');
   const exposed=await page.evaluate(()=>({cookie:globalThis.document.cookie,html:globalThis.document.documentElement.outerHTML,storage:JSON.stringify({...globalThis.localStorage,...globalThis.sessionStorage})}));
   for(const token of tokens)assert.ok(!JSON.stringify(exposed).includes(token),'Bearer credential must not be rendered or script-readable');
   assert.ok(!exposed.cookie.includes(profile.name));
 }
 check('Cookie attributes verified; session bearer absent from globalThis.document.cookie, rendered SSR/Nuxt payload and web storage');
 assert.equal((await client(pages[0],'/me/preferences','PATCH',{theme:'light',lockVersion:0},views[0].csrfToken)).status,200);
 assert.equal((await client(pages[1],'/me/preferences','PATCH',{textSize:'large',lockVersion:0},views[1].csrfToken)).status,200);
 const prefs=await Promise.all(pages.map(p=>client(p,'/me/preferences')));assert.equal(JSON.parse(prefs[0].text).data.textSize,'standard');assert.equal(JSON.parse(prefs[1].text).data.theme,'dark');
 const id=articles.list().find(d=>d.state==='published').id;
 assert.equal((await client(pages[0],`/me/bookmarks/${id}`,'PUT',{},views[0].csrfToken)).status,200);
 assert.equal(JSON.parse((await client(pages[1],'/me/bookmarks')).text).data.length,0);check('Real browser same-origin writes pass CSRF; preferences and bookmarks remain owner-isolated');
 assert.equal((await client(pages[0],'/auth/logout','POST',{})).status,403);
 assert.equal((await client(pages[0],'/auth/logout','POST',{},views[1].csrfToken)).status,403);
 assert.equal((await client(pages[0],'/auth/logout')).status,404);check('Missing and cross-session CSRF tokens rejected; GET logout cannot mutate');
 hostileServer=createHttpServer((_req,res)=>{res.setHeader('Content-Type','text/html');res.end('<!doctype html><title>Fictional hostile origin test</title>');}).listen(0,'127.0.0.1');await once(hostileServer,'listening');
 const hostilePage=await contexts[0].newPage();await hostilePage.goto(`http://127.0.0.1:${hostileServer.address().port}`);
 // Same-site but cross-origin: cookies may be sent, so SameSite alone is insufficient.
 await hostilePage.evaluate(async origin=>{await fetch(origin+'/api/v1/auth/logout',{method:'POST',mode:'no-cors',credentials:'include',headers:{'content-type':'text/plain'},body:'{}'});},origin);
 assert.equal((await client(pages[0],'/me/session')).status,200);await hostilePage.close();check('Real cross-origin browser logout attempt does not invalidate session');
 const hostile=await pages[0].evaluate(async csrf=>{const r=await fetch('/api/v1/auth/logout',{method:'POST',headers:{'content-type':'application/json','x-csrf-token':csrf},body:'{}'});return r.status;},'invalid');assert.equal(hostile,403);
 assert.equal((await client(pages[0],'/auth/logout','POST',{},views[0].csrfToken)).status,204);assert.ok(!(await contexts[0].cookies(origin)).some(c=>c.name===profile.name));assert.equal((await client(pages[0],'/me/session')).status,401);assert.equal((await client(pages[1],'/me/session')).status,200);check('Logout passes through Nuxt Set-Cookie, clears browser cookie, revokes only current session');
 const anon=await browser.newContext({javaScriptEnabled:false});const page=await anon.newPage();await page.goto(origin+'/articles/alderwick-evening-shuttle?variant=brief');assert.equal(await page.locator('.source-entry').count(),4);await page.locator('a[href="#sources"]').first().click();assert.ok(page.url().endsWith('#sources'));assert.equal(await page.locator('#source-4').count(),1);await anon.close();check('Anonymous no-JavaScript direct article, source jump and full four-entry bibliography survive');
 const badProxy=await fetch(origin+'/api/v1/me/session?url=https://example.com');assert.equal(badProxy.status,404);
 api.close();await once(api,'close');assert.equal((await client(pages[1],'/me/session')).status,503);check('Fixed proxy rejects extra target/query input and fails closed when internal API is unavailable');
 for(const token of tokens)assert.ok(!serverLog.includes(token),'Bearer credential must not be logged');check('Captured owned-server output contains no bearer credential');
 report.status='passed';console.log(`Identity browser: ${report.checks.length} checks passed through built Nuxt and Express.`);
}catch(error){report.status='failed';report.failure='Assertion or startup failure; credentials intentionally excluded from report';throw error;}
finally{
 await browser?.close();if(hostileServer?.listening){hostileServer.close();await once(hostileServer,'close');}if(web&&web.exitCode===null){web.kill();await once(web,'exit');}if(api.listening){api.close();await once(api,'close');}
 await mkdir('docs/engineering',{recursive:true});await writeFile('docs/engineering/identity-browser-checks.json',JSON.stringify(report,null,2)+'\n');
}
