import { computed, ref } from 'vue'

export type Suit = '♠' | '♥' | '♦' | '♣'
export type Rank =
  | '2'
  | '3'
  | '4'
  | '5'
  | '6'
  | '7'
  | '8'
  | '9'
  | '10'
  | 'J'
  | 'Q'
  | 'K'
  | 'A'

export interface Card {
  id: string
  suit: Suit
  rank: Rank
  value: number
}

export interface Player {
  id: string
  name: string
  isAI: boolean
  hand: Card[]
  score: number
  tricksWon: number
}

export interface Move {
  type: 'play'
  playerIndex: number
  cardId: string
}

interface TrickPlay {
  playerIndex: number
  card: Card
}

interface Snapshot {
  players: Player[]
  trick: TrickPlay[]
  leaderIndex: number
  turnIndex: number
  heartsBroken: boolean
  handNumber: number
}

const SUITS: Suit[] = ['♠', '♥', '♦', '♣']
const RANKS: Rank[] = [
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  'J',
  'Q',
  'K',
  'A',
]

const clonePlayers = (players: Player[]) =>
  players.map((player) => ({
    ...player,
    hand: player.hand.map((card) => ({ ...card })),
  }))

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

const createDeck = () => {
  let index = 0
  return SUITS.flatMap((suit) =>
    RANKS.map((rank, rankIndex) => ({
      id: `hea-${(index += 1)}`,
      suit,
      rank,
      value: rankIndex + 2,
    })),
  )
}

const cardPenalty = (card: Card) => {
  if (card.suit === '♥') return 1
  if (card.suit === '♠' && card.rank === 'Q') return 13
  return 0
}

