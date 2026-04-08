<script setup lang="ts">
import { Notify } from '~/stores/notification'

const { t, te } = useI18n()

definePageMeta({
  title: 'appbar.games',
})

const catalogStore = useGameCatalogStore()

const selectedCategoryId = ref<string | null>(null)
const selectedSubCategoryId = ref<string | null>(null)
const selectedGameId = ref<string | null>(null)
const selectedLevelValue = ref<string | null>(null)
const catalogError = ref('')
const levelsError = ref('')
const finishResult = ref<'win' | 'lose' | null>(null)
const lastFinishedSession = ref<{
  sessionId: string
  status: string
  level: string
  coins: number
  result: 'win' | 'lose'
  finishedAt: string
} | null>(null)

const safeCategories = computed(() =>
  Array.isArray(catalogStore.categories) ? catalogStore.categories : [],
)
const safeLevels = computed(() =>
  Array.isArray(catalogStore.levels) ? catalogStore.levels : [],
)

const selectedCategory = computed(
  () =>
    safeCategories.value.find(
      (category) => category.id === selectedCategoryId.value,
    ) ?? null,
)

const subCategories = computed(
  () => selectedCategory.value?.subCategories ?? [],
)

const selectedSubCategory = computed(
  () =>
    subCategories.value.find(
      (subCategory) => subCategory.id === selectedSubCategoryId.value,
    ) ?? null,
)

const games = computed(() => selectedSubCategory.value?.games ?? [])
const selectedGame = computed(
  () => games.value.find((game) => game.id === selectedGameId.value) ?? null,
)

const canStart = computed(
  () =>
    Boolean(selectedGameId.value && selectedLevelValue.value) &&
    !catalogStore.startingSession &&
    !catalogStore.finishingSession,
)

const hasActiveRequest = computed(
  () => catalogStore.startingSession || catalogStore.finishingSession,
)

function tOrFallback(key: string, fallback: string) {
  return te(key) ? t(key) : fallback
}

type CatalogEntity = {
  name: string
  nameKey?: string
  description?: string | null
  descriptionKey?: string
}

function entityName(entity: CatalogEntity) {
  return tOrFallback(entity.nameKey ?? '', entity.name)
}

function entityDescription(entity: CatalogEntity) {
  return tOrFallback(entity.descriptionKey ?? '', entity.description ?? '')
}

function difficultyLabel(level: string) {
  return tOrFallback(`gamePage.catalog.difficulties.${level}`, level)
}

function archiveAndResetSession(result: 'win' | 'lose') {
  if (!catalogStore.currentSession) {
    return
  }

  lastFinishedSession.value = {
    sessionId: catalogStore.currentSession.sessionId,
    status: catalogStore.currentSession.status,
    level: catalogStore.currentSession.level,
    coins: catalogStore.currentSession.coins,
    result,
    finishedAt: new Date().toISOString(),
  }

  // Product rule: une session "terminée" n'est plus considérée active.
  catalogStore.currentSession = null
}

function resetSelectionIfMissing() {
  if (
    selectedCategoryId.value &&
    !safeCategories.value.some(
      (category) => category.id === selectedCategoryId.value,
    )
  ) {
    selectedCategoryId.value = null
  }

  if (
    selectedSubCategoryId.value &&
    !safeCategories.value
      .flatMap(category => category.subCategories)
      .some((subCategory) => subCategory.id === selectedSubCategoryId.value)
  ) {
    selectedSubCategoryId.value = null
  }

  if (
    selectedGameId.value &&
    !safeCategories.value
      .flatMap(category => category.subCategories)
      .flatMap(subCategory => subCategory.games)
      .some((game) => game.id === selectedGameId.value)
  ) {
    selectedGameId.value = null
  }

  if (
    selectedLevelValue.value &&
    !safeLevels.value.some((level) => level.value === selectedLevelValue.value)
  ) {
    selectedLevelValue.value = null
  }
}

function selectCategory(categoryId: string) {
  selectedCategoryId.value = categoryId
  selectedSubCategoryId.value = null
  selectedGameId.value = null
}

function selectSubCategory(subCategoryId: string) {
  selectedSubCategoryId.value = subCategoryId
  selectedGameId.value = null
}

