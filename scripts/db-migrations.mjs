import { readdirSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';

// Called only by the verified disposable harness; no ambient connection string.
export function migrations(directory){
 return readdirSync(directory).filter(n=>/^\d{4}_[a-z_]+\.sql$/.test(n)).sort().map(name=>{
  const sql=readFileSync(join(directory,name),'utf8');return {name,sql,checksum:createHash('sha256').update(sql).digest('hex')};
 });
}
export function migrate(db,list,limit=list.length){
 db.sql(`SET ROLE agg_owner; CREATE TABLE IF NOT EXISTS schema_migrations(name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now());`);
 const applied=JSON.parse(db.scalar("SELECT coalesce(json_agg(row_to_json(m) ORDER BY name),'[]'::json) FROM schema_migrations m"));
 for(let i=0;i<applied.length;i++)if(!list[i]||list[i].name!==applied[i].name||list[i].checksum!==applied[i].checksum)throw new Error('Migration history/checksum mismatch; refusing mutation');
 for(const m of list.slice(applied.length,limit)){
  // Atomic DDL + ledger; serialize and recheck the prefix under one transaction lock.
  db.sql(`BEGIN; SELECT pg_advisory_xact_lock(18041012); SET LOCAL ROLE agg_owner;
DO $$ BEGIN IF EXISTS (SELECT FROM schema_migrations WHERE name='${m.name}') THEN RAISE EXCEPTION 'Concurrent migration: retry after verifying history'; END IF; END $$;
${m.sql}
INSERT INTO schema_migrations(name,checksum) VALUES('${m.name}','${m.checksum}'); COMMIT;`);
 }
 return list.slice(0,limit).map(({name,checksum})=>({name,checksum}));
}
