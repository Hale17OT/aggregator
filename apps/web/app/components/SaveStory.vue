<script setup lang="ts">
const props=defineProps<{articleId:string;returnTo?:string;compact?:boolean}>();const route=useRoute();const returnContext=computed(()=>readerReturn(props.returnTo||route.path)||`/library`);const member=useMember();const message=ref(''),busy=ref(false);
onMounted(()=>member.refresh());
async function save(){busy.value=true;message.value='';try{await member.mutate(`/api/v1/me/bookmarks/${props.articleId}`,'PUT',{});message.value='Saved to My library.';}catch(e){message.value=memberError(e);}finally{busy.value=false;}}
</script>
<template><div class="member-actions"><button v-if="member.session.value" class="control control--secondary" :aria-label="compact?(busy?'Saving…':'Save story'):undefined" :disabled="busy" @click="save"><ControlIcon v-if="compact" name="bookmark"/><span :class="{'sr-only':compact}">{{ busy?'Saving…':'Save story' }}</span></button><NuxtLink v-else class="control control--quiet" :to="`/sign-in?returnTo=${encodeURIComponent(returnContext)}`">Sign in to save</NuxtLink><span role="status">{{ message }}</span></div></template>
