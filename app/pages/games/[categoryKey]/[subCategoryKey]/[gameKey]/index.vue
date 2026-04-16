<script setup lang="ts">
import { Notify } from '~/stores/notification'

definePageMeta({
  title: 'appbar.games',
})

const route = useRoute()
const { loggedIn } = useUserSession()
const categoryParam = computed(() => String(route.params.categoryKey || ''))
const subCategoryParam = computed(() =>
  String(route.params.subCategoryKey || ''),
)
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

const selectedCategory = computed(() =>
  getCategoryByRouteParam(categoryParam.value),
)
const selectedSubCategory = computed(() =>
  getSubCategoryByRouteParam(categoryParam.value, subCategoryParam.value),
)
const selectedGame = computed(() =>
  getGameByRouteParam(
    categoryParam.value,
    subCategoryParam.value,
    gameParam.value,
  ),
)
const levels = computed(() =>
  Array.isArray(catalogStore.levels) ? catalogStore.levels : [],
)
const selectedLevelValue = ref<string | null>(null)
const selectedPlayerCount = ref<number | null>(null)
const selectedOpponentType = ref<'none' | 'human_online' | 'ai_bot'>('none')

const gameConstraints = computed(() => {
  const game = selectedGame.value
  const minPlayers =
    typeof game?.minPlayers === 'number' && game.minPlayers > 0
      ? game.minPlayers
      : 1
  const maxPlayers =
    typeof game?.maxPlayers === 'number' && game.maxPlayers >= minPlayers
      ? game.maxPlayers
      : minPlayers
  const allowedPlayerCounts = Array.isArray(game?.allowedPlayerCounts)
    ? game.allowedPlayerCounts
        .filter(
          (count): count is number =>
            typeof count === 'number' &&
            Number.isInteger(count) &&
            count >= minPlayers &&
            count <= maxPlayers,
        )
        .sort((a, b) => a - b)
    : []

  return {
    minPlayers,
    maxPlayers,
    allowedPlayerCounts: allowedPlayerCounts.length
      ? [...new Set(allowedPlayerCounts)]
      : Array.from(
          { length: Math.max(1, maxPlayers - minPlayers + 1) },
          (_, index) => minPlayers + index,
        ),
    supportsAiOpponent: Boolean(game?.supportsAiOpponent),
    requiresOpponent: Boolean(game?.requiresOpponent),
  }
})

const playerCountOptions = computed(() =>
  gameConstraints.value.allowedPlayerCounts.map((count) => ({
    title: String(count),
    value: count,
  })),
)

const opponentTypeOptions = computed(() => {
  const options: Array<{
    title: string
    value: 'none' | 'human_online' | 'ai_bot'
  }> = []

  if (!gameConstraints.value.requiresOpponent) {
    options.push({ title: 'Solo', value: 'none' })
  }

  options.push({ title: 'Humain en ligne', value: 'human_online' })

  if (gameConstraints.value.supportsAiOpponent) {
    options.push({ title: 'IA', value: 'ai_bot' })
  }

  return options
})

const isStartCombinationValid = computed(() => {
  const playerCount = selectedPlayerCount.value
  const opponentType = selectedOpponentType.value
  if (!playerCount || !opponentType) return false

  const isAllowedCount =
    gameConstraints.value.allowedPlayerCounts.includes(playerCount)
  if (!isAllowedCount) return false

  if (opponentType === 'none') {
    return !gameConstraints.value.requiresOpponent && playerCount === 1
  }

  if (playerCount < 2) return false

  if (opponentType === 'ai_bot') {
    return gameConstraints.value.supportsAiOpponent
  }

  return opponentType === 'human_online'
})

const canStart = computed(
  () =>
    Boolean(selectedGame.value && selectedLevelValue.value) &&
    isStartCombinationValid.value &&
    !catalogStore.startingSession,
)

watch(
  () => selectedGame.value?.id,
  () => {
    selectedPlayerCount.value = playerCountOptions.value[0]?.value ?? 1

    const preferredOpponentType = gameConstraints.value.requiresOpponent
      ? gameConstraints.value.supportsAiOpponent
        ? 'ai_bot'
        : 'human_online'
      : 'none'
    selectedOpponentType.value = opponentTypeOptions.value.some(
      (option) => option.value === preferredOpponentType,
    )
      ? preferredOpponentType
      : (opponentTypeOptions.value[0]?.value ?? 'none')
  },
  { immediate: true },
)

