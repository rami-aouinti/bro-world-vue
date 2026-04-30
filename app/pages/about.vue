<script setup lang="ts">
interface AboutPageResponse {
  hero: {
    badge: string
    _title: string
    subtitle: string
    paragraphs: string[]
    bullets: string[]
    primaryCta: string
    secondaryCta: string
  }
  metricsTitle: string
  missionCards: Array<{
    _title: string
    description: string
    paragraphs: string[]
    bullets: string[]
    icon: string
  }>
  metrics: Array<{
    value: string
    label: string
    context: string
    icon: string
  }>
  _timelineTitle: string
  _timeline: Array<{
    _title: string
    period: string
    description: string
    highlights: string[]
    icon: string
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

definePageMeta({ _title: 'appbar.about' })

const asyncKey = computed(() => `public-page-about-${locale.value}`)

const { data, pending, error, _refresh } = await useAsyncData(
  asyncKey,
  () => publicPagesStore.fetchPage<AboutPageResponse>('about', locale.value),
  {
    watch: [locale],
    default: () =>
      publicPagesStore.getPage<AboutPageResponse>('about', locale.value),
  },
)

const page = computed(
  () =>
    data.value ??
    publicPagesStore.getPage<AboutPageResponse>('about', locale.value),
)
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #left>
        <SkeletonDrawerLeft v-if="isPageSkeletonVisible || pending || !page" />
        <div v-else class="d-flex flex-column gap-4">
          <h3 class="text-h5 _text-white mb-2">{{ page.cta.title }}</h3>
          <p class="text-white mb-4">{{ page.cta.description }}</p>
          <div class="d-flex flex-wrap ga-3">
            <v-btn color="white" variant="flat">{{
              page.cta.primaryAction
            }}</v-btn>
            <v-btn color="white" variant="outlined">{{
              page.cta.secondaryAction
            }}</v-btn>
          </div>
        </div>
      </template>

      <template #right>
        <SkeletonDrawerRight v-if="isPageSkeletonVisible || pending || !page" />
        <div v-else class="d-flex flex-column gap-4">
          <v-list nav density="compact" class="app-left-drawer-list">
            <v-list-subheader class="text-overline">{{
              page.hero.badge
            }}</v-list-subheader>
            <v-list-item
              v-for="card in page.missionCards"
              :key="card.title"
              :prepend-icon="card.icon"
              :title="card.title"
              :subtitle="card.description"
            />
          </v-list>
          <v-list nav density="compact" class="app-right-drawer-list">
            <v-list-item
              v-for="metric in page.metrics"
              :key="metric.label"
              class="px-0 mb-3"
            >
              <v-card rounded="xl" variant="tonal" color="primary">
                <v-card-item>
                  <template #prepend
                    ><v-icon :icon="metric.icon" class="me-2"
                  /></template>
                  <v-card-title>{{ metric.value }}</v-card-title>
                  <v-card-subtitle>{{ metric.label }}</v-card-subtitle>
                </v-card-item>
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
        :text="String(error)"
      />
      <template v-else-if="page">
        <v-card rounded="xl" class="mb-8 pa-6" variant="tonal" color="primary">
          <v-chip variant="flat" class="mb-3">{{ page.hero.badge }}</v-chip>
          <h1 class="text-h3 mb-3">{{ page.hero.title }}</h1>
          <p class="mb-3">{{ page.hero.subtitle }}</p>
          <p
            v-for="paragraph in page.hero.paragraphs"
            :key="paragraph"
            class="mb-2"
          >
            {{ paragraph }}
          </p>
          <v-list
            lines="one"
            density="compact"
            bg-color="transparent"
            class="mb-2"
          >
            <v-list-item
              v-for="bullet in page.hero.bullets"
              :key="bullet"
              prepend-icon="mdi-check-circle-outline"
              :title="bullet"
            />
          </v-list>
          <div class="d-flex flex-wrap ga-3 mt-4">
            <v-btn color="primary" variant="flat">{{
              page.hero.primaryCta
            }}</v-btn>
            <v-btn variant="outlined">{{ page.hero.secondaryCta }}</v-btn>
          </div>
        </v-card>

        <h2 class="text-h5 font-weight-bold mb-4">{{ page.metricsTitle }}</h2>
        <v-row class="mb-8" density="comfortable">
          <v-col
            v-for="metric in page.metrics"
            :key="metric.label"
            cols="12"
            md="4"
          >
            <v-card
              rounded="xl"
              variant="outlined"
              height="100%"
              class="postcard-gradient-card"
            >
              <v-card-text class="text-center py-7">
                <v-icon
                  :icon="metric.icon"
                  color="primary"
                  size="30"
                  class="mb-2"
                />
                <div class="text-h4 font-weight-black">{{ metric.value }}</div>
                <div class="text-body-1">{{ metric.label }}</div>
                <div class="text-caption _text-medium-emphasis">
                  {{ metric.context }}
                </div>
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <v-row class="mb-8" density="comfortable">
          <v-col
            v-for="card in page.missionCards"
            :key="card.title"
            cols="12"
            md="6"
          >
            <v-card
              rounded="xl"
              height="100%"
              class="pa-2 postcard-gradient-card"
            >
              <v-card-item>
                <template #prepend
                  ><v-icon :icon="card.icon" color="primary" class="me-2"
                /></template>
                <v-card-title>{{ card.title }}</v-card-title>
                <v-card-subtitle>{{ card.description }}</v-card-subtitle>
              </v-card-item>
              <v-card-text>
                <p
                  v-for="paragraph in card.paragraphs"
                  :key="paragraph"
                  class="mb-2"
                >
                  {{ paragraph }}
                </p>
                <v-chip
                  v-for="bullet in card.bullets"
                  :key="bullet"
                  class="me-2 mb-2"
                  variant="outlined"
                  size="small"
                  >{{ bullet }}</v-chip
                >
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>

        <h2 class="text-h5 font-weight-bold mb-4">{{ page.timelineTitle }}</h2>
        <v-timeline
          side="end"
          align="start"
          density="comfortable"
          _truncate-line="both"
        >
          <v-timeline-item
            v-for="item in page.timeline"
            :key="item.title"
            :dot-color="'primary'"
            fill-dot
            size="small"
          >
            <template #icon><v-icon :icon="item.icon" size="18" /></template>
            <v-card rounded="xl" class="mb-4 postcard-gradient-card">
              <v-card-item>
                <v-card-title>{{ item.title }}</v-card-title>
                <v-card-subtitle>{{ item.period }}</v-card-subtitle>
              </v-card-item>
              <v-card-text>
                <p class="mb-2">{{ item.description }}</p>
                <v-chip
                  v-for="highlight in item.highlights"
                  :key="highlight"
                  class="me-2 mb-2"
                  size="small"
                  color="primary"
                  variant="tonal"
                  >{{ highlight }}</v-chip
                >
              </v-card-text>
            </v-card>
          </v-timeline-item>
        </v-timeline>
      </template>
    </v-container>
  </div>
</template>
