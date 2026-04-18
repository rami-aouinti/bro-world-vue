<script setup lang="ts">
import type { SessionUser } from '~/types/session'

const route = useRoute()
const { user } = useUserSession()

const sessionUser = computed(() => user.value as SessionUser | null)
const isRoot = computed(
  () => sessionUser.value?.roles?.includes('ROLE_ROOT') ?? false,
)

type ProfileNavItem = {
  label: string
  to: string
  icon: string
  rootOnly?: boolean
}

const profileNavItems: ProfileNavItem[] = [
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
  { label: 'Calendar', to: '/calendar', icon: 'mdi-calendar-month-outline' },
  { label: 'Inbox', to: '/inbox', icon: 'mdi-inbox-outline' },
  {
    label: 'Notifications',
    to: '/notification',
    icon: 'mdi-bell-outline',
  },
  { label: 'Admin', to: '/admin', icon: 'mdi-shield-crown-outline', rootOnly: true },
  { label: 'Settings', to: '/profile/settings', icon: 'mdi-cog-outline' },
]

const visibleNavItems = computed(() =>
  profileNavItems.filter((item) => !item.rootOnly || isRoot.value),
)
function isNavItemActive(item: ProfileNavItem) {
  return route.path === item.to || route.path.startsWith(`${item.to}/`)
}

</script>

<template>
  <v-list nav density="compact" class="px-0 app-left-drawer-list">
    <v-list-item
      v-for="item in visibleNavItems"
      :key="item.to"
      :to="item.to"
      :prepend-icon="item.icon"
      :title="item.label"
      :active="isNavItemActive(item)"
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
