<script setup lang="ts">
const showLeftDrawer = useState('show-left-drawer', () => true)
const showRightDrawer = useState('show-right-drawer', () => true)
const isPageSkeletonLoading = useState('page-skeleton-loading', () => true)
const route = useRoute()
const { t } = useI18n()
const isLayoutReady = ref(false)

provideDrawerSlotRegistry()

let pageSkeletonTimer: ReturnType<typeof setTimeout> | null = null

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

function triggerPageSkeleton() {
  isPageSkeletonLoading.value = true

  if (pageSkeletonTimer) {
    clearTimeout(pageSkeletonTimer)
  }

  pageSkeletonTimer = setTimeout(() => {
    isPageSkeletonLoading.value = false
    pageSkeletonTimer = null
  }, 650)
}

onMounted(async () => {
  if (typeof document !== 'undefined' && 'fonts' in document) {
    await document.fonts.ready
  }

  await nextTick()
  await waitForNextFrame()
  await waitForNextFrame()
  isLayoutReady.value = true

  triggerPageSkeleton()
})

watch(() => route.fullPath, triggerPageSkeleton)

onUnmounted(() => {
  if (pageSkeletonTimer) {
    clearTimeout(pageSkeletonTimer)
  }
})
</script>

<template>
  <div class="layout-shell">
    <div v-if="!isLayoutReady" class="layout-shell__loader" aria-label="Loading layout">
      <v-icon icon="custom:world" size="128" class="layout-shell__loader-icon" />
    </div>

    <v-app :class="{ 'layout-shell--loading': !isLayoutReady }">
    <AppBar />
    <AppDrawer v-if="showLeftDrawer" />
    <AppRightDrawer v-if="showRightDrawer" />
    <v-main>
      <v-container fluid class="px-2 pt-0 pb-0">
        <v-breadcrumbs v-if="shouldShowBreadcrumbs" :items="breadcrumbs" />
      </v-container>
      <SkeletonPageContent v-if="isPageSkeletonLoading" />
      <slot v-else />
    </v-main>
      <AppFooter />
    </v-app>
  </div>
</template>

<style scoped>
.layout-shell {
  position: relative;
}

.layout-shell__loader {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(var(--v-theme-background));
  z-index: 2100;
}

.layout-shell__loader-icon {
  color: rgb(var(--v-theme-primary));
  animation: pulse-world-icon 1.2s ease-in-out infinite;
}

.layout-shell--loading {
  visibility: hidden;
  pointer-events: none;
}

@keyframes pulse-world-icon {
  0%,
  100% {
    opacity: 0.55;
    transform: scale(0.92);
  }

  50% {
    opacity: 1;
    transform: scale(1);
  }
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
