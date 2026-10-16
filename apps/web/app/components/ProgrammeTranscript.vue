<script setup lang="ts">
import type { Programme } from '../../../../packages/contracts/src/programme';
import { audioTime,useProgrammeAudio } from '../composables/useProgrammeAudio';
const props=defineProps<{programme:Programme;videoMode?:boolean;activeSegmentId?:string}>();const emit=defineEmits<{seek:[seconds:number]}>();const player=useProgrammeAudio();const route=useRoute();
function seek(seconds:number){if(props.videoMode)emit('seek',seconds);else{if(player.programme.value?.renditionKey===props.programme.renditionKey)player.seek(seconds);else player.setProgramme(props.programme,seconds);void player.play();}}
</script>
<template>
  <section class="programme-transcript" aria-labelledby="transcript-title"><h2 id="transcript-title">Transcript &amp; sources</h2><p>{{ programme.syntheticDisclosure }} · Version-bound recording: {{ programme.programmeId }}</p><a href="#programme-sources">Jump to complete sources ({{ programme.sources.length }})</a>
    <details open><summary>Read the complete transcript</summary><ol class="transcript-turns"><li v-for="segment in programme.segments" :key="segment.id" :id="`turn-${segment.id}`" :aria-current="activeSegmentId===segment.id?'true':undefined"><p class="metadata">{{ audioTime(segment.startMs/1000) }} · {{ segment.speakerId==='ada'?'Ada · synthetic presenter':segment.speakerId==='eli'?'Eli · synthetic presenter':segment.speakerId==='clip'?'Original fictional clip':'Programme' }}</p><p>{{ segment.displayText||segment.text }}</p><p v-if="segment.visual" class="metadata">Visual: {{ segment.visual.alt }} · {{ segment.visual.credit }}</p><NuxtLink :to="{path:`/articles/${segment.articleSlug}`,query:{theme:route.query.theme,fromProgramme:programme.programmeId,fromBlock:segment.blockIds.length===1?segment.blockIds[0]:undefined},hash:segment.blockIds.length===1?`#${segment.blockIds[0]}`:'#sources'}">Read this section and evidence</NuxtLink><div class="citations"><a v-for="id in segment.sourceIds" :key="id" :href="`#programme-source-${id}`">[{{ programme.sources.find(s=>s.id===id)?.ordinal }}]</a></div><ControlButton :label="videoMode?'Watch from here':'Listen from here'" variant="quiet" @click="seek(segment.startMs/1000)"/></li></ol></details>
    <section id="programme-sources" class="bibliography"><h2>Sources and evidence</h2><ol><li v-for="source in programme.sources" :id="`programme-source-${source.id}`" :key="source.id" :value="source.ordinal" class="source-entry"><h3>{{ source.title }}</h3><p>{{ source.publisher }}</p><a :href="source.url">Open original source ↗</a><p class="metadata">Fictional example-domain evidence. Original item URL retained.</p></li></ol></section>
  </section>
</template>



