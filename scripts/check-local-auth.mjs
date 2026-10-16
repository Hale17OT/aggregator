import assert from 'node:assert/strict';
import { once } from 'node:events';
import { randomBytes,randomUUID } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { withDisposableDatabase } from './disposable-database.mjs';
import { migrations,migrate } from './db-migrations.mjs';
import { PostgresMemberUnit,poolConfig } from '../packages/db/src/member.ts';
import { Pool } from 'pg';
import { createApp } from '../apps/api/src/app.ts';
import { createFixtureRepository } from '../packages/test-fixtures/src/index.ts';
import { verifier } from '../packages/domain/src/identity.ts';
const report={checks:[],status:'running',limitations:['Direct SQL secure-boundary checks; browser captured SMTP flow verified separately']};
try{await withDisposableDatabase(async h=>{
 const db=h.createDatabase('aggregator_identity');migrate(db,migrations('packages/db/migrations'));db.sql("SET ROLE agg_owner; INSERT INTO roles(code,name) VALUES('reader','Reader'),('publisher','Publisher');");
 const target={purpose:'aggregator-disposable-pg18',data:h.data,host:'127.0.0.1',port:h.port,database:'aggregator_identity',systemIdentifier:h.systemIdentifier};
 const unit=new PostgresMemberUnit(target),admin=new Pool(poolConfig(target,'agg_bootstrap'));let server;
 try{
 const issue=async(email='new@example.test')=>{const selector=randomUUID(),secret=randomBytes(32).toString('hex'),browser=randomBytes(32).toString('hex');const result=await unit.pool.query('SELECT public.request_local_signin($1,$2,$3,$4,$5) AS ok',[selector,email,verifier(secret),verifier(browser),'/library']);assert.equal(result.rows[0].ok,true);return {selector,secret,browser};};
 const redeem=async c=>{const id=randomUUID(),secret=randomBytes(32).toString('hex');const result=await unit.pool.query('SELECT public.redeem_local_signin($1,$2,$3,$4,$5,$6) AS destination',[c.selector,verifier(c.secret),verifier(c.browser),id,verifier(secret),randomBytes(32).toString('hex')]);return {destination:result.rows[0].destination,token:`${id}.${secret}`};};
 const c=await issue();const results=await Promise.all([redeem(c),redeem(c)]);assert.equal(results.filter(r=>r.destination==='/library').length,1);assert.equal((await redeem(c)).destination,null);report.checks.push('Atomic concurrent single-use redemption; replay denied');
 const expired=await issue('expired@example.test');await admin.query("UPDATE public.auth_challenges SET expires_at=now()-interval '1 minute' WHERE id=$1",[expired.selector]);assert.equal((await redeem(expired)).destination,null);
 const wrong=await issue('wrong@example.test');assert.equal((await redeem({...wrong,browser:'wrong'})).destination,null);assert.equal((await redeem({...wrong,secret:'wrong'})).destination,null);assert.equal((await redeem(wrong)).destination,'/library');report.checks.push('Expiry, incorrect verifier and browser binding reject without activating account');
 const staffId=randomUUID();await admin.query("INSERT INTO public.users(id,email_normalized) VALUES($1,'staff@example.test')",[staffId]);await admin.query("INSERT INTO public.user_roles(user_id,role_code) VALUES($1,'publisher')",[staffId]);assert.equal((await redeem(await issue('staff@example.test'))).destination,null);report.checks.push('Existing staff cannot acquire local reader session');
 for(const path of ['https://example.org','//example.org','javascript:alert(1)','/staff']){const r=await unit.pool.query('SELECT public.request_local_signin($1,$2,$3,$4,$5) AS ok',[randomUUID(),'safe@example.test',verifier('x'),verifier('y'),path]);assert.equal(r.rows[0].ok,false);}report.checks.push('External and staff return destinations refused');
 for(let n=0;n<5;n++)await issue('rate@example.test');const limited=await unit.pool.query('SELECT public.request_local_signin($1,$2,$3,$4,$5) AS ok',[randomUUID(),'rate@example.test',verifier('x'),verifier('y'),'/library']);assert.equal(limited.rows[0].ok,false);report.checks.push('Cross-connection persistent request rate limit');
 const records=await admin.query("SELECT u.email_verified_at,s.authentication_method,s.assurance,s.mfa_verified_at,r.role_code FROM public.users u JOIN public.sessions s ON s.user_id=u.id JOIN public.user_roles r ON r.user_id=u.id WHERE u.email_normalized='new@example.test'");assert.equal(records.rowCount,1);assert.deepEqual(records.rows[0],{email_verified_at:null,authentication_method:'captured-mail',assurance:'local-demo',mfa_verified_at:null,role_code:'reader'});
 const token=results.find(r=>r.destination)?.token;
 server=createApp(createFixtureRepository(),{unit,localAuth:unit}).listen(0,'127.0.0.1');await once(server,'listening');const base=`http://127.0.0.1:${server.address().port}/api/v1`;
 const session=await fetch(base+'/me/session',{headers:{cookie:`agg_session=${token}`}});assert.equal(session.status,200);const data=(await session.json()).data;assert.equal(data.assurance,'local-demo');
 assert.equal((await fetch(base+'/auth/confirm')).status,401); // GET cannot redeem or create session.
 const pre=await fetch(base+'/auth/preflight'),preCookie=pre.headers.getSetCookie()[0].split(';')[0],csrf=(await pre.json()).data.csrfToken;
 for(const origin of ['https://evil.example','null'])assert.equal((await fetch(base+'/auth/request',{method:'POST',headers:{cookie:preCookie,origin,'x-csrf-token':csrf,'content-type':'application/json'},body:JSON.stringify({email:'one@example.test'})})).status,403);
 report.checks.push('Actual HTTP durable session works; GET preview does not redeem; wrong origins denied');
 const headers={cookie:`agg_session=${token}`,origin:'http://127.0.0.1:3000','x-csrf-token':data.csrfToken,'content-type':'application/json'};
 const prefs=(await (await fetch(base+'/me/preferences',{headers})).json()).data;
 assert.equal((await fetch(base+'/me/preferences',{method:'PATCH',headers,body:JSON.stringify({lockVersion:prefs.lockVersion,anchorCount:2,playbackSpeed:1.25})})).status,200);
 assert.equal((await fetch(base+'/me/preferences',{headers})).status,200);
 assert.equal((await fetch(base+'/auth/logout',{method:'POST',headers,body:'{}'})).status,204);assert.equal((await fetch(base+'/me/session',{headers})).status,401);report.checks.push('New reader preference update and durable logout preserve session safeguards');
 }finally{if(server)await new Promise(ok=>server.close(ok));await unit.close();await admin.end();}
});report.status='passed';console.log(report.checks.join('\n'));}catch(e){report.status='failed';throw e;}finally{writeFileSync('docs/engineering/local-auth-checks.json',JSON.stringify(report,null,2));}
