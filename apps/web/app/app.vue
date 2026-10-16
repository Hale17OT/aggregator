<template>
  <a class="skip" href="#main">Skip to content</a>
  <div :class="{'clips-hidden':$route.path==='/clips'}"><PublicationMasthead /></div>
  <NuxtPage />
  <AppAudioHost />
  <footer v-if="$route.path!=='/clips'" class="shell footer">The Aggregator · Fictional development edition. Simulated review, original illustrations, example-domain evidence links. Real integrations disabled.</footer>
</template>
<style>.clips-hidden{display:none}</style>
