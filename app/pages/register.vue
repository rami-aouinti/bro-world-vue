<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  title: 'appbar.register',
  publicPage: true,
})

const { t } = useI18n()

function onSubmit() {
  Notify.success(t('auth.notifications.registerSuccess'))
  navigateTo('/dashboard')
}
</script>

<template>
  <v-container fluid class="auth-page pa-6 pa-md-10">
    <v-row class="fill-height" align="center" justify="center">
      <v-col cols="12" md="7" lg="5">
        <AuthFormCard mode="register" @submit="onSubmit">
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
    radial-gradient(circle at 10% 20%, rgb(92 123 229 / 25%) 0%, transparent 35%),
    radial-gradient(circle at 90% 80%, rgb(126 87 194 / 24%) 0%, transparent 35%),
    #f8f9fa;
}
</style>
