<script setup lang="ts">
import type { SessionUser } from '~/types/session'

const { t } = useI18n()
const { fetch: refreshSession, loggedIn, user } = useUserSession()

const loginDialogOpen = ref(false)
const loading = ref(false)

const sessionUser = computed(() => user.value as SessionUser | null)
const avatarUrl = computed(() => sessionUser.value?.photo)
const coins = computed(() => sessionUser.value?.coins ?? 0)
const fullName = computed(() => {
  const values = [sessionUser.value?.firstName, sessionUser.value?.lastName]
    .filter(Boolean)
    .join(' ')

  return values || sessionUser.value?.username || t('appbar.user')
})

watch(loggedIn, (isLoggedIn) => {
  if (isLoggedIn) {
    loginDialogOpen.value = false
  }
})

async function onLoginSubmit(payload: { username?: string; password: string }) {
  if (!payload.username) {
    Notify.error(t('auth.validation.required'))
    return
  }

  loading.value = true

  try {
    await $fetch('/api/login', {
      method: 'POST',
      body: {
        username: payload.username,
        password: payload.password,
      },
    })

    await refreshSession()

    if (!loggedIn.value) {
      Notify.error(t('auth.notifications.loginError'))
      return
    }

    Notify.success(t('auth.notifications.loginSuccess'))
    loginDialogOpen.value = false
  } catch {
    Notify.error(t('auth.notifications.loginError'))
  } finally {
    loading.value = false
  }
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
      <v-avatar size="32">
        <v-img :src="avatarUrl" :alt="`${fullName} avatar`" />
      </v-avatar>
      <div>
        <h3 class="mb-1">{{ fullName }}</h3>
        <v-chip
          color="amber-darken-2"
          size="small"
          variant="flat"
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
    @click="loginDialogOpen = true"
  >
    {{ t('appbar.login') }}
  </v-btn>

  <v-dialog v-model="loginDialogOpen" max-width="560">
    <AuthFormCard mode="login" :loading="loading" @submit="onLoginSubmit">
      <template #switch>
        {{ t('auth.login.switchPrompt') }}
        <NuxtLink to="/register" class="text-primary font-weight-bold">
          {{ t('auth.login.switchCta') }}
        </NuxtLink>
      </template>
    </AuthFormCard>
  </v-dialog>
</template>
