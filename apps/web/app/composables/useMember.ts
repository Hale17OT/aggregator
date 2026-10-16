import type { SessionView } from '../../../../packages/contracts/src/member';
export function useMember(){
  const session=useState<SessionView|null>('member-session',()=>null);const checked=useState('member-checked',()=>false);
  async function refresh(){if(import.meta.server)return;try{session.value=(await $fetch<{data:SessionView}>('/api/v1/me/session')).data;}catch{session.value=null;}checked.value=true;return session.value;}
  async function mutate<T>(path:string,method:'POST'|'PUT'|'PATCH'|'DELETE',body:unknown):Promise<T>{
    if(!session.value)await refresh();if(!session.value)throw new Error('Sign in to save account changes.');
    return await $fetch<T>(path,{method,body:body as Record<string,unknown>,headers:{'X-CSRF-Token':session.value.csrfToken}});
  }
  async function logout(){await mutate('/api/v1/auth/logout','POST',{});session.value=null;checked.value=true;window.dispatchEvent(new Event('account-logout'));window.dispatchEvent(new Event('aggregator:clear-history'));clearNuxtData();await navigateTo('/');}
  return{session,checked,refresh,mutate,logout};
}
export function memberError(error:unknown){const status=(error as {statusCode?:number}).statusCode;return status===409?'Another change was saved first. Reload and try again.':status===401?'Your session has ended. Sign in again.':status===422?'Check the values and try again.':'The change could not be saved. Please retry.';}
