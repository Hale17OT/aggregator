import pg from 'pg';
import {Buffer} from 'node:buffer';
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {withDisposableDatabase} from './disposable-database.mjs';
import {migrations,migrate} from './db-migrations.mjs';
import {registerReviewedSources} from '../packages/editorial/live-registry.mjs';
import {LiveRepository} from '../packages/editorial/live-repository.mjs';
import {parseLiveFeed} from '../packages/editorial/live-feed.mjs';
import {randomUUID,randomBytes} from 'node:crypto';
const proposal=JSON.parse(readFileSync('docs/engineering/real-news-google-profile/source-policy-proposal.json'));
const checks=[];
await withDisposableDatabase(async h=>{
 const db=h.createDatabase('aggregator_identity');migrate(db,migrations('packages/db/migrations'));h.verify('aggregator_identity');
 db.sql(readFileSync('packages/db/provision-live-source-role.sql','utf8'));
 const admin=new pg.Client({host:'127.0.0.1',port:h.port,database:'aggregator_identity',user:'agg_bootstrap'});await admin.connect();
 const client=new pg.Client({host:'127.0.0.1',port:h.port,database:'aggregator_identity',user:'agg_live_source_login'});await client.connect();
 try{
  await admin.query('BEGIN');await admin.query('SET LOCAL ROLE agg_owner');await registerReviewedSources(admin,proposal);await admin.query('COMMIT');
  await client.query('SET search_path=public,pg_catalog');const repo=new LiveRepository(client);
  let imported=0,denied=0;
  for(const source of proposal.sources){const items=parseLiveFeed(readFileSync('.cache/live-source-review/'+source.file+'.xml'),source.hosts,{institutionAuthor:source.slug==='nasa'?'NASA':null});for(const item of items){const approved=source.items.find(i=>i.url===item.url&&i.contentHash===item.contentHash);if(approved)item.author=approved.author;const result=await repo.importPublisherItem(source,item,{status:200,url:source.feed,headers:{}});if(result.status==='imported'){imported++;}else{denied++;}}}
  const count=()=>admin.query('SELECT public.reader_source_items() items');
  assert.equal((await count()).rows[0].items.length,13);assert.equal(imported,13);assert.equal(denied,12);
  checks.push('25 actual retrieved items processed:13 item-reviewed text representations visible;12 withheld');
  const source=proposal.sources[0];
  const item=parseLiveFeed(readFileSync('.cache/live-source-review/'+source.file+'.xml'),source.hosts).find(i=>source.items.some(a=>a.url===i.url&&a.decision==='text-only'));
  item.author=source.items.find(i=>i.url===item.url).author;
  const observation={status:200,url:source.feed,headers:{}};
  const versionsBefore=(await admin.query('SELECT count(*) FROM source_item_versions')).rows[0].count;
  await repo.importPublisherItem(source,{...item,contentHash:'0'.repeat(64),body:'Unreviewed correction'},observation);
  assert.equal((await count()).rows[0].items.length,12);
  assert.equal((await admin.query('SELECT count(*) FROM source_item_versions')).rows[0].count,versionsBefore);
  await repo.importPublisherItem(source,item,{...observation,status:304});
  assert.equal((await count()).rows[0].items.length,13);
  const other=new pg.Client({host:'127.0.0.1',port:h.port,database:'aggregator_identity',user:'agg_live_source_login'});await other.connect();await other.query('SET search_path=public,pg_catalog');
  try{const results=await Promise.all([repo.importPublisherItem(source,item,observation),new LiveRepository(other).importPublisherItem(source,item,observation)]);assert.equal(results[0].versionId,results[1].versionId);}finally{await other.end();}
  assert.equal((await admin.query('SELECT count(*) FROM source_item_versions')).rows[0].count,versionsBefore);
  checks.push('Changed unreviewed representation withholds known item without payload storage; A→denied B→A restoration and concurrent imports reuse immutable version');
  await admin.query('BEGIN');
  await admin.query("UPDATE public.rights_grants SET scope=jsonb_set(scope,'{items}','[]'::jsonb) WHERE grant_key=$1",[proposal.sources[0].grantKey]);
  assert.equal((await count()).rows[0].items.length,5);
  await admin.query('ROLLBACK');
  await admin.query('BEGIN');
  await admin.query("UPDATE public.rights_grants SET scope=jsonb_set(scope,'{items}',(SELECT jsonb_agg(jsonb_set(x,'{contentHash}',to_jsonb(repeat('0',64)))) FROM jsonb_array_elements(scope->'items') x)) WHERE grant_key=$1",[proposal.sources[0].grantKey]);
  assert.equal((await count()).rows[0].items.length,5);
  await admin.query('ROLLBACK');
  checks.push('Read boundary excludes removed exact-item permission and mismatched reviewed content hashes');
  await client.query('BEGIN');
  const original=(await client.query("SELECT v.* FROM source_item_versions v JOIN sources s ON s.id=v.source_id WHERE s.slug='global-voices' LIMIT 1")).rows[0];
  const malicious=await repo.insert('source_item_versions',{...original,id:randomUUID(),revision:original.revision+100,representation_context_hash:randomBytes(32).toString('hex'),metadata:JSON.stringify(original.metadata)});
  await repo.insert('source_payloads',{source_version_id:malicious.id,raw_bytes:Buffer.from('unreviewed payload'),normalized_text:'Unreviewed private draft falsely labelled as publisher reporting.',segments:'[]'});
  const endpoint=(await client.query('SELECT id FROM source_endpoints WHERE source_id=$1',[original.source_id])).rows[0].id;
  await repo.insert('source_observations',{item_id:original.item_id,source_version_id:malicious.id,endpoint_id:endpoint,http_status:200,requested_url:proposal.sources[0].feed,final_url:proposal.sources[0].feed,availability:'available',operation_key:randomUUID()});
  assert.equal((await client.query('SELECT normalized_text FROM source_payloads WHERE source_version_id=$1',[malicious.id])).rowCount,1);
  // The uncommitted malicious observation is visible to its transaction. Switch
  // to reader under bootstrap in a separate case after committing, then revoke.
  await client.query('COMMIT');
  assert.equal((await count()).rows[0].items.length,12);
  checks.push('Restricted source writer inserted an arbitrary body with an approved declared raw hash; public reader rejected it by recomputed body digest');
  assert.equal((await admin.query('SELECT count(*) FROM public.article_versions')).rows[0].count,'0');
  await admin.query("UPDATE public.rights_grants SET status='revoked',revoked_at=clock_timestamp() WHERE grant_key=$1",[proposal.sources[0].grantKey]);
  assert.equal((await count()).rows[0].items.length,5);checks.push('Grant revocation excludes all Global Voices reports; no synthesized article versions created');
  db.reject('SET ROLE agg_outsider;SELECT public.reader_source_items()',undefined,'42501');
  for(const table of ['users','sessions','user_preferences','article_versions'])db.reject(`SET ROLE agg_live_source_login;SELECT * FROM public.${table}`,undefined,'42501');
 }finally{await client.end();await admin.end();}
});
writeFileSync('docs/engineering/real-news-google-profile/live-db.json',JSON.stringify({status:'passed',at:new Date().toISOString(),checks,limits:'Saved actual feed responses, isolated database. Concurrent repository calls and denied replacement restoration tested; not actual conditional HTTP, publisher correction notices, visual or human approval.'},null,2));console.log(checks.join('\n'));
