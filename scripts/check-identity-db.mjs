import { Pool } from 'pg';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createServer } from 'node:net';
import { randomUUID } from 'node:crypto';
import { join } from 'node:path';
import { writeFileSync } from 'node:fs';
import assert from 'node:assert/strict';
import { withDisposableDatabase } from './disposable-database.mjs';
import { migrations,migrate } from './db-migrations.mjs';
import { PostgresMemberUnit,poolConfig } from '../packages/db/src/member.ts';
import { FixtureMaintenance } from '../packages/db/src/maintenance.ts';
import { fixtureIssuer,fixtureUsers } from '../packages/test-fixtures/src/member.ts';
import { createFixtureRepository } from '../packages/test-fixtures/src/index.ts';
import { IdentityService } from '../packages/domain/src/identity.ts';
import { MemberService } from '../packages/domain/src/member.ts';
import { memberContract } from '../tests/member-contract.ts';
import { chromium } from 'playwright';
import { createApp } from '../apps/api/src/app.ts';
import { cookieProfile } from '../apps/api/src/member-http.ts';

const report={date:new Date().toISOString(),status:'running',checks:[],limitations:['Disposable fictional PostgreSQL 18 only; local trust is not production authentication','Public articles still use existing in-memory safe projection','No external identity/MFA/publication or hosted CI','No uncertain COMMIT outcome claimed as verified rollback']};
const check=name=>{report.checks.push(name);console.log('Verified: '+name);};
const deferred=()=>{let resolve;const promise=new Promise(r=>{resolve=r;});return {promise,resolve};};
const processes=new Set();let capturedLogs='';const secrets=[];
async function startApi(manifest,origin){
 const env={...process.env,NODE_ENV:'test',PORT:'0',APP_ORIGIN:origin,PERSISTENCE_ADAPTER:'postgresql',DISPOSABLE_DB_TARGET:manifest,FIXTURE_POOL_SIZE:'1'};
 delete env.DATABASE_URL;delete env.FIXTURE_SESSION_ISSUANCE;for(const key of Object.keys(env))if(key.startsWith('PG'))delete env[key];
 const child=spawn(process.execPath,['--import','tsx','apps/api/src/server.ts'],{env,stdio:['ignore','pipe','pipe','ipc'],windowsHide:true});processes.add(child);
 child.stdout.on('data',d=>{capturedLogs+=d;});child.stderr.on('data',d=>{capturedLogs+=d;});
 const ready=await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('API startup timeout')),7000);child.once('message',m=>{globalThis.clearTimeout(timer);resolve(m);});child.once('exit',()=>{globalThis.clearTimeout(timer);reject(new Error('API startup failed'));});});
 return {child,base:`http://127.0.0.1:${ready.port}/api/v1`};
}
async function stop(child){if(child.exitCode===null){child.kill();await once(child,'exit');}processes.delete(child);}
function client(base,origin){
 const request=(path,token,method='GET',body,headers={})=>fetch(base+path,{method,headers:{'content-type':'application/json',...(token?{cookie:`agg_session=${token}`}:{ }),...headers},body:body===undefined?undefined:JSON.stringify(body)});
 const write=async(path,token,method,body={})=>{const inspect=await request('/me/session',token);if(inspect.status!==200)return inspect;const csrf=(await inspect.json()).data.csrfToken;return request(path,token,method,body,{origin,'x-csrf-token':csrf});};
 return {request,write};
}
try{
 await withDisposableDatabase(async harness=>{
 const {root,data,port,systemIdentifier,version,createDatabase,verify}=harness;
 const db=createDatabase('aggregator_identity');migrate(db,migrations(join(root,'packages/db/migrations')));verify('aggregator_identity');
 const target={purpose:'aggregator-disposable-pg18',data,host:'127.0.0.1',port,database:'aggregator_identity',systemIdentifier};
 report.target={...target,version};const manifest=join(data,'runtime-target.json');writeFileSync(manifest,JSON.stringify(target));
 for(const size of [0,5,Number.NaN])assert.throws(()=>poolConfig(target,'agg_api_login',size));
 const admin=new Pool(poolConfig(target,'agg_bootstrap',3)),unit=new PostgresMemberUnit(target,1),maintenance=new FixtureMaintenance(target);
 let browser;
 try{
  // Seed on the same verified connection; no API role is allowed these operations.
  const seed=await admin.connect();try{
   const actual=(await seed.query('SELECT public.fixture_target_identity() AS target')).rows[0].target;assert.equal(actual.system,systemIdentifier);
   await seed.query('BEGIN');await seed.query('SET LOCAL ROLE agg_owner');
   for(const role of ['reader','editor','publisher','curator','rights_reviewer','operator','administrator'])await seed.query('INSERT INTO public.roles(code,name) VALUES($1,$1)',[role]);
   for(const [name,id] of Object.entries(fixtureUsers)){
    await seed.query('INSERT INTO public.users(id,email_normalized,display_name) VALUES($1,$2,$3)',[id,`${name}@example.com`,`Fictional ${name}`]);
    await seed.query('INSERT INTO public.user_preferences(user_id,theme) VALUES($1,$2)',[id,name==='b'?'dark':'system']);
    for(const role of name==='staff'?['publisher','administrator']:['reader'])await seed.query('INSERT INTO public.user_roles(user_id,role_code) VALUES($1,$2)',[id,role]);
   }
   const articles=createFixtureRepository().list().filter(d=>d.state==='published');
   for(const a of articles){const cluster=randomUUID();await seed.query('INSERT INTO public.story_clusters(id,label) VALUES($1,$2)',[cluster,'Fictional bookmark prerequisite']);await seed.query('INSERT INTO public.articles(id,cluster_id,slug) VALUES($1,$2,$3)',[a.id,cluster,a.slug]);await seed.query('INSERT INTO public.article_versions(id,article_id,cluster_id,version_number,headline,content_hash,evidence_hash,approval_hash,evidence_cutoff_at) VALUES($1,$2,$3,1,$4,$5,$5,$5,now())',[a.versionId,a.id,cluster,a.headline,'fixture-unpublished']);}
   await seed.query('COMMIT');
  }catch(e){await seed.query('ROLLBACK');throw e;}finally{seed.release();}
  check('Verified PG18 target; seven ordered migrations; consistent unpublished article/version prerequisites and fictional members seeded');
  const issue=fixtureIssuer(maintenance,{mode:'local-test',nodeEnv:'test'});
  const waitForBlockedRuntime=async()=>{
    for(let i=0;i<80;i++){
      const r=await admin.query("SELECT count(*) FROM pg_stat_activity WHERE usename='agg_api_login' AND datname=current_database() AND wait_event_type='Lock'");
      if(Number(r.rows[0].count)>0)return;
      await new Promise(resolve=>setTimeout(resolve,5));
    }
    throw new Error('Expected runtime lock barrier was not reached');
  };
  const a=await issue(fixtureUsers.a),b=await issue(fixtureUsers.b),revoked=await issue(fixtureUsers.b);secrets.push(a,b,revoked);
  const origin='http://127.0.0.1:3000';let api1=await startApi(manifest,origin);const api2=await startApi(manifest,origin);
  let c1=client(api1.base,origin);const c2=client(api2.base,origin);const article=createFixtureRepository().list()[0];
  await memberContract(c1,a,b,article.id);check('Shared memory/PostgreSQL member HTTP contract passes on PostgreSQL');
  const beforePrefs=(await (await c1.request('/me/preferences',a)).json()).data;
  const beforeBookmarks=(await (await c1.request('/me/bookmarks',a)).json()).data;
  const beforeSession=(await (await c1.request('/me/session',a)).json()).data;
  assert.equal((await c2.request('/me/session',a)).status,200);
  assert.equal((await c2.write('/auth/logout',revoked,'POST')).status,204);
  await stop(api1.child);api1=await startApi(manifest,origin);c1=client(api1.base,origin);
  assert.deepEqual((await (await c1.request('/me/preferences',a)).json()).data,beforePrefs);
  assert.deepEqual((await (await c1.request('/me/bookmarks',a)).json()).data,beforeBookmarks);
  const afterSession=(await (await c1.request('/me/session',a)).json()).data;
  for(const field of ['createdAt','expiresAt','csrfToken'])assert.ok(afterSession[field]===beforeSession[field]);
  assert.equal((await c1.request('/me/session',revoked)).status,401);
  assert.equal((await c1.request('/me/session',a)).headers.get('cache-control'),'no-store');
  assert.equal((await (await c1.request('/me/preferences',a)).json()).meta.persistence,'postgresql');
  check('Actual API process stop/restart without reseed preserves session, CSRF, preferences, bookmarks and revocation');
  const patch={textSize:'large',lockVersion:beforePrefs.lockVersion};
  const competing=await Promise.all([c1.write('/me/preferences',a,'PATCH',patch),c2.write('/me/preferences',a,'PATCH',patch)]);assert.deepEqual(competing.map(r=>r.status).sort(),[200,409]);
  await c1.write(`/me/bookmarks/${article.id}`,a,'DELETE');
  const saves=await Promise.all([c1.write(`/me/bookmarks/${article.id}`,a,'PUT'),c2.write(`/me/bookmarks/${article.id}`,a,'PUT')]);assert.deepEqual(saves.map(r=>r.status),[200,200]);assert.deepEqual((await saves[0].json()).data,(await saves[1].json()).data);
  assert.equal(Number((await admin.query('SELECT count(*) FROM public.bookmarks WHERE user_id=$1 AND article_id=$2',[fixtureUsers.a,article.id])).rows[0].count),1);
  const parallel=await Promise.all(Array.from({length:12},(_,i)=>(i%2?c1:c2).request('/me/session',i%2?a:b).then(r=>r.json())));parallel.forEach((r,i)=>assert.equal(r.data.user.id,i%2?fixtureUsers.a:fixtureUsers.b));
  check('Independent API instances: atomic 200/409 preference conflict, unique duplicate saves and concurrent A/B identity');
  // Explicit barriers order invalidation versus protected operations, not timing sleeps.
  let entered=deferred(),release=deferred();
  const invalidation=maintenance.changeAccount(fixtureUsers.a,{roles:[]},async()=>{entered.resolve();await release.promise;});await entered.promise;
  const waiting=c2.request('/me/preferences',a);await waitForBlockedRuntime();release.resolve();await invalidation;assert.equal((await waiting).status,401);assert.equal((await c1.request('/me/session',a)).status,401);
  await maintenance.changeAccount(fixtureUsers.a,{roles:['reader']});const a2=await issue(fixtureUsers.a);secrets.push(a2);
  const accountBefore=await maintenance.account(fixtureUsers.a);const auditBefore=(await admin.query('SELECT count(*) FROM public.audit_events')).rows[0].count;
  await assert.rejects(maintenance.changeAccount(fixtureUsers.a,{status:'suspended',roles:[]},async client=>{await client.query('SELECT 1/0');}));
  assert.deepEqual(await maintenance.account(fixtureUsers.a),accountBefore);assert.equal((await admin.query('SELECT count(*) FROM public.audit_events')).rows[0].count,auditBefore);assert.equal((await c1.request('/me/session',a2)).status,200);
  check('Account/role/version/audit transaction invalidates across instances; injected audit-transaction failure rolls all changes back');
  entered=deferred();release=deferred();
  const operation=unit.run(async(ident,member)=>{const service=new IdentityService(ident),ctx=await service.authenticate(a2);const m=new MemberService(service,member,createFixtureRepository());const pref=await m.preferences(ctx);entered.resolve();await release.promise;await m.updatePreferences(ctx,{reduceMotion:true,lockVersion:pref.lockVersion});});await entered.promise;
  const disabling=maintenance.changeAccount(fixtureUsers.a,{status:'suspended'});release.resolve();await operation;await disabling;assert.equal((await c2.request('/me/preferences',a2)).status,401);
  await maintenance.changeAccount(fixtureUsers.a,{status:'active'});const a3=await issue(fixtureUsers.a);secrets.push(a3);
  entered=deferred();release=deferred();
  const held=unit.run(async ident=>{const service=new IdentityService(ident);await service.authenticate(a3);entered.resolve();await release.promise;});await entered.promise;
  const csrf=(await c2.request('/me/session',b).then(r=>r.json())).data.csrfToken;
  // Obtain A CSRF from durable maintenance record, no extra blocking HTTP inspect.
  const aCsrf=(await admin.query('SELECT csrf_token FROM public.sessions WHERE id=$1',[a3.split('.')[0]])).rows[0].csrf_token;
  const logout=c1.request('/auth/logout',a3,'POST',{}, {origin,'x-csrf-token':aCsrf});await waitForBlockedRuntime();release.resolve();await held;assert.equal((await logout).status,204);assert.equal((await c2.request('/me/session',a3)).status,401);void csrf;
  check('Deterministic operation-before-disable/logout and invalidation-before-operation ordering; no retroactive cancellation claim');
  // Pool size one, same backend across valid/empty/rollback/error units.
  const a4=await issue(fixtureUsers.a);secrets.push(a4);const pids=[];
  for(const token of [a4,b,a4,b])await unit.run(async(ident,member)=>{pids.push((await ident.client.query('SELECT pg_backend_pid() AS pid')).rows[0].pid);const service=new IdentityService(ident),ctx=await service.authenticate(token);assert.equal((await member.preferences(ctx.userId)).theme,ctx.userId===fixtureUsers.a?'light':'dark');});
  assert.equal(new Set(pids).size,1);
  await unit.run(async(ident,member)=>{
    await new IdentityService(ident).authenticate(a4);
    await assert.rejects(member.preferences(fixtureUsers.b),e=>e.code==='NOT_FOUND');
    const changed=await ident.client.query('UPDATE public.user_preferences SET theme=$1 WHERE user_id=$2 RETURNING user_id',['light',fixtureUsers.b]);assert.equal(changed.rowCount,0);
  });
  for(const value of [null,''])await unit.run(async ident=>{if(value!==null)await ident.client.query("SELECT set_config('aggregator.user_id',$1,true)",[value]);assert.equal(Number((await ident.client.query('SELECT count(*) FROM public.user_preferences')).rows[0].count),0);});
  const original=(await (await c1.request('/me/preferences',a4)).json()).data;
  await assert.rejects(unit.run(async(ident,member)=>{const service=new IdentityService(ident),ctx=await service.authenticate(a4);await member.updatePreferences(ctx.userId,{theme:'dark',lockVersion:original.lockVersion},new Date().toISOString());await ident.client.query('SELECT 1/0');}));
  assert.deepEqual((await (await c1.request('/me/preferences',a4)).json()).data,original);
  await unit.run(async ident=>{assert.equal((await ident.client.query('SELECT pg_backend_pid() AS pid')).rows[0].pid,pids[0]);assert.equal((await ident.client.query("SELECT nullif(current_setting('aggregator.user_id',true),'') IS NULL AS clean")).rows[0].clean,true);});
  check('Size-one pool reuses same PID across A/B, empty context, commit and SQL rollback without identity or mutation leakage');
  for(const sql of ['SET ROLE agg_owner','SELECT * FROM public.sessions','SELECT * FROM public.users',"UPDATE public.articles SET status='published'",'CREATE TABLE public.forbidden(id int)'])await assert.rejects(unit.run(async ident=>{await ident.client.query(sql);}),e=>e.code==='42501');
  db.reject("SELECT public.lookup_fixture_session('00000000-0000-4000-8000-000000000001')",'agg_member_login','42501');
  const attrs=await admin.query("SELECT proconfig,prosecdef,pg_get_userbyid(proowner) AS owner FROM pg_proc WHERE proname='lookup_fixture_session'");assert.equal(attrs.rows[0].prosecdef,true);assert.equal(attrs.rows[0].owner,'agg_owner');assert.deepEqual(attrs.rows[0].proconfig,['search_path=pg_catalog']);
  check('Actual runtime denies owner escalation, private tables, publication and DDL; lookup execution denied to member-only role');
  const exhausted=await unit.pool.connect();try{const began=Date.now();await assert.rejects(unit.run(async()=>undefined));assert.ok(Date.now()-began<2500);}finally{exhausted.release();}
  const blocker=await admin.connect();try{
    await blocker.query('BEGIN');await blocker.query('SELECT id FROM public.users WHERE id=$1 FOR UPDATE',[fixtureUsers.a]);
    const blocked=c1.request('/me/preferences',a4);await waitForBlockedRuntime();
    const queued=c1.request('/me/preferences',b);const started=Date.now();
    assert.equal((await queued).status,503);assert.equal((await blocked).status,503);assert.ok(Date.now()-started<3000);
    await blocker.query('ROLLBACK');assert.equal((await c1.request('/me/preferences',b)).status,200);
  }finally{await blocker.query('ROLLBACK');blocker.release();}
  const oldPid=(await unit.pool.query('SELECT pg_backend_pid() AS pid')).rows[0].pid;
  await assert.rejects(unit.run(async ident=>{await admin.query('SELECT pg_terminate_backend($1)',[oldPid]);await ident.client.query('SELECT 1');}));
  const newPid=(await unit.pool.query('SELECT pg_backend_pid() AS pid')).rows[0].pid;assert.notEqual(newPid,oldPid);
  check('HTTP pool exhaustion/lock wait return bounded 503 and recover; terminated transaction connection is discarded and replaced');
  const expired=await fixtureIssuer(maintenance,{mode:'local-test',nodeEnv:'test'},()=>Date.now()-13*60*60*1000)(fixtureUsers.b);secrets.push(expired);assert.equal((await c1.request('/me/session',expired)).status,401);
  const idle=await fixtureIssuer(maintenance,{mode:'local-test',nodeEnv:'test'},()=>Date.now()-31*60*1000)(fixtureUsers.b);secrets.push(idle);assert.equal((await c1.request('/me/session',idle)).status,401);
  const baseTime=Date.now(),timed=await fixtureIssuer(maintenance,{mode:'local-test',nodeEnv:'test'},()=>baseTime)(fixtureUsers.b);secrets.push(timed);
  for(const time of [baseTime+100,baseTime+50])await unit.run(async ident=>{await new IdentityService(ident,()=>time).authenticate(timed);});
  assert.equal(new Date((await admin.query('SELECT last_seen_at FROM public.sessions WHERE id=$1',[timed.split('.')[0]])).rows[0].last_seen_at).getTime(),baseTime+100);
  assert.equal((await c1.request('/me/session',`${randomUUID()}.${'0'.repeat(64)}`)).status,401);
  assert.equal((await c1.request('/me/session',undefined,'GET',undefined,{'x-user-id':fixtureUsers.a,'x-role':'publisher'})).status,401);
  const staff=await issue(fixtureUsers.staff);secrets.push(staff);assert.equal((await c1.write('/staff/articles/x/publish',staff,'POST')).status,403);
  const bCsrf=(await (await c1.request('/me/session',b)).json()).data.csrfToken;
  assert.equal((await c1.request('/auth/logout',b,'POST',{}, {origin:'https://attacker.example','x-csrf-token':bCsrf})).status,403);
  check('Idle/absolute expiry and unknown/fabricated identity denied; last-seen cannot move backwards; fixture staff cannot publish');
  const safeArticles=createFixtureRepository();const safeApi=createApp(safeArticles,{unit,profile:cookieProfile(origin,'test')}).listen(0,'127.0.0.1');await once(safeApi,'listening');
  try{
    const safeClient=client(`http://127.0.0.1:${safeApi.address().port}/api/v1`,origin);safeArticles.withdraw(article.slug);
    const saved=(await (await safeClient.request('/me/bookmarks',a4)).json()).data.find(item=>item.articleId===article.id);
    assert.equal(saved.status,'unavailable');assert.equal(saved.article,null);assert.ok(!JSON.stringify(saved).includes(article.headline));
    assert.equal((await safeClient.write(`/me/bookmarks/${article.id}`,b,'PUT')).status,404);
    assert.equal((await safeClient.write(`/me/bookmarks/${article.id}`,b,'DELETE')).status,204);
    assert.equal((await admin.query('SELECT count(*) FROM public.bookmarks WHERE user_id=$1 AND article_id=$2',[fixtureUsers.a,article.id])).rows[0].count,'1');
  }finally{safeApi.close();await once(safeApi,'close');}
  check('Database bookmark HTTP responses re-project withdrawn content to tombstones; cross-owner delete cannot remove another row');
  // Browser uses built Nuxt and a real DB API process with matching origin.
  const portProbe=createServer().listen(0,'127.0.0.1');await once(portProbe,'listening');const webPort=portProbe.address().port;await new Promise(resolve=>portProbe.close(resolve));
  const webOrigin=`http://127.0.0.1:${webPort}`;const browserApi=await startApi(manifest,webOrigin);
  const web=spawn(process.execPath,['apps/web/.output/server/index.mjs'],{env:{...process.env,NODE_ENV:'production',HOST:'127.0.0.1',PORT:String(webPort),NUXT_API_BASE:browserApi.base.replace('/api/v1','')},stdio:['ignore','pipe','pipe'],windowsHide:true});processes.add(web);web.stdout.on('data',d=>{capturedLogs+=d;});web.stderr.on('data',d=>{capturedLogs+=d;});
  let ready=false;for(let i=0;i<70;i++){if(web.exitCode!==null)throw new Error('Owned Nuxt server exited');try{if((await fetch(webOrigin+'/api/v1/articles')).ok){ready=true;break;}}catch{/* Wait for owned server. */}await new Promise(r=>setTimeout(r,100));}assert.ok(ready);
  browser=await chromium.launch({channel:'chrome',headless:true});const context=await browser.newContext();const browserToken=await issue(fixtureUsers.b);secrets.push(browserToken);
  await context.addCookies([{name:'agg_session',value:browserToken,url:webOrigin,httpOnly:true,secure:false,sameSite:'Lax'}]);const page=await context.newPage();await page.goto(webOrigin+'/articles/alderwick-evening-shuttle');
  const installedCookie=(await context.cookies(webOrigin)).find(c=>c.name==='agg_session');assert.ok(installedCookie.httpOnly&&installedCookie.sameSite==='Lax'&&!installedCookie.secure&&installedCookie.path==='/');
  const session=await page.evaluate(async()=>{const r=await fetch('/api/v1/me/session');return {body:await r.json(),cache:r.headers.get('cache-control')};});assert.equal(session.body.meta.persistence,'postgresql');assert.ok(session.cache.includes('no-store'));
  const exposed=await page.evaluate(()=>JSON.stringify({cookie:globalThis.document.cookie,html:globalThis.document.documentElement.outerHTML,local:{...globalThis.localStorage},session:{...globalThis.sessionStorage}}));for(const token of secrets)assert.ok(!exposed.includes(token));
  const browserWrite=await page.evaluate(async csrf=>{const before=await fetch('/api/v1/me/preferences').then(r=>r.json());const denied=await fetch('/api/v1/me/preferences',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({theme:'light',lockVersion:before.data.lockVersion})});const ok=await fetch('/api/v1/me/preferences',{method:'PATCH',headers:{'content-type':'application/json','x-csrf-token':csrf},body:JSON.stringify({theme:'light',lockVersion:before.data.lockVersion})});return [denied.status,ok.status];},session.body.data.csrfToken);assert.deepEqual(browserWrite,[403,200]);
  const out=await page.evaluate(async csrf=>(await fetch('/api/v1/auth/logout',{method:'POST',headers:{'content-type':'application/json','x-csrf-token':csrf},body:'{}'})).status,session.body.data.csrfToken);assert.equal(out,204);assert.ok(!(await context.cookies()).some(c=>c.name==='agg_session'));assert.equal((await c1.request('/me/session',browserToken)).status,401);
  const anon=await browser.newContext({javaScriptEnabled:false});const anonPage=await anon.newPage();await anonPage.goto(webOrigin+'/articles/alderwick-evening-shuttle?variant=brief');assert.equal(await anonPage.locator('.source-entry').count(),4);await anonPage.locator('a[href="#sources"]').first().click();assert.ok(anonPage.url().endsWith('#sources'));await anon.close();
  check('Built Nuxt + PostgreSQL API Chrome: durable metadata, HttpOnly/no-store/CSRF/logout, no token exposure, anonymous no-JS bibliography');
  // Database unavailable while API stays alive: protected 503, public projection independent.
  await admin.query('ALTER ROLE agg_api_login NOLOGIN');await admin.query("SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE usename='agg_api_login' AND datname=current_database()");
  const unavailable=await c1.request('/me/session',a4);assert.equal(unavailable.status,503);assert.equal((await c1.request('/articles/alderwick-evening-shuttle')).status,200);
  check('Runtime database connection denial produces protected 503 without memory fallback; anonymous article remains available');
  for(const token of secrets)assert.ok(!capturedLogs.includes(token));check('Owned process logs contain no session bearer; no credential evidence files');
  report.status='passed';
 }finally{
  await browser?.close();for(const child of [...processes])await stop(child);await unit.close();await maintenance.close();await admin.end();
 }
 });report.target.stopped=true;
}catch(error){report.status='failed';report.failure=error.code||error.name;console.error('Database identity verification failed:',error.message);process.exitCode=1;}
finally{writeFileSync('docs/engineering/identity-db-checks.json',JSON.stringify(report,null,2)+'\n');}
