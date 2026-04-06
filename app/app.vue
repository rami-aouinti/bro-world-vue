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
const showLeftDrawer = useState('show-left-drawer', () => true)
const showRightDrawer = useState('show-right-drawer', () => true)
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
    pageTitle ? `${pageTitle} | ${translateIfKey('app.name')}` : translateIfKey('app.name'),
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
  <v-app>
    <AppBar />
    <AppDrawer v-if="showLeftDrawer" />
    <AppRightDrawer v-if="showRightDrawer" />
    <v-main>
      <NuxtPage />
    </v-main>
    <AppFooter />
  </v-app>
</template>

<style scoped>
.v-main {
  padding-top: 104px;
  padding-bottom: 0;
  overflow-y: auto;
  transition-property: padding;
  min-height: 100vh;
}

@media (max-width: 960px) {
  .v-main {
    padding-top: 92px;
  }
}

.v-main-public {
  min-height: 100vh;
}
</style>
