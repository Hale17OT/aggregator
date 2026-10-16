import { readFile, mkdir, writeFile } from 'node:fs/promises';
const tokens=JSON.parse(await readFile('docs/specs/design/design_tokens.json','utf8'));
const rules=Object.entries(tokens.color).map(([mode,values])=>`${mode==='light'?':root':':root[data-theme="dark"]'} {\n${Object.entries(values).map(([key,value])=>`  --${key}: ${value};`).join('\n')}\n}`).join('\n');
await mkdir('apps/web/app/assets',{recursive:true});await mkdir('packages/design-tokens',{recursive:true});
await writeFile('apps/web/app/assets/tokens.css',rules+'\n');
await writeFile('packages/design-tokens/tokens.json',JSON.stringify(tokens,null,2)+'\n');
