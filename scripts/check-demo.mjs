import { spawn } from 'node:child_process';
import { dirname } from 'node:path';
import { writeFileSync } from 'node:fs';
const npm=process.env.npm_execpath;
if(!npm)throw new Error('Run npm run test:demo with the supervised demo already started');
const commands=['test','run lint','run typecheck','run test:programmes','run test:local-auth','run test:listening:db','run test:discovery:ui','run test:member:demo','run test:radio:ui','run test:programmes:ui','run test:browser','run test:newspaper'];
const report={startedAt:new Date().toISOString(),commands:[],limitations:['Controls specimen requires separate development server; run test:controls with BROWSER_BASE','Hosted CI, physical mobile background and owner listening review are separate gates']};
try{for(const command of commands){const code=await new Promise((resolve,reject)=>{const child=spawn(process.execPath,[npm,...command.split(' ')],{stdio:'inherit',windowsHide:true,env:{...process.env,PATH:dirname(process.execPath)+';'+process.env.PATH}});child.on('error',reject);child.on('exit',resolve);});report.commands.push({command:'npm '+command,exitCode:code});if(code!==0)throw new Error('Demo check failed: '+command);}report.status='passed';}catch(e){report.status='failed';throw e;}finally{writeFileSync('docs/engineering/demo-checks.json',JSON.stringify(report,null,2));}
