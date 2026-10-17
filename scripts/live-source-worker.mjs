import {readFileSync,existsSync} from 'node:fs';
import {spawn} from 'node:child_process';
let active=false,next=0;
// Called only by the existing owned demo worker. No OS job or public endpoint.
export async function pollReviewedSources(){
 const path='.cache/live-source-poll.json';
 if(!existsSync(path))return {mode:'paused',reason:'No explicit local poll configuration'};
 const config=JSON.parse(readFileSync(path,'utf8'));
 if(config.enabled!==true)return {mode:'paused'};
 if(!Number.isInteger(config.intervalSeconds)||config.intervalSeconds<900||config.intervalSeconds>86400)throw Error('Invalid source poll interval');
 if(active||Date.now()<next)return {mode:'waiting',nextAt:new Date(next).toISOString()};
 active=true;next=Date.now()+config.intervalSeconds*1000;
 try{return await new Promise((resolve,reject)=>{
  const child=spawn(process.execPath,['--import','tsx','scripts/live-news.mjs','import'],{windowsHide:true,stdio:['ignore','pipe','ignore']});let output='';
  child.stdout.on('data',b=>{output+=b.toString();if(output.length>16384)child.kill();});
  child.once('error',reject);child.once('exit',code=>{if(code!==0){reject(Error('SOURCE_IMPORT_FAILED'));return;}try{resolve({mode:'polled',nextAt:new Date(next).toISOString(),result:JSON.parse(output)});}catch{reject(Error('SOURCE_IMPORT_RESULT_INVALID'));}});
 });}finally{active=false;}
}
