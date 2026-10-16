<script setup lang="ts">
defineProps<{open?:boolean}>();
</script>
<template><span class="field-chevron" :data-open="open||undefined" aria-hidden="true"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" focusable="false"><path d="M7 9.5 L12 14.5 L17 9.5"/></svg></span></template>
<style>
.field-chevron{display:grid;place-items:center;width:20px;height:20px;line-height:0;pointer-events:none;flex:none}
.field-chevron svg{display:block;transform-origin:50% 50%;transition:transform 140ms ease}
.field-chevron[data-open] svg{transform:rotate(180deg)}
@media(prefers-reduced-motion:reduce){.field-chevron svg{transition:none}}
html[data-reduce-motion=true] .field-chevron svg{transition:none}
</style>
