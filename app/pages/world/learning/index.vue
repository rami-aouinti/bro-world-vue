<script setup lang="ts">
import type { SessionUser } from '~/types/session'
import { useWorldLearningStore } from '~/stores/worldLearning'

definePageMeta({ title: 'world.learning.label' })

const { t } = useI18n()
const { user } = useUserSession()
const sessionUser = computed(() => user.value as SessionUser | null)
const isRoot = computed(
  () => sessionUser.value?.roles?.includes('ROLE_ROOT') ?? false,
)

const learningNavItems = computed(() => [
  {
    title: t('world.learning.nav.overview'),
    to: '/world/learning',
    icon: 'mdi-view-dashboard-outline',
  },
  {
    title: t('world.learning.nav.courses'),
    to: '/world/learning/courses',
    icon: 'mdi-book-open-page-variant-outline',
  },
  {
    title: t('world.learning.nav.levels'),
    to: '/world/learning/levels',
    icon: 'mdi-stairs',
  },
  {
    title: t('world.learning.nav.paths'),
    to: '/world/learning/paths',
    icon: 'mdi-map-marker-path',
  },
  ...(isRoot.value
    ? [
        {
          title: t('world.learning.nav.admin'),
          to: '/world/learning/admin',
          icon: 'mdi-shield-crown-outline',
          rootOnly: true,
        },
      ]
    : []),
])

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

const refreshDashboard = async () => {
  await Promise.all([
    learningStore.fetchAnalytics({ force: true }),
    firstCourseId.value
      ? learningStore.fetchProgress(firstCourseId.value, { force: true })
      : Promise.resolve([]),
  ])
}
</script>

<template>
  <div>
    <WorldModuleDrawers
      :module-title="t('world.learning.label')"
      module-icon="mdi-school-outline"
      :module-description="t('world.learning.moduleDescription')"
      :nav-items="learningNavItems"
      :action-label="t('world.learning.actions.refreshDashboard')"
      action-icon="mdi-refresh"
      @action="refreshDashboard"
    />

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
