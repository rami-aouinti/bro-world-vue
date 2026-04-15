<script setup lang="ts">
import type {
  LearningContentType,
  LearningCourse,
  LearningLesson,
  LearningProgress,
  LearningProgressStatus,
} from '~~/server/types/api/learning'
import { useWorldLearningStore } from '~/stores/worldLearning'

definePageMeta({ title: 'Learning Courses' })

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

const contentTypeOptions: Array<{ title: string; value: LearningContentType }> =
  [
    { title: 'Text', value: 'text' },
    { title: 'Video', value: 'video' },
    { title: 'File', value: 'file' },
  ]

const gradingScaleOptions = [
  { title: 'Points', value: 'points' as const },
  { title: 'Percent', value: 'percent' as const },
]

const statusOptions: Array<{ title: string; value: LearningProgressStatus }> = [
  { title: 'Not started', value: 'not_started' },
  { title: 'In progress', value: 'in_progress' },
  { title: 'Completed', value: 'completed' },
]

const learningStore = useWorldLearningStore()
await learningStore.fetchCourses()
const pending = computed(() => learningStore.pending)
const coursesData = computed(() => ({ items: learningStore.items }))
const refreshCourses = () => learningStore.fetchCourses({ force: true })

const courses = computed<LearningCourse[]>(() => coursesData.value.items ?? [])
const hasError = computed(() => !!learningStore.error)
const isEmpty = computed(
  () => !pending.value && !hasError.value && courses.value.length === 0,
)
const selectedCourseId = ref('')
const selectedModuleId = ref('')
const selectedLessonId = ref('')
const selectedContentBlockId = ref('')

watch(
  courses,
  (items) => {
    if (!items.length) {
      selectedCourseId.value = ''
      selectedModuleId.value = ''
      selectedLessonId.value = ''
      selectedContentBlockId.value = ''
      return
    }

    if (!items.some((course) => course.id === selectedCourseId.value)) {
      const firstCourse = items[0]
      if (firstCourse) {
        selectedCourseId.value = firstCourse.id
      }
    }
  },
  { immediate: true },
)

const selectedCourse = computed(
  () =>
    courses.value.find((course) => course.id === selectedCourseId.value) ??
    null,
)
const selectedModule = computed(
  () =>
    selectedCourse.value?.modules.find(
      (module) => module.id === selectedModuleId.value,
    ) ?? null,
)
const selectedLesson = computed<LearningLesson | null>(
  () =>
    selectedModule.value?.lessons.find(
      (lesson) => lesson.id === selectedLessonId.value,
    ) ?? null,
)
const selectedContentBlock = computed(
  () =>
    selectedLesson.value?.contentBlocks.find(
      (item) => item.id === selectedContentBlockId.value,
    ) ?? null,
)

watch(
  selectedCourse,
  (course) => {
    if (!course) {
      selectedModuleId.value = ''
      return
    }

    if (
      !course.modules.some((module) => module.id === selectedModuleId.value)
    ) {
      selectedModuleId.value = course.modules[0]?.id ?? ''
    }
  },
  { immediate: true },
)

watch(
  selectedModule,
  (module) => {
    if (!module) {
      selectedLessonId.value = ''
      return
    }

    if (
      !module.lessons.some((lesson) => lesson.id === selectedLessonId.value)
    ) {
      selectedLessonId.value = module.lessons[0]?.id ?? ''
    }
  },
  { immediate: true },
)

watch(
  selectedLesson,
  (lesson) => {
    if (!lesson) {
      selectedContentBlockId.value = ''
      return
    }

    if (
      !lesson.contentBlocks.some(
        (content) => content.id === selectedContentBlockId.value,
      )
    ) {
      selectedContentBlockId.value = lesson.contentBlocks[0]?.id ?? ''
    }
  },
  { immediate: true },
)

const progressData = ref<LearningProgress[]>([])

watch(
  selectedCourseId,
  async (courseId) => {
    if (!courseId) {
      progressData.value = []
      return
    }

    progressData.value = await learningStore.fetchProgress(courseId)
  },
  { immediate: true },
)

const createCourseForm = reactive({ title: '', owner: '' })
const moduleForm = reactive({ title: '', description: '' })
const lessonForm = reactive({ title: '', objective: '' })
const contentForm = reactive({
  title: '',
  type: 'text' as LearningContentType,
  payload: '',
  versionNote: '',
})
const versionForm = reactive({ payload: '', versionNote: '' })
const assessmentForm = reactive({
  title: '',
  gradingScale: 'points' as const,
  passThreshold: 70,
  questions: [{ prompt: '', points: 10 }],
})
const prerequisiteLessonIds = ref<string[]>([])
const progressForm = reactive({
  learner: '',
  lessonId: '',
  status: 'not_started' as LearningProgressStatus,
})

