<script setup lang="ts">
import type { SessionUser } from '~/types/session'
import { useWorldLearningStore } from '~/stores/worldLearning'
import { useWorldLearningAdminSchoolStore } from '~/stores/worldLearningAdminSchool'

definePageMeta({ title: 'Learning Admin' })
const { t } = useI18n()
const router = useRouter()

const { user } = useUserSession()
const sessionUser = computed(() => user.value as SessionUser | null)
const isRoot = computed(
  () => sessionUser.value?.roles?.includes('ROLE_ROOT') ?? false,
)
const isAdmin = computed(
  () => sessionUser.value?.roles?.includes('ROLE_ADMIN') ?? false,
)
const canAccessDashboard = computed(() => isRoot.value || isAdmin.value)
if (!canAccessDashboard.value) {
  await router.replace('/world/learning')
}

const learningNavItems = [
  {
    title: 'Overview Learning',
    to: '/world/learning',
    icon: 'mdi-view-dashboard-outline',
  },
  {
    title: 'Courses',
    to: '/world/learning/courses',
    icon: 'mdi-book-open-page-variant-outline',
  },
  { title: 'Levels', to: '/world/learning/levels', icon: 'mdi-stairs' },
  { title: 'Paths', to: '/world/learning/paths', icon: 'mdi-map-marker-path' },
  {
    title: 'Admin',
    to: '/world/learning/admin',
    icon: 'mdi-shield-crown-outline',
  },
]

const learningStore = useWorldLearningStore()
const schoolAdminStore = useWorldLearningAdminSchoolStore()
await learningStore.fetchAnalytics()
if (canAccessDashboard.value) {
  await schoolAdminStore.fetchSummary()
}

const analyticsData = computed(() => ({
  items: learningStore.detail ?? {
    totalLearners: 0,
    completionRate: 0,
    dropoutRate: 0,
    averageScore: 0,
    cohortPerformance: [],
    levelRules: [],
  },
}))
const pending = computed(() => learningStore.pending)
const refresh = () => learningStore.fetchAnalytics({ force: true })
const refreshSummary = () => schoolAdminStore.fetchSummary({ force: true })

const cohortRows = computed(
  () => analyticsData.value?.items?.cohortPerformance ?? [],
)
const schoolResources = computed(() =>
  schoolAdminStore.summary.map((item) => ({
    ...item,
    to: `/world/learning/admin/${item.key}`,
    icon: item.key === 'classes'
      ? 'mdi-google-classroom'
      : item.key === 'teachers'
        ? 'mdi-account-tie'
        : item.key === 'students'
          ? 'mdi-account-school'
          : item.key === 'exams'
            ? 'mdi-file-document-outline'
            : 'mdi-check-decagram-outline',
  })),
)
</script>

<template>
  <div>
    <WorldModuleDrawers
      :module-title="t('world.learning.label', 'Learning')"
      module-icon="mdi-school-outline"
      :module-description="t('world.learning.admin.moduleDescription', 'Mentor/admin dashboard: completion, dropout, and cohort performance.')"
      :nav-items="learningNavItems"
      :action-label="t('world.learning.admin.actions.refreshAnalytics', 'Refresh analytics')"
      action-icon="mdi-refresh"
      @action="refresh"
    />

    <v-container fluid>
      <v-card rounded="xl" class="pa-5 postcard-gradient-card">
        <template v-if="canAccessDashboard">
          <h2 class="text-h5 mb-2">Learning admin dashboard</h2>
          <p class="text-medium-emphasis mb-4">
            {{ t('world.learning.admin.description', 'Track cohort KPIs, level-rule compliance, and certificate issuance.') }}
          </p>

          <div class="d-flex align-center justify-space-between mb-2">
            <h3 class="text-h6">School resources</h3>
            <v-btn size="small" variant="text" prepend-icon="mdi-refresh" @click="refreshSummary">
              Refresh
            </v-btn>
          </div>
          <v-row class="mb-4">
            <v-col
              v-for="resource in schoolResources"
              :key="resource.key"
              cols="12"
              md="4"
            >
              <v-card
                rounded="lg"
                variant="outlined"
                class="pa-4 h-100 d-flex flex-column justify-space-between"
                :to="resource.to"
              >
                <div class="d-flex align-center ga-3 mb-3">
                  <v-icon :icon="resource.icon" />
                  <div>
                    <div class="text-subtitle-1 font-weight-medium">
                      {{ resource.label }}
                    </div>
                    <div class="text-caption text-medium-emphasis">
                      Manage {{ resource.label.toLowerCase() }}
                    </div>
                  </div>
                </div>
                <div class="d-flex align-center justify-space-between">
                  <span class="text-caption">Count</span>
                  <strong class="text-h6">{{ resource.count }}</strong>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <v-row class="mb-2">
            <v-col cols="12" md="3"
              ><v-card rounded="lg" class="pa-3 bg-transparent"
                ><p class="text-caption mb-1">Total learners</p>
                <h3 class="text-h6">
                  {{ analyticsData?.items.totalLearners ?? 0 }}
                </h3></v-card
              ></v-col
            >
            <v-col cols="12" md="3"
              ><v-card rounded="lg" class="pa-3 bg-transparent"
                ><p class="text-caption mb-1">Completion</p>
                <h3 class="text-h6">
                  {{ analyticsData?.items.completionRate ?? 0 }}%
                </h3></v-card
              ></v-col
            >
            <v-col cols="12" md="3"
              ><v-card rounded="lg" class="pa-3 bg-transparent"
                ><p class="text-caption mb-1">Dropout</p>
                <h3 class="text-h6">
                  {{ analyticsData?.items.dropoutRate ?? 0 }}%
                </h3></v-card
              ></v-col
            >
            <v-col cols="12" md="3"
              ><v-card rounded="lg" class="pa-3 bg-transparent"
                ><p class="text-caption mb-1">Average score</p>
                <h3 class="text-h6">
                  {{ analyticsData?.items.averageScore ?? 0 }}
                </h3></v-card
              ></v-col
            >
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
            <v-col
              v-for="rule in analyticsData?.items.levelRules ?? []"
              :key="rule.level"
              cols="12"
              md="4"
            >
              <v-card variant="outlined" rounded="lg" class="pa-3 h-100">
                <div class="text-overline">{{ rule.level }}</div>
                <p class="mb-1">
                  Score min: <strong>{{ rule.minScore }}</strong>
                </p>
                <p class="mb-1">
                  Completion min:
                  <strong
                    >{{
                      Math.round(rule.minCompletedLessonsRatio * 100)
                    }}%</strong
                  >
                </p>
                <p class="mb-1">
                  Time min: <strong>{{ rule.minTimeSpentMinutes }} min</strong>
                </p>
                <p class="mb-0">
                  Attempts max: <strong>{{ rule.maxAttempts }}</strong>
                </p>
              </v-card>
            </v-col>
          </v-row>
        </template>
        <p v-else class="text-error mb-0">
          Access denied. This page requires ROLE_ROOT or ROLE_ADMIN.
        </p>
      </v-card>
    </v-container>
  </div>
</template>
