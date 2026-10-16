<script setup lang="ts">
import type { Programme } from '../../../../packages/contracts/src/programme';
import { audioTime } from '../composables/useProgrammeAudio';
const props=defineProps<{programme:Programme;startAt?:number}>();
const emit=defineEmits<{position:[seconds:number];listen:[seconds:number]}>();
const player=useProgrammeAudio(),video=ref<HTMLVideoElement|null>(null),stage=ref<HTMLElement|null>(null);
const nativeControls=ref(true),captionText=ref('');
const position=ref(props.startAt||0),playing=ref(false),waiting=ref(false),failed=ref(false),notice=ref(''),captions=ref(true),preview=ref<number|null>(null);
const duration=computed(()=>(props.programme.videoRendition?.durationMs||props.programme.durationMs)/1000);
const current=computed(()=>props.programme.segments.find(s=>position.value*1000>=s.startMs&&position.value*1000<s.endMs));
let claimed=false;let frame=0,lastReport=0;let channel:BroadcastChannel|null=null;
function captionCue(){const track=video.value?.textTracks[0];captionText.value=track?Array.from(track.activeCues||[]).map(cue=>(cue as VTTCue).text).join(' '):'';}
function sync(){const media=video.value;if(!media)return;captionCue();position.value=media.currentTime;playing.value=!failed.value&&!media.paused&&!media.ended;if(claimed)player.reportVideo({programme:props.programme,position:position.value,playing:playing.value,renditionKey:props.programme.videoRendition!.renditionKey});emit('position',position.value);}
function started(){claimed=true;player.pause();sync();}
function frameSync(now:number){if(!document.hidden&&now-lastReport>=100){sync();lastReport=now;}if(video.value?.requestVideoFrameCallback)frame=video.value.requestVideoFrameCallback(frameSync);}
function playerKey(e:KeyboardEvent){if(e.target!==stage.value)return;if(e.key===' '||e.key==='k'){e.preventDefault();if(playing.value)pause();else void play();}else if(e.key==='m'){e.preventDefault();volume(player.volume.value===0?1:0);}}
function pause(){video.value?.pause();sync();}
async function play(){if(!video.value||failed.value)return;player.pause();claimed=true;notice.value='';waiting.value=true;try{await video.value.play();channel?.postMessage('playing');}catch{waiting.value=false;notice.value='Playback could not start. Press Play again, or use the audio and transcript alternative.';}}
function seek(seconds:number,autoplay=false){const media=video.value;if(!media)return;claimed=true;player.pause();media.currentTime=Math.max(0,Math.min(duration.value,seconds));preview.value=null;sync();if(autoplay)void play();}
function metadata(){const media=video.value;if(!media)return;media.playbackRate=player.rate.value;media.volume=player.volume.value;media.currentTime=Math.min(props.startAt||0,duration.value);tracks();sync();}
function tracks(){const media=video.value;if(media)for(const track of Array.from(media.textTracks)){track.mode=captions.value&&(!window.matchMedia('(max-width:600px)').matches||!!document.fullscreenElement)?'showing':'hidden';for(const cue of Array.from(track.cues||[]))(cue as VTTCue).line=-5;}captionCue();}
function chapter(delta:number){const chapters=props.programme.chapters,index=Math.max(0,chapters.findIndex(c=>position.value*1000>=c.startMs&&position.value*1000<c.endMs));seek((chapters[Math.max(0,Math.min(chapters.length-1,index+delta))]?.startMs||0)/1000);}
function nativeRate(){const media=video.value;if(!media)return;if([.75,1,1.25,1.5].includes(media.playbackRate))player.setRate(media.playbackRate);else media.playbackRate=player.rate.value;sync();}
function nativeVolume(){if(video.value)player.setVolume(video.value.muted?0:video.value.volume);}
function rate(value:number){player.setRate(value);if(video.value)video.value.playbackRate=value;}
function volume(value:number){player.setVolume(value);if(video.value){video.value.muted=false;video.value.volume=value;}}
async function fullscreen(){try{await stage.value?.requestFullscreen();}catch{notice.value='Fullscreen is unavailable here. The video remains playable within this page.';}}
function retry(){failed.value=false;notice.value='Retrying the prepared video. Press Play when ready.';video.value?.load();}
function error(){failed.value=true;waiting.value=false;video.value?.pause();playing.value=false;sync();notice.value='This prepared video is unavailable. Try again, or listen to the programme and read its complete transcript below.';}
function listen(){pause();emit('listen',position.value);}
function competing(event:Event){if(event.target instanceof HTMLMediaElement&&event.target!==video.value&&!event.target.muted){pause();claimed=false;player.clearVideo();}}
function fullscreenChanged(){tracks();}
function logout(){pause();claimed=false;player.clearVideo();}
watch(captions,tracks);watch(player.rate,value=>{if(video.value&&video.value.playbackRate!==value)video.value.playbackRate=value;});
watch(()=>props.startAt,seconds=>{const media=video.value;if(media&&media.readyState>=1){media.pause();media.currentTime=Math.max(0,Math.min(duration.value,seconds||0));sync();}});
onMounted(()=>{window.addEventListener('resize',tracks);if(video.value?.error)error();else if(video.value&&video.value.readyState>=1)metadata();player.setVideoControls({play:()=>void play(),pause,seek,nextChapter:chapter});nativeControls.value=false;document.addEventListener('fullscreenchange',fullscreenChanged);document.addEventListener('play',competing,true);window.addEventListener('account-logout',logout);try{channel=new BroadcastChannel('aggregator-audio-focus');channel.onmessage=pause;}catch{/* Same-document focus remains available. */}if(video.value?.requestVideoFrameCallback)frame=video.value.requestVideoFrameCallback(frameSync);});
onBeforeUnmount(()=>{window.removeEventListener('resize',tracks);player.setVideoControls(null);document.removeEventListener('fullscreenchange',fullscreenChanged);pause();if(frame)video.value?.cancelVideoFrameCallback?.(frame);player.clearVideo();releaseMedia(video.value);channel?.close();document.removeEventListener('play',competing,true);window.removeEventListener('account-logout',logout);});
defineExpose({play,pause,seek,position});
</script>
<template>
  <section class="prepared-broadcast" aria-label="Prepared Newsroom video">
    <div ref="stage" class="broadcast-picture" :class="{'is-playing':playing}" tabindex="0" @keydown="playerKey">
      <div class="broadcast-screen">
      <video ref="video" :controls="nativeControls" :key="programme.videoRendition?.renditionKey" :src="programme.videoRendition?.url" :poster="programme.videoRendition?.posterUrl" playsinline preload="metadata" :aria-label="`${programme.title} — ${programme.variant==='duo'?'Ada and Eli':'Ada'} animated broadcast`" @loadedmetadata="metadata" @timeupdate="sync" @seeked="sync" @ratechange="nativeRate" @volumechange="nativeVolume" @play="started" @playing="waiting=false;sync()" @pause="waiting=false;sync()" @ended="sync" @waiting="waiting=true" @canplay="waiting=false" @error="error">
        <track kind="captions" label="English" srclang="en" :src="programme.videoRendition?.captionUrl" default @load="tracks" @cuechange="captionCue">
      </video>
      <MediaKey v-if="!playing&&!failed&&position===0&&!nativeControls" class="central-play" label="Start programme" icon="play" @click="play"/><div v-if="failed" class="broadcast-failure"><p>Prepared video unavailable</p><ControlButton label="Retry video" @click="retry"/><ControlButton label="Listen instead" @click="listen"/></div>
      </div>
    <div v-if="!nativeControls" class="broadcast-controls">
      <label class="seek-label"><span>{{ audioTime(preview??position) }} / {{ audioTime(duration) }}</span><input aria-label="Programme position" type="range" min="0" :max="duration" step=".1" :value="preview??position" @input="preview=Number(($event.target as HTMLInputElement).value)" @change="seek(Number(($event.target as HTMLInputElement).value))"></label>
      <div class="media-bar"><MediaKey :label="playing?'Pause':position>=duration?'Replay':'Play'" :icon="playing?'pause':'play'" :disabled="failed" @click="playing?pause():(position>=duration?seek(0,true):play())"/><MediaKey label="Back 15 seconds" icon="rewind" @click="seek(position-15)"/><MediaKey label="Forward 15 seconds" icon="forward" @click="seek(position+15)"/><MediaKey :label="player.volume.value===0?'Unmute':'Mute'" :icon="player.volume.value===0?'mute':'volume'" @click="volume(player.volume.value===0?1:0)"/><input class="volume-slider" aria-label="Volume" type="range" min="0" max="1" step=".05" :value="player.volume.value" @input="volume(Number(($event.target as HTMLInputElement).value))"><span class="media-spacer"/><MediaKey :label="captions?'Hide captions':'Show captions'" icon="captions" @click="captions=!captions"/><details class="video-settings"><summary aria-label="Video settings">{{ player.rate.value }}×</summary><ControlSelect label="Video speed" :model-value="player.rate.value" :options="[.75,1,1.25,1.5].map(value=>({value,label:value+'×'}))" @update:model-value="rate"/><MediaKey label="Previous story" icon="previous" @click="chapter(-1)"/><MediaKey label="Next story" icon="next" @click="chapter(1)"/><button type="button" @click="nativeControls=!nativeControls">{{ nativeControls?'Use enhanced controls':'Use native controls' }}</button></details><MediaKey label="Fullscreen stage" icon="fullscreen" @click="fullscreen"/></div>
      <p v-if="notice" role="status" class="programme-error">{{ notice }}</p><p v-else-if="waiting" role="status" class="metadata">Loading prepared video…</p>
      <p class="broadcast-now metadata">{{ current?.speakerId==='clip'?'Original fictional clip':current?.speakerId==='eli'?'Eli':current?.speakerId==='ada'?'Ada':'Programme' }}<span v-if="current?.sourceIds.length"> · Evidence <a v-for="id in current.sourceIds" :key="id" :href="`#programme-source-${id}`">[{{ programme.sources.find(s=>s.id===id)?.ordinal }}]</a></span></p>
    </div>
    </div>
    <p v-if="captions&&captionText" class="broadcast-mobile-caption" aria-label="Current caption">{{ captionText }}</p>
  </section>
