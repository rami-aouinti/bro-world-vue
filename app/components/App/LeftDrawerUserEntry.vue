<script setup lang="ts">
import type { SessionUser } from '~/types/session'

const { t } = useI18n()
const route = useRoute()
const { loggedIn, user } = useUserSession()

const sessionUser = computed(() => user.value as SessionUser | null)
const avatarUrl = computed(() => sessionUser.value?.photo)
const coins = computed(() => sessionUser.value?.coins ?? 0)
const fullName = computed(() => {
  const values = [sessionUser.value?.firstName, sessionUser.value?.lastName]
    .filter(Boolean)
    .join(' ')

  return values || sessionUser.value?.username || t('appbar.user')
})

function navigateToLogin() {
  navigateTo({
    path: '/login',
    query: {
      redirect: route.fullPath,
    },
  })
}
</script>

<template>
  <NuxtLink
    v-if="loggedIn"
    to="/profile"
    class="d-flex align-center text-center ga-3"
    style="text-decoration: none; color: inherit"
  >
    <div class="d-flex align-center text-center ga-3">
      <v-avatar size="60">
        <v-img :src="avatarUrl" :alt="`${fullName} avatar`" />
      </v-avatar>
      <div>
        <h3 class="my-0">{{ fullName }}</h3>
        <v-chip
          color="primary"
          size="small"
          variant="outlined"
          prepend-icon="mdi-cash-multiple"
          label
        >
          {{ coins }} coins
        </v-chip>
      </div>
    </div>
  </NuxtLink>
  <v-btn
    v-else
    block
    color="primary"
    prepend-icon="mdi-login"
    class="text-none"
    @click="navigateToLogin"
  >
    {{ t('appbar.login') }}
  </v-btn>
</template>
