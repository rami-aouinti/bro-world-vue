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
const finishResult = ref<'win' | 'lose' | null>(null)

const safeCategories = computed(() => Array.isArray(catalogStore.categories) ? catalogStore.categories : [])
const safeLevels = computed(() => Array.isArray(catalogStore.levels) ? catalogStore.levels : [])

const selectedCategory = computed(() =>
  safeCategories.value.find(category => category.id === selectedCategoryId.value) ?? null,
)

const subCategories = computed(() => selectedCategory.value?.subCategories ?? [])

const selectedSubCategory = computed(() =>
  subCategories.value.find(subCategory => subCategory.id === selectedSubCategoryId.value) ?? null,
)

const games = computed(() => selectedSubCategory.value?.games ?? [])

const canStart = computed(
  () =>
    Boolean(selectedGameId.value && selectedLevelValue.value)
    && !catalogStore.startingSession
    && !catalogStore.finishingSession,
)

const hasActiveRequest = computed(() => catalogStore.startingSession || catalogStore.finishingSession)

function tOrFallback(key: string, fallback: string) {
  return te(key) ? t(key) : fallback
}

function gameName(gameId: string, fallback: string) {
  return tOrFallback(`gamePage.catalog.games.${gameId}.name`, fallback)
}

function gameDescription(gameId: string, fallback?: string) {
  return tOrFallback(`gamePage.catalog.games.${gameId}.description`, fallback || '')
}

function categoryName(categoryId: string, fallback: string) {
  return tOrFallback(`gamePage.catalog.categories.${categoryId}.name`, fallback)
}

function categoryDescription(categoryId: string, fallback = '') {
  return tOrFallback(`gamePage.catalog.categories.${categoryId}.description`, fallback)
}

function subCategoryName(subCategoryId: string, fallback: string) {
  return tOrFallback(`gamePage.catalog.subCategories.${subCategoryId}.name`, fallback)
}

function difficultyLabel(level: string) {
  return tOrFallback(`gamePage.catalog.difficulties.${level}`, level)
}

function resetSelectionIfMissing() {
  if (selectedCategoryId.value && !safeCategories.value.some(category => category.id === selectedCategoryId.value)) {
    selectedCategoryId.value = null
  }

  if (selectedSubCategoryId.value && !subCategories.value.some(subCategory => subCategory.id === selectedSubCategoryId.value)) {
    selectedSubCategoryId.value = null
  }

  if (selectedGameId.value && !games.value.some(game => game.id === selectedGameId.value)) {
    selectedGameId.value = null
  }

  if (selectedLevelValue.value && !safeLevels.value.includes(selectedLevelValue.value)) {
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
    await catalogStore.startSession(selectedGameId.value, selectedLevelValue.value)
    Notify.success(tOrFallback('gamePage.messages.startSuccess', 'Game session started successfully.'))
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
    Notify.success(
      result === 'win'
        ? tOrFallback('gamePage.messages.finishWinSuccess', 'Session finished with a win.')
        : tOrFallback('gamePage.messages.finishLoseSuccess', 'Session finished with a loss.'),
    )
  } catch (error) {
    Notify.error(error)
  }
}

async function onRetryCatalog() {
  try {
    await catalogStore.fetchCatalog()
    resetSelectionIfMissing()
    Notify.success(tOrFallback('gamePage.messages.retrySuccess', 'Catalog refreshed successfully.'))
  } catch (error) {
    Notify.error(error)
  }
}

onMounted(() => {
  catalogStore.fetchCatalog()
})

watch(safeCategories, resetSelectionIfMissing)
watch(safeLevels, resetSelectionIfMissing)
</script>

