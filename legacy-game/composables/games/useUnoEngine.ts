import { computed, ref } from 'vue'

export type UnoColor = 'red' | 'yellow' | 'green' | 'blue'
export type UnoValue =
  | '0'
  | '1'
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | 'skip'
  | 'reverse'
  | 'draw-two'
  | 'wild'
  | 'wild-draw-four'

export interface UnoCard {
  id: string
  color: UnoColor | null
  value: UnoValue
}

export interface UnoPlayer {
  id: string
  name: string
  isAI: boolean
  hand: UnoCard[]
  score: number
  hasCalledUno: boolean
}

export interface UnoRoundState {
  drawPileCount: number
  discardPileTop: UnoCard | null
  currentColor: UnoColor
  direction: 1 | -1
  currentPlayerIndex: number
  pendingDrawCount: number
  winnerIndex: number | null
  turnNumber: number
}

export interface UnoMove {
  type: 'play' | 'draw' | 'choose-color'
  cardId?: string
  color?: UnoColor
}

interface UnoEngineOptions {
  playerCount?: number
  scoreTarget?: number
  includeHumanPlayer?: boolean
}

const COLORS: UnoColor[] = ['red', 'yellow', 'green', 'blue']
const NUMBER_VALUES: UnoValue[] = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
]
const ACTION_VALUES: UnoValue[] = ['skip', 'reverse', 'draw-two']
const WILD_VALUES: UnoValue[] = ['wild', 'wild-draw-four']
const DEFAULT_SCORE_TARGET = 500
const STARTING_HAND_SIZE = 7

const shuffle = <T>(items: T[]) => {
  const output = [...items]
  for (let index = output.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const current = output[index]
    output[index] = output[randomIndex]
    output[randomIndex] = current
  }
  return output
}

const cardPoints = (card: UnoCard) => {
  if (NUMBER_VALUES.includes(card.value)) {
    return Number(card.value)
  }

  if (ACTION_VALUES.includes(card.value)) {
    return 20
  }

  return 50
}

const createUnoDeck = (): UnoCard[] => {
  let index = 0
  const cards: UnoCard[] = []

  COLORS.forEach((color) => {
    cards.push({ id: `uno-${(index += 1)}`, color, value: '0' })

    NUMBER_VALUES.filter((value) => value !== '0').forEach((value) => {
      cards.push({ id: `uno-${(index += 1)}`, color, value })
      cards.push({ id: `uno-${(index += 1)}`, color, value })
    })

    ACTION_VALUES.forEach((value) => {
      cards.push({ id: `uno-${(index += 1)}`, color, value })
      cards.push({ id: `uno-${(index += 1)}`, color, value })
    })
  })

  for (let wildIndex = 0; wildIndex < 4; wildIndex += 1) {
    WILD_VALUES.forEach((value) => {
      cards.push({ id: `uno-${(index += 1)}`, color: null, value })
    })
  }

  return cards
}

