import pg from 'pg';
import {readFileSync,writeFileSync,existsSync,realpathSync,openSync,closeSync,unlinkSync} from 'node:fs';
import assert from 'node:assert/strict';
import {readTarget,poolConfig,attestTarget} from '../packages/db/src/member.ts';
import {migrations} from './db-migrations.mjs';
import {registerReviewedSources} from '../packages/editorial/live-registry.mjs';
import {LiveRepository} from '../packages/editorial/live-repository.mjs';
import {fetchSource} from '../packages/editorial/live-fetch.mjs';
import {parseLiveFeed} from '../packages/editorial/live-feed.mjs';
const action=process.argv[2];if(!['configure','import'].includes(action))throw Error('Use configure or import');
const target=readTarget('.cache/pg18-retained-demo/runtime-target.json');assert.equal(target.purpose,'aggregator-retained-demo-pg18');
const proposal=JSON.parse(readFileSync('docs/engineering/real-news-google-profile/source-policy-proposal.json'));
if(action==='configure'){
 assert.equal(JSON.parse(readFileSync('docs/engineering/real-news-google-profile/live-db.json')).status,'passed');
 const pool=new pg.Pool(poolConfig(target,'agg_bootstrap',1)),c=await pool.connect();
 try{await attestTarget(c,target);const actual=(await c.query('SELECT name,checksum FROM public.schema_migrations ORDER BY name')).rows;assert.deepEqual(actual,migrations('packages/db/migrations').map(({name,checksum})=>({name,checksum})));
  await c.query('BEGIN');await c.query(readFileSync('packages/db/provision-live-source-role.sql','utf8'));await c.query('SET LOCAL ROLE agg_owner');const result=await registerReviewedSources(c,proposal);await c.query('COMMIT');console.log(JSON.stringify({configured:result,localOnly:true,humanApproval:false}));
 }catch(e){await c.query('ROLLBACK');throw e;}finally{c.release();await pool.end();}
}else{
 const lockPath='.cache/live-source-review/import.lock';
 const lock=openSync(lockPath,'wx',0o600);writeFileSync(lock,String(process.pid));
 const client=new pg.Client(poolConfig(target,'agg_live_source_login',1));
 try{await client.connect();const a=(await client.query('SELECT public.pipeline_target() target')).rows[0].target;assert.equal(realpathSync(a.data),realpathSync(target.data));assert.equal(a.systemIdentifier,target.systemIdentifier);assert.equal(a.port,55441);assert.equal(a.database,target.database);await client.query('SET search_path=public,pg_catalog');const repo=new LiveRepository(client);
  const stateFile='.cache/live-source-review/poll-state.json';const state=existsSync(stateFile)?JSON.parse(readFileSync(stateFile)):{};const result=[];
  for(const source of proposal.sources){
   if(state[source.slug]?.nextAfter>Date.now()){result.push({source:source.slug,status:'backoff'});continue;}
   const previous=state[source.slug]||{};
   state[source.slug]={...previous,nextAfter:Date.now()+900000};writeFileSync(stateFile,JSON.stringify(state));
   try{const response=await fetchSource(source.feed,[new URL(source.feed).hostname],{etag:previous.etag,lastModified:previous.lastModified});
    const cached='.cache/live-source-review/'+source.file+'-latest.xml';
    if(response.status===200){writeFileSync(cached,response.body);state[source.slug]={...state[source.slug],etag:response.headers.etag,lastModified:response.headers['last-modified']};writeFileSync(stateFile,JSON.stringify(state));}
    if(response.status===304&&!existsSync(cached))throw Error('CONDITIONAL_RESPONSE_WITHOUT_CACHE');
    const items=parseLiveFeed(response.status===304?readFileSync(cached):response.body,source.hosts,{institutionAuthor:source.slug==='nasa'?'NASA':null});
    for(const item of items){const reviewed=source.items.find(x=>x.url===item.url&&x.contentHash===item.contentHash);if(reviewed)item.author=reviewed.author;result.push(await repo.importPublisherItem(source,item,response));}
   }catch(error){if(error.retryAfterSeconds){state[source.slug].nextAfter=Date.now()+error.retryAfterSeconds*1000;writeFileSync(stateFile,JSON.stringify(state));}result.push({source:source.slug,status:'failed',code:error.message});}
  }
  const path='output/real-news-google-profile-20261017/intake-'+Date.now()+'.json';writeFileSync(path,JSON.stringify({at:new Date().toISOString(),results:result},null,2));console.log(JSON.stringify({report:path,imported:result.filter(r=>r.status==='imported').length,denied:result.filter(r=>r.status==='denied').length,failures:result.filter(r=>r.status==='failed')}));
 }finally{try{await client.end();}finally{closeSync(lock);unlinkSync(lockPath);}}
}

