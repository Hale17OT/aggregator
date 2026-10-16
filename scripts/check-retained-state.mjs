import { Pool } from 'pg';
import { readFileSync,writeFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { readTarget,poolConfig,attestTarget } from '../packages/db/src/member.ts';
const target=readTarget('.cache/pg18-retained-demo/runtime-target.json'),pool=new Pool(poolConfig(target,'agg_bootstrap',1));
try{const c=await pool.connect();try{
 await attestTarget(c,target);
 const snapshot={systemIdentifier:target.systemIdentifier,tables:{}};
 for(const table of ['users','sessions','user_preferences','bookmarks','listening_queues','listening_progress']){
  const r=await c.query(`SELECT coalesce(jsonb_agg(to_jsonb(t)-'last_seen_at' ORDER BY to_jsonb(t)::text),'[]'::jsonb) AS data FROM public.${table} t`);
  snapshot.tables[table]={count:r.rows[0].data.length,hash:createHash('sha256').update(JSON.stringify(r.rows[0].data)).digest('hex')};
 }
 if(process.argv[2]==='snapshot'){writeFileSync('.cache/demo-state-before.json',JSON.stringify(snapshot));console.log('Retained row counts and opaque comparison hashes captured; no credentials exported');}
 else if(process.argv[2]==='compare'){
  const before=JSON.parse(readFileSync('.cache/demo-state-before.json','utf8'));
  if(JSON.stringify(before)!==JSON.stringify(snapshot))throw new Error('Retained state changed across cycle');
  writeFileSync('docs/engineering/demo-cycle-checks.json',JSON.stringify({checkedAt:new Date().toISOString(),status:'passed',targetVerified:true,systemIdentifierUnchanged:true,recordCounts:Object.fromEntries(Object.entries(snapshot.tables).map(([k,v])=>[k,v.count])),unchangedTables:Object.keys(snapshot.tables),command:'demo:stop followed by demo:start; no member reseeding'},null,2));console.log('Retained full stop/start preserved all six member tables');
 }else throw new Error('Use snapshot or compare around an owned demo stop/start');
 }finally{c.release();}}finally{await pool.end();}
