<script setup lang="ts">
const props=defineProps<{programmeId:string;renditionKey:string}>();const player=useProgrammeAudio(),element=ref<HTMLElement|null>(null),level=ref(0);
const envelope=shallowRef<{renditionKey:string;stepMs:number;rms:number[]}|null>(null);let generation=0,frame=0,last=0,observer:IntersectionObserver|undefined,visible=false;
watch(()=>props.programmeId,async id=>{const current=++generation;envelope.value=null;try{const response=await $fetch<{data:NonNullable<typeof envelope.value>}>(`/api/v1/programmes/${encodeURIComponent(id)}/envelope`);if(current===generation)envelope.value=response.data;}catch{/* A missing optional meter does not prevent listening. */}},{immediate:true});
const active=computed(()=>player.playing.value&&!player.waiting.value&&!player.error.value&&player.programme.value?.programmeId===props.programmeId);
function stop(){cancelAnimationFrame(frame);frame=0;level.value=0;}
function paint(now:number){if(!visible||document.hidden||!active.value){stop();return;}if(now-last>=16){const e=envelope.value;if(e?.renditionKey===props.renditionKey){const index=player.mediaTime()*1000/e.stepMs,a=Math.floor(index),mix=index-a;level.value=Math.min(1,((e.rms[a]||0)*(1-mix)+(e.rms[a+1]||0)*mix)*3.2);}last=now;}frame=requestAnimationFrame(paint);}
function schedule(){stop();if(visible&&!document.hidden&&active.value)frame=requestAnimationFrame(paint);}
watch(active,schedule);onMounted(()=>{observer=new IntersectionObserver(entries=>{visible=entries[0]?.isIntersecting||false;schedule();});if(element.value)observer.observe(element.value);document.addEventListener('visibilitychange',schedule);});onBeforeUnmount(()=>{generation++;stop();observer?.disconnect();document.removeEventListener('visibilitychange',schedule);});
</script>
<template><div ref="element" class="signal-strip" aria-label="Recorded audio level"><span class="meter-label">LEVEL</span><span class="meter-lights" aria-hidden="true"><i v-for="bar in 18" :key="bar" :class="{'lit':level>=bar/18}"></i></span><span>{{ envelope?'RMS':'—' }}</span></div></template>
<style scoped>.signal-strip{display:flex;align-items:center;gap:7px;margin-top:6px;font:7px ui-monospace,monospace;letter-spacing:.05em}.meter-lights{display:flex;gap:3px;flex:1;contain:paint;padding:3px;margin:-3px;transform:translateZ(0)}.meter-lights i{height:5px;flex:1;background:#607058;box-shadow:inset 0 1px 1px #0006}.meter-lights i.lit{background:#f5c36d;box-shadow:0 0 3px #efb25355}</style>

