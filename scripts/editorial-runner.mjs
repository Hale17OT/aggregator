import { connect } from '../packages/editorial/repository.mjs';
import { readAttestation,loadBundle,canonical,hash } from '../packages/editorial/input.mjs';
import { freezeAndDraft } from '../packages/editorial/draft.mjs';
import { exportReport } from '../packages/editorial/report.mjs';
const repo=await connect(readAttestation());
try{
 const command=process.argv[2],bundle=loadBundle();
 if(command==='import'){const batch=process.argv[3]||'initial';if(!/^[a-z-]{1,30}$/.test(batch))throw Error('BATCH_KEY');const results=[];for(const item of bundle.items)results.push(await repo.importItem(item,batch+'/'+item.key));console.log(JSON.stringify(results));}
 else if(command==='draft'){const events=[...new Set(bundle.items.map(i=>hash(canonical(i.event))))];const results=[];for(const event of events){try{const pack=await freezeAndDraft(repo,event);results.push({...pack,report:await exportReport(repo,pack.digest)});}catch(e){if(!['INSUFFICIENT_ITEMS','INSUFFICIENT_DECLARED_ORIGINS'].includes(e.message))throw e;results.push({event,blocked:e.message});}}console.log(JSON.stringify(results));}
 else if(command==='inspect'){const packs=await repo.query('SELECT digest FROM evidence_packages ORDER BY digest');console.log(JSON.stringify(await Promise.all(packs.map(async p=>({digest:p.digest})))));}
 else throw Error('LOCAL_COMMAND_UNAVAILABLE');
}finally{await repo.close();}