watch(
  selectedLesson,
  (lesson) => {
    prerequisiteLessonIds.value = lesson?.prerequisiteLessonIds
      ? [...lesson.prerequisiteLessonIds]
      : []
    progressForm.lessonId = lesson?.id ?? ''
  },
  { immediate: true },
)

const allCourseLessons = computed(() => {
  if (!selectedCourse.value) {
    return []
  }

  return selectedCourse.value.modules.flatMap((module) => module.lessons)
})

const selectedLearnerProgress = computed(() =>
  progressData.value.find(
    (item) => item.learner === progressForm.learner.trim(),
  ),
)

const mutateCourses = async (payload: Record<string, unknown>) => {
  await learningStore.mutateCourses(payload as any)
  await refreshCourses()
}

const createCourse = async () => {
  if (!createCourseForm.title.trim() || !createCourseForm.owner.trim()) {
    return
  }

  await mutateCourses({
    action: 'createCourse',
    title: createCourseForm.title,
    owner: createCourseForm.owner,
  })

  createCourseForm.title = ''
  createCourseForm.owner = ''
}

const addModule = async () => {
  if (!selectedCourse.value || !moduleForm.title.trim()) {
    return
  }

  await mutateCourses({
    action: 'addModule',
    courseId: selectedCourse.value.id,
    title: moduleForm.title,
    description: moduleForm.description,
  })

  moduleForm.title = ''
  moduleForm.description = ''
}

const addLesson = async () => {
  if (
    !selectedCourse.value ||
    !selectedModule.value ||
    !lessonForm.title.trim()
  ) {
    return
  }

  await mutateCourses({
    action: 'addLesson',
    courseId: selectedCourse.value.id,
    moduleId: selectedModule.value.id,
    title: lessonForm.title,
    objective: lessonForm.objective,
  })

  lessonForm.title = ''
  lessonForm.objective = ''
}

const addContentBlock = async () => {
  if (
    !selectedCourse.value ||
    !selectedModule.value ||
    !selectedLesson.value ||
    !contentForm.title.trim() ||
    !contentForm.payload.trim()
  ) {
    return
  }

  await mutateCourses({
    action: 'addContentBlock',
    courseId: selectedCourse.value.id,
    moduleId: selectedModule.value.id,
    lessonId: selectedLesson.value.id,
    title: contentForm.title,
    type: contentForm.type,
    payload: contentForm.payload,
    versionNote: contentForm.versionNote,
  })

  contentForm.title = ''
  contentForm.payload = ''
  contentForm.versionNote = ''
}

const addContentVersion = async () => {
  if (
    !selectedCourse.value ||
    !selectedModule.value ||
    !selectedLesson.value ||
    !selectedContentBlock.value ||
    !versionForm.payload.trim()
  ) {
    return
  }

  await mutateCourses({
    action: 'addContentVersion',
    courseId: selectedCourse.value.id,
    moduleId: selectedModule.value.id,
    lessonId: selectedLesson.value.id,
    contentBlockId: selectedContentBlock.value.id,
    payload: versionForm.payload,
    versionNote: versionForm.versionNote,
  })

  versionForm.payload = ''
  versionForm.versionNote = ''
}

const addQuestion = () => {
  assessmentForm.questions.push({ prompt: '', points: 10 })
}

const saveAssessment = async () => {
  if (
    !selectedCourse.value ||
    !selectedModule.value ||
    !selectedLesson.value ||
    !assessmentForm.title.trim()
  ) {
    return
  }

  await mutateCourses({
    action: 'addAssessment',
    courseId: selectedCourse.value.id,
    moduleId: selectedModule.value.id,
    lessonId: selectedLesson.value.id,
    title: assessmentForm.title,
    gradingScale: assessmentForm.gradingScale,
    passThreshold: assessmentForm.passThreshold,
    questions: assessmentForm.questions.filter((question) =>
      question.prompt.trim(),
    ),
  })

  assessmentForm.title = ''
  assessmentForm.passThreshold = 70
  assessmentForm.questions = [{ prompt: '', points: 10 }]
}

const savePrerequisites = async () => {
  if (!selectedCourse.value || !selectedModule.value || !selectedLesson.value) {
    return
  }

  await mutateCourses({
    action: 'setPrerequisite',
    courseId: selectedCourse.value.id,
    moduleId: selectedModule.value.id,
    lessonId: selectedLesson.value.id,
    prerequisiteLessonIds: prerequisiteLessonIds.value,
  })
}

