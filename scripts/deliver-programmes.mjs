import {Buffer} from 'node:buffer';
import {clearTimeout} from 'node:timers';
// One local configuration path; the existing spool and renderer remain authoritative.
import {readFile,statfs} from 'node:fs/promises';
import {spawn,spawnSync} from 'node:child_process';
import {resolve,join} from 'node:path';
import {programmeRoot,hash,claim,atomicJson,eligible} from '../packages/programme/src/store.ts';
import {createFixtureRepository} from '../packages/test-fixtures/src/index.ts';
const arg=(name,fallback)=>{const i=process.argv.indexOf('--'+name);return i<0?fallback:process.argv[i+1];};
const stage=arg('stage','prepare'),id=arg('id','all'),configPath=resolve(arg('config','docs/next-build/programme-delivery.json'));
if(configPath!==resolve('docs/next-build/programme-delivery.json')||!['prepare','pilot','full','import'].includes(stage))throw Error('INVALID_LOCAL_DELIVERY_REQUEST');
if(stage==='full'&&!process.argv.includes('--pilot-reviewed'))throw Error('INSPECT_ACTUAL_PILOT_BEFORE_FULL');
const preparedResults=[];const config=JSON.parse(await readFile(configPath,'utf8')),recipes=config.programmes.filter(r=>id==='all'||r.id===id);if(!recipes.length)throw Error('UNKNOWN_RECIPE');
async function run(script,args){await new Promise((ok,no)=>{const child=spawn(process.execPath,['--import','tsx',script,...args],{stdio:'inherit',windowsHide:true});const timer=setTimeout(()=>{if(process.platform==='win32')spawnSync('taskkill',['/PID',String(child.pid),'/T','/F'],{windowsHide:true,stdio:'ignore'});else child.kill('SIGKILL');no(Error('OWNED_JOB_DEADLINE_EXCEEDED'));},1200000);child.once('error',e=>{clearTimeout(timer);no(e);});child.once('exit',code=>{clearTimeout(timer);if(code===0)ok();else no(Error('LOCAL_STAGE_FAILED_'+code));});});}
const workerLease=await claim(hash('delivery-worker-single-machine'));if(!workerLease)throw Error('LOCAL_DELIVERY_WORKER_BUSY');try{for(const recipe of recipes){if(recipe.kind==='radio'&&stage!=='prepare')continue;
 const disk=await statfs(programmeRoot);if(disk.bavail*disk.bsize<2*1024**3)throw Error('INSUFFICIENT_WORKSPACE_SPACE');
 const key=hash('delivery-pipeline:'+recipe.id),unlock=await claim(key);if(!unlock)throw Error('RECIPE_ALREADY_OWNED');
 try{
  await atomicJson(join(programmeRoot,'jobs',key+'.json'),{id:recipe.id,stage,status:'running',pid:process.pid,updatedAt:new Date().toISOString()});
  if(stage==='prepare')await run('scripts/prepare-programme-delivery.mjs',['--config',configPath,'--id',recipe.id,...(process.argv.includes('--fail-before-ready')?['--fail-before-ready']:[])]);
  if(stage==='prepare'){const report=JSON.parse(await readFile('docs/engineering/programme-delivery-preparation.json','utf8'));preparedResults.push(...report.results.map(({key,...r})=>({...r,renditionSha256:key})));await atomicJson(resolve('docs/engineering/programme-delivery-preparation.json'),{...report,results:preparedResults});}
  else if(recipe.kind==='broadcast'){
   const index=JSON.parse(await readFile(join(programmeRoot,'index.json'),'utf8'));let base;for(const k of index){const p=JSON.parse(await readFile(join(programmeRoot,'manifests',k+'.json'),'utf8'));if(p.programmeId===recipe.id)base=p;}if(!base||!eligible(base,createFixtureRepository()))throw Error('PREPARE_CURRENT_ELIGIBLE_INPUT_FIRST');
   if(stage==='full'){const latest=JSON.parse(await readFile(resolve('.cache/broadcast',`latest-${recipe.id}-pilot.json`),'utf8'));const pilot=JSON.parse(await readFile(join(latest.out,'render.json'),'utf8'));if(pilot.baseRenditionKey!==base.renditionKey||pilot.durationSeconds<45||pilot.durationSeconds>60||pilot.sourceHash!==hash(Buffer.concat([await readFile('packages/broadcast/scene.mjs'),await readFile('packages/broadcast/performance.mjs')]))||pilot.rendererHash!==hash(await readFile('scripts/render-broadcast.mjs'))||pilot.videoHash!==hash(await readFile(join(latest.out,'programme.mp4'))))throw Error('PILOT_DOES_NOT_MATCH_CURRENT_PROGRAMME');}
   if(stage==='import')await run('scripts/import-broadcast.mjs',[recipe.variant,recipe.id]);
   else await run('scripts/render-broadcast.mjs',['--programme',recipe.id,'--variant',recipe.variant,'--mode',stage,...(stage==='full'?['--pilot-reviewed']:[]),...(stage==='pilot'&&arg('start',null)?['--start',arg('start',null)]:[]),...(process.argv.includes('--fail-after-frames')?['--fail-after-frames',arg('fail-after-frames','3')]:[])]);
  }
  await atomicJson(join(programmeRoot,'jobs',key+'.json'),{id:recipe.id,stage,status:'ready',completedStage:stage,videoReady:recipe.kind==='broadcast'&&stage==='import',updatedAt:new Date().toISOString()});
 }catch(error){await atomicJson(join(programmeRoot,'jobs',key+'.json'),{id:recipe.id,stage,status:'failed',errorCategory:error.message,updatedAt:new Date().toISOString()});throw error;}finally{await unlock();}
}



}finally{await workerLease();}



