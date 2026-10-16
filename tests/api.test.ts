import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApp } from '../apps/api/src/app.js';
import { createFixtureRepository } from '../packages/test-fixtures/src/index.js';
test('public API never returns private drafts; withdrawn text is suppressed',async()=>{
 const repo=createFixtureRepository();const server=createApp(repo).listen(0,'127.0.0.1');await once(server,'listening');
 try{const address=server.address();assert.ok(address&&typeof address!=='string');const base=`http://127.0.0.1:${address.port}/api/v1`;
 assert.equal((await fetch(`${base}/articles/unpublished-draft`)).status,404);
 const feed=await fetch(`${base}/articles`).then(r=>r.text());assert.ok(!feed.includes('PRIVATE'));assert.ok(!feed.includes('rights'));
 assert.equal((await fetch(`${base}/articles/alderwick-evening-shuttle?variant=bad`)).status,422);
 repo.withdraw('alderwick-evening-shuttle');const response=await fetch(`${base}/articles/alderwick-evening-shuttle`);assert.equal(response.status,410);assert.ok(!(await response.text()).includes('shared route'));
 }finally{server.close();await once(server,'close');}
});
