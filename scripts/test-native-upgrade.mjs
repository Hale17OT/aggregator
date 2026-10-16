import {Pool} from 'pg';
import {readTarget,poolConfig,attestTarget} from '../packages/db/src/member.ts';
import {withDisposableDatabase} from './disposable-database.mjs';
import {migrations,migrate} from './db-migrations.mjs';
import {spawnSync} from 'node:child_process';
import {mkdirSync,writeFileSync,readFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const target=readTarget('.cache/pg18-retained-demo/runtime-target.json'),pool=new Pool(poolConfig(target,'agg_bootstrap',1));
const dir=resolve('.cache/native-backups',new Date().toISOString().replace(/[:.]/g,'-'));mkdirSync(dir,{recursive:true});
const bin='C:/Program Files/PostgreSQL/18/bin';
const run=(tool,args)=>{const r=spawnSync(join(bin,tool+'.exe'),args,{encoding:'utf8',windowsHide:true,timeout:120000,maxBuffer:2e6});if(r.status!==0)throw Error(tool+' failed: '+r.stderr.slice(-1200));return r.stdout;};
const tables=['users','sessions','user_preferences','topic_follows','bookmarks','listening_queues','listening_progress','interest_states'];
const digest=data=>createHash('sha256').update(JSON.stringify(data)).digest('hex');
const sql=t=>`SELECT coalesce(jsonb_agg(to_jsonb(t)-'last_seen_at'-'transport'-'native_client_id' ORDER BY to_jsonb(t)-'last_seen_at'-'transport'-'native_client_id'),'[]'::jsonb) data FROM public.${t} t`;
const report={at:new Date().toISOString(),target:{port:target.port,system:target.systemIdentifier},steps:[]};
const list=migrations('packages/db/migrations');assert.equal(list.length,12);
try{const c=await pool.connect();try{await attestTarget(c,target);const ledger=(await c.query('SELECT name,checksum FROM public.schema_migrations ORDER BY name')).rows;assert.equal(ledger.length,11);assert.deepEqual(ledger,list.slice(0,11).map(({name,checksum})=>({name,checksum})));report.migrationsBefore=ledger;report.before={};for(const t of tables){const data=(await c.query(sql(t))).rows[0].data;report.before[t]={count:data.length,hash:digest(data)};}
run('pg_dump',['-h','127.0.0.1','-p','55441','-U','agg_bootstrap','-d',target.database,'-Fc','-f',join(dir,'member.dump')]);report.steps.push('Attested eleven-migration retained target; private backup captured');
}finally{c.release();}
await withDisposableDatabase(async h=>{
 const fresh=h.createDatabase('aggregator_fresh');migrate(fresh,list);migrate(fresh,list);report.steps.push('Fresh twelve migrations and idempotent reapply passed');
 const db=h.createDatabase('aggregator_identity');h.verify('aggregator_identity');run('pg_restore',['-h','127.0.0.1','-p',String(h.port),'-U','agg_bootstrap','-d','aggregator_identity','--exit-on-error',join(dir,'member.dump')]);
 for(const t of tables){const data=JSON.parse(db.scalar(sql(t)));assert.deepEqual({count:data.length,hash:digest(data)},report.before[t]);}
 db.sql(`BEGIN;SET LOCAL ROLE agg_owner;${list[11].sql};ROLLBACK;`);assert.equal(db.scalar("SELECT count(*) FROM information_schema.tables WHERE table_name='native_handoffs'"),'0');report.steps.push('Populated clone DDL rollback leaves no native table');
 migrate(db,list);migrate(db,list);
 for(const t of tables){const data=JSON.parse(db.scalar(sql(t)));assert.deepEqual({count:data.length,hash:digest(data)},report.before[t]);}
 assert.equal(db.scalar("SELECT count(*) FROM sessions WHERE transport<>'web' OR native_client_id IS NOT NULL"),'0');
 for(const role of ['agg_api_login','agg_member_login','agg_pipeline_login','agg_outsider'])db.reject(`SET ROLE ${role}; SELECT * FROM public.native_handoffs`,undefined,'42501');
 report.steps.push('Populated upgrade/reapply preserves eight member tables; old sessions stay web; four restricted roles cannot read native handoffs');report.clone={system:h.systemIdentifier,port:h.port,stoppedOnExit:true};
});
report.migrationsAfter=list.map(({name,checksum})=>({name,checksum}));report.retainedMutated=false;report.status='passed';report.backupSha256=createHash('sha256').update(readFileSync(join(dir,'member.dump'))).digest('hex');writeFileSync('.cache/native-upgrade-private.json',JSON.stringify({...report,backupDirectory:dir}));writeFileSync('docs/engineering/flutter-closeout/upgrade.json',JSON.stringify(report,null,2));console.log('Fresh/clone/rollback/upgrade/role checks passed. Retained unchanged.');
}finally{await pool.end();}


