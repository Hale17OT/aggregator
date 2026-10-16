import { spawn } from 'node:child_process';
const children = [
  spawn(process.execPath, ['--import', 'tsx', 'apps/api/src/server.ts'], { stdio: 'inherit' }),
  spawn(process.execPath, ['node_modules/nuxt/bin/nuxt.mjs', 'dev', 'apps/web', '--host', '127.0.0.1', '--port', '3000'], { stdio: 'inherit' }),
];
for (const signal of ['SIGINT','SIGTERM']) process.on(signal,()=>children.forEach(child=>child.kill()));
for (const child of children) child.on('exit',code=>{if(code) { children.forEach(other=>other.kill()); process.exitCode=code; }});
