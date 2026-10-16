<script setup lang="ts">
defineProps<{name:string}>();
const paths:Record<string,string>={
  more:'M3 8h.01M8 8h.01M13 8h.01',share:'M8 11V1m-3 3 3-3 3 3M3 7v7h10V7',up:'M8 13V3m-4 4 4-4 4 4',
  bookmark:'M4 1h8v14l-4-3-4 3Z',play:'M4 2l10 6-10 6Z',pause:'M4 2v12M12 2v12',previous:'M3 2v12M13 2 5 8l8 6Z',next:'M13 2v12M3 2l8 6-8 6Z',
  rewind:'M7 3 1 8l6 5Zm7 0L8 8l6 5Z',forward:'m2 3 6 5-6 5Zm7 0 6 5-6 5Z',
  volume:'M2 6h3l4-4v12l-4-4H2ZM12 4q4 4 0 8',mute:'M2 6h3l4-4v12l-4-4H2Zm10 0 3 4m0-4-3 4',
  captions:'M1 3h14v10H1ZM6 6H4v4h2m6-4h-2v4h2',fullscreen:'M1 6V1h5m4 0h5v5m0 4v5h-5m-4 0H1v-5',queue:'M2 3h12M2 8h12M2 13h8',
  arrow:'M4 8h8M9 4l4 4-4 4',back:'M12 8H4m4-4L4 8l4 4',down:'M8 3v10m-4-4 4 4 4-4',
  copy:'M6 5V2h7v9h-3M3 5h7v9H3z',check:'m3 8 3 3 7-7',error:'M8 4v5m0 3h.01M8 1 1 14h14z',
  moon:'M13.5 10A6 6 0 0 1 6 2.5 6 6 0 1 0 13.5 10Z',sun:'M8 1v1m0 12v1M1 8h1m12 0h1M3 3l1 1m8 8 1 1M3 13l1-1m8-8 1-1M11 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0',
  evidence:'M3 2h10v12H3zM6 5h4M6 8h4M6 11h2',close:'m4 4 8 8m0-8-8 8',
  loading:'M13 8a5 5 0 1 1-5-5',external:'M9 2h5v5m0-5-7 7M6 3H2v11h11v-4',
};
</script>
<template><svg class="control-icon" width="18" height="18" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path :d="paths[name]||paths.arrow" /></svg></template>
