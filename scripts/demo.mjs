import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { writeFileSync,mkdirSync,existsSync,readFileSync,unlinkSync } from 'node:fs';
import { startDemoDatabase,stopDemoDatabase } from './demo-database.mjs';
import { once } from 'node:events';

const action=process.argv[2]||'start';
if(action==='stop'||action==='restart-api'||action==='restart-web'){
 const state=JSON.parse(readFileSync('.cache/demo-supervisor.json','utf8'));
 const r=await fetch('http://127.0.0.1:4301/'+action,{method:'POST',headers:{'x-demo-owner':state.stopNonce}});if(!r.ok)throw new Error('Supervisor refused action');
}else if(action==='start'){
 if(process.env.DATABASE_URL)throw new Error('Ambient DATABASE_URL refused');
 for(const port of [3000,4000,8025,1025,4301,55441])await new Promise((ok,no)=>{const s=createServer();s.once('error',()=>no(new Error(`Port ${port} is occupied; no unrelated process was stopped`)));s.listen(port,'127.0.0.1',()=>s.close(ok));});
 if(!existsSync('.cache/tools/mailpit/mailpit.exe'))throw new Error('Run tools:mailpit first');
 if(!existsSync('apps/web/.output/server/index.mjs'))throw new Error('Run build first');
 const {path,target}=await startDemoDatabase();const children=[];let stopping=false;
 const stop=async()=>{if(stopping)return;stopping=true;for(const c of children)if(c.exitCode===null&&c.signalCode===null){c.kill();await once(c,'exit').catch(()=>{});}stopDemoDatabase();server.close();if(existsSync('.cache/demo-supervisor.json'))unlinkSync('.cache/demo-supervisor.json');};
 const env={...process.env,NODE_ENV:'development',HOST:'127.0.0.1',PORT:'3000',NITRO_HOST:'127.0.0.1',NITRO_PORT:'3000',NUXT_API_BASE:'http://127.0.0.1:4000',APP_ORIGIN:'http://127.0.0.1:3000'};
 for(const key of Object.keys(env))if(key.startsWith('MP_')||key.startsWith('PG')||['DATABASE_URL','FIXTURE_SESSION_ISSUANCE'].includes(key))delete env[key];
 const expectedExit=new Set();
 const launch=(exe,args,extra={})=>{const c=spawn(exe,args,{env:{...env,...extra},stdio:['ignore','ignore','ignore'],windowsHide:true});children.push(c);c.once('exit',()=>{if(!stopping&&!expectedExit.has(c))void stop();});return c;};
 launch('.cache/tools/mailpit/mailpit.exe',['--listen','127.0.0.1:8025','--smtp','127.0.0.1:1025','--allowed-hosts','127.0.0.1,localhost','--disable-version-check','--block-remote-css-and-fonts','--database','.cache/demo-mail.sqlite','--max-age','1d','--quiet']);
 const startApi=()=>launch(process.execPath,['--import','tsx','apps/api/src/server.ts'],{PORT:'4000',PERSISTENCE_ADAPTER:'postgresql',DISPOSABLE_DB_TARGET:path,LOCAL_CAPTURED_AUTH:'true'});
 let api=startApi();
 const startWeb=()=>launch(process.execPath,['apps/web/.output/server/index.mjs']);let web=startWeb();
 launch(process.execPath,['--import','tsx','scripts/demo-worker.mjs']);
 const {randomBytes}=await import('node:crypto');const stopNonce=randomBytes(32).toString('hex');
 const {createServer:createHttp}=await import('node:http');
 const server=createHttp(async(req,res)=>{if(req.method!=='POST'||!['/stop','/restart-api','/restart-web'].includes(req.url)||req.headers['x-demo-owner']!==stopNonce){res.writeHead(403).end();return;}
 if(req.url==='/stop'){await stop();res.end('Owned demo stopped');return;}
 if(req.url==='/restart-web'){expectedExit.add(web);web.kill();await once(web,'exit');web=startWeb();saveState();res.end('Web restarted; database and API untouched');return;}
 expectedExit.add(api);api.kill();await once(api,'exit');api=startApi();saveState();res.end('API restarted without reseeding');});server.listen(4301,'127.0.0.1');
 const saveState=()=>writeFileSync('.cache/demo-supervisor.json',JSON.stringify({pid:process.pid,pids:children.filter(c=>c.exitCode===null&&c.signalCode===null).map(c=>c.pid),target:target.data,stopNonce}));
 mkdirSync('.cache',{recursive:true});saveState();
 for(const signal of ['SIGINT','SIGTERM'])process.on(signal,()=>void stop());
 console.log('Retained local demo: http://127.0.0.1:3000; captured mailbox: http://127.0.0.1:8025. Stop: npm run demo:stop');
}else throw new Error('Use start or stop. Reset is deliberately not automatic.');

