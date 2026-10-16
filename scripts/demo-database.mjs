import { withDisposableDatabase } from './disposable-database.mjs';
import { migrations,migrate } from './db-migrations.mjs';
import { Pool } from 'pg';
import { randomUUID } from 'node:crypto';
import { writeFileSync,readFileSync,realpathSync } from 'node:fs';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';
import { createFixtureRepository } from '../packages/test-fixtures/src/index.ts';

export async function startDemoDatabase({keepRunning=true}={}){
 return withDisposableDatabase(async h=>{
  // Native reader upgrade was backup/clone tested; retain the exact twelve-migration profile.
  // No future migration is implicitly authorized by startup.
  const memberMigrations=migrations('packages/db/migrations').filter(m=>m.name<'0013');
  if(memberMigrations.length!==12)throw new Error('Unexpected retained member migration profile');
  const db=h.createDatabase('aggregator_identity');migrate(db,memberMigrations);
  const target={purpose:'aggregator-retained-demo-pg18',data:h.data,host:'127.0.0.1',port:h.port,database:'aggregator_identity',systemIdentifier:h.systemIdentifier};
  const path=join(h.data,'runtime-target.json');writeFileSync(path,JSON.stringify(target,null,2));
  h.verify(target.database);
  const pool=new Pool({host:target.host,port:target.port,database:target.database,user:'agg_bootstrap',password:'',ssl:false});
  const c=await pool.connect();try{
   await c.query('BEGIN');await c.query('SET LOCAL ROLE agg_owner');
   for(const role of ['reader','editor','publisher','curator','rights_reviewer','operator','administrator'])await c.query('INSERT INTO public.roles(code,name) VALUES($1,$1) ON CONFLICT DO NOTHING',[role]);
   // Explicit idempotent FK prerequisites only; never publish database content or reset members.
   for(const article of createFixtureRepository().list().filter(a=>a.state==='published')){
    const exists=await c.query('SELECT id FROM public.articles WHERE id=$1',[article.id]);if(exists.rowCount)continue;
    const cluster=randomUUID();await c.query('INSERT INTO public.story_clusters(id,label) VALUES($1,$2)',[cluster,'Fictional local demo prerequisite']);
    await c.query('INSERT INTO public.articles(id,cluster_id,slug) VALUES($1,$2,$3)',[article.id,cluster,article.slug]);
    await c.query('INSERT INTO public.article_versions(id,article_id,cluster_id,version_number,headline,content_hash,evidence_hash,approval_hash,evidence_cutoff_at) VALUES($1,$2,$3,1,$4,$5,$5,$5,now())',[article.versionId,article.id,cluster,article.headline,'fixture-unpublished']);
   }
   await c.query('COMMIT');
  }catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();await pool.end();}
  return {path,target,existing:h.existing};
 },{retained:true,keepRunning});
}
export function stopDemoDatabase(){
 const owner=JSON.parse(readFileSync('.cache/retained-db-owner.json','utf8'));
 const expected=realpathSync('.cache/pg18-retained-demo');
 if(owner.purpose!=='aggregator-retained-demo-pg18'||realpathSync(owner.data)!==expected||owner.port!==55441)throw new Error('Unknown demo target');
 const bin=process.env.PG_BIN||(process.platform==='win32'?'C:/Program Files/PostgreSQL/18/bin':'/usr/lib/postgresql/18/bin');
 const exe=name=>join(bin,name+(process.platform==='win32'?'.exe':''));
 const control=spawnSync(exe('pg_controldata'),['-D',owner.data],{encoding:'utf8',windowsHide:true});
 if(control.status!==0||control.stdout.match(/Database system identifier:\s+(\d+)/)?.[1]!==owner.systemIdentifier)throw new Error('Target ownership mismatch');
 const result=spawnSync(exe('pg_ctl'),['-D',owner.data,'-m','fast','-w','stop'],{stdio:'ignore',windowsHide:true});if(result.status!==0)throw new Error('Owned demo database did not stop');
}
