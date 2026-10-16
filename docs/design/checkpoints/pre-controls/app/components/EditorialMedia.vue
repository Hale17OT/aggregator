<script setup lang="ts">
import type { EditorialMedia } from '../../../../packages/contracts/src/index';
defineProps<{media:EditorialMedia;compact?:boolean;linkedTo?:string;priority?:boolean}>();
</script>
<template>
  <figure v-if="media.displayPermitted" :class="['editorial-media',{compact}]" :data-media-id="media.id">
    <template v-if="media.availability==='available'">
      <video v-if="media.kind==='video'" controls playsinline preload="metadata" :poster="media.poster" :width="media.width" :height="media.height" :aria-label="media.alt"><source :src="media.src" type="video/webm"><track v-if="media.captions" kind="captions" :src="media.captions" srclang="en" label="English" default><p>Video unavailable. <a :href="media.originalUrl">Open the original illustration</a>.</p></video>
      <component :is="linkedTo?'a':'div'" v-else :href="linkedTo" :aria-label="linkedTo?`Read the story: ${media.alt}`:undefined" class="media-image-link">
        <object class="media-image" :data="media.src" :type="media.src.endsWith('.svg')?'image/svg+xml':'image/png'" :width="media.width" :height="media.height" role="img" :aria-label="media.alt" :style="{objectPosition:`${media.focalPoint.x}% ${media.focalPoint.y}%`,aspectRatio:`${media.width} / ${media.height}`}" :fetchpriority="priority?'high':undefined"><div class="media-unavailable">Illustration unavailable. The story and its sources remain readable.</div></object>
      </component>
    </template>
    <p v-else class="media-unavailable">Illustration unavailable. The story and its sources remain readable.</p>
    <figcaption v-if="!compact"><span>{{ media.caption }}</span> <span class="media-credit">{{ media.credit }} · {{ media.provenance }}. <a :href="media.originalUrl">Original asset ↗</a></span></figcaption>
    <figcaption v-else class="metadata">Fictional illustration · not evidence</figcaption>
  </figure>
</template>
