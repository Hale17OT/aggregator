import { mkdir,writeFile,readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { Buffer } from 'node:buffer';
const url='https://github.com/axllent/mailpit/releases/download/v1.31.4/mailpit-windows-amd64.zip';
const sha256='0dd6ec909a6f5b2b66682b22d82abce97ab793e30766bf2f642b691e70a4a16b';
if(process.platform!=='win32')throw new Error('Reviewed package is Windows amd64 only');
await mkdir('.cache/tools/mailpit',{recursive:true});const path='.cache/tools/mailpit/mailpit.zip';
let data;try{data=await readFile(path);}catch{const r=await fetch(url);if(!r.ok)throw new Error('Mailpit download unavailable');data=Buffer.from(await r.arrayBuffer());await writeFile(path,data);}
if(createHash('sha256').update(data).digest('hex')!==sha256)throw new Error('Mailpit checksum mismatch');
const extracted=spawnSync('powershell.exe',['-NoProfile','-Command','Expand-Archive -LiteralPath .cache/tools/mailpit/mailpit.zip -DestinationPath .cache/tools/mailpit -Force'],{stdio:'inherit',windowsHide:true});
if(extracted.status!==0)throw new Error('Mailpit extraction failed');
const license=await fetch('https://raw.githubusercontent.com/axllent/mailpit/v1.31.4/LICENSE');if(!license.ok)throw new Error('License unavailable');await writeFile('.cache/tools/mailpit/LICENSE',await license.text());
console.log('Verified Mailpit 1.31.4 workspace tool, MIT; no service installed');
