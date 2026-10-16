import assert from 'node:assert/strict';
import { Pool } from 'pg';
import { readFileSync,writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { readTarget,poolConfig,attestTarget } from '../packages/db/src/member.ts';
import { migrations } from './db-migrations.mjs';
import { importInterests } from './import-interest-catalogue.mjs';
const evidence=JSON.parse(readFileSync('docs/engineering/completion-upgrade.json','utf8')),checks=JSON.parse(readFileSync('docs/engineering/interests-db-checks.json','utf8'));
assert.equal(checks.status,'passed');const list=migrations('packages/db/migrations');assert.deepEqual(list.map(({name,checksum})=>({name,checksum})),evidence.migrationsAfter);
assert.equal(createHash('sha256').update(readFileSync(evidence.backupDirectory+'/member.dump')).digest('hex'),evidence.backupSha256);
const target=readTarget('.cache/pg18-retained-demo/runtime-target.json');assert.equal(target.systemIdentifier,evidence.target.system);
const pool=new Pool({...poolConfig(target,'agg_bootstrap',1),query_timeout:30000,options:'-c search_path=pg_catalog -c statement_timeout=20000 -c lock_timeout=3000'});
try{const c=await pool.connect();try{await attestTarget(c,target);await c.query('BEGIN');await c.query('SELECT pg_advisory_xact_lock(18041012)');const ledger=(await c.query('SELECT name,checksum FROM public.schema_migrations ORDER BY name')).rows;assert.deepEqual(ledger,evidence.migrationsBefore);
 const before={};for(const table of Object.keys(evidence.before)){const r=await c.query(`SELECT coalesce(jsonb_agg(to_jsonb(t)-'last_seen_at' ORDER BY to_jsonb(t)-'last_seen_at'),'[]'::jsonb) data FROM public.${table} t`);before[table]=createHash('sha256').update(JSON.stringify(r.rows[0].data)).digest('hex');}
 await c.query("DO $$ BEGIN IF NOT EXISTS(SELECT FROM pg_roles WHERE rolname='agg_pipeline') THEN CREATE ROLE agg_pipeline NOLOGIN NOSUPERUSER NOBYPASSRLS NOCREATEDB NOCREATEROLE; END IF; END $$");
 const role=(await c.query("SELECT rolcanlogin,rolsuper,rolbypassrls FROM pg_roles WHERE rolname='agg_pipeline'")).rows[0];assert.deepEqual(role,{rolcanlogin:false,rolsuper:false,rolbypassrls:false});
 await c.query('SET LOCAL ROLE agg_owner');await c.query('SET LOCAL search_path=public,pg_catalog');for(const m of list.slice(ledger.length)){await c.query(m.sql);await c.query('INSERT INTO public.schema_migrations(name,checksum) VALUES($1,$2)',[m.name,m.checksum]);}
 const taxonomy=await importInterests(c);
 for(const table of Object.keys(before)){const r=await c.query(`SELECT coalesce(jsonb_agg(to_jsonb(t)-'last_seen_at' ORDER BY to_jsonb(t)-'last_seen_at'),'[]'::jsonb) data FROM public.${table} t`);assert.equal(createHash('sha256').update(JSON.stringify(r.rows[0].data)).digest('hex'),before[table],table+' preservation');}
 await c.query('COMMIT');writeFileSync('docs/engineering/retained-reader-upgrade.json',JSON.stringify({at:new Date().toISOString(),status:'passed',targetSystem:target.systemIdentifier,port:target.port,migrations:list.map(({name,checksum})=>({name,checksum})),taxonomy,preservedTableHashes:before,backupDirectory:evidence.backupDirectory,roles:'Only NOLOGIN agg_pipeline compatibility role; no new pipeline login or product membership'},null,2));console.log('Attested retained ordered upgrade committed; member hashes unchanged.');
 }catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();}}finally{await pool.end();}
