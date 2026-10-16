import { readFileSync, realpathSync, lstatSync, openSync, readSync, closeSync, fstatSync } from 'node:fs';
import { resolve, relative, sep } from 'node:path';
import { createHash } from 'node:crypto';
import { parse } from 'ultrahtml';
import sax from 'sax';
import { z } from 'zod';
import { Buffer } from 'node:buffer';

export const hash=value=>createHash('sha256').update(value).digest('hex');
export function canonical(value){if(value instanceof Date)return JSON.stringify(value.toISOString());if(Array.isArray(value))return '['+value.map(canonical).join(',')+']';if(value&&typeof value==='object')return '{'+Object.keys(value).sort().map(k=>JSON.stringify(k)+':'+canonical(value[k])).join(',')+'}';return JSON.stringify(value);}
export const parserVersion='local-text/1-ultrahtml1.7-sax1.6-utf16-nfc';
export const inputRoot=resolve('fixtures/editorial-input');
const key=z.string().regex(/^[a-z0-9][a-z0-9-]{0,79}$/);
export function metadataUrl(value){const u=new URL(value);if(!['https:','http:'].includes(u.protocol)||u.username||u.password||!u.hostname.endsWith('.example.test'))throw Error('UNSUPPORTED_URL');return value;}
const url=z.string().max(2048).refine(v=>{try{metadataUrl(v);return true;}catch{return false;}});
export const itemSchema=z.strictObject({key,source:key,endpoint:key,grant:key,file:z.string().max(160),kind:z.enum(['html','feed','transcript','video']),url,title:z.string().min(1).max(200),published:z.iso.datetime().nullable(),event:z.strictObject({entity:key,date:z.iso.date(),topic:key,place:key}),language:z.literal('en')});
export const bundleSchema=z.strictObject({version:z.literal(1),items:z.array(itemSchema).min(1).max(40)});
export function safeRead(file,onOpen=()=>{}){
 if(!/^[a-zA-Z0-9][a-zA-Z0-9._/-]*$/.test(file)||file.split('/').some(x=>x==='..'||x==='.'||!x)||file.split('/').length>5)throw Error('UNSAFE_PATH');
 const base=realpathSync(inputRoot),path=resolve(inputRoot,file);if(!path.startsWith(inputRoot+sep))throw Error('UNSAFE_PATH');
 let part=inputRoot;for(const segment of relative(inputRoot,path).split(sep)){part=resolve(part,segment);if(lstatSync(part).isSymbolicLink()||realpathSync(part)!==part)throw Error('REPARSE_PATH');}
 if(base!==inputRoot||!realpathSync(path).startsWith(base+sep))throw Error('REPARSE_PATH');
 const expected=lstatSync(path);if(expected.nlink!==1)throw Error('HARDLINK_REFUSED');
 const fd=openSync(path,'r');try{const s=fstatSync(fd);if(realpathSync(path)!==path||s.dev!==expected.dev||s.ino!==expected.ino||s.nlink!==1)throw Error('INPUT_CHANGED');if(!s.isFile()||s.size>262144)throw Error('INPUT_SIZE');onOpen();const bytes=Buffer.alloc(s.size);const n=readSync(fd,bytes,0,s.size,0),after=fstatSync(fd);if(n!==s.size||after.size!==s.size||after.mtimeMs!==s.mtimeMs||after.ctimeMs!==s.ctimeMs)throw Error('INPUT_CHANGED');return bytes;}finally{closeSync(fd);}
}
export function loadBundle(file='manifest.json'){return bundleSchema.parse(JSON.parse(safeRead(file).toString('utf8')));}
const normal=v=>v.normalize('NFC').replace(/\s+/gu,' ').trim();
function entities(v){return v.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos|nbsp);/gi,(_,s)=>{const basic={amp:'&',lt:'<',gt:'>',quot:'"',apos:"'",nbsp:' '};if(basic[s])return basic[s];const n=s[1]?.toLowerCase()==='x'?parseInt(s.slice(2),16):Number(s.slice(1));return n>0&&n<=0x10ffff?String.fromCodePoint(n):'�';});}
export function extract(bytes,kind){
 const raw=bytes.toString('utf8');if(bytes.length>262144)throw Error('INPUT_SIZE');if(/<!\s*(?:DOCTYPE|ENTITY)/i.test(raw))throw Error('XML_DECLARATION');
 const started=Date.now();let nodes=0;const check=depth=>{if(depth>48||++nodes>10000||Date.now()-started>2000)throw Error('PARSE_LIMIT');};
 if(kind==='video')return {text:'',segments:[],discovery:[]};
 if(kind==='feed'){
  const p=sax.parser(true,{strictEntities:true});let depth=0,entry=null,field='',entries=[];
  p.onopentag=n=>{check(++depth);field=n.name.toLowerCase();if(['item','entry'].includes(field))entry={};if(entry&&field==='link'&&n.attributes.href)entry.url=metadataUrl(n.attributes.href);};
  p.ontext=t=>{if(entry&&['title','link','description','summary'].includes(field)){const k=field==='link'?'url':field;entry[k]=(entry[k]||'')+t;}};
  p.onclosetag=n=>{depth--;if(['item','entry'].includes(n.toLowerCase())){if(entry.url)metadataUrl(entry.url.trim());entries.push(entry);entry=null;}field='';};p.write(raw).close();return {text:'',segments:[],discovery:entries};
 }
 if(kind==='transcript'){
  const t=z.strictObject({language:z.literal('en'),provenance:z.string().min(5).max(200),durationMs:z.number().int().positive().max(3600000),segments:z.array(z.strictObject({startMs:z.number().int().nonnegative(),endMs:z.number().int().positive(),text:z.string().min(1).max(4000)})).min(1).max(500)}).parse(JSON.parse(raw));
  let text='',last=0;const segments=t.segments.map(s=>{if(s.startMs<last||s.endMs<=s.startMs||s.endMs>t.durationMs)throw Error('TRANSCRIPT_INTERVAL');last=s.endMs;const value=normal(s.text);const start=text.length;text+=(text?'\n\n':'')+value;return {...s,text:value,startChar:start+(start?2:0),endChar:text.length};});return {text,segments,durationMs:t.durationMs,provenance:t.provenance,discovery:[]};
 }
 const paragraphs=[];let buffer='';const flush=()=>{const v=normal(entities(buffer));if(v)paragraphs.push(v);buffer='';};
 function visit(n,depth=0){check(depth);const name=n.name?.toLowerCase();if(['script','style','iframe','object','embed','svg','template','head','nav','footer'].includes(name))return;if(n.type===2)buffer+=n.value;else{const block=['p','div','article','section','h1','h2','li','br'].includes(name);if(block)flush();for(const c of n.children||[])visit(c,depth+1);if(block)flush();}}
 visit(parse(raw));flush();if(paragraphs.length>200)throw Error('PARAGRAPH_LIMIT');const text=paragraphs.join('\n\n');if(!text)throw Error('EMPTY_EXTRACTION');return {text,segments:[],discovery:[]};
}
export function readAttestation(){return JSON.parse(readFileSync('.cache/pipeline-target.json','utf8'));}
export function locatorErrors(manifest,versions){
 const errors=[];for(const c of manifest.claims){const v=versions.find(v=>v.id===c.sourceId);if(!v){errors.push('LOCATOR_VERSION');continue;}
 const startMs=c.startMs===null?null:Number(c.startMs),endMs=c.endMs===null?null:Number(c.endMs);
 if(!Number.isInteger(c.start)||!Number.isInteger(c.end)||c.start<0||c.end<=c.start||v.normalized_text.slice(c.start,c.end)!==c.text||hash(v.normalized_text)!==v.normalized_hash)errors.push('LOCATOR_SPAN');
 if(startMs!==null&&!v.segments.some(s=>s.startMs===startMs&&s.endMs===endMs&&s.startChar===c.start&&s.endChar===c.end&&s.text===c.text))errors.push('LOCATOR_TIME');
 if(c.locatorHash!==hash(canonical({version:v.id,normalizedHash:v.normalized_hash,parser:v.extraction_version,start:c.start,end:c.end,text:c.text,startMs,endMs})))errors.push('LOCATOR_HASH');
 }return [...new Set(errors)];
}
