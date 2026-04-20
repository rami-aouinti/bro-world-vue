<script setup lang="ts">
import { useWorldCrmNavItems } from '~/composables/useWorldCrmNavItems'

const route = useRoute()
const { crmNavItems } = useWorldCrmNavItems()

function isNavItemActive(path: string) {
  return route.path === path || route.path.startsWith(`${path}/`)
}
</script>

<template>
  <v-list nav density="compact" class="px-0 app-left-drawer-list">
    <v-list-item
      v-for="item in crmNavItems"
      :key="item.to"
      :to="item.to"
      :prepend-icon="item.icon"
      :title="item.title"
      :active="isNavItemActive(item.to)"
      active-class="text-primary"
      color="primary"
      class="px-0"
    />
  </v-list>
</template>

<style scoped>
.app-left-drawer-list {
  overflow-y: auto;
}

.app-left-drawer-list {
  .v-list-item {
    transition: all 0.2s;
    min-height: 40px;
    padding-block: 0;
    padding-inline: 4px 8px;
  }

  .v-list-item__prepend {
    margin-inline-end: 12px;
  }

  .v-list-group__items {
    padding-block: 0;
  }

  .v-list-group__items .v-list-item {
    min-height: 36px;
    padding-inline-start: calc(var(--v-list-indent) + 24px) !important;
  }
}
</style>
