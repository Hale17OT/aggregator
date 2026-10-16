import { mkdirSync, existsSync, writeFileSync, readFileSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { Buffer } from 'node:buffer';
import { resolve, join } from 'node:path';
export const tools={
 gitleaks:{version:'8.30.1',repo:'gitleaks/gitleaks',win32:{file:'gitleaks_8.30.1_windows_x64.zip',sha:'d29144deff3a68aa93ced33dddf84b7fdc26070add4aa0f4513094c8332afc4e'},linux:{file:'gitleaks_8.30.1_linux_x64.tar.gz',sha:'551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb'}},
 actionlint:{version:'1.7.12',repo:'rhysd/actionlint',win32:{file:'actionlint_1.7.12_windows_amd64.zip',sha:'6e7241b51e6817ea6a047693d8e6fed13b31819c9a0dd6c5a726e1592d22f6e9'},linux:{file:'actionlint_1.7.12_linux_amd64.tar.gz',sha:'8aca8db96f1b94770f1b0d72b6dddcb1ebb8123cb3712530b08cc387b349a3d8'}}
};
export async function tool(name){
 const t=tools[name],asset=t?.[process.platform];if(!asset||process.arch!=='x64')throw new Error('Foundation tooling currently supports Windows/Linux x64');
 const dir=resolve('.cache/tools',name+'-'+t.version);mkdirSync(dir,{recursive:true});const archive=join(dir,asset.file),exe=join(dir,name+(process.platform==='win32'?'.exe':''));
 if(!existsSync(archive)){const response=await fetch(`https://github.com/${t.repo}/releases/download/v${t.version}/${asset.file}`);if(!response.ok)throw new Error('Tool download failed: '+response.status);writeFileSync(archive,Buffer.from(await response.arrayBuffer()));}
 if(createHash('sha256').update(readFileSync(archive)).digest('hex')!==asset.sha)throw new Error('Tool checksum mismatch');
 if(!existsSync(exe)){const r=spawnSync('tar',['-xf',archive,'-C',dir],{encoding:'utf8',windowsHide:true});if(r.status!==0)throw new Error('Tool extraction failed');}
 return exe;
}
if(process.argv[2]==='install'){for(const name of Object.keys(tools)){await tool(name);console.log(`${name} ${tools[name].version}: official release archive checksum verified`);}}
