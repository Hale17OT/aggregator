import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {createHash} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {Buffer} from 'node:buffer';
export const modelRevision='1939ad2a8e416c0acfeecc08a694d14ef25f2231';
export const voices={ada:'af_heart',eli:'am_michael',clip:'am_puck'};
const cache=resolve('.cache/speech-sentences');let engine;
export function wave(samples){const b=Buffer.alloc(44+samples.length*2);b.write('RIFF');b.writeUInt32LE(b.length-8,4);b.write('WAVEfmt ',8);b.writeUInt32LE(16,16);b.writeUInt16LE(1,20);b.writeUInt16LE(1,22);b.writeUInt32LE(24000,24);b.writeUInt32LE(48000,28);b.writeUInt16LE(2,32);b.writeUInt16LE(16,34);b.write('data',36);b.writeUInt32LE(samples.length*2,40);for(let i=0;i<samples.length;i++)b.writeInt16LE(Math.round(Math.max(-1,Math.min(1,samples[i]))*32767),44+i*2);return b;}
export function decodeWave(b){if(b.toString('ascii',0,4)!=='RIFF'||b.readUInt32LE(24)!==24000||b.readUInt16LE(22)!==1||b.readUInt16LE(34)!==16)throw Error('UNSUPPORTED_LOCAL_WAVE');for(let offset=12;offset+8<=b.length;){const length=b.readUInt32LE(offset+4);if(offset+8+length>b.length)throw Error('TRUNCATED_WAVE');if(b.toString('ascii',offset,offset+4)==='data'){const out=new Float32Array(length/2);for(let i=0;i<out.length;i++)out[i]=b.readInt16LE(offset+8+i*2)/32768;return out;}offset+=8+length+length%2;}throw Error('MISSING_WAVE_DATA');}
export async function speech(text,speaker){
 if(!voices[speaker]||typeof text!=='string'||!text.trim()||text.length>2000)throw Error('INVALID_SPEECH_INPUT');
 await mkdir(cache,{recursive:true});const key=createHash('sha256').update(JSON.stringify([text,voices[speaker],modelRevision,'1.2.1',1])).digest('hex'),path=resolve(cache,key+'.wav');let samples,reused=true;
 try{samples=decodeWave(await readFile(path));}catch{
  reused=false;if(!engine){const {KokoroTTS}=await import('../../.cache/speech-runtime/node_modules/kokoro-js/dist/kokoro.js');const {env}=await import('../../.cache/speech-runtime/node_modules/@huggingface/transformers/dist/transformers.node.mjs');env.allowRemoteModels=false;engine=await KokoroTTS.from_pretrained(resolve('.cache/speech-model'),{dtype:'q8',device:'cpu'});}
  samples=(await engine.generate(text,{voice:voices[speaker],speed:1})).audio;await writeFile(path,wave(samples));
 }
 if(samples.length<2400||!samples.some(s=>Math.abs(s)>.01))throw Error('EMPTY_LOCAL_SPEECH');
 let cues;try{cues=JSON.parse(await readFile(resolve(cache,key+'.json'),'utf8')).mouthCues;}catch{
  await writeFile(resolve(cache,key+'.txt'),text);const result=spawnSync(resolve('.cache/tools/rhubarb/Rhubarb-Lip-Sync-1.14.0-Windows/rhubarb.exe'),['-f','json','--threads','2','--dialogFile',resolve(cache,key+'.txt'),'-o',resolve(cache,key+'.json'),path],{encoding:'utf8',timeout:120000,windowsHide:true});if(result.status!==0)throw Error('LOCAL_ALIGNMENT_FAILED');cues=JSON.parse(await readFile(resolve(cache,key+'.json'),'utf8')).mouthCues;
 }
 return {samples,cues,reused,key};
}
