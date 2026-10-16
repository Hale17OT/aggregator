import { mkdir, writeFile } from 'node:fs/promises';
const repos = ['formkit/auto-animate','motiondivision/motion-vue','emilkowalski/skills','Leonxlnx/taste-skill','img2threejs/img2threejs','pbakaus/impeccable','chenglou/pretext'];
await mkdir('.cache/references',{recursive:true});
const results=[];
for(const repo of repos){
  const headers={'User-Agent':'Aggregator-local-documentation-review'};
  const info=await fetch(`https://api.github.com/repos/${repo}`,{headers}).then(r=>r.json());
  const commit=await fetch(`https://api.github.com/repos/${repo}/commits/${info.default_branch}`,{headers}).then(r=>r.json());
  const tree=await fetch(`https://api.github.com/repos/${repo}/git/trees/${commit.sha}?recursive=1`,{headers}).then(r=>r.json());
  const selected=(tree.tree||[]).filter(f=>f.type==='blob' && /(^README\.md$|^LICENSE[^/]*$|^package\.json$|SKILL\.md$|typography\.md$|responsive\.md$|animation\.md$)/i.test(f.path)).slice(0,12);
  const files=[];
  for(const f of selected){const body=await fetch(`https://raw.githubusercontent.com/${repo}/${commit.sha}/${f.path}`).then(r=>r.text()); const path=`.cache/references/${repo.replace('/','--')}--${f.path.replaceAll('/','--')}`;await writeFile(path,body);files.push({path:f.path,local:path});}
  results.push({repo,revision:commit.sha,license:info.license?.spdx_id||'not declared',files});
}
await mkdir('docs/engineering',{recursive:true});
await writeFile('docs/engineering/reference-revisions.json',JSON.stringify({reviewDate:'2026-10-12',repositories:results},null,2)+'\n');
console.log(JSON.stringify(results.map(({repo,revision,license,files})=>({repo,revision,license,files:files.map(f=>f.path)})),null,2));
