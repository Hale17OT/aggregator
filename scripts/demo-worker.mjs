import { programmes,atomicJson,programmeRoot } from '../packages/programme/src/store.ts';
import { createFixtureRepository } from '../packages/test-fixtures/src/index.ts';
import { join } from 'node:path';
import { setInterval,clearInterval } from 'node:timers';
// Offline derivative revalidation worker. Generation remains an explicit trusted command.
const run=async()=>{const ready=await programmes(createFixtureRepository());await atomicJson(join(programmeRoot,'worker-health.json'),{checkedAt:new Date().toISOString(),ready:ready.length,providersCalled:0,mode:'local-revalidation'});};
await run();const timer=setInterval(()=>void run(),30000);
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>{clearInterval(timer);process.exitCode=0;});
