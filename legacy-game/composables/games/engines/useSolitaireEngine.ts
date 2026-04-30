import { computed, ref } from 'vue'

export type Suit = '♠' | '♥' | '♦' | '♣'
export type Rank =
  | 'A'
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

export interface Card {
  id: string
  suit: Suit
  rank: Rank
  value: number
  color: 'red' | 'black'
  faceUp: boolean
}

export interface Player {
  id: 'solo-player'
  name: string
}

export interface Move {
  type:
    | 'draw'
    | 'recycle-stock'
    | 'waste-to-foundation'
    | 'waste-to-tableau'
    | 'tableau-to-foundation'
    | 'tableau-to-tableau'
  fromPile?: number
  toPile?: number
  cardId?: string
}

interface Snapshot {
  stock: Card[]
  waste: Card[]
  foundations: Card[][]
  tableau: Card[][]
  moves: number
}

const SUITS: Suit[] = ['♠', '♥', '♦', '♣']
const RANKS: Rank[] = [
  'A',
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
]
const FOUNDATION_BY_SUIT: Record<Suit, number> = {
  '♠': 0,
  '♥': 1,
  '♦': 2,
  '♣': 3,
}

const cloneCards = (cards: Card[]) => cards.map((card) => ({ ...card }))
const clonePiles = (piles: Card[][]) => piles.map(cloneCards)

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
      id: `sol-${(index += 1)}`,
      suit,
      rank,
      value: rankIndex + 1,
      color: suit === '♥' || suit === '♦' ? 'red' : 'black',
      faceUp: false,
    })),
  )
}