export const useHeartsEngine = () => {
  const players = ref<Player[]>([])
  const trick = ref<TrickPlay[]>([])
  const leaderIndex = ref(0)
  const turnIndex = ref(0)
  const heartsBroken = ref(false)
  const handNumber = ref(1)
  const history = ref<Snapshot[]>([])
  const message = ref('Nouvelle manche Hearts.')

  const snapshot = (): Snapshot => ({
    players: clonePlayers(players.value),
    trick: trick.value.map((play) => ({ ...play, card: { ...play.card } })),
    leaderIndex: leaderIndex.value,
    turnIndex: turnIndex.value,
    heartsBroken: heartsBroken.value,
    handNumber: handNumber.value,
  })

  const restore = (state: Snapshot) => {
    players.value = clonePlayers(state.players)
    trick.value = state.trick.map((play) => ({
      ...play,
      card: { ...play.card },
    }))
    leaderIndex.value = state.leaderIndex
    turnIndex.value = state.turnIndex
    heartsBroken.value = state.heartsBroken
    handNumber.value = state.handNumber
  }

  const saveHistory = () => {
    history.value.push(snapshot())
    if (history.value.length > 100) {
      history.value.shift()
    }
  }

  const compareCards = (left: Card, right: Card) => left.value - right.value

  const canPlayCard = (playerIndex: number, card: Card) => {
    const player = players.value[playerIndex]
    if (!player) return false
    if (playerIndex !== turnIndex.value) return false

    const leadSuit = trick.value[0]?.card.suit
    if (!leadSuit) {
      if (card.suit !== '♥') return true
      const onlyHearts = player.hand.every((handCard) => handCard.suit === '♥')
      return heartsBroken.value || onlyHearts
    }

    const sameSuitCards = player.hand.filter(
      (handCard) => handCard.suit === leadSuit,
    )
    if (sameSuitCards.length > 0) {
      return card.suit === leadSuit
    }

    return true
  }

  const getValidMoves = (playerIndex = turnIndex.value): Move[] => {
    const player = players.value[playerIndex]
    if (!player) return []
    if (playerIndex !== turnIndex.value) return []

    return player.hand
      .filter((card) => canPlayCard(playerIndex, card))
      .map((card) => ({
        type: 'play' as const,
        playerIndex,
        cardId: card.id,
      }))
  }

  const resolveTrickWinner = () => {
    const leadSuit = trick.value[0]?.card.suit
    if (!leadSuit || trick.value.length === 0) return null

    return trick.value
      .filter((play) => play.card.suit === leadSuit)
      .sort((left, right) => compareCards(right.card, left.card))[0]
  }

  const scoreTrick = (winnerIndex: number) => {
    const penalty = trick.value.reduce(
      (sum, play) => sum + cardPenalty(play.card),
      0,
    )
    const winner = players.value[winnerIndex]
    if (!winner) return

    winner.score += penalty
    winner.tricksWon += 1
    if (penalty > 0) {
      message.value = `${winner.name} prend ${penalty} point(s) de pénalité.`
    } else {
      message.value = `${winner.name} remporte le pli sans pénalité.`
    }
  }

  const applyMove = (move: Move) => {
    const player = players.value[move.playerIndex]
    if (!player || move.type !== 'play') return false

    const cardIndex = player.hand.findIndex((card) => card.id === move.cardId)
    if (cardIndex < 0) return false
    const [card] = player.hand.splice(cardIndex, 1)
    if (!canPlayCard(move.playerIndex, card)) {
      player.hand.splice(cardIndex, 0, card)
      return false
    }

    saveHistory()
    trick.value.push({ playerIndex: move.playerIndex, card })

    if (card.suit === '♥') {
      heartsBroken.value = true
    }

    if (trick.value.length < players.value.length) {
      turnIndex.value = (turnIndex.value + 1) % players.value.length
      return true
    }

    const winnerPlay = resolveTrickWinner()
    if (!winnerPlay) return false
    scoreTrick(winnerPlay.playerIndex)
    leaderIndex.value = winnerPlay.playerIndex
    turnIndex.value = winnerPlay.playerIndex
    trick.value = []

    if (players.value.every((current) => current.hand.length === 0)) {
      handNumber.value += 1
      message.value = 'Main terminée.'
    }

    return true
  }

  const chooseAiMove = (playerIndex: number) => {
    const validMoves = getValidMoves(playerIndex)
    if (!validMoves.length) return null

    const player = players.value[playerIndex]
    if (!player) return null

    const leadSuit = trick.value[0]?.card.suit

    if (!leadSuit) {
      const nonHearts = player.hand
        .filter((card) => canPlayCard(playerIndex, card) && card.suit !== '♥')
        .sort(compareCards)
      if (nonHearts.length > 0) {
        return { type: 'play' as const, playerIndex, cardId: nonHearts[0].id }
      }
    }

    const safeCards = player.hand
      .filter((card) => canPlayCard(playerIndex, card))
      .filter((card) => cardPenalty(card) === 0)
      .sort(compareCards)

    if (safeCards.length > 0) {
      return { type: 'play' as const, playerIndex, cardId: safeCards[0].id }
    }

    const riskyCards = player.hand
      .filter((card) => canPlayCard(playerIndex, card))
      .sort(
        (left, right) =>
          cardPenalty(left) - cardPenalty(right) || compareCards(left, right),
      )

    return riskyCards[0]
      ? { type: 'play' as const, playerIndex, cardId: riskyCards[0].id }
      : validMoves[0]
  }

  const draw = () => {
    const aiPlayer = players.value[turnIndex.value]
    if (!aiPlayer?.isAI) return false
    const move = chooseAiMove(turnIndex.value)
    if (!move) return false
    return applyMove(move)
  }

  const undo = () => {
    const previous = history.value.pop()
    if (!previous) return false
    restore(previous)
    message.value = 'Coup annulé.'
    return true
  }

  const startNewHand = () => {
    const deck = shuffle(createDeck())
    players.value = [
      {
        id: 'hearts-human',
        name: 'Vous',
        isAI: false,
        hand: [],
        score: 0,
        tricksWon: 0,
      },
      {
        id: 'hearts-ai-east',
        name: 'IA Est',
        isAI: true,
        hand: [],
        score: 0,
        tricksWon: 0,
      },
      {
        id: 'hearts-ai-north',
        name: 'IA Nord',
        isAI: true,
        hand: [],
        score: 0,
        tricksWon: 0,
      },
      {
        id: 'hearts-ai-west',
        name: 'IA Ouest',
        isAI: true,
        hand: [],
        score: 0,
        tricksWon: 0,
      },
    ]

    for (let round = 0; round < 13; round += 1) {
      players.value.forEach((player) => {
        const card = deck.pop()
        if (card) player.hand.push(card)
      })
    }

    players.value.forEach((player) => {
      player.hand.sort(
        (left, right) =>
          left.suit.localeCompare(right.suit) || compareCards(left, right),
      )
      player.tricksWon = 0
    })

    trick.value = []
    history.value = []
    heartsBroken.value = false
    leaderIndex.value = 0
    turnIndex.value = 0
    message.value = 'Main Hearts distribuée.'
  }

  const nextAiTurn = () => {
    const currentPlayer = players.value[turnIndex.value]
    if (!currentPlayer?.isAI) return false
    return draw()
  }

  const isHandOver = computed(
    () =>
      players.value.every((player) => player.hand.length === 0) &&
      trick.value.length === 0,
  )

  startNewHand()

  return {
    players,
    trick,
    turnIndex,
    leaderIndex,
    heartsBroken,
    handNumber,
    message,
    isHandOver,
    canPlayCard,
    getValidMoves,
    applyMove,
    chooseAiMove,
    nextAiTurn,
    draw,
    undo,
    startNewHand,
  }
}
