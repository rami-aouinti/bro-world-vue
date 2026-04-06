<script setup lang="ts">
const rightDrawerOpen = useState('right-drawer-open', () => true)
const registry = useDrawerSlotRegistry()
const rightDrawerComponent = computed(() =>
  registry?.right.value
    ? {
        render: registry.right.value,
      }
    : null,
)
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
    <component :is="rightDrawerComponent" v-if="rightDrawerComponent" />
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

:deep(.app-right-drawer-list) {
  height: calc(100% - 96px);
  min-height: calc(100% - 96px);
  max-height: calc(100% - 96px);
  overflow-y: auto;
}
</style>
