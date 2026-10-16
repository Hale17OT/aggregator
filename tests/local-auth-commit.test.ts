import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventEmitter, once } from 'node:events';
import { realpathSync } from 'node:fs';
import express from 'express';
import { localAuthRouter } from '../apps/api/src/local-auth-http.js';
import { cookieProfile,memberError } from '../apps/api/src/member-http.js';
import type { PostgresMemberUnit } from '../packages/db/src/member.js';

test('uncertain authentication COMMIT discards connection and never reports success',async()=>{
  let destroyed=false;const target={data:realpathSync('.'),host:'127.0.0.1',port:55440,database:'aggregator_identity',systemIdentifier:'123'};
  class Client extends EventEmitter {
    async query(sql:string){if(sql.includes('fixture_target_identity'))return {rows:[{target:{directory:target.data,system:'123',database:target.database,host:target.host,port:target.port,version:'180001'}}]};if(sql==='COMMIT')throw new Error('Simulated ambiguous commit');if(sql.includes('request_local_signin'))return {rows:[{ok:false}]};return {rows:[]};}
    release(discard:boolean){destroyed=discard;}
  }
  const client=new Client();const unit={target,pool:{connect:async()=>client}} as unknown as PostgresMemberUnit;
  const app=express();app.use(localAuthRouter(unit,cookieProfile('http://127.0.0.1:3000','test'),async()=>{throw Error('Mail must not be sent');}));app.use(memberError);const server=app.listen(0,'127.0.0.1');await once(server,'listening');const address=server.address();assert.ok(address&&typeof address==='object');const base=`http://127.0.0.1:${address.port}`;
  try{const preflight=await fetch(base+'/auth/preflight'),cookie=preflight.headers.getSetCookie()[0]!.split(';')[0]!;const csrf=(await preflight.json()).data.csrfToken;const response=await fetch(base+'/auth/request',{method:'POST',headers:{cookie,origin:'http://127.0.0.1:3000','x-csrf-token':csrf,'content-type':'application/json'},body:JSON.stringify({email:'test@example.test'})});assert.equal(response.status,503);assert.equal(response.headers.getSetCookie().length,0);assert.equal(destroyed,true);assert.equal(client.listenerCount('error'),0);}finally{await new Promise<void>((resolve,reject)=>server.close(e=>e?reject(e):resolve()));}
});
