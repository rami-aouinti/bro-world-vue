<script setup lang="ts">
const isPageSkeletonLoading = useState('page-skeleton-loading', () => true)
const showRightDrawerDesktop = useState(
  'show-right-drawer-desktop',
  () => true,
)
const showRightDrawerMobile = useState('show-right-drawer-mobile', () => false)
const registry = useDrawerSlotRegistry()
const { lgAndUp, mobile } = useDisplay()

const rightDrawerRenderer = computed(() => registry?.right.value ?? null)
const shouldRenderRightDrawerContent = computed(
  () => Boolean(rightDrawerRenderer.value),
)
const showRightDrawer = computed({
  get: () => (mobile.value ? showRightDrawerMobile.value : showRightDrawerDesktop.value),
  set: (value: boolean) => {
    if (mobile.value) {
      showRightDrawerMobile.value = value
      return
    }

    showRightDrawerDesktop.value = value
  },
})

onMounted(() => {
  if (lgAndUp.value) {
    showRightDrawerDesktop.value = true
  }
})
</script>

<template>
  <v-navigation-drawer
    v-model="showRightDrawer"
    location="right"
    width="300"
    :permanent="lgAndUp"
    :temporary="mobile"
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
