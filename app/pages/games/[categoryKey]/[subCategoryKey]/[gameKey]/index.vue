<script setup lang="ts">
import { Notify } from '~/stores/notification'

definePageMeta({
  title: 'appbar.games',
})

const route = useRoute()
const categoryParam = computed(() => String(route.params.categoryKey || ''))
const subCategoryParam = computed(() => String(route.params.subCategoryKey || ''))
const gameParam = computed(() => String(route.params.gameKey || ''))

const {
  catalogStore,
  t,
  tOrFallback,
  ensureCatalogLoaded,
  getCategoryByRouteParam,
  getSubCategoryByRouteParam,
  getGameByRouteParam,
  entityName,
} = useGamesCatalogNavigation()

const selectedCategory = computed(() => getCategoryByRouteParam(categoryParam.value))
const selectedSubCategory = computed(() => getSubCategoryByRouteParam(categoryParam.value, subCategoryParam.value))
const selectedGame = computed(() => getGameByRouteParam(categoryParam.value, subCategoryParam.value, gameParam.value))
const levels = computed(() => (Array.isArray(catalogStore.levels) ? catalogStore.levels : []))
const selectedLevelValue = ref<string | null>(null)

const canStart = computed(
  () => Boolean(selectedGame.value && selectedLevelValue.value) && !catalogStore.startingSession,
)

onMounted(async () => {
  const loaded = await ensureCatalogLoaded()
  if (!loaded)
    return

  if (!selectedCategory.value || !selectedSubCategory.value || !selectedGame.value) {
    await navigateTo('/games')
    return
  }

  try {
    await catalogStore.fetchLevels()
  } catch (error) {
    Notify.error(error)
  }
})

function difficultyLabel(level: string) {
  return tOrFallback(`gamePage.catalog.difficulties.${level}`, level)
}

async function onStart() {
  if (!selectedGame.value || !selectedLevelValue.value)
    return

  try {
    const response = await catalogStore.startSession(selectedGame.value.id, selectedLevelValue.value)
    const createdSessionId = response.session.id ?? response.session.sessionId ?? catalogStore.currentSession?.sessionId

    if (!createdSessionId) {
      Notify.error('Session id not found in start response.')
      return
    }

    await navigateTo(
      `/games/${categoryParam.value}/${subCategoryParam.value}/${gameParam.value}/${createdSessionId}/play`,
    )
  } catch (error) {
    Notify.error(error)
  }
}

const breadcrumbs = computed(() => [
  { title: 'Games', to: '/games' },
  { title: selectedCategory.value?.key || selectedCategory.value?.name || 'Category', to: `/games/${categoryParam.value}` },
  { title: selectedSubCategory.value?.key || selectedSubCategory.value?.name || 'Subcategory', to: `/games/${categoryParam.value}/${subCategoryParam.value}` },
  { title: selectedGame.value?.key || selectedGame.value?.name || 'Game', disabled: true },
])
</script>

<template>
  <v-container fluid>
    <template v-if="selectedGame">
      <v-breadcrumbs :items="breadcrumbs" class="px-0" />

      <v-card rounded="xl" class="mb-6">
        <v-card-title>{{ tOrFallback('gamePage.levels.title', 'Niveau') }}</v-card-title>
        <v-card-text>
          <v-chip-group :model-value="selectedLevelValue ? [selectedLevelValue] : []" column>
            <v-chip
              v-for="level in levels"
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

      <v-btn color="primary" size="large" :disabled="!canStart" :loading="catalogStore.startingSession" @click="onStart">
        {{ t('gamePage.actions.start') }}
      </v-btn>

      <v-card rounded="xl" variant="tonal" class="mt-6">
        <v-card-title>Selection summary</v-card-title>
        <v-card-text class="d-flex flex-wrap ga-2">
          <v-chip size="small" variant="outlined">Game: {{ entityName(selectedGame) }}</v-chip>
          <v-chip size="small" variant="outlined">Level: {{ selectedLevelValue || '—' }}</v-chip>
        </v-card-text>
      </v-card>
    </template>
  </v-container>
</template>