</template>
<style scoped>.central-play{position:absolute;left:50%;top:42%;transform:translate(-50%,-50%);border-radius:50%;background:#10241ee8;color:white;min-width:64px;min-height:64px;}@media(hover:hover){.broadcast-picture.is-playing:not(:hover):not(:focus-within) .broadcast-controls{opacity:0;pointer-events:none}.broadcast-picture .broadcast-controls{transition:opacity 140ms}}
.media-bar{display:flex;align-items:center;gap:2px}.media-spacer{flex:1}.prepared-broadcast .media-bar .volume-slider{width:80px;flex:0 0 80px}.video-settings{position:relative}.video-settings summary{min-width:44px;min-height:44px;display:grid;place-items:center;cursor:pointer}.video-settings[open]{background:#142a23;padding:8px}.video-settings :deep(.field-select){color:var(--text)}
.prepared-broadcast .broadcast-controls{position:absolute;bottom:0;left:0;right:0;padding:24px 12px 6px;background:linear-gradient(transparent,#08130ff5);color:#fff}.prepared-broadcast .seek-label{margin:0}.prepared-broadcast .seek-label span{font-size:11px}.prepared-broadcast .broadcast-now{margin:0;color:#fff}.prepared-broadcast .broadcast-now a{color:#f5dbab}.prepared-broadcast .broadcast-controls input{accent-color:#d3b77a}.prepared-broadcast .broadcast-controls .seek-label input{width:100%}@media(max-width:540px){.volume-slider{display:none}.prepared-broadcast .broadcast-controls{padding:12px 4px 0}.prepared-broadcast .broadcast-now{display:none}.media-bar :deep(.media-key){min-width:36px}}

.broadcast-mobile-caption{display:none}@media(max-width:600px){.broadcast-mobile-caption{display:block;font-size:1rem;line-height:1.5;margin:0;padding:.8rem .6rem;border-bottom:1px solid var(--line,#bcb6aa)}}.prepared-broadcast{border-block:1px solid var(--line,#bcb6aa);margin-block:1.4rem 1rem}.broadcast-picture{position:relative;aspect-ratio:16/9;background:#10241e;isolation:isolate}.broadcast-picture video{display:block;width:100%;height:100%;object-fit:contain}.broadcast-picture:fullscreen{width:100vw;height:100vh;aspect-ratio:auto;background:#09100e}.broadcast-controls{padding:1.15rem 0 .25rem}.broadcast-controls .audio-actions{gap:.55rem}.broadcast-controls .seek-label{margin-block:1rem}.broadcast-controls .audio-options{align-items:end;gap:1rem}.broadcast-now{min-height:1.5rem}.broadcast-now a{margin-inline:.15rem}.broadcast-failure{position:absolute;inset:0;display:flex;flex-wrap:wrap;align-content:center;justify-content:center;gap:1rem;background:#10241ee8;color:#fff}.broadcast-failure p{flex-basis:100%;text-align:center}.broadcast-controls input[type=range]{min-height:30px}.broadcast-picture video::cue{background:#09130fe8;color:#fff;font-family:Arial,sans-serif}.broadcast-controls label{min-width:0}@media(max-width:540px){.broadcast-controls .audio-actions{display:grid;grid-template-columns:1fr 1fr}.broadcast-controls .audio-options{display:grid;grid-template-columns:1fr 1fr}.broadcast-controls .audio-options>label{width:100%}.broadcast-controls input{max-width:100%}.broadcast-controls .audio-options :deep(button){width:100%}}
</style>













/* Targeted reflow: settings and transport wrap without clipping page/focus. */
<style scoped>
.broadcast-screen{position:relative;aspect-ratio:16/9;height:100%}
.broadcast-picture:fullscreen .broadcast-screen{height:100%;aspect-ratio:auto}
.media-bar{flex-wrap:wrap;min-width:0;position:relative}
.prepared-broadcast :deep(.media-tooltip){max-width:min(260px,calc(100vw - 48px));white-space:normal;overflow-wrap:anywhere;box-sizing:border-box}
.media-bar :deep(.media-key){position:static}
.media-bar :deep(.media-tooltip){left:0;right:0;transform:none;white-space:normal;overflow-wrap:anywhere;max-width:100%;box-sizing:border-box}
.video-settings[open]{flex:1 1 100%;min-width:0;max-width:100%;box-sizing:border-box;overflow-wrap:anywhere}
.video-settings[open]>button{max-width:100%;white-space:normal;overflow-wrap:anywhere}
@media(max-width:540px){
 .prepared-broadcast .broadcast-controls{position:relative;padding:12px 8px;background:#10241e}
 .broadcast-picture{aspect-ratio:auto}
 .broadcast-screen{height:auto}
 .broadcast-picture video{aspect-ratio:16/9;height:auto}
 .media-bar :deep(.media-key){min-width:44px;min-height:44px}
 .broadcast-picture:fullscreen .broadcast-controls{position:absolute}
 .broadcast-picture:fullscreen video{height:100%;aspect-ratio:auto}
}
</style>

