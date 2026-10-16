<script setup lang="ts">
import { onMounted,onBeforeUnmount,ref } from 'vue';
import { useProgrammeAudio,audioTime } from '../composables/useProgrammeAudio';
const player=useProgrammeAudio();const {programme,playing,position,error}=player;const element=ref<HTMLAudioElement|null>(null);let cleanup:(()=>void)|undefined;
onMounted(async()=>{if(element.value)cleanup=player.bind(element.value);try{const response=await $fetch<{data:{anchorCount?:number;playbackSpeed?:number}}>('/api/v1/me/preferences');player.applyPreferences(response.data);}catch{/* Anonymous listening has no account requirement. */}});onBeforeUnmount(()=>cleanup?.());
</script>
<template>
  <audio ref="element" data-programme-audio preload="metadata" />
  <MemberProgressSync />
  <aside v-if="programme&&$route.path!=='/clips'" class="audio-mini shell" aria-label="Current programme">
    <div><span class="eyebrow">{{ programme.kind==='radio'?'Radio':'Newsroom' }}</span><strong>{{ programme.title }}</strong><span>{{ audioTime(position) }} · {{ playing?'Playing':'Paused' }}</span></div>
    <div class="audio-actions"><MediaKey :icon="playing?'pause':'play'" :label="playing?'Pause':'Play'" @click="playing?player.pause():player.play()"/><MediaKey label="Forward 15 seconds" icon="forward" @click="player.seek(position+15)"/><MediaKey label="Next story" icon="next" @click="player.nextChapter(1)"/><NuxtLink aria-label="Queue" to="/radio#queue"><ControlIcon name="queue"/></NuxtLink><NuxtLink :to="{path:programme.kind==='radio'?'/radio':'/newsroom',query:{programme:programme.programmeId}}">Open player</NuxtLink></div>
    <progress class="mini-progress" :value="position" :max="player.duration.value||1" aria-label="Programme progress"/><p v-if="error" role="status">{{ error }}</p>
  </aside>
</template>
<style src="../assets/programme.css"></style>

<style scoped>
.mini-progress{position:absolute;bottom:0;left:0;width:100%;height:3px;accent-color:#e2c690}.audio-mini{border:1px solid #536757;border-radius:7px;background:linear-gradient(110deg,#203e32,#163127);color:#f0e8d1;box-shadow:inset 0 1px #7e958650,0 3px 0 #10251d;padding-left:28px;position:relative}.audio-mini:before{content:'';position:absolute;left:10px;top:16px;bottom:16px;width:7px;background:radial-gradient(#071b12 1px,transparent 1.2px);background-size:3px 3px}.audio-mini .eyebrow{color:#e2c690}.audio-mini a{color:#f3d89e}.audio-mini .audio-actions{--surface:#eee4cd;--text:#233d2d;--borderControl:#a6b098;--brand:#e1c38b;--onBrand:#173126;--focus:#f7d08c}
</style>

