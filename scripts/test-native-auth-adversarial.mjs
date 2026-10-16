/* global AbortSignal, clearTimeout */
import assert from 'node:assert/strict';
import {once} from 'node:events';
import {spawn} from 'node:child_process';
import {randomBytes,randomUUID,createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {join} from 'node:path';
import {withDisposableDatabase} from './disposable-database.mjs';
import {migrations,migrate} from './db-migrations.mjs';
import {PostgresMemberUnit,readTarget} from '../packages/db/src/member.ts';
import {createApp} from '../apps/api/src/app.ts';
import {createFixtureRepository} from '../packages/test-fixtures/src/index.ts';
import {verifier} from '../packages/domain/src/identity.ts';

// This child entry exists only in the non-product test runner. No HTTP issuer.
if(process.argv[2]==='--child'){
 const target=readTarget(process.argv[3]);
 assert.equal(target.purpose,'aggregator-disposable-pg18');assert.equal(target.port,55440);
 const unit=new PostgresMemberUnit(target);await unit.run(async()=>undefined);
 const server=createApp(createFixtureRepository(),{unit,localAuth:unit}).listen(0,'127.0.0.1');
 await once(server,'listening');process.send?.({ready:true,port:server.address().port});
 process.on('message',m=>{if(m?.stop)server.close(()=>{void unit.close().then(()=>process.exit(0));});});
}else{
 const report={at:new Date().toISOString(),status:'running',checks:[],limitations:[
  'Browser session setup uses SQL captured-mail challenge/redemption fixtures; no full browser or Android flow is claimed.',
  'Wrong callback state is validated by Flutter, not the exchange endpoint. This script verifies exact state echo and strict rejection of injected exchange state; Dart state tests are separate.',
  'Only a fresh attested disposable PostgreSQL 18 cluster on 55440 is mutated. No retained account/member target is used.',
 ]};
 let phase='disposable target startup';
 const children=[];
 const check=name=>{report.checks.push({name,status:'PASS'});console.log(name);};
 const hex=()=>randomBytes(32).toString('hex');
 const registration={client:'aggregator-local',redirect:'aggregator-local://auth/callback'};
 async function stop(child){
  if(child.exitCode!==null)return;
  const exited=once(child,'exit');child.send({stop:true});
  const timer=setTimeout(()=>child.kill(),5000);
  await exited;clearTimeout(timer);
 }
 try{await withDisposableDatabase(async h=>{
  assert.equal(h.port,55440);h.verify('postgres');
  const db=h.createDatabase('aggregator_identity');h.verify('aggregator_identity');
  migrate(db,migrations('packages/db/migrations'));
  db.sql("SET ROLE agg_owner;INSERT INTO roles(code,name) VALUES('reader','Reader');");
  const target={purpose:'aggregator-disposable-pg18',data:h.data,host:'127.0.0.1',port:h.port,database:'aggregator_identity',systemIdentifier:h.systemIdentifier};
  const manifest=join(h.data,'runtime-target.json');writeFileSync(manifest,JSON.stringify(target));
  report.target={purpose:target.purpose,port:target.port,system:target.systemIdentifier};
  const unit=new PostgresMemberUnit(target);
  try{
   for(let i=0;i<2;i++){
    const env={...process.env,NODE_ENV:'test'};delete env.DATABASE_URL;
    const child=spawn(process.execPath,['--import','tsx','scripts/test-native-auth-adversarial.mjs','--child',manifest],{env,stdio:['ignore','ignore','ignore','ipc'],windowsHide:true});children.push(child);
    const ready=await new Promise((resolve,reject)=>{const t=setTimeout(()=>reject(Error('Child readiness timeout')),15000);child.once('message',m=>{clearTimeout(t);resolve(m);});child.once('exit',()=>{clearTimeout(t);reject(Error('Child exited before readiness'));});});
    assert.equal(ready.ready,true);child.apiBase=`http://127.0.0.1:${ready.port}/api/v1`;
   }
   assert.notEqual(children[0].pid,children[1].pid);
   report.processes={distinct:true,count:2};
   const request=(index,path,method='GET',body,headers={})=>fetch(children[index].apiBase+path,{method,headers:{...(body?{'content-type':'application/json'}:{}),...headers},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(10000)});
   async function flow(){
    const id=randomUUID(),sessionId=randomUUID(),secret=hex(),browser=hex(),bearer=hex(),csrf=hex();
    const email=`adversarial-${randomUUID()}@example.test`;
    assert.equal((await unit.pool.query('SELECT public.request_local_signin($1,$2,$3,$4,$5) ok',[id,email,verifier(secret),verifier(browser),'/library'])).rows[0].ok,true);
    assert.equal((await unit.pool.query('SELECT public.redeem_local_signin($1,$2,$3,$4,$5,$6) destination',[id,verifier(secret),verifier(browser),sessionId,verifier(bearer),csrf])).rows[0].destination,'/library');
    const web=`${sessionId}.${bearer}`,proof=randomBytes(32).toString('base64url'),state=randomBytes(32).toString('base64url');
    const started=await request(0,'/native/auth/start','POST',{...registration,challenge:createHash('sha256').update(proof).digest('base64url'),state});assert.equal(started.status,200);
    const pending=(await started.json()).data;
    const pre=await request(0,'/auth/preflight'),preCookie=pre.headers.getSetCookie()[0].split(';')[0],preCsrf=(await pre.json()).data.csrfToken;
    const bound=await request(0,'/auth/native/bind','POST',{id:pending.id},{cookie:preCookie,origin:'http://127.0.0.1:3000','x-csrf-token':preCsrf});assert.equal(bound.status,200);
    const binding=bound.headers.getSetCookie()[0].split(';')[0];
    const headers={cookie:`agg_session=${web}; ${binding}`,origin:'http://127.0.0.1:3000','x-csrf-token':csrf};
    const approved=await request(0,'/auth/native/approve','POST',{id:pending.id},headers);assert.equal(approved.status,200);
    const callback=new URL((await approved.json()).data.callback);assert.equal(callback.searchParams.get('state'),state);
    return {id:pending.id,sessionId,web,headers,exchange:{...registration,id:pending.id,code:callback.searchParams.get('code'),verifier:proof}};
   }
   phase='two-process one-use race';
   const first=await flow();
   const race=await Promise.all([request(0,'/native/auth/exchange','POST',first.exchange),request(1,'/native/auth/exchange','POST',first.exchange)]);
   assert.deepEqual(race.map(r=>r.status).sort(),[200,401]);
   const native=(await race.find(r=>r.status===200).json()).data.credential;
   assert.equal((await request(1,'/native/auth/exchange','POST',first.exchange)).status,401);
   check('Two distinct API processes: simultaneous exchange issues one session, loser and replay reject');
   phase='transport and registered input failures';
   const nativeHeaders={authorization:`Bearer ${native}`};
   assert.equal((await request(1,'/native/me/session','GET',undefined,nativeHeaders)).status,200);
   assert.equal((await request(1,'/native/me/session','GET',undefined,{...nativeHeaders,cookie:`agg_session=${first.web}`})).status,401);
   assert.equal((await request(1,'/native/me/session','GET',undefined,{authorization:`Bearer ${first.web}`})).status,401);
   assert.equal((await request(1,'/me/session','GET',undefined,{cookie:`agg_session=${native}`})).status,401);
   const bad=await flow();
   for(const patch of [{client:'wrong-client'},{redirect:'aggregator-local://auth:99/callback'},{state:'untrusted-extra-state'}])assert.equal((await request(0,'/native/auth/exchange','POST',{...bad.exchange,...patch})).status,422);
   assert.equal((await request(0,'/native/auth/exchange','POST',{...bad.exchange,verifier:randomBytes(32).toString('base64url')})).status,401);
   assert.equal((await request(0,'/native/auth/exchange','POST',bad.exchange,{cookie:'agg_session=ambiguous'})).status,403);
   check('Mixed/cross transport, wrong client/callback, injected state and wrong proof reject');
   for(const kind of ['handoff-expired','code-expired','web-revoked','account-version-changed']){
    phase=kind;const f=await flow();
    // IDs are generated internally; db.sql attests this disposable target before each SQL.
    assert.match(f.id,/^[a-f0-9-]{36}$/);assert.match(f.sessionId,/^[a-f0-9-]{36}$/);
    if(kind==='handoff-expired')db.sql(`SET ROLE agg_owner;UPDATE native_handoffs SET expires_at=clock_timestamp()-interval '1 second' WHERE id='${f.id}';`);
    if(kind==='code-expired')db.sql(`SET ROLE agg_owner;UPDATE native_handoffs SET code_expires_at=clock_timestamp()-interval '1 second' WHERE id='${f.id}';`);
    if(kind==='web-revoked')assert.equal((await request(1,'/auth/logout','POST',{},f.headers)).status,204);
    if(kind==='account-version-changed')db.sql(`SET ROLE agg_owner;UPDATE users SET session_version=session_version+1 WHERE id=(SELECT user_id FROM sessions WHERE id='${f.sessionId}');`);
    assert.equal((await request(1,'/native/auth/exchange','POST',f.exchange)).status,401);
    assert.equal(db.scalar(`SELECT count(*) FROM native_handoffs WHERE id='${f.id}' AND consumed_at IS NOT NULL`),'0');
    assert.equal(db.scalar(`SELECT count(*) FROM sessions WHERE transport='native' AND user_id=(SELECT user_id FROM sessions WHERE id='${f.sessionId}')`),'0');
    check(kind+' rejects exchange without consuming a code or issuing a session');
   }
   phase='protected native bearer invalidation';
   assert.equal((await request(1,'/native/auth/logout','POST',{},nativeHeaders)).status,204);
   assert.equal((await request(0,'/native/me/preferences','GET',undefined,nativeHeaders)).status,401);
   const version=await flow();const exchanged=await request(0,'/native/auth/exchange','POST',version.exchange);assert.equal(exchanged.status,200);const versionToken=(await exchanged.json()).data.credential;
   const versionHeaders={authorization:`Bearer ${versionToken}`};assert.equal((await request(1,'/native/me/preferences','GET',undefined,versionHeaders)).status,200);
   db.sql(`SET ROLE agg_owner;UPDATE users SET session_version=session_version+1 WHERE id=(SELECT user_id FROM sessions WHERE id='${version.sessionId}');`);
   assert.equal((await request(1,'/native/me/preferences','GET',undefined,versionHeaders)).status,401);
   assert.equal((await request(0,'/native/me/progress','DELETE',{},versionHeaders)).status,401);
   check('Native logout and account-version invalidation reject protected reads and writes across API processes');
  }finally{await Promise.all(children.map(stop));await unit.close();}
 });report.status='passed';
 }catch(error){report.status='failed';report.failure={phase,type:error.name};process.exitCode=1;console.error('Adversarial verification failed at '+phase+' ('+error.name+'); no credential output.');
 }finally{writeFileSync('docs/engineering/flutter-closeout/native-auth-adversarial.json',JSON.stringify(report,null,2)+'\n');}
}
