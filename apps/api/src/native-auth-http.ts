import express from 'express';
import {randomBytes,randomUUID,createHash} from 'node:crypto';
import {z} from 'zod';
import {AccessError,IdentityService,verifier,equalVerifier} from '../../../packages/domain/src/identity.js';
import {attestTarget,PostgresMemberRepository,type PostgresMemberUnit} from '../../../packages/db/src/member.js';
import type {CookieProfile} from './member-http.js';
const registered={client:z.literal('aggregator-local'),redirect:z.literal('aggregator-local://auth/callback')};
const start=z.object({...registered,challenge:z.string().regex(/^[A-Za-z0-9_-]{43}$/),state:z.string().regex(/^[A-Za-z0-9_-]{43}$/)}).strict();
const exchange=z.object({...registered,id:z.uuid(),code:z.string().regex(/^[a-f0-9]{64}$/),verifier:z.string().regex(/^[A-Za-z0-9_-]{43,128}$/)}).strict();
const approval=z.object({id:z.uuid()}).strict();
function cookie(raw:string|undefined,name:string){const found=(raw||'').split(';').map(v=>v.trim()).filter(v=>v.startsWith(name+'='));return found.length===1?found[0].slice(name.length+1):undefined;}
export function nativeAuthRouter(unit:PostgresMemberUnit,profile:CookieProfile){
 if(process.env.NODE_ENV==='production')throw Error('Local native bridge is not production identity');
 const router=express.Router();router.use(express.json({limit:'8kb',strict:true}));
 router.post(['/native/auth/start','/native/auth/exchange'],async(req,res,next)=>{try{
  if(req.headers.cookie||req.headers.origin||req.headers.authorization)throw new AccessError(403,'TRANSPORT_REJECTED');
  if(!req.is('application/json')||Object.keys(req.query).length)throw new AccessError(422,'INVALID_INPUT');
  const c=await unit.pool.connect();let broken=false,committing=false;const onError=()=>{broken=true;};c.on('error',onError);
  try{await attestTarget(c,unit.target);await c.query('BEGIN');
   if(req.path.endsWith('/start')){const p=start.safeParse(req.body);if(!p.success)throw new AccessError(422,'INVALID_INPUT');const id=randomUUID();const result=await c.query('SELECT public.start_native_handoff($1,$2,$3) ok',[id,p.data.challenge,p.data.state]);committing=true;await c.query('COMMIT');committing=false;if(!result.rows[0].ok)throw new AccessError(429,'RATE_LIMITED');res.json({data:{id,authorizationUrl:`${profile.origin}/auth/native?id=${id}`}});
   }else{const p=exchange.safeParse(req.body);if(!p.success)throw new AccessError(422,'INVALID_INPUT');const id=randomUUID(),secret=randomBytes(32).toString('hex'),csrf=randomBytes(32).toString('hex');const proof=createHash('sha256').update(p.data.verifier).digest('base64url');const result=await c.query('SELECT public.exchange_native_handoff($1,$2,$3,$4,$5,$6) ok',[p.data.id,proof,verifier(p.data.code),id,verifier(secret),csrf]);committing=true;await c.query('COMMIT');committing=false;if(!result.rows[0].ok)throw new AccessError(401,'HANDOFF_UNAVAILABLE');res.json({data:{credential:`${id}.${secret}`,assurance:'local-demo'}});}
  }catch(e){if(committing)broken=true;try{await c.query('ROLLBACK');}catch{broken=true;}throw e;}finally{c.removeListener('error',onError);c.release(broken);}
 }catch(e){next(e);}});
 router.post('/auth/native/bind',async(req,res,next)=>{try{
  const p=approval.safeParse(req.body),pre=cookie(req.headers.cookie,'agg_pre_auth');
  if(!p.success||!req.is('application/json')||Object.keys(req.query).length)throw new AccessError(422,'INVALID_INPUT');
  if(req.headers.authorization||req.get('Origin')!==profile.origin||req.get('Sec-Fetch-Site')==='cross-site'||!pre||!equalVerifier(verifier(pre),req.get('X-CSRF-Token')||''))throw new AccessError(403,'CSRF_REJECTED');
  const existing=cookie(req.headers.cookie,'agg_native_browser'),browser=existing&&/^[a-f0-9]{64}$/.test(existing)?existing:randomBytes(32).toString('hex');
  const ok=await unit.run(async(_,members)=>{const c=(members as PostgresMemberRepository).client;return (await c.query('SELECT public.bind_native_handoff($1,$2) ok',[p.data.id,verifier(browser)])).rows[0].ok;});
  if(!ok)throw new AccessError(401,'HANDOFF_UNAVAILABLE');res.setHeader('Set-Cookie',`agg_native_browser=${browser}; Path=/; HttpOnly; SameSite=Strict; Max-Age=900${profile.secure?'; Secure':''}`);res.json({data:{bound:true}});
 }catch(e){next(e);}});
 router.post('/auth/native/approve',async(req,res,next)=>{try{
  const p=approval.safeParse(req.body),browser=cookie(req.headers.cookie,'agg_native_browser');
  if(!p.success||!req.is('application/json')||Object.keys(req.query).length)throw new AccessError(422,'INVALID_INPUT');
  if(req.headers.authorization||req.get('Origin')!==profile.origin||req.get('Sec-Fetch-Site')==='cross-site'||!browser||!/^[a-f0-9]{64}$/.test(browser))throw new AccessError(403,'CSRF_REJECTED');
  const code=randomBytes(32).toString('hex');const state=await unit.run(async(identity,members)=>{const service=new IdentityService(identity),context=await service.authenticate(cookie(req.headers.cookie,profile.name));await service.verifyCsrf(context,req.get('X-CSRF-Token'));const c=(members as PostgresMemberRepository).client;return (await c.query('SELECT public.approve_native_handoff($1,$2,$3,$4) state',[p.data.id,verifier(browser),context.sessionId,verifier(code)])).rows[0].state;});
  if(!state)throw new AccessError(401,'HANDOFF_UNAVAILABLE');res.json({data:{callback:`aggregator-local://auth/callback?code=${code}&state=${state}`}});
 }catch(e){next(e);}});
 return router;
}

