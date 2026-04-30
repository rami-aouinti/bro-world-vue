<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { storeToRefs } from 'pinia'
import PlatformSplitLayout from '~/components/platform/PlatformSplitLayout.vue'
import GameMatchAside from '~/components/games/GameMatchAside.vue'
import RamiGame from '~/components/games/RamiGame.vue'
import BeloteGame from '~/components/games/BeloteGame.vue'
import CheckersGame from '~/components/games/CheckersGame.vue'
import PokerGame from '~/components/games/PokerGame.vue'
import SolitaireGame from '~/components/games/SolitaireGame.vue'
import HeartsGame from '~/components/games/HeartsGame.vue'
import SpadesGame from '~/components/games/SpadesGame.vue'
import NonogramGame from '~/components/games/NonogramGame.vue'
import HiddenWordGame from '~/components/games/HiddenWordGame.vue'
import ChessGame from '~/components/games/ChessGame.vue'
import SudokuGame from '~/components/games/SudokuGame.vue'
import Game2048 from '~/components/games/Game2048.vue'
import UnoGame from '~/components/games/UnoGame.vue'
import LudoGame from '~/components/games/LudoGame.vue'
import FlappyRocketGame from '~/components/games/FlappyRocketGame.vue'
import type { GameAsidePanelState } from '~/components/games/types'
import { useGameCatalogStore } from '~/stores/gameCatalog'
import type { BeloteMode, GameEntry, PlayMode } from '~/types/game'
import {
  useGameSessionsApi,
  type SessionResult,
} from '~/composables/api/useGameSessionsApi'
import { useGameFeedback } from '~/composables/games/useGameFeedback'

definePageMeta({
  splitShell: false,
})

const route = useRoute()
const router = useRouter()
const gameCatalogStore = useGameCatalogStore()
const gameSessionsApi = useGameSessionsApi()
const authSession = useAuthSessionStore()
const { isAuthenticated, login } = useAuth()
const { categories } = storeToRefs(gameCatalogStore)
const { t, te } = useI18n()
const {
  audioEnabled,
  setAudioEnabled,
  playUiSound,
  triggerVisualFeedback,
  visualFeedbackClass,
} = useGameFeedback()
const finishLoading = ref(false)
const liveGamePanel = ref<GameAsidePanelState | null>(null)
const isLoginDialogOpen = ref(false)
const isCoinsDialogOpen = ref(false)
const isPaymentSoonSnackbarOpen = ref(false)
const paymentSoonSnackbarText = ref('')
const usernameOrEmail = ref('')
const password = ref('')
const loginLoading = ref(false)
const loginError = ref('')
const userCoins = computed(() => authSession.profile?.coins ?? 0)
const gameStatusLabel = computed(() => {
  if (finishLoading.value) return 'Finalisation…'
  if (userGameResult.value === 'win') return 'Victoire'
  if (userGameResult.value === 'lose') return 'Défaite'
  return t('gamePage.status.inProgress')
})
const coinOffers = [
  {
    id: 'offer-1',
    coins: 1000,
    priceEuro: 1,
    labelKey: 'gamePage.auth.offers.offer1Label',
  },
  {
    id: 'offer-2',
    coins: 5000,
    priceEuro: 4,
    labelKey: 'gamePage.auth.offers.offer2Label',
  },
  {
    id: 'offer-3',
    coins: 100000,
    priceLabelKey: 'gamePage.auth.offers.offer3PriceLabel',
    labelKey: 'gamePage.auth.offers.offer3Label',
  },
] as const

const gameComponents: Record<string, unknown> = {
  rami: RamiGame,
  belote: BeloteGame,
  checkers: CheckersGame,
  poker: PokerGame,
  solitaire: SolitaireGame,
  hearts: HeartsGame,
  spades: SpadesGame,
  nonogram: NonogramGame,
  'hidden-word': HiddenWordGame,
  chess: ChessGame,
  sudoku: SudokuGame,
  game2048: Game2048,
  uno: UnoGame,
  ludo: LudoGame,
  'flappy-rocket': FlappyRocketGame,
}