async function onStart() {
  if (!selectedGameId.value || !selectedLevelValue.value) {
    return
  }

  finishResult.value = null
  try {
    await catalogStore.startSession(
      selectedGameId.value,
      selectedLevelValue.value,
    )
    Notify.success(
      tOrFallback(
        'gamePage.messages.startSuccess',
        'Game session started successfully.',
      ),
    )
  } catch (error) {
    Notify.error(error)
  }
}

async function onFinish(result: 'win' | 'lose') {
  const sessionId = catalogStore.currentSession?.sessionId

  if (!sessionId) {
    return
  }

  finishResult.value = result
  try {
    await catalogStore.finishSession(sessionId, result)
    archiveAndResetSession(result)
    Notify.success(
      result === 'win'
        ? tOrFallback(
            'gamePage.messages.finishWinSuccess',
            'Session finished with a win.',
          )
        : tOrFallback(
            'gamePage.messages.finishLoseSuccess',
            'Session finished with a loss.',
          ),
    )
  } catch (error) {
    Notify.error(error)
  }
}

async function onRetryCatalog() {
  catalogError.value = ''

  try {
    await catalogStore.fetchCatalog(true)
    resetSelectionIfMissing()
  } catch (error) {
    catalogError.value =
      error instanceof Error ? error.message : 'Unable to load game catalog.'
    Notify.error(error)
  }
}

async function onRetryLevels() {
  levelsError.value = ''

  try {
    await catalogStore.fetchLevels(true)
    resetSelectionIfMissing()
    Notify.success(
      tOrFallback(
        'gamePage.messages.retrySuccess',
        'Catalog refreshed successfully.',
      ),
    )
  } catch (error) {
    levelsError.value =
      error instanceof Error ? error.message : 'Unable to load game levels.'
    Notify.error(error)
  }
}

onMounted(async () => {
  catalogError.value = ''
  levelsError.value = ''

  const [catalogResult, levelsResult] = await Promise.allSettled([
    catalogStore.fetchCatalog(),
    catalogStore.fetchLevels(),
  ])

  if (catalogResult.status === 'rejected') {
    const error = catalogResult.reason
    catalogError.value =
      error instanceof Error ? error.message : 'Unable to load game catalog.'
    Notify.error(error)
  }

  if (levelsResult.status === 'rejected') {
    const error = levelsResult.reason
    levelsError.value =
      error instanceof Error ? error.message : 'Unable to load game levels.'
    Notify.error(error)
  }
})

watch(safeCategories, resetSelectionIfMissing)
watch(safeLevels, resetSelectionIfMissing)
</script>

