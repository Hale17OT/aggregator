import assert from 'node:assert/strict';
import {once} from 'node:events';
import {randomBytes,randomUUID,createHash} from 'node:crypto';
import {writeFileSync} from 'node:fs';
import {withDisposableDatabase} from './disposable-database.mjs';
import {migrations,migrate} from './db-migrations.mjs';
import {PostgresMemberUnit} from '../packages/db/src/member.ts';
import {createApp} from '../apps/api/src/app.ts';
import {createFixtureRepository} from '../packages/test-fixtures/src/index.ts';
import {verifier} from '../packages/domain/src/identity.ts';
const report={at:new Date().toISOString(),status:'running',checks:[],scope:'Actual HTTP/SQL isolated services; browser/UI and device flow separate'};
try{await withDisposableDatabase(async h=>{
 const db=h.createDatabase('aggregator_identity');migrate(db,migrations('packages/db/migrations'));db.sql("SET ROLE agg_owner;INSERT INTO roles(code,name) VALUES('reader','Reader');");
 const target={purpose:'aggregator-disposable-pg18',data:h.data,host:'127.0.0.1',port:h.port,database:'aggregator_identity',systemIdentifier:h.systemIdentifier};const unit=new PostgresMemberUnit(target);const server=createApp(createFixtureRepository(),{unit,localAuth:unit}).listen(0,'127.0.0.1');await once(server,'listening');const base=`http://127.0.0.1:${server.address().port}/api/v1`;
 const request=async(path,method='GET',body,headers={})=>fetch(base+path,{method,headers:{...(body?{'content-type':'application/json'}:{}),...headers},body:body?JSON.stringify(body):undefined});
 try{
 const secret=randomBytes(32).toString('hex'),browser=randomBytes(32).toString('hex'),challengeId=randomUUID(),sessionId=randomUUID(),bearer=randomBytes(32).toString('hex'),csrf=randomBytes(32).toString('hex');
 await unit.pool.query('SELECT public.request_local_signin($1,$2,$3,$4,$5)',[challengeId,'native-test@example.test',verifier(secret),verifier(browser),'/library']);
 assert.equal((await unit.pool.query('SELECT public.redeem_local_signin($1,$2,$3,$4,$5,$6) destination',[challengeId,verifier(secret),verifier(browser),sessionId,verifier(bearer),csrf])).rows[0].destination,'/library');
 const web=`${sessionId}.${bearer}`,proof=randomBytes(32).toString('base64url'),state=randomBytes(32).toString('base64url'),challenge=createHash('sha256').update(proof).digest('base64url');
 const registration={client:'aggregator-local',redirect:'aggregator-local://auth/callback'};
 const start=await request('/native/auth/start','POST',{...registration,challenge,state});assert.equal(start.status,200);const pending=(await start.json()).data;
 assert.equal((await request('/native/auth/start','POST',{...registration,challenge,state},{origin:'http://127.0.0.1:3000'})).status,403);
 assert.equal((await request('/native/auth/start','POST',{...registration,redirect:'https://evil.example',challenge,state})).status,422);
 const pre=await request('/auth/preflight'),preCookie=pre.headers.getSetCookie()[0].split(';')[0],preCsrf=(await pre.json()).data.csrfToken;
 const bound=await request('/auth/native/bind','POST',{id:pending.id},{cookie:preCookie,origin:'http://127.0.0.1:3000','x-csrf-token':preCsrf});assert.equal(bound.status,200);const binding=bound.headers.getSetCookie()[0].split(';')[0];
 const webHeaders={cookie:`agg_session=${web}; ${binding}`,origin:'http://127.0.0.1:3000','x-csrf-token':csrf};
 assert.equal((await request('/auth/native/approve','POST',{id:pending.id},{...webHeaders,'x-csrf-token':'bad'})).status,403);
 assert.equal((await request('/native/auth/exchange','GET')).status,401);
 const approved=await request('/auth/native/approve','POST',{id:pending.id},webHeaders);assert.equal(approved.status,200);const callback=new URL((await approved.json()).data.callback);assert.equal(callback.searchParams.get('state'),state);assert.equal(callback.searchParams.size,2);const code=callback.searchParams.get('code');
 const exchange={...registration,id:pending.id,code,verifier:proof};
 assert.equal((await request('/native/auth/exchange','POST',{...exchange,verifier:randomBytes(32).toString('base64url')})).status,401);
 const attempts=await Promise.all([request('/native/auth/exchange','POST',exchange),request('/native/auth/exchange','POST',exchange)]);assert.deepEqual(attempts.map(r=>r.status).sort(),[200,401]);const native=(await attempts.find(r=>r.status===200).json()).data.credential;
 assert.equal((await request('/native/auth/exchange','POST',exchange)).status,401);report.checks.push('Strict registered destinations, browser Origin rejection, explicit CSRF approval, wrong verifier, simultaneous one-use exchange and replay');
 const nativeHeaders={authorization:`Bearer ${native}`};assert.equal((await request('/native/me/session','GET',undefined,nativeHeaders)).status,200);
 assert.equal((await request('/native/me/session','GET',undefined,{authorization:`Bearer ${web}`})).status,401);
 assert.equal((await request('/me/session','GET',undefined,{cookie:`agg_session=${native}`})).status,401);
 assert.equal((await request('/native/me/session','GET',undefined,{...nativeHeaders,cookie:`agg_session=${web}`})).status,401);
 assert.equal((await request('/native/staff','GET',undefined,nativeHeaders)).status,403);
 const prefs=(await (await request('/native/me/preferences','GET',undefined,nativeHeaders)).json()).data;
 assert.equal((await request('/native/me/preferences','PATCH',{lockVersion:prefs.lockVersion,playbackSpeed:1.25},nativeHeaders)).status,200);
 assert.equal((await request('/native/me/preferences','PATCH',{lockVersion:prefs.lockVersion,playbackSpeed:1.5},nativeHeaders)).status,409);
 assert.equal((await (await request('/me/preferences','GET',undefined,webHeaders)).json()).data.playbackSpeed,1.25);
 assert.equal((await request('/me/preferences','PATCH',{lockVersion:prefs.lockVersion+1,playbackSpeed:1}, {cookie:`agg_session=${web}`})).status,403);
 assert.equal((await request('/native/auth/logout','POST',{},nativeHeaders)).status,204);assert.equal((await request('/native/me/session','GET',undefined,nativeHeaders)).status,401);
 report.checks.push('Cross-transport/mixed rejection, staff denial, real native mutation/web refetch,409 conflict, unchanged web CSRF and durable native logout');
 }finally{await new Promise(ok=>server.close(ok));await unit.close();}
});report.status='passed';console.log(report.checks.join('\n'));}catch(e){report.status='failed';throw e;}finally{writeFileSync('docs/engineering/flutter-closeout/native-auth.json',JSON.stringify(report,null,2));}
