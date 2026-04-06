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
const shadow = useStorage('theme-shadow', 'medium')

const appClass = computed(() => [
  `app-radius--${rounded.value}`,
  `app-shadow--${shadow.value}`,
])

const title = computed(() => {
  const pageTitle = route.meta?.title || route.matched[0]?.meta?.title || ''
  return typeof pageTitle === 'string' ? t(pageTitle) : ''
})
const isPublicPage = computed(() => Boolean(route.meta?.publicPage))
useHead({
  title,
  titleTemplate: (pageTitle) =>
    pageTitle ? `${pageTitle} | ${t('app.name')}` : t('app.name'),
  htmlAttrs: computed(() => ({ lang: locale.value })),
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
  <v-app :class="appClass">
    <template v-if="!isPublicPage">
      <AppDrawer />
      <AppBar />
    </template>
    <v-main :class="{ 'v-main-public': isPublicPage }">
      <NuxtPage />
    </v-main>
    <AppFooter v-if="!isPublicPage" />
  </v-app>
</template>

<style scoped>
.v-main {
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 64px;
  margin-bottom: 32px;
  height: calc(100vh - 64px - 32px);
  overflow-y: auto;
  transition-property: padding;
}

.v-main-public {
  margin-top: 0;
  margin-bottom: 0;
  height: 100vh;
}
</style>
