<script setup lang="ts">
import LeftDrawerUserEntry from '~/components/App/LeftDrawerUserEntry.vue'

const route = useRoute()

const profileNavItems = [
  {
    label: 'Friends',
    to: '/profile/friends',
    icon: 'mdi-account-group-outline',
  },
  { label: 'Library', to: '/profile/library', icon: 'mdi-bookshelf' },
  { label: 'Posts', to: '/profile/posts', icon: 'mdi-post-outline' },
  { label: 'Applications', to: '/profile/applications', icon: 'mdi-apps' },
  {
    label: 'Games',
    to: '/profile/games',
    icon: 'mdi-controller-classic-outline',
  },
  { label: 'Settings', to: '/profile/settings', icon: 'mdi-cog-outline' },
]
</script>

<template>
  <v-list nav density="compact" class="px-0 app-left-drawer-list">
    <v-list-item
      v-for="item in profileNavItems"
      :key="item.to"
      :to="item.to"
      :prepend-icon="item.icon"
      :title="item.label"
      :active="route.path === item.to"
      active-class="text-primary"
      color="primary"
      class="px-0"
    />
  </v-list>
</template>
<style scoped>
.app-left-drawer-list {
  height: calc(100% - 96px);
  min-height: calc(100% - 96px);
  max-height: calc(100% - 96px);
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
