import { readFileSync, writeFileSync, existsSync, readdirSync } from 'node:fs';
import { join, basename } from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
const selections={'0BSD':'0BSD','MIT':'MIT','ISC':'ISC','Apache-2.0':'Apache-2.0','MIT OR Apache-2.0':'MIT','OFL-1.1':'OFL-1.1','BSD-3-Clause':'BSD-3-Clause','BSD-2-Clause':'BSD-2-Clause','BlueOak-1.0.0':'BlueOak-1.0.0','CC0-1.0':'CC0-1.0','CC-BY-4.0':'CC-BY-4.0','MPL-2.0':'MPL-2.0','(BSD-3-Clause OR GPL-2.0)':'BSD-3-Clause','(MIT OR CC0-1.0)':'MIT'};
const obligations={
 '0BSD':'Permissive zero-clause BSD; retained upstream license and disclaimer in local notice bundle. Reviewed tslib LICENSE.txt.',
 'MIT':'Retain copyright and permission notice.',ISC:'Retain copyright and permission notice.',
 'Apache-2.0':'Retain license, relevant notices and change notices; preserve upstream NOTICE if provided.',
 'BSD-3-Clause':'Retain copyright, conditions and disclaimer; no endorsement.',
 'BSD-2-Clause':'Retain copyright, conditions and disclaimer.',
 'BlueOak-1.0.0':'Supply license notice with copies/substantial portions.',
 'CC0-1.0':'Retain provenance and CC0 text; no trademark rights inferred.',
 'CC-BY-4.0':'Attribute caniuse-lite/caniuse data, link license, indicate changes. Build-data dependency remains unmodified.',
 'OFL-1.1':'Retain font copyright/OFL; do not sell fonts alone or use reserved names for modified fonts. Bundled fonts are unmodified.',
 'MPL-2.0':'Retain notices and make covered source available when distributing binaries. lightningcss remains unmodified; retain source link for exact version.'
};
const lockBytes=readFileSync('package-lock.json'),lock=JSON.parse(lockBytes),entries=[],notices=[];
for(const [path,pkg]of Object.entries(lock.packages)){
 if(!path||pkg.link||path.startsWith('apps/'))continue;
 assert.ok(Object.hasOwn(selections,pkg.license),`Unreviewed license: ${path}: ${pkg.license}`);
 const bundledParent=pkg.inBundle?lock.packages[path.slice(0,path.lastIndexOf('/node_modules/'))]:null;
 assert.ok((pkg.integrity&&pkg.resolved?.startsWith('https://registry.npmjs.org/'))||(bundledParent?.integrity&&bundledParent.resolved?.startsWith('https://registry.npmjs.org/')),`Unpinned/non-registry dependency: ${path}`);
 const manifest=existsSync(join(path,'package.json'))?JSON.parse(readFileSync(join(path,'package.json'))):null;
 if(manifest)assert.equal(manifest.version,pkg.version,`Installed/locked version mismatch: ${path}`);
 const files=manifest?readdirSync(path).filter(n=>/^(licen[cs]e|copying|notice)(\.|$|-)/i.test(n)):[];
 const texts=files.map(file=>{const bytes=readFileSync(join(path,file));return {file,sha256:createHash('sha256').update(bytes).digest('hex'),text:bytes.toString('utf8')};});
 const name=manifest?.name||path.slice(path.lastIndexOf('node_modules/')+13),selected=selections[pkg.license];
 const repository=manifest?.repository;const source=typeof repository==='string'?repository:repository?.url||null;
 entries.push({name,version:pkg.version,path,license:pkg.license,selected,obligation:obligations[selected],source,integrity:pkg.integrity,installed:!!manifest,licenseFiles:texts.map(({file,sha256})=>({file,sha256})),noticeStatus:texts.length?'bundled text retained':manifest?'metadata only; consult SPDX and package source before redistribution':'other-platform optional package; locked license reviewed'});
 notices.push(`\n=== ${name}@${pkg.version} (${basename(path)}) ===\nDeclared: ${pkg.license}; selected: ${selected}\nSource: ${source||pkg.resolved}\n${obligations[selected]}\n${texts.map(t=>`--- ${t.file} ---\n${t.text}`).join('\n')||'No installed license file on this platform. See declared SPDX license and exact package source.'}`);
}
const report={date:new Date().toISOString(),lockSha256:createHash('sha256').update(lockBytes).digest('hex'),scope:'All locked third-party package records; local private workspaces excluded',entries,limitations:['License metadata review is engineering due diligence, not blanket legal or redistribution approval.','Other-platform optional binaries are reviewed by locked metadata; release packaging must retain their corresponding notices on the target platform.']};
writeFileSync('docs/engineering/dependency-licenses.json',JSON.stringify(report,null,2)+'\n');writeFileSync('docs/engineering/THIRD_PARTY_NOTICES.txt','THE AGGREGATOR — local dependency notice bundle. Not a distribution approval.\n'+notices.join('\n'));
console.log(`${entries.length} locked dependency records reviewed; ${entries.filter(e=>e.installed).length} installed; ${entries.filter(e=>e.installed&&!e.licenseFiles.length).length} metadata-only installed records.`);

