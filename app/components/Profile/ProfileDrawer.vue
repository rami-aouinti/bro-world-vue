<script setup lang="ts">
import type { SessionUser } from '~/types/session'

const route = useRoute()
const { t } = useI18n()
const { user } = useUserSession()

const sessionUser = computed(() => user.value as SessionUser | null)
const avatarUrl = computed(() => sessionUser.value?.photo)
const fullName = computed(() => {
  const values = [sessionUser.value?.firstName, sessionUser.value?.lastName]
    .filter(Boolean)
    .join(' ')

  return values || sessionUser.value?.username || t('appbar.user')
})

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
  <NuxtLink
    to="/profile"
    class="d-flex align-center text-center ga-3"
    style="text-decoration: none; color: inherit"
  >
    <div class="d-flex align-center text-center ga-3">
      <v-avatar size="32">
        <v-img :src="avatarUrl" :alt="`${fullName} avatar`" />
      </v-avatar>
      <div>
        <h3>{{ fullName }}</h3>
      </div>
    </div>
  </NuxtLink>

  <v-divider class="my-1" />

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
