<script setup lang="ts">
definePageMeta({
  title: 'appbar.quiz',
})

type QuizStep = 'select-category' | 'select-level' | 'in-quiz' | 'finished'

type QuizCategory = {
  id: string
  title: string
  description: string
  color: string
  icon: string
}

type QuizLevel = {
  id: string
  value: string
  label: string
  description: string
  timeLimit: number
}

type QuizQuestion = {
  id: string
  text: string
  answers: string[]
  correctIndex: number
}

const { t } = useI18n()
const theme = useTheme()

const quizStep = ref<QuizStep>('select-category')
const isLoading = ref(true)
const errorMessage = ref('')

const categories = ref<QuizCategory[]>([])
const levels = ref<QuizLevel[]>([])

const selectedCategoryId = ref<string | null>(null)
const selectedLevelValue = ref<string | null>(null)
const questions = ref<QuizQuestion[]>([])

const currentQuestionIndex = ref(0)
const selectedAnswerIndex = ref<number | null>(null)
const score = ref(0)
const correctAnswers = ref(0)
const remainingTime = ref(0)

let timer: ReturnType<typeof setInterval> | null = null

const primaryColor = computed(
  () => theme.current.value.colors.primary || '#1976D2',
)

const selectedCategory = computed(() =>
  categories.value.find((category) => category.id === selectedCategoryId.value),
)

const selectedLevel = computed(() =>
  levels.value.find((level) => level.value === selectedLevelValue.value),
)

const currentQuestion = computed(
  () => questions.value[currentQuestionIndex.value] || null,
)

const progressValue = computed(() => {
  if (!questions.value.length) return 0

  return Math.round((currentQuestionIndex.value / questions.value.length) * 100)
})

const scorePercent = computed(() => {
  if (!questions.value.length) return 0

  return Math.round((score.value / questions.value.length) * 100)
})

const hasPassed = computed(() => scorePercent.value >= 60)

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

function levelGradient() {
  return `linear-gradient(145deg, ${primaryColor.value}, rgba(255,255,255,0.14))`
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
    if (remainingTime.value <= 0) {
      clearTimer()
      finishQuiz()
      return
    }

    remainingTime.value -= 1
  }, 1000)
}

function resetQuizState() {
  questions.value = []
  currentQuestionIndex.value = 0
  selectedAnswerIndex.value = null
  score.value = 0
  correctAnswers.value = 0
  clearTimer()
}

function createQuestions(categoryTitle: string, levelLabel: string) {
  const base = [
    {
      text: t('pages.applications.quiz.questions.goal.text', {
        category: categoryTitle,
      }),
      answers: [
        t('pages.applications.quiz.questions.goal.answers.0'),
        t('pages.applications.quiz.questions.goal.answers.1'),
        t('pages.applications.quiz.questions.goal.answers.2'),
        t('pages.applications.quiz.questions.goal.answers.3'),
      ],
      correctIndex: 1,
    },
    {
      text: t('pages.applications.quiz.questions.rhythm.text', { level: levelLabel }),
      answers: [
        t('pages.applications.quiz.questions.rhythm.answers.0'),
        t('pages.applications.quiz.questions.rhythm.answers.1'),
        t('pages.applications.quiz.questions.rhythm.answers.2'),
        t('pages.applications.quiz.questions.rhythm.answers.3'),
      ],
      correctIndex: 0,
    },
    {
      text: t('pages.applications.quiz.questions.feedback.text'),
      answers: [
        t('pages.applications.quiz.questions.feedback.answers.0'),
        t('pages.applications.quiz.questions.feedback.answers.1'),
        t('pages.applications.quiz.questions.feedback.answers.2'),
        t('pages.applications.quiz.questions.feedback.answers.3'),
      ],
      correctIndex: 2,
    },
    {
      text: t('pages.applications.quiz.questions.metric.text'),
      answers: [
        t('pages.applications.quiz.questions.metric.answers.0'),
        t('pages.applications.quiz.questions.metric.answers.1'),
        t('pages.applications.quiz.questions.metric.answers.2'),
        t('pages.applications.quiz.questions.metric.answers.3'),
      ],
      correctIndex: 3,
    },
    {
      text: t('pages.applications.quiz.questions.confidence.text'),
      answers: [
        t('pages.applications.quiz.questions.confidence.answers.0'),
        t('pages.applications.quiz.questions.confidence.answers.1'),
        t('pages.applications.quiz.questions.confidence.answers.2'),
        t('pages.applications.quiz.questions.confidence.answers.3'),
      ],
      correctIndex: 0,
    },
  ]

  return base.map((item, index) => ({
    id: `question-${index + 1}`,
    text: item.text,
    answers: item.answers,
    correctIndex: item.correctIndex,
  }))
}

