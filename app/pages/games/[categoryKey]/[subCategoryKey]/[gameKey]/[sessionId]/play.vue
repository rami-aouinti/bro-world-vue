<script setup lang="ts">
import BoardTablePlaySurface from '~/components/games/play/BoardTablePlaySurface.vue'
import CardTablePlaySurface from '~/components/games/play/CardTablePlaySurface.vue'
import { Notify } from '~/stores/notification'

definePageMeta({
  title: 'appbar.games',
  layout: 'games',
})

const route = useRoute()
const sessionId = computed(() => String(route.params.sessionId || ''))
const categoryParam = computed(() => String(route.params.categoryKey || ''))
const subCategoryParam = computed(() =>
  String(route.params.subCategoryKey || ''),
)
const gameParam = computed(() => String(route.params.gameKey || ''))

const {
  catalogStore,
  tOrFallback,
  ensureCatalogLoaded,
  getCategoryByRouteParam,
  getSubCategoryByRouteParam,
  getGameByRouteParam,
} = useGamesCatalogNavigation()

const finishResult = ref<'win' | 'lose' | null>(null)

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

function normalizeCategoryKey(categoryKey: string) {
  const normalized = categoryKey.trim().toLowerCase()

  if (['card', 'cards'].includes(normalized)) return 'card'
  if (['board', 'boards'].includes(normalized)) return 'board'

  return ''
}

const playSurfaceType = computed<'card' | 'board' | 'default'>(() => {
  const normalizedCategory = normalizeCategoryKey(
    selectedCategory.value?.key ||
      selectedCategory.value?.name ||
      categoryParam.value,
  )

  if (normalizedCategory === 'card') return 'card'
  if (normalizedCategory === 'board') return 'board'

  return 'default'
})

const currentSession = computed(() => {
  if (catalogStore.currentSession?.sessionId === sessionId.value)
    return catalogStore.currentSession

  return null
})

const commonSurfaceProps = computed(() => ({
  sessionId: currentSession.value?.sessionId || sessionId.value,
  gameName:
    selectedGame.value?.name ||
    selectedGame.value?.key ||
    gameParam.value ||
    'Unknown game',
  level: currentSession.value?.level || 'unknown',
  status: currentSession.value?.status || 'pending',
}))


const cardSeats = computed(() => [
  { id: 'top', name: 'CPU 1', stack: '1200', position: 'top' as const },
  { id: 'right', name: 'CPU 2', stack: '900', position: 'right' as const },
  { id: 'bottom', name: 'You', stack: String(currentSession.value?.coins ?? 0), position: 'bottom' as const, isActive: true },
  { id: 'left', name: 'CPU 3', stack: '1100', position: 'left' as const },
])

const boardState = computed(() => {
  const size = 8
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => {
      if (row < 2 && (row + col) % 2 === 1) return { id: `d-${row}-${col}`, tone: 'dark' as const }
      if (row > 5 && (row + col) % 2 === 1) return { id: `l-${row}-${col}`, tone: 'light' as const }
      return null
    }),
  )
})

const boardPlayers = computed(() => [
  { id: 'light', name: 'You', side: 'light' as const, score: '12', isActive: true },
  { id: 'dark', name: 'CPU', side: 'dark' as const, score: '12' },
])

onMounted(async () => {
  const loaded = await ensureCatalogLoaded()
  if (!loaded) return

  if (
    !selectedCategory.value ||
    !selectedSubCategory.value ||
    !selectedGame.value ||
    !currentSession.value
  ) {
    await navigateTo(
      `/games/${categoryParam.value}/${subCategoryParam.value}/${gameParam.value}`,
    )
  }
})

async function onFinish(result: 'win' | 'lose') {
  if (!currentSession.value) return

  finishResult.value = result

  try {
    await catalogStore.finishSession(sessionId.value, result)
    const completedSessionId = sessionId.value
    catalogStore.currentSession = null
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

    await navigateTo(
      `/games/${categoryParam.value}/${subCategoryParam.value}/${gameParam.value}?lastSession=${completedSessionId}&result=${result}`,
    )
  } catch (error) {
    Notify.error(error)
  }
}

</script>

