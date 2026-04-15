<script setup lang="ts">
import type {
  QuizCategoriesApiResponse,
  QuizLevelsApiResponse,
  QuizSubmitApiResponse,
} from '~~/server/types/api/quiz'

definePageMeta({
  title: 'appbar.quiz',
})

type QuizStep = 'select-category' | 'select-level' | 'in-quiz' | 'finished'

type QuizCategory = {
  id: string
  value: string
  title: string
  description: string
  color: string
  icon: string
}

type QuizLevelUi = {
  id: string
  value: string
  label: string
  color: string
  description?: string | null
  timeLimit: number
}

type QuizQuestionUi = {
  id: string
  question: string
  answers: Array<{ id: string; text: string }>
}

const { t } = useI18n()
const theme = useTheme()
const route = useRoute()
const { loggedIn } = useUserSession()

const quizStep = ref<QuizStep>('select-category')
const isLoading = ref(true)
const errorMessage = ref('')

const categories = ref<QuizCategory[]>([])
const levels = ref<QuizLevelUi[]>([])

const selectedCategoryId = ref<string | null>(null)
const selectedLevelValue = ref<string | null>(null)
const questions = ref<QuizQuestionUi[]>([])

const currentQuestionIndex = ref(0)
const selectedAnswerIndex = ref<number | null>(null)
const selectedAnswersByQuestion = ref<Record<string, string>>({})
const remainingTime = ref(0)
const isSubmittingResult = ref(false)
const submitErrorMessage = ref('')
const submitResult = ref<QuizSubmitApiResponse | null>(null)

let timer: ReturnType<typeof setInterval> | null = null

const primaryColor = computed(
  () => theme.current.value.colors.primary || '#074a8b',
)

const selectedCategory = computed(() =>
  categories.value.find((c) => c.id === selectedCategoryId.value),
)

const selectedLevel = computed(() =>
  levels.value.find((l) => l.value === selectedLevelValue.value),
)

const currentQuestion = computed(
  () => questions.value[currentQuestionIndex.value] || null,
)

const progressValue = computed(() => {
  if (!questions.value.length) return 0
  return Math.round((currentQuestionIndex.value / questions.value.length) * 100)
})

const scorePercent = computed(() => submitResult.value?.percentage ?? 0)
const hasPassed = computed(() => submitResult.value?.passed ?? false)
const totalDuration = computed(() => selectedLevel.value?.timeLimit || 60)

function isHexColor(value: unknown): value is string {
  return typeof value === 'string' && /^#(?:[0-9a-fA-F]{3}){1,2}$/.test(value)
}

function normalizeColor(candidate: unknown, fallback: string) {
  return isHexColor(candidate) ? candidate : fallback
}

function categoryGradient(category: QuizCategory) {
  return `linear-gradient(145deg, ${category.color}, ${primaryColor.value})`
}

function levelGradient(level: QuizLevelUi) {
  return `linear-gradient(145deg, ${level.color}, ${primaryColor.value})`
}

function clearTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function startTimer() {
  clearTimer()
  remainingTime.value = totalDuration.value

  timer = setInterval(() => {
    if (quizStep.value !== 'in-quiz') return

    if (remainingTime.value <= 0) {
      clearTimer()
      finishQuiz()
      return
    }

    remainingTime.value--
  }, 1000)
}

function resetQuizState() {
  questions.value = []
  currentQuestionIndex.value = 0
  selectedAnswerIndex.value = null
  selectedAnswersByQuestion.value = {}
  submitErrorMessage.value = ''
  submitResult.value = null
  isSubmittingResult.value = false
  clearTimer()
}

async function loadQuizSetup() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const [catRes, lvlRes] = await Promise.all([
      $fetch<QuizCategoriesApiResponse>('/api/quiz/public/categories'),
      $fetch<QuizLevelsApiResponse>('/api/quiz/public/levels'),
    ])

    categories.value = catRes.items || []
    levels.value = lvlRes.items || []
  } catch (e: any) {
    errorMessage.value = e.message || 'Error'
  } finally {
    isLoading.value = false
  }
}

function selectCategory(id: string) {
  selectedCategoryId.value = id
  selectedLevelValue.value = null
  resetQuizState()
  quizStep.value = 'select-level'
}

function selectLevel(val: string) {
  selectedLevelValue.value = val
}

async function launchQuiz() {
  if (!selectedCategory.value || !selectedLevel.value) return

  resetQuizState()
  isLoading.value = true

  try {
    const res = await $fetch('/api/quiz/public', {
      query: {
        category: selectedCategory.value.value,
        level: selectedLevel.value.value,
      },
    })

    questions.value = res.questions || []
    quizStep.value = 'in-quiz'
    startTimer()
  } finally {
    isLoading.value = false
  }
}

