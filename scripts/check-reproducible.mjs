import { spawnSync, spawn } from 'node:child_process';
import { mkdirSync, copyFileSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname, sep } from 'node:path';
import { randomUUID, createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const root=resolve('.'),target=join(root,'.cache','repro-'+randomUUID());assert.ok(target.startsWith(root+sep+'.cache'+sep));mkdirSync(target,{recursive:true});
const files=spawnSync('git',['ls-files','--cached','--others','--exclude-standard','-z'],{encoding:'utf8',windowsHide:true});assert.equal(files.status,0);
const copied=files.stdout.split('\0').filter(Boolean).filter(p=>!p.startsWith('output/'));
for(const file of copied){const to=resolve(target,file);assert.ok(to.startsWith(target+sep));mkdirSync(dirname(to),{recursive:true});copyFileSync(join(root,file),to);}
assert.equal(existsSync(join(target,'node_modules')),false);
const hash=p=>createHash('sha256').update(readFileSync(p)).digest('hex');const lock=hash(join(root,'package-lock.json'));
const npm=process.env.npm_execpath||join(dirname(process.execPath),'node_modules/npm/bin/npm-cli.js');assert.ok(existsSync(npm));
const report={date:new Date().toISOString(),node:process.version,target,source:'Clean source snapshot from tracked + nonignored untracked files; no commit exists yet. Generated output/ omitted.',files:copied.length,lockSha256:lock,checks:[]};
try{
 for(const args of [['ci','--no-fund'],['run','lint'],['run','typecheck'],['test'],['run','build'],['run','worker:check']]){
  console.log('Clean snapshot: npm '+args.join(' '));const log=join(target,'check-'+report.checks.length+'.log');
  const result=await new Promise((ok,no)=>{const child=spawn(process.execPath,[npm,...args],{cwd:target,env:{...process.env,PATH:dirname(process.execPath)+(process.platform==='win32'?';':':')+process.env.PATH},windowsHide:true});let output='';child.stdout.on('data',x=>{output+=x;});child.stderr.on('data',x=>{output+=x;});child.on('error',no);child.on('close',code=>{writeFileSync(log,output);ok(code);});});
  report.checks.push({command:'npm '+args.join(' '),exitCode:result,log});assert.equal(result,0,'Clean snapshot command failed: '+log);
 }
 assert.equal(hash(join(target,'package-lock.json')),lock);assert.equal(hash(join(root,'package-lock.json')),lock);report.lockUnchanged=true;report.status='passed';console.log('Clean installation and checks passed; lockfile unchanged.');
}catch(e){report.status='failed';throw e;}finally{writeFileSync(join(root,'docs/engineering/reproducible-install.json'),JSON.stringify(report,null,2)+'\n');}
