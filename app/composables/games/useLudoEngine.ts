import { computed, ref } from 'vue'

export type LudoZone = 'base' | 'track' | 'home'
export type LudoColor = 'red' | 'green' | 'yellow' | 'blue'

export interface LudoPawn {
  id: string
  playerId: string
  progress: number
}

export interface LudoPawnPosition {
  zone: LudoZone
  trackIndex: number | null
  homeIndex: number | null
  isFinished: boolean
}

export interface LudoPlayer {
  id: string
  name: string
  color: LudoColor
  pawns: LudoPawn[]
}

export interface LudoMoveRecord {
  turn: number
  playerIndex: number
  pawnId: string
  dice: number
  from: LudoPawnPosition
  to: LudoPawnPosition
  capturedPawnIds: string[]
}

export interface LudoMoveOption {
  pawnId: string
  from: LudoPawnPosition
  to: LudoPawnPosition
}

interface LudoEngineOptions {
  playerCount?: number
}

const PLAYER_COLORS: LudoColor[] = ['red', 'green', 'yellow', 'blue']
const PLAYER_START_OFFSETS = [0, 13, 26, 39]
const SAFE_TRACK_INDEXES = new Set([0, 8, 13, 21, 26, 34, 39, 47])
const MIN_PLAYERS = 2
const MAX_PLAYERS = 4
const PAWNS_PER_PLAYER = 4
const TRACK_LENGTH = 52
const FINAL_PROGRESS = 57

const clampPlayerCount = (value: number | undefined) =>
  Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, value ?? 4))

const createPlayers = (playerCount: number): LudoPlayer[] =>
  Array.from({ length: playerCount }, (_, playerIndex) => {
    const id = `ludo-player-${playerIndex + 1}`

    return {
      id,
      name: `Joueur ${playerIndex + 1}`,
      color: PLAYER_COLORS[playerIndex],
      pawns: Array.from({ length: PAWNS_PER_PLAYER }, (_, pawnIndex) => ({
        id: `${id}-pawn-${pawnIndex + 1}`,
        playerId: id,
        progress: -1,
      })),
    }
  })