function submitAnswer(index: number) {
  if (!currentQuestion.value || selectedAnswerIndex.value !== null) return

  selectedAnswerIndex.value = index

  const answer = currentQuestion.value.answers[index]

  selectedAnswersByQuestion.value = {
    ...selectedAnswersByQuestion.value,
    [currentQuestion.value.id]: answer.id,
  }

  setTimeout(() => {
    if (currentQuestionIndex.value >= questions.value.length - 1) {
      finishQuiz()
    } else {
      currentQuestionIndex.value++
      selectedAnswerIndex.value = null
    }
  }, 400)
}

async function finishQuiz() {
  if (quizStep.value === 'finished') return

  clearTimer()
  await submitQuizResult()
  quizStep.value = 'finished'
}

async function submitQuizResult() {
  if (!loggedIn.value) {
    await navigateTo('/login')
    return
  }

  const answers = Object.entries(selectedAnswersByQuestion.value).map(
    ([questionId, answerId]) => ({ questionId, answerId }),
  )

  if (!answers.length) return

  isSubmittingResult.value = true

  try {
    submitResult.value = await $fetch('/api/quiz/submit', {
      method: 'POST',
      body: { answers },
    })
  } finally {
    isSubmittingResult.value = false
  }
}

function restartQuiz() {
  selectedCategoryId.value = null
  selectedLevelValue.value = null
  resetQuizState()
  quizStep.value = 'select-category'
}

onMounted(loadQuizSetup)
onBeforeUnmount(clearTimer)
</script>

