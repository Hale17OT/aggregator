<script setup lang="ts">
const route=useRoute();
const theme=computed(()=>route.query.theme==='dark'?'dark':'light');
useHead({htmlAttrs:{'data-theme':theme}});
const home=computed(()=>({path:'/',query:{theme:theme.value}}));
const themeUrl=computed(()=>({path:route.path,query:{...route.query,theme:theme.value==='light'?'dark':'light'},hash:route.hash}));
</script>
<template>
  <header class="masthead shell">
    <div class="utility-row"><span>Independent perspectives. Clear sources.</span><NuxtLink :to="themeUrl">{{ theme==='light'?'Dark theme':'Light theme' }}</NuxtLink></div>
    <div class="masthead-name"><NuxtLink class="wordmark" :to="home">The Aggregator</NuxtLink></div>
    <nav class="topic-nav" aria-label="Edition sections"><NuxtLink :to="home">Home</NuxtLink><NuxtLink :to="{...home,hash:'#culture'}">Culture</NuxtLink><NuxtLink :to="{...home,hash:'#latest'}">Latest updates</NuxtLink><NuxtLink :to="{...home,hash:'#briefing'}">The briefing</NuxtLink></nav>
    <div class="edition-line"><span>Thursday, 8 October 2026</span><span>Fictional development edition · not live news</span></div>
  </header>
</template>
