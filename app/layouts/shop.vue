<script setup lang="ts">
import { defineAsyncComponent } from 'vue'
import ShopDrawer from '~/components/World/ShopDrawer.vue'

const showLeftDrawer = useState('show-left-drawer', () => true)
const showRightDrawerDesktop = useState('show-right-drawer-desktop', () => true)
const showRightDrawerMobile = useState('show-right-drawer-mobile', () => false)
const isPageSkeletonLoading = useState('page-skeleton-loading', () => true)
const route = useRoute()
const { t } = useI18n()
const { mobile } = useDisplay()
const isLayoutReady = ref(false)

const AppDrawerLazy = defineAsyncComponent(
  () => import('~/components/App/AppDrawer.vue'),
)
const AppRightDrawerLazy = defineAsyncComponent(
  () => import('~/components/App/AppRightDrawer.vue'),
)

provideDrawerSlotRegistry()

const LAYOUT_SKELETON_MIN_DURATION = 100
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
const shouldRenderLeftDrawer = computed(
  () => isLayoutReady.value && showLeftDrawer.value,
)
const shouldRenderRightDrawer = computed(
  () =>
    isLayoutReady.value &&
    (mobile.value ? showRightDrawerMobile.value : showRightDrawerDesktop.value),
)

function triggerPageSkeleton(minDuration = LAYOUT_SKELETON_MIN_DURATION) {
  isPageSkeletonLoading.value = true

  if (pageSkeletonTimer) {
    clearTimeout(pageSkeletonTimer)
  }

  pageSkeletonTimer = setTimeout(
    () => {
      isPageSkeletonLoading.value = false
      pageSkeletonTimer = null
    },
    Math.max(0, minDuration),
  )
}

onMounted(async () => {
  await nextTick()
  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve())
  })

  isLayoutReady.value = true
  triggerPageSkeleton()
})

watch(
  () => route.fullPath,
  () => triggerPageSkeleton(),
)

onUnmounted(() => {
  if (pageSkeletonTimer) {
    clearTimeout(pageSkeletonTimer)
  }
})
</script>

<template>
  <div class="layout-shell">
    <div
      v-if="!isLayoutReady"
      class="layout-shell__loader"
      aria-label="Loading layout"
    >
      <v-icon
        icon="custom:world"
        size="128"
        class="layout-shell__loader-icon"
      />
    </div>

    <v-app :class="{ 'layout-shell--loading': !isLayoutReady }">
      <AppBar />
      <ClientOnly>
        <AppDrawerLazy v-if="shouldRenderLeftDrawer" />
      </ClientOnly>
      <ClientOnly>
        <AppRightDrawerLazy v-if="shouldRenderRightDrawer" />
      </ClientOnly>
      <v-main>
        <AppPageDrawers :left-component="ShopDrawer" />
        <v-container fluid class="px-2 pt-0 pb-0">
          <v-breadcrumbs v-if="shouldShowBreadcrumbs" :items="breadcrumbs" />
        </v-container>
        <slot />
      </v-main>
      <v-defaults-provider
        :defaults="{ VBtn: { variant: 'text', size: 'x-small' } }"
      >
        <AppSettings />
      </v-defaults-provider>
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
  padding-bottom: 16px;
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
    padding-bottom: 12px;
  }
}
</style>
