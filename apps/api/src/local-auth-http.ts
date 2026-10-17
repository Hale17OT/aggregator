import express from 'express';
import { randomBytes, randomUUID } from 'node:crypto';
import { createConnection } from 'node:net';
import { z } from 'zod';
import { AccessError, verifier, equalVerifier } from '../../../packages/domain/src/identity.js';
import { attestTarget, type PostgresMemberUnit } from '../../../packages/db/src/member.js';
import { sessionCookie, type CookieProfile } from './member-http.js';

const destinations=['/library','/preferences','/radio','/newsroom','/'] as const;
const requestSchema=z.object({email:z.string().trim().toLowerCase().regex(/^[a-z0-9._+-]{1,64}@example\.test$/),returnPath:z.enum(destinations).default('/library')}).strict();
const redeemSchema=z.object({token:z.string().regex(/^[a-f0-9-]{36}\.[a-f0-9]{64}$/)}).strict();
const nonce=()=>randomBytes(32).toString('hex');

// Narrow SMTP client: fixed loopback destination, no relay config, no arbitrary headers.
export async function capturedMail(email:string,link:string,nativeCode=false){
 if(!/^[a-z0-9._+-]{1,64}@example\.test$/.test(email))throw new Error('Fictional destination required');
 const commands=['EHLO aggregator.example.test','MAIL FROM:<reader@aggregator.example.test>',`RCPT TO:<${email}>`,'DATA',`From: The Aggregator <reader@aggregator.example.test>\r\nTo: ${email}\r\nSubject: Confirm your local reader sign-in\r\nContent-Type: text/plain; charset=utf-8\r\n\r\n${nativeCode?'Local captured mailbox only. Complete sign-in in the initiating app.':'Fictional local mailbox capture only. Open in the same browser that requested it.'}\r\n${link}\r\n${nativeCode?'This code expires in 10 minutes; enter it only in the initiating app.':'This link expires in 15 minutes. GET preview does not sign you in.'}\r\n.`, 'QUIT'];
 await new Promise<void>((resolve,reject)=>{
  const socket=createConnection({host:'127.0.0.1',port:1025});let buffer='',step=0,finished=false;
  const fail=()=>{if(!finished){finished=true;socket.destroy();reject(new Error('Local mailbox unavailable'));}};
  socket.setTimeout(3000,fail);socket.on('error',fail);
  socket.on('data',data=>{buffer+=data.toString();let index;
   while((index=buffer.indexOf('\r\n'))>=0){const line=buffer.slice(0,index);buffer=buffer.slice(index+2);if(!/^\d{3} /.test(line))continue;
    const expected=[220,250,250,250,354,250,221][step];if(Number(line.slice(0,3))!==expected){fail();return;}
    if(step===6){finished=true;socket.end();resolve();return;}socket.write(commands[step++]+'\r\n');
   }
  });socket.on('close',()=>{if(!finished)fail();});
 });
}

export function localAuthRouter(unit:PostgresMemberUnit,profile:CookieProfile,send=capturedMail){
 if(process.env.NODE_ENV==='production')throw new Error('Captured mailbox is local only');
 const router=express.Router();router.use(express.json({limit:'8kb',strict:true}));
 const cookieName='agg_pre_auth';
 const preCookie=(secret:string,clear=false)=>`${cookieName}=${secret}; Path=/; HttpOnly; SameSite=Strict${profile.secure?'; Secure':''}; Max-Age=${clear?0:900}`;
 router.use((_req,res,next)=>{res.setHeader('Referrer-Policy','no-referrer');next();});
 router.get('/auth/preflight',(req,res)=>{const values=(req.headers.cookie||'').split(';').map(s=>s.trim()).filter(s=>s.startsWith(cookieName+'='));const old=values.length===1?values[0].slice(cookieName.length+1):'';const secret=/^[a-f0-9]{64}$/.test(old)?old:nonce();res.setHeader('Set-Cookie',preCookie(secret));res.json({data:{csrfToken:verifier(secret),environment:'local captured mailbox',mailboxUrl:'http://127.0.0.1:8025'}});});
 router.post(['/auth/request','/auth/confirm'],async(req,res,next)=>{try{
  const values=(req.headers.cookie||'').split(';').map(s=>s.trim()).filter(s=>s.startsWith(cookieName+'='));
  const secret=values.length===1?values[0].slice(cookieName.length+1):'';
  if(req.get('Origin')!==profile.origin||req.get('Sec-Fetch-Site')==='cross-site'||!/^[a-f0-9]{64}$/.test(secret)||!equalVerifier(verifier(secret),req.get('X-CSRF-Token')||''))throw new AccessError(403,'CSRF_REJECTED');
  if(!req.is('application/json'))throw new AccessError(415,'UNSUPPORTED_MEDIA_TYPE');
  if(Object.keys(req.query).length)throw new AccessError(422,'INVALID_INPUT');
  const client=await unit.pool.connect();let failed=false,committing=false;
  const onError=()=>{failed=true;};client.on('error',onError);
  try{
   await attestTarget(client,unit.target);await client.query('BEGIN');
   if(req.path==='/auth/request'){
    const parsed=requestSchema.safeParse(req.body);if(!parsed.success)throw new AccessError(422,'INVALID_INPUT');
    const id=randomUUID(),token=nonce();
    const r=await client.query('SELECT public.request_local_signin($1,$2,$3,$4,$5) AS ok',[id,parsed.data.email,verifier(token),verifier(secret),parsed.data.returnPath]);
    committing=true;await client.query('COMMIT');committing=false;
    if(r.rows[0].ok)await send(parsed.data.email,`${profile.origin}/auth/confirm#${id}.${token}`);
    res.status(202).json({data:{message:'If eligible, a link is in the local captured mailbox. Use the same browser to confirm.'}});
   }else{
    const parsed=redeemSchema.safeParse(req.body);if(!parsed.success)throw new AccessError(422,'INVALID_INPUT');
    const [id,token]=parsed.data.token.split('.'),sessionId=randomUUID(),bearer=nonce(),csrf=nonce();
    const r=await client.query('SELECT public.redeem_local_signin($1,$2,$3,$4,$5,$6) AS destination',[id,verifier(token),verifier(secret),sessionId,verifier(bearer),csrf]);
    committing=true;await client.query('COMMIT');committing=false; // Failed attempts are committed to the cross-process limiter.
    if(!r.rows[0].destination)throw new AccessError(401,'LINK_UNAVAILABLE');
    res.setHeader('Set-Cookie',[sessionCookie(profile,`${sessionId}.${bearer}`),preCookie('',true)]);
    res.json({data:{returnPath:r.rows[0].destination,assurance:'local-demo'}});
   }
  }catch(e){if(committing)failed=true;try{await client.query('ROLLBACK');}catch{failed=true;}throw e;}finally{client.removeListener('error',onError);client.release(failed);}
 }catch(e){next(e);}});
 return router;
}

