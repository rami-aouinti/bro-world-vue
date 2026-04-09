<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  title: 'appbar.register',
  publicPage: true,
  middleware: 'guest',
})

const { t } = useI18n()
const { fetch: refreshSession, loggedIn } = useUserSession()
const loading = ref(false)

async function onSubmit(payload: {
  email: string
  password: string
  repeatPassword?: string
}) {
  if (!payload.repeatPassword) {
    Notify.error(t('auth.validation.required'))
    return
  }

  loading.value = true

  try {
    await $fetch('/api/register', {
      method: 'POST',
      body: {
        email: payload.email,
        password: payload.password,
        repeatPassword: payload.repeatPassword,
      },
    })

    await refreshSession()

    if (!loggedIn.value) {
      Notify.error(t('auth.notifications.registerError'))
      return
    }

    Notify.success(t('auth.notifications.registerSuccess'))
    await navigateTo('/')
  } catch {
    Notify.error(t('auth.notifications.registerError'))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <v-container fluid class="auth-page pa-6 pa-md-10 d-flex align-center justify-center">
    <v-row class="fill-height" align="center" justify="center">
      <v-col cols="12" md="7" lg="5">
        <AuthFormCard mode="register" :loading="loading" @submit="onSubmit">
          <template #switch>
            {{ t('auth.register.switchPrompt') }}
            <NuxtLink to="/login" class="text-primary font-weight-bold">
              {{ t('auth.register.switchCta') }}
            </NuxtLink>
          </template>
        </AuthFormCard>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  background:
    linear-gradient(rgb(10 15 36 / 55%), rgb(10 15 36 / 55%)),
    url('/cover.webp') center / cover no-repeat;
}
</style>
