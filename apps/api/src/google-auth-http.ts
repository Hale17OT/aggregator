import express,{type Request} from 'express';
import {randomBytes,randomUUID} from 'node:crypto';
import {existsSync,readFileSync} from 'node:fs';
import {z} from 'zod';
import {AccessError,IdentityService,verifier,equalVerifier} from '../../../packages/domain/src/identity.js';
import {verifyGoogleCredential,type GoogleConfiguration} from '../../../packages/domain/src/google-identity.js';
import {attestTarget,PostgresMemberRepository,type PostgresMemberUnit} from '../../../packages/db/src/member.js';
import {sessionCookie,type CookieProfile} from './member-http.js';

const clientId=z.string().regex(/^\d+-[a-z0-9]+\.apps\.googleusercontent\.com$/);
const configSchema=z.object({webClientId:clientId,androidClientId:clientId.optional(),iosClientId:clientId.optional(),origin:z.literal('http://127.0.0.1:3000')}).strict();
export function googleConfiguration():GoogleConfiguration|undefined {
 if(process.env.NODE_ENV==='production')return undefined;
 const file='.cache/google-local.json';return existsSync(file)?configSchema.parse(JSON.parse(readFileSync(file,'utf8'))):undefined;
}
function cookie(req:Request,name:string){const xs=(req.headers.cookie||'').split(';').map(s=>s.trim()).filter(s=>s.startsWith(name+'='));return xs.length===1?xs[0].slice(name.length+1):undefined;}
const proof=z.string().regex(/^[a-f0-9]{64}$/);
const start=z.object({action:z.enum(['sign-in','link','reauthenticate']).default('sign-in'),proof:proof.optional()}).strict();
const exchange=z.object({id:z.uuid(),credential:z.string().min(20).max(8192),proof:proof.optional()}).strict();
const cancel=z.object({id:z.uuid(),proof:proof.optional()}).strict();
export function googleAuthRouter(unit:PostgresMemberUnit,profile:CookieProfile,config:GoogleConfiguration){
 if(config.origin!==profile.origin)throw Error('Google/application origin mismatch');
 const router=express.Router();router.use(express.json({limit:'12kb',strict:true}));
 router.get('/auth/google/config',(_req,res)=>res.json({data:{webClientId:config.webClientId,origin:profile.origin}}));
 router.post(['/auth/google/start','/auth/google/exchange','/auth/google/cancel','/native/auth/google/start','/native/auth/google/exchange','/native/auth/google/cancel'],async(req,res,next)=>{try{
  const channel=req.path.startsWith('/native/')?'native':'web';
  if(!req.is('application/json')||Object.keys(req.query).length)throw new AccessError(422,'INVALID_INPUT');
  let binding:string;
  if(channel==='native'){
   if(req.headers.cookie||req.headers.origin)throw new AccessError(403,'TRANSPORT_REJECTED');
   if(!proof.safeParse(req.body?.proof).success)throw new AccessError(422,'INVALID_INPUT');binding=verifier(req.body.proof);
  }else{
   const pre=cookie(req,'agg_pre_auth');
   if(req.headers.authorization||req.get('Origin')!==profile.origin||req.get('Sec-Fetch-Site')==='cross-site'||!pre||!equalVerifier(verifier(pre),req.get('X-CSRF-Token')||''))throw new AccessError(403,'CSRF_REJECTED');
   binding=verifier(pre);
  }
  if(req.path.endsWith('/start')){
   const p=start.safeParse(req.body);if(!p.success)throw new AccessError(422,'INVALID_INPUT');
   const id=randomUUID(),nonce=randomBytes(32).toString('hex');
   const ok=await unit.run(async(identity,members)=>{
    const c=(members as PostgresMemberRepository).client;let session:string|null=null;
    if(p.data.action!=='sign-in'){
     if(channel==='native'&&req.rawHeaders.filter((v,i)=>i%2===0&&v.toLowerCase()==='authorization').length!==1)throw new AccessError(401,'UNAUTHENTICATED');
     const token=channel==='native'?req.get('Authorization')?.match(/^Bearer ([a-f0-9-]{36}\.[a-f0-9]{64})$/)?.[1]:cookie(req,profile.name);
     const service=new IdentityService(identity),context=await service.authenticate(token,channel);
     session=context.sessionId;
    }else if(req.headers.authorization)throw new AccessError(403,'TRANSPORT_REJECTED');
    return (await c.query('SELECT public.start_google_attempt($1,$2,$3,$4,$5,$6) ok',[id,channel,p.data.action,binding,nonce,session])).rows[0].ok;
   });
   if(!ok)throw new AccessError(429,'AUTH_ATTEMPT_UNAVAILABLE');res.json({data:{id,nonce,serverClientId:config.webClientId}});return;
  }
  const p=(req.path.endsWith('/cancel')?cancel:exchange).safeParse(req.body);if(!p.success)throw new AccessError(422,'INVALID_INPUT');
  if(req.headers.authorization)throw new AccessError(403,'TRANSPORT_REJECTED');
  if(req.path.endsWith('/cancel')){await unit.run(async(_,members)=>{await (members as PostgresMemberRepository).client.query('SELECT public.cancel_google_attempt($1,$2,$3)',[p.data.id,channel,binding]);});res.status(204).end();return;}
  const parsed=exchange.parse(req.body);
  // Short autocommit lookup, released before network/crypto. No account locks.
  const c=await unit.pool.connect();let attempt:{nonce:string;action:string}|null;
  try{await attestTarget(c,unit.target);attempt=(await c.query('SELECT public.read_google_attempt($1,$2,$3) value',[parsed.id,channel,binding])).rows[0].value;}finally{c.release();}
  if(!attempt)throw new AccessError(401,'AUTH_ATTEMPT_UNAVAILABLE');
  const verified=await verifyGoogleCredential(parsed.credential,config,attempt.nonce);
  const id=randomUUID(),secret=randomBytes(32).toString('hex'),csrf=randomBytes(32).toString('hex');
  await unit.run(async(_,members)=>{
   const result=await (members as PostgresMemberRepository).client.query('SELECT public.finish_google_attempt($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) ok',[parsed.id,channel,binding,attempt.nonce,verified.subject,verified.email,verified.emailVerified,verified.name,id,verifier(secret),csrf]);
   if(!result.rows[0].ok)throw new AccessError(401,'AUTH_ATTEMPT_UNAVAILABLE');
  });
  if(channel==='web'){res.setHeader('Set-Cookie',sessionCookie(profile,`${id}.${secret}`));res.json({data:{signedIn:true}});}
  else res.json({data:{credential:`${id}.${secret}`,assurance:'provider-verified'}});
 }catch(e){next(e);}});
 return router;
}

