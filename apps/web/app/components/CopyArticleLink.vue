<script setup lang="ts">
const props=defineProps<{variant?:'primary'|'secondary'|'quiet'}>();
const route=useRoute();
const ready=ref(false);
const state=ref<'idle'|'loading'|'success'|'error'>('idle');
const message=ref('');
let disposed=false;
let generation=0;
const label=computed(()=>({idle:'Copy link',loading:'Copying…',success:'Copied',error:'Retry copy'}[state.value]));
const icon=computed(()=>({idle:'copy',loading:'loading',success:'check',error:'error'}[state.value]));
onMounted(()=>{ready.value=typeof navigator.clipboard?.writeText==='function';});
watch(()=>route.fullPath,()=>{generation++;state.value='idle';message.value='';});
onBeforeUnmount(()=>{disposed=true;generation++;});
async function copy(){
  if(state.value==='loading'||!ready.value)return;
  const request=++generation;state.value='loading';message.value='';
  try{
    // Preserve the selected reading variant; exclude presentation-only theme and scroll position.
    const url=new URL(window.location.href);url.hash='';url.searchParams.delete('theme');
    await navigator.clipboard.writeText(url.href);
    if(disposed||request!==generation)return;
    state.value='success';message.value='Article link copied.';
  }catch{
    if(disposed||request!==generation)return;
    state.value='error';message.value='Copy failed. Retry, or copy the address from your browser.';
  }
}
</script>
<template>
  <div v-if="ready" class="copy-link-control">
    <ControlButton :label="label" :icon="icon" :variant="props.variant||'quiet'" :busy="state==='loading'" :outcome="state==='success'?'success':state==='error'?'error':'idle'" data-copy-link @click="copy" />
    <span class="copy-feedback" :class="{'sr-only':state!=='error'}" role="status" aria-live="polite" aria-atomic="true">{{ message }}</span>
  </div>
</template>
