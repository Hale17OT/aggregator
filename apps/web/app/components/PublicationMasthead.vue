<script setup lang="ts">
const route=useRoute();
const saved=ref<{theme:'light'|'dark'|'system';textSize:'small'|'standard'|'large';reduceMotion:boolean}>({theme:'light',textSize:'standard',reduceMotion:false});
const systemDark=ref(false);
const theme=computed(()=>route.query.theme==='dark'?'dark':route.query.theme==='light'?'light':saved.value.theme==='system'?(systemDark.value?'dark':'light'):saved.value.theme);
const textSize=computed(()=>['small','standard','large'].includes(String(route.query.textSize))?String(route.query.textSize):saved.value.textSize);
const reduceMotion=computed(()=>route.query.reduceMotion==='true'?true:route.query.reduceMotion==='false'?false:saved.value.reduceMotion);
useHead({htmlAttrs:{'data-theme':theme,'data-text-size':textSize,'data-reduce-motion':computed(()=>String(reduceMotion.value))}});
const readerQuery=computed(()=>route.query.theme?{theme:theme.value}:{});
const home=computed(()=>({path:'/',query:readerQuery.value}));
const themeUrl=computed(()=>({path:route.path,query:{...route.query,theme:theme.value==='light'?'dark':'light'},hash:route.hash}));
function apply(value:unknown){if(!value||typeof value!=='object')return;const p=value as Record<string,unknown>;if(['light','dark','system'].includes(String(p.theme)))saved.value.theme=p.theme as 'light'|'dark'|'system';if(['small','standard','large'].includes(String(p.textSize)))saved.value.textSize=p.textSize as 'small'|'standard'|'large';if(typeof p.reduceMotion==='boolean')saved.value.reduceMotion=p.reduceMotion;}
let generation=0;async function load(){const current=++generation;try{const response=await $fetch<{data:unknown}>('/api/v1/me/preferences');if(current===generation)apply(response.data);}catch{/* Anonymous presentation retains the accepted defaults. */}}
function changed(event:Event){generation++;apply((event as CustomEvent<unknown>).detail);}
function logout(){generation++;saved.value={theme:'light',textSize:'standard',reduceMotion:false};}
let appearance:MediaQueryList|undefined;function systemChanged(){systemDark.value=appearance?.matches||false;}
onMounted(()=>{appearance=window.matchMedia('(prefers-color-scheme: dark)');systemChanged();appearance.addEventListener('change',systemChanged);void load();window.addEventListener('aggregator:preferences',changed);window.addEventListener('aggregator:signed-in',load);window.addEventListener('account-logout',logout);});
onBeforeUnmount(()=>{appearance?.removeEventListener('change',systemChanged);window.removeEventListener('aggregator:preferences',changed);window.removeEventListener('aggregator:signed-in',load);window.removeEventListener('account-logout',logout);});
</script>
<template>
  <header class="masthead shell">
    <div class="utility-row"><span>Independent perspectives. Clear sources.</span><NuxtLink class="control control--quiet theme-control" aria-current="false" :to="themeUrl"><span class="control-content"><ControlIcon :name="theme==='light'?'moon':'sun'" />{{ theme==='light'?'Dark theme':'Light theme' }}</span></NuxtLink></div>
    <div class="masthead-name"><NuxtLink class="wordmark" :to="home">The Aggregator</NuxtLink></div>
    <nav class="topic-nav" aria-label="Formats"><NuxtLink :to="home">Home</NuxtLink><NuxtLink :to="{path:'/radio',query:readerQuery}">Radio</NuxtLink><NuxtLink :to="{path:'/newsroom',query:readerQuery}">Newsroom</NuxtLink><NuxtLink :to="{path:'/clips',query:readerQuery}">Clips</NuxtLink><NuxtLink :to="{path:'/search',query:readerQuery}">Search</NuxtLink><NuxtLink :to="{path:'/library',query:readerQuery}">Member</NuxtLink></nav>
    <div class="edition-line"><span>Thursday, 8 October 2026</span><span>Fictional development edition · not live news</span></div>
  </header>
</template>
