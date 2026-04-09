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

const { locale, t } = useI18n()
const { isPageSkeletonVisible } = usePageSkeleton()
const publicPagesStore = usePublicPagesStore()

definePageMeta({ title: 'appbar.contact' })

const asyncKey = computed(() => `public-page-contact-${locale.value}`)

const { data, pending, error, refresh } = await useAsyncData(
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

function resetForm() {
  formState.firstName = ''
  formState.lastName = ''
  formState.email = ''
  formState.topic = ''
  formState.message = ''
}
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #left>
        <SkeletonDrawerLeft v-if="isPageSkeletonVisible || pending || !page" />
        <v-list v-else nav density="compact" class="app-left-drawer-list">
          <v-list-subheader>{{ page.title }}</v-list-subheader>
          <v-list-item
            v-for="channel in page.channels"
            :key="channel.label"
            :prepend-icon="channel.icon"
            :title="channel.label"
            :subtitle="channel.value"
          />
        </v-list>
      </template>

      <template #right>
        <SkeletonDrawerRight v-if="isPageSkeletonVisible || pending || !page" />
        <v-list v-else nav density="compact" class="app-right-drawer-list">
          <v-list-item class="px-0 mb-3">
            <v-card rounded="xl" variant="tonal" color="primary">
              <v-card-item>
                <v-card-title>{{ page.availability.title }}</v-card-title>
                <v-card-subtitle>{{
                  page.availability.description
                }}</v-card-subtitle>
              </v-card-item>
              <v-card-text>
                <div
                  v-for="window in page.availability.windows"
                  :key="window.label"
                  class="mb-2"
                >
                  <div class="text-body-2 font-weight-medium">
                    {{ window.label }}
                  </div>
                  <div class="text-caption text-medium-emphasis">
                    {{ window.value }}
                  </div>
                </div>
              </v-card-text>
            </v-card>
          </v-list-item>
        </v-list>
      </template>
    </AppPageDrawers>

    <v-container class="py-8">
      <SkeletonPageContent v-if="isPageSkeletonVisible || pending || !page" />
      <v-alert
        v-else-if="error"
        type="error"
        variant="tonal"
        :text="String(error)"
      />

      <template v-else-if="page">
        <v-card rounded="xl" class="pa-6 mb-8" variant="tonal" color="primary">
          <v-chip class="mb-3">{{ page.hero.badge }}</v-chip>
          <h1 class="text-h3 mb-2">{{ page.hero.title }}</h1>
          <p class="mb-4">{{ page.hero.subtitle }}</p>
          <div class="d-flex flex-wrap ga-3">
            <v-btn color="primary" variant="flat">{{
              page.hero.primaryCta
            }}</v-btn>
            <v-btn variant="outlined">{{ page.hero.secondaryCta }}</v-btn>
          </div>
        </v-card>

        <v-row class="mb-8" dense>
          <v-col
            v-for="channel in page.channels"
            :key="channel.label"
            cols="12"
            md="6"
          >
            <v-card rounded="xl" variant="outlined">
              <v-card-item>
                <template #prepend
                  ><v-icon :icon="channel.icon" color="primary" class="me-2"
                /></template>
                <v-card-title>{{ channel.label }}</v-card-title>
                <v-card-subtitle>{{ channel.details }}</v-card-subtitle>
              </v-card-item>
              <v-card-text>{{ channel.value }}</v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mb-8" dense>
          <v-col cols="12" md="5">
            <v-card rounded="xl" class="pa-4" height="100%">
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
            </v-card>
          </v-col>
          <v-col cols="12" md="7">
            <v-card rounded="xl" class="pa-4" height="100%">
              <h2 class="text-h6 mb-2">{{ page.form.title }}</h2>
              <p class="text-medium-emphasis mb-4">
                {{ page.form.description }}
              </p>
              <v-row dense>
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
                  <v-select
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
              <div class="d-flex flex-wrap ga-3">
                <v-btn color="primary">{{ page.form.submit }}</v-btn>
                <v-btn variant="outlined" @click="resetForm">{{
                  page.form.reset
                }}</v-btn>
              </div>
            </v-card>
          </v-col>
        </v-row>

        <v-card
          rounded="xl"
          color="primary"
          class="pa-6 text-white"
          elevation="0"
        >
          <h3 class="text-h5 mb-2">{{ page.cta.title }}</h3>
          <p class="mb-4">{{ page.cta.description }}</p>
          <div class="d-flex flex-wrap ga-3">
            <v-btn
              v-for="action in page.cta.actions"
              :key="action.label"
              :variant="action.variant === 'outlined' ? 'outlined' : 'flat'"
              color="white"
            >
              {{ action.label }}
            </v-btn>
          </div>
        </v-card>

        <div class="d-flex justify-end mt-4">
          <v-btn variant="text" prepend-icon="mdi-refresh" @click="refresh">{{
            t('common.refresh')
          }}</v-btn>
        </div>
      </template>
    </v-container>
  </div>
</template>
