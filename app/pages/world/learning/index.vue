<script setup lang="ts">
import type { SessionUser } from '~/types/session'
import type { LearningAdminAnalyticsApiResponse, LearningProgressApiResponse } from '~~/server/types/api/learning'

definePageMeta({ title: 'Learning' })

const { user } = useUserSession()
const sessionUser = computed(() => user.value as SessionUser | null)
const isRoot = computed(() => sessionUser.value?.roles?.includes('ROLE_ROOT') ?? false)

const learningNavItems = computed(() => [
  { title: 'Overview Learning', to: '/world/learning', icon: 'mdi-view-dashboard-outline' },
  { title: 'Courses', to: '/world/learning/courses', icon: 'mdi-book-open-page-variant-outline' },
  { title: 'Levels', to: '/world/learning/levels', icon: 'mdi-stairs' },
  { title: 'Paths', to: '/world/learning/paths', icon: 'mdi-map-marker-path' },
  ...(isRoot.value
    ? [{ title: 'Admin', to: '/world/learning/admin', icon: 'mdi-shield-crown-outline', rootOnly: true }]
    : []),
])

const { data: coursesData } = await useAsyncData('learning-courses-home', () => $fetch('/api/world/learning/courses'))
const firstCourseId = computed(() => coursesData.value?.items?.[0]?.id ?? '')

const { data: analyticsData, refresh: refreshAnalytics } = await useAsyncData(
  'learning-admin-analytics-home',
  () => $fetch<LearningAdminAnalyticsApiResponse>('/api/world/learning/analytics'),
)

const { data: progressData, refresh: refreshProgress } = await useAsyncData(
  'learning-progress-home',
  () => firstCourseId.value
    ? $fetch<LearningProgressApiResponse>(`/api/world/learning/courses/${firstCourseId.value}/progress`)
    : Promise.resolve({ items: [] }),
  { watch: [firstCourseId] },
)

const analytics = computed(() => analyticsData.value?.items)
const topLearners = computed(() => [...(progressData.value?.items ?? [])].sort((a, b) => b.score - a.score).slice(0, 5))
const certifiedCount = computed(() => (progressData.value?.items ?? []).filter((item) => item.certificate).length)

const rows = computed(() => topLearners.value.map((entry) => ({
  learner: entry.learner,
  cohort: entry.cohort,
  level: entry.currentLevel,
  score: `${entry.score}%`,
  timeSpent: `${entry.timeSpentMinutes} min`,
  attempts: entry.attempts,
})))

const refreshDashboard = async () => {
  await Promise.all([refreshAnalytics(), refreshProgress()])
}
</script>

<template>
  <div>
    <WorldModuleDrawers
      module-title="Learning"
      module-icon="mdi-school-outline"
      module-description="Plateforme LMS avec suivi progression par utilisateur, score, temps passé et tentatives."
      :nav-items="learningNavItems"
      action-label="Refresh dashboard"
      action-icon="mdi-refresh"
      @action="refreshDashboard"
    />

    <v-container fluid class="pt-0">
      <v-row class="mb-4">
        <v-col cols="12" md="3"><v-card class="pa-3 postcard-gradient-card" rounded="xl"><p class="text-caption mb-1">Active learners</p><h3 class="text-h5">{{ analytics?.totalLearners ?? 0 }}</h3></v-card></v-col>
        <v-col cols="12" md="3"><v-card class="pa-3 postcard-gradient-card" rounded="xl"><p class="text-caption mb-1">Course completion</p><h3 class="text-h5">{{ analytics?.completionRate ?? 0 }}%</h3></v-card></v-col>
        <v-col cols="12" md="3"><v-card class="pa-3 postcard-gradient-card" rounded="xl"><p class="text-caption mb-1">Dropout rate</p><h3 class="text-h5">{{ analytics?.dropoutRate ?? 0 }}%</h3></v-card></v-col>
        <v-col cols="12" md="3"><v-card class="pa-3 postcard-gradient-card" rounded="xl"><p class="text-caption mb-1">Certificates issued</p><h3 class="text-h5">{{ certifiedCount }}</h3></v-card></v-col>
      </v-row>

      <WorldFeatureScaffold
        title="Learning Hub"
        subtitle="Vue mentor des meilleurs apprenants avec progression live et métriques de performance."
        form-title="Rules snapshot"
        form-description="Passage niveau: score + leçons complétées + temps passé + limite tentatives."
        :fields="[
          { key: 'rule1', label: 'Intermediate', type: 'text', placeholder: 'Score ≥70, complétion ≥50%, temps ≥60 min, tentatives ≤6' },
          { key: 'rule2', label: 'Advanced', type: 'text', placeholder: 'Score ≥85, complétion 100%, temps ≥180 min, tentatives ≤4' },
        ]"
        :headers="[
          { title: 'Learner', key: 'learner' },
          { title: 'Cohort', key: 'cohort' },
          { title: 'Current level', key: 'level' },
          { title: 'Score', key: 'score' },
          { title: 'Time spent', key: 'timeSpent' },
          { title: 'Attempts', key: 'attempts' },
        ]"
        :rows="rows"
        create-label="Monitoring enabled"
      />
    </v-container>
  </div>
</template>
