<script setup lang="ts">
const showLeftDrawer = useState('show-left-drawer', () => true)
const showRightDrawer = useState('show-right-drawer', () => true)
const route = useRoute()
const { t } = useI18n()
const isLayoutReady = ref(false)

provideDrawerSlotRegistry()

function getMetaTitle(title: unknown) {
  if (typeof title !== 'string') return ''
  return t(title)
}

const breadcrumbs = computed(() => {
  return route.matched
    .filter((item) => item.meta?.title)
    .map((r) => ({
      title: getMetaTitle(r.meta.title),
      disabled: r.path === route.path,
      to: r.path,
    }))
})

const shouldShowBreadcrumbs = computed(() => breadcrumbs.value.length > 1)

function waitForNextFrame() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve())
  })
}

onMounted(async () => {
  if (typeof document !== 'undefined' && 'fonts' in document) {
    await document.fonts.ready
  }

  await nextTick()
  await waitForNextFrame()
  await waitForNextFrame()
  isLayoutReady.value = true
})
</script>

<template>
  <v-app :class="{ 'layout-shell--loading': !isLayoutReady }">
    <AppBar />
    <AppDrawer v-if="showLeftDrawer" />
    <AppRightDrawer v-if="showRightDrawer" />
    <v-main>
      <v-container fluid class="px-2 pt-0 pb-0">
        <v-breadcrumbs v-if="shouldShowBreadcrumbs" :items="breadcrumbs" />
      </v-container>
      <slot />
    </v-main>
    <AppFooter />
  </v-app>
</template>

<style scoped>
.layout-shell--loading {
  visibility: hidden;
  pointer-events: none;
}

.v-main {
  padding-top: 104px;
  padding-bottom: 56px;
  overflow-y: visible;
  transition-property: padding;
  min-height: 100vh;
}

.breadcrumbs-wrapper {
  display: flex;
  justify-content: center;
}

@media (max-width: 960px) {
  .v-main {
    padding-top: 92px;
    padding-bottom: 52px;
  }
}
</style>
