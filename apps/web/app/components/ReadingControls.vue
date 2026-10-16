<script setup lang="ts">
withDefaults(defineProps<{variant:'standard'|'brief';sourceCount:number;evidenceTarget?:string}>(),{evidenceTarget:'#claim-3'});
const route=useRoute();
</script>
<template>
  <div class="article-toolbar" aria-label="Article controls">
    <nav aria-label="Reading length" class="variant-control">
      <NuxtLink v-for="option in (['standard','brief'] as const)" :key="option" class="control control--segment" :aria-current="variant===option?'page':'false'" :to="{path:route.path,query:{...route.query,variant:option},hash:'#article-header'}"><span class="control-content"><ControlIcon name="check" :class="{'selection-mark--empty':variant!==option}" />{{ option==='standard'?'Standard':'Brief' }}</span></NuxtLink>
    </nav>
    <a class="control control--secondary sources-jump" href="#sources"><span class="control-content">Sources ({{ sourceCount }})<ControlIcon name="down" /></span></a>
    <a class="control control--primary" :href="evidenceTarget"><span class="control-content"><ControlIcon name="evidence" />Inspect evidence</span></a>
    <CopyArticleLink />
  </div>
</template>
