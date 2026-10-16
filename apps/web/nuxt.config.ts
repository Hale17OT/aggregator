export default defineNuxtConfig({
  compatibilityDate: '2026-10-12',
  ssr: true,
  devtools: { enabled: false },
  css: ['@fontsource/unifrakturmaguntia/latin-400.css', '@fontsource-variable/newsreader', '@fontsource-variable/manrope', '~/assets/tokens.css', '~/assets/main.css', '~/assets/controls.css', '~/assets/fields.css'],
  runtimeConfig: { apiBase: 'http://127.0.0.1:4000' },
  app: { head: {
    htmlAttrs: { lang: 'en' },
    meta: [
      { name: 'robots', content: 'noindex, nofollow' },
      { property: 'og:site_name', content: 'The Aggregator' },
      { property: 'og:image', content: '/brand/social-preview.png' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { property: 'og:image:alt', content: 'The Aggregator — editorial A on warm paper gold' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:image', content: '/brand/social-preview.png' },
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/brand/favicon.ico' },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/brand/icon-32.png' },
      { rel: 'apple-touch-icon', sizes: '180x180', href: '/brand/icon-180.png' },
      { rel: 'mask-icon', href: '/brand/favicon-mark.svg', color: '#18201E' },
    ],
  } },
  typescript: { strict: true },
});