<template>
  <v-container fluid>
    <h1 class="text-h3 mb-6">{{ t('appbar.games') }}</h1>

    <v-alert
      v-if="catalogError"
      type="warning"
      variant="tonal"
      class="mb-4"
    >
      <div
        class="d-flex flex-column flex-sm-row align-sm-center justify-space-between ga-3"
      >
        <span>{{ catalogError }}</span>
        <v-btn size="small" variant="outlined" @click="onRetryCatalog">
          {{ tOrFallback('gamePage.actions.retry', 'Retry') }}
        </v-btn>
      </div>
    </v-alert>

    <v-card class="mb-6" rounded="xl">
      <v-card-title>{{
        t('gamePage.catalog.sections.categories')
      }}</v-card-title>
      <v-card-text>
        <v-skeleton-loader
          v-if="catalogStore.loadingCatalog"
          type="list-item-three-line, list-item-three-line"
        />
        <v-row v-else-if="safeCategories.length" dense>
          <v-col
            v-for="category in safeCategories"
            :key="category.id"
            cols="12"
            sm="6"
            md="4"
          >
            <v-card
              rounded="lg"
              :variant="
                selectedCategoryId === category.id ? 'elevated' : 'tonal'
              "
              :color="
                selectedCategoryId === category.id ? 'primary' : undefined
              "
              class="cursor-pointer"
              @click="selectCategory(category.id)"
            >
              <v-card-item>
                <v-card-title>{{ entityName(category) }}</v-card-title>
                <v-card-subtitle>{{
                  entityDescription(category)
                }}</v-card-subtitle>
                <v-card-subtitle
                  >{{ category.subCategories.length }}
                  {{
                    t('gamePage.catalog.labels.subCategoryCount')
                  }}</v-card-subtitle
                >
              </v-card-item>
            </v-card>
          </v-col>
        </v-row>
        <v-alert
          v-else
          type="info"
          variant="tonal"
          :text="
            tOrFallback(
              'gamePage.states.emptyCategories',
              'No categories available at the moment.',
            )
          "
        />
      </v-card-text>
    </v-card>

    <v-card class="mb-6" rounded="xl" :disabled="!selectedCategory">
      <v-card-title>{{
        t('gamePage.catalog.sections.subCategories')
      }}</v-card-title>
      <v-card-text>
        <v-chip-group
          v-if="subCategories.length"
          :model-value="selectedSubCategoryId ? [selectedSubCategoryId] : []"
          column
        >
          <v-chip
            v-for="subCategory in subCategories"
            :key="subCategory.id"
            filter
            :color="
              selectedSubCategoryId === subCategory.id ? 'primary' : undefined
            "
            @click="selectSubCategory(subCategory.id)"
          >
            {{ entityName(subCategory) }}
          </v-chip>
        </v-chip-group>
        <v-alert
          v-else
          type="info"
          variant="tonal"
          :text="
            selectedCategory
              ? tOrFallback(
                  'gamePage.states.emptySubCategories',
                  'No sub-categories available for this category.',
                )
              : t('gamePage.catalog.states.selectCategory')
          "
        />
      </v-card-text>
    </v-card>

    <v-card class="mb-6" rounded="xl" :disabled="!selectedSubCategory">
      <v-card-title>{{ t('gamePage.catalog.sections.games') }}</v-card-title>
      <v-card-text>
        <v-row v-if="games.length" dense>
          <v-col v-for="game in games" :key="game.id" cols="12" sm="6" md="4">
            <v-card
              rounded="lg"
              :variant="selectedGameId === game.id ? 'elevated' : 'outlined'"
              :color="selectedGameId === game.id ? 'primary' : undefined"
              class="cursor-pointer"
              @click="selectedGameId = game.id"
            >
              <v-card-item>
                <v-card-title>{{ entityName(game) }}</v-card-title>
                <v-card-subtitle>{{
                  entityDescription(game) || t('gamePage.catalog.states.ready')
                }}</v-card-subtitle>
              </v-card-item>
            </v-card>
          </v-col>
        </v-row>
        <v-alert
          v-else
          type="info"
          variant="tonal"
          :text="
            selectedSubCategory
              ? tOrFallback(
                  'gamePage.states.emptyGames',
                  'No games available for this sub-category.',
                )
              : t('gamePage.catalog.states.selectSubCategory')
          "
        />
      </v-card-text>
    </v-card>

    <v-card class="mb-6" rounded="xl">
      <v-card-title>{{ t('gamePage.levels.title') }}</v-card-title>
      <v-card-text>
        <v-alert
          v-if="levelsError"
          type="warning"
          variant="tonal"
          class="mb-4"
        >
          <div
            class="d-flex flex-column flex-sm-row align-sm-center justify-space-between ga-3"
          >
            <span>{{ levelsError }}</span>
            <v-btn size="small" variant="outlined" @click="onRetryLevels">
              {{ tOrFallback('gamePage.actions.retry', 'Retry') }}
            </v-btn>
          </div>
        </v-alert>
        <v-skeleton-loader
          v-else-if="catalogStore.loadingLevels"
          type="list-item-two-line, list-item-two-line, list-item-two-line"
          class="mb-2"
        />
        <v-chip-group
          v-else
          :model-value="selectedLevelValue ? [selectedLevelValue] : []"
          column
        >
          <v-chip
            v-for="level in safeLevels"
            :key="level.id"
            filter
            :color="selectedLevelValue === level.value ? 'primary' : undefined"
            @click="selectedLevelValue = level.value"
          >
            {{ difficultyLabel(level.value) }}
          </v-chip>
        </v-chip-group>
      </v-card-text>
    </v-card>

    <div class="d-flex align-center ga-3 mb-6">
      <v-btn
        color="primary"
        :disabled="!canStart"
        :loading="catalogStore.startingSession"
        @click="onStart"
      >
        {{ t('gamePage.actions.start') }}
      </v-btn>
    </div>

    <v-card class="mb-6" rounded="xl" variant="tonal">
      <v-card-title>{{
        tOrFallback('gamePage.selection.summaryTitle', 'Current selection')
      }}</v-card-title>
      <v-card-text class="d-flex flex-wrap ga-2">
        <v-chip size="small" variant="outlined">
          {{ t('gamePage.catalog.sections.categories') }}:
          {{ selectedCategory ? entityName(selectedCategory) : '—' }}
        </v-chip>
        <v-chip size="small" variant="outlined">
          {{ t('gamePage.catalog.sections.subCategories') }}:
          {{ selectedSubCategory ? entityName(selectedSubCategory) : '—' }}
        </v-chip>
        <v-chip size="small" variant="outlined">
          {{ t('gamePage.catalog.sections.games') }}:
          {{ selectedGame ? entityName(selectedGame) : '—' }}
        </v-chip>
        <v-chip size="small" variant="outlined">
          {{ tOrFallback('gamePage.levels.title', 'Level') }}:
          {{
            selectedLevelValue ? difficultyLabel(selectedLevelValue) : '—'
          }}
        </v-chip>
      </v-card-text>
    </v-card>

    <v-card v-if="catalogStore.currentSession" rounded="xl" class="mb-6">
      <v-card-title>{{ t('gamePage.session.title') }}</v-card-title>
      <v-card-text class="d-flex flex-wrap ga-2">
        <v-chip size="small" color="primary" variant="tonal">
          {{ t('gamePage.session.sessionId') }}:
          {{ catalogStore.currentSession.sessionId }}
        </v-chip>
        <v-chip size="small" color="secondary" variant="tonal">
          {{ tOrFallback('gamePage.session.selectedLevel', 'Selected level') }}:
          {{
            selectedLevelValue
              ? difficultyLabel(selectedLevelValue)
              : '-'
          }}
        </v-chip>
        <v-chip size="small" color="info" variant="tonal">
          {{ t('gamePage.session.status') }}:
          {{ catalogStore.currentSession.status }}
        </v-chip>
        <v-chip size="small" color="success" variant="tonal">
          {{ t('gamePage.session.coins') }}:
          {{ catalogStore.currentSession.coins }}
        </v-chip>
      </v-card-text>
    </v-card>

    <v-card rounded="xl" :disabled="!catalogStore.currentSession">
      <v-card-title>{{ t('gamePage.session.finishDemo') }}</v-card-title>
      <v-card-text class="d-flex ga-3 align-center flex-wrap">
        <v-btn
          color="success"
          :loading="catalogStore.finishingSession && finishResult === 'win'"
          :disabled="!catalogStore.currentSession || hasActiveRequest"
          @click="onFinish('win')"
        >
          {{ t('gamePage.actions.finishWin') }}
        </v-btn>
        <v-btn
          color="error"
          variant="outlined"
          :loading="catalogStore.finishingSession && finishResult === 'lose'"
          :disabled="!catalogStore.currentSession || hasActiveRequest"
          @click="onFinish('lose')"
        >
          {{ t('gamePage.actions.finishLose') }}
        </v-btn>
      </v-card-text>
    </v-card>

    <v-card v-if="lastFinishedSession" rounded="xl" variant="tonal">
      <v-card-title>{{
        tOrFallback('gamePage.session.lastSessionTitle', 'Last finished session')
      }}</v-card-title>
      <v-card-text class="d-flex flex-wrap ga-2">
        <v-chip size="small" color="primary" variant="outlined">
          {{ t('gamePage.session.sessionId') }}:
          {{ lastFinishedSession.sessionId }}
        </v-chip>
        <v-chip size="small" color="secondary" variant="outlined">
          {{ tOrFallback('gamePage.session.level', 'Level') }}:
          {{ difficultyLabel(lastFinishedSession.level) }}
        </v-chip>
        <v-chip size="small" color="info" variant="outlined">
          {{ t('gamePage.session.status') }}:
          {{ lastFinishedSession.status }}
        </v-chip>
        <v-chip
          size="small"
          :color="lastFinishedSession.result === 'win' ? 'success' : 'error'"
          variant="outlined"
        >
          {{ tOrFallback('gamePage.session.result', 'Result') }}:
          {{ lastFinishedSession.result }}
        </v-chip>
        <v-chip size="small" color="warning" variant="outlined">
          {{ tOrFallback('gamePage.session.finishedAt', 'Finished at') }}:
          {{ new Date(lastFinishedSession.finishedAt).toLocaleString() }}
        </v-chip>
      </v-card-text>
    </v-card>
  </v-container>
</template>
