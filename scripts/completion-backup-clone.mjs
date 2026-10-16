import { Pool } from 'pg';
import { readTarget,poolConfig,attestTarget } from '../packages/db/src/member.ts';
import { withDisposableDatabase } from './disposable-database.mjs';
import { migrations,migrate } from './db-migrations.mjs';
import { spawnSync } from 'node:child_process';
import { mkdirSync,writeFileSync,readFileSync } from 'node:fs';
import { resolve,join } from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { importInterests } from './import-interest-catalogue.mjs';
const target=readTarget('.cache/pg18-retained-demo/runtime-target.json'),pool=new Pool(poolConfig(target,'agg_bootstrap',1));
const dir=resolve('.cache/completion-backups',new Date().toISOString().replace(/[:.]/g,'-'));mkdirSync(dir,{recursive:true});
const bin='C:/Program Files/PostgreSQL/18/bin';
const run=(tool,args)=>{const r=spawnSync(join(bin,tool+'.exe'),args,{encoding:'utf8',windowsHide:true,timeout:120000,maxBuffer:2e6});if(r.status!==0)throw new Error(tool+' failed: '+r.stderr.slice(-1200));return r.stdout;};
const tables=['users','sessions','user_preferences','topic_follows','bookmarks','listening_queues','listening_progress'];
const digest=data=>createHash('sha256').update(JSON.stringify(data)).digest('hex');
const report={at:new Date().toISOString(),target:{port:target.port,system:target.systemIdentifier},backupDirectory:dir,steps:[]};
try{const c=await pool.connect();try{await attestTarget(c,target);const ledger=(await c.query('SELECT name,checksum FROM public.schema_migrations ORDER BY name')).rows;assert.ok([7,9,10].includes(ledger.length));assert.deepEqual(ledger,migrations(`packages/db/migrations`).slice(0,ledger.length).map(({name,checksum})=>({name,checksum})));report.migrationsBefore=ledger;
 const snap={};for(const t of tables){const r=await c.query(`SELECT coalesce(jsonb_agg(to_jsonb(t)-'last_seen_at' ORDER BY to_jsonb(t)-'last_seen_at'),'[]'::jsonb) data FROM public.${t} t`);snap[t]={count:r.rows[0].data.length,hash:digest(r.rows[0].data)};}report.before=snap;
 run('pg_dump',['-h','127.0.0.1','-p','55441','-U','agg_bootstrap','-d',target.database,'-Fc','-f',join(dir,'member.dump')]);
 run('pg_dumpall',['-h','127.0.0.1','-p','55441','-U','agg_bootstrap','--roles-only','-f',join(dir,'roles.sql')]);report.steps.push('Attested retained target; private custom dump and role inventory written');
}finally{c.release();}
await withDisposableDatabase(async h=>{const db=h.createDatabase('aggregator_identity');h.verify('aggregator_identity');run('pg_restore',['-h','127.0.0.1','-p',String(h.port),'-U','agg_bootstrap','-d','aggregator_identity','--exit-on-error',join(dir,'member.dump')]);
 for(const t of tables){const data=JSON.parse(db.scalar(`SELECT coalesce(jsonb_agg(to_jsonb(t)-'last_seen_at' ORDER BY to_jsonb(t)-'last_seen_at'),'[]'::jsonb) FROM public.${t} t`));assert.deepEqual({count:data.length,hash:digest(data)},report.before[t]);}
 report.steps.push('Backup restored to distinct attested disposable cluster; all seven member tables match');
 const list=migrations('packages/db/migrations');migrate(db,list);migrate(db,list);report.steps.push('Complete ordered upgrade and no-op reapply passed');report.migrationsAfter=list.map(({name,checksum})=>({name,checksum}));
 const clonePool=new Pool({host:'127.0.0.1',port:h.port,database:'aggregator_identity',user:'agg_bootstrap'});try{const c=await clonePool.connect();try{await c.query('BEGIN');await c.query('SET LOCAL ROLE agg_owner');report.taxonomy=await importInterests(c);await c.query('COMMIT');}finally{c.release();}}finally{await clonePool.end();}
 for(const t of tables){const data=JSON.parse(db.scalar(`SELECT coalesce(jsonb_agg(to_jsonb(t)-'last_seen_at' ORDER BY to_jsonb(t)-'last_seen_at'),'[]'::jsonb) FROM public.${t} t`));assert.deepEqual({count:data.length,hash:digest(data)},report.before[t]);}
 report.clone={data:h.data,system:h.systemIdentifier,port:h.port,stoppedOnExit:true};
});report.retainedMutated=false;report.backupSha256=createHash('sha256').update(readFileSync(join(dir,'member.dump'))).digest('hex');writeFileSync('docs/engineering/completion-upgrade.json',JSON.stringify(report,null,2));console.log('Private backup, restored clone, ordered upgrade and member preservation verified. Retained unchanged.');
}finally{await pool.end();}
