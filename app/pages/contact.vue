<script setup lang="ts">
interface ContactPageResponse {
  title: string
  hero: {
    badge: string
    title: string
    subtitle: string
    primaryCta: string
    secondaryCta: string
  }
  channels: Array<{
    label: string
    value: string
    details: string
    icon: string
  }>
  availability: {
    title: string
    description: string
    windows: Array<{
      label: string
      value: string
    }>
    escalationTitle: string
    escalationBullets: string[]
  }
  form: {
    title: string
    description: string
    fields: {
      firstName: string
      lastName: string
      email: string
      topic: string
      message: string
      messagePlaceholder: string
    }
    topics: Array<{ value: string; label: string }>
    privacyNote: string
    submit: string
    reset: string
  }
  cta: {
    title: string
    description: string
    actions: Array<{ label: string; variant: 'primary' | 'outlined' | string }>
  }
}

const { locale } = useI18n()
const { isPageSkeletonVisible } = usePageSkeleton()
const publicPagesStore = usePublicPagesStore()

definePageMeta({ title: 'appbar.contact' })

const asyncKey = computed(() => `public-page-contact-${locale.value}`)

const { data, pending, error } = await useAsyncData(
  asyncKey,
  () =>
    publicPagesStore.fetchPage<ContactPageResponse>('contact', locale.value),
  {
    watch: [locale],
    default: () =>
      publicPagesStore.getPage<ContactPageResponse>('contact', locale.value),
  },
)

const page = computed(
  () =>
    data.value ??
    publicPagesStore.getPage<ContactPageResponse>('contact', locale.value),
)

const formState = reactive({
  firstName: '',
  lastName: '',
  email: '',
  topic: '',
  message: '',
})
const submitPending = ref(false)
const submitError = ref<string | null>(null)
const submitSuccessId = ref<string | number | null>(null)

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const canSubmit = computed(
  () =>
    Boolean(
      formState.firstName.trim() &&
        formState.lastName.trim() &&
        formState.email.trim() &&
        formState.topic.trim() &&
        formState.message.trim() &&
        emailPattern.test(formState.email.trim()),
    ),
)

function resetForm() {
  formState.firstName = ''
  formState.lastName = ''
  formState.email = ''
  formState.topic = ''
  formState.message = ''
}

function clearFormState() {
  resetForm()
  submitError.value = null
  submitSuccessId.value = null
}

async function submitContactForm() {
  submitError.value = null
  submitSuccessId.value = null

  const payload = {
    firstName: formState.firstName.trim(),
    lastName: formState.lastName.trim(),
    email: formState.email.trim().toLowerCase(),
    type: formState.topic.trim(),
    message: formState.message.trim(),
  }

  if (
    !payload.firstName ||
    !payload.lastName ||
    !payload.email ||
    !payload.type ||
    !payload.message
  ) {
    submitError.value = 'Tous les champs sont requis.'
    return
  }

  if (!emailPattern.test(payload.email)) {
    submitError.value = 'Adresse email invalide.'
    return
  }

  submitPending.value = true

  try {
    const response = await $fetch<{ id?: string | number; data?: { id?: string | number } }>(
      '/api/page/public/contact',
      {
        method: 'POST',
        body: payload,
      },
    )

    resetForm()
    submitSuccessId.value = response.id ?? response.data?.id ?? null
  } catch (err) {
    submitError.value = (err as Error)?.message || 'Une erreur est survenue.'
  } finally {
    submitPending.value = false
  }
}
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #left>
        <SkeletonDrawerLeft v-if="isPageSkeletonVisible || pending || !page" />
        <div v-else>
          <h2 class="text-h6 mb-2">{{ page.availability.title }}</h2>
          <p class="text-medium-emphasis mb-3">
            {{ page.availability.description }}
          </p>
          <v-list bg-color="transparent" density="compact">
            <v-list-item
              v-for="window in page.availability.windows"
              :key="window.label"
              :title="window.label"
              :subtitle="window.value"
              prepend-icon="mdi-clock-outline"
            />
          </v-list>
          <h3 class="text-subtitle-1 mt-4 mb-2">
            {{ page.availability.escalationTitle }}
          </h3>
          <v-chip
            v-for="step in page.availability.escalationBullets"
            :key="step"
            class="me-2 mb-2"
            size="small"
            color="primary"
            variant="tonal"
            >{{ step }}</v-chip
          >
        </div>
      </template>

      <template #right>
        <SkeletonDrawerRight v-if="isPageSkeletonVisible || pending || !page" />
        <div v-else>
          <v-chip class="mb-3">{{ page.hero.badge }}</v-chip>
          <h1 class="text-h3 mb-2">{{ page.hero.title }}</h1>
          <p class="mb-4">{{ page.hero.subtitle }}</p>
          <div class="d-flex flex-wrap ga-3">
            <v-btn color="primary" variant="flat">{{
              page.hero.primaryCta
            }}</v-btn>
            <v-btn variant="outlined">{{ page.hero.secondaryCta }}</v-btn>
          </div>
        </div>
      </template>
    </AppPageDrawers>

    <v-container>
      <SkeletonPageContent v-if="isPageSkeletonVisible || pending || !page" />
      <v-alert
        v-else-if="error"
        type="error"
        variant="tonal"
        :text="String(error)"
      />

      <template v-else-if="page">
        <v-card rounded="xl" class="mb-4 pa-6 postcard-gradient-card">
          <h1 class="text-h6 mb-2">{{ page.form.title }}</h1>
          <v-row density="comfortable">
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="formState.firstName"
                :label="page.form.fields.firstName"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="formState.lastName"
                :label="page.form.fields.lastName"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <v-text-field
                v-model="formState.email"
                :label="page.form.fields.email"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12" sm="6">
              <AppSelect
                v-model="formState.topic"
                :label="page.form.fields.topic"
                :items="page.form.topics"
                item-title="label"
                item-value="value"
                variant="outlined"
                density="comfortable"
              />
            </v-col>
            <v-col cols="12">
              <v-textarea
                v-model="formState.message"
                :label="page.form.fields.message"
                :placeholder="page.form.fields.messagePlaceholder"
                variant="outlined"
                rows="4"
              />
            </v-col>
          </v-row>
          <p class="text-caption text-medium-emphasis mb-3">
            {{ page.form.privacyNote }}
          </p>
          <v-alert
            v-if="submitError"
            class="mb-3"
            type="error"
            variant="tonal"
            :text="submitError"
          />
          <v-alert
            v-if="submitSuccessId"
            class="mb-3"
            type="success"
            variant="tonal"
            :text="`Message envoyé (ID: ${submitSuccessId})`"
          />
          <div class="d-flex flex-wrap ga-3">
            <v-btn
              color="primary"
              :disabled="!canSubmit"
              :loading="submitPending"
              @click="submitContactForm"
            >
              {{ page.form.submit }}
            </v-btn>
            <v-btn variant="outlined" @click="clearFormState">{{
              page.form.reset
            }}</v-btn>
          </div>
        </v-card>
      </template>
    </v-container>
  </div>
</template>
<style scoped></style>
