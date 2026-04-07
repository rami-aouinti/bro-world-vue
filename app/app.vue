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

useSeoMeta({
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
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
