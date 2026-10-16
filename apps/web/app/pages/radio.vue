<script setup lang="ts">
import type { Programme } from '../../../../packages/contracts/src/programme';
import {programmeBoundary,storyAnchor,type StoryAnchor} from '../../../../packages/contracts/src/programme-navigation';
import { useProgrammeAudio,audioTime } from '../composables/useProgrammeAudio';
const {data,error}=await useFetch<{data:Programme[]}>('/api/v1/programmes');const programmes=computed(()=>(data.value?.data||[]).filter(p=>p.kind==='radio'));
const route=useRoute();const selected=ref(String(route.query.programme||''));const player=useProgrammeAudio();const {programme,queue,sleep,resume,storageAvailable}=player;
const choice=computed(()=>selected.value?programmes.value.find(p=>p.programmeId===selected.value):programmes.value.find(p=>p.variant==='full'&&p.articleSlugs.length>1)||programmes.value.find(p=>p.variant==='full')||programmes.value[0]);
const handoff=ref(true);const requestedStart=computed(()=>handoff.value&&choice.value&&typeof route.query.story==='string'&&typeof route.query.version==='string'?programmeBoundary(choice.value,{slug:route.query.story,versionId:route.query.version,blockId:typeof route.query.block==='string'?route.query.block:undefined}):0);
watch(choice,value=>{if(value&&!selected.value)selected.value=value.programmeId;},{immediate:true});
const active=computed(()=>programme.value?.kind==='radio'&&programme.value.programmeId===choice.value?.programmeId?programme.value:choice.value);
const anchor=computed<StoryAnchor|undefined>(previous=>{const next=active.value?storyAnchor(active.value,programme.value?.renditionKey===active.value.renditionKey?player.position.value:0):undefined;return previous&&next&&previous.slug===next.slug&&previous.versionId===next.versionId&&previous.blockId===next.blockId?previous:next;});const queueList=useQueueAnimation();
const editionOptions=computed(()=>programmes.value.map(p=>({value:p.programmeId,label:p.title+' — '+p.variant})));
const queueKeys=new WeakMap<Programme,string>();let keySequence=0;function queueKey(item:Programme){let key=queueKeys.get(item);if(!key){key=`queue-${++keySequence}`;queueKeys.set(item,key);}return key;}
function addQueue(){if(choice.value)queue.value.push({...choice.value});}
watch([programmes,player.savedQueueIds],()=>player.restoreQueue(programmes.value));onMounted(async()=>{player.restoreQueue(programmes.value);if(route.query.programme&&choice.value&&requestedStart.value!==null)player.setProgramme(choice.value,requestedStart.value);try{const response=await $fetch<{data:{playbackSpeed?:number;anchorCount?:number}}>('/api/v1/me/preferences');player.applyPreferences(response.data);}catch{/* Anonymous listening remains available. */}});
function tune(){handoff.value=false;if(choice.value)player.setProgramme(choice.value);}
watch(()=>JSON.stringify([route.query.programme,route.query.story,route.query.version,route.query.block]),()=>{handoff.value=true;selected.value=typeof route.query.programme==='string'?route.query.programme:'';if(choice.value&&route.query.programme&&requestedStart.value!==null)player.setProgramme(choice.value,requestedStart.value);});
function start(){if(!choice.value||requestedStart.value===null)return;if(programme.value?.renditionKey!==choice.value.renditionKey)player.setProgramme(choice.value,requestedStart.value);void player.play();}
async function move(index:number,by:number){const items=[...queue.value];const item=items[index],other=items[index+by];const list=queueList.value instanceof Element?queueList.value:undefined;const focused=document.activeElement instanceof HTMLElement&&list?.contains(document.activeElement);if(item&&other){items[index]=other;items[index+by]=item;queue.value=items;await nextTick();if(focused){const row=list?.children[index+by];const buttons=row?.querySelectorAll<HTMLButtonElement>('button');const preferred=buttons?.[by<0?0:1];(preferred&&!preferred.disabled?preferred:row?.querySelector<HTMLButtonElement>('button:not(:disabled)'))?.focus();}}}
function restore(){const saved=resume.value;const p=programmes.value.find(p=>p.programmeId===saved?.id);if(p&&saved){selected.value=p.programmeId;player.setProgramme(p,Math.min(saved.position,p.durationMs/1000));}else player.error.value='That earlier recording is no longer available. Select a current edition.';}
useHead({title:'Radio — The Aggregator'});
</script>
<template>
  <main id="main" class="shell programme-page"><header class="programme-heading"><p class="eyebrow">The listening edition</p><h1>Radio</h1><p class="deck">The paper, read aloud. Real local synthetic narration of our fictional edition, with the full transcript and original sources close at hand.</p></header>
    <p v-if="error||!programmes.length" class="media-unavailable">No ready recordings are available. The written newspaper remains open. Start the local programme build before listening.</p>
    <template v-else>
    <p v-if="!choice||requestedStart===null" role="status">This recording is not prepared for the requested story version. Choose an available edition explicitly.</p><RadioReceiver v-if="active&&requestedStart!==null" :programme="active" />
    <StoryFormats v-if="anchor" :slug="anchor.slug" :version-id="anchor.versionId" :block-id="anchor.blockId" /><section class="radio-selection" aria-label="Edition and listening options"><ControlSelect v-model="selected" class="edition-choice" label="Edition preset" :options="editionOptions" @change="tune"/><div class="audio-actions"><ControlButton label="Play selected edition" :disabled="!choice||requestedStart===null" variant="primary" @click="start"/><ControlButton label="Add to guest queue" @click="addQueue"/></div><div class="audio-options"><ControlSelect label="Speed" :model-value="player.rate.value" :options="[.75,1,1.25,1.5].map(value=>({value,label:value+'×'}))" @update:model-value="player.setRate"/><ControlSelect label="Sleep timer" :model-value="sleep" :options="[{value:'off',label:'Off'},{value:'15',label:'15 minutes'},{value:'30',label:'30 minutes'},{value:'60',label:'60 minutes'},{value:'story',label:'End of this story'}]" @update:model-value="player.setSleep"/></div><p class="metadata">Sleep deadlines are checked during media events and when the page returns. An operating system suspension can delay a stop.</p></section>
    <section v-if="resume" class="listening-note"><h2>Pick up where you left off</h2><p>Resume from {{ audioTime(resume.position) }}. Reloading never starts sound automatically.</p><ControlButton label="Load saved position" @click="restore"/></section><p v-if="!storageAvailable" role="status">Browser storage is unavailable. Playback works; your guest history lasts only for this page.</p>
    <section class="programme-queue"><h2>Guest listening queue</h2><p>This player queue is separate from your account queue. Signing in does not upload guest history. Use <NuxtLink to="/library">My library</NuxtLink> for your durable account queue.</p><p v-if="!queue.length">Choose an edition above to add it.</p><ol ref="queueList"><li v-for="(item,index) in queue" :key="queueKey(item)"><span>{{ item.title }}</span><div class="audio-actions"><ControlButton label="Move up" :disabled="index===0" @click="move(index,-1)"/><ControlButton label="Move down" :disabled="index===queue.length-1" @click="move(index,1)"/><ControlButton label="Remove" @click="queue.splice(index,1)"/></div></li></ol><ControlButton label="Clear guest queue and history" @click="player.clearHistory"/></section>
    <ProgrammeTranscript v-if="active" :programme="active"/></template>
  </main>
</template>

<style scoped>
.programme-heading{max-width:790px;margin-inline:auto}.radio-selection{max-width:790px;margin:32px auto 40px;border-block:1px solid var(--borderSubtle);padding:20px 0}.edition-choice select{min-width:0;width:100%}.edition-choice{display:grid;gap:8px;margin-bottom:14px}.radio-selection .audio-options{margin-block:16px}.radio-selection .metadata{margin-bottom:0}.programme-queue,.listening-note,.programme-transcript{max-width:790px;margin-inline:auto}.programme-heading .deck{font-size:16px;max-width:660px}.programme-heading h1{margin-bottom:10px}
</style>







