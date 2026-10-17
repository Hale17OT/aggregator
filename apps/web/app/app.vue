<template>
  <a class="skip" href="#main">Skip to content</a>
  <div :class="{'clips-hidden':$route.path==='/clips'}"><PublicationMasthead /></div>
  <NuxtPage />
  <AppAudioHost />
  <footer v-if="$route.path!=='/clips'" class="shell footer">The Aggregator · Local reader. Publisher reports retain attribution; prepared audio and video belong to the separate fictional sample catalogue.</footer>
</template>
<style>.clips-hidden{display:none}</style>