export const useSolitaireEngine = () => {
  const player = ref<Player>({ id: 'solo-player', name: 'Vous' })
  const stock = ref<Card[]>([])
  const waste = ref<Card[]>([])
  const foundations = ref<Card[][]>([[], [], [], []])
  const tableau = ref<Card[][]>([[], [], [], [], [], [], []])
  const moveCount = ref(0)
  const history = ref<Snapshot[]>([])
  const message = ref('Nouvelle partie de Solitaire.')

  const snapshot = (): Snapshot => ({
    stock: cloneCards(stock.value),
    waste: cloneCards(waste.value),
    foundations: clonePiles(foundations.value),
    tableau: clonePiles(tableau.value),
    moves: moveCount.value,
  })

  const restore = (state: Snapshot) => {
    stock.value = cloneCards(state.stock)
    waste.value = cloneCards(state.waste)
    foundations.value = clonePiles(state.foundations)
    tableau.value = clonePiles(state.tableau)
    moveCount.value = state.moves
  }

  const saveHistory = () => {
    history.value.push(snapshot())
    if (history.value.length > 100) {
      history.value.shift()
    }
  }

  const topTableauCard = (pileIndex: number) => {
    const pile = tableau.value[pileIndex]
    return pile?.[pile.length - 1] ?? null
  }

  const canMoveToFoundation = (card: Card) => {
    const pile = foundations.value[FOUNDATION_BY_SUIT[card.suit]]
    if (!pile.length) return card.rank === 'A'
    return pile[pile.length - 1].value + 1 === card.value
  }

  const canMoveToTableau = (card: Card, toPile: number) => {
    const destination = tableau.value[toPile]
    if (!destination?.length) return card.rank === 'K'
    const top = destination[destination.length - 1]
    return (
      top.faceUp && top.color !== card.color && top.value === card.value + 1
    )
  }

  const revealLastHiddenCard = (pileIndex: number) => {
    const pile = tableau.value[pileIndex]
    if (!pile?.length) return
    const last = pile[pile.length - 1]
    if (!last.faceUp) {
      last.faceUp = true
    }
  }

  const draw = () => {
    if (stock.value.length === 0) {
      if (!waste.value.length) return false
      saveHistory()
      stock.value = waste.value
        .reverse()
        .map((card) => ({ ...card, faceUp: false }))
      waste.value = []
      moveCount.value += 1
      message.value = 'Pioche recyclée.'
      return true
    }

    saveHistory()
    const card = stock.value.pop()
    if (!card) return false
    waste.value.push({ ...card, faceUp: true })
    moveCount.value += 1
    message.value = 'Carte piochée.'
    return true
  }

  const canPlayCard = (move: Move) =>
    getValidMoves().some(
      (validMove) => JSON.stringify(validMove) === JSON.stringify(move),
    )

  const getValidMoves = (): Move[] => {
    const moves: Move[] = []

    if (stock.value.length > 0) {
      moves.push({ type: 'draw' })
    } else if (waste.value.length > 0) {
      moves.push({ type: 'recycle-stock' })
    }

    const wasteTop = waste.value[waste.value.length - 1]
    if (wasteTop) {
      if (canMoveToFoundation(wasteTop)) {
        moves.push({ type: 'waste-to-foundation', cardId: wasteTop.id })
      }

      for (
        let pileIndex = 0;
        pileIndex < tableau.value.length;
        pileIndex += 1
      ) {
        if (canMoveToTableau(wasteTop, pileIndex)) {
          moves.push({
            type: 'waste-to-tableau',
            toPile: pileIndex,
            cardId: wasteTop.id,
          })
        }
      }
    }

    tableau.value.forEach((pile, fromPile) => {
      for (let cardIndex = 0; cardIndex < pile.length; cardIndex += 1) {
        const card = pile[cardIndex]
        if (!card.faceUp) continue

        if (cardIndex === pile.length - 1 && canMoveToFoundation(card)) {
          moves.push({
            type: 'tableau-to-foundation',
            fromPile,
            cardId: card.id,
          })
        }

        for (let toPile = 0; toPile < tableau.value.length; toPile += 1) {
          if (toPile === fromPile) continue
          if (!canMoveToTableau(card, toPile)) continue
          moves.push({
            type: 'tableau-to-tableau',
            fromPile,
            toPile,
            cardId: card.id,
          })
        }
      }
    })

    return moves
  }

  const applyMove = (move: Move) => {
    if (!canPlayCard(move)) return false

    if (move.type === 'draw' || move.type === 'recycle-stock') {
      return draw()
    }

    saveHistory()

    if (move.type === 'waste-to-foundation') {
      const card = waste.value.pop()
      if (!card) return false
      foundations.value[FOUNDATION_BY_SUIT[card.suit]].push(card)
    }

    if (move.type === 'waste-to-tableau') {
      const card = waste.value.pop()
      if (!card || move.toPile === undefined) return false
      tableau.value[move.toPile].push(card)
    }

    if (move.type === 'tableau-to-foundation') {
      if (move.fromPile === undefined) return false
      const pile = tableau.value[move.fromPile]
      const card = pile.pop()
      if (!card) return false
      foundations.value[FOUNDATION_BY_SUIT[card.suit]].push(card)
      revealLastHiddenCard(move.fromPile)
    }

    if (move.type === 'tableau-to-tableau') {
      if (
        move.fromPile === undefined ||
        move.toPile === undefined ||
        !move.cardId
      )
        return false
      const source = tableau.value[move.fromPile]
      const target = tableau.value[move.toPile]
      const startIndex = source.findIndex((card) => card.id === move.cardId)
      if (startIndex < 0) return false
      const movingStack = source.splice(startIndex)
      target.push(...movingStack)
      revealLastHiddenCard(move.fromPile)
    }

    moveCount.value += 1
    message.value = 'Coup joué.'
    return true
  }

  const suggestBestMove = () => {
    const validMoves = getValidMoves()
    const foundationMove = validMoves.find(
      (move) =>
        move.type === 'waste-to-foundation' ||
        move.type === 'tableau-to-foundation',
    )
    if (foundationMove) return foundationMove

    const revealMove = validMoves.find((move) => {
      if (move.type !== 'tableau-to-tableau' || move.fromPile === undefined)
        return false
      const source = tableau.value[move.fromPile]
      return source.some((card) => !card.faceUp)
    })

    return (
      revealMove ??
      validMoves.find((move) => move.type !== 'draw') ??
      validMoves[0] ??
      null
    )
  }

  const autoCompleteFoundations = () => {
    let moved = false
    let keepGoing = true

    while (keepGoing) {
      keepGoing = false
      const move = getValidMoves().find(
        (item) =>
          item.type === 'waste-to-foundation' ||
          item.type === 'tableau-to-foundation',
      )
      if (!move) continue
      const applied = applyMove(move)
      if (applied) {
        moved = true
        keepGoing = true
      }
    }

    if (moved) {
      message.value = 'Auto-complete des fondations effectué.'
    }

    return moved
  }

  const undo = () => {
    const previous = history.value.pop()
    if (!previous) return false
    restore(previous)
    message.value = 'Coup annulé.'
    return true
  }

  const startNewGame = () => {
    const deck = shuffle(createDeck())
    history.value = []
    moveCount.value = 0
    foundations.value = [[], [], [], []]
    tableau.value = [[], [], [], [], [], [], []]
    waste.value = []

    for (let pileIndex = 0; pileIndex < tableau.value.length; pileIndex += 1) {
      for (let count = 0; count <= pileIndex; count += 1) {
        const card = deck.pop()
        if (!card) continue
        card.faceUp = count === pileIndex
        tableau.value[pileIndex].push(card)
      }
    }

    stock.value = deck.map((card) => ({ ...card, faceUp: false }))
    message.value = 'Nouvelle partie distribuée.'
  }

  const isWon = computed(() =>
    foundations.value.every((pile) => pile.length === 13),
  )
  const score = computed(
    () => foundations.value.reduce((sum, pile) => sum + pile.length, 0) * 10,
  )

  startNewGame()

  return {
    player,
    stock,
    waste,
    foundations,
    tableau,
    moveCount,
    score,
    message,
    isWon,
    draw,
    undo,
    canPlayCard,
    getValidMoves,
    applyMove,
    suggestBestMove,
    autoCompleteFoundations,
    startNewGame,
    topTableauCard,
  }
}
