import {readFile,readdir,writeFile} from 'node:fs/promises';import {createHash} from 'node:crypto';
const hash=x=>createHash('sha256').update(x).digest('hex'),files=[];
async function walk(path){for(const e of await readdir(path,{withFileTypes:true})){const p=path+'/'+e.name;if(e.isDirectory())await walk(p);else if(/\.(vue|ts|css|json|sql|mjs)$/.test(p))files.push(p);}}
for(const p of ['apps/web/app','apps/api/src','packages/domain/src','packages/contracts/src','packages/db/src','packages/db/migrations','packages/test-fixtures','scripts'])await walk(p);
files.push('package-lock.json','docs/next-build/completion/interest_catalogue.seed.json');const identities={};for(const p of files.sort())identities[p]=hash(await readFile(p));
const client=createHash('sha256');for(const f of (await readdir('apps/web/.output/public/_nuxt')).filter(f=>/\.(js|css)$/.test(f)).sort())client.update(f).update(await readFile('apps/web/.output/public/_nuxt/'+f));
const clips=JSON.parse(await readFile('docs/engineering/clip-render.json','utf8'));
await writeFile('docs/engineering/completion-source-identity.json',JSON.stringify({at:new Date().toISOString(),sourceSha256:hash(JSON.stringify(identities)),clientAssetsSha256:client.digest('hex'),files:Object.entries(identities).map(([path,sha256])=>({path,sha256})),catalogue:{articles:24,desks:14,concepts:396,topics:390,roots:24,entities:6,programmes:23,radio:9,newsroom:8,clips:6},clips:clips.results.map(c=>({id:c.id,manifestSha256:c.manifestSha256,durationMs:c.durationMs})),scope:'Non-sensitive source/build/catalogue fingerprints; no member state or credentials'},null,2));
console.log('Source/build/catalogue identities recorded');
