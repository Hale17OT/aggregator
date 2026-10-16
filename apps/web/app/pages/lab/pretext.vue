<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue';
const title=ref<HTMLElement|null>(null);
const result=ref<Record<string,unknown>>({state:'css-only'});
const route=useRoute();
let observer:ResizeObserver|undefined;
let cleanup:()=>void=()=>{};
let stopped=false;
onMounted(async()=>{
  try {
    if(route.query.fail==='library')throw new Error('simulated library loading failure');
    const pretext=await import('@chenglou/pretext');
    await document.fonts.ready;
    if(stopped||!title.value)return;
    const cache=new Map<string,ReturnType<typeof pretext.prepare>>();
    const measure=()=>{
      if(stopped||!title.value)return;
      const element=title.value;const style=getComputedStyle(element);const content=element.textContent||'';
      const font=`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
      const key=JSON.stringify([content,font,style.letterSpacing,document.documentElement.lang]);
      const start=performance.now();
      let prepared=cache.get(key);if(!prepared){prepared=pretext.prepare(content,font,{letterSpacing:parseFloat(style.letterSpacing)||0});if(cache.size>=32)cache.clear();cache.set(key,prepared);}
      const predicted=pretext.layout(prepared,element.clientWidth,parseFloat(style.lineHeight));
      const duration=performance.now()-start;
      const actual=element.getBoundingClientRect().height;
      result.value={state:'measured',width:element.clientWidth,nativeHeight:actual,predictedHeight:predicted.height,errorPx:predicted.height-actual,durationMs:duration,font,cacheSize:cache.size};
    };
    const invalidate=()=>{cache.clear();pretext.clearCache();measure();};
    observer=new ResizeObserver(measure);observer.observe(title.value);
    document.fonts.addEventListener('loadingdone',invalidate);
    cleanup=()=>document.fonts.removeEventListener('loadingdone',invalidate);
    measure();
  }catch{result.value={state:'css-fallback',reason:'Measurement unavailable; normal HTML remains visible.'};}
});
onBeforeUnmount(()=>{stopped=true;observer?.disconnect();cleanup();});
</script>
<template><main id="main" class="shell" tabindex="-1"><p class="eyebrow">Development experiment / not adopted in reading layouts</p><h1>CSS and Pretext comparison</h1><div class="measurement-card"><h2 ref="title" id="measured-title">Why a six-week evening shuttle experiment across Alderwick’s library, riverside workshop and North Quay cannot yet tell us how many different people will use the route</h2></div><pre id="measurement-result">{{ JSON.stringify(result,null,2) }}</pre><p>CSS always renders this title. Measurement does not change its size or position.</p></main></template>
<style scoped>.measurement-card{width:100%;max-width:720px}#measured-title{font:500 24px/30px 'Newsreader Variable',Georgia,serif;overflow-wrap:break-word;margin:0}pre{white-space:pre-wrap;overflow-wrap:anywhere}</style>
