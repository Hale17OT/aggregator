import {spawnSync} from 'node:child_process';
// Existing supervised demo must be ready. Never starts/reseeds/rebuilds a server implicitly.
const commands=[['--import','tsx','scripts/check-interests-db.mjs'],['scripts/check-clip-boundaries.mjs'],['--import','tsx','scripts/check-clip-services.mjs'],['scripts/check-reader-completion.mjs'],['scripts/check-paper-turn.mjs'],['scripts/check-completion-edge-cases.mjs'],['scripts/check-completion-touch.mjs'],['scripts/check-completion-lifecycle.mjs'],['scripts/check-completion-engines.mjs']];
for(const args of commands){const r=spawnSync(process.execPath,args,{stdio:'inherit',windowsHide:true,timeout:600000,env:process.env});if(r.status!==0)process.exit(r.status||1);}
console.log('Reader completion feature runner passed. Subjective listening/device/owner acceptance remain separate.');
