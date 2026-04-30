<script setup lang="ts">
interface HomePageResponse {
  featuresTitle: string
  metricsTitle: string
  stepsTitle: string
  stepLabelPrefix: string
  hero: {
    badge: string
    _title: string
    subtitle: string
    primaryCta: string
    secondaryCta: string
    benefits: string[]
  }
  featureCards: Array<{
    icon: string
    _title: string
    description: string
  }>
  metrics: Array<{
    value: string
    label: string
  }>
  steps: Array<{
    icon: string
    _title: string
    description: string
  }>
  cta: {
    _title: string
    description: string
    primaryAction: string
    secondaryAction: string
  }
}

const { locale, _t } = useI18n()
const { isPageSkeletonVisible } = usePageSkeleton()
const publicPagesStore = usePublicPagesStore()

definePageMeta({
  _title: 'appbar.service',
})

const asyncKey = computed(() => `public-page-home-${locale.value}`)

const { data, pending, error, _refresh } = await useAsyncData(
  asyncKey,
  () => publicPagesStore.fetchPage<HomePageResponse>('home', locale.value),
  {
    watch: [locale],
    default: () =>
      publicPagesStore.getPage<HomePageResponse>('home', locale.value),
  },
)

const page = computed(
  () =>
    data.value ??
    publicPagesStore.getPage<HomePageResponse>('home', locale.value),
)
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #left>
        <SkeletonDrawerLeft v-if="isPageSkeletonVisible || pending || !page" />
        <div v-else class="mb-4 pa-3">
          <h3 class="text-h3 font-weight-bold mb-3">{{ page.hero.title }}</h3>
          <p class="text-body-1 _text-medium-emphasis mb-5">
            {{ page.hero.subtitle }}
          </p>
          <div class="d-flex flex-wrap ga-3">
            <v-btn color="primary" size="large">{{
              page.hero.primaryCta
            }}</v-btn>
            <v-btn variant="outlined" size="large">{{
              page.hero.secondaryCta
            }}</v-btn>
          </div>
        </div>
      </template>

      <template #right>
        <SkeletonDrawerRight v-if="isPageSkeletonVisible || pending || !page" />
        <div v-else class="d-flex flex-column gap-4">
          <v-list nav density="comfortable" class="app-left-drawer-list">
            <v-list-subheader class="text-overline">{{
              page.hero.badge
            }}</v-list-subheader>
            <v-list-item
              v-for="(benefit, index) in page.hero.benefits"
              :key="benefit"
              prepend-icon="mdi-check-circle-outline"
              :title="benefit"
              :subtitle="`${page.stepLabelPrefix} ${index + 1}`"
            />
          </v-list>
          <v-list nav density="comfortable" class="app-right-drawer-list">
            <v-list-item class="px-0">
              <v-card rounded="xl" variant="tonal" color="primary">
                <v-card-item>
                  <template #prepend>
                    <v-icon icon="mdi-lightning-bolt-outline" class="me-2" />
                  </template>
                  <v-card-title class="text-subtitle-1">{{
                    page.cta.title
                  }}</v-card-title>
                  <v-card-subtitle>{{ page.cta.description }}</v-card-subtitle>
                </v-card-item>
                <v-card-actions>
                  <v-btn color="primary" variant="flat" block>{{
                    page.cta.primaryAction
                  }}</v-btn>
                </v-card-actions>
              </v-card>
            </v-list-item>
          </v-list>
        </div>
      </template>
    </AppPageDrawers>

    <v-container>
      <SkeletonPageContent v-if="isPageSkeletonVisible || pending || !page" />

      <v-alert
        v-else-if="error"
        _type="error"
        variant="tonal"
        class="mb-6"
        :text="String(error)"
      />

      <template v-else-if="page">
        <h2 class="text-h5 font-weight-bold mb-3">{{ page.featuresTitle }}</h2>
        <v-row class="mb-3" density="comfortable">
          <v-col
            v-for="feature in page.featureCards"
            :key="feature.title"
            cols="12"
            md="4"
          >
            <v-card rounded="xl" height="100%" variant="outlined" class="pa-2">
              <v-card-item>
                <template #prepend>
                  <v-icon
                    :icon="feature.icon"
                    color="primary"
                    size="28"
                    class="me-2"
                  />
                </template>
                <v-card-title>{{ feature.title }}</v-card-title>
              </v-card-item>
              <v-card-text>{{ feature.description }}</v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <h2 class="text-h5 font-weight-bold mb-4">{{ page.metricsTitle }}</h2>
        <v-row class="mb-8" density="comfortable">
          <v-col
            v-for="metric in page.metrics"
            :key="metric.label"
            cols="12"
            sm="4"
          >
            <v-card rounded="xl" variant="tonal" color="primary">
              <v-card-text class="text-center py-8">
                <div class="text-h4 font-weight-black">{{ metric.value }}</div>
                <div class="text-body-2 _text-medium-emphasis">
                  {{ metric.label }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <h2 class="text-h5 font-weight-bold mb-4">{{ page.stepsTitle }}</h2>
        <v-row class="mb-8" density="comfortable">
          <v-col
            v-for="(step, index) in page.steps"
            :key="step.title"
            cols="12"
            md="4"
          >
            <v-card rounded="xl" variant="outlined" height="100%">
              <v-card-item>
                <template #prepend>
                  <v-avatar color="primary" variant="tonal" class="me-2">
                    <v-icon :icon="step.icon" />
                  </v-avatar>
                </template>
                <v-card-title>{{
                  `${page.stepLabelPrefix} ${index + 1}`
                }}</v-card-title>
                <v-card-subtitle>{{ step.title }}</v-card-subtitle>
              </v-card-item>
              <v-card-text>{{ step.description }}</v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-card
          rounded="xl"
          color="primary"
          class="pa-6 _text-white"
          elevation="0"
        >
          <h3 class="text-h5 mb-2">{{ page.cta.title }}</h3>
          <p class="mb-4">{{ page.cta.description }}</p>
          <div class="d-flex flex-wrap ga-3">
            <v-btn color="white" variant="flat">{{
              page.cta.primaryAction
            }}</v-btn>
            <v-btn color="white" variant="outlined">{{
              page.cta.secondaryAction
            }}</v-btn>
          </div>
        </v-card>
      </template>
    </v-container>
  </div>
</template>

<style scoped>
.hero-card {
  background: linear-gradient(
    135deg,
    rgba(25, 118, 210, 0.08),
    rgba(126, 87, 194, 0.12)
  );
}
</style>