<template>
  <div>
    <AppPageDrawers>
      <template #right>
        <div class="arena-panel-stack">
          <v-card rounded="xl" class="arena-panel-card arena-interactive">
            <v-card-title>Live session</v-card-title>
            <v-card-text v-if="currentSession" class="d-flex flex-wrap ga-2">
              <v-chip color="primary" variant="tonal" class="arena-chip"
              >Session: {{ currentSession.sessionId }}</v-chip
              >
              <v-chip color="secondary" variant="tonal" class="arena-chip"
              >Level: {{ currentSession.level }}</v-chip
              >
              <v-chip color="info" variant="tonal" class="arena-chip"
              >Status: {{ currentSession.status }}</v-chip
              >
              <v-chip color="warning" variant="tonal" class="arena-chip"
              >Coins: {{ currentSession.coins }}</v-chip
              >
            </v-card-text>
            <v-card-text v-else>
              Session introuvable. Redirection en cours...
            </v-card-text>
          </v-card>

          <v-card
            rounded="xl"
            :disabled="!currentSession"
            class="arena-panel-card arena-interactive"
          >
            <v-card-title>{{
                tOrFallback('gamePage.session.finishDemo', 'Finish demo')
              }}</v-card-title>
            <v-card-text class="d-flex ga-3 flex-wrap">
              <v-btn
                color="success"
                :disabled="!currentSession || catalogStore.finishingSession"
                :loading="
                    catalogStore.finishingSession && finishResult === 'win'
                  "
                class="arena-action-btn"
                @click="onFinish('win')"
              >
                Finish win
              </v-btn>
              <v-btn
                color="error"
                variant="outlined"
                :disabled="!currentSession || catalogStore.finishingSession"
                :loading="
                    catalogStore.finishingSession && finishResult === 'lose'
                  "
                class="arena-action-btn"
                @click="onFinish('lose')"
              >
                Finish lose
              </v-btn>
            </v-card-text>
          </v-card>
        </div>
      </template>
    </AppPageDrawers>
    <v-container fluid class="arena-layout px-2 px-sm-4 px-md-6">

      <div class="arena-shell pa-2 pa-sm-4 pa-md-6">
        <div class="arena-surface-wrap mx-auto">
          <CardTablePlaySurface
            v-if="playSurfaceType === 'card'"
            class="arena-interactive"
            :title="commonSurfaceProps.gameName"
            :subtitle="`Session ${commonSurfaceProps.sessionId}`"
            :seats="cardSeats"
            :community-cards="['A♠', '10♥', '7♣', '2♦', 'K♠']"
            :player-cards="['Q♣', 'Q♦']"
          />
          <BoardTablePlaySurface
            v-else-if="playSurfaceType === 'board'"
            class="arena-interactive"
            :title="commonSurfaceProps.gameName"
            :board="boardState"
            :players="boardPlayers"
            :selected-cell="{ row: 5, col: 0 }"
            :possible-moves="[{ row: 4, col: 1 }]"
            :last-move="{ from: { row: 2, col: 1 }, to: { row: 3, col: 2 } }"
          />
          <v-card v-else rounded="xl" class="h-100 arena-interactive">
            <v-card-title>{{ commonSurfaceProps.gameName }}</v-card-title>
            <v-card-subtitle>Play surface</v-card-subtitle>
            <v-card-text class="py-8">
              <div class="text-medium-emphasis">
                Surface non spécialisée pour cette catégorie.
              </div>
            </v-card-text>
          </v-card>
        </div>
      </div>
    </v-container>
  </div>
</template>

<style scoped>
.arena-layout {
  min-height: calc(100vh - var(--v-layout-top, 72px));
}

.arena-panel-card {
  background: linear-gradient(
    240deg,
    rgba(var(--v-theme-primary), 0.18) 0%,
    transparent 20%
  );
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.arena-shell {
  min-height: calc(100vh - var(--v-layout-top, 72px) - 56px);
  border-radius: 24px;
  background:
    radial-gradient(
      circle at 20% 20%,
      rgba(var(--v-theme-primary), 0.2),
      rgba(var(--v-theme-surface), 0.92) 60%
    ),
    repeating-linear-gradient(
      135deg,
      rgba(var(--v-theme-primary), 0.04) 0,
      rgba(var(--v-theme-primary), 0.04) 2px,
      transparent 2px,
      transparent 10px
    );
}

.arena-surface-wrap {
  width: 100%;
  max-width: min(100%, 1040px);
}

.arena-panel-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.arena-interactive {
  transition: transform 0.25s ease, box-shadow 0.25s ease, filter 0.25s ease;
}

.arena-interactive:hover {
  transform: translateY(-2px);
  box-shadow: 0 16px 34px rgba(var(--v-theme-primary), 0.12);
}

.arena-chip,
.arena-action-btn {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.arena-chip:hover,
.arena-action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 8px 18px rgba(var(--v-theme-primary), 0.16);
}

@media (max-width: 1279px) {
  .arena-center-col,
  .arena-panel-col {
    flex-basis: 100%;
    max-width: 100%;
  }

  .arena-panel-col {
    margin-top: 16px;
  }
}

@media (max-width: 959px) {
  .arena-shell {
    border-radius: 18px;
    padding: 12px !important;
  }

  .arena-surface-wrap {
    max-width: 100%;
  }

  :deep(.arena-surface-wrap .v-card) {
    min-height: 240px;
  }
}

@media (max-width: 599px) {
  .arena-shell {
    padding: 8px !important;
    border-radius: 14px;
  }

  :deep(.arena-surface-wrap .v-card-title) {
    font-size: 1rem;
  }

  :deep(.arena-surface-wrap .v-card-text) {
    padding-top: 16px !important;
    padding-bottom: 16px !important;
  }

  .arena-action-btn {
    width: 100%;
  }
}
</style>