const gameId = computed(() => {
  const raw = route.query.gameId
  return typeof raw === 'string' && raw ? raw : null
})

const selectedPlayMode = computed<PlayMode>(() =>
  route.query.mode === 'pvp' ? 'pvp' : 'ai',
)
const selectedBeloteMode = computed<BeloteMode>(() =>
  route.query.beloteMode === 'free-for-all' ? 'free-for-all' : 'teams',
)
const sessionId = computed(() =>
  typeof route.query.sessionId === 'string' ? route.query.sessionId : null,
)
const userGameResult = ref<SessionResult | null>(null)
const gameResultStorageKey = computed(() => {
  const userId = authSession.profile?.id
  const currentGameId =
    typeof route.params.id === 'string' ? route.params.id : gameId.value

  if (!userId || !currentGameId) return null
  return `game-result:${userId}:${currentGameId}`
})

const selectedCategory = computed(() => {
  if (!gameId.value) return null
  return (
    categories.value.find((category) =>
      category.subCategories.some((sub) =>
        sub.games.some((game) => game.id === gameId.value),
      ),
    ) ?? null
  )
})

const selectedSubCategory = computed(() => {
  if (!gameId.value) return null
  return (
    selectedCategory.value?.subCategories.find((sub) =>
      sub.games.some((game) => game.id === gameId.value),
    ) ?? null
  )
})

const selectedGame = computed<GameEntry | null>(() => {
  if (!gameId.value) return null
  return (
    selectedSubCategory.value?.games.find((game) => game.id === gameId.value) ??
    null
  )
})

const selectedComponent = computed(() =>
  selectedGame.value?.component
    ? gameComponents[selectedGame.value.component]
    : null,
)

const sidebarUserDisplayName = computed(() => {
  const firstName = authSession.profile?.firstName?.trim() ?? ''
  const lastName = authSession.profile?.lastName?.trim() ?? ''
  const fullName = `${firstName} ${lastName}`.trim()

  return (
    fullName ||
    authSession.profile?.username ||
    t('gamePage.auth.defaultPlayerName')
  )
})

const formatCoinsAmount = (coins: number) =>
  new Intl.NumberFormat('fr-FR').format(coins)

const formattedUserCoins = computed(() => formatCoinsAmount(userCoins.value))

const modeLabel = (mode: PlayMode) =>
  mode === 'ai' ? t('gamePage.modes.vsComputer') : t('gamePage.modes.vsPlayer')

const gamePanelState = computed(() => ({
  gameStatusLabel: gameStatusLabel.value,
  canLaunchSelectedGame: false,
  selectedBeloteMode: selectedBeloteMode.value,
  modeLabel,
  getLevelColor: (
    _level: 'category' | 'subCategory' | 'game' | 'mode' | 'info',
  ) => 'info',
  resetToCategories: () => router.push('/game'),
}))

const persistGameResult = (result: SessionResult) => {
  if (!import.meta.client || !gameResultStorageKey.value) return
  localStorage.setItem(gameResultStorageKey.value, result)
}

const loadStoredGameResult = () => {
  if (!import.meta.client || !gameResultStorageKey.value) return
  const stored = localStorage.getItem(gameResultStorageKey.value)
  userGameResult.value = stored === 'win' || stored === 'lose' ? stored : null
}

const finishGame = async (result: SessionResult) => {
  if (!sessionId.value || finishLoading.value) return

  finishLoading.value = true
  try {
    const response = await gameSessionsApi.finishGameSession(
      sessionId.value,
      result,
    )
    userGameResult.value = result
    persistGameResult(result)

    if (authSession.profile) {
      authSession.profile = {
        ...authSession.profile,
        coins: response.coins,
      }
    }
  } finally {
    finishLoading.value = false
  }
}

const onGameFinished = ({ result }: { result: SessionResult }) => {
  if (finishLoading.value || userGameResult.value) {
    return
  }

  playUiSound(result === 'win' ? 'win' : 'lose')
  triggerVisualFeedback(
    'game-surface',
    result === 'win' ? 'glow' : 'shake',
    620,
  )
  void finishGame(result)
}

