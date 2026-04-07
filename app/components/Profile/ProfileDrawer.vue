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
  { label: 'Friends', to: '/profile/friends', icon: 'mdi-account-group-outline' },
  { label: 'Library', to: '/profile/library', icon: 'mdi-bookshelf' },
  { label: 'Posts', to: '/profile/posts', icon: 'mdi-post-outline' },
  { label: 'Applications', to: '/profile/applications', icon: 'mdi-apps' },
  { label: 'Games', to: '/profile/games', icon: 'mdi-controller-classic-outline' },
  { label: 'Settings', to: '/profile/settings', icon: 'mdi-cog-outline' },
]
</script>

<template>
  <v-card-text>
    <NuxtLink to="/profile" class="d-flex align-center text-center ga-3" style="text-decoration: none; color: inherit;">
      <div class="d-flex align-center text-center ga-3">
        <v-avatar size="48">
          <v-img :src="avatarUrl" />
        </v-avatar>
        <div>
          <h2>{{ fullName }}</h2>
        </div>
      </div>
    </NuxtLink>

    <v-divider class="my-4" />

    <v-list nav density="comfortable">
      <v-list-item
        v-for="item in profileNavItems"
        :key="item.to"
        :to="item.to"
        :prepend-icon="item.icon"
        :title="item.label"
        :active="route.path === item.to"
        color="primary"
        rounded="lg"
      />
    </v-list>
  </v-card-text>
</template>
