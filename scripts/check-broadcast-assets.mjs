import assert from 'node:assert/strict';
import express from 'express';
import { once } from 'node:events';
import { writeFile } from 'node:fs/promises';
import { createFixtureRepository } from '../packages/test-fixtures/src/index.ts';
import { createProgrammeRouter } from '../apps/api/src/programme-http.ts';
import { programmes } from '../packages/programme/src/store.ts';
const repo=createFixtureRepository(),app=express();app.use('/api/v1',createProgrammeRouter(repo));const server=app.listen(0,'127.0.0.1');await once(server,'listening');const base=`http://127.0.0.1:${server.address().port}`,checks=[];
try{
 const ready=(await programmes(repo)).filter(p=>p.kind==='broadcast');assert.equal(ready.length,8);assert.ok(ready.every(p=>p.videoRendition));
 for(const p of ready){const v=p.videoRendition;const range=await fetch(base+v.url,{headers:{Range:'bytes=0-1023'}});assert.equal(range.status,206);assert.equal((await range.arrayBuffer()).byteLength,1024);assert.equal(range.headers.get('content-type'),'video/mp4');assert.equal(range.headers.get('cache-control'),'no-store');assert.equal((await fetch(base+v.url,{headers:{Range:'bytes=999999999-'}})).status,416);
 const captions=await fetch(base+v.captionUrl);assert.equal(captions.status,200);assert.match(await captions.text(),/^WEBVTT/);
 const map=await(await fetch(base+v.sourceMapUrl)).json();assert.equal(map.baseRenditionKey,p.renditionKey);assert.deepEqual(map.revisions,p.revisions);assert.equal((await fetch(base+v.posterUrl)).status,200);checks.push({name:`${p.programmeId} MP4 Range / captions / poster / source map / version binding`,status:'PASS'});}
 for(const path of ['/programme-assets/../../secret','/programme-assets/https%3A%2F%2Fevil.example','/programme-assets/'+'0'.repeat(64)])assert.equal((await fetch(base+'/api/v1'+path)).status,404);
 const radio=(await programmes(repo)).find(p=>p.kind==='radio');const env=await(await fetch(base+'/api/v1/programmes/'+radio.programmeId+'/envelope')).json();assert.equal(env.data.renditionKey,radio.renditionKey);assert.equal(env.data.stepMs,50);assert.ok(env.data.rms.some(x=>x>.01));assert.ok(env.data.rms.every((x,i)=>x>=0&&x<=env.data.peak[i]));checks.push({name:'Actual PCM envelope bound to current audio; path/URL rejection',status:'PASS'});
 repo.withdraw('alderwick-evening-shuttle');for(const p of ready.filter(p=>p.articleSlugs.includes('alderwick-evening-shuttle')))for(const url of [p.videoRendition.url,p.videoRendition.posterUrl,p.videoRendition.captionUrl,p.videoRendition.sourceMapUrl])assert.equal((await fetch(base+url)).status,404);assert.equal((await programmes(repo)).filter(p=>p.kind==='broadcast').length,2);checks.push({name:'Committed fixture withdrawal removes video, poster, captions and source map on new requests',status:'PASS'});
 await writeFile('docs/engineering/broadcast-assets-checks.json',JSON.stringify({checkedAt:new Date().toISOString(),checks,status:'passed',limitations:['Bytes already downloaded cannot be recalled. Private fixture repository in an isolated test HTTP process; retained demo unchanged.']},null,2));console.log(`${checks.length} broadcast asset groups passed`);
}finally{server.close();}

