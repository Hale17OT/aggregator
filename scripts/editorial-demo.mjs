import { spawnSync } from 'node:child_process';
import { writeFileSync,mkdirSync } from 'node:fs';
import { withDisposableDatabase } from './disposable-database.mjs';
import { migrate,migrations } from './db-migrations.mjs';
import { registry,declareOrigins } from './editorial-provision.mjs';
function run(command){const r=spawnSync(process.execPath,['scripts/editorial-runner.mjs',command],{encoding:'utf8',windowsHide:true,timeout:45000,maxBuffer:2000000});if(r.status!==0)throw Error((r.stderr||'Runner failed').slice(-1800));return JSON.parse(r.stdout);}
await withDisposableDatabase(async h=>{
 const db=h.createDatabase('aggregator_pipeline');migrate(db,migrations('packages/db/migrations'));db.sql('GRANT CONNECT ON DATABASE aggregator_pipeline TO agg_pipeline_login');
 const target={purpose:'aggregator-isolated-pipeline',database:'aggregator_pipeline',data:h.data,systemIdentifier:h.systemIdentifier,port:h.port};writeFileSync('.cache/pipeline-target.json',JSON.stringify(target));
 await registry(h);const imports=run('import');await declareOrigins(h);const outputs=run('draft');const restarted=run('inspect');
 mkdirSync('output/private-editorial',{recursive:true});writeFileSync('output/private-editorial/latest-demo.json',JSON.stringify({at:new Date().toISOString(),target,imports,outputs,restarted,stoppedAfterExport:true,disclosure:'Fictional extractive snapshots, private and unpublished. No human approvals.'},null,2));
 console.log(JSON.stringify(outputs,null,2));
},{pipeline:true});
