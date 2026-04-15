<script setup lang="ts">
import type {
  LearningProgress,
  LearningProgressStatus,
} from '~~/server/types/api/learning'
import { useWorldLearningStore } from '~/stores/worldLearning'

definePageMeta({ title: 'Learning Levels' })

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
    rootOnly: true,
  },
]

const learningStore = useWorldLearningStore()
await learningStore.fetchCourses()
await learningStore.fetchAnalytics()
const selectedCourseId = computed(() => learningStore.items[0]?.id ?? '')
watch(
  selectedCourseId,
  async (courseId) => {
    if (!courseId) return
    await learningStore.fetchProgress(courseId)
  },
  { immediate: true },
)
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
const progressData = computed(() => ({
  items: selectedCourseId.value
    ? (learningStore.progressByCourse[selectedCourseId.value] ?? [])
    : [],
}))

const updateForm = reactive({
  learner: '',
  cohort: 'cohort-alpha',
  score: 0,
  timeSpentMinutes: 0,
  attempts: 0,
  lessonStatus: 'in_progress' as LearningProgressStatus,
})

const progressRows = computed(() =>
  (progressData.value?.items ?? []).map((entry) => ({
    learner: entry.learner,
    cohort: entry.cohort,
    level: entry.currentLevel,
    score: `${entry.score}%`,
    timeSpent: `${entry.timeSpentMinutes} min`,
    attempts: entry.attempts,
    completion: entry.unlockedLevels.includes('advanced')
      ? 'Completed'
      : 'In progress',
    certificate: entry.certificate
      ? entry.certificate.verificationId
      : 'Pending',
  })),
)

const selectedLearner = computed<LearningProgress | null>(() => {
  const key = updateForm.learner.trim().toLowerCase()
  return (
    (progressData.value?.items ?? []).find(
      (item) => item.learner.toLowerCase() === key,
    ) ?? null
  )
})

const updateTracking = async () => {
  if (!selectedCourseId.value || !updateForm.learner.trim()) {
    return
  }

  await learningStore.upsertProgress(selectedCourseId.value, {
    action: 'upsertProgress',
    courseId: selectedCourseId.value,
    learner: updateForm.learner.trim(),
    cohort: updateForm.cohort,
    status: updateForm.lessonStatus,
    score: updateForm.score,
    timeSpentMinutes: updateForm.timeSpentMinutes,
    attempts: updateForm.attempts,
  })

  await Promise.all([
    learningStore.fetchProgress(selectedCourseId.value, { force: true }),
    learningStore.fetchAnalytics({ force: true }),
  ])
}
</script>

<template>
  <div>
    <WorldModuleDrawers
      module-title="Learning"
      module-icon="mdi-school-outline"
      module-description="Gestion des règles de niveau, suivi score/temps/tentatives et certificats vérifiables."
      :nav-items="learningNavItems"
      action-label="Track learner"
      action-icon="mdi-chart-line"
    />

    <v-container fluid>
      <v-row>
        <v-col cols="12" lg="4">
          <v-card rounded="xl" class="pa-4 postcard-gradient-card mb-4">
            <h3 class="text-h6 mb-3">Update learner tracking</h3>
            <v-text-field
              v-model="updateForm.learner"
              label="Learner"
              variant="outlined"
              density="comfortable"
            />
            <v-text-field
              v-model="updateForm.cohort"
              label="Cohort"
              variant="outlined"
              density="comfortable"
            />
            <v-slider
              v-model="updateForm.score"
              label="Score"
              :max="100"
              :step="1"
              color="primary"
              thumb-label
            />
            <v-text-field
              v-model.number="updateForm.timeSpentMinutes"
              label="Time spent (minutes)"
              type="number"
              variant="outlined"
              density="comfortable"
            />
            <v-text-field
              v-model.number="updateForm.attempts"
              label="Attempts"
              type="number"
              variant="outlined"
              density="comfortable"
            />
            <v-select
              v-model="updateForm.lessonStatus"
              label="Lesson status"
              variant="outlined"
              density="comfortable"
              :items="[
                { title: 'Not started', value: 'not_started' },
                { title: 'In progress', value: 'in_progress' },
                { title: 'Completed', value: 'completed' },
              ]"
            />
            <v-btn
              color="primary"
              block
              prepend-icon="mdi-content-save-outline"
              @click="updateTracking"
              >Save tracking</v-btn
            >
          </v-card>

          <v-card rounded="xl" class="pa-4 postcard-gradient-card">
            <h3 class="text-h6 mb-3">Level rules</h3>
            <v-list density="compact" class="bg-transparent">
              <v-list-item
                v-for="rule in analyticsData?.items.levelRules ?? []"
                :key="rule.level"
              >
                <v-list-item-title class="text-subtitle-2 text-uppercase">{{
                  rule.level
                }}</v-list-item-title>
                <v-list-item-subtitle>
                  Score ≥ {{ rule.minScore }} | Lessons ≥
                  {{ Math.round(rule.minCompletedLessonsRatio * 100) }}% | Time
                  ≥ {{ rule.minTimeSpentMinutes }} min | Attempts ≤
                  {{ rule.maxAttempts }}
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>

        <v-col cols="12" lg="8">
          <WorldFeatureScaffold
            title="Learning - Levels"
            subtitle="Progression par utilisateur avec score, temps passé, tentatives et certificat PDF hashé."
            form-title="Certificate verification"
            form-description="Chaque certificat avancé reçoit un ID unique + hash SHA-256 + PDF base64 pour audit."
            :fields="[
              {
                key: 'verificationId',
                label: 'Verification ID',
                type: 'text',
                placeholder:
                  selectedLearner?.certificate?.verificationId ??
                  'No certificate yet',
              },
              {
                key: 'hash',
                label: 'Hash',
                type: 'textarea',
                placeholder:
                  selectedLearner?.certificate?.hash ??
                  'Hash generated at advanced level',
              },
            ]"
            :headers="[
              { title: 'Learner', key: 'learner' },
              { title: 'Cohort', key: 'cohort' },
              { title: 'Level', key: 'level' },
              { title: 'Score', key: 'score' },
              { title: 'Time spent', key: 'timeSpent' },
              { title: 'Attempts', key: 'attempts' },
              { title: 'Progress', key: 'completion' },
              { title: 'Certificate', key: 'certificate' },
            ]"
            :rows="progressRows"
            create-label="Certificate policy active"
          />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
