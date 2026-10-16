import {createHash} from 'node:crypto';
import {readFileSync,readdirSync,writeFileSync,existsSync} from 'node:fs';
import {join} from 'node:path';
const phase=process.argv[2];if(!['final','profile'].includes(phase))throw Error('Explicit artifact phase required');
const revision=process.argv[3]||'';if(revision&&!/^r[2-9][0-9]*$/.test(revision))throw Error('Invalid revision');const suffix=revision?`-${revision}`:'';
const target=`output/targeted-closeout-20261016/${phase}-fingerprints${suffix}.json`;if(existsSync(target))throw Error('Fingerprint destination occupied');
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');
function walk(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(join(dir,e.name)):[join(dir,e.name)]).sort();}
const groups={};
for(const dir of ['apps/mobile/lib','apps/web/app','apps/web/.output','apps/mobile/assets/brand','apps/mobile/android/app/src','apps/mobile/ios/Runner/Assets.xcassets','apps/web/public/brand']){
 const files=walk(dir).map(p=>({path:p.replaceAll('\\','/'),sha256:hash(p)}));
 groups[dir]={digest:createHash('sha256').update(JSON.stringify(files)).digest('hex'),files};
}
const files=['package-lock.json','apps/web/nuxt.config.ts','apps/mobile/android/app/build.gradle.kts','apps/mobile/android/settings.gradle.kts','apps/mobile/pubspec.lock','apps/mobile/pubspec.yaml',...(phase==='final'?[`output/targeted-closeout-20261016/main/aggregator-targeted-local-demo${suffix}.apk`]:['output/targeted-closeout-20261016/profile/candidate-final.apk'])].map(path=>({path,sha256:hash(path)}));
writeFileSync(target,JSON.stringify({at:new Date().toISOString(),phase,entrypoint:phase==='final'?'lib/main.dart':'lib/profile_main.dart',mode:phase==='final'?'debug localDemo normal main':'profile localDemo diagnostic',groups,files},null,2));console.log(target,files);
