<script setup lang="ts">
import type { ListeningState,ListeningProgress } from '../../../../packages/contracts/src/member';
const player=useProgrammeAudio(),member=useMember();const status=ref('');let enabled=false,loaded=false,activeId='',skipId='',sending=false,conflicted=false,timer:ReturnType<typeof setInterval>|undefined,lastSaved='',generation=0;
const currentProgramme=computed(()=>player.videoState.value?.programme||player.programme.value);
const currentPosition=computed(()=>player.videoState.value?.position??player.position.value);
const currentPlaying=computed(()=>player.videoState.value?.playing??player.playing.value);
const currentRendition=computed(()=>player.videoState.value?.renditionKey||player.programme.value?.renditionKey);
const revisions=new Map<string,number>();
const drained:(()=>void)[]=[];
async function load(){const current=++generation;enabled=false;loaded=false;skipId=currentProgramme.value?.programmeId||'';activeId='';revisions.clear();await member.refresh();if(!member.session.value||current!==generation)return;try{const [preferences,listening]=await Promise.all([$fetch<{data:{listeningHistory:boolean}}>('/api/v1/me/preferences'),$fetch<{data:ListeningState}>('/api/v1/me/listening')]);if(current!==generation)return;enabled=preferences.data.listeningHistory;for(const progress of listening.data.progress)revisions.set(progress.programmeId,progress.revision);loaded=true;conflicted=false;}catch{status.value='Account listening progress is unavailable. Playback remains available.';}}
async function save(){const programme=currentProgramme.value;if(!enabled||!loaded||!programme||activeId!==programme.programmeId||sending||conflicted||!member.session.value)return;const positionMs=Math.max(0,Math.floor(currentPosition.value*1000));const saveKey=currentRendition.value+':'+positionMs;if(saveKey===lastSaved)return;sending=true;const current=generation;try{const result=await member.mutate<{data:ListeningProgress}>('/api/v1/me/progress','PUT',{programmeId:programme.programmeId,renditionKey:currentRendition.value,positionMs,revision:revisions.get(programme.programmeId)||0});if(current!==generation)return;revisions.set(programme.programmeId,result.data.revision);lastSaved=saveKey;status.value='';}catch(error){if(current!==generation)return;if((error as {statusCode?:number}).statusCode===409){conflicted=true;status.value='Listening changed in another session. Reload before saving more progress.';}else status.value='Listening progress was not saved. Playback remains available.';}finally{sending=false;for(const resolve of drained.splice(0))resolve();}}
watch([currentProgramme,currentRendition],([programme])=>{if(loaded&&programme&&programme.programmeId!==skipId){activeId=programme.programmeId;lastSaved='';conflicted=false;}else activeId='';});
watch(currentPlaying,(playing,previous)=>{if(previous&&!playing)void save();});
watch(currentPosition,(position,previous)=>{if(Math.abs(position-previous)>3)void save();});
function logout(){generation++;enabled=false;loaded=false;activeId='';skipId='';revisions.clear();status.value='';}
function preferences(event:Event){const detail=(event as CustomEvent<{listeningHistory?:boolean}>).detail;if(detail?.listeningHistory===false){enabled=false;status.value='';}else if(detail?.listeningHistory===true&&!enabled)void load();}
function clearRequest(event:Event){enabled=false;generation++;const detail=(event as CustomEvent<{pending:Promise<void>[]}>).detail;if(sending)detail.pending.push(new Promise(resolve=>drained.push(resolve)));}
function cleared(){revisions.clear();lastSaved='';activeId='';skipId=currentProgramme.value?.programmeId||'';status.value='';void load();}
onMounted(()=>{void load();timer=setInterval(()=>void save(),12000);window.addEventListener('account-logout',logout);window.addEventListener('aggregator:preferences',preferences);window.addEventListener('aggregator:clear-history',cleared);window.addEventListener('aggregator:history-clear-request',clearRequest);window.addEventListener('aggregator:signed-in',load);});
onBeforeUnmount(()=>{if(timer)clearInterval(timer);generation++;window.removeEventListener('account-logout',logout);window.removeEventListener('aggregator:preferences',preferences);window.removeEventListener('aggregator:clear-history',cleared);window.removeEventListener('aggregator:history-clear-request',clearRequest);window.removeEventListener('aggregator:signed-in',load);});
</script>
<template><p v-if="status" class="shell metadata" role="status">{{ status }}</p></template>


