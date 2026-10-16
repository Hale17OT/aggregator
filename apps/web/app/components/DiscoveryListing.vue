<script setup lang="ts">
import type { PublicArticle } from '../../../../packages/contracts/src/index';
const props=defineProps<{desk?:string}>();
const route=useRoute();
const query=computed(()=>({q:typeof route.query.q==='string'?route.query.q:'',topic:props.desk||(typeof route.query.topic==='string'?route.query.topic:''),page:typeof route.query.page==='string'?route.query.page:'1',limit:'6'}));
const {data,error}=await useFetch<{data:PublicArticle[];meta:{total:number;page:number;pages:number;topics:{name:string;slug:string}[]}}>('/api/v1/discover',{query});
const topicDraft=ref(query.value.topic);watch(()=>query.value.topic,value=>topicDraft.value=value);
const title=computed(()=>props.desk?(data.value?.meta.topics.find(t=>t.slug===props.desk)?.name||'Desk unavailable'):'Search the paper');
const pageLink=(page:number)=>({path:route.path,query:{...route.query,...(query.value.q?{q:query.value.q}:{}),page:String(page)}});
function submit(event:Event){const form=new FormData(event.target as HTMLFormElement);void navigateTo({path:route.path,query:Object.fromEntries([...form.entries()].map(([key,value])=>[key,String(value)]))});}
useHead({title:computed(()=>`${title.value} — The Aggregator`)});
</script>
<template>
  <main id="main" class="shell discovery" tabindex="-1">
    <p class="eyebrow">The fictional edition · {{ desk?'Desk':'Discovery' }}</p><h1>{{ title }}</h1>
    <p v-if="desk" class="deck">Reviewed fictional dispatches from Alderwick. Each story retains its own version, evidence and original-item links.</p>
    <form :action="route.path" method="get" class="discovery-filters" role="search" @submit.prevent="submit">
      <label>Search words<input name="q" type="search" :value="query.q" maxlength="120" placeholder="Try rain gardens"></label>
      <ControlSelect v-if="!desk" label="Desk" name="topic" v-model="topicDraft" :options="[{value:'',label:'All desks'},...(data?.meta.topics||[]).map(t=>({value:t.slug,label:t.name}))]"/>
      <input v-if="route.query.theme==='dark'" type="hidden" name="theme" value="dark">
      <button class="control control--primary" type="submit">Search</button><NuxtLink class="control control--quiet" :to="route.path">Clear filters</NuxtLink>
    </form>
    <nav class="discovery-desks" aria-label="Browse desks"><NuxtLink :to="{path:'/search',query:{theme:route.query.theme}}">All desks</NuxtLink><NuxtLink v-for="topic in data?.meta.topics" :key="topic.slug" :to="{path:`/topics/${topic.slug}`,query:{theme:route.query.theme}}">{{ topic.name }}</NuxtLink></nav>
    <section v-if="error" role="alert"><h2>Search unavailable</h2><p>{{ error.statusCode===422?'Check the search length and page number.':'The reading service could not return results. Please try again.' }}</p><NuxtLink :to="route.path">Reset and retry</NuxtLink></section>
    <template v-else><p class="metadata" role="status">{{ data?.meta.total||0 }} reviewed fictional stories{{ query.q?` matching “${query.q}”`:'' }} · Page {{ data?.meta.page||1 }}</p>
      <p v-if="!data?.data.length">No stories match these filters. Try fewer words or another desk.</p>
      <div class="discovery-results"><StoryBrief v-for="article in data?.data" :key="article.id" :article="article" summary /></div>
      <nav class="discovery-pagination" aria-label="Search pages"><NuxtLink v-if="data && data.meta.page>1" class="control control--secondary" :to="pageLink(data.meta.page-1)">Previous page</NuxtLink><NuxtLink v-if="data && data.meta.page<data.meta.pages" class="control control--secondary" :to="pageLink(data.meta.page+1)">Next page</NuxtLink></nav>
    </template>
  </main>
</template>
<style scoped>
.discovery{max-width:1000px;padding-block:2rem 5rem}.discovery h1{font-size:clamp(2rem,5vw,3.5rem);margin:.5rem 0 1rem}.discovery-filters{display:flex;align-items:end;gap:1rem;flex-wrap:wrap;padding-block:1.5rem;border-block:1px solid var(--borderSubtle)}.discovery-filters label{display:grid;gap:.5rem;flex:1 1 12rem}.discovery-filters input,.discovery-filters select{box-sizing:border-box;width:100%;min-height:44px;background:var(--surface);color:inherit;border:1px solid currentColor;padding:.6rem;font:inherit;border-radius:2px}.discovery-desks,.discovery-pagination{display:flex;gap:1.2rem;flex-wrap:wrap;margin-block:1.5rem}.discovery-results{max-width:760px}.discovery-results :deep(.story-brief){padding-block:1rem}.discovery-results :deep(h3){font-size:1.55rem}.discovery-results :deep(.brief-summary){max-width:none}
</style>
