import { spawnSync } from 'node:child_process';
import { writeFileSync, unlinkSync, existsSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { tool, tools } from './foundation-tools.mjs';
const exe=await tool('gitleaks');
function scan(mode,args=[]){return spawnSync(exe,[mode,'.','--config','.gitleaks.toml','--redact=100','--no-banner','--max-archive-depth=2',...args],{encoding:'utf8',windowsHide:true,maxBuffer:4*1024*1024});}
if(process.argv.includes('--self-test')){
 const path=resolve('.env.secret-scan-canary');assert.equal(existsSync(path),false);
 // Random synthetic credential-shaped text, never a usable token or logged value.
 const canary=['gh','p_'].join('')+randomBytes(18).toString('hex');
 try{writeFileSync(path,'fixture = '+canary);const r=scan('dir');assert.equal(r.status,1,'Scanner must reject canary through the actual project configuration');assert.equal((r.stdout+r.stderr).includes(canary),false,'Scanner must redact values');}
 finally{unlinkSync(path);}
 console.log('Secret scanner canary rejected; output redaction verified.');
}
const work=scan('dir');process.stdout.write(work.stdout);process.stderr.write(work.stderr);if(work.status!==0)process.exit(work.status||1);
const hasHistory=spawnSync('git',['rev-parse','--verify','HEAD'],{encoding:'utf8',windowsHide:true}).status===0;
if(hasHistory){const history=scan('git',['--log-opts=--all']);process.stdout.write(history.stdout);process.stderr.write(history.stderr);if(history.status!==0)process.exit(history.status||1);}
writeFileSync('docs/engineering/secret-scan.json',JSON.stringify({date:new Date().toISOString(),version:tools.gitleaks.version,worktree:'pass',archives:'depth 2',history:hasHistory?'pass':'not available: repository has no commits',redacted:true,canary:process.argv.includes('--self-test')?'pass':'not run in this invocation',limitations:'Pattern-based scanning is not proof that no secret exists; ignored generated artifacts are not source coverage.'},null,2)+'\n');
console.log(hasHistory?'Worktree and available history scanned.':'Worktree scanned; no Git history exists yet.');
