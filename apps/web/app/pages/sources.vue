<script setup lang="ts">
import type { PublicArticle } from '../../../../packages/contracts/src/index';
const {data,error}=await useFetch<{data:PublicArticle[]}>('/api/v1/articles');
const publishers=computed(()=>[...new Set(data.value?.data.flatMap(a=>a.sources.map(s=>s.publisher))||[])].sort());
useHead({title:'Source directory — The Aggregator'});
</script>
<template><main id="main" class="shell member-page"><h1>Source directory</h1><p>These are fictional source identities in the local demonstration. Names are not quality scores or endorsements. <NuxtLink to="/methodology">Read the methodology</NuxtLink>.</p><p v-if="error">The current directory could not load. <a href="/sources">Retry</a>.</p><section v-for="publisher in publishers" :key="publisher"><h2>{{ publisher }}</h2><ul><template v-for="article in data?.data" :key="article.id"><li v-for="source in article.sources.filter(s=>s.publisher===publisher)" :key="article.id+source.id"><a :href="source.url" rel="noreferrer">{{ source.title }}</a> · {{ source.availability }} · <NuxtLink :to="`/articles/${article.slug}#source-${source.ordinal}`">Citation and context</NuxtLink></li></template></ul></section></main></template>
