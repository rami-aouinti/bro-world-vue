import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'
import type { Router } from 'vue-router'
import type {
  StartGameSessionResponse,
  GameLevel,
} from '~/composables/api/useGameSessionsApi'
import type { BeloteMode, GameEntry, PlayMode } from '~/types/game'

const getGameBusinessKey = (game: GameEntry | null | undefined) =>
  game?.key ?? game?.id ?? null

const isGameAvailableForLaunch = (game: GameEntry | null | undefined) =>
  game?.developmentStatus === 'playable'

interface UseGameLaunchFlowOptions {
  selectedGame: ComputedRef<GameEntry | null>
  localSupportedModes: ComputedRef<PlayMode[]>
  selectedBeloteMode: Ref<BeloteMode | null>
  isAuthenticated: Ref<boolean>
  startGameSession: (
    gameId: string,
    level: GameLevel,
  ) => Promise<StartGameSessionResponse>
  updateProfileCoins: (coins: number) => void
  router: Router
}

export const useGameLaunchFlow = ({
  selectedGame,
  localSupportedModes,
  selectedBeloteMode,
  isAuthenticated,
  startGameSession,
  updateProfileCoins,
  router,
}: UseGameLaunchFlowOptions) => {
  const selectedPlayMode = ref<PlayMode | null>(null)
  const selectedAiLevel = ref<GameLevel | null>(null)
  const isGameStarted = ref(false)
  const isLoginDialogOpen = ref(false)
  const isLaunchingSession = ref(false)

  const canLaunchSelectedGame = computed(() => {
    if (
      !selectedGame.value?.component ||
      !isGameAvailableForLaunch(selectedGame.value)
    ) {
      return false
    }

    const hasPlayableMode =
      Boolean(selectedPlayMode.value) &&
      localSupportedModes.value.includes(selectedPlayMode.value as PlayMode)

    if (!hasPlayableMode) return false

    if (selectedPlayMode.value === 'ai' && !selectedAiLevel.value) {
      return false
    }

    if (getGameBusinessKey(selectedGame.value) === 'belote') {
      return Boolean(selectedBeloteMode.value)
    }

    return true
  })

  const selectPlayMode = (mode: PlayMode) => {
    if (!localSupportedModes.value.includes(mode)) {
      return
    }

    selectedPlayMode.value = mode
    isGameStarted.value = false
  }

  const selectAiLevel = (level: GameLevel) => {
    selectedAiLevel.value = level
    isGameStarted.value = false
  }

  const selectBeloteMode = (mode: BeloteMode) => {
    if (getGameBusinessKey(selectedGame.value) !== 'belote') return
    selectedBeloteMode.value = mode
    isGameStarted.value = false
  }

  const resetLaunchSelection = () => {
    selectedPlayMode.value = null
    selectedAiLevel.value = null
    isGameStarted.value = false
  }

  const launchGame = async () => {
    if (!canLaunchSelectedGame.value || isLaunchingSession.value) {
      return
    }

    if (selectedPlayMode.value === 'ai') {
      if (!isAuthenticated.value) {
        isLoginDialogOpen.value = true
        return
      }

      if (!selectedGame.value?.id || !selectedAiLevel.value) {
        return
      }

      isLaunchingSession.value = true
      try {
        const response = await startGameSession(
          selectedGame.value.id,
          selectedAiLevel.value,
        )

        updateProfileCoins(response.coins)

        await router.push({
          path: `/game/${response.userGameId}/play`,
          query: {
            gameId: selectedGame.value.id,
            mode: selectedPlayMode.value,
            level: selectedAiLevel.value,
            sessionId: response.session.sessionId,
            beloteMode: selectedBeloteMode.value ?? undefined,
          },
        })
        return
      } catch {
        return
      } finally {
        isLaunchingSession.value = false
      }
    }

    isGameStarted.value = true
  }

  watch(selectedGame, (nextGame) => {
    if (!nextGame) {
      resetLaunchSelection()
      return
    }

    const nextModes = nextGame.availableModes ?? nextGame.supportedModes ?? []
    selectedPlayMode.value = nextModes.includes('ai')
      ? 'ai'
      : (nextModes[0] ?? null)
    selectedAiLevel.value = null
    isGameStarted.value = false
  })

  return {
    selectedPlayMode,
    selectedAiLevel,
    isGameStarted,
    isLoginDialogOpen,
    isLaunchingSession,
    canLaunchSelectedGame,
    selectPlayMode,
    selectAiLevel,
    selectBeloteMode,
    resetLaunchSelection,
    launchGame,
    isGameAvailableForLaunch,
  }
}
