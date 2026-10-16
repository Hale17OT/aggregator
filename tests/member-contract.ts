import assert from 'node:assert/strict';
export interface ContractClient {
  request(path:string,token?:string,method?:string,body?:unknown,headers?:Record<string,string>):Promise<Response>;
  write(path:string,token:string,method:string,body?:unknown):Promise<Response>;
}
// Identical public contracts exercised against both adapters; no storage-specific assertions.
export async function memberContract(client:ContractClient,a:string,b:string,articleId:string){
  assert.equal((await client.request('/me/preferences')).status,401);
  assert.equal((await client.request('/me/session','malformed')).status,401);
  const beforeA=(await (await client.request('/me/preferences',a)).json()).data;
  const beforeB=(await (await client.request('/me/preferences',b)).json()).data;
  const next=beforeA.theme==='light'?'dark':'light';
  assert.equal((await client.write('/me/preferences',a,'PATCH',{theme:next,lockVersion:beforeA.lockVersion})).status,200);
  assert.equal((await client.write('/me/preferences',a,'PATCH',{theme:'system',lockVersion:beforeA.lockVersion})).status,409);
  assert.deepEqual((await (await client.request('/me/preferences',b)).json()).data,beforeB);
  assert.equal((await client.write('/me/preferences',a,'PATCH',{userId:'another-user',lockVersion:beforeA.lockVersion+1})).status,422);
  const first=await (await client.write(`/me/bookmarks/${articleId}`,a,'PUT',{})).json();
  const again=await (await client.write(`/me/bookmarks/${articleId}`,a,'PUT',{})).json();assert.deepEqual(first.data,again.data);
  assert.equal((await client.request('/auth/logout',a,'POST',{})).status,403);
  assert.equal((await client.request('/auth/logout',a)).status,404);
  assert.equal((await client.write('/staff/articles/example/publish',a,'POST',{})).status,403);
}
