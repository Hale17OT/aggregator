import { programmes,atomicJson,programmeRoot } from '../packages/programme/src/store.ts';
import { createFixtureRepository } from '../packages/test-fixtures/src/index.ts';
import { join } from 'node:path';
import { setInterval,clearInterval } from 'node:timers';
import {pollReviewedSources} from './live-source-worker.mjs';
// Offline derivative revalidation worker. Generation remains an explicit trusted command.
let running=false;
const run=async()=>{if(running)return;running=true;try{const ready=await programmes(createFixtureRepository());let sources;try{sources=await pollReviewedSources();}catch{sources={mode:'failed',reason:'Bounded source poll failed; prior permission checks remain enforced'};}await atomicJson(join(programmeRoot,'worker-health.json'),{checkedAt:new Date().toISOString(),ready:ready.length,mode:'local-revalidation',sources});}finally{running=false;}};
await run();const timer=setInterval(()=>void run(),30000);
for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>{clearInterval(timer);process.exitCode=0;});
