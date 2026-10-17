import {nativeCodeRouter} from './native-code-http.js';
import {googleAuthRouter,googleConfiguration} from './google-auth-http.js';
import type {PublicArticle} from '../../../packages/contracts/src/index.js';
import {deskSlug} from '../../../packages/domain/src/discovery.js';
import express from 'express';
import { randomUUID } from 'node:crypto';
import { publicProjection, type PublicationRepository } from '../../../packages/domain/src/publication.js';
import { type IdentityRepository, type Clock } from '../../../packages/domain/src/identity.js';
import { type MemberRepository } from '../../../packages/domain/src/member.js';
import { MemoryMemberRepository } from '../../../packages/test-fixtures/src/member.js';
import { cookieProfile, memberRouter, memberError, type CookieProfile } from './member-http.js';
import type { MemberUnitOfWork } from '../../../packages/domain/src/member-unit.js';
import { discoveryRouter } from './discovery-http.js';
import { localAuthRouter } from './local-auth-http.js';
import { nativeAuthRouter } from './native-auth-http.js';
import type { PostgresMemberUnit } from '../../../packages/db/src/member.js';
import { createProgrammeRouter } from './programme-http.js';
import { browse,taxonomyRevision,concept,ruleMatches } from '../../../packages/domain/src/taxonomy.js';
import { edition,subjects } from '../../../packages/domain/src/reader-editions.js';
export function createApp(repo:PublicationRepository,options:{identity?:IdentityRepository;members?:MemberRepository;clock?:Clock;profile?:CookieProfile;unit?:MemberUnitOfWork;localAuth?:PostgresMemberUnit;liveReader?:()=>Promise<PublicArticle[]>}={}){
  if(Boolean(options.identity)!==Boolean(options.members))throw new Error('Identity and member repositories must be configured together');
  const app=express();app.disable('x-powered-by');
  app.use((_req,res,next)=>{res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('X-Robots-Tag','noindex, nofollow');next();});
  app.get('/health',(_req,res)=>res.json({data:{status:'ok',adapter:options.unit?.persistence==='postgresql'?'fictional-postgresql-members':'deterministic-fictional-memory'},meta:{}}));
  if(options.liveReader)app.use('/api/v1',async(req,res,next)=>{try{
    if(req.method!=='GET'||req.query.collection==='sample')return next();
    const detail=req.path.match(/^\/articles\/(publisher-[a-f0-9-]{36})$/);
    if(!['/edition','/articles','/discover'].includes(req.path)&&!detail)return next();
    if(Object.keys(req.query).some(k=>!['page','edition','q','topic','variant'].includes(k))||Object.values(req.query).some(v=>typeof v!=='string'||v.length>120))return res.status(422).json({error:{code:'INVALID_INPUT'}});
    const available=await options.liveReader!();
    if(detail){const article=available.find(a=>a.slug===detail[1]);return article?res.json({data:article,meta:{collection:'live',contentKind:'publisher-original'}}):res.status(410).json({error:{code:'SOURCE_UNAVAILABLE'}});}
    if(req.path==='/articles')return res.json({data:available,meta:{collection:'live'}});
    if(req.path==='/discover')return res.json({data:available,meta:{topics:[...new Set(available.map(a=>a.topic))].map(name=>({name,slug:deskSlug(name)}))}});
    return res.json({data:edition(repo,{available,collection:'live',q:req.query.q as string|undefined,topic:req.query.topic as string|undefined,page:Number(req.query.page||1),token:req.query.edition as string|undefined})});
  }catch(e){next(e);}});
  app.use('/api/v1',discoveryRouter(repo));
  app.use('/api/v1',createProgrammeRouter(repo));
  app.get('/api/v1/edition',(req,res,next)=>{try{if(Object.keys(req.query).some(k=>!['page','edition','q','topic','collection'].includes(k))||Object.values(req.query).some(v=>typeof v!=='string'||v.length>120))return res.status(422).json({error:'INVALID_INPUT'});res.json({data:edition(repo,{q:typeof req.query.q==='string'?req.query.q:undefined,topic:typeof req.query.topic==='string'?req.query.topic:undefined,page:Number(req.query.page||1),token:typeof req.query.edition==='string'?req.query.edition:undefined})});}catch(e){next(e);}});
  app.get('/api/v1/interests/hub/:id',async(req,res,next)=>{const c=concept(String(req.params.id));if(!c){res.status(404).json({error:{code:'NOT_FOUND'}});return;}try{const available=options.liveReader?await options.liveReader():repo.list().map(d=>publicProjection(d,'brief')).filter(a=>a!==null);const articles=available.filter(a=>ruleMatches({target:c.id,action:'follow'},subjects(a)));res.json({data:{concept:c,articles}});}catch(e){next(e);}});
  app.get('/api/v1/interests/catalogue',(req,res)=>{const parent=typeof req.query.parent==='string'?req.query.parent:undefined,q=typeof req.query.q==='string'?req.query.q:'';if(q.length>120||parent&&parent.length>140){res.status(422).json({error:{code:'INVALID_INPUT'}});return;}res.json({data:browse(parent,q),meta:{revision:taxonomyRevision,authoredTopics:390,browseGroups:24,entities:6,coverage:'Authored catalogue; partial entity coverage. Broad reviewed source desks; no inferred team or competition coverage.'}});});
  app.get('/api/v1/articles',(_req,res)=>res.json({data:repo.list().map(d=>publicProjection(d,'brief')).filter(d=>d!==null),meta:{fixture:true}}));
  app.get('/api/v1/articles/:slug',(req,res)=>{
    const variant=req.query.variant??'standard';if(variant!=='standard'&&variant!=='brief'){res.status(422).json({error:{code:'INVALID_VARIANT',message:'Choose standard or brief.',requestId:randomUUID()}});return;}
    const d=repo.get(req.params.slug);if(d?.state==='withdrawn'){res.status(410).json({error:{code:'WITHDRAWN',message:'This article has been withdrawn pending review.',requestId:randomUUID()}});return;}
    const data=d?publicProjection(d,variant):null;if(!data){res.status(404).json({error:{code:'NOT_FOUND',message:'Article unavailable.',requestId:randomUUID()}});return;}
    res.json({data,meta:{fixture:true}});
  });
  const memory=new MemoryMemberRepository();
  const unit:MemberUnitOfWork=options.unit??{persistence:'memory',run:work=>work(options.identity??memory,options.members??memory)};
  const profile=options.profile??cookieProfile(process.env.APP_ORIGIN||'http://127.0.0.1:3000',process.env.NODE_ENV||'development');
  if(options.localAuth){app.use('/api/v1',localAuthRouter(options.localAuth,profile));const google=googleConfiguration();if(google)app.use('/api/v1',googleAuthRouter(options.localAuth,profile,google));}
  if(options.localAuth){app.use('/api/v1',nativeCodeRouter(options.localAuth));app.use('/api/v1',nativeAuthRouter(options.localAuth,profile));app.use('/api/v1/native',memberRouter(unit,repo,profile,options.clock,'native',options.liveReader));}
  app.use('/api/v1',memberRouter(unit,repo,profile,options.clock,'web',options.liveReader));
  app.use(memberError);
  app.use((_req,res)=>res.status(404).json({error:{code:'NOT_FOUND',message:'Resource unavailable.',requestId:randomUUID()}}));
  return app;
}




