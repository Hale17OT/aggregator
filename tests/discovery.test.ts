import test from 'node:test';
import assert from 'node:assert/strict';
import { createFixtureRepository, fixtureDrafts } from '../packages/test-fixtures/src/index.js';
import { discover } from '../packages/domain/src/discovery.js';
import { validateDraft, FixtureRepository } from '../packages/domain/src/publication.js';
import { createApp } from '../apps/api/src/app.js';

test('F01/F02/F03: twenty-four distinct fictional versions across fourteen desks satisfy evidence gates',()=>{
  const drafts=fixtureDrafts();assert.equal(drafts.length,24);assert.equal(new Set(drafts.map(d=>d.id)).size,24);assert.equal(new Set(drafts.map(d=>d.versionId)).size,24);assert.equal(new Set(drafts.map(d=>d.slug)).size,24);assert.equal(new Set(drafts.map(d=>d.topic)).size,14);
  for(const d of drafts)assert.deepEqual(validateDraft(d,new Date('2026-10-13')),[],d.slug);
});
test('F03: stable bounded search and current eligibility control snippets and counts',()=>{
  const repo=createFixtureRepository();const first=discover(repo);const second=discover(repo,{page:2});assert.equal(first.meta.total,24);assert.equal(new Set([...first.data,...second.data].map(d=>d.id)).size,12);
  assert.equal(discover(repo,{q:'rain gardens'}).data[0]?.slug,'alderwick-rain-gardens');assert.ok(discover(repo,{topic:'science'}).data.every(d=>d.topic==='Science'));
  assert.equal(discover(repo,{q:'PRIVATE DRAFT'}).meta.total,0);repo.withdraw('alderwick-rain-gardens');assert.equal(discover(repo,{q:'rain gardens'}).meta.total,0);assert.equal(discover(repo).meta.total,23);
  const d=repo.get('alderwick-river-thermometers')!;d.sources[0]!.rights.revoked=true;assert.equal(discover(new FixtureRepository([d])).meta.total,0);
  for(const query of [{q:'x'.repeat(121)},{page:-1},{limit:25},{page:NaN}])assert.throws(()=>discover(repo,query));
});
test('SC03: actual discovery HTTP rejects ambiguous filters and returns no private fields',async()=>{
  const server=createApp(createFixtureRepository()).listen(0,'127.0.0.1');await new Promise<void>(resolve=>server.once('listening',resolve));const address=server.address();assert.ok(address&&typeof address!=='string');const base=`http://127.0.0.1:${address.port}`;
  try{for(const path of ['?q=a&q=b','?page=1.5','?limit=100','?owner=reader'])assert.equal((await fetch(base+'/api/v1/discover'+path)).status,422);
    const response=await fetch(base+'/api/v1/discover?q=thermometers');assert.equal(response.status,200);assert.equal(response.headers.get('cache-control'),'no-store');const body=await response.text();assert.ok(body.includes('alderwick-river-thermometers'));for(const field of ['privateNotes','reviews','originId','tokenHash'])assert.ok(!body.includes(field));
  }finally{await new Promise<void>((resolve,reject)=>server.close(error=>error?reject(error):resolve()));}
});
