<script setup lang="ts">
import type { PublicArticle } from '../../../../packages/contracts/src/index';
const route=useRoute(),router=useRouter();
type Edition={data:{article:PublicArticle|null;reason:{label:string;target:string}|null;status:string}[];meta:{q:string;topic:string;token:string;page:number;pages:number;total:number;cutoff:string;newEditionAvailable:boolean}};
const mode=computed(()=>route.query.mode==='following'?'following':'editorial');
const endpoint=computed(()=>mode.value==='following'?'/api/v1/me/edition':'/api/v1/edition');
const {data,error,status,refresh}=await useFetch<{data:Edition}>(endpoint,{query:computed(()=>({page:route.query.page||1,edition:route.query.edition||undefined,q:route.query.q||undefined,topic:route.query.topic||undefined}))});
const lastGood=shallowRef(data.value);watch(data,value=>{if(value)lastGood.value=value;});
const edition=computed(()=>data.value?.data||lastGood.value?.data);
const turnPreview=shallowRef<Edition|null>(null);
const articles=computed(()=>(turnPreview.value||edition.value)?.data.flatMap(s=>s.article?[s.article]:[])||[]);
const spread=ref<HTMLElement|null>(null),turning=ref(false),notice=ref('');let fold:ReturnType<typeof paperFold>|undefined,turnGeneration=0,navigating=false;
const pageUrl=(page:number)=>({path:'/',query:{...route.query,page:String(page),edition:edition.value?.meta.token}});
async function turn(event:MouseEvent,page:number){if(event.ctrlKey||event.metaKey||event.shiftKey||event.altKey||event.button!==0)return;event.preventDefault();if(turning.value){cancelTurn();await nextTick();}const generation=++turnGeneration;turning.value=true;notice.value='Loading headlines…';try{
 const loaded=await $fetch<{data:Edition}>(endpoint.value,{query:{page,edition:edition.value?.meta.token,q:route.query.q,topic:route.query.topic}});
 if(generation!==turnGeneration)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches||document.documentElement.dataset.reduceMotion==='true';
 if(spread.value&&!reduced){fold=paperFold(spread.value,page>(edition.value?.meta.page||1)?1:-1);turnPreview.value=loaded.data;await nextTick();fold.start();await fold.finished;if(generation!==turnGeneration)return;}
 if(generation!==turnGeneration)return;navigating=true;await navigateTo(pageUrl(page));navigating=false;if(generation!==turnGeneration)return;data.value=loaded;turnPreview.value=null;await nextTick();document.getElementById('headline-heading')?.focus();notice.value=`Headline page ${page}`;
 }catch{notice.value='The next headlines could not load. Your current page is unchanged. Try again.';}finally{if(generation===turnGeneration){releaseTurnAnimation();turning.value=false;}}}
function releaseTurnAnimation(){fold?.cancel();fold=undefined;}
function cancelTurn(){turnPreview.value=null;turnGeneration++;releaseTurnAnimation();turning.value=false;}
function interrupt(e:KeyboardEvent){if(e.key==='Escape')cancelTurn();}
onMounted(()=>{window.addEventListener('resize',cancelTurn);window.addEventListener('keydown',interrupt);});onBeforeUnmount(()=>{window.removeEventListener('resize',cancelTurn);window.removeEventListener('keydown',interrupt);});
onBeforeRouteLeave(cancelTurn);onBeforeRouteUpdate(()=>{if(!navigating)cancelTurn();});onBeforeUnmount(cancelTurn);
onMounted(async()=>{if(route.query.mode!==undefined||route.query.q||route.query.topic)return;try{const p=(await $fetch<{data:{homeMode:string}}>('/api/v1/me/preferences')).data;if(p.homeMode==='following'&&route.path==='/'&&route.query.mode===undefined)await navigateTo({path:'/',query:{mode:'following'}});}catch{/* Anonymous readers keep Top stories. */}});
const filters=computed(()=>({q:String(route.query.q||''),topic:String(route.query.topic||'')}));
const {data:desks}=await useFetch<{meta:{topics:{name:string;slug:string}[]}}>('/api/v1/discover');
function scopeUrl(change:Record<string,string|undefined>){return {path:'/',query:{...route.query,page:undefined,edition:undefined,...change}};}
function searchSubmit(e:Event){const form=new FormData(e.target as HTMLFormElement);void navigateTo(scopeUrl({q:String(form.get('q')||'')||undefined}));}
const lead=computed(()=>articles.value[0]);