<template>
  <v-container fluid>
    <h1 class="text-h3 mb-6">{{ t('appbar.games') }}</h1>

    <v-alert
      v-if="catalogStore.error"
      type="warning"
      variant="tonal"
      class="mb-4"
    >
      <div class="d-flex flex-column flex-sm-row align-sm-center justify-space-between ga-3">
        <span>{{ catalogStore.error }}</span>
        <v-btn size="small" variant="outlined" @click="onRetryCatalog">
          {{ tOrFallback('gamePage.actions.retry', 'Retry') }}
        </v-btn>
      </div>
    </v-alert>

    <v-card class="mb-6" rounded="xl">
        <v-card-title>{{ t('gamePage.catalog.sections.categories') }}</v-card-title>
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
                :variant="selectedCategoryId === category.id ? 'elevated' : 'tonal'"
                :color="selectedCategoryId === category.id ? 'primary' : undefined"
                class="cursor-pointer"
                @click="selectCategory(category.id)"
              >
                <v-card-item>
                  <v-card-title>{{ categoryName(category.id, category.name) }}</v-card-title>
                  <v-card-subtitle>{{ categoryDescription(category.id) }}</v-card-subtitle>
                  <v-card-subtitle>{{ category.subCategories.length }} {{ t('gamePage.catalog.labels.subCategoryCount') }}</v-card-subtitle>
                </v-card-item>
              </v-card>
            </v-col>
          </v-row>
          <v-alert
            v-else
            type="info"
            variant="tonal"
            :text="tOrFallback('gamePage.states.emptyCategories', 'No categories available at the moment.')"
          />
        </v-card-text>
      </v-card>

      <v-card class="mb-6" rounded="xl" :disabled="!selectedCategory">
        <v-card-title>{{ t('gamePage.catalog.sections.subCategories') }}</v-card-title>
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
              :color="selectedSubCategoryId === subCategory.id ? 'primary' : undefined"
              @click="selectSubCategory(subCategory.id)"
            >
              {{ subCategoryName(subCategory.id, subCategory.name) }}
            </v-chip>
          </v-chip-group>
          <v-alert
            v-else
            type="info"
            variant="tonal"
            :text="selectedCategory ? tOrFallback('gamePage.states.emptySubCategories', 'No sub-categories available for this category.') : t('gamePage.catalog.states.selectCategory')"
          />
        </v-card-text>
      </v-card>

      <v-card class="mb-6" rounded="xl" :disabled="!selectedSubCategory">
        <v-card-title>{{ t('gamePage.catalog.sections.games') }}</v-card-title>
        <v-card-text>
          <v-row v-if="games.length" dense>
            <v-col
              v-for="game in games"
              :key="game.id"
              cols="12"
              sm="6"
              md="4"
            >
              <v-card
                rounded="lg"
                :variant="selectedGameId === game.id ? 'elevated' : 'outlined'"
                :color="selectedGameId === game.id ? 'primary' : undefined"
                class="cursor-pointer"
                @click="selectedGameId = game.id"
              >
                <v-card-item>
                  <v-card-title>{{ gameName(game.id, game.name) }}</v-card-title>
                  <v-card-subtitle>{{ gameDescription(game.id, game.description) || t('gamePage.catalog.states.ready') }}</v-card-subtitle>
                </v-card-item>
              </v-card>
            </v-col>
          </v-row>
          <v-alert
            v-else
            type="info"
            variant="tonal"
            :text="selectedSubCategory ? tOrFallback('gamePage.states.emptyGames', 'No games available for this sub-category.') : t('gamePage.catalog.states.selectSubCategory')"
          />
        </v-card-text>
      </v-card>

      <v-card class="mb-6" rounded="xl">
        <v-card-title>{{ t('gamePage.levels.title') }}</v-card-title>
        <v-card-text>
          <v-skeleton-loader
            v-if="catalogStore.loadingLevels"
            type="chip, chip, chip"
            class="mb-2"
          />
          <v-chip-group
            v-else
            :model-value="selectedLevelValue ? [selectedLevelValue] : []"
            column
          >
            <v-chip
              v-for="level in safeLevels"
              :key="level"
              filter
              :color="selectedLevelValue === level ? 'primary' : undefined"
              @click="selectedLevelValue = level"
            >
              {{ difficultyLabel(level) }}
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

      <v-card v-if="catalogStore.currentSession" rounded="xl" class="mb-6">
        <v-card-title>{{ t('gamePage.session.title') }}</v-card-title>
        <v-card-text class="d-flex flex-wrap ga-2">
          <v-chip size="small" color="primary" variant="tonal">
            {{ t('gamePage.session.sessionId') }}: {{ catalogStore.currentSession.sessionId }}
          </v-chip>
          <v-chip size="small" color="secondary" variant="tonal">
            {{ tOrFallback('gamePage.session.level', 'Level') }}:
            {{ catalogStore.currentSession.level ? difficultyLabel(catalogStore.currentSession.level) : '-' }}
          </v-chip>
          <v-chip size="small" color="info" variant="tonal">
            {{ t('gamePage.session.status') }}: {{ catalogStore.currentSession.status }}
          </v-chip>
          <v-chip size="small" color="success" variant="tonal">
            {{ t('gamePage.session.coins') }}: {{ catalogStore.currentSession.coins }}
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
  </v-container>
</template>
