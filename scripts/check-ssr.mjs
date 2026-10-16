import assert from 'node:assert/strict';
for(const [slug,status] of [['unpublished-draft',404],['alderwick-evening-shuttle',200]]){
  const response=await fetch(`http://127.0.0.1:3000/articles/${slug}`);
  const html=await response.text();
  assert.equal(response.status,status);
  assert.ok(!html.includes('PRIVATE DRAFT MUST NOT LEAK'));
  if(status===200){assert.ok(html.includes('id="sources"'));assert.ok(html.includes('id="source-4"'));assert.ok(html.includes('id="block-1"'));}
  console.log(`${slug}: ${status}, SSR projection verified`);
}
