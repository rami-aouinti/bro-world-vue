<script setup lang="ts">
import type { SessionUser } from '~/types/session'
import type { LearningAdminAnalyticsApiResponse } from '~~/server/types/api/learning'

definePageMeta({ title: 'Learning Admin' })

const { user } = useUserSession()
const sessionUser = computed(() => user.value as SessionUser | null)
const isRoot = computed(() => sessionUser.value?.roles?.includes('ROLE_ROOT') ?? false)
const isMentor = computed(() => sessionUser.value?.roles?.includes('ROLE_MENTOR') ?? false)
const canAccessDashboard = computed(() => isRoot.value || isMentor.value)

const learningNavItems = [
  { title: 'Overview Learning', to: '/world/learning', icon: 'mdi-view-dashboard-outline' },
  { title: 'Courses', to: '/world/learning/courses', icon: 'mdi-book-open-page-variant-outline' },
  { title: 'Levels', to: '/world/learning/levels', icon: 'mdi-stairs' },
  { title: 'Paths', to: '/world/learning/paths', icon: 'mdi-map-marker-path' },
  { title: 'Admin', to: '/world/learning/admin', icon: 'mdi-shield-crown-outline', rootOnly: true },
]

const { data: analyticsData, refresh, pending } = await useAsyncData(
  'learning-admin-analytics',
  () => $fetch<LearningAdminAnalyticsApiResponse>('/api/world/learning/analytics'),
)

const cohortRows = computed(() => analyticsData.value?.items.cohortPerformance ?? [])
</script>

<template>
  <div>
    <WorldModuleDrawers
      module-title="Learning"
      module-icon="mdi-school-outline"
      module-description="Dashboard mentor/admin: complétion, abandon et performance par cohorte."
      :nav-items="learningNavItems"
      action-label="Refresh analytics"
      action-icon="mdi-refresh"
      @action="refresh"
    />

    <v-container fluid class="pt-0">
      <v-card rounded="xl" class="pa-5 postcard-gradient-card">
        <template v-if="canAccessDashboard">
          <h2 class="text-h5 mb-2">Learning mentor/admin dashboard</h2>
          <p class="text-medium-emphasis mb-4">Pilotage des KPIs de cohorte, conformité des règles de niveau et émissions de certificats.</p>

          <v-row class="mb-2">
            <v-col cols="12" md="3"><v-card rounded="lg" class="pa-3 bg-transparent"><p class="text-caption mb-1">Total learners</p><h3 class="text-h6">{{ analyticsData?.items.totalLearners ?? 0 }}</h3></v-card></v-col>
            <v-col cols="12" md="3"><v-card rounded="lg" class="pa-3 bg-transparent"><p class="text-caption mb-1">Completion</p><h3 class="text-h6">{{ analyticsData?.items.completionRate ?? 0 }}%</h3></v-card></v-col>
            <v-col cols="12" md="3"><v-card rounded="lg" class="pa-3 bg-transparent"><p class="text-caption mb-1">Dropout</p><h3 class="text-h6">{{ analyticsData?.items.dropoutRate ?? 0 }}%</h3></v-card></v-col>
            <v-col cols="12" md="3"><v-card rounded="lg" class="pa-3 bg-transparent"><p class="text-caption mb-1">Average score</p><h3 class="text-h6">{{ analyticsData?.items.averageScore ?? 0 }}</h3></v-card></v-col>
          </v-row>

          <v-data-table
            :loading="pending"
            density="comfortable"
            :headers="[
              { title: 'Cohort', key: 'cohort' },
              { title: 'Learners', key: 'learners' },
              { title: 'Completion %', key: 'completionRate' },
              { title: 'Dropout %', key: 'dropoutRate' },
              { title: 'Average score', key: 'averageScore' },
            ]"
            :items="cohortRows"
            class="rounded-xl"
          />

          <v-divider class="my-4" />

          <h3 class="text-h6 mb-3">Level governance rules</h3>
          <v-row>
            <v-col v-for="rule in analyticsData?.items.levelRules ?? []" :key="rule.level" cols="12" md="4">
              <v-card variant="outlined" rounded="lg" class="pa-3 h-100">
                <div class="text-overline">{{ rule.level }}</div>
                <p class="mb-1">Score min: <strong>{{ rule.minScore }}</strong></p>
                <p class="mb-1">Completion min: <strong>{{ Math.round(rule.minCompletedLessonsRatio * 100) }}%</strong></p>
                <p class="mb-1">Time min: <strong>{{ rule.minTimeSpentMinutes }} min</strong></p>
                <p class="mb-0">Attempts max: <strong>{{ rule.maxAttempts }}</strong></p>
              </v-card>
            </v-col>
          </v-row>
        </template>
        <p v-else class="text-error mb-0">Access denied. This page requires ROLE_ROOT or ROLE_MENTOR.</p>
      </v-card>
    </v-container>
  </div>
</template>
