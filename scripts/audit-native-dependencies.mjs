/* global AbortSignal */
import {readFileSync,existsSync,writeFileSync} from 'node:fs';
import {resolve,join} from 'node:path';
import {pathToFileURL,fileURLToPath} from 'node:url';
import {createHash} from 'node:crypto';
const config=resolve('apps/mobile/.dart_tool/package_config.json');
const packages=JSON.parse(readFileSync(config)).packages.filter(p=>p.name!=='aggregator_mobile').map(p=>{
 const root=fileURLToPath(new URL(p.rootUri,pathToFileURL(config)));
 const pub=readFileSync(join(root,'pubspec.yaml'),'utf8');
 const version=pub.match(/^version:\s*["']?([\w.+-]+)/m)?.[1];
 const license=['LICENSE','LICENSE.txt','LICENSE.md'].map(n=>join(root,n)).find(existsSync);
 return {name:p.name,version,sdk:!root.replaceAll('\\','/').includes('/hosted/pub.dev/'),
  license:license?{present:true,sha256:createHash('sha256').update(readFileSync(license)).digest('hex')}: {present:false}};
});
const queries=packages.filter(p=>!p.sdk&&p.version);
const report={at:new Date().toISOString(),method:'OSV public package/version query only; no source or assets uploaded',
 reference:'https://google.github.io/osv.dev/api/',lockSha256:createHash('sha256').update(readFileSync('apps/mobile/pubspec.lock')).digest('hex'),packages,
 limitations:['SDK and native Maven/CocoaPods transitive dependencies require separate review','No finding is not proof of absence'],status:'running'};
try {const response=await fetch('https://api.osv.dev/v1/querybatch',{method:'POST',headers:{'content-type':'application/json'},
 body:JSON.stringify({queries:queries.map(p=>({package:{name:p.name,ecosystem:'Pub'},version:p.version}))}),signal:AbortSignal.timeout(30000)});
 if(!response.ok)throw Error(`OSV ${response.status}`);const data=await response.json();
 report.results=queries.map((p,i)=>({name:p.name,version:p.version,...data.results[i]}));report.status='queried';
}catch(e){report.status='unavailable';report.error=e.message;}
writeFileSync('docs/engineering/flutter-closeout/native-dependencies.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({status:report.status,packages:packages.length,missingLicenses:packages.filter(p=>!p.license.present).map(p=>p.name),findings:report.results?.filter(p=>p.vulns?.length)},null,2));