<template>
  <v-container fluid>
    <AppPageDrawers>
      <template #left>
        <QuizLeaderboardPanel />
      </template>
    </AppPageDrawers>
    <v-card variant="text" class="pa-2 quiz-shell" rounded="xl">
      <v-fade-transition>
        <div>
          <section v-if="quizStep === 'select-category'">
            <h3 class="text-h6 mb-4">
              {{ t('pages.applications.quiz.selectCategoryTitle') }}
            </h3>
            <v-row>
              <v-col
                v-for="(category, index) in categories"
                :key="category.id"
                cols="12"
                sm="6"
                lg="4"
              >
                <v-slide-y-transition :appear="true">
                  <v-card
                    class="quiz-card category-card"
                    rounded="xl"
                    :style="{
                      backgroundImage: categoryGradient(category),
                      animationDelay: `${index * 80}ms`,
                    }"
                    @click="selectCategory(category.id)"
                  >
                    <v-card-text>
                      <div class="d-flex align-center mb-3">
                        <v-icon
                          :icon="category.icon || 'mdi-shape-outline'"
                          size="32"
                        />
                        <div class="text-h6 mx-3">{{ category.name }}</div>
                      </div>
                    </v-card-text>
                  </v-card>
                </v-slide-y-transition>
              </v-col>
            </v-row>
          </section>

          <section v-else-if="quizStep === 'select-level'">
            <div
              class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4"
            >
              <h3 class="text-h6 mb-0">
                {{ t('pages.applications.quiz.selectLevelTitle') }}
              </h3>
              <v-btn
                variant="text"
                prepend-icon="mdi-arrow-left"
                @click="restartQuiz"
              >
                {{ t('pages.applications.quiz.backToCategories') }}
              </v-btn>
            </div>

            <v-row>
              <v-col
                v-for="(level, index) in levels"
                :key="level.id"
                cols="12"
                sm="6"
                md="4"
              >
                <v-card
                  class="quiz-card level-card h-100"
                  rounded="xl"
                  :class="{
                    'level-card--selected': selectedLevelValue === level.value,
                  }"
                  :style="{
                    backgroundImage: levelGradient(level),
                    animationDelay: `${index * 80}ms`,
                  }"
                  @click="selectLevel(level.value)"
                >
                  <v-card-text class="text-center">
                    <div class="text-h6 mb-1">{{ level.value }}</div>
                  </v-card-text>
                </v-card>
              </v-col>
            </v-row>

            <div class="d-flex justify-end mt-4">
              <v-btn
                color="primary"
                size="large"
                :disabled="!selectedLevelValue"
                @click="launchQuiz"
              >
                {{ t('pages.applications.quiz.startQuiz') }}
              </v-btn>
            </div>
          </section>

          <section v-else-if="quizStep === 'in-quiz' && currentQuestion">
            <div
              class="d-flex align-center justify-space-between ga-3 mb-3 flex-wrap"
            >
              <div>
                <div class="">
                  {{
                    t('pages.applications.quiz.questionCounter', {
                      current: currentQuestionIndex + 1,
                      total: questions.length,
                    })
                  }}
                </div>
                <h3 class="text-h6 mb-0">{{ selectedCategory?.title }}</h3>
              </div>

              <v-chip
                color="warning"
                variant="tonal"
                label
                prepend-icon="mdi-timer-outline"
              >
                {{
                  t('pages.applications.quiz.timeLeft', { time: remainingTime })
                }}
              </v-chip>
            </div>

            <v-progress-linear
              :model-value="progressValue"
              color="primary"
              rounded
              height="10"
              class="mb-6"
            />

            <v-card variant="text" rounded="lg" class="mb-4">
              <v-card-text>
                {{ currentQuestion.title }}
              </v-card-text>
            </v-card>

            <v-row>
              <v-col
                v-for="(answer, answerIndex) in currentQuestion.answers"
                :key="`${currentQuestion.id}-answer-${answerIndex}`"
                cols="12"
                md="6"
              >
                <v-btn
                  block
                  height="64"
                  class="justify-start text-wrap answer-btn"
                  :color="
                    selectedAnswerIndex === null
                      ? undefined
                      : answerIndex === selectedAnswerIndex
                        ? 'primary'
                        : undefined
                  "
                  :variant="selectedAnswerIndex === null ? 'outlined' : 'flat'"
                  @click="submitAnswer(answerIndex)"
                >
                  {{ answer.label }}
                </v-btn>
              </v-col>
            </v-row>
          </section>

          <section v-else-if="quizStep === 'finished'">
            <v-card
              rounded="xl"
              class="pa-4 pa-sm-6"
              :color="hasPassed ? 'success' : 'warning'"
              variant="tonal"
            >
              <div
                class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4"
              >
                <h3 class="text-h5 mb-0">
                  {{ t('pages.applications.quiz.results.title') }}
                </h3>
                <v-chip :color="hasPassed ? 'success' : 'warning'" label>
                  {{
                    t(
                      hasPassed
                        ? 'pages.applications.quiz.results.pass'
                        : 'pages.applications.quiz.results.fail',
                    )
                  }}
                </v-chip>
              </div>

              <v-alert
                v-if="submitErrorMessage"
                type="warning"
                variant="tonal"
                border="start"
                class="mb-4"
              >
                {{ submitErrorMessage }}
              </v-alert>

              <v-alert
                v-else-if="isSubmittingResult"
                type="info"
                variant="tonal"
                border="start"
                class="mb-4"
              >
                Soumission des résultats en cours…
              </v-alert>

              <v-row>
                <v-col cols="12" sm="4">
                  <v-sheet rounded="lg" class="pa-4 text-center" border>
                    <div class="text-caption text-medium-emphasis">
                      {{ t('pages.applications.quiz.results.score') }}
                    </div>
                    <div class="text-h4 font-weight-bold">
                      {{ submitResult?.score ?? 0 }}/{{
                        submitResult?.totalQuestions ?? questions.length
                      }}
                    </div>
                  </v-sheet>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-sheet rounded="lg" class="pa-4 text-center" border>
                    <div class="text-caption text-medium-emphasis">
                      {{ t('pages.applications.quiz.results.percentage') }}
                    </div>
                    <div class="text-h4 font-weight-bold">
                      {{ scorePercent }}%
                    </div>
                  </v-sheet>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-sheet rounded="lg" class="pa-4 text-center" border>
                    <div class="text-caption text-medium-emphasis">
                      {{ t('pages.applications.quiz.results.timeRemaining') }}
                    </div>
                    <div class="text-h4 font-weight-bold">
                      {{ remainingTime }}s
                    </div>
                  </v-sheet>
                </v-col>
              </v-row>

              <p class="mt-4 mb-0 text-medium-emphasis">
                {{
                  t('pages.applications.quiz.results.correctAnswers', {
                    count: submitResult?.correctAnswers ?? 0,
                    total: submitResult?.totalQuestions ?? questions.length,
                  })
                }}
              </p>

              <p
                v-if="submitResult?.attemptId"
                class="mt-2 mb-0 text-caption text-medium-emphasis"
              >
                Attempt ID: {{ submitResult.attemptId }}
              </p>

              <div class="d-flex justify-end mt-6">
                <v-btn color="primary" @click="restartQuiz">
                  {{ t('pages.applications.quiz.playAgain') }}
                </v-btn>
              </div>
            </v-card>
          </section>
        </div>
      </v-fade-transition>
    </v-card>
  </v-container>
</template>

<style scoped>
.quiz-shell {
  background: linear-gradient(
    240deg,
    rgba(var(--v-theme-primary), 0.18) 0%,
    transparent 20%
  );
  height: calc(100% - 40px);
}

.quiz-card {
  cursor: pointer;
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
  animation: quizCardAppear 360ms ease both;
}

.level-card {
  border: 1px solid rgba(var(--v-theme-primary), 0.16);
}

.level-card--selected {
  border-color: rgba(var(--v-theme-primary), 0.8);
  box-shadow: 0 12px 28px rgba(var(--v-theme-primary), 0.2);
}

.category-description {
  opacity: 0.92;
}

.answer-btn {
  white-space: normal;
  text-align: left;
  line-height: 1.2;
}

@media (hover: hover) {
  .quiz-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 14px 28px rgba(15, 23, 42, 0.2);
  }
}

@keyframes quizCardAppear {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