const onGamePanelState = (payload: GameAsidePanelState) => {
  liveGamePanel.value = payload
}

const finishResultTitle = computed(() => {
  if (userGameResult.value === 'win') return 'You win 🎉'
  if (userGameResult.value === 'lose') return 'You lose 💥'
  return ''
})

const finishResultColor = computed(() =>
  userGameResult.value === 'win' ? 'success' : 'error',
)

const finishResultIcon = computed(() =>
  userGameResult.value === 'win' ? 'mdi-trophy' : 'mdi-emoticon-dead-outline',
)

const finishResultScore = computed<number | null>(() => {
  const scoreChip = liveGamePanel.value?.kpis.find((chip) =>
    chip.id.toLowerCase().includes('score'),
  )

  if (!scoreChip) return null
  if (typeof scoreChip.value === 'number') return scoreChip.value

  const parsed = Number.parseFloat(String(scoreChip.value).replace(',', '.'))
  return Number.isFinite(parsed) ? parsed : null
})

const resetToCategories = () => router.push('/game')
const backToSubCategories = () => router.push('/game')
const backToGames = () => router.push('/game')
const gameSurfaceFeedbackClass = visualFeedbackClass('game-surface')

const formatOfferPrice = (offer: (typeof coinOffers)[number]) =>
  typeof offer.priceEuro === 'number'
    ? `${offer.priceEuro} €`
    : t(offer.priceLabelKey ?? 'gamePage.auth.offers.offer3PriceLabel')

const chooseCoinOffer = (offerId: string) => {
  isCoinsDialogOpen.value = false
  paymentSoonSnackbarText.value = t('gamePage.auth.paymentSoon', { offerId })
  isPaymentSoonSnackbarOpen.value = true
}

const handleLogin = async () => {
  if (!usernameOrEmail.value.trim() || !password.value.trim()) {
    loginError.value = t('gamePage.auth.loginMissingCredentials')
    return
  }

  loginLoading.value = true
  loginError.value = ''

  try {
    await login(usernameOrEmail.value.trim(), password.value)
    isLoginDialogOpen.value = false
    usernameOrEmail.value = ''
    password.value = ''
  } catch {
    loginError.value = t('gamePage.auth.loginFailed')
  } finally {
    loginLoading.value = false
  }
}

onMounted(async () => {
  await gameCatalogStore.fetchCatalog()
  loadStoredGameResult()
})
</script>

