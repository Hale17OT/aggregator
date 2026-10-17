<script setup lang="ts">
type GoogleApi={accounts:{id:{initialize:(options:Record<string,unknown>)=>void;renderButton:(element:HTMLElement,options:Record<string,unknown>)=>void;cancel:()=>void}}};
const host=ref<HTMLElement>(),ready=ref(false),busy=ref(false),error=ref('');
const member=useMember(),route=useRoute();let attempt='',csrf='',generation=0,disposed=false;
const google=()=> (window as Window & {google?:GoogleApi}).google;
async function prepare(){
 const mine=++generation;error.value='';ready.value=false;
 try{
  const configuration=(await $fetch<{data:{origin:string}}>('/api/v1/auth/google/config')).data;
  if(location.origin!==configuration.origin){error.value='Google sign-in uses the local address 127.0.0.1:3000. Open this page there to continue.';return;}
  csrf=(await $fetch<{data:{csrfToken:string}}>('/api/v1/auth/preflight')).data.csrfToken;
  const data=(await $fetch<{data:{id:string;nonce:string;serverClientId:string}}>('/api/v1/auth/google/start',{method:'POST',headers:{'X-CSRF-Token':csrf},body:{action:'sign-in'}})).data;
  if(disposed||mine!==generation)return;attempt=data.id;
  if(!google())await new Promise<void>((resolve,reject)=>{
   const script=document.createElement('script');script.src='https://accounts.google.com/gsi/client';script.async=true;
   const timeout=setTimeout(()=>{script.remove();reject(new Error('Google unavailable'));},10000);
   script.onload=()=>{clearTimeout(timeout);resolve();};script.onerror=()=>{clearTimeout(timeout);reject(new Error('Google unavailable'));};document.head.append(script);
  });
  if(disposed||mine!==generation||!host.value)return;
  google()!.accounts.id.initialize({client_id:data.serverClientId,nonce:data.nonce,auto_select:false,callback:async(response:{credential:string})=>{
   if(disposed||mine!==generation||busy.value)return;busy.value=true;
   try{
    await $fetch('/api/v1/auth/google/exchange',{method:'POST',headers:{'X-CSRF-Token':csrf},body:{id:data.id,credential:response.credential}});
    if(disposed||mine!==generation)return;
    attempt='';await member.refresh();window.dispatchEvent(new Event('aggregator:signed-in'));
    const interests=(await $fetch<{data:{status:string}}>('/api/v1/me/interests')).data;
    const destination=takeReaderReturn()||readerReturn(route.query.returnTo)||'/profile';
    await navigateTo(interests.status==='not_started'?{path:'/interests',query:{setup:'1',returnTo:destination}}:destination);
   }catch{error.value='Google sign-in could not be completed. Start a fresh attempt.';ready.value=false;}finally{busy.value=false;}
  }});
  host.value.replaceChildren();google()!.accounts.id.renderButton(host.value,{type:'standard',theme:'outline',size:'large',text:'continue_with'});ready.value=true;
 }catch{error.value='Google sign-in is unavailable. Your existing account has not changed.';}
}
onMounted(prepare);
onBeforeUnmount(()=>{disposed=true;generation++;google()?.accounts.id.cancel();if(attempt)void $fetch('/api/v1/auth/google/cancel',{method:'POST',headers:{'X-CSRF-Token':csrf},body:{id:attempt}}).catch(()=>{});});
</script>
<template><section aria-label="Google sign-in"><div ref="host" :inert="busy||!ready"/><p v-if="busy" role="status">Completing sign-in…</p><p v-if="error" role="alert">{{ error }}</p><button v-if="error" class="control" :disabled="busy" @click="prepare">Start again</button></section></template>
