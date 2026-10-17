import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {writeFileSync} from 'node:fs';
const base='http://127.0.0.1:4000',email=`phase-http-${Date.now()}@example.test`,proof=randomBytes(32).toString('hex');
const post=async(path,body)=>{const r=await fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});return {status:r.status,body:await r.json()};};
const start=await post('/api/v1/native/auth/code/request',{email,proof});assert.equal(start.status,202);
let message;
for(let i=0;i<10&&!message;i++){const list=await(await fetch('http://127.0.0.1:8025/api/v1/messages?limit=100')).json();const item=list.messages.find(m=>m.To.some(t=>t.Address===email));if(item)message=await(await fetch('http://127.0.0.1:8025/api/v1/message/'+item.ID)).json();else await new Promise(r=>setTimeout(r,200));}
assert.ok(message);const code=message.Text.match(/Native app code: (\d{8})/)?.[1];assert.ok(code);
const result=await post('/api/v1/native/auth/code/confirm',{id:start.body.data.id,proof,code});
if(result.status!==200){console.log({step:'confirm',status:result.status,code:result.body.error?.code});process.exitCode=1;}else{
 const headers={Authorization:'Bearer '+result.body.data.credential};
 const session=await fetch(base+'/api/v1/native/me/session',{headers});
 const profile=await fetch(base+'/api/v1/native/me/profile',{headers});
 const exportResponse=await fetch(base+'/api/v1/native/me/export',{headers});
 const preferencesResponse=await fetch(base+'/api/v1/native/me/preferences',{headers});
 const interestsResponse=await fetch(base+'/api/v1/native/me/interests',{headers});
 const listeningResponse=await fetch(base+'/api/v1/native/me/listening',{headers});
 console.log({preferences:preferencesResponse.status,interests:interestsResponse.status,listening:listeningResponse.status});
 const simultaneous=await Promise.all(['/me/listening','/me/preferences','/me/interests','/me/bookmarks'].map(async path=>{const t=Date.now();const r=await fetch(base+'/api/v1/native'+path,{headers});return {path,status:r.status,ms:Date.now()-t};}));console.log({simultaneous});
 const replay=await post('/api/v1/native/auth/code/confirm',{id:start.body.data.id,proof,code});
 const report={at:new Date().toISOString(),request:start.status,exchange:result.status,session:session.status,profile:profile.status,export:exportResponse.status,replay:replay.status,assurance:'local captured mail; no external delivery'};
 assert.equal(session.status,200);assert.equal(profile.status,200);assert.equal(exportResponse.status,200);assert.equal(replay.status,401);
 await fetch(base+'/api/v1/native/auth/logout',{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:'{}'});
 writeFileSync('docs/engineering/real-news-google-profile/native-code-http.json',JSON.stringify(report,null,2));console.log(report);
}