<template>
  <PlatformSplitLayout>
    <template #sidebar>
      <div class="mb-4">
        <v-chip variant="outlined" prepend-icon="mdi-controller" class="mb-2">{{
          t('gamePage.sidebar.badge')
        }}</v-chip>
      </div>
      <div class="mb-4">
        <v-btn
          v-if="!isAuthenticated"
          variant="tonal"
          color="primary"
          prepend-icon="mdi-login"
          @click="isLoginDialogOpen = true"
        >
          {{ t('gamePage.auth.connect') }}
        </v-btn>
        <div v-else class="d-flex align-center ga-1">
          <UiAvatar
            :src="authSession.profile?.photo"
            :name="sidebarUserDisplayName"
            size="lg"
          />
          <div class="d-flex flex-column mx-3">
            <p class="text-body-2 font-weight-medium">
              {{ sidebarUserDisplayName }} -
              {{
                t('gamePage.auth.coinsBalance', { count: formattedUserCoins })
              }}
            </p>
            <v-btn
              variant="outlined"
              prepend-icon="mdi-cash-plus"
              @click="isCoinsDialogOpen = true"
            >
              {{ t('gamePage.auth.buyCoins') }}
            </v-btn>
          </div>
        </div>
      </div>
      <div class="d-flex flex-column ga-2 mb-4">
        <v-btn
          variant="outlined"
          prepend-icon="mdi-home"
          @click="resetToCategories"
          >{{ t('gamePage.navigation.backToCategories') }}</v-btn
        >
        <v-btn
          v-if="selectedSubCategory"
          variant="outlined"
          prepend-icon="mdi-arrow-left"
          @click="backToSubCategories"
        >
          {{ t('gamePage.navigation.backToSubCategories') }}
        </v-btn>
        <v-btn
          v-if="selectedGame"
          variant="outlined"
          prepend-icon="mdi-arrow-left"
          @click="backToGames"
        >
          {{ t('gamePage.navigation.backToGames') }}
        </v-btn>
      </div>
      <div class="d-flex align-center flex-wrap ga-2 mb-0">
        <v-chip v-if="selectedPlayMode">{{
          selectedPlayMode ? modeLabel(selectedPlayMode) : '—'
        }}</v-chip>
        <v-chip v-if="gameStatusLabel">{{ gameStatusLabel }}</v-chip>
        <v-chip
          v-if="selectedCategory"
          prepend-icon="mdi-folder-open-outline"
          color="primary"
          >{{ t(selectedCategory.nameKey) }}</v-chip
        >
        <v-chip
          v-if="selectedSubCategory"
          prepend-icon="mdi-shape-outline"
          color="secondary"
          >{{ t(selectedSubCategory.nameKey) }}</v-chip
        >
        <v-chip
          v-if="selectedGame"
          prepend-icon="mdi-play-circle-outline"
          color="success"
          >{{ t(selectedGame.nameKey) }}</v-chip
        >
      </div>
      <v-switch
        :model-value="audioEnabled"
        label="Audio des jeux"
        color="primary"
        hide-details
        inset
        class="mt-3"
        @update:model-value="setAudioEnabled"
      />

      <v-dialog v-model="isLoginDialogOpen" max-width="520">
        <v-card>
          <v-card-title>{{ t('gamePage.auth.loginModalTitle') }}</v-card-title>
          <v-card-text class="d-flex flex-column ga-3">
            <v-text-field
              v-model="usernameOrEmail"
              :label="t('gamePage.auth.loginEmailOrUsername')"
              variant="outlined"
              density="comfortable"
            />
            <v-text-field
              v-model="password"
              :label="t('gamePage.auth.loginPassword')"
              type="password"
              variant="outlined"
              density="comfortable"
            />
            <v-alert
              v-if="loginError"
              type="error"
              variant="tonal"
              density="compact"
            >
              {{ loginError }}
            </v-alert>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn color="primary" :loading="loginLoading" @click="handleLogin">
              {{ t('gamePage.auth.loginSubmit') }}
            </v-btn>
            <v-btn variant="text" to="/login">{{
              t('gamePage.auth.goToLoginPage')
            }}</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-dialog v-model="isCoinsDialogOpen" max-width="760">
        <v-card>
          <v-card-title>{{
            t('gamePage.auth.buyCoinsModalTitle')
          }}</v-card-title>
          <v-card-text class="pt-2">
            <v-row>
              <v-col
                v-for="offer in coinOffers"
                :key="offer.id"
                cols="12"
                md="4"
              >
                <v-card variant="outlined" class="h-100 d-flex flex-column">
                  <v-card-title class="text-h6">
                    {{
                      t(offer.labelKey, {
                        count: formatCoinsAmount(offer.coins),
                      })
                    }}
                  </v-card-title>
                  <v-card-subtitle class="text-body-1">
                    {{ formatOfferPrice(offer) }}
                  </v-card-subtitle>
                  <v-card-actions class="mt-auto">
                    <v-btn
                      color="primary"
                      variant="flat"
                      block
                      @click="chooseCoinOffer(offer.id)"
                    >
                      {{ t('gamePage.auth.chooseOffer') }}
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-card-text>
          <v-card-actions>
            <v-spacer />
            <v-btn
              color="primary"
              variant="text"
              @click="isCoinsDialogOpen = false"
              >{{ t('gamePage.auth.closeModal') }}</v-btn
            >
          </v-card-actions>
        </v-card>
      </v-dialog>

      <v-snackbar
        v-model="isPaymentSoonSnackbarOpen"
        color="info"
        timeout="2600"
        location="bottom right"
      >
        {{ paymentSoonSnackbarText }}
      </v-snackbar>
    </template>

    <template #aside>
      <GameMatchAside
        :selected-category="selectedCategory"
        :selected-sub-category="selectedSubCategory"
        :selected-game="selectedGame"
        :selected-play-mode="selectedPlayMode"
        :is-game-started="true"
        :game-panel-state="gamePanelState"
        :live-game-panel="liveGamePanel"
      />
    </template>

    <div v-if="finishLoading" class="result-panel result-panel--loading">
      <v-progress-circular
        indeterminate
        :size="80"
        :width="6"
        color="primary"
      />
      <p class="text-h6 mt-4 mb-0">Finalisation de la partie…</p>
    </div>

    <div v-else-if="userGameResult" class="result-panel">
      <v-icon
        :icon="finishResultIcon"
        :color="finishResultColor"
        size="76"
        class="result-panel__icon"
      />
      <h2 class="text-h4 mb-2">{{ finishResultTitle }}</h2>
      <p v-if="finishResultScore !== null" class="text-h6 mb-6">
        Score: {{ finishResultScore }}
      </p>
      <v-btn color="primary" size="large" @click="resetToCategories">
        Retour au catalogue
      </v-btn>
    </div>

    <div
      v-else-if="selectedComponent"
      :class="['game-surface-layout', gameSurfaceFeedbackClass]"
    >
      <component
        :is="selectedComponent"
        :selected-play-mode="selectedPlayMode"
        :belote-mode="selectedBeloteMode"
        @panel-state="onGamePanelState"
        @game-finished="onGameFinished"
      />
    </div>

    <v-alert v-else type="warning" variant="tonal">
      {{
        te('gamePage.status.none')
          ? t('gamePage.status.none')
          : 'Game not found.'
      }}
    </v-alert>
  </PlatformSplitLayout>
