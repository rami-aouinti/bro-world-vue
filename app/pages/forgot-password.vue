<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  title: 'appbar.forgotPassword',
  publicPage: true,
})

const { t } = useI18n()

const form = reactive({
  email: '',
})
const valid = ref(false)
const loading = ref(false)

const rules = {
  required: (v: string) => !!v || t('auth.validation.required'),
  email: (v: string) =>
    /.+@.+\..+/.test(v) || t('auth.validation.invalidEmail'),
}

function onSubmit() {
  loading.value = true

  Notify.success(t('auth.notifications.resetLinkSent'))

  loading.value = false
}
</script>

<template>
  <v-container fluid class="auth-page pa-6 pa-md-10">
    <v-row class="fill-height" align="center" justify="center">
      <v-col cols="12" md="7" lg="5">
        <v-card class="auth-card border-radius-xl" elevation="22">
          <v-card-text class="pa-0">
            <div class="bg-gradient-primary pa-6 text-center text-white">
              <h2 class="text-h5 font-weight-bold mb-2">
                {{ t('auth.forgotPassword.title') }}
              </h2>
              <p class="text-body-2 opacity-80 mb-0">
                {{ t('auth.forgotPassword.subtitle') }}
              </p>
            </div>

            <v-form v-model="valid" class="pa-6" @submit.prevent="onSubmit">
              <v-text-field
                v-model="form.email"
                :label="t('auth.fields.email')"
                type="email"
                prepend-inner-icon="mdi-email-outline"
                variant="outlined"
                color="primary"
                :rules="[rules.required, rules.email]"
                class="mb-2"
              />

              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                class="bg-gradient-primary text-none"
                :loading="loading"
                :disabled="!valid"
              >
                {{ t('auth.forgotPassword.submit') }}
              </v-btn>

              <div class="text-center text-body-2 mt-4">
                {{ t('auth.forgotPassword.backToLoginPrefix') }}
                <NuxtLink to="/login" class="text-primary font-weight-bold">
                  {{ t('auth.forgotPassword.backToLoginCta') }}
                </NuxtLink>
              </div>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  background:
    radial-gradient(
      circle at 10% 20%,
      rgb(92 123 229 / 25%) 0%,
      transparent 35%
    ),
    radial-gradient(
      circle at 90% 80%,
      rgb(126 87 194 / 24%) 0%,
      transparent 35%
    ),
    #f8f9fa;
}

.auth-card {
  overflow: hidden;
}
</style>
