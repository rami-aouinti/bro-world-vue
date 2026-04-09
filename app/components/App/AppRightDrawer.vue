<script setup lang="ts">
const rightDrawerOpen = useState('right-drawer-open', () => true)
const isPageSkeletonLoading = useState('page-skeleton-loading', () => true)
const registry = useDrawerSlotRegistry()
const { lgAndUp } = useDisplay()
const isRightDrawerReady = ref(false)

const rightDrawerRenderer = computed(() => registry?.right.value ?? null)
const shouldRenderRightDrawerContent = computed(
  () =>
    isRightDrawerReady.value &&
    lgAndUp.value &&
    Boolean(rightDrawerRenderer.value),
)

onMounted(() => {
  requestAnimationFrame(() => {
    isRightDrawerReady.value = true
  })
})
</script>

<template>
  <v-navigation-drawer
    v-model="rightDrawerOpen"
    location="right"
    width="300"
    permanent
    floating
    class="app-right-drawer"
  >
    <div v-if="shouldRenderRightDrawerContent" class="app-right-drawer-list">
      <SkeletonDrawerRight v-if="isPageSkeletonLoading" />
      <component :is="{ render: rightDrawerRenderer }" v-else />
    </div>
    <v-list v-else nav density="compact" class="app-right-drawer-list" />
    <v-spacer />
    <template #append>
      <v-list-item class="drawer-footer px-0" />
    </template>
  </v-navigation-drawer>
</template>

<style scoped>
.app-right-drawer {
  border-radius: 24px;
  margin-top: 56px;
  margin-right: 16px;
}

.app-right-drawer-list {
  height: calc(100% - 96px);
  min-height: calc(100% - 96px);
  max-height: calc(100% - 96px);
  overflow-y: auto;
}
</style>
