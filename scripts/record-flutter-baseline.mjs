import {readFileSync,writeFileSync,readdirSync,statSync,mkdirSync,createReadStream} from 'node:fs';
import {createHash} from 'node:crypto';
import {join} from 'node:path';
import {programmes} from '../packages/programme/src/store.ts';
import {createFixtureRepository} from '../packages/test-fixtures/src/index.ts';
const hash=async path=>{const h=createHash('sha256');for await(const b of createReadStream(path))h.update(b);return h.digest('hex');};
const files=[];function walk(dir){for(const name of readdirSync(dir)){if(['node_modules','.nuxt','.output','build','.dart_tool','.gradle','.git','mobile'].includes(name))continue;const p=join(dir,name);if(statSync(p).isDirectory())walk(p);else files.push(p);}}
for(const dir of ['apps','packages','scripts'])walk(dir);
const source=[];for(const path of files.sort())source.push({path,sha256:await hash(path)});
const ready=await programmes(createFixtureRepository());if(ready.length!==23)throw Error(`Unexpected catalogue ${ready.length}`);
const media=[];for(const p of ready){const assets=[];for(const a of p.assets){const sha256=await hash(join('.cache/programmes/assets',a.storageKey));if(sha256!==a.hash)throw Error('Asset corruption');assets.push({id:a.id,storageKey:a.storageKey,bytes:a.bytes,sha256});}media.push({id:p.programmeId,rendition:p.renditionKey,video:p.videoRendition,assets});}
mkdirSync('docs/engineering/flutter-closeout',{recursive:true});
writeFileSync('docs/engineering/flutter-closeout/baseline.json',JSON.stringify({at:new Date().toISOString(),source,sourceFingerprint:createHash('sha256').update(JSON.stringify(source)).digest('hex'),lock:await hash('package-lock.json'),webBuild:await hash('apps/web/.output/server/index.mjs'),media},null,2));
const checklist=readFileSync('docs/next-build/flutter-closeout/03_ACCEPTANCE_CHECKLIST.md','utf8');
const criteria=[...checklist.matchAll(/\*\*([A-Z]+-\d+) — ([^*]+)\*\*: ([^\r\n]+)/g)].map(m=>({id:m[1],title:m[2],expected:m[3],status:'NOT RUN',evidence:[],limitations:[]}));
writeFileSync('docs/engineering/flutter-closeout/acceptance.json',JSON.stringify({provenance:'Derived from supplied checklist; requested source JSON and research file absent on 2026-10-16. No supplied criteria omitted.',criteria},null,2));
console.log(JSON.stringify({renditions:media.length,criteria:criteria.length,sourceFiles:source.length}));
