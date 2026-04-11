<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  title: 'appbar.login',
  publicPage: true,
  middleware: 'guest',
})

const { t } = useI18n()
const { fetch: refreshSession, loggedIn } = useUserSession()
const route = useRoute()
const loading = ref(false)

const redirectPath = computed(() => {
  const redirectQuery = route.query.redirect
  const redirect = Array.isArray(redirectQuery)
    ? redirectQuery[0]
    : redirectQuery

  if (typeof redirect !== 'string' || !redirect.startsWith('/')) {
    return '/'
  }

  return redirect
})

async function onSubmit(payload: { username?: string; password: string }) {
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
    await navigateTo(redirectPath.value)
  } catch {
    Notify.error(t('auth.notifications.loginError'))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-container
    fluid
    class="auth-page px-3 py-4 px-md-10 py-md-10 d-flex align-center justify-center"
  >
    <v-row class="fill-height" align="center" justify="center">
      <v-col cols="12" md="7" lg="5">
        <AuthFormCard mode="login" :loading="loading" @submit="onSubmit">
          <template #switch>
            {{ t('auth.login.switchPrompt') }}
            <NuxtLink to="/register" class="text-primary font-weight-bold">
              {{ t('auth.login.switchCta') }}
            </NuxtLink>
          </template>
        </AuthFormCard>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.auth-page {
  min-height: 100dvh;
  padding-block: clamp(12px, 4vh, 32px);
  background:
    linear-gradient(rgb(10 15 36 / 55%), rgb(10 15 36 / 55%)),
    url('/cover.webp') center / cover no-repeat;
}
</style>