</template>

<style scoped>
.result-panel {
  min-height: 60vh;
  border-radius: 18px;
  display: grid;
  place-content: center;
  justify-items: center;
  text-align: center;
  padding: 2rem;
  border: 1px solid
    color-mix(in srgb, rgb(var(--v-theme-primary)) 28%, transparent);
  background:
    radial-gradient(
      circle at top,
      rgba(var(--v-theme-primary), 0.12),
      transparent 64%
    ),
    rgba(var(--v-theme-surface), 0.5);
}

.result-panel__icon {
  animation: result-pop 1.4s ease-in-out infinite alternate;
}

.result-panel--loading {
  gap: 0.5rem;
}

@keyframes result-pop {
  from {
    transform: scale(1);
defineOptions({ name: 'GamePlayPage' })
  }
  to {
    transform: scale(1.1);
  }
}

.game-feedback--pulse {
  animation: game-feedback-pulse 320ms ease-out;
}

.game-feedback--shake {
  animation: game-feedback-shake 620ms ease-in-out;
}

.game-feedback--glow {
  animation: game-feedback-glow 620ms ease-in-out;
}

.game-surface-layout {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
}

.game-surface-layout :deep(.game-table-actions .v-btn:focus-visible) {
  outline: 2px solid rgba(var(--v-theme-primary), 0.9);
  outline-offset: 2px;
}

@media (max-width: 960px) {
  .game-surface-layout {
    gap: 0.5rem;
  }
}

@keyframes game-feedback-pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.012);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes game-feedback-shake {
  0% {
    transform: translateX(0);
  }
  20% {
    transform: translateX(-6px);
  }
  40% {
    transform: translateX(6px);
  }
  60% {
    transform: translateX(-4px);
  }
  80% {
    transform: translateX(4px);
  }
  100% {
    transform: translateX(0);
  }
}

@keyframes game-feedback-glow {
  0% {
    filter: drop-shadow(0 0 0 rgba(var(--v-theme-success), 0));
  }
  50% {
    filter: drop-shadow(0 0 20px rgba(var(--v-theme-success), 0.45));
  }
  100% {
    filter: drop-shadow(0 0 0 rgba(var(--v-theme-success), 0));
  }
}
</style>
