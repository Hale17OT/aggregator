<script setup lang="ts">
defineProps<{label:string;icon:string;disabled?:boolean}>();
</script>
<template><button type="button" class="media-key" :aria-label="label" :disabled="disabled"><ControlIcon :name="icon"/><span class="media-tooltip">{{ label }}</span></button></template>
<style scoped>.media-key{position:relative;display:inline-grid;place-items:center;min-width:44px;min-height:44px;border:0;border-radius:4px;background:transparent;color:inherit;cursor:pointer}.media-key:hover,.media-key:focus-visible{background:#8883}.media-key:disabled{opacity:.4;cursor:default}.media-key :deep(svg){width:22px;height:22px}.media-tooltip{position:absolute;bottom:100%;left:50%;transform:translateX(-50%);padding:4px 8px;background:#10241e;color:white;font:12px/1.4 sans-serif;white-space:nowrap;pointer-events:none;visibility:hidden;z-index:5}.media-key:hover .media-tooltip,.media-key:focus-visible .media-tooltip{visibility:visible}</style>
