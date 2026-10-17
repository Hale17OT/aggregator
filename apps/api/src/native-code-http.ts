import express from 'express';
import {randomBytes,randomInt,randomUUID,createHmac} from 'node:crypto';
import {readFileSync,writeFileSync,existsSync} from 'node:fs';
import {z} from 'zod';
import {AccessError,verifier} from '../../../packages/domain/src/identity.js';
import {attestTarget,type PostgresMemberUnit} from '../../../packages/db/src/member.js';
import {capturedMail} from './local-auth-http.js';
const proof=z.string().regex(/^[a-f0-9]{64}$/);
const request=z.object({email:z.string().trim().toLowerCase().regex(/^[a-z0-9._+-]{1,64}@example\.test$/),proof}).strict();
const confirm=z.object({id:z.uuid(),code:z.string().regex(/^\d{8}$/),proof}).strict();
export function nativeCodeRouter(unit:PostgresMemberUnit,send=capturedMail){
 if(process.env.NODE_ENV==='production')throw Error('Captured code is local only');
 const path='.cache/native-code-key';
 if(!existsSync(path)){try{writeFileSync(path,randomBytes(32),{flag:'wx',mode:0o600});}catch(e){if(!existsSync(path))throw e;}}
 const key=readFileSync(path);if(key.length!==32)throw Error('Invalid code-verifier key');
 const mac=(id:string,binding:string,code:string)=>createHmac('sha256',key).update(JSON.stringify([id,binding,code])).digest('hex');
 const router=express.Router();router.use(express.json({limit:'2kb',strict:true}));
 router.post(['/native/auth/code/request','/native/auth/code/confirm'],async(req,res,next)=>{try{
  if(req.headers.cookie||req.headers.origin||req.headers.authorization)throw new AccessError(403,'TRANSPORT_REJECTED');
  if(!req.is('application/json')||Object.keys(req.query).length)throw new AccessError(422,'INVALID_INPUT');
  const requesting=req.path.endsWith('/request');
  const parsed=(requesting?request:confirm).safeParse(req.body);if(!parsed.success)throw new AccessError(422,'INVALID_INPUT');
  const data=parsed.data,id=requesting?randomUUID():('id' in data?data.id:''),code=requesting?String(randomInt(0,100000000)).padStart(8,'0'):('code' in data?data.code:'');
  const session=randomUUID(),bearer=randomBytes(32).toString('hex'),csrf=randomBytes(32).toString('hex');
  const client=await unit.pool.connect();let broken=false,ok=false,committing=false;
  const onError=()=>{broken=true;};client.on('error',onError);
  try{await attestTarget(client,unit.target);await client.query('BEGIN');
   const result=requesting?await client.query('SELECT public.request_native_code($1,$2,$3,$4) ok',[id,'email' in data?data.email:'',mac(id,data.proof,code),verifier(data.proof)]):await client.query('SELECT public.redeem_native_code($1,$2,$3,$4,$5,$6) ok',[id,mac(id,data.proof,code),verifier(data.proof),session,verifier(bearer),csrf]);
   ok=result.rows[0].ok;committing=true;await client.query('COMMIT');committing=false;
  }catch(e){if(committing)broken=true;try{await client.query('ROLLBACK');}catch{broken=true;}throw e;}finally{client.removeListener('error',onError);client.release(broken);}
  if(requesting){if(ok&&'email' in data)await send(data.email,`Native app code: ${code}\nEnter this code in the initiating Aggregator app. Expires in 10 minutes.`,true);res.status(202).json({data:{id,message:'If eligible, a code is in the local captured mailbox. Wait at least 60 seconds before requesting another.'}});}
  else{if(!ok)throw new AccessError(401,'CODE_UNAVAILABLE');res.json({data:{credential:`${session}.${bearer}`,assurance:'local-demo'}});}
 }catch(e){next(e);}});
 return router;
}
