<script setup lang="ts">
import type {Programme} from '../../../../packages/contracts/src/programme';
import {matchesStory} from '../../../../packages/contracts/src/programme-navigation';
const props=defineProps<{slug:string;versionId:string;blockId?:string}>();
const route=useRoute();const {data,error}=await useFetch<{data:Programme[]}>('/api/v1/programmes');
const available=computed(()=>(data.value?.data||[]).filter(p=>matchesStory(p,{slug:props.slug,versionId:props.versionId})));
const audio=computed(()=>available.value.find(p=>p.kind==='radio'&&p.variant==='full'&&p.articleSlugs.length===1));
const video=computed(()=>available.value.find(p=>p.kind==='broadcast'&&p.videoRendition));
const clips=computed(()=>available.value.filter(p=>p.kind==='clip'&&p.videoRendition));
const returnClip=computed(()=>clips.value.find(p=>p.programmeId===route.query.fromClip));
const returning=computed(()=>available.value.find(p=>p.programmeId===route.query.fromProgramme));const target=(p:Programme)=>({path:p.kind==='radio'?'/radio':'/newsroom',query:{theme:route.query.theme,programme:p.kind==='radio'||p.programmeId===returning.value?.programmeId?p.programmeId:undefined,story:props.slug,version:props.versionId,block:props.blockId||(typeof route.query.fromBlock==='string'?route.query.fromBlock:undefined)}});
</script>
<template>
  <nav class="metadata audio-actions" aria-label="Read listen watch">
    <NuxtLink :to="{path:`/articles/${slug}`,query:{theme:route.query.theme},hash:blockId?`#${blockId}`:undefined}">Read this story</NuxtLink>
    <span v-if="error">Media availability could not be checked.</span><NuxtLink v-if="returning" :to="target(returning)">Return to programme</NuxtLink><NuxtLink v-if="audio" :to="target(audio)">Listen to this story</NuxtLink><span v-else-if="!error">Audio not prepared for this version</span>
    <NuxtLink v-if="video" :to="target(video)">Watch this story</NuxtLink><span v-else-if="!error">Video not prepared for this version</span>
    <span>Opens paused at the matching section or story start.</span>
    <NuxtLink v-for="clip in clips" :key="clip.programmeId" :to="`/clips/${clip.programmeId}`">Clips · {{ Math.round(clip.durationMs/1000) }}s</NuxtLink>
    <NuxtLink v-if="returnClip" :to="`/clips/${returnClip.programmeId}`">Return to Clip, paused</NuxtLink>
  </nav>
</template>



