import { Router } from 'express';
import { discover } from '../../../packages/domain/src/discovery.js';
import type { PublicationRepository } from '../../../packages/domain/src/publication.js';
export function discoveryRouter(repo:PublicationRepository){
  const router=Router();
  router.get('/discover',(req,res)=>{
    const allowed=['q','topic','page','limit'];
    if(Object.entries(req.query).some(([k,v])=>!allowed.includes(k)||typeof v!=='string')||
      ['page','limit'].some(k=>req.query[k]!==undefined&&!/^[1-9][0-9]*$/.test(String(req.query[k])))||
      (req.query.topic!==undefined&&req.query.topic!==''&&!/^[a-z0-9-]{1,60}$/.test(String(req.query.topic)))){
      res.status(422).json({error:{code:'INVALID_DISCOVERY_QUERY',message:'Use a short search, desk and positive page.'}});return;
    }
    try{res.json(discover(repo,{q:req.query.q as string|undefined,topic:req.query.topic as string|undefined,page:req.query.page?Number(req.query.page):1,limit:req.query.limit?Number(req.query.limit):6}));}
    catch{res.status(422).json({error:{code:'INVALID_DISCOVERY_QUERY',message:'Search is limited to 120 characters and 24 stories per page.'}});}
  });return router;
}
