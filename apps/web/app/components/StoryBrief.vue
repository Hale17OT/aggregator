<script setup lang="ts">
import type { PublicArticle } from '../../../../packages/contracts/src/index';
defineProps<{article:PublicArticle;summary?:boolean;image?:boolean}>();
const route=useRoute();
const href=(slug:string)=>`/articles/${slug}?theme=${route.query.theme==='dark'?'dark':'light'}`;
</script>
<template><article :class="['story-brief',{'image-row':image&&article.leadMedia?.availability==='available'}]">
  <EditorialMedia v-if="image&&article.leadMedia?.availability==='available'" :media="article.leadMedia" compact :linked-to="href(article.slug)" />
  <div><p class="eyebrow">{{ article.correction?'Correction':article.topic }}</p><h3><NuxtLink :to="href(article.slug)">{{ article.headline }}</NuxtLink></h3><p v-if="summary" class="brief-summary">{{ article.deck }}</p><p class="metadata">{{ article.sources.length }} sources · Version {{ article.version }} · Mock reporting</p></div>
</article></template>
