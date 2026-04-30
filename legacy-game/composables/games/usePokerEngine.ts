import { computed, ref } from 'vue'

export type PokerSuit = '♠' | '♥' | '♦' | '♣'
export type PokerRank =
  | 2
  | 3
  | 4
  | 5
  | 6
  | 7
  | 8
  | 9
  | 10
  | 'J'
  | 'Q'
  | 'K'
  | 'A'
export type PokerStreet =
  | 'preflop'
  | 'flop'
  | 'turn'
  | 'river'
  | 'showdown'
  | 'hand-over'
export type PokerAction = 'fold' | 'check' | 'call' | 'raise'

export interface PokerCard {
  id: string
  suit: PokerSuit
  rank: PokerRank
  value: number
}

export interface PokerPlayer {
  id: string
  name: string
  isAI: boolean
  seat: number
  stack: number
  hand: PokerCard[]
  folded: boolean
  allIn: boolean
  currentBet: number
  totalContribution: number
  lastAction: PokerAction | null
  hasActed: boolean
  isEliminated: boolean
}

interface SidePot {
  amount: number
  eligiblePlayerIds: string[]
}

interface RankedHand {
  category: number
  tiebreakers: number[]
  label: string
}

const SUITS: PokerSuit[] = ['♠', '♥', '♦', '♣']
const RANKS: Array<{ rank: PokerRank; value: number }> = [
  { rank: 2, value: 2 },
  { rank: 3, value: 3 },
  { rank: 4, value: 4 },
  { rank: 5, value: 5 },
  { rank: 6, value: 6 },
  { rank: 7, value: 7 },
  { rank: 8, value: 8 },
  { rank: 9, value: 9 },
  { rank: 10, value: 10 },
  { rank: 'J', value: 11 },
  { rank: 'Q', value: 12 },
  { rank: 'K', value: 13 },
  { rank: 'A', value: 14 },
]

const STARTING_STACK = 1000
const SMALL_BLIND = 10
const BIG_BLIND = 20
const PLAYER_COUNT = 6

const compareNumberArrays = (left: number[], right: number[]) => {
  for (let index = 0; index < Math.max(left.length, right.length); index += 1) {
    const l = left[index] ?? 0
    const r = right[index] ?? 0
    if (l > r) return 1
    if (l < r) return -1
  }

  return 0
}

const compareHands = (left: RankedHand, right: RankedHand) => {
  if (left.category > right.category) return 1
  if (left.category < right.category) return -1
  return compareNumberArrays(left.tiebreakers, right.tiebreakers)
}

const formatCard = (card: PokerCard) => `${card.rank}${card.suit}`

const combinationsOfFive = (cards: PokerCard[]) => {
  const output: PokerCard[][] = []
  for (let first = 0; first < cards.length - 4; first += 1) {
    for (let second = first + 1; second < cards.length - 3; second += 1) {
      for (let third = second + 1; third < cards.length - 2; third += 1) {
        for (let fourth = third + 1; fourth < cards.length - 1; fourth += 1) {
          for (let fifth = fourth + 1; fifth < cards.length; fifth += 1) {
            output.push([
              cards[first],
              cards[second],
              cards[third],
              cards[fourth],
              cards[fifth],
            ])
          }
        }
      }
    }
  }
  return output
}