export const useLudoEngine = (options: LudoEngineOptions = {}) => {
  const playerCount = clampPlayerCount(options.playerCount)

  const players = ref<LudoPlayer[]>(createPlayers(playerCount))
  const currentPlayerIndex = ref(0)
  const diceResult = ref<number | null>(null)
  const selectedPawnId = ref<string | null>(null)
  const winnerIndex = ref<number | null>(null)
  const moveHistory = ref<LudoMoveRecord[]>([])
  const turn = ref(1)
  const hasMovedThisTurn = ref(false)

  const getPawnPosition = (
    pawn: LudoPawn,
    playerIndex: number,
  ): LudoPawnPosition => {
    if (pawn.progress < 0) {
      return {
        zone: 'base',
        trackIndex: null,
        homeIndex: null,
        isFinished: false,
      }
    }

    if (pawn.progress <= TRACK_LENGTH - 1) {
      return {
        zone: 'track',
        trackIndex:
          (PLAYER_START_OFFSETS[playerIndex] + pawn.progress) % TRACK_LENGTH,
        homeIndex: null,
        isFinished: false,
      }
    }

    const homeIndex = pawn.progress - TRACK_LENGTH
    return {
      zone: 'home',
      trackIndex: null,
      homeIndex,
      isFinished: pawn.progress === FINAL_PROGRESS,
    }
  }

  const currentPlayer = computed(
    () => players.value[currentPlayerIndex.value] ?? null,
  )

  const canAdvancePawn = (pawn: LudoPawn, dice: number) => {
    if (pawn.progress < 0) {
      return dice === 6
    }

    return pawn.progress + dice <= FINAL_PROGRESS
  }

  const getPawnById = (playerIndex: number, pawnId: string) =>
    players.value[playerIndex]?.pawns.find((pawn) => pawn.id === pawnId) ?? null

  const getMovablePawns = (
    playerIndex = currentPlayerIndex.value,
  ): LudoPawn[] => {
    const player = players.value[playerIndex]
    if (!player || diceResult.value === null) return []

    return player.pawns.filter((pawn) =>
      canAdvancePawn(pawn, diceResult.value as number),
    )
  }

  const getValidMoves = (
    playerIndex = currentPlayerIndex.value,
  ): LudoMoveOption[] => {
    const dice = diceResult.value
    if (dice === null) return []

    return getMovablePawns(playerIndex).map((pawn) => {
      const from = getPawnPosition(pawn, playerIndex)
      const targetProgress = pawn.progress < 0 ? 0 : pawn.progress + dice
      const to = getPawnPosition(
        { ...pawn, progress: targetProgress },
        playerIndex,
      )

      return {
        pawnId: pawn.id,
        from,
        to,
      }
    })
  }

  const rollDice = (forcedValue?: number) => {
    if (winnerIndex.value !== null) return null
    if (diceResult.value !== null && !hasMovedThisTurn.value)
      return diceResult.value

    const nextValue = forcedValue ?? Math.floor(Math.random() * 6) + 1
    if (nextValue < 1 || nextValue > 6) {
      throw new Error('Le dé doit être compris entre 1 et 6.')
    }

    diceResult.value = nextValue
    selectedPawnId.value = null
    hasMovedThisTurn.value = false
    return nextValue
  }

  const selectPawn = (pawnId: string) => {
    const validPawnIds = new Set(getMovablePawns().map((pawn) => pawn.id))
    if (!validPawnIds.has(pawnId)) return false

    selectedPawnId.value = pawnId
    return true
  }

  const applyMove = (pawnId?: string) => {
    if (winnerIndex.value !== null) return false

    const activePlayerIndex = currentPlayerIndex.value
    const dice = diceResult.value
    if (dice === null) return false

    const chosenPawnId = pawnId ?? selectedPawnId.value
    if (!chosenPawnId) return false

    const player = players.value[activePlayerIndex]
    if (!player) return false

    const pawn = getPawnById(activePlayerIndex, chosenPawnId)
    if (!pawn || !canAdvancePawn(pawn, dice)) return false

    const from = getPawnPosition(pawn, activePlayerIndex)

    pawn.progress = pawn.progress < 0 ? 0 : pawn.progress + dice
    const to = getPawnPosition(pawn, activePlayerIndex)

    const capturedPawnIds: string[] = []
    if (
      to.zone === 'track' &&
      to.trackIndex !== null &&
      !SAFE_TRACK_INDEXES.has(to.trackIndex)
    ) {
      players.value.forEach((opponent, opponentIndex) => {
        if (opponentIndex === activePlayerIndex) return

        opponent.pawns.forEach((opponentPawn) => {
          const opponentPosition = getPawnPosition(opponentPawn, opponentIndex)
          if (
            opponentPosition.zone === 'track' &&
            opponentPosition.trackIndex === to.trackIndex
          ) {
            opponentPawn.progress = -1
            capturedPawnIds.push(opponentPawn.id)
          }
        })
      })
    }

    if (
      player.pawns.every((playerPawn) => playerPawn.progress === FINAL_PROGRESS)
    ) {
      winnerIndex.value = activePlayerIndex
    }

    moveHistory.value.push({
      turn: turn.value,
      playerIndex: activePlayerIndex,
      pawnId: pawn.id,
      dice,
      from,
      to,
      capturedPawnIds,
    })

    if (moveHistory.value.length > 100) {
      moveHistory.value.shift()
    }

    hasMovedThisTurn.value = true
    selectedPawnId.value = pawn.id
    return true
  }

  const endTurn = () => {
    if (winnerIndex.value !== null) return false
    if (diceResult.value === null) return false

    const validMoves = getValidMoves(currentPlayerIndex.value)
    if (!hasMovedThisTurn.value && validMoves.length > 0) return false

    const earnedExtraTurn = hasMovedThisTurn.value && diceResult.value === 6

    if (!earnedExtraTurn) {
      currentPlayerIndex.value =
        (currentPlayerIndex.value + 1) % players.value.length
    }

    diceResult.value = null
    selectedPawnId.value = null
    hasMovedThisTurn.value = false
    turn.value += 1
    return true
  }

  const resetGame = () => {
    players.value = createPlayers(playerCount)
    currentPlayerIndex.value = 0
    diceResult.value = null
    selectedPawnId.value = null
    winnerIndex.value = null
    moveHistory.value = []
    turn.value = 1
    hasMovedThisTurn.value = false
  }

  return {
    players,
    currentPlayer,
    currentPlayerIndex,
    diceResult,
    selectedPawnId,
    winnerIndex,
    turn,
    moveHistory,
    rollDice,
    selectPawn,
    getValidMoves,
    getMovablePawns,
    getPawnPosition,
    applyMove,
    endTurn,
    resetGame,
  }
}
