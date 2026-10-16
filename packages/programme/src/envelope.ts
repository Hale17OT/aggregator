import type { Programme } from '../../contracts/src/programme.js';
import { verifiedAsset } from './store.js';

// Measured PCM envelopes only. Does not reroute the browser's media element.
export async function audioEnvelope(programme:Programme){
  const id=programme.audioUrl.split('/').at(-1)!;
  const found=await verifiedAsset(programme,id);if(!found||found.asset.mime!=='audio/wav')return null;
  const data=found.data;if(data.toString('ascii',0,4)!=='RIFF'||data.toString('ascii',8,12)!=='WAVE')return null;
  let offset=12,sampleRate=0,channels=0,bits=0,pcm:Buffer|undefined;
  while(offset+8<=data.length){const size=data.readUInt32LE(offset+4),start=offset+8;if(start+size>data.length)return null;
    const kind=data.toString('ascii',offset,offset+4);
    if(kind==='fmt '){if(size<16||data.readUInt16LE(start)!==1)return null;channels=data.readUInt16LE(start+2);sampleRate=data.readUInt32LE(start+4);bits=data.readUInt16LE(start+14);}
    if(kind==='data')pcm=data.subarray(start,start+size);offset=start+size+(size%2);
  }
  if(!pcm||channels!==1||bits!==16||sampleRate<8000||sampleRate>192000)return null;
  const stepMs=50,window=Math.round(sampleRate*stepMs/1000),rms:number[]=[],peak:number[]=[];
  for(let start=0;start<pcm.length/2;start+=window){let sum=0,max=0,count=0;for(let i=start;i<Math.min(start+window,pcm.length/2);i++){const value=pcm.readInt16LE(i*2)/32768;sum+=value*value;max=Math.max(max,Math.abs(value));count++;}rms.push(Number(Math.sqrt(sum/count).toFixed(5)));peak.push(Number(max.toFixed(5)));}
  return {renditionKey:programme.renditionKey,audioHash:id,stepMs,rms,peak};
}
