import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { randomUUID, randomBytes } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { createApp } from '../apps/api/src/app.js';
import { cookieProfile, sessionCookie } from '../apps/api/src/member-http.js';
import { createFixtureRepository } from '../packages/test-fixtures/src/index.js';
import { fixtureIssuer, fixtureUsers, MemoryMemberRepository, sessionLifetimes } from '../packages/test-fixtures/src/member.js';
import { IdentityService } from '../packages/domain/src/identity.js';
import { MemberService } from '../packages/domain/src/member.js';
import { memberContract } from './member-contract.js';

async function harness(){
  let now=Date.parse('2026-10-12T12:00:00Z');const clock=()=>now;
  const store=new MemoryMemberRepository(),articles=createFixtureRepository();
  const issue=fixtureIssuer(store,{mode:'local-test',nodeEnv:'test'},clock);
  const profile=cookieProfile('http://127.0.0.1:3000','test');
  const server=createApp(articles,{identity:store,members:store,clock,profile}).listen(0,'127.0.0.1');await once(server,'listening');
  const address=server.address();assert.ok(address&&typeof address!=='string');const base=`http://127.0.0.1:${address.port}/api/v1`;
  const request=(path:string,token?:string,method='GET',body?:unknown,headers:Record<string,string>={})=>fetch(base+path,{method,headers:{...(token?{cookie:`${profile.name}=${token}`}:{ }),'content-type':'application/json',...headers},body:body===undefined?undefined:JSON.stringify(body)});
  const csrf=async(token:string)=>{const r=await request('/me/session',token);assert.equal(r.status,200);return (await r.json()).data.csrfToken as string;};
  const write=async(path:string,token:string,method:string,body:unknown={})=>request(path,token,method,body,{origin:profile.origin,'x-csrf-token':await csrf(token)});
  return {store,articles,issue,request,csrf,write,base,profile,clock,advance:(ms:number)=>{now+=ms;},close:async()=>{server.close();await once(server,'close');}};
}