export const useUnoEngine = (options: UnoEngineOptions = {}) => {
  const playerCount = Math.min(4, Math.max(2, options.playerCount ?? 4))
  const scoreTarget = Math.max(50, options.scoreTarget ?? DEFAULT_SCORE_TARGET)

  const players = ref<UnoPlayer[]>([])
  const drawPile = ref<UnoCard[]>([])
  const discardPile = ref<UnoCard[]>([])
  const currentColor = ref<UnoColor>('red')
  const direction = ref<1 | -1>(1)
  const currentPlayerIndex = ref(0)
  const pendingDrawCount = ref(0)
  const roundWinnerIndex = ref<number | null>(null)
  const turnNumber = ref(1)
  const message = ref('Nouvelle manche UNO prête.')
  const needColorChoice = ref(false)
  const pendingWildCard = ref<UnoCard | null>(null)
  const currentRound = ref(1)
  const gameWinnerIndex = ref<number | null>(null)

  const createPlayers = () =>
    Array.from({ length: playerCount }, (_, index) => {
      const human = options.includeHumanPlayer ?? true
      const isHumanSeat = human ? index === 0 : false
      return {
        id: `uno-player-${index + 1}`,
        name: isHumanSeat ? 'Vous' : `IA ${index + 1}`,
        isAI: !isHumanSeat,
        hand: [],
        score: 0,
        hasCalledUno: false,
      }
    })

  const getStep = (fromIndex: number, step = 1) => {
    const modulo = players.value.length
    const delta = (direction.value * step) % modulo
    return (fromIndex + delta + modulo) % modulo
  }

  const topDiscard = computed(
    () => discardPile.value[discardPile.value.length - 1] ?? null,
  )

  const isPlayable = (card: UnoCard) => {
    if (needColorChoice.value) return false

    if (pendingDrawCount.value > 0) {
      return card.value === 'draw-two' || card.value === 'wild-draw-four'
    }

    if (card.value === 'wild' || card.value === 'wild-draw-four') return true

    const top = topDiscard.value
    if (!top) return true

    return card.color === currentColor.value || card.value === top.value
  }

  const getPlayableCards = (playerIndex: number) => {
    const player = players.value[playerIndex]
    if (!player) return []
    return player.hand.filter(isPlayable)
  }

  const getValidMoves = (playerIndex = currentPlayerIndex.value): UnoMove[] => {
    if (gameWinnerIndex.value !== null || roundWinnerIndex.value !== null)
      return []

    const player = players.value[playerIndex]
    if (!player) return []
    if (playerIndex !== currentPlayerIndex.value) return []

    if (needColorChoice.value) {
      return COLORS.map((color) => ({ type: 'choose-color', color }))
    }

    const playableCards = getPlayableCards(playerIndex)
    const cardMoves = playableCards.map((card) => ({
      type: 'play' as const,
      cardId: card.id,
    }))

    return [...cardMoves, { type: 'draw' }]
  }

  const reshuffleFromDiscard = () => {
    if (discardPile.value.length <= 1) return
    const top = discardPile.value.pop()
    const reshuffled = shuffle(discardPile.value)
    drawPile.value.push(...reshuffled)
    discardPile.value = top ? [top] : []
  }

  const drawCards = (playerIndex: number, count: number) => {
    const player = players.value[playerIndex]
    if (!player) return

    for (let drawCount = 0; drawCount < count; drawCount += 1) {
      if (drawPile.value.length === 0) {
        reshuffleFromDiscard()
      }

      const card = drawPile.value.pop()
      if (!card) break
      player.hand.push(card)
    }
  }

  const nextTurn = (steps = 1) => {
    currentPlayerIndex.value = getStep(currentPlayerIndex.value, steps)
    turnNumber.value += 1
  }

  const applyUnoPenaltyIfNeeded = (playerIndex: number) => {
    const player = players.value[playerIndex]
    if (!player) return

    if (player.hand.length === 1 && !player.hasCalledUno) {
      drawCards(playerIndex, 2)
      message.value = `${player.name} a oublié UNO: +2 cartes.`
    }
  }

  const computeRoundScore = (winnerIndex: number) =>
    players.value
      .filter((_, index) => index !== winnerIndex)
      .flatMap((player) => player.hand)
      .reduce((sum, card) => sum + cardPoints(card), 0)

  const endRound = (winnerIndex: number) => {
    roundWinnerIndex.value = winnerIndex
    const winner = players.value[winnerIndex]
    if (!winner) return

    const gainedScore = computeRoundScore(winnerIndex)
    winner.score += gainedScore

    message.value = `${winner.name} gagne la manche (+${gainedScore} points).`

    const firstToTarget = players.value.findIndex(
      (player) => player.score >= scoreTarget,
    )
    if (firstToTarget >= 0) {
      gameWinnerIndex.value = firstToTarget
      message.value = `${players.value[firstToTarget]?.name ?? 'Un joueur'} gagne la partie (${scoreTarget} points).`
    }
  }

  const applyCardEffect = (card: UnoCard) => {
    const twoPlayers = players.value.length === 2

    switch (card.value) {
      case 'skip': {
        nextTurn(2)
        message.value = 'Tour sauté.'
        return
      }
      case 'reverse': {
        if (twoPlayers) {
          nextTurn(2)
          message.value = 'Reverse à 2 joueurs: équivalent Skip.'
          return
        }
        direction.value = direction.value === 1 ? -1 : 1
        nextTurn(1)
        message.value = 'Sens inversé.'
        return
      }
      case 'draw-two': {
        const target = getStep(currentPlayerIndex.value, 1)
        drawCards(target, 2)
        nextTurn(2)
        message.value = `${players.value[target]?.name ?? 'Joueur suivant'} pioche 2 cartes.`
        return
      }
      case 'wild': {
        needColorChoice.value = true
        pendingWildCard.value = card
        message.value = 'Choisissez une couleur.'
        return
      }
      case 'wild-draw-four': {
        needColorChoice.value = true
        pendingWildCard.value = card
        pendingDrawCount.value = 4
        message.value = 'Choisissez une couleur (Wild +4).'
        return
      }
      default:
        nextTurn(1)
    }
  }

  const chooseColor = (color: UnoColor) => {
    if (!needColorChoice.value || !pendingWildCard.value) return false

    currentColor.value = color
    needColorChoice.value = false

    const wildCard = pendingWildCard.value
    pendingWildCard.value = null

    if (wildCard.value === 'wild-draw-four') {
      const target = getStep(currentPlayerIndex.value, 1)
      drawCards(target, 4)
      nextTurn(2)
      pendingDrawCount.value = 0
      message.value = `${players.value[target]?.name ?? 'Joueur suivant'} pioche 4 cartes (${color}).`
      return true
    }

    nextTurn(1)
    message.value = `Couleur choisie: ${color}.`
    return true
  }

  const playCard = (playerIndex: number, cardId: string) => {
    if (playerIndex !== currentPlayerIndex.value) return false
    if (
      needColorChoice.value ||
      roundWinnerIndex.value !== null ||
      gameWinnerIndex.value !== null
    )
      return false

    const player = players.value[playerIndex]
    if (!player) return false

    const cardIndex = player.hand.findIndex((card) => card.id === cardId)
    if (cardIndex < 0) return false

    const [card] = player.hand.splice(cardIndex, 1)
    if (!card || !isPlayable(card)) {
      if (card) {
        player.hand.splice(cardIndex, 0, card)
      }
      return false
    }

    discardPile.value.push(card)
    if (card.color) {
      currentColor.value = card.color
    }

    player.hasCalledUno = false

    if (player.hand.length === 1 && !player.hasCalledUno) {
      message.value = `${player.name} doit annoncer UNO.`
    }

    if (player.hand.length === 0) {
      endRound(playerIndex)
      return true
    }

    applyCardEffect(card)

    if (!needColorChoice.value) {
      applyUnoPenaltyIfNeeded(playerIndex)
    }

    return true
  }

  const drawCard = (playerIndex = currentPlayerIndex.value) => {
    if (playerIndex !== currentPlayerIndex.value || needColorChoice.value)
      return null
    if (roundWinnerIndex.value !== null || gameWinnerIndex.value !== null)
      return null

    drawCards(playerIndex, 1)
    const drawn = players.value[playerIndex]?.hand.at(-1) ?? null

    if (pendingDrawCount.value > 0) {
      pendingDrawCount.value = Math.max(0, pendingDrawCount.value - 1)
    }

    nextTurn(1)
    message.value = `${players.value[playerIndex]?.name ?? 'Le joueur'} pioche une carte.`

    return drawn
  }

  const callUno = (playerIndex = currentPlayerIndex.value) => {
    const player = players.value[playerIndex]
    if (!player || player.hand.length !== 1) return false
    player.hasCalledUno = true
    message.value = `${player.name} annonce UNO !`
    return true
  }

  const startRound = () => {
    drawPile.value = shuffle(createUnoDeck())
    discardPile.value = []
    direction.value = 1
    pendingDrawCount.value = 0
    roundWinnerIndex.value = null
    turnNumber.value = 1
    needColorChoice.value = false
    pendingWildCard.value = null

    players.value.forEach((player) => {
      player.hand = []
      player.hasCalledUno = false
    })

    for (let cardIndex = 0; cardIndex < STARTING_HAND_SIZE; cardIndex += 1) {
      players.value.forEach((_, playerIndex) => {
        drawCards(playerIndex, 1)
      })
    }

    let firstDiscard = drawPile.value.pop() ?? null
    while (
      firstDiscard &&
      (firstDiscard.value === 'wild' || firstDiscard.value === 'wild-draw-four')
    ) {
      drawPile.value.unshift(firstDiscard)
      drawPile.value = shuffle(drawPile.value)
      firstDiscard = drawPile.value.pop() ?? null
    }

    if (firstDiscard) {
      discardPile.value.push(firstDiscard)
      currentColor.value = firstDiscard.color ?? 'red'
    }

    currentPlayerIndex.value = 0
    message.value = `Manche ${currentRound.value}: ${players.value[0]?.name ?? 'Joueur 1'} commence.`
  }

  const startGame = () => {
    players.value = createPlayers()
    gameWinnerIndex.value = null
    currentRound.value = 1
    startRound()
  }

  const startNextRound = () => {
    if (gameWinnerIndex.value !== null) return false
    currentRound.value += 1
    startRound()
    return true
  }

  const roundState = computed<UnoRoundState>(() => ({
    drawPileCount: drawPile.value.length,
    discardPileTop: topDiscard.value,
    currentColor: currentColor.value,
    direction: direction.value,
    currentPlayerIndex: currentPlayerIndex.value,
    pendingDrawCount: pendingDrawCount.value,
    winnerIndex: roundWinnerIndex.value,
    turnNumber: turnNumber.value,
  }))

  const currentPlayer = computed(
    () => players.value[currentPlayerIndex.value] ?? null,
  )
  const playableCards = computed(() =>
    getPlayableCards(currentPlayerIndex.value),
  )
  const actionsAvailable = computed(() => {
    if (needColorChoice.value) {
      return ['choose-color']
    }

    return ['play-card', 'draw-card', 'call-uno']
  })
  const globalScore = computed(() =>
    players.value.map((player) => ({
      playerId: player.id,
      score: player.score,
    })),
  )

  startGame()

  return {
    players,
    drawPile,
    discardPile,
    currentColor,
    currentPlayerIndex,
    currentPlayer,
    roundState,
    playableCards,
    message,
    actionsAvailable,
    globalScore,
    currentRound,
    roundWinnerIndex,
    gameWinnerIndex,
    scoreTarget,
    getValidMoves,
    playCard,
    drawCard,
    chooseColor,
    callUno,
    startRound,
    startNextRound,
    startGame,
  }
}
