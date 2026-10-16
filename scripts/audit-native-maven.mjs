/* global AbortSignal */
import {Buffer} from 'node:buffer';
// Read-only cache/build audit. Network requests contain public Maven names/versions only.
import {readFileSync,readdirSync,existsSync,writeFileSync} from 'node:fs';
import {join,relative} from 'node:path';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
function selectedCoordinates(text){
 const selected=new Map(),unresolved=[];
 for(const line of text.split(/\r?\n/)){
  const m=line.match(/(?:\+---|\\---)\s+([\w.-]+):([\w.-]+):(.+)/);if(!m)continue;
  if(/\bFAILED\b|\(n\)/.test(m[3])){unresolved.push(line.trim());continue;}
  let version=m[3].includes(' -> ')?m[3].split(' -> ').at(-1).trim().split(/\s/)[0]:m[3].trim().split(/\s/)[0];
  if(!/^[A-Za-z0-9][A-Za-z0-9_.-]*$/.test(version)||version==='unspecified'){unresolved.push(line.trim());continue;}
  const name=m[1]+':'+m[2],old=selected.get(name);
  if(old&&old.version!==version)throw Error('Conflicting selected versions; provide exactly one runtime configuration report: '+name);
  selected.set(name,{name,version,evidence:'Selected version in supplied Gradle runtime dependency report'});
 }
 return {selected,unresolved};
}
if(process.argv.includes('--self-test')){
 const parsed=selectedCoordinates('+--- com.google.guava:guava:28.1-android -> 32.0.1-android\n|    \\--- androidx.test:runner:1.2.0 (*)\n+--- com.google.guava:guava:{strictly 32.0.1-android} -> 32.0.1-android (c)');
 assert.equal(parsed.selected.get('com.google.guava:guava').version,'32.0.1-android');assert.equal(parsed.selected.size,2);assert.equal(parsed.unresolved.length,0);
 assert.equal(selectedCoordinates('\\--- example:missing:1.0 FAILED').unresolved.length,1);
 assert.throws(()=>selectedCoordinates('+--- example:conflict:1.0\n\\--- example:conflict:2.0'));
 console.log('Gradle selected-coordinate parser: replacement, strict constraint, repeated subtree, failed resolution and conflict checks passed');process.exit(0);
}
const option=name=>{const i=process.argv.indexOf(name);return i<0?undefined:process.argv[i+1];};
const dependencyPath=option('--dependencies');
if(!dependencyPath)throw Error('Supply --dependencies PATH to one actual Gradle runtime dependency report; no cached or declared version is treated as resolved');
const output=option('--output')||'docs/engineering/flutter-closeout/native-maven-resolved-review.json';
if(output.replaceAll('\\','/').endsWith('/native-maven-review.json'))throw Error('Historical native-maven-review.json must be preserved');
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
const manifest='apps/mobile/build/app/outputs/logs/manifest-merger-localDemo-debug-report.txt';
const dependencyText=readFileSync(dependencyPath,'utf8');
const {selected:entries,unresolved}=selectedCoordinates(dependencyText);
if(!entries.size)throw Error('No resolved Maven coordinates in supplied report');
const report={at:new Date().toISOString(),method:'Read selected coordinates from supplied Gradle runtime dependency report, cached POMs/artifacts and existing build evidence. Query OSV with public package/version metadata only.',scope:'Maven coordinates of the supplied runtime configuration; local projects, Flutter engine/native binaries and iOS dependencies need separate inventories.',dependencyReport:{path:dependencyPath,sha256:hash(dependencyPath)},unresolved,manifest:{path:manifest,sha256:hash(manifest)},sdkPlugin:{path:'C:/flutter/packages/integration_test/android/build.gradle.kts',sha256:hash('C:/flutter/packages/integration_test/android/build.gradle.kts')},packages:[],findings:[]};
const cache='.cache/flutter-gradle/caches/modules-2/files-2.1';
function files(dir){if(!existsSync(dir))return [];return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(join(dir,e.name)):[join(dir,e.name)]);}
for(const p of entries.values()){
 const [group,artifact]=p.name.split(':');const found=files(join(cache,group,artifact,p.version));
 const poms=found.filter(p=>p.endsWith('.pom'));
 p.artifacts=found.filter(p=>/\.(jar|aar|pom)$/.test(p)).map(path=>({path:relative('.',path).replaceAll('\\','/'),sha256:hash(path)}));
 p.licenses=poms.flatMap(path=>[...readFileSync(path,'utf8').matchAll(/<license>([\s\S]*?)<\/license>/g)].map(m=>({name:m[1].match(/<name>([\s\S]*?)<\/name>/)?.[1]?.trim(),url:m[1].match(/<url>([\s\S]*?)<\/url>/)?.[1]?.trim(),source:relative('.',path).replaceAll('\\','/')})));
 p.licenseStatus=p.licenses.length?'POM metadata present; packaged notices not verified':'No direct POM license metadata; inspect parent/inherited notices';
 try{
  const r=await fetch('https://api.osv.dev/v1/query',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({package:{ecosystem:'Maven',name:p.name},version:p.version}),signal:AbortSignal.timeout(20000)});
  if(!r.ok)throw Error('OSV '+r.status);const body=await r.json();p.osv={status:'queried',vulnerabilityCount:body.vulns?.length??0};
  for(const v of body.vulns??[])report.findings.push({package:p.name,version:p.version,id:v.id,aliases:v.aliases,summary:v.summary,details:v.details,severity:v.severity,affected:v.affected,references:v.references});
 }catch(e){p.osv={status:'unavailable',reason:e.name};}
 report.packages.push(p);
}
const dexRoot='apps/mobile/build/app/intermediates/dex/localDemoDebug/mergeExtDexLocalDemoDebug';
report.dex=files(dexRoot).filter(p=>p.endsWith('.dex')).map(path=>{const b=readFileSync(path);return {path:path.replaceAll('\\','/'),sha256:hash(path),guavaFiles:b.includes(Buffer.from('Lcom/google/common/io/Files;')),guavaFileBackedOutputStream:b.includes(Buffer.from('Lcom/google/common/io/FileBackedOutputStream;')),androidxTestRunner:b.includes(Buffer.from('Landroidx/test/runner/AndroidJUnitRunner;'))};});
const guavaVersion=entries.get('com.google.guava:guava')?.version;
const guavaParent=guavaVersion?files(join(cache,'com.google.guava','guava-parent',guavaVersion)).find(p=>p.endsWith('.pom')):undefined;
if(guavaParent)report.guavaParentLicense={path:guavaParent.replaceAll('\\','/'),sha256:hash(guavaParent),metadata:[...readFileSync(guavaParent,'utf8').matchAll(/<license>([\s\S]*?)<\/license>/g)].map(m=>m[1].replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim())};
const pub=JSON.parse(readFileSync('docs/engineering/flutter-closeout/native-dependencies.json','utf8'));
report.pubReport={path:'docs/engineering/flutter-closeout/native-dependencies.json',sha256:hash('docs/engineering/flutter-closeout/native-dependencies.json'),at:pub.at,status:pub.status,lockSha256:pub.lockSha256};
report.status=unresolved.length||report.packages.some(p=>p.osv.status!=='queried')?'partial':'queried';
writeFileSync(output,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,packages:report.packages.length,findings:report.findings.map(v=>({package:v.package,id:v.id,summary:v.summary})),dex:report.dex},null,2));
