<script setup lang="ts">
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
  submit: [payload: {
    name?: string
    email: string
    password: string
    remember?: boolean
    termsAccepted?: boolean
  }]
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

const rules = {
  required: (v: string) => !!v || t('auth.validation.required'),
  email: (v: string) => /.+@.+\..+/.test(v) || t('auth.validation.invalidEmail'),
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
            isRegister
              ? t('auth.register.subtitle')
              : t('auth.login.subtitle')
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
          :append-inner-icon="showPassword ? 'mdi-eye-off-outline' : 'mdi-eye-outline'"
          variant="outlined"
          color="primary"
          :rules="[rules.required, rules.password]"
          @click:append-inner="showPassword = !showPassword"
          class="mb-2"
        />

        <v-checkbox
          v-if="!isRegister"
          v-model="form.remember"
          :label="t('auth.login.rememberMe')"
          color="primary"
          hide-details
          class="mb-2"
        />

        <v-checkbox
          v-else
          v-model="form.termsAccepted"
          color="primary"
          :rules="[(v: boolean) => v || t('auth.validation.acceptTerms')]"
          class="mb-2"
        >
          <template #label>
            {{ t('auth.register.acceptPrefix') }}
            <a href="#" class="text-primary font-weight-medium ml-1">{{ t('auth.register.termsLink') }}</a>
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
