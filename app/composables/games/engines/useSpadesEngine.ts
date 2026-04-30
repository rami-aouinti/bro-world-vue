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
  bid: number
  tricksWon: number
  score: number
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
  turnIndex: number
  leaderIndex: number
  handNumber: number
  spadesBroken: boolean
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
      id: `spa-${(index += 1)}`,
      suit,
      rank,
      value: rankIndex + 2,
    })),
  )
}

export const useSpadesEngine = () => {
  const players = ref<Player[]>([])
  const trick = ref<TrickPlay[]>([])
  const turnIndex = ref(0)
  const leaderIndex = ref(0)
  const handNumber = ref(1)
  const spadesBroken = ref(false)
  const history = ref<Snapshot[]>([])
  const message = ref('Nouvelle partie de Spades.')

  const snapshot = (): Snapshot => ({
    players: clonePlayers(players.value),
    trick: trick.value.map((play) => ({ ...play, card: { ...play.card } })),
    turnIndex: turnIndex.value,
    leaderIndex: leaderIndex.value,
    handNumber: handNumber.value,
    spadesBroken: spadesBroken.value,
  })

  const restore = (state: Snapshot) => {
    players.value = clonePlayers(state.players)
    trick.value = state.trick.map((play) => ({
      ...play,
      card: { ...play.card },
    }))
    turnIndex.value = state.turnIndex
    leaderIndex.value = state.leaderIndex
    handNumber.value = state.handNumber
    spadesBroken.value = state.spadesBroken
  }

  const saveHistory = () => {
    history.value.push(snapshot())
    if (history.value.length > 100) {
      history.value.shift()
    }
  }

  const compareCards = (left: Card, right: Card) => left.value - right.value

  const assignBid = (hand: Card[]) => {
    const highCards = hand.filter(
      (card) => card.rank === 'A' || card.rank === 'K' || card.rank === 'Q',
    ).length
    const spades = hand.filter((card) => card.suit === '♠').length
    return Math.max(1, Math.min(6, Math.round(highCards * 0.6 + spades * 0.5)))
  }

  const canPlayCard = (playerIndex: number, card: Card) => {
    const player = players.value[playerIndex]
    if (!player) return false
    if (playerIndex !== turnIndex.value) return false

    const leadSuit = trick.value[0]?.card.suit
    if (!leadSuit) {
      if (card.suit !== '♠') return true
      const onlySpades = player.hand.every((handCard) => handCard.suit === '♠')
      return spadesBroken.value || onlySpades
    }

    const cardsInLeadSuit = player.hand.filter(
      (handCard) => handCard.suit === leadSuit,
    )
    if (cardsInLeadSuit.length > 0) {
      return card.suit === leadSuit
    }

    return true
  }

  const getValidMoves = (playerIndex = turnIndex.value): Move[] => {
    const player = players.value[playerIndex]
    if (!player || playerIndex !== turnIndex.value) return []

    return player.hand
      .filter((card) => canPlayCard(playerIndex, card))
      .map((card) => ({ type: 'play' as const, playerIndex, cardId: card.id }))
  }

  const resolveTrickWinner = () => {
    if (!trick.value.length) return null
    const leadSuit = trick.value[0].card.suit

    const winning = trick.value.reduce((best, current) => {
      const bestIsSpade = best.card.suit === '♠'
      const currentIsSpade = current.card.suit === '♠'

      if (bestIsSpade && currentIsSpade) {
        return compareCards(current.card, best.card) > 0 ? current : best
      }

      if (currentIsSpade && !bestIsSpade) {
        return current
      }

      if (!currentIsSpade && bestIsSpade) {
        return best
      }

      if (current.card.suit === leadSuit && best.card.suit === leadSuit) {
        return compareCards(current.card, best.card) > 0 ? current : best
      }

      if (current.card.suit === leadSuit && best.card.suit !== leadSuit) {
        return current
      }

      return best
    })

    return winning
  }

  const updateScoreIfHandOver = () => {
    const handOver = players.value.every((player) => player.hand.length === 0)
    if (!handOver || trick.value.length > 0) return

    players.value.forEach((player) => {
      if (player.tricksWon >= player.bid) {
        player.score += player.bid * 10 + (player.tricksWon - player.bid)
      } else {
        player.score -= player.bid * 10
      }
    })

    handNumber.value += 1
    message.value = 'Main Spades terminée, scores mis à jour.'
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

    if (card.suit === '♠') {
      spadesBroken.value = true
    }

    if (trick.value.length < players.value.length) {
      turnIndex.value = (turnIndex.value + 1) % players.value.length
      return true
    }

    const winner = resolveTrickWinner()
    if (!winner) return false

    players.value[winner.playerIndex].tricksWon += 1
    leaderIndex.value = winner.playerIndex
    turnIndex.value = winner.playerIndex
    trick.value = []

    updateScoreIfHandOver()
    return true
  }

  const chooseAiMove = (playerIndex: number) => {
    const player = players.value[playerIndex]
    if (!player) return null

    const legalCards = player.hand.filter((card) =>
      canPlayCard(playerIndex, card),
    )
    if (!legalCards.length) return null

    const needTricks = player.tricksWon < player.bid

    if (needTricks) {
      const winningBias = [...legalCards].sort(
        (left, right) => right.value - left.value,
      )
      return { type: 'play' as const, playerIndex, cardId: winningBias[0].id }
    }

    const safeLow = [...legalCards].sort((left, right) => {
      if (left.suit === '♠' && right.suit !== '♠') return 1
      if (left.suit !== '♠' && right.suit === '♠') return -1
      return left.value - right.value
    })

    return { type: 'play' as const, playerIndex, cardId: safeLow[0].id }
  }

  const draw = () => {
    const player = players.value[turnIndex.value]
    if (!player?.isAI) return false
    const move = chooseAiMove(turnIndex.value)
    if (!move) return false
    return applyMove(move)
  }

  const nextAiTurn = () => {
    const player = players.value[turnIndex.value]
    if (!player?.isAI) return false
    return draw()
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
        id: 'spades-human',
        name: 'Vous',
        isAI: false,
        hand: [],
        bid: 0,
        tricksWon: 0,
        score: 0,
      },
      {
        id: 'spades-ai-east',
        name: 'IA Est',
        isAI: true,
        hand: [],
        bid: 0,
        tricksWon: 0,
        score: 0,
      },
      {
        id: 'spades-ai-north',
        name: 'IA Nord',
        isAI: true,
        hand: [],
        bid: 0,
        tricksWon: 0,
        score: 0,
      },
      {
        id: 'spades-ai-west',
        name: 'IA Ouest',
        isAI: true,
        hand: [],
        bid: 0,
        tricksWon: 0,
        score: 0,
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
      player.bid = assignBid(player.hand)
    })

    turnIndex.value = 0
    leaderIndex.value = 0
    trick.value = []
    spadesBroken.value = false
    history.value = []
    message.value = 'Main Spades distribuée (enchères auto).'
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
    handNumber,
    spadesBroken,
    message,
    isHandOver,
    canPlayCard,
    getValidMoves,
    applyMove,
    chooseAiMove,
    draw,
    nextAiTurn,
    undo,
    startNewHand,
  }
}