onMounted(async () => {
  const loaded = await ensureCatalogLoaded()
  if (!loaded) return

  if (
    !selectedCategory.value ||
    !selectedSubCategory.value ||
    !selectedGame.value
  ) {
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
  if (!loggedIn.value) {
    Notify.error(
      tOrFallback(
        'gamePage.session.authRequired',
        'You must be logged in to start a game.',
      ),
    )
    await navigateTo('/login')
    return
  }

  if (
    !selectedGame.value ||
    !selectedLevelValue.value ||
    !selectedPlayerCount.value ||
    !selectedOpponentType.value ||
    !isStartCombinationValid.value
  )
    return

  try {
    const response = await catalogStore.startSession(selectedGame.value.id, {
      level: selectedLevelValue.value,
      playerCount: selectedPlayerCount.value,
      opponentType: selectedOpponentType.value,
      mode: selectedOpponentType.value === 'none' ? 'solo' : 'versus',
      seatCount: selectedPlayerCount.value,
      allowedPlayerCounts: gameConstraints.value.allowedPlayerCounts,
    })
    const createdSessionId =
      response.sessionId ?? catalogStore.currentSession?.sessionId

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

function navigateBreadcrumb(to?: string) {
  if (to) {
    navigateTo(to)
  }
}

const breadcrumbs = computed(() => [
  { title: 'Games', to: '/games' },
  {
    title:
      selectedCategory.value?.key || selectedCategory.value?.name || 'Category',
    to: `/games/${categoryParam.value}`,
  },
  {
    title:
      selectedSubCategory.value?.key ||
      selectedSubCategory.value?.name ||
      'Subcategory',
    to: `/games/${categoryParam.value}/${subCategoryParam.value}`,
  },
  {
    title: selectedGame.value?.key || selectedGame.value?.name || 'Game',
    disabled: true,
  },
])

const rightDrawerSelection = computed(() => [
  {
    key: 'category',
    icon: 'mdi-shape-outline',
    label: tOrFallback('gamePage.selection.category', 'Category'),
    value: entityName(selectedCategory.value || {}) || '',
  },
  {
    key: 'subCategory',
    icon: 'mdi-shape-plus-outline',
    label: tOrFallback('gamePage.selection.subCategory', 'Subcategory'),
    value: entityName(selectedSubCategory.value || {}) || '',
  },
  {
    key: 'game',
    icon: 'mdi-controller-classic-outline',
    label: tOrFallback('gamePage.selection.game', 'Game'),
    value: entityName(selectedGame.value || {}) || '',
  },
  {
    key: 'level',
    icon: 'mdi-ladder',
    label: tOrFallback('gamePage.selection.level', 'Level'),
    value: selectedLevelValue.value || '',
  },
])
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #right>
        <GamesDrawersRightPanel :selection="rightDrawerSelection" />
      </template>
      <template #left>
        <GamesDrawersLeftPanel />
      </template>
    </AppPageDrawers>

    <v-container fluid>
      <v-card variant="text" class="content-main postcard-gradient-card mb-3 pa-3">
        <template v-if="selectedGame">
          <v-breadcrumbs :items="breadcrumbs" class="pa-0 mb-2">
            <template #item="{ item }">
              <v-btn
                variant="text"
                size="small"
                :disabled="item.disabled"
                @click="navigateBreadcrumb(item.to as string | undefined)"
              >
                {{ item.title }}
              </v-btn>
            </template>
          </v-breadcrumbs>
          <div class="game-selection-layout">
            <div class="game-selection-levels">
              <v-row class="w-100">
                <v-col
                  v-for="level in levels"
                  :key="level.id"
                  cols="12"
                  sm="6"
                  md="4"
                >
                  <v-card
                    height="200"
                    min-width="200"
                    class="level-card d-flex align-center justify-center text-center cursor-pointer"
                    :elevation="selectedLevelValue === level.value ? 12 : 2"
                    :color="selectedLevelValue === level.value ? 'primary' : ''"
                    :variant="
                    selectedLevelValue === level.value ? 'outlined' : 'text'
                  "
                    @click="selectedLevelValue = level.value"
                  >
                    <div class="text-h6">
                      {{ difficultyLabel(level.value) }}
                    </div>
                  </v-card>
                </v-col>
              </v-row>
            </div>

            <div class="game-selection-footer">
              <v-card
                class="mb-4 pa-4 w-100 game-constraints-card"
                variant="text"
              >
                <v-row>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="selectedPlayerCount"
                      :items="playerCountOptions"
                      label="Nombre de joueurs"
                      item-title="title"
                      item-value="value"
                      density="comfortable"
                      hide-details
                    />
                  </v-col>
                  <v-col cols="12" md="6">
                    <v-select
                      v-model="selectedOpponentType"
                      :items="opponentTypeOptions"
                      label="Type d'adversaire"
                      item-title="title"
                      item-value="value"
                      density="comfortable"
                      hide-details
                    />
                  </v-col>
                </v-row>
              </v-card>
              <v-btn
                color="primary"
                size="large"
                :disabled="!canStart"
                :loading="catalogStore.startingSession"
                @click="onStart"
              >
                {{ t('gamePage.actions.start') }}
              </v-btn>
            </div>
          </div>
        </template>
      </v-card>
    </v-container>
  </div>
</template>
<style scoped>
.game-selection-layout {
  min-height: calc(100vh - 220px);
  display: flex;
  flex-direction: column;
}

.game-selection-levels {
  flex: 1;
  display: flex;
  align-items: center;
}

.game-selection-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 16px;
}

.game-constraints-card {
  background: linear-gradient(
    240deg,
    rgba(var(--v-theme-primary), 0.18) 0%,
    transparent 20%
  );
  border: 1px solid rgba(255, 255, 255, 0.06);
  width: min(100%, 620px);
}

.level-card {
  background: linear-gradient(
    240deg,
    rgba(var(--v-theme-primary), 0.18) 0%,
    transparent 20%
  );
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.level-card--selected {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 16px 38px rgba(var(--v-theme-primary));
}

.level-card:hover {
  transform: translateY(-6px) scale(1.01);
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.16);
}

.level-card:hover .level-card__image {
  transform: scale(1.03);
}
</style>
