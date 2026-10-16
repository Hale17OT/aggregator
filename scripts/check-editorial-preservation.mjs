import { Pool } from 'pg';
import { readFileSync,writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { readTarget,poolConfig,attestTarget } from '../packages/db/src/member.ts';
const target=readTarget('.cache/pg18-retained-demo/runtime-target.json'),pool=new Pool(poolConfig(target,'agg_bootstrap',1));
try{const c=await pool.connect();try{await attestTarget(c,target);const state={systemIdentifier:target.systemIdentifier,tables:{},migrations:(await c.query('SELECT name,checksum FROM public.schema_migrations ORDER BY name')).rows};
 for(const table of ['users','sessions','user_preferences','bookmarks','listening_queues','listening_progress']){const r=await c.query(`SELECT coalesce(jsonb_agg(to_jsonb(t)-'last_seen_at' ORDER BY to_jsonb(t)::text),'[]'::jsonb) AS data FROM public.${table} t`);state.tables[table]={count:r.rows[0].data.length,hash:createHash('sha256').update(JSON.stringify(r.rows[0].data)).digest('hex')};}
 assert.equal(state.migrations.length,7);
 if(process.argv[2]==='before')writeFileSync('.cache/editorial-demo-before.json',JSON.stringify(state));
 else{assert.deepEqual(state,JSON.parse(readFileSync('.cache/editorial-demo-before.json','utf8')));writeFileSync('docs/engineering/editorial-preservation.json',JSON.stringify({at:new Date().toISOString(),status:'passed',sevenMigrationsUnchanged:true,systemIdentifierUnchanged:true,tables:state.tables,method:'Read-only attested snapshots before/after checks; no stop/start or reseed'},null,2));}
 console.log('Retained member read-only snapshot '+process.argv[2]);
 }finally{c.release();}}finally{await pool.end();}
