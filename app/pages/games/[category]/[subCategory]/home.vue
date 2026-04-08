<script setup lang="ts">
import { Notify } from '~/stores/notification'

definePageMeta({
  title: 'appbar.games',
})

const route = useRoute()
const categoryId = computed(() => String(route.params.category || ''))
const subCategoryId = computed(() => String(route.params.subCategory || ''))

const {
  catalogStore,
  t,
  tOrFallback,
  ensureCatalogLoaded,
  getCategoryById,
  getSubCategoryById,
  entityName,
  entityDescription,
  getGameCardImage,
} = useGamesCatalogNavigation()

const selectedGameId = ref<string | null>(null)
const selectedLevelValue = ref<string | null>(null)

const selectedCategory = computed(() => getCategoryById(categoryId.value))
const selectedSubCategory = computed(() => getSubCategoryById(categoryId.value, subCategoryId.value))
const games = computed(() => selectedSubCategory.value?.games ?? [])
const selectedGame = computed(() => games.value.find(game => game.id === selectedGameId.value) ?? null)
const levels = computed(() => (Array.isArray(catalogStore.levels) ? catalogStore.levels : []))

const canStart = computed(
  () => Boolean(selectedGameId.value && selectedLevelValue.value) && !catalogStore.startingSession,
)

onMounted(async () => {
  const loaded = await ensureCatalogLoaded()
  if (!loaded) {
    return
  }

  if (!selectedCategory.value || !selectedSubCategory.value) {
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
  if (!selectedGameId.value || !selectedLevelValue.value || !selectedSubCategory.value) {
    return
  }

  try {
    const response = await catalogStore.startSession(selectedGameId.value, selectedLevelValue.value)
    await navigateTo(
      `/games/${categoryId.value}/${subCategoryId.value}/${response.session.id}/play?gameId=${selectedGameId.value}&level=${selectedLevelValue.value}`,
    )
  } catch (error) {
    Notify.error(error)
  }
}
</script>

<template>
  <v-container fluid>
    <v-btn
      prepend-icon="mdi-arrow-left"
      variant="text"
      class="mb-4"
      @click="navigateTo(`/games/${categoryId}`)"
    >
      Back to sub-categories
    </v-btn>

    <template v-if="selectedSubCategory">
      <h1 class="text-h4 mb-1">{{ entityName(selectedSubCategory) }}</h1>
      <p class="text-medium-emphasis mb-6">
        {{ entityDescription(selectedSubCategory) || 'Sélectionne un jeu et un niveau, puis lance ta session.' }}
      </p>

      <v-card rounded="xl" class="mb-6">
        <v-card-title>{{ t('gamePage.catalog.sections.games') }}</v-card-title>
        <v-card-text>
          <v-row dense>
            <v-col v-for="game in games" :key="game.id" cols="12" md="6" lg="4">
              <v-card
                rounded="lg"
                class="cursor-pointer h-100"
                :variant="selectedGameId === game.id ? 'elevated' : 'outlined'"
                :color="selectedGameId === game.id ? 'primary' : undefined"
                @click="selectedGameId = game.id"
              >
                <v-img :src="getGameCardImage(game.thumbnailUrl)" height="140" cover />
                <v-card-item>
                  <v-card-title>{{ entityName(game) }}</v-card-title>
                  <v-card-subtitle>
                    {{ entityDescription(game) || 'Prêt à jouer ?' }}
                  </v-card-subtitle>
                </v-card-item>
              </v-card>
            </v-col>
          </v-row>
        </v-card-text>
      </v-card>

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

      <v-card v-if="selectedGame" rounded="xl" variant="tonal" class="mt-6">
        <v-card-title>Selection summary</v-card-title>
        <v-card-text class="d-flex flex-wrap ga-2">
          <v-chip size="small" variant="outlined">Game: {{ entityName(selectedGame) }}</v-chip>
          <v-chip size="small" variant="outlined">Level: {{ selectedLevelValue || '—' }}</v-chip>
        </v-card-text>
      </v-card>
    </template>
  </v-container>
</template>
