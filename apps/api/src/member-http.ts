import express, { type Request, type Response, type NextFunction } from 'express';
import {z} from 'zod';
import { randomUUID } from 'node:crypto';
import { AccessError, IdentityService } from '../../../packages/domain/src/identity.js';
import { MemberService } from '../../../packages/domain/src/member.js';
import type { MemberUnitOfWork } from '../../../packages/domain/src/member-unit.js';
import type { PublicationRepository } from '../../../packages/domain/src/publication.js';
import type { Clock } from '../../../packages/domain/src/identity.js';
import { emptyMutationSchema,queuePatchSchema,progressPatchSchema } from '../../../packages/contracts/src/member.js';
import { programmes } from '../../../packages/programme/src/store.js';
import { interestsPatch } from '../../../packages/contracts/src/interests.js';
import { validateRules,relevance,concept } from '../../../packages/domain/src/taxonomy.js';
import { edition,subjects } from '../../../packages/domain/src/reader-editions.js';
import { publicProjection } from '../../../packages/domain/src/publication.js';

export interface CookieProfile {origin:string;secure:boolean;name:string;}
export function cookieProfile(origin:string,nodeEnv:string):CookieProfile {
  const url=new URL(origin);if(url.origin!==origin||url.username||url.password)throw new Error('Exact application origin required');
  const secure=url.protocol==='https:';
  if(!secure&&(nodeEnv==='production'||url.protocol!=='http:'||!['127.0.0.1','localhost','[::1]'].includes(url.hostname)))throw new Error('Insecure cookies are restricted to nonproduction loopback');
  return {origin,secure,name:secure?'__Host-agg_session':'agg_session'};
}
export function sessionCookie(profile:CookieProfile,token:string,clear=false){
  if(!clear&&!/^[a-f0-9-]{36}\.[a-f0-9]{64}$/.test(token))throw new Error('Invalid session credential');
  return `${profile.name}=${clear?'':token}; Path=/; HttpOnly; SameSite=Lax${profile.secure?'; Secure':''}${clear?'; Max-Age=0':''}`;
}
function credential(req:Request,profile:CookieProfile){
  const matches=(req.headers.cookie||'').split(';').map(s=>s.trim()).filter(s=>s.startsWith(profile.name+'='));
  if(matches.length!==1)return undefined;return matches[0].slice(profile.name.length+1);
}
export function memberRouter(unit:MemberUnitOfWork,articles:PublicationRepository,profile:CookieProfile,clock?:Clock,transport:'web'|'native'='web',liveReader?:()=>Promise<import('../../../packages/contracts/src/index.js').PublicArticle[]>){
  const router=express.Router();
  router.use(express.json({limit:'8kb',strict:true}));
  router.use(async(req,res,next)=>{
    try{
      const liveAvailable=['/me/edition','/me/interest-preview'].includes(req.path)&&liveReader?await liveReader():undefined;
      // No response is sent until the complete unit of work has committed.
      const result=await unit.run(async(identityRepo,memberRepo)=>{
        const identity=new IdentityService(identityRepo,clock),members=new MemberService(identity,memberRepo,articles,clock);
        const native=transport==='native';
        if(native&&(req.headers.cookie||req.headers.origin||req.rawHeaders.filter((v,i)=>i%2===0&&v.toLowerCase()==='authorization').length!==1))throw new AccessError(401,'UNAUTHENTICATED');
        if(!native&&req.headers.authorization)throw new AccessError(401,'UNAUTHENTICATED');
        const token=native?req.get('Authorization')?.match(/^Bearer ([a-f0-9-]{36}\.[a-f0-9]{64})$/)?.[1]:credential(req,profile);
        const context=await identity.authenticate(token,transport);
        if(Object.keys(req.query).length&&req.path!=='/me/edition')throw new AccessError(422,'INVALID_INPUT');
        if(req.path==='/me/edition'&&req.method==='GET'){if(Object.keys(req.query).some(k=>!['page','edition','q','topic'].includes(k))||Object.values(req.query).some(v=>typeof v!=='string'||v.length>120))throw new AccessError(422,'INVALID_INPUT');await identity.authorize(context,'preferences:read');if(!memberRepo.interests)throw new AccessError(503,'SERVICE_UNAVAILABLE');return {data:edition(articles,{available:liveAvailable,collection:liveAvailable?'live':'sample',owner:context.userId,interests:await memberRepo.interests(context.userId),mode:'following',q:typeof req.query.q==='string'?req.query.q:undefined,topic:typeof req.query.topic==='string'?req.query.topic:undefined,page:Number(req.query.page||1),token:typeof req.query.edition==='string'?req.query.edition:undefined})};}
        if(!['GET','HEAD','OPTIONS'].includes(req.method)){
          if(!native){if(req.get('Origin')!==profile.origin||req.get('Sec-Fetch-Site')==='cross-site')throw new AccessError(403,'CSRF_REJECTED');
          await identity.verifyCsrf(context,req.get('X-CSRF-Token'));}
          if(!req.is('application/json'))throw new AccessError(415,'UNSUPPORTED_MEDIA_TYPE');
        }
        const empty=()=>{if(!emptyMutationSchema.safeParse(req.body).success)throw new AccessError(422,'INVALID_INPUT');};
        const policy=(capability:string)=>identity.authorize(context,capability);
        if(req.path==='/me/export'&&req.method==='GET'){
          await policy('preferences:read');if(!memberRepo.exportData)throw new AccessError(503,'SERVICE_UNAVAILABLE');return {data:await memberRepo.exportData(context.userId)};
        }
        if(req.path==='/me/account-action'&&req.method==='POST'){
          await policy('preferences:write');const parsed=z.object({action:z.enum(['revoke-other','delete-account']),target:z.uuid().optional(),confirmation:z.string()}).strict().safeParse(req.body);
          if(!parsed.success||parsed.data.confirmation!==(parsed.data.action==='delete-account'?'DELETE MY AGGREGATOR ACCOUNT':'REVOKE OTHER SESSIONS')||parsed.data.action==='delete-account'&&parsed.data.target)throw new AccessError(422,'INVALID_INPUT');
          if(!memberRepo.accountAction)throw new AccessError(503,'SERVICE_UNAVAILABLE');await memberRepo.accountAction(parsed.data.action,context.sessionId,parsed.data.target);
          return {status:204,logout:parsed.data.action==='delete-account'};
        }
        if(req.path==='/me/profile'&&req.method==='GET'){await policy('preferences:read');if(!memberRepo.profile)throw new AccessError(503,'SERVICE_UNAVAILABLE');return {data:await memberRepo.profile()};}
        if(req.path==='/me/profile'&&req.method==='PATCH'){await policy('preferences:write');if(!memberRepo.editProfile)throw new AccessError(503,'SERVICE_UNAVAILABLE');const parsed=z.object({revision:z.number().int().nonnegative(),displayName:z.string().trim().min(1).max(80).refine(value=>Array.from(value).every(c=>c.charCodeAt(0)>=32&&c.charCodeAt(0)!==127))}).strict().safeParse(req.body);if(!parsed.success)throw new AccessError(422,'INVALID_INPUT');return {data:await memberRepo.editProfile(parsed.data.revision,parsed.data.displayName)};}
        if(req.path==='/me/session'&&req.method==='GET'){await policy('session:inspect');return {data:await identity.inspect(context)};}
        if(req.path==='/auth/logout'&&req.method==='POST'){empty();await policy('session:logout');await identity.logout(context);return {status:204,logout:true};}
        if(req.path==='/me/preferences'&&req.method==='GET'){await policy('preferences:read');return {data:await members.preferences(context)};}
        if(req.path==='/me/interests'&&req.method==='GET'){await policy('preferences:read');if(!memberRepo.interests)throw new AccessError(503,'SERVICE_UNAVAILABLE');const state=await memberRepo.interests(context.userId);return {data:{...state,labels:Object.fromEntries(state.rules.flatMap(r=>[r.target,...(r.competition?[r.competition]:[])]).map(id=>[id,concept(id)?.label||`Unavailable concept (${id})`]))}};}
        if(req.path==='/me/clips'&&req.method==='GET'){
          await policy('preferences:read');if(!memberRepo.interests)throw new AccessError(503,'SERVICE_UNAVAILABLE');const state=await memberRepo.interests(context.userId);
          const matches=articles.list().map(d=>publicProjection(d,'brief')).filter(a=>a!==null).filter(a=>!state.hiddenStories.includes(a.id)).map(a=>({a,reason:relevance(state.rules,subjects(a))})).filter(x=>x.reason);
          const ready=(await programmes(articles)).filter(p=>p.kind==='clip');return {data:ready.flatMap(p=>{const match=matches.find(x=>p.articleSlugs.includes(x.a.slug));return match?[{...p,reason:match.reason}]:[];}).sort((a,b)=>(b.reason?.specificity??0)-(a.reason?.specificity??0)||a.programmeId.localeCompare(b.programmeId))};
        }
        if(req.path==='/me/interest-preview'&&req.method==='POST'){
          await policy('preferences:read');const p=interestsPatch.safeParse(req.body);if(!p.success)throw new AccessError(422,'INVALID_INPUT');try{validateRules(p.data.rules);}catch{throw new AccessError(422,'INVALID_INPUT');}
          return {data:(liveAvailable??articles.list().map(d=>publicProjection(d,'brief')).filter(a=>a!==null)).filter(a=>!p.data.hiddenStories.includes(a.id)).flatMap(a=>{const reason=relevance(p.data.rules,subjects(a));return reason?[{id:a.id,slug:a.slug,headline:a.headline,reason}]:[];}).slice(0,24)};
        }
        if(req.path==='/me/interests'&&req.method==='PUT'){
          await policy('preferences:write');if(!memberRepo.updateInterests)throw new AccessError(503,'SERVICE_UNAVAILABLE');
          const p=interestsPatch.safeParse(req.body);if(!p.success)throw new AccessError(422,'INVALID_INPUT');
          try{validateRules(p.data.rules);}catch{throw new AccessError(422,'INVALID_INPUT');}
          return {data:await memberRepo.updateInterests(context.userId,p.data)};
        }
        if(req.path==='/me/preferences'&&req.method==='PATCH'){await policy('preferences:write');return {data:await members.updatePreferences(context,req.body)};}
        if(req.path==='/me/bookmarks'&&req.method==='GET'){await policy('bookmarks:read');return {data:[...await members.bookmarks(context),...await memberRepo.sourceBookmarks?.(context.userId)??[]]};}
        if(req.path==='/me/listening'&&req.method==='GET'){
          await policy('preferences:read');if(!memberRepo.listening)throw new AccessError(503,'SERVICE_UNAVAILABLE');
          const state=await memberRepo.listening(context.userId),ready=await programmes(articles);const ids=new Set(ready.map(p=>p.programmeId));
          return {data:{...state,queue:state.queue.filter(id=>ids.has(id)),progress:state.progress.filter(p=>ready.some(r=>r.programmeId===p.programmeId&&(r.renditionKey===p.renditionKey||r.videoRendition?.renditionKey===p.renditionKey)))}};
        }
        if(req.path==='/me/queue'&&req.method==='PUT'){
          await policy('preferences:write');const parsed=queuePatchSchema.safeParse(req.body);if(!parsed.success)throw new AccessError(422,'INVALID_INPUT');
          if(!memberRepo.updateQueue)throw new AccessError(503,'SERVICE_UNAVAILABLE');const ready=await programmes(articles);
          if(parsed.data.programmeIds.some(id=>!ready.some(p=>p.programmeId===id)))throw new AccessError(422,'INVALID_INPUT');
          return {data:await memberRepo.updateQueue(context.userId,parsed.data.revision,parsed.data.programmeIds)};
        }
        if(req.path==='/me/progress'&&req.method==='PUT'){
          await policy('preferences:write');const parsed=progressPatchSchema.safeParse(req.body);if(!parsed.success)throw new AccessError(422,'INVALID_INPUT');
          if(!memberRepo.updateProgress)throw new AccessError(503,'SERVICE_UNAVAILABLE');
          if(!(await members.preferences(context)).listeningHistory)throw new AccessError(409,'HISTORY_DISABLED');
          const p=(await programmes(articles)).find(p=>p.programmeId===parsed.data.programmeId&&(p.renditionKey===parsed.data.renditionKey||p.videoRendition?.renditionKey===parsed.data.renditionKey));if(!p)throw new AccessError(404,'NOT_FOUND');
          const positionMs=Math.min(p.durationMs,parsed.data.positionMs);
          return {data:await memberRepo.updateProgress(context.userId,{...parsed.data,positionMs,durationMs:p.durationMs,completed:positionMs>=p.durationMs-1000})};
        }
        if(req.path==='/me/progress'&&req.method==='DELETE'){
          empty();await policy('preferences:write');if(!memberRepo.clearProgress)throw new AccessError(503,'SERVICE_UNAVAILABLE');await memberRepo.clearProgress(context.userId);return {status:204};
        }
        const match=req.path.match(/^\/me\/bookmarks\/([^/]+)$/);
        if(match&&['PUT','DELETE'].includes(req.method)){
          empty();await policy('bookmarks:write');
          if(req.method==='PUT'){if(!articles.list().some(a=>a.id===match[1])&&memberRepo.saveSource){const saved=await memberRepo.saveSource(context.userId,match[1]);if(saved)return {data:saved};}return {data:await members.save(context,match[1])};}
          await members.remove(context,match[1]);await memberRepo.removeSource?.(context.userId,match[1]);return {status:204};
        }
        if(req.path==='/staff'||req.path.startsWith('/staff/'))await policy('staff:unavailable');
        throw new AccessError(404,'NOT_FOUND');
      });
      if(result.logout&&transport==='web')res.setHeader('Set-Cookie',sessionCookie(profile,'',true));
      if(result.status===204)res.status(204).end();else res.json({data:result.data,meta:{fixture:true,persistence:unit.persistence}});
    }catch(e){next(e);}
  });
  return router;
}
export function memberError(error:unknown,_req:Request,res:Response,_next:NextFunction){
  void _next; // Four arguments are required for Express error middleware registration.
  const parser=error as {type?:string};
  const failure=error instanceof AccessError?error:parser.type==='entity.parse.failed'?new AccessError(400,'MALFORMED_JSON'):parser.type==='entity.too.large'?new AccessError(413,'PAYLOAD_TOO_LARGE'):new AccessError(503,'SERVICE_UNAVAILABLE');
  if(failure.status===503)res.setHeader('Retry-After','1');
  res.status(failure.status).json({error:{code:failure.code,message:'Request could not be completed.',requestId:randomUUID()}});
}



