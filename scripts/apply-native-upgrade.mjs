import assert from 'node:assert/strict';
import {Pool} from 'pg';
import {readFileSync,writeFileSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {readTarget,poolConfig,attestTarget} from '../packages/db/src/member.ts';
import {migrations} from './db-migrations.mjs';
const evidence=JSON.parse(readFileSync('.cache/native-upgrade-private.json','utf8')),checks=JSON.parse(readFileSync('docs/engineering/flutter-closeout/native-auth.json','utf8'));
assert.equal(evidence.status,'passed');assert.equal(checks.status,'passed');const list=migrations('packages/db/migrations');assert.deepEqual(list.map(({name,checksum})=>({name,checksum})),evidence.migrationsAfter);assert.equal(list.length,12);
assert.equal(createHash('sha256').update(readFileSync(evidence.backupDirectory+'/member.dump')).digest('hex'),evidence.backupSha256);
const target=readTarget('.cache/pg18-retained-demo/runtime-target.json');assert.equal(target.systemIdentifier,evidence.target.system);
const pool=new Pool({...poolConfig(target,'agg_bootstrap',1),query_timeout:30000,options:'-c search_path=pg_catalog -c statement_timeout=20000 -c lock_timeout=3000'});
const digest=data=>createHash('sha256').update(JSON.stringify(data)).digest('hex');const sql=t=>`SELECT coalesce(jsonb_agg(to_jsonb(t)-'last_seen_at'-'transport'-'native_client_id' ORDER BY to_jsonb(t)-'last_seen_at'-'transport'-'native_client_id'),'[]'::jsonb) data FROM public.${t} t`;
try{const c=await pool.connect();try{await attestTarget(c,target);await c.query('BEGIN');await c.query('SELECT pg_advisory_xact_lock(18041012)');const ledger=(await c.query('SELECT name,checksum FROM public.schema_migrations ORDER BY name')).rows;assert.deepEqual(ledger,evidence.migrationsBefore);
 const before={};for(const t of Object.keys(evidence.before)){const data=(await c.query(sql(t))).rows[0].data;before[t]={count:data.length,hash:digest(data)};assert.deepEqual(before[t],evidence.before[t],t+' changed since backup; take a fresh clone');}
 await c.query('SET LOCAL ROLE agg_owner');await c.query('SET LOCAL search_path=public,pg_catalog');await c.query(list[11].sql);await c.query('INSERT INTO public.schema_migrations(name,checksum) VALUES($1,$2)',[list[11].name,list[11].checksum]);
 for(const t of Object.keys(before)){const data=(await c.query(sql(t))).rows[0].data;assert.deepEqual({count:data.length,hash:digest(data)},before[t]);}
 await c.query('COMMIT');writeFileSync('docs/engineering/flutter-closeout/retained-upgrade.json',JSON.stringify({at:new Date().toISOString(),status:'passed',system:target.systemIdentifier,migrations:list.map(({name,checksum})=>({name,checksum})),preserved:before,backupSha256:evidence.backupSha256},null,2));console.log('Attested native transport migration committed; eight retained member table hashes unchanged.');
}catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}}finally{await pool.end();}
