import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {writeFileSync} from 'node:fs';
const base='http://127.0.0.1:4000',origin='http://127.0.0.1:3000',reports=[];
async function request(path,{body,headers={},method=body?'POST':'GET'}={}){const r=await fetch(base+path,{method,headers:{...headers,...(body?{'Content-Type':'application/json'}:{})},body:body?JSON.stringify(body):undefined});return {status:r.status,cookies:r.headers.getSetCookie(),value:r.status===204?null:await r.json()};}
async function mail(email,pattern){for(let i=0;i<15;i++){const list=await(await fetch('http://127.0.0.1:8025/api/v1/messages?limit=100')).json();for(const item of list.messages.filter(m=>m.To.some(t=>t.Address===email))){const m=await(await fetch('http://127.0.0.1:8025/api/v1/message/'+item.ID)).json();const match=m.Text.match(pattern);if(match)return match[1];}await new Promise(r=>setTimeout(r,150));}throw Error('TEST_CAPTURE_MISSING');}
for(let run=1;run<=3;run++){
 const email=`phase-connected-${Date.now()}@example.test`,proof=randomBytes(32).toString('hex');
 const start=await request('/api/v1/native/auth/code/request',{body:{email,proof}});assert.equal(start.status,202);
 const code=await mail(email,/Native app code: (\d{8})/),exchange=await request('/api/v1/native/auth/code/confirm',{body:{id:start.value.data.id,proof,code}});assert.equal(exchange.status,200);
 const native={Authorization:'Bearer '+exchange.value.data.credential};
 const pre=await request('/api/v1/auth/preflight'),preHeaders={Cookie:pre.cookies.map(c=>c.split(';')[0]).join('; '),Origin:origin,'X-CSRF-Token':pre.value.data.csrfToken};
 assert.equal((await request('/api/v1/auth/request',{headers:preHeaders,body:{email}})).status,202);
 const token=await mail(email,/http:\/\/127\.0\.0\.1:3000\/auth\/confirm#([^\s]+)/);
 const confirmation=await request('/api/v1/auth/confirm',{headers:preHeaders,body:{token}});assert.equal(confirmation.status,200);
 const web={Cookie:confirmation.cookies.filter(c=>c.startsWith('agg_session=')).map(c=>c.split(';')[0]).join('; '),Origin:origin};
 const session=await request('/api/v1/me/session',{headers:web});web['X-CSRF-Token']=session.value.data.csrfToken;
 const nSession=await request('/api/v1/native/me/session',{headers:native});assert.equal(session.value.data.user.id,nSession.value.data.user.id);
 const profile=(await request('/api/v1/me/profile',{headers:web})).value.data;
 assert.equal((await request('/api/v1/me/profile',{headers:{Cookie:web.Cookie,Origin:origin},method:'PATCH',body:{revision:profile.revision,displayName:'Denied'}})).status,403);
 assert.equal((await request('/api/v1/me/profile',{headers:web,method:'PATCH',body:{revision:profile.revision,displayName:'Connected reader '+run}})).status,200);
 assert.equal((await request('/api/v1/native/me/profile',{headers:native})).value.data.displayName,'Connected reader '+run);
 assert.equal((await request('/api/v1/native/me/profile',{headers:native,method:'PATCH',body:{revision:profile.revision,displayName:'Stale draft'}})).status,409);
 const prefs=(await request('/api/v1/native/me/preferences',{headers:native})).value.data;
 assert.equal((await request('/api/v1/native/me/preferences',{headers:native,method:'PATCH',body:{lockVersion:prefs.lockVersion,theme:'dark'}})).status,200);
 assert.equal((await request('/api/v1/me/preferences',{headers:web})).value.data.theme,'dark');
 const interests=(await request('/api/v1/native/me/interests',{headers:native})).value.data;
 assert.equal((await request('/api/v1/native/me/interests',{headers:native,method:'PUT',body:{revision:interests.revision,status:'completed',rules:[{target:'agg:topic:science-and-space',action:'follow'}],hiddenStories:[]}})).status,200);
 const edition=await request('/api/v1/me/edition',{headers:web});assert.equal(edition.status,200);assert.equal(edition.value.data.meta.total,5);
 const article=edition.value.data.data[0].article;assert.equal(article.fixture,false);
 assert.equal((await request('/api/v1/native/me/bookmarks/'+article.id,{headers:native,method:'PUT',body:{}})).status,200);
 assert((await request('/api/v1/me/bookmarks',{headers:web})).value.data.some(b=>b.kind==='publisher-source'&&b.articleId===article.id));
 const exported=await request('/api/v1/me/export',{headers:web});assert.equal(exported.status,200);assert(!JSON.stringify(exported.value).includes(exchange.value.data.credential));
 await request('/api/v1/native/auth/logout',{headers:native,body:{}});await request('/api/v1/auth/logout',{headers:web,body:{}});
 assert.equal((await request('/api/v1/native/me/profile',{headers:native})).status,401);
 reports.push({run,status:'passed',checks:['actual captured-code native session','same captured-mail member through web confirmation','CSRF denial','Profile synchronization and stale409','shared appearance preferences','Science live interest edition5','typed live bookmark cross-client','bounded safe export','logout invalidation']});
}
writeFileSync('docs/engineering/real-news-google-profile/connected-http.json',JSON.stringify({at:new Date().toISOString(),reports,limits:'Actual local services and retained test accounts; captured mail is not Google provider verification or external delivery. No retained deletion tested.'},null,2));console.log(reports);