const href=(slug:string)=>`/articles/${slug}?theme=${route.query.theme==='dark'?'dark':'light'}`;
useHead({title:'The Aggregator — fictional edition'});
</script>
<template>
  <main id="main" class="shell home" tabindex="-1">
    <nav class="edition-discovery" aria-label="Browse desks"><NuxtLink :to="scopeUrl({topic:undefined})">All desks</NuxtLink><NuxtLink v-for="desk in desks?.meta.topics" :key="desk.slug" :to="scopeUrl({topic:desk.slug})" :aria-current="filters.topic===desk.slug?'page':undefined">{{ desk.name }}</NuxtLink></nav>
    <form action="/" method="get" class="edition-search" role="search" @submit.prevent="searchSubmit"><label>Search the paper<input type="search" name="q" :value="filters.q" maxlength="120" placeholder="Search all eligible stories"></label><input v-if="filters.topic" type="hidden" name="topic" :value="filters.topic"><input v-if="mode==='following'" type="hidden" name="mode" value="following"><button type="submit" class="control">Search</button><NuxtLink v-if="filters.q" :to="scopeUrl({q:undefined})">Clear query</NuxtLink><NuxtLink v-if="filters.topic" :to="scopeUrl({topic:undefined})">Clear category</NuxtLink></form>
    <p class="metadata" role="status"><BrandLoading v-if="status==='pending'" />{{ edition?.meta.total||0 }} matching stories<span v-if="edition?.meta.q"> · “{{ edition.meta.q }}”</span><span v-if="edition?.meta.topic"> · {{ edition.meta.topic }}</span><span v-if="status==='pending'"> · Loading requested scope; previous spread remains visible.</span></p>
    <section v-if="error" role="alert"><h1>The edition could not load</h1><p>The requested edition is unavailable or expired. Any previous spread below retains its previous scope.</p><button class="control" @click="refresh()">Retry</button><NuxtLink :to="scopeUrl({})">Open a new edition</NuxtLink></section>
    <section v-if="!lead&&!error"><h1>{{ mode==='following'?'No matching coverage yet':'No reviewed synthesis is ready' }}</h1><p>Your interests are saved independently of coverage. We do not invent stories to fill your feed.</p><NuxtLink to="/interests">Manage interests</NuxtLink> · <NuxtLink to="/">Explore Top stories</NuxtLink></section>
    <template v-if="lead">
      <nav class="member-actions" aria-label="Headline edition"><NuxtLink :to="scopeUrl({mode:undefined})">Top stories</NuxtLink><NuxtLink :to="scopeUrl({mode:'following'})">For you</NuxtLink><NuxtLink to="/interests">Manage interests</NuxtLink></nav><h2 id="headline-heading" tabindex="-1" class="section-label">{{ mode==='following'?'For you':'Top stories' }} · Page {{ edition?.meta.page }} of {{ edition?.meta.pages }}</h2><p class="metadata">Edition cutoff {{ edition?.meta.cutoff }} · Fictional coverage</p><p v-if="edition?.meta.newEditionAvailable">Coverage or your interests changed. <NuxtLink :to="{path:'/',query:{mode}}">Open a new edition</NuxtLink>; this edition stays ordered.</p><p v-for="slot in edition?.data.filter(s=>!s.article)" :key="String(slot)" role="status">A story in this edition is no longer available.</p><div class="paper-stage"><div ref="spread" class="headline-spread">
