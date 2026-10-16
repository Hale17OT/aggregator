<script setup lang="ts">
import { useProgrammeAudio,audioTime } from '../composables/useProgrammeAudio';
const player=useProgrammeAudio();const {programme,position,duration,playing,waiting,rate,volume,error}=player;
</script>
<template>
  <section class="programme-transport" aria-label="Playback controls">
    <div class="audio-actions"><ControlButton label="Previous story" :disabled="!programme" @click="player.nextChapter(-1)"/><ControlButton label="Back 15 seconds" :disabled="!programme" @click="player.seek(position-15)"/><ControlButton :label="playing?'Pause':waiting?'Starting…':'Play'" variant="primary" :disabled="!programme" @click="playing?player.pause():player.play()"/><ControlButton label="Forward 15 seconds" :disabled="!programme" @click="player.seek(position+15)"/><ControlButton label="Next story" :disabled="!programme" @click="player.nextChapter(1)"/></div>
    <label class="seek-label">Position <span>{{ audioTime(position) }} / {{ audioTime(duration) }} · {{ audioTime(Math.max(0,duration-position)) }} remaining</span><input aria-label="Programme position" type="range" min="0" :max="duration||1" step="0.1" :value="position" :disabled="!programme" @input="player.seek(Number(($event.target as HTMLInputElement).value))"></label>
    <div class="audio-options"><label>Speed<select aria-label="Speed" :value="rate" @change="player.setRate(Number(($event.target as HTMLSelectElement).value))"><option v-for="speed in [.75,1,1.25,1.5]" :key="speed" :value="speed">{{ speed }}×</option></select></label><label>Volume<input aria-label="Volume" type="range" min="0" max="1" step=".05" :value="volume" @input="player.setVolume(Number(($event.target as HTMLInputElement).value))"></label><ControlButton :label="volume===0?'Unmute':'Mute'" @click="player.setVolume(volume===0?1:0)"/></div>
    <p v-if="error" role="status" class="programme-error">{{ error }}</p><p v-else-if="waiting" role="status">Loading audio…</p>
  </section>
</template>