async function loadQuizSetup() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const [catalogResponse, levelsResponse] = await Promise.all([
      $fetch<Record<string, unknown>[]>('/api/games/catalog'),
      $fetch<{ items?: unknown[]; levels?: unknown[] }>('/api/games/levels'),
    ])

    const fallbackColors = ['#5C6BC0', '#00ACC1', '#43A047', '#FB8C00', '#8E24AA']

    categories.value = (Array.isArray(catalogResponse) ? catalogResponse : [])
      .filter((item) => typeof item?.id === 'string')
      .map((item, index) => ({
        id: String(item.id),
        title:
          typeof item.name === 'string' && item.name.trim()
            ? item.name
            : t('pages.applications.quiz.unnamedCategory'),
        description:
          typeof item.description === 'string' && item.description.trim()
            ? item.description
            : t('pages.applications.quiz.categoryFallbackDescription'),
        color: normalizeColor(
          item.color,
          fallbackColors[index % fallbackColors.length] || '#5C6BC0',
        ),
        icon:
          typeof item.icon === 'string' && item.icon.trim()
            ? item.icon
            : 'mdi-shape-outline',
      }))

    const rawLevels = Array.isArray(levelsResponse?.items)
      ? levelsResponse.items
      : Array.isArray(levelsResponse?.levels)
        ? levelsResponse.levels
        : []

    levels.value = rawLevels
      .filter((level): level is Record<string, unknown> =>
        typeof level === 'object' && level !== null,
      )
      .map((level) => {
        const value =
          typeof level.value === 'string' && level.value.trim()
            ? level.value
            : typeof level.id === 'string'
              ? level.id
              : 'standard'

        const normalizedValue = value.toLowerCase()
        const timeByDifficulty: Record<string, number> = {
          easy: 90,
          medium: 70,
          hard: 50,
        }

        return {
          id: typeof level.id === 'string' ? level.id : value,
          value,
          label:
            typeof level.label === 'string' && level.label.trim()
              ? level.label
              : value,
          description:
            typeof level.description === 'string' && level.description.trim()
              ? level.description
              : t('pages.applications.quiz.levelFallbackDescription'),
          timeLimit: timeByDifficulty[normalizedValue] || 60,
        }
      })

    if (!categories.value.length || !levels.value.length) {
      throw new Error(t('pages.applications.quiz.errorState.emptyData'))
    }
  }
  catch (error) {
    errorMessage.value =
      error instanceof Error
        ? error.message
        : t('pages.applications.quiz.errorState.generic')
  }
  finally {
    isLoading.value = false
  }
}

function selectCategory(categoryId: string) {
  selectedCategoryId.value = categoryId
  selectedLevelValue.value = null
  resetQuizState()
  quizStep.value = 'select-level'
}

function selectLevel(levelValue: string) {
  selectedLevelValue.value = levelValue
}

function launchQuiz() {
  if (!selectedCategory.value || !selectedLevel.value) return

  resetQuizState()

  questions.value = createQuestions(
    selectedCategory.value.title,
    selectedLevel.value.label,
  )
  quizStep.value = 'in-quiz'
  startTimer()
}

