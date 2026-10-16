import {readFileSync,writeFileSync,mkdirSync,existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
const name=process.argv[2];
if(!/^check-[a-z-]+\.mjs$/.test(name||''))throw Error('Explicit check filename required');
const root='output/targeted-closeout-20261016',stamp=process.argv[3]||'1';
if(!/^[1-9][0-9]*$/.test(stamp))throw Error('Invalid run');
const dir=`${root}/checks/${name.slice(0,-4)}-${stamp}`;
if(existsSync(dir))throw Error('Immutable check output occupied');
mkdirSync(dir+'/reports',{recursive:true});mkdirSync(dir+'/review',{recursive:true});
let code=readFileSync(`scripts/${name}`,'utf8');
code=code.replace(/from ['"]\.\/([^'"]+)['"]/g,(_,p)=>`from '${pathToFileURL(resolve('scripts',p)).href}'`)
 .replaceAll('output/shortform-rebuild/',dir+'/shortform/').replaceAll('output/review/',dir+'/review/').replaceAll('output/playwright/',dir+'/playwright/').replaceAll('docs/engineering/',dir+'/reports/');
const file=dir+'/harness.mjs';writeFileSync(file,code);
const result=spawnSync(process.execPath,[file],{encoding:'utf8',windowsHide:true});
writeFileSync(dir+'/run.log',(result.stdout||'')+(result.stderr||''));
writeFileSync(dir+'/result.json',JSON.stringify({source:`scripts/${name}`,exit:result.status,at:new Date().toISOString(),scope:'Original assertions; output paths and relative imports adapted into an immutable run folder.'},null,2));
console.log(name,result.status,dir);process.exitCode=result.status??1;
