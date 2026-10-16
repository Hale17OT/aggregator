import {readFile,writeFile} from 'node:fs/promises';
const phase=process.argv[2]||'control-trace';const {traceEvents}=JSON.parse(await readFile(`output/playwright/stability/${phase}/trace.json`,'utf8'));
const names=['Layout','UpdateLayoutTree','FunctionCall','EventDispatch'];
const summary=names.map(name=>{const events=traceEvents.filter(e=>e.name===name&&e.ph==='X');return{name,count:events.length,totalMs:events.reduce((s,e)=>s+(e.dur||0),0)/1000,largest:events.sort((a,b)=>b.dur-a.dur).slice(0,4).map(e=>({ms:e.dur/1000,args:e.args}))};});
await writeFile(`output/playwright/stability/${phase}/trace-summary.json`,JSON.stringify(summary,null,2));console.log(JSON.stringify(summary,null,2));