function submitAnswer(answerIndex: number) {
  if (!currentQuestion.value || selectedAnswerIndex.value !== null) return

  selectedAnswerIndex.value = answerIndex

  const isCorrect = answerIndex === currentQuestion.value.correctIndex
  if (isCorrect) {
    score.value += 1
    correctAnswers.value += 1
  }

  setTimeout(() => {
    if (currentQuestionIndex.value >= questions.value.length - 1) {
      finishQuiz()
      return
    }

    currentQuestionIndex.value += 1
    selectedAnswerIndex.value = null
  }, 450)
}

function finishQuiz() {
  clearTimer()
  quizStep.value = 'finished'
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
  <v-container fluid class="quiz-page py-6">
    <v-card class="pa-4 pa-sm-6" rounded="xl">
      <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4">
        <div>
          <h2 class="text-h5 mb-1">{{ t('appbar.quiz') }}</h2>
          <p class="text-medium-emphasis mb-0">
            {{ t('pages.applications.quizDescription') }}
          </p>
        </div>

        <v-chip color="primary" variant="tonal" label>
          {{ t(`pages.applications.quiz.steps.${quizStep}`) }}
        </v-chip>
      </div>

      <template v-if="isLoading">
        <v-row>
          <v-col v-for="index in 6" :key="`quiz-skeleton-${index}`" cols="12" sm="6" lg="4">
            <v-skeleton-loader type="image, article" class="rounded-lg" />
          </v-col>
        </v-row>
      </template>

      <template v-else-if="errorMessage">
        <v-alert type="error" variant="tonal" class="mb-4" border="start">
          <div class="d-flex align-center justify-space-between ga-3 flex-wrap">
            <span>{{ errorMessage }}</span>
            <v-btn color="primary" variant="flat" @click="loadQuizSetup">
              {{ t('common.retry') }}
            </v-btn>
          </div>
        </v-alert>
      </template>

      <v-fade-transition mode="out-in">
        <div :key="quizStep">
          <section v-if="quizStep === 'select-category'">
            <h3 class="text-h6 mb-4">{{ t('pages.applications.quiz.selectCategoryTitle') }}</h3>
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
                    class="quiz-card category-card h-100"
                    rounded="xl"
                    :style="{
                      backgroundImage: categoryGradient(category),
                      animationDelay: `${index * 80}ms`,
                    }"
                    @click="selectCategory(category.id)"
                  >
                    <v-card-text class="text-white">
                      <div class="d-flex align-center justify-space-between mb-3">
                        <v-icon :icon="category.icon || 'mdi-shape-outline'" size="32" />
                        <v-icon icon="mdi-arrow-right" />
                      </div>
                      <div class="text-h6 mb-1">{{ category.title }}</div>
                      <p class="text-body-2 text-white mb-0 category-description">
                        {{ category.description }}
                      </p>
                    </v-card-text>
                  </v-card>
                </v-slide-y-transition>
              </v-col>
            </v-row>
          </section>

          <section v-else-if="quizStep === 'select-level'">
            <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4">
              <h3 class="text-h6 mb-0">{{ t('pages.applications.quiz.selectLevelTitle') }}</h3>
              <v-btn variant="text" prepend-icon="mdi-arrow-left" @click="restartQuiz">
                {{ t('pages.applications.quiz.backToCategories') }}
              </v-btn>
            </div>

            <v-row>
              <v-col v-for="(level, index) in levels" :key="level.id" cols="12" sm="6" md="4">
                <v-card
                  class="quiz-card level-card h-100"
                  rounded="xl"
                  :class="{ 'level-card--selected': selectedLevelValue === level.value }"
                  :style="{
                    backgroundImage: levelGradient(),
                    animationDelay: `${index * 80}ms`,
                  }"
                  @click="selectLevel(level.value)"
                >
                  <v-card-text>
                    <div class="d-flex align-center justify-space-between mb-2">
                      <span class="text-overline">{{ t('pages.applications.quiz.levelLabel') }}</span>
                      <v-chip size="small" color="primary" variant="tonal" label>
                        {{ level.timeLimit }}s
                      </v-chip>
                    </div>
                    <div class="text-h6 mb-1">{{ level.label }}</div>
                    <p class="text-body-2 text-medium-emphasis mb-0">{{ level.description }}</p>
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
            <div class="d-flex align-center justify-space-between ga-3 mb-3 flex-wrap">
              <div>
                <div class="text-caption text-medium-emphasis">
                  {{ t('pages.applications.quiz.questionCounter', {
                    current: currentQuestionIndex + 1,
                    total: questions.length,
                  }) }}
                </div>
                <h3 class="text-h6 mb-0">{{ selectedCategory?.title }}</h3>
              </div>

              <v-chip color="warning" variant="tonal" label prepend-icon="mdi-timer-outline">
                {{ t('pages.applications.quiz.timeLeft', { time: remainingTime }) }}
              </v-chip>
            </div>

            <v-progress-linear
              :model-value="progressValue"
              color="primary"
              rounded
              height="10"
              class="mb-6"
            />

            <v-card variant="tonal" color="primary" rounded="lg" class="mb-4">
              <v-card-text class="text-body-1 font-weight-medium">
                {{ currentQuestion.text }}
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
                      : answerIndex === currentQuestion.correctIndex
                        ? 'success'
                        : answerIndex === selectedAnswerIndex
                          ? 'error'
                          : undefined
                  "
                  :variant="selectedAnswerIndex === null ? 'outlined' : 'flat'"
                  @click="submitAnswer(answerIndex)"
                >
                  {{ answer }}
                </v-btn>
              </v-col>
            </v-row>
          </section>

          <section v-else-if="quizStep === 'finished'">
            <v-card rounded="xl" class="pa-4 pa-sm-6" :color="hasPassed ? 'success' : 'warning'" variant="tonal">
              <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-4">
                <h3 class="text-h5 mb-0">{{ t('pages.applications.quiz.results.title') }}</h3>
                <v-chip :color="hasPassed ? 'success' : 'warning'" label>
                  {{ t(hasPassed ? 'pages.applications.quiz.results.pass' : 'pages.applications.quiz.results.fail') }}
                </v-chip>
              </div>

              <v-row>
                <v-col cols="12" sm="4">
                  <v-sheet rounded="lg" class="pa-4 text-center" border>
                    <div class="text-caption text-medium-emphasis">{{ t('pages.applications.quiz.results.score') }}</div>
                    <div class="text-h4 font-weight-bold">{{ score }}/{{ questions.length }}</div>
                  </v-sheet>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-sheet rounded="lg" class="pa-4 text-center" border>
                    <div class="text-caption text-medium-emphasis">{{ t('pages.applications.quiz.results.percentage') }}</div>
                    <div class="text-h4 font-weight-bold">{{ scorePercent }}%</div>
                  </v-sheet>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-sheet rounded="lg" class="pa-4 text-center" border>
                    <div class="text-caption text-medium-emphasis">{{ t('pages.applications.quiz.results.timeRemaining') }}</div>
                    <div class="text-h4 font-weight-bold">{{ remainingTime }}s</div>
                  </v-sheet>
                </v-col>
              </v-row>

              <p class="mt-4 mb-0 text-medium-emphasis">
                {{ t('pages.applications.quiz.results.correctAnswers', {
                  count: correctAnswers,
                  total: questions.length,
                }) }}
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
.quiz-card {
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  animation: quizCardAppear 360ms ease both;
}

.category-card {
  min-height: 190px;
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

@media (max-width: 600px) {
  .category-card {
    min-height: 165px;
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
