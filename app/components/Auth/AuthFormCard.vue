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
      username?: string
      email: string
      password: string
      repeatPassword?: string
      remember?: boolean
    },
  ]
}>()

const isRegister = computed(() => props.mode === 'register')
const { t } = useI18n()
const form = reactive({
  email: '',
  password: '',
  repeatPassword: '',
  remember: true,
})
const valid = ref(false)
const showPassword = ref(false)
const showRepeatPassword = ref(false)
const socialLoadingProvider = ref<SocialProvider | null>(null)
const socialProviders: Array<{
  key: SocialProvider
  icon: string
  label: string
}> = [
  {
    key: 'github',
    icon: 'mdi-github',
    label: t('auth.social.github'),
  },
  {
    key: 'google',
    icon: 'mdi-google',
    label: t('auth.social.google'),
  },
  {
    key: 'facebook',
    icon: 'mdi-facebook',
    label: t('auth.social.facebook'),
  },
]

const rules = {
  required: (v: string) => !!v || t('auth.validation.required'),
  email: (v: string) =>
    /.+@.+\..+/.test(v) || t('auth.validation.invalidEmail'),
  password: (v: string) => v.length >= 6 || t('auth.validation.minPassword'),
  repeatPassword: (v: string) =>
    v === form.password || t('auth.validation.passwordMismatch'),
}

function onSubmit() {
  emit('submit', {
    username: !isRegister.value ? form.email : undefined,
    email: form.email,
    password: form.password,
    repeatPassword: isRegister.value ? form.repeatPassword : undefined,
    remember: !isRegister.value ? form.remember : undefined,
  })
}

async function onSocialLogin(provider: SocialProvider) {
  if (props.loading || socialLoadingProvider.value) {
    return
  }

  socialLoadingProvider.value = provider

  try {
    await navigateTo(`/api/auth/${provider}`, { external: true })
  } catch {
    Notify.error(t('auth.notifications.loginError'))
  } finally {
    socialLoadingProvider.value = null
  }
}
</script>

<template>
  <v-card class="auth-card border-radius-xl" elevation="22">
    <v-card-text class="pa-0">
      <div class="bg-primary pa-6 text-center">
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
        <div v-if="!isRegister" class="social-icons-wrap mb-5">
          <div
            class="d-flex justify-center ga-2"
            role="group"
            :aria-label="t('auth.social.groupAria')"
          >
            <v-btn
              v-for="provider in socialProviders"
              :key="provider.key"
              icon
              variant="tonal"
              color="primary"
              class="social-icon-btn"
              :loading="socialLoadingProvider === provider.key"
              :disabled="loading || !!socialLoadingProvider"
              :aria-label="
                t('auth.social.continueWith', { provider: provider.label })
              "
              @click="onSocialLogin(provider.key)"
            >
              <v-icon>{{ provider.icon }}</v-icon>
            </v-btn>
          </div>
          <div class="social-divider mt-2 mb-1">
            <v-divider />
            <span class="text-medium-emphasis font-weight-medium px-3">or</span>
            <v-divider />
          </div>
        </div>

        <v-text-field
          v-model="form.email"
          :label="
            isRegister ? t('auth.fields.email') : t('auth.fields.username')
          "
          :type="isRegister ? 'email' : 'text'"
          :prepend-inner-icon="
            isRegister ? 'mdi-email-outline' : 'mdi-account-outline'
          "
          density="compact"
          variant="outlined"
          color="primary"
          :rules="isRegister ? [rules.required, rules.email] : [rules.required]"
          class="mb-1"
        />

        <v-text-field
          v-model="form.password"
          :type="showPassword ? 'text' : 'password'"
          :label="t('auth.fields.password')"
          prepend-inner-icon="mdi-lock-outline"
          :append-inner-icon="
            showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
          "
          density="compact"
          variant="outlined"
          color="primary"
          :rules="[rules.required, rules.password]"
          class="mb-1"
          @click:append-inner="showPassword = !showPassword"
        />

        <v-text-field
          v-if="isRegister"
          v-model="form.repeatPassword"
          :type="showRepeatPassword ? 'text' : 'password'"
          :label="t('auth.fields.repeatPassword')"
          prepend-inner-icon="mdi-lock-check-outline"
          :append-inner-icon="
            showRepeatPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'
          "
          density="compact"
          variant="outlined"
          color="primary"
          :rules="[rules.required, rules.repeatPassword]"
          class="mb-1"
          @click:append-inner="showRepeatPassword = !showRepeatPassword"
        />

        <div
          v-if="!isRegister"
          class="d-flex align-center justify-space-between mb-1"
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
            {{ t('auth.login.forgotPassword') }}
          </NuxtLink>
        </div>

        <v-btn
          type="submit"
          block
          size="large"
          color="primary"
          :loading="loading"
          class="bg-primary text-none"
          :disabled="!valid"
        >
          {{ isRegister ? t('auth.register.submit') : t('auth.login.submit') }}
        </v-btn>

        <div class="text-center text-body-2 mt-4 text-medium-emphasis">
          <slot name="switch" />
        </div>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.auth-card {
  backdrop-filter: blur(6px);
}

.social-icon-btn {
  width: 42px;
  height: 42px;
}

.social-divider {
  display: flex;
  align-items: center;
}
</style>
