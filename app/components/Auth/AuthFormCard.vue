<script setup lang="ts">
type SocialProvider = 'github' | 'google' | 'facebook'

const props = withDefaults(
  defineProps<{
    mode: 'login' | 'register'
    loading?: boolean
  }>(),
  {
    loading: false,
  },
)

const emit = defineEmits<{
  submit: [
    payload: {
      name?: string
      email: string
      password: string
      remember?: boolean
      termsAccepted?: boolean
    },
  ]
}>()

const isRegister = computed(() => props.mode === 'register')
const { t } = useI18n()
const form = reactive({
  name: '',
  email: '',
  password: '',
  remember: true,
  termsAccepted: false,
})
const valid = ref(false)
const showPassword = ref(false)
const socialLoadingProvider = ref<SocialProvider | null>(null)
const socialProviders: Array<{ key: SocialProvider; icon: string; label: string }> = [
  {
    key: 'github',
    icon: 'mdi-github',
    label: 'GitHub',
  },
  {
    key: 'google',
    icon: 'mdi-google',
    label: 'Google',
  },
  {
    key: 'facebook',
    icon: 'mdi-facebook',
    label: 'Facebook',
  },
]

const rules = {
  required: (v: string) => !!v || t('auth.validation.required'),
  email: (v: string) =>
    /.+@.+\..+/.test(v) || t('auth.validation.invalidEmail'),
  password: (v: string) => v.length >= 6 || t('auth.validation.minPassword'),
}

function onSubmit() {
  emit('submit', {
    name: isRegister.value ? form.name : undefined,
    email: form.email,
    password: form.password,
    remember: !isRegister.value ? form.remember : undefined,
    termsAccepted: isRegister.value ? form.termsAccepted : undefined,
  })
}

async function onSocialLogin(provider: SocialProvider) {
  if (props.loading || socialLoadingProvider.value) {
    return
  }

  socialLoadingProvider.value = provider

  try {
    if (provider === 'github') {
      await navigateTo(`/api/auth/${provider}`, { external: true })
      return
    }

    Notify.warning('Coming soon')
  }
  finally {
    socialLoadingProvider.value = null
  }
}
</script>

<template>
  <v-card class="auth-card border-radius-xl" elevation="22">
    <v-card-text class="pa-0">
      <div class="bg-gradient-primary pa-6 text-center text-white">
        <h2 class="text-h5 font-weight-bold mb-2">
          {{ isRegister ? t('auth.register.title') : t('auth.login.title') }}
        </h2>
        <p class="text-body-2 opacity-80 mb-0">
          {{
            isRegister ? t('auth.register.subtitle') : t('auth.login.subtitle')
          }}
        </p>
      </div>

      <v-form v-model="valid" class="pa-6" @submit.prevent="onSubmit">
        <v-text-field
          v-if="isRegister"
          v-model="form.name"
          :label="t('auth.fields.name')"
          prepend-inner-icon="mdi-account-outline"
          variant="outlined"
          color="primary"
          :rules="[rules.required]"
          class="mb-2"
        />

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

        <v-text-field
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          :label="t('auth.fields.password')"
          prepend-inner-icon="mdi-lock-outline"
          :append-inner-icon="
            showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
          "
          variant="outlined"
          color="primary"
          :rules="[rules.required, rules.password]"
          class="mb-2"
          @click:append-inner="showPassword = !showPassword"
        />

        <div
          v-if="!isRegister"
          class="d-flex align-center justify-space-between mb-2"
        >
          <v-checkbox
            v-model="form.remember"
            :label="t('auth.login.rememberMe')"
            color="primary"
            hide-details
          />
          <NuxtLink
            to="/forgot-password"
            class="text-body-2 text-primary font-weight-medium text-decoration-none"
          >
            {{ t('auth.forgotPassword.cta') }}
          </NuxtLink>
        </div>

        <v-checkbox
          v-else
          v-model="form.termsAccepted"
          color="primary"
          :rules="[(v: boolean) => v || t('auth.validation.acceptTerms')]"
          class="mb-2"
        >
          <template #label>
            {{ t('auth.register.acceptPrefix') }}
            <a href="#" class="text-primary font-weight-medium ml-1">{{
              t('auth.register.termsLink')
            }}</a>
          </template>
        </v-checkbox>

        <v-btn
          type="submit"
          color="primary"
          size="large"
          block
          class="bg-gradient-primary text-none"
          :loading="loading"
          :disabled="!valid"
        >
          {{ isRegister ? t('auth.register.submit') : t('auth.login.submit') }}
        </v-btn>

        <v-divider class="my-4" />

        <div class="d-flex flex-column ga-2" role="group" aria-label="Social auth">
          <v-btn
            v-for="provider in socialProviders"
            :key="provider.key"
            variant="outlined"
            block
            color="primary"
            class="text-none"
            :prepend-icon="provider.icon"
            :loading="socialLoadingProvider === provider.key"
            :disabled="loading || !!socialLoadingProvider"
            :aria-label="`Continue with ${provider.label}`"
            @click="onSocialLogin(provider.key)"
          >
            Continue with {{ provider.label }}
          </v-btn>
        </div>

        <div class="text-center text-body-2 mt-4">
          <slot name="switch" />
        </div>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.auth-card {
  overflow: hidden;
}
</style>