const evaluateFiveCards = (cards: PokerCard[]): RankedHand => {
  const values = cards.map((card) => card.value).sort((a, b) => b - a)
  const suits = cards.map((card) => card.suit)
  const isFlush = suits.every((suit) => suit === suits[0])

  const uniqueValues = Array.from(new Set(values)).sort((a, b) => b - a)
  let straightHigh = 0

  if (uniqueValues.length === 5) {
    const highest = uniqueValues[0]
    const lowest = uniqueValues[4]
    const isSequential = highest - lowest === 4
    if (isSequential) {
      straightHigh = highest
    } else if (
      JSON.stringify(uniqueValues) === JSON.stringify([14, 5, 4, 3, 2])
    ) {
      straightHigh = 5
    }
  }

  const countsByValue = new Map<number, number>()
  values.forEach((value) => {
    countsByValue.set(value, (countsByValue.get(value) ?? 0) + 1)
  })

  const groups = Array.from(countsByValue.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((left, right) => right.count - left.count || right.value - left.value)

  if (isFlush && straightHigh > 0) {
    return {
      category: 8,
      tiebreakers: [straightHigh],
      label: straightHigh === 14 ? 'Royal Flush' : 'Straight Flush',
    }
  }

  if (groups[0].count === 4) {
    return {
      category: 7,
      tiebreakers: [groups[0].value, groups[1].value],
      label: 'Four of a Kind',
    }
  }

  if (groups[0].count === 3 && groups[1].count === 2) {
    return {
      category: 6,
      tiebreakers: [groups[0].value, groups[1].value],
      label: 'Full House',
    }
  }

  if (isFlush) {
    return {
      category: 5,
      tiebreakers: values,
      label: 'Flush',
    }
  }

  if (straightHigh > 0) {
    return {
      category: 4,
      tiebreakers: [straightHigh],
      label: 'Straight',
    }
  }

  if (groups[0].count === 3) {
    const kickers = groups
      .slice(1)
      .map((group) => group.value)
      .sort((a, b) => b - a)
    return {
      category: 3,
      tiebreakers: [groups[0].value, ...kickers],
      label: 'Three of a Kind',
    }
  }

  if (groups[0].count === 2 && groups[1].count === 2) {
    const pairValues = [groups[0].value, groups[1].value].sort((a, b) => b - a)
    const kicker = groups[2].value
    return {
      category: 2,
      tiebreakers: [...pairValues, kicker],
      label: 'Two Pair',
    }
  }

  if (groups[0].count === 2) {
    const kickers = groups
      .slice(1)
      .map((group) => group.value)
      .sort((a, b) => b - a)
    return {
      category: 1,
      tiebreakers: [groups[0].value, ...kickers],
      label: 'Pair',
    }
  }

  return {
    category: 0,
    tiebreakers: values,
    label: 'High Card',
  }
}

const evaluateSevenCards = (cards: PokerCard[]) => {
  const allCombinations = combinationsOfFive(cards)
  let best: RankedHand | null = null

  allCombinations.forEach((combination) => {
    const current = evaluateFiveCards(combination)
    if (!best || compareHands(current, best) > 0) {
      best = current
    }
  })

  return (
    best ?? {
      category: 0,
      tiebreakers: [0],
      label: 'High Card',
    }
  )
}

const shuffle = <T>(cards: T[]) => {
  const output = [...cards]
  for (let index = output.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const current = output[index]
    output[index] = output[randomIndex]
    output[randomIndex] = current
  }

  return output
}

const createDeck = () =>
  shuffle(
    SUITS.flatMap((suit) =>
      RANKS.map(({ rank, value }) => ({
        id: `${suit}-${rank}`,
        rank,
        suit,
        value,
      })),
    ),
  )

const buildSidePots = (players: PokerPlayer[]) => {
  const contributions = players
    .map((player) => ({
      playerId: player.id,
      amount: player.totalContribution,
      canWin: !player.folded,
    }))
    .filter((entry) => entry.amount > 0)

  const uniqueLevels = Array.from(
    new Set(contributions.map((entry) => entry.amount)),
  ).sort((a, b) => a - b)
  const pots: SidePot[] = []
  let previousLevel = 0

  uniqueLevels.forEach((level) => {
    const contesting = contributions.filter((entry) => entry.amount >= level)
    const slice = (level - previousLevel) * contesting.length

    if (slice > 0) {
      pots.push({
        amount: slice,
        eligiblePlayerIds: contesting
          .filter((entry) => entry.canWin)
          .map((entry) => entry.playerId),
      })
    }

    previousLevel = level
  })

  return pots
}

export const usePokerEngine = () => {
  const players = ref<PokerPlayer[]>([])
  const deck = ref<PokerCard[]>([])
  const board = ref<PokerCard[]>([])
  const dealerIndex = ref(-1)
  const currentTurnIndex = ref(0)
  const street = ref<PokerStreet>('preflop')
  const currentBet = ref(0)
  const minRaise = ref(BIG_BLIND)
  const pot = ref(0)
  const sidePots = ref<SidePot[]>([])
  const actionMessage = ref('')
  const showdownSummary = ref<string[]>([])
  const handNumber = ref(0)

  const humanPlayerIndex = 0

  const activePlayers = computed(() =>
    players.value.filter((player) => !player.isEliminated && !player.folded),
  )
  const humanPlayer = computed(() => players.value[humanPlayerIndex])
  const toCall = computed(() => {
    const player = players.value[currentTurnIndex.value]
    if (!player) return 0
    return Math.max(0, currentBet.value - player.currentBet)
  })

  const callAmountForPlayer = (player: PokerPlayer) =>
    Math.min(player.stack, Math.max(0, currentBet.value - player.currentBet))

  const canPlayerAct = (player: PokerPlayer) =>
    !player.folded && !player.allIn && !player.isEliminated

  const nextActiveIndex = (fromIndex: number) => {
    for (let offset = 1; offset <= players.value.length; offset += 1) {
      const index = (fromIndex + offset) % players.value.length
      const player = players.value[index]
      if (player && canPlayerAct(player)) {
        return index
      }
    }

    return fromIndex
  }

  const resetRoundBets = () => {
    players.value.forEach((player) => {
      player.currentBet = 0
      player.hasActed = false
      player.lastAction = null
    })
    currentBet.value = 0
    minRaise.value = BIG_BLIND
  }

  const collectBetsToPot = () => {
    players.value.forEach((player) => {
      if (player.currentBet <= 0) return
      pot.value += player.currentBet
      player.totalContribution += player.currentBet
      player.currentBet = 0
    })
    currentBet.value = 0
  }

  const generatePlayers = () =>
    Array.from({ length: PLAYER_COUNT }, (_, seat) => ({
      id: `seat-${seat}`,
      name: seat === 0 ? 'Vous' : `IA ${seat}`,
      isAI: seat !== 0,
      seat,
      stack: STARTING_STACK,
      hand: [],
      folded: false,
      allIn: false,
      currentBet: 0,
      totalContribution: 0,
      lastAction: null,
      hasActed: false,
      isEliminated: false,
    }))

  const dealPrivateCards = () => {
    for (let round = 0; round < 2; round += 1) {
      players.value.forEach((player) => {
        if (player.isEliminated) return
        const card = deck.value.shift()
        if (card) {
          player.hand.push(card)
        }
      })
    }
  }

  const postBlind = (index: number, amount: number) => {
    const player = players.value[index]
    if (!player || player.isEliminated) return

    const posted = Math.min(player.stack, amount)
    player.stack -= posted
    player.currentBet += posted
    player.hasActed = false

    if (player.stack === 0) {
      player.allIn = true
    }
  }

  const getBlindIndexes = () => {
    const smallBlindIndex = nextActiveIndex(dealerIndex.value)
    const bigBlindIndex = nextActiveIndex(smallBlindIndex)
    return { smallBlindIndex, bigBlindIndex }
  }

  const resolveUncontestedWin = (winner: PokerPlayer) => {
    collectBetsToPot()
    winner.stack += pot.value
    actionMessage.value = `${winner.name} remporte le pot sans abattage (${pot.value}).`
    showdownSummary.value = [actionMessage.value]
    pot.value = 0
    sidePots.value = []
    street.value = 'hand-over'
  }

  const settleShowdown = () => {
    collectBetsToPot()
    sidePots.value = buildSidePots(players.value)

    const nonFolded = players.value.filter(
      (player) => !player.folded && !player.isEliminated,
    )
    const rankings = new Map<string, RankedHand>()
    nonFolded.forEach((player) => {
      rankings.set(
        player.id,
        evaluateSevenCards([...player.hand, ...board.value]),
      )
    })

    const summary: string[] = []

    sidePots.value.forEach((sidePot, index) => {
      const eligible = nonFolded.filter((player) =>
        sidePot.eligiblePlayerIds.includes(player.id),
      )
      if (!eligible.length || sidePot.amount <= 0) return

      let bestPlayer: PokerPlayer | null = null
      let bestHand: RankedHand | null = null
      let winners: PokerPlayer[] = []

      eligible.forEach((player) => {
        const hand = rankings.get(player.id)
        if (!hand) return

        if (!bestHand || compareHands(hand, bestHand) > 0) {
          bestHand = hand
          bestPlayer = player
          winners = [player]
        } else if (compareHands(hand, bestHand) === 0) {
          winners.push(player)
        }
      })

      if (!bestPlayer || !bestHand || !winners.length) return

      const gain = Math.floor(sidePot.amount / winners.length)
      let remainder = sidePot.amount - gain * winners.length

      winners.forEach((winner) => {
        winner.stack += gain
        if (remainder > 0) {
          winner.stack += 1
          remainder -= 1
        }
      })

      summary.push(
        `Pot ${index + 1}: ${winners.map((player) => player.name).join(', ')} (${bestHand.label}) +${sidePot.amount}`,
      )
    })

    nonFolded.forEach((player) => {
      const hand = rankings.get(player.id)
      if (!hand) return
      summary.push(
        `${player.name}: ${formatCard(player.hand[0])} ${formatCard(player.hand[1])} · ${hand.label}`,
      )
    })

    showdownSummary.value = summary
    actionMessage.value = summary[0] ?? 'Abattage terminé.'
    street.value = 'hand-over'
    pot.value = 0
  }

  const allBetsMatched = () =>
    players.value
      .filter((player) => !player.folded && !player.isEliminated)
      .every((player) => player.allIn || player.currentBet === currentBet.value)

  const allPlayersActed = () =>
    players.value
      .filter(
        (player) => !player.folded && !player.isEliminated && !player.allIn,
      )
      .every((player) => player.hasActed)

  const remainingContenders = () =>
    players.value.filter((player) => !player.folded && !player.isEliminated)

  const progressStreet = () => {
    if (remainingContenders().length <= 1) {
      const winner = remainingContenders()[0]
      if (winner) {
        resolveUncontestedWin(winner)
      }
      return true
    }

    const everyoneAllIn = players.value
      .filter((player) => !player.folded && !player.isEliminated)
      .every((player) => player.allIn)

    if (!allBetsMatched() || !allPlayersActed()) {
      return false
    }

    collectBetsToPot()

    if (street.value === 'preflop') {
      board.value.push(...deck.value.splice(0, 3))
      street.value = 'flop'
    } else if (street.value === 'flop') {
      board.value.push(...deck.value.splice(0, 1))
      street.value = 'turn'
    } else if (street.value === 'turn') {
      board.value.push(...deck.value.splice(0, 1))
      street.value = 'river'
    } else if (street.value === 'river') {
      street.value = 'showdown'
      settleShowdown()
      return true
    }

    if (everyoneAllIn) {
      while (board.value.length < 5 && deck.value.length) {
        board.value.push(deck.value.shift() as PokerCard)
      }
      street.value = 'showdown'
      settleShowdown()
      return true
    }

    players.value.forEach((player) => {
      player.currentBet = 0
      player.hasActed = false
      player.lastAction = null
    })
    currentBet.value = 0
    minRaise.value = BIG_BLIND

    currentTurnIndex.value = nextActiveIndex(dealerIndex.value)
    return true
  }

  const applyCall = (player: PokerPlayer) => {
    const callValue = callAmountForPlayer(player)
    if (callValue <= 0) {
      actionMessage.value = 'Aucune mise à suivre.'
      return false
    }

    player.stack -= callValue
    player.currentBet += callValue
    player.hasActed = true
    player.lastAction = 'call'

    if (player.stack === 0) {
      player.allIn = true
    }

    return true
  }

  const applyRaise = (player: PokerPlayer, raiseToTotal: number) => {
    if (raiseToTotal <= currentBet.value) {
      actionMessage.value = 'Relance trop faible.'
      return false
    }

    const minimum = currentBet.value + minRaise.value
    const maxPossible = player.currentBet + player.stack

    if (raiseToTotal < minimum && raiseToTotal !== maxPossible) {
      actionMessage.value = `Relance minimale: ${minimum}.`
      return false
    }

    if (raiseToTotal > maxPossible) {
      actionMessage.value = 'Jetons insuffisants pour cette relance.'
      return false
    }

    const delta = raiseToTotal - player.currentBet
    if (delta > player.stack) {
      actionMessage.value = 'Jetons insuffisants.'
      return false
    }

    player.stack -= delta
    player.currentBet = raiseToTotal
    player.hasActed = true
    player.lastAction = 'raise'

    const raiseSize = raiseToTotal - currentBet.value
    if (raiseSize > 0) {
      minRaise.value = raiseSize
    }

    currentBet.value = Math.max(currentBet.value, player.currentBet)

    if (player.stack === 0) {
      player.allIn = true
    }

    players.value.forEach((entry) => {
      if (entry.id !== player.id && canPlayerAct(entry)) {
        entry.hasActed = false
      }
    })

    return true
  }

  const proceedAfterAction = () => {
    const contenders = remainingContenders()
    if (contenders.length <= 1) {
      const winner = contenders[0]
      if (winner) {
        resolveUncontestedWin(winner)
      }
      return true
    }

    const movedStreet = progressStreet()

    if (street.value === 'hand-over') return
    if (movedStreet) return

    currentTurnIndex.value = nextActiveIndex(currentTurnIndex.value)
  }

  const performAction = (
    playerIndex: number,
    action: PokerAction,
    raiseToTotal?: number,
  ) => {
    const player = players.value[playerIndex]
    if (
      !player ||
      street.value === 'hand-over' ||
      street.value === 'showdown'
    ) {
      return false
    }

    if (playerIndex !== currentTurnIndex.value) {
      actionMessage.value = "Ce n'est pas votre tour."
      return false
    }

    if (!canPlayerAct(player)) {
      actionMessage.value = 'Action impossible pour ce joueur.'
      return false
    }

    const playerToCall = Math.max(0, currentBet.value - player.currentBet)

    if (action === 'fold') {
      player.folded = true
      player.hasActed = true
      player.lastAction = 'fold'
      actionMessage.value = `${player.name} se couche.`
      proceedAfterAction()
      return true
    }

    if (action === 'check') {
      if (playerToCall > 0) {
        actionMessage.value = 'Impossible de check: une mise est en cours.'
        return false
      }

      player.hasActed = true
      player.lastAction = 'check'
      actionMessage.value = `${player.name} check.`
      proceedAfterAction()
      return true
    }

    if (action === 'call') {
      if (playerToCall <= 0) {
        actionMessage.value = 'Aucune mise à suivre.'
        return false
      }

      if (!applyCall(player)) {
        return false
      }

      actionMessage.value = `${player.name} suit ${playerToCall}.`
      proceedAfterAction()
      return true
    }

    if (action === 'raise') {
      if (typeof raiseToTotal !== 'number') {
        actionMessage.value = 'Montant de relance manquant.'
        return false
      }

      if (!applyRaise(player, raiseToTotal)) {
        return false
      }

      actionMessage.value = `${player.name} relance à ${raiseToTotal}.`
      proceedAfterAction()
      return true
    }

    return false
  }

  const getMinimumRaiseToTotal = (playerIndex: number) => {
    const player = players.value[playerIndex]
    if (!player) return currentBet.value
    const minimum = currentBet.value + minRaise.value
    const max = player.currentBet + player.stack
    return Math.min(max, minimum)
  }

  const getMaximumRaiseToTotal = (playerIndex: number) => {
    const player = players.value[playerIndex]
    if (!player) return currentBet.value
    return player.currentBet + player.stack
  }

  const runAiAction = () => {
    const player = players.value[currentTurnIndex.value]
    if (!player || !player.isAI || street.value === 'hand-over') {
      return
    }

    const currentToCall = Math.max(0, currentBet.value - player.currentBet)
    const canCheck = currentToCall === 0
    const canCall = currentToCall > 0 && player.stack > 0

    const random = Math.random()

    if (canCheck && random < 0.75) {
      performAction(currentTurnIndex.value, 'check')
      return
    }

    if (canCall && random < 0.7) {
      performAction(currentTurnIndex.value, 'call')
      return
    }

    const minRaiseToTotal = getMinimumRaiseToTotal(currentTurnIndex.value)
    const maxRaiseToTotal = getMaximumRaiseToTotal(currentTurnIndex.value)

    if (
      player.stack > currentToCall + BIG_BLIND &&
      random > 0.83 &&
      minRaiseToTotal <= maxRaiseToTotal
    ) {
      const spread = Math.max(0, maxRaiseToTotal - minRaiseToTotal)
      const raiseAmount = minRaiseToTotal + Math.floor(spread * Math.random())
      performAction(currentTurnIndex.value, 'raise', raiseAmount)
      return
    }

    if (canCheck) {
      performAction(currentTurnIndex.value, 'check')
      return
    }

    if (canCall && random < 0.92) {
      performAction(currentTurnIndex.value, 'call')
      return
    }

    performAction(currentTurnIndex.value, 'fold')
  }

  const startNewHand = () => {
    if (!players.value.length) {
      players.value = generatePlayers()
    }

    players.value.forEach((player) => {
      if (player.stack <= 0) {
        player.stack = 0
        player.isEliminated = true
      }

      player.hand = []
      player.folded = player.isEliminated
      player.allIn = false
      player.currentBet = 0
      player.totalContribution = 0
      player.lastAction = null
      player.hasActed = false
    })

    const aliveCount = players.value.filter(
      (player) => !player.isEliminated,
    ).length
    if (aliveCount <= 1) {
      actionMessage.value = 'Partie terminée.'
      street.value = 'hand-over'
      return
    }

    handNumber.value += 1
    board.value = []
    pot.value = 0
    sidePots.value = []
    showdownSummary.value = []
    street.value = 'preflop'
    resetRoundBets()

    dealerIndex.value = nextActiveIndex(dealerIndex.value)
    deck.value = createDeck()

    dealPrivateCards()

    const { smallBlindIndex, bigBlindIndex } = getBlindIndexes()
    postBlind(smallBlindIndex, SMALL_BLIND)
    postBlind(bigBlindIndex, BIG_BLIND)
    currentBet.value = Math.max(
      players.value[smallBlindIndex].currentBet,
      players.value[bigBlindIndex].currentBet,
    )

    players.value.forEach((player, index) => {
      player.hasActed =
        index === smallBlindIndex || index === bigBlindIndex ? false : false
    })

    currentTurnIndex.value = nextActiveIndex(bigBlindIndex)
    actionMessage.value = `Main #${handNumber.value}. Blindes: ${SMALL_BLIND}/${BIG_BLIND}.`
  }

  startNewHand()

  return {
    players,
    board,
    dealerIndex,
    currentTurnIndex,
    street,
    currentBet,
    minRaise,
    pot,
    sidePots,
    actionMessage,
    showdownSummary,
    handNumber,
    humanPlayer,
    activePlayers,
    toCall,
    smallBlind: SMALL_BLIND,
    bigBlind: BIG_BLIND,
    formatCard,
    performAction,
    runAiAction,
    getMinimumRaiseToTotal,
    getMaximumRaiseToTotal,
    startNewHand,
  }
}
