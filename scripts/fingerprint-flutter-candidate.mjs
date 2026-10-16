import {createHash} from 'node:crypto';
import {createReadStream,readFileSync,readdirSync,statSync,writeFileSync} from 'node:fs';
import {join} from 'node:path';
import assert from 'node:assert/strict';
const hash=async path=>{const h=createHash('sha256');for await(const b of createReadStream(path))h.update(b);return h.digest('hex');};
const baseline=JSON.parse(readFileSync('docs/engineering/flutter-closeout/baseline.json'));
const files=[];
function walk(dir){for(const name of readdirSync(dir)){if(['node_modules','.nuxt','.output','build','.dart_tool','.gradle','.git','.idea','ephemeral'].includes(name))continue;const p=join(dir,name);if(statSync(p).isDirectory())walk(p);else if(!/local\.properties$|\.iml$|\.DS_Store$/.test(p))files.push(p.replaceAll('\\','/'));}}
for(const dir of ['apps','packages','scripts'])walk(dir);
for(const name of readdirSync('.'))if(statSync(name).isFile()&&(/\.(json|toml|mjs|yaml|yml)$/.test(name)||name==='AGENTS.md'))files.push(name);
const source=[];for(const path of files.sort())source.push({path,sha256:await hash(path)});
const media=[];
for(const p of baseline.media){const assets=[];for(const a of p.assets){const path=join('.cache/programmes/assets',a.storageKey),sha256=await hash(path);assert.equal(sha256,a.sha256,`Original asset changed: ${a.id}`);assert.equal(statSync(path).size,a.bytes);assets.push({id:a.id,sha256,bytes:a.bytes});}media.push({id:p.id,rendition:p.rendition,assets});}
assert.equal(media.length,23);
const apk='output/flutter-closeout/aggregator-local-demo.apk';
const report={at:new Date().toISOString(),source,sourceFingerprint:createHash('sha256').update(JSON.stringify(source)).digest('hex'),locks:{npm:await hash('package-lock.json'),pub:await hash('apps/mobile/pubspec.lock')},webBuild:await hash('apps/web/.output/server/index.mjs'),apk:{path:apk,sha256:await hash(apk),bytes:statSync(apk).size},media,status:'Original 23 rendition asset bytes preserved; build and source identities recorded. This is not acceptance.'};
writeFileSync('docs/engineering/flutter-closeout/candidate.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({sourceFiles:source.length,sourceFingerprint:report.sourceFingerprint,apk:report.apk,renditions:media.length}));
