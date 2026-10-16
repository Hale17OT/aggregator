import test from 'node:test';
import assert from 'node:assert/strict';
import {programmeBoundary,storyAnchor} from '../packages/contracts/src/programme-navigation.js';
import type {Programme} from '../packages/contracts/src/programme.js';
const programme={revisions:[{slug:'story',versionId:'v2',digest:'reviewed'}],chapters:[{articleSlug:'story',startMs:12000}],segments:[{articleSlug:'story',articleVersionId:'v2',blockIds:['a','b'],startMs:12000,endMs:22000},{articleSlug:'story',articleVersionId:'v2',blockIds:['b'],startMs:22000,endMs:50000}]} as Programme;
test('cross-format handoff requires exact story revision and maps section rather than seconds',()=>{
  assert.equal(programmeBoundary(programme,{slug:'other',versionId:'v2'}),null);
  assert.equal(programmeBoundary(programme,{slug:'story',versionId:'v1'}),null);
  assert.equal(programmeBoundary(programme,{slug:'story',versionId:'v2',blockId:'b'}),22);
  assert.equal(programmeBoundary(programme,{slug:'story',versionId:'v2',blockId:'not-in-this-edit'}),12);
  assert.deepEqual(storyAnchor(programme,40),{slug:'story',versionId:'v2',blockId:'b'});
  assert.equal(storyAnchor(programme,16)?.blockId,undefined);
  assert.equal(storyAnchor(programme,90),undefined);
});