const updateProgress = async () => {
  if (
    !selectedCourse.value ||
    !progressForm.learner.trim() ||
    !progressForm.lessonId
  ) {
    return
  }

  const response = await learningStore.upsertProgress(selectedCourse.value.id, {
    action: 'upsertProgress',
    courseId: selectedCourse.value.id,
    learner: progressForm.learner.trim(),
    lessonId: progressForm.lessonId,
    status: progressForm.status,
  } as any)

  progressData.value = response.items
}

const toggleAssessmentCompletion = async (
  assessmentId: string,
  completed: boolean,
) => {
  if (!selectedCourse.value || !progressForm.learner.trim()) {
    return
  }

  const response = await learningStore.upsertProgress(selectedCourse.value.id, {
    action: 'upsertProgress',
    courseId: selectedCourse.value.id,
    learner: progressForm.learner.trim(),
    assessmentId,
    assessmentCompleted: completed,
  } as any)

  progressData.value = response.items
}
</script>

<template>
  <div>
    <WorldModuleDrawers
      module-title="Learning"
      module-icon="mdi-school-outline"
      module-description="Structure Course > Module > Lesson > Assessment avec édition de contenu et suivi de progression."
      :nav-items="learningNavItems"
      action-label="Design curriculum"
    />

    <v-container fluid>
      <v-alert
        v-if="pending"
        data-testid="learning-courses-loading"
        type="info"
        variant="tonal"
        class="mb-4"
        text="Chargement des cours..."
      />
      <v-alert
        v-else-if="hasError"
        data-testid="learning-courses-error"
        type="error"
        variant="tonal"
        class="mb-4"
        :text="learningStore.error ?? undefined"
      />
      <v-alert
        v-else-if="isEmpty"
        data-testid="learning-courses-empty"
        type="warning"
        variant="tonal"
        class="mb-4"
        text="Aucun cours disponible pour le moment."
      />

      <v-row>
        <v-col cols="12" lg="4">
          <v-card rounded="xl" class="pa-4 postcard-gradient-card mb-4">
            <h3 class="text-h6 mb-3">Créer un course</h3>
            <v-text-field
              v-model="createCourseForm.title"
              variant="outlined"
              density="comfortable"
              label="Course title"
            />
            <v-text-field
              v-model="createCourseForm.owner"
              variant="outlined"
              density="comfortable"
              label="Owner"
            />
            <v-btn
              color="primary"
              block
              prepend-icon="mdi-book-plus-outline"
              @click="createCourse"
              >Create course</v-btn
            >
          </v-card>

          <v-card rounded="xl" class="pa-4 postcard-gradient-card">
            <h3 class="text-h6 mb-3">Curriculum</h3>
            <v-select
              v-model="selectedCourseId"
              :items="
                courses.map((course) => ({
                  title: `${course.title} (v${course.version})`,
                  value: course.id,
                }))
              "
              label="Course"
              variant="outlined"
              density="comfortable"
              :loading="pending"
            />
            <template v-if="selectedCourse">
              <v-text-field
                v-model="moduleForm.title"
                label="New module title"
                variant="outlined"
                density="comfortable"
              />
              <v-textarea
                v-model="moduleForm.description"
                label="Module description"
                variant="outlined"
                density="comfortable"
                rows="2"
              />
              <v-btn
                color="primary"
                variant="tonal"
                block
                class="mb-3"
                @click="addModule"
                >Add module</v-btn
              >

              <v-select
                v-model="selectedModuleId"
                :items="
                  selectedCourse.modules.map((module) => ({
                    title: module.title,
                    value: module.id,
                  }))
                "
                label="Module"
                variant="outlined"
                density="comfortable"
              />
              <v-text-field
                v-model="lessonForm.title"
                label="New lesson title"
                variant="outlined"
                density="comfortable"
              />
              <v-textarea
                v-model="lessonForm.objective"
                label="Lesson objective"
                variant="outlined"
                density="comfortable"
                rows="2"
              />
              <v-btn color="primary" variant="tonal" block @click="addLesson"
                >Add lesson</v-btn
              >
            </template>
          </v-card>
        </v-col>

        <v-col cols="12" lg="8">
          <v-card rounded="xl" class="pa-4 postcard-gradient-card mb-4">
            <h3 class="text-h6 mb-3">Structure pédagogique</h3>
            <div v-if="selectedCourse">
              <div class="text-subtitle-1 font-weight-bold mb-3">
                {{ selectedCourse.title }} · Version
                {{ selectedCourse.version }}
              </div>
              <v-expansion-panels variant="accordion">
                <v-expansion-panel
                  v-for="module in selectedCourse.modules"
                  :key="module.id"
                >
                  <v-expansion-panel-title>
                    <div
                      class="d-flex align-center justify-space-between w-100 pr-3"
                    >
                      <span>{{ module.title }}</span>
                      <small class="text-medium-emphasis"
                        >{{ module.lessons.length }} lessons</small
                      >
                    </div>
                  </v-expansion-panel-title>
                  <v-expansion-panel-text>
                    <p class="text-caption text-medium-emphasis mb-2">
                      {{ module.description || 'No description.' }}
                    </p>
                    <v-list density="compact" bg-color="transparent">
                      <v-list-item
                        v-for="lesson in module.lessons"
                        :key="lesson.id"
                        @click="selectedModuleId = module.id; selectedLessonId = lesson.id"
                      >
                        <template #prepend
                          ><v-icon icon="mdi-book-education-outline" size="18"
                        /></template>
                        <v-list-item-title>{{
                          lesson.title
                        }}</v-list-item-title>
                        <v-list-item-subtitle>
                          Assessment:
                          {{ lesson.assessment?.title ?? 'not defined' }} ·
                          Content blocks: {{ lesson.contentBlocks.length }}
                        </v-list-item-subtitle>
                      </v-list-item>
                    </v-list>
                  </v-expansion-panel-text>
                </v-expansion-panel>
              </v-expansion-panels>
            </div>
            <p v-else class="mb-0 text-medium-emphasis">
              Aucun course disponible.
            </p>
          </v-card>

          <v-card
            v-if="selectedLesson && selectedCourse && selectedModule"
            rounded="xl"
            class="pa-4 postcard-gradient-card mb-4"
          >
            <h3 class="text-h6 mb-1">Content editor (text/video/files)</h3>
            <p class="text-caption text-medium-emphasis mb-4">
              Lesson sélectionnée: {{ selectedLesson.title }}
            </p>
            <v-row>
              <v-col cols="12" md="6">
                <v-text-field
                  v-model="contentForm.title"
                  label="Content title"
                  variant="outlined"
                  density="comfortable"
                />
                <v-select
                  v-model="contentForm.type"
                  :items="contentTypeOptions"
                  label="Type"
                  variant="outlined"
                  density="comfortable"
                />
                <v-textarea
                  v-model="contentForm.payload"
                  rows="4"
                  label="Text, URL vidéo ou fichier"
                  variant="outlined"
                  density="comfortable"
                />
                <v-text-field
                  v-model="contentForm.versionNote"
                  label="Version note"
                  variant="outlined"
                  density="comfortable"
                />
                <v-btn color="primary" block @click="addContentBlock"
                  >Add content block</v-btn
                >
              </v-col>
              <v-col cols="12" md="6">
                <v-select
                  v-model="selectedContentBlockId"
                  :items="
                    selectedLesson.contentBlocks.map((content) => ({
                      title: `${content.title} (v${content.currentVersion})`,
                      value: content.id,
                    }))
                  "
                  label="Existing content"
                  variant="outlined"
                  density="comfortable"
                />
                <v-textarea
                  v-model="versionForm.payload"
                  rows="4"
                  label="New payload version"
                  variant="outlined"
                  density="comfortable"
                />
                <v-text-field
                  v-model="versionForm.versionNote"
                  label="Change note"
                  variant="outlined"
                  density="comfortable"
                />
                <v-btn
                  color="secondary"
                  block
                  class="mb-3"
                  @click="addContentVersion"
                  >Add new version</v-btn
                >

                <div v-if="selectedContentBlock" class="text-caption">
                  <div class="font-weight-bold mb-2">Version history</div>
                  <v-timeline side="end" density="compact" line-inset="12">
                    <v-timeline-item
                      v-for="version in [
                        ...selectedContentBlock.versions,
                      ].reverse()"
                      :key="`${selectedContentBlock.id}-${version.version}`"
                      dot-color="primary"
                      size="small"
                    >
                      <div>v{{ version.version }} · {{ version.note }}</div>
                      <small class="text-medium-emphasis">{{
                        new Date(version.changedAt).toLocaleString()
                      }}</small>
                    </v-timeline-item>
                  </v-timeline>
                </div>
              </v-col>
            </v-row>
          </v-card>

          <v-card
            v-if="selectedLesson && selectedCourse && selectedModule"
            rounded="xl"
            class="pa-4 postcard-gradient-card mb-4"
          >
            <h3 class="text-h6 mb-3">Quiz / Assessment avec barème</h3>
            <v-row>
              <v-col cols="12" md="4"
                ><v-text-field
                  v-model="assessmentForm.title"
                  label="Assessment title"
                  variant="outlined"
                  density="comfortable"
              /></v-col>
              <v-col cols="12" md="4"
                ><v-select
                  v-model="assessmentForm.gradingScale"
                  :items="gradingScaleOptions"
                  label="Grading scale"
                  variant="outlined"
                  density="comfortable"
              /></v-col>
              <v-col cols="12" md="4"
                ><v-text-field
                  v-model.number="assessmentForm.passThreshold"
                  type="number"
                  label="Pass threshold"
                  variant="outlined"
                  density="comfortable"
              /></v-col>
            </v-row>

            <div class="text-subtitle-2 mb-2">Questions</div>
            <v-row
              v-for="(question, index) in assessmentForm.questions"
              :key="`question-${index}`"
            >
              <v-col cols="12" md="8"
                ><v-text-field
                  v-model="question.prompt"
                  variant="outlined"
                  density="comfortable"
                  :label="`Question ${index + 1}`"
              /></v-col>
              <v-col cols="12" md="4"
                ><v-text-field
                  v-model.number="question.points"
                  type="number"
                  variant="outlined"
                  density="comfortable"
                  label="Points"
              /></v-col>
            </v-row>
            <div class="d-flex ga-2">
              <v-btn variant="tonal" @click="addQuestion">Add question</v-btn>
              <v-btn color="primary" @click="saveAssessment"
                >Save assessment</v-btn
              >
            </div>
          </v-card>

          <v-card
            v-if="selectedLesson && selectedCourse && selectedModule"
            rounded="xl"
            class="pa-4 postcard-gradient-card mb-4"
          >
            <h3 class="text-h6 mb-3">Prerequisites</h3>
            <v-select
              v-model="prerequisiteLessonIds"
              :items="
                allCourseLessons
                  .filter((lesson) => lesson.id !== (selectedLesson?.id ?? ''))
                  .map((lesson) => ({ title: lesson.title, value: lesson.id }))
              "
              label="Required lessons"
              variant="outlined"
              density="comfortable"
              multiple
              chips
            />
            <v-btn color="primary" variant="tonal" @click="savePrerequisites"
              >Save prerequisites</v-btn
            >
          </v-card>

          <v-card
            v-if="selectedCourse"
            rounded="xl"
            class="pa-4 postcard-gradient-card"
          >
            <h3 class="text-h6 mb-3">Progression apprenants</h3>
            <v-row>
              <v-col cols="12" md="4"
                ><v-text-field
                  v-model="progressForm.learner"
                  label="Learner"
                  variant="outlined"
                  density="comfortable"
              /></v-col>
              <v-col cols="12" md="4">
                <v-select
                  v-model="progressForm.lessonId"
                  :items="
                    allCourseLessons.map((lesson) => ({
                      title: lesson.title,
                      value: lesson.id,
                    }))
                  "
                  label="Lesson"
                  variant="outlined"
                  density="comfortable"
                />
              </v-col>
              <v-col cols="12" md="4"
                ><v-select
                  v-model="progressForm.status"
                  :items="statusOptions"
                  label="Status"
                  variant="outlined"
                  density="comfortable"
              /></v-col>
            </v-row>
            <div class="d-flex ga-2 mb-3">
              <v-btn color="primary" @click="updateProgress"
                >Save lesson progress</v-btn
              >
              <v-btn
                v-if="selectedLesson?.assessment"
                variant="tonal"
                @click="
                  toggleAssessmentCompletion(
                    selectedLesson.assessment.id,
                    !(
                      selectedLearnerProgress?.completedAssessments.includes(
                        selectedLesson.assessment.id,
                      ) ?? false
                    ),
                  )
                "
              >
                Toggle assessment completion
              </v-btn>
            </div>

            <v-table density="comfortable">
              <thead>
                <tr>
                  <th>Learner</th>
                  <th>Lessons tracked</th>
                  <th>Assessments completed</th>
                  <th>Updated at</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="entry in progressData" :key="entry.id">
                  <td>{{ entry.learner }}</td>
                  <td>{{ Object.keys(entry.lessonStatuses).length }}</td>
                  <td>{{ entry.completedAssessments.length }}</td>
                  <td>{{ new Date(entry.updatedAt).toLocaleString() }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