<div class="home-grid">
        <section class="lead"><p class="eyebrow">{{ lead.topic }} / In focus</p><EditorialMedia v-if="lead.leadMedia" :media="lead.leadMedia" compact priority :linked-to="href(lead.slug)" /><h1><NuxtLink :to="href(lead.slug)">{{ lead.headline }}</NuxtLink></h1><p class="deck">{{ lead.deck }}</p><p class="metadata">{{ lead.sources.length }} sources · 8 October, 14:00 UTC · Mock reporting</p></section>
        <aside id="briefing" class="briefing" aria-labelledby="briefing-title"><h2 id="briefing-title" class="section-label">The briefing</h2><StoryBrief v-for="article in articles.slice(1,3)" :key="article.slug" :article="article" summary /></aside>
        <aside id="latest" class="latest" aria-labelledby="latest-title"><h2 id="latest-title" class="section-label">Latest updates</h2><article v-for="article in articles.slice(3,6)" :key="article.slug" class="update"><time :datetime="article.publishedAt">{{ new Date(article.publishedAt).toLocaleTimeString('en-GB',{timeZone:'UTC',hour:'2-digit',minute:'2-digit'}) }} UTC</time><h3><NuxtLink :to="href(article.slug)">{{ article.headline }}</NuxtLink></h3><p class="metadata">{{ article.correction?'Corrected · ':'' }}{{ article.sources.length }} sources</p></article><div class="editorial-note"><p class="eyebrow">A note on this edition</p><p>One invented town. Twenty-four distinct stories across fourteen desks. Every source and illustration is a clearly labeled fixture.</p></div></aside>
      </div>
      <section v-if="articles.length>6" class="culture-section" aria-label="More in this spread"><h2 class="section-label ruled">Across the edition</h2><div class="culture-grid"><StoryBrief v-for="article in articles.slice(6)" :key="article.slug" :article="article" summary /></div></section></div></div>
      <p v-for="slot in edition?.data.filter(s=>s.reason)" :key="slot.article?.id" class="metadata">{{ slot.article?.headline }} — Because you follow {{ slot.reason?.label }}</p>
      <details v-if="mode==='following'"><summary>Control this edition</summary><div v-for="article in articles" :key="article.id"><h3>{{ article.headline }}</h3><FeedControls :article-id="article.id" :topic="edition?.data.find(s=>s.article?.id===article.id)?.reason?.target"/></div></details>
      <nav class="headline-pagination" aria-label="Headline pages"><a v-if="(edition?.meta.page||1)>1" :href="router.resolve(pageUrl(edition!.meta.page-1)).href" @click="turn($event,edition!.meta.page-1)">Previous headlines</a><span v-else>First page</span><span>Page {{ edition?.meta.page }} / {{ edition?.meta.pages }}</span><a v-if="edition!.meta.page<edition!.meta.pages" :href="router.resolve(pageUrl(edition!.meta.page+1)).href" @click="turn($event,edition!.meta.page+1)">Next headlines →</a><span v-else>End of this edition · <NuxtLink :to="{path:'/',query:{mode}}">Refresh</NuxtLink></span></nav><p role="status">{{ notice }}</p><NuxtLink to="/preferences">Page-turn motion follows your Reduce motion preference</NuxtLink>
    </template>
  </main>
</template>
<style scoped>.home{background:var(--surface)}.paper-stage{position:relative}.headline-spread{min-height:200px}.edition-discovery{display:flex;flex-wrap:wrap;gap:4px 18px;border-block:1px solid var(--borderSubtle);padding-block:8px}.edition-discovery a{font-size:12px;min-height:32px;display:inline-flex;align-items:center}.edition-discovery [aria-current]{font-weight:800}.edition-search{display:flex;align-items:end;flex-wrap:wrap;gap:12px;margin-block:18px}.edition-search label{display:grid;gap:4px;font-size:12px;flex:1}.edition-search input{width:100%;min-height:44px;background:var(--surface);color:var(--text);border:1px solid var(--borderControl);padding:8px;font:inherit}.headline-spread{transform-origin:left center;background:var(--surface)}.headline-pagination{display:flex;justify-content:space-between;gap:1rem;flex-wrap:wrap;padding:1.5rem 0;border-block:1px solid var(--borderSubtle)}.headline-pagination a{min-height:44px;display:inline-flex;align-items:center}</style>
