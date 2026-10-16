import { Router } from 'express';
import { open } from 'node:fs/promises';
import type { PublicationRepository } from '../../../packages/domain/src/publication.js';
import { programmes, verifiedAsset, parseRange } from '../../../packages/programme/src/store.js';
import { audioEnvelope } from '../../../packages/programme/src/envelope.js';
export function createProgrammeRouter(repo:PublicationRepository){
  const router=Router();router.use((_req,res,next)=>{res.set({'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});next();});
  router.get('/programmes',async(_req,res)=>{res.json({data:await programmes(repo),meta:{fixture:true}});});
  router.get('/clips',async(_req,res)=>{res.json({data:(await programmes(repo)).filter(p=>p.kind==='clip'),meta:{fixture:true,finite:true}});});
  router.get('/programmes/:id/envelope',async(req,res)=>{const p=(await programmes(repo)).find(p=>p.programmeId===req.params.id);const data=p?await audioEnvelope(p):null;if(!data){res.status(404).json({error:'PROGRAMME_UNAVAILABLE'});return;}res.json({data});});
  router.get('/programmes/:id',async(req,res)=>{const p=(await programmes(repo)).find(p=>p.programmeId===req.params.id);if(!p){res.status(404).json({error:'PROGRAMME_UNAVAILABLE'});return;}res.json({data:p});});
  router.get('/programme-assets/:id',async(req,res)=>{const id=String(req.params.id);if(!/^[a-f0-9]{64}$/.test(id)){res.status(404).end();return;}
    const p=(await programmes(repo)).find(p=>p.assets.some(a=>a.id===id));if(!p){res.status(404).end();return;}const found=await verifiedAsset(p,id,true);if(!found){res.status(404).end();return;}
    const length=found.asset.bytes,range=parseRange(req.get('range'),length);res.set({'Content-Type':found.asset.mime,'Accept-Ranges':'bytes','Content-Disposition':'inline'});
    if(range===false){res.status(416).set('Content-Range',`bytes */${length}`).end();return;}
    if(range)res.status(206).set({'Content-Range':`bytes ${range.start}-${range.end}/${length}`,'Content-Length':String(range.end-range.start+1)});
    else res.set('Content-Length',String(length));
    if(req.method==='HEAD'){res.end();return;}
    const file=await open(found.path,'r').catch(()=>null);if(!file){res.removeHeader('Content-Length');res.removeHeader('Content-Range');res.status(404).end();return;}
    const info=await file.stat().catch(()=>null);if(!info||[found.asset.hash,info.size,info.mtimeMs,info.ctimeMs,info.ino].join(':')!==found.stamp){await file.close();res.removeHeader('Content-Length');res.removeHeader('Content-Range');res.status(404).end();return;}
    const stream=file.createReadStream(range||{});stream.on('error',()=>res.destroy());res.on('close',()=>stream.destroy());stream.pipe(res);
  });return router;
}


