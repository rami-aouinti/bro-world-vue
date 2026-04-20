<script setup lang="ts">
import { useWorldLearningStore } from '~/stores/worldLearning'

definePageMeta({
  layout: 'learning',
  title: 'world.learning.label',
  description: 'world.learning.seo.metaDescription',
})

const { t } = useI18n()
const runtimeConfig = useRuntimeConfig()
const siteUrl = runtimeConfig.public.siteUrl || 'https://bro-world-space.com'
const pageUrl = new URL('/world/learning', siteUrl).toString()
const seoImage = new URL('/img/platform/general/learning.png', siteUrl).toString()

useSeoMeta({
  title: t('world.learning.seo.title', 'Bro World Learning | Learning platform and learner tracking'),
  description: t(
    'world.learning.seo.description',
    'Bro World Learning helps you manage courses, learning paths, analytics, and learner progress.',
  ),
  keywords: t(
    'world.learning.seo.keywords',
    'bro world learning, lms, e-learning platform, online training, learner tracking, learning analytics',
  ),
  robots: 'index, follow, max-image-preview:large',
  ogTitle: t('world.learning.seo.ogTitle', 'Bro World Learning | Learning platform'),
  ogDescription: t(
    'world.learning.seo.ogDescription',
    'Track your courses, performance, and certifications with Bro World Learning.',
  ),
  ogType: 'website',
  ogUrl: pageUrl,
  ogImage: seoImage,
  ogImageAlt: 'Bro World Learning analytics',
  twitterTitle: t('world.learning.seo.twitterTitle', 'Bro World Learning | Learning platform'),
  twitterDescription: t(
    'world.learning.seo.twitterDescription',
    'Track your courses, performance, and certifications with Bro World Learning.',
  ),
  twitterImage: seoImage,
  twitterCard: 'summary_large_image',
})

const learningStore = useWorldLearningStore()
await learningStore.fetchCourses()
await learningStore.fetchAnalytics()

const firstCourseId = computed(() => learningStore.items[0]?.id ?? '')
watch(
  firstCourseId,
  async (courseId) => {
    if (!courseId) return
    await learningStore.fetchProgress(courseId)
  },
  { immediate: true },
)

const analytics = computed(() => learningStore.detail)
const progressItems = computed(() =>
  firstCourseId.value
    ? (learningStore.progressByCourse[firstCourseId.value] ?? [])
    : [],
)
const topLearners = computed(() =>
  [...progressItems.value].sort((a, b) => b.score - a.score).slice(0, 5),
)
const certifiedCount = computed(
  () => progressItems.value.filter((item) => item.certificate).length,
)

const rows = computed(() =>
  topLearners.value.map((entry) => ({
    learner: entry.learner,
    cohort: entry.cohort,
    level: entry.currentLevel,
    score: `${entry.score}%`,
    timeSpent: `${entry.timeSpentMinutes} ${t('world.common.units.minuteShort')}`,
    attempts: entry.attempts,
  })),
)

</script>

<template>
  <div>
    <v-container fluid>
      <v-row class="mb-4">
        <v-col cols="12" md="3"
          ><v-card class="pa-3 postcard-gradient-card" rounded="xl"
            ><p class="text-caption mb-1">
              {{ t('world.learning.kpis.activeLearners') }}
            </p>
            <h3 class="text-h5">{{ analytics?.totalLearners ?? 0 }}</h3></v-card
          ></v-col
        >
        <v-col cols="12" md="3"
          ><v-card class="pa-3 postcard-gradient-card" rounded="xl"
            ><p class="text-caption mb-1">
              {{ t('world.learning.kpis.courseCompletion') }}
            </p>
            <h3 class="text-h5">
              {{ analytics?.completionRate ?? 0 }}%
            </h3></v-card
          ></v-col
        >
        <v-col cols="12" md="3"
          ><v-card class="pa-3 postcard-gradient-card" rounded="xl"
            ><p class="text-caption mb-1">
              {{ t('world.learning.kpis.dropoutRate') }}
            </p>
            <h3 class="text-h5">{{ analytics?.dropoutRate ?? 0 }}%</h3></v-card
          ></v-col
        >
        <v-col cols="12" md="3"
          ><v-card class="pa-3 postcard-gradient-card" rounded="xl"
            ><p class="text-caption mb-1">
              {{ t('world.learning.kpis.certificatesIssued') }}
            </p>
            <h3 class="text-h5">{{ certifiedCount }}</h3></v-card
          ></v-col
        >
      </v-row>

      <WorldFeatureScaffold
        :title="t('world.learning.home.title')"
        :subtitle="t('world.learning.home.subtitle')"
        :form-title="t('world.learning.home.formTitle')"
        :form-description="t('world.learning.home.formDescription')"
        :fields="[
          {
            key: 'rule1',
            label: t('world.learning.form.intermediate'),
            type: 'text',
            placeholder: t('world.learning.form.intermediateRule'),
          },
          {
            key: 'rule2',
            label: t('world.learning.form.advanced'),
            type: 'text',
            placeholder: t('world.learning.form.advancedRule'),
          },
        ]"
        :headers="[
          {
            title: t('world.learning.table.learner'),
            key: 'learner',
          },
          { title: t('world.learning.table.cohort'), key: 'cohort' },
          {
            title: t('world.learning.table.currentLevel'),
            key: 'level',
          },
          { title: t('world.learning.table.score'), key: 'score' },
          {
            title: t('world.learning.table.timeSpent'),
            key: 'timeSpent',
          },
          {
            title: t('world.learning.table.attempts'),
            key: 'attempts',
          },
        ]"
        :rows="rows"
        :create-label="t('world.learning.actions.monitoringEnabled')"
      />
    </v-container>
  </div>
</template>
