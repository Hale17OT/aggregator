import {spawnSync} from 'node:child_process';import {writeFileSync} from 'node:fs';
const results=[];
for(const args of [['scripts/check-browser.mjs'],['scripts/check-enhanced-controls.mjs'],['scripts/check-programme-handoff.mjs'],['scripts/check-radio-dials.mjs'],['scripts/check-member-demo.mjs'],['scripts/check-completion-chevron.mjs','after']]){
 console.log('Running '+args[0]);const r=spawnSync(process.execPath,args,{encoding:'utf8',windowsHide:true,timeout:240000,maxBuffer:2e6});results.push({command:args.join(' '),status:r.status===0?'passed':'failed',exit:r.status,output:(r.stdout+r.stderr).slice(-2000)});console.log(results.at(-1));
 writeFileSync('docs/engineering/completion-regressions.json',JSON.stringify({at:new Date().toISOString(),results},null,2));
}
if(results.some(r=>r.status!=='passed'))process.exitCode=1;
