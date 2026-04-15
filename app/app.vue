<script setup lang="ts">
import { useStorage } from '@vueuse/core'

const theme = useTheme()
provide(
  THEME_KEY,
  computed(() => (theme.current.value.dark ? 'dark' : undefined)),
)

const route = useRoute()
const { locale, t } = useI18n()
const rounded = useStorage('theme-rounded', 'md')
const shadow = useStorage('theme-shadow', 'none')
const translateIfKey = (key: unknown) =>
  typeof key === 'string' && key ? t(key) : ''

if (import.meta.client) {
  watchEffect(() => {
    document.documentElement.dataset.appRounded = rounded.value
    document.documentElement.dataset.appShadow = shadow.value
  })
}

const title = computed(() => {
  const pageTitle = route.meta?.title || route.matched[0]?.meta?.title || ''
  return translateIfKey(pageTitle)
})

useHead({
  title,
  titleTemplate: (pageTitle) =>
    pageTitle
      ? `${pageTitle} | ${translateIfKey('app.name')}`
      : translateIfKey('app.name'),
  htmlAttrs: { lang: locale.value },
  link: [{ rel: 'icon', href: '/favicon.ico' }],
})

const isTrackingEnabled =
  import.meta.client &&
  import.meta.env.PROD &&
  (Boolean(import.meta.env.VERCEL) || Boolean(import.meta.env.VERCEL_URL))

if (isTrackingEnabled) {
  useHead({
    script: [
      {
        innerHTML:
          'window.va=window.va||function(){(window.vaq=window.vaq||[]).push(arguments);};',
      },
      {
        defer: true,
        src: '/_vercel/insights/script.js',
      },
      {
        innerHTML:
          'window.si=window.si||function(){(window.siq=window.siq||[]).push(arguments);};',
      },
      {
        defer: true,
        src: '/_vercel/speed-insights/script.js',
      },
    ],
  })
}

useSeoMeta({
  viewport: 'width=device-width, initial-scale=1',
  description: 'Vuetify 3 + Nuxt 3, Opinionated Admin Starter Template',
  ogImage: '/social-image.png',
  twitterImage: '/social-image.png',
  twitterCard: 'summary_large_image',
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