test('identity: real HTTP rejects missing/malformed/unknown/fabricated identity; returns only safe session view',async()=>{
 const h=await harness();try{
  for(const token of [undefined,'bad',`${randomUUID()}.${randomBytes(32).toString('hex')}`])assert.equal((await h.request('/me/session',token)).status,401);
  assert.equal((await h.request('/me/preferences',undefined,'GET',undefined,{'x-user-id':fixtureUsers.a,'x-role':'administrator','x-mfa-verified':'true'})).status,401);
  const a=await h.issue(fixtureUsers.a),next=await h.issue(fixtureUsers.a);assert.ok(a!==next);
  const r=await h.request('/me/session',a);assert.equal(r.status,200);assert.match(r.headers.get('cache-control')! ,/no-store/);
  const text=await r.text();assert.ok(!text.includes(a));assert.ok(!text.includes(a.split('.')[1]));const data=JSON.parse(text).data;assert.equal(data.user.id,fixtureUsers.a);assert.equal(data.assurance,'fixture-only');assert.ok(!('roles' in data));
  const stored=await h.store.session(a.split('.')[0]);assert.ok(stored);assert.ok(stored.tokenHash!==a.split('.')[1]);assert.equal(stored.mfaVerifiedAt,null);
  assert.equal((await h.request('/me/session',a.slice(0,-1)+(a.endsWith('0')?'1':'0'))).status,401);
  assert.equal((await h.request('/me/session',undefined,'GET',undefined,{cookie:`agg_session=${a}; agg_session=${next}`})).status,401);
 }finally{await h.close();}
});
test('identity: shared member contract on memory adapter',async()=>{
 const h=await harness();try{await memberContract(h,await h.issue(fixtureUsers.a),await h.issue(fixtureUsers.b),h.articles.list()[0].id);}finally{await h.close();}
});
test('identity: idle and absolute expiry use injected clock; validation cannot renew an expired credential',async()=>{
 const h=await harness();try{
  const a=await h.issue(fixtureUsers.a);h.advance(sessionLifetimes.idleMs);assert.equal((await h.request('/me/session',a)).status,401);
  const b=await h.issue(fixtureUsers.b);
  for(let i=0;i<47;i++){h.advance(15*60*1000);assert.equal((await h.request('/me/session',b)).status,200);}
  h.advance(15*60*1000);assert.equal((await h.request('/me/session',b)).status,401);
 }finally{await h.close();}
});
test('identity: revocation, disabled accounts and permission changes invalidate existing sessions',async()=>{
 const h=await harness();try{
  const a=await h.issue(fixtureUsers.a);await h.store.revokeSession(a.split('.')[0],h.clock());assert.equal((await h.request('/me/session',a)).status,401);
  const b=await h.issue(fixtureUsers.b);await h.store.changeAccount(fixtureUsers.b,{status:'suspended'});assert.equal((await h.request('/me/session',b)).status,401);
  const next=await h.issue(fixtureUsers.a);await h.store.changeAccount(fixtureUsers.a,{roles:[]});assert.equal((await h.request('/me/preferences',next)).status,401);
  const noReader=await h.issue(fixtureUsers.a);assert.equal((await h.request('/me/preferences',noReader)).status,403);
 }finally{await h.close();}
});
test('identity: preferences enforce server ownership, strict editable fields and optimistic version',async()=>{
 const h=await harness();try{
  const a=await h.issue(fixtureUsers.a),b=await h.issue(fixtureUsers.b);
  assert.equal((await (await h.request('/me/preferences',a)).json()).data.theme,'system');assert.equal((await (await h.request('/me/preferences',b)).json()).data.theme,'dark');
  assert.equal((await h.write('/me/preferences',a,'PATCH',{theme:'light',lockVersion:0})).status,200);
  assert.equal((await h.write('/me/preferences',b,'PATCH',{textSize:'large',lockVersion:0})).status,200);
  assert.equal((await (await h.request('/me/preferences',a)).json()).data.textSize,'standard');
  assert.equal((await (await h.request('/me/preferences',b)).json()).data.theme,'dark');
  assert.equal((await h.write('/me/preferences',a,'PATCH',{theme:'dark',lockVersion:0})).status,409);
  for(const extra of [{userId:fixtureUsers.b},{user_id:fixtureUsers.b},{roles:['publisher']},{capabilities:['publish']},{mfa:true},{timezone:'not/a-zone'},{language:'xx'}])assert.equal((await h.write('/me/preferences',a,'PATCH',{...extra,lockVersion:1})).status,422);
  assert.equal((await h.request(`/me/preferences/${fixtureUsers.b}`,a)).status,404);
  assert.equal((await h.request(`/me/preferences?userId=${fixtureUsers.b}`,a)).status,422);
  assert.equal((await h.write(`/me/preferences/${fixtureUsers.b}`,a,'PATCH',{theme:'light',lockVersion:1})).status,404);
 }finally{await h.close();}
});
test('identity: bookmarks are private/idempotent and never expose withdrawn or draft text',async()=>{
 const h=await harness();try{
  const a=await h.issue(fixtureUsers.a),b=await h.issue(fixtureUsers.b);const publicItems=h.articles.list().filter(d=>d.state==='published');const x=publicItems[0],y=publicItems[1];
  const duplicates=await Promise.all([h.write(`/me/bookmarks/${x.id}`,a,'PUT'),h.write(`/me/bookmarks/${x.id}`,a,'PUT')]);assert.deepEqual(duplicates.map(r=>r.status),[200,200]);
  assert.equal((await h.write(`/me/bookmarks/${y.id}`,b,'PUT')).status,200);
  const list=async(t:string)=>(await (await h.request('/me/bookmarks',t)).json()).data;
  assert.equal((await list(a)).length,1);assert.equal((await list(b)).length,1);assert.equal((await list(a))[0].articleId,x.id);
  // An A request naming B's article can only remove A's own row (idempotent absence).
  assert.equal((await h.write(`/me/bookmarks/${y.id}`,a,'DELETE')).status,204);assert.equal((await list(b)).length,1);
  assert.equal((await h.request(`/me/bookmarks/${y.id}`,a)).status,404);
  assert.equal((await h.write(`/me/bookmarks/${x.id}`,a,'PUT',{userId:fixtureUsers.b})).status,422);
  assert.equal((await h.write(`/me/bookmarks/${randomUUID()}`,a,'PUT')).status,404);
  h.articles.withdraw(x.slug);assert.equal((await h.write(`/me/bookmarks/${x.id}`,b,'PUT')).status,404);
  const unavailable=(await list(a))[0];assert.equal(unavailable.status,'unavailable');assert.equal(unavailable.article,null);assert.ok(!JSON.stringify(unavailable).includes(x.headline));
  // Private draft shares the historical fixture ID; it must never substitute for withdrawn publication.
  assert.ok(!JSON.stringify(await list(a)).includes('PRIVATE'));
  assert.equal((await h.write(`/me/bookmarks/${x.id}`,a,'DELETE')).status,204);assert.equal((await list(a)).length,0);
 }finally{await h.close();}
});
test('identity: CSRF, origin, content type, parsing and logout are enforced on direct Express requests',async()=>{
 const h=await harness();try{
  const a=await h.issue(fixtureUsers.a),csrf=await h.csrf(a);
  assert.equal((await h.request('/me/session',a,'GET',undefined,{'x-user-id':fixtureUsers.b,'x-role':'administrator'})).status,200);
  const rejectedHeaders:Record<string,string>[]=[{origin:h.profile.origin},{origin:'https://attacker.example','x-csrf-token':csrf},{origin:h.profile.origin,'x-csrf-token':'wrong'},{'x-csrf-token':csrf},{origin:h.profile.origin,'x-csrf-token':csrf,'sec-fetch-site':'cross-site'}];
  for(const headers of rejectedHeaders)assert.equal((await h.request('/auth/logout',a,'POST',{},headers)).status,403);
  assert.equal((await h.request('/auth/logout',a)).status,404);
  assert.equal((await h.request('/me/bookmarks',a)).status,200);
  assert.equal((await h.request('/auth/logout',a,'POST',{}, {origin:h.profile.origin,'x-csrf-token':csrf,'content-type':'text/plain'})).status,415);
  const malformed=await fetch(h.base+'/auth/logout',{method:'POST',headers:{cookie:`agg_session=${a}`,origin:h.profile.origin,'x-csrf-token':csrf,'content-type':'application/json'},body:'{bad'});assert.equal(malformed.status,400);
  const out=await h.write('/auth/logout',a,'POST');assert.equal(out.status,204);assert.match(out.headers.get('set-cookie')!,/HttpOnly; SameSite=Lax; Max-Age=0/);
  assert.equal((await h.request('/me/session',a)).status,401);assert.equal((await h.request('/auth/logout',a,'POST',{}, {origin:h.profile.origin,'x-csrf-token':csrf})).status,401);
 }finally{await h.close();}
});
test('identity: staff is unavailable, missing policies deny and service rejects fabricated context',async()=>{
 const h=await harness();try{
  for(const user of [fixtureUsers.a,fixtureUsers.staff]){
    const token=await h.issue(user);assert.equal((await h.write('/staff/articles/example/publish',token,'POST')).status,403);
  }
  const identity=new IdentityService(h.store,h.clock),ctx=await identity.authenticate(await h.issue(fixtureUsers.staff));
  await assert.rejects(identity.authorize(ctx,'publisher'),{code:'FORBIDDEN'});await assert.rejects(identity.authorize(ctx,'unknown'),{code:'FORBIDDEN'});
  const service=new MemberService(identity,h.store,h.articles,h.clock);
  await assert.rejects(service.preferences({userId:fixtureUsers.a,sessionId:ctx.sessionId}),{code:'UNAUTHENTICATED'});
  await assert.rejects(service.preferences(ctx),{code:'FORBIDDEN'});
 }finally{await h.close();}
});
test('identity: concurrent users retain request-scoped identities; failures deny and public reader stays independent',async()=>{
 const h=await harness();try{
  const a=await h.issue(fixtureUsers.a),b=await h.issue(fixtureUsers.b);
  const responses=await Promise.all(Array.from({length:30},(_,i)=>h.request('/me/session',i%2?a:b).then(r=>r.json())));responses.forEach((r,i)=>assert.equal(r.data.user.id,i%2?fixtureUsers.a:fixtureUsers.b));
  h.store.updatePreferences=async()=>{throw new Error('Member store unavailable');};
  assert.equal((await h.write('/me/preferences',a,'PATCH',{theme:'dark',lockVersion:0})).status,503);
  assert.equal((await h.store.preferences(fixtureUsers.a)).theme,'system');
  h.store.session=async()=>{throw new Error('Private store detail must not leak');};
  const denied=await h.request('/me/preferences',a);assert.equal(denied.status,503);assert.ok(!(await denied.text()).includes('Private store'));
  const publicResponse=await h.request('/articles/alderwick-evening-shuttle',a);assert.equal(publicResponse.status,200);assert.equal((await publicResponse.json()).data.sources.length,4);
 }finally{await h.close();}
});
test('identity: fixture issuer and cookie profiles fail closed outside explicit local test configuration',async()=>{
 const store=new MemoryMemberRepository();
 const original=process.env.NODE_ENV;process.env.NODE_ENV='production';
 try{assert.throws(()=>fixtureIssuer(store,{mode:'local-test',nodeEnv:'test'}));}finally{if(original===undefined)delete process.env.NODE_ENV;else process.env.NODE_ENV=original;}
 for(const config of [{mode:'production',nodeEnv:'production'},{mode:'local-test',nodeEnv:'production'},{mode:'',nodeEnv:'test'}])assert.throws(()=>fixtureIssuer(store,config));
 assert.throws(()=>cookieProfile('http://127.0.0.1:3000','production'));assert.throws(()=>cookieProfile('http://example.com','test'));
 const secure=cookieProfile('https://reader.example','production');assert.equal(secure.name,'__Host-agg_session');assert.ok(/Path=\/; HttpOnly; SameSite=Lax; Secure/.test(sessionCookie(secure,`${randomUUID()}.${randomBytes(32).toString('hex')}`)));
 const server=createApp(createFixtureRepository(),{profile:secure}).listen(0,'127.0.0.1');await once(server,'listening');
 try{const address=server.address();assert.ok(address&&typeof address!=='string');for(const path of ['/auth/fixture','/auth/login','/auth/email','/auth/oidc/start'])assert.notEqual((await fetch(`http://127.0.0.1:${address.port}/api/v1${path}`,{method:'POST'})).status,200);}finally{server.close();await once(server,'close');}
});
test('identity: normal server refuses configured database fallback and fixture issuance flags',()=>{
 for(const extra of [{DATABASE_URL:'postgresql://fixture.invalid/unavailable'},{PERSISTENCE_ADAPTER:'postgres'},{FIXTURE_SESSION_ISSUANCE:'true'}]){
   const env={...process.env,NODE_ENV:'test',...extra};
   const result=spawnSync(process.execPath,['--import','tsx','apps/api/src/server.ts'],{env,encoding:'utf8',timeout:5000,windowsHide:true});
   assert.equal(result.status,1);assert.ok(/refusing memory fallback|non-HTTP test harness/.test(result.stderr));
 }
});
