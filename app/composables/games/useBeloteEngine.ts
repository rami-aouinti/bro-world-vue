import { computed, onScopeDispose, ref, type Ref } from 'vue'

export type Suit = '♠' | '♥' | '♦' | '♣'
export type Rank = '7' | '8' | '9' | 'J' | 'Q' | 'K' | '10' | 'A'
export type BeloteMode = 'teams' | 'free-for-all'
export type BelotePlayMode = 'ai' | 'pvp'
export type BeloteRoundPhase = 'distribution' | 'bidding' | 'playing' | 'round-end'

export interface BeloteContract {
  takerIndex: number
  trumpSuit: Suit
  targetPoints: number
}

type ReactiveSource<T> = Ref<T> | (() => T)

export interface Card {
  id: string
  suit: Suit
  rank: Rank
}

interface TrickPlay {
  playerIndex: number
  card: Card
}

interface BelotePlayer {
  id: string
  name: string
  isAI: boolean
  hand: Card[]
}

const TURN_SECONDS = 120
const suits: Suit[] = ['♠', '♥', '♦', '♣']
const ranks: Rank[] = ['7', '8', '9', 'J', 'Q', 'K', '10', 'A']
const ROUND_POINT_TOTAL = 162
const LAST_TRICK_BONUS = 10
const CONTRACT_TARGET = 82

const trumpStrength: Record<Rank, number> = {
  J: 8,
  '9': 7,
  A: 6,
  '10': 5,
  K: 4,
  Q: 3,
  '8': 2,
  '7': 1,
}

const normalStrength: Record<Rank, number> = {
  A: 8,
  '10': 7,
  K: 6,
  Q: 5,
  J: 4,
  '9': 3,
  '8': 2,
  '7': 1,
}

const trumpCardPoints: Record<Rank, number> = {
  J: 20,
  '9': 14,
  A: 11,
  '10': 10,
  K: 4,
  Q: 3,
  '8': 0,
  '7': 0,
}

const normalCardPoints: Record<Rank, number> = {
  A: 11,
  '10': 10,
  K: 4,
  Q: 3,
  J: 2,
  '9': 0,
  '8': 0,
  '7': 0,
}

const resolveSource = <T,>(source: ReactiveSource<T>) => (typeof source === 'function' ? source() : source.value)

const createPlayerTemplates = (playMode: BelotePlayMode): Omit<BelotePlayer, 'hand'>[] => {
  if (playMode === 'pvp') {
    return [
      { id: 'player-1', name: 'Joueur 1', isAI: false },
      { id: 'player-2', name: 'Joueur 2', isAI: false },
      { id: 'player-3', name: 'Joueur 3', isAI: false },
      { id: 'player-4', name: 'Joueur 4', isAI: false },
    ]
  }

  return [
    { id: 'player', name: 'Vous', isAI: false },
    { id: 'ai-east', name: 'IA Est', isAI: true },
    { id: 'ai-north', name: 'IA Nord', isAI: true },
    { id: 'ai-west', name: 'IA Ouest', isAI: true },
  ]
}

const shuffle = <T,>(items: T[]) => {
  const output = [...items]
  for (let index = output.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    const current = output[index]
    output[index] = output[randomIndex]
    output[randomIndex] = current
  }
  return output
}

const createDeck = (): Card[] => suits.flatMap(suit => ranks.map(rank => ({ id: `${suit}-${rank}`, suit, rank })))

export const useBeloteEngine = (modeSource: ReactiveSource<BeloteMode>, playModeSource: ReactiveSource<BelotePlayMode>) => {
  const initialPlayers = createPlayerTemplates(resolveSource(playModeSource)).map(player => ({ ...player, hand: [] }))

  const players = ref<BelotePlayer[]>(initialPlayers)
  const phase = ref<BeloteRoundPhase>('distribution')
  const expectedAction = ref('distribution')
  const trumpSuit = ref<Suit>('♠')
  const contract = ref<BeloteContract | null>(null)
  const trick = ref<TrickPlay[]>([])
  const trickLeaderIndex = ref(0)
  const turnIndex = ref(0)
  const trickCount = ref(0)
  const message = ref('Distribution de la nouvelle manche…')
  const roundOver = ref(false)
  const roundResult = ref('')
  const roundPlayerScores = ref<number[]>([0, 0, 0, 0])
  const roundTeamScores = ref({ teamA: 0, teamB: 0 })
  const totalPlayerScores = ref<number[]>([0, 0, 0, 0])
  const totalTeamScores = ref({ teamA: 0, teamB: 0 })
  const timerSeconds = ref(TURN_SECONDS)

  let timerInterval: ReturnType<typeof setInterval> | null = null
  let aiTimeout: ReturnType<typeof setTimeout> | null = null

  const resetTurnTimer = () => {
    timerSeconds.value = TURN_SECONDS
  }

  const isSameTeam = (playerA: number, playerB: number) => {
    if (resolveSource(modeSource) !== 'teams') return false
    return playerA % 2 === playerB % 2
  }

  const getCardPoints = (card: Card) => (card.suit === trumpSuit.value ? trumpCardPoints[card.rank] : normalCardPoints[card.rank])

  const compareCards = (left: Card, right: Card, leadSuit: Suit) => {
    const leftTrump = left.suit === trumpSuit.value
    const rightTrump = right.suit === trumpSuit.value

    if (leftTrump && rightTrump) return trumpStrength[left.rank] - trumpStrength[right.rank]
    if (leftTrump) return 1
    if (rightTrump) return -1

    const leftLead = left.suit === leadSuit
    const rightLead = right.suit === leadSuit

    if (leftLead && rightLead) return normalStrength[left.rank] - normalStrength[right.rank]
    if (leftLead) return 1
    if (rightLead) return -1

    return 0
  }

  const getTrickWinningPlay = () => {
    const leadSuit = trick.value[0]?.card.suit
    if (!leadSuit || trick.value.length === 0) return null
    return trick.value.reduce((best, current) => (compareCards(current.card, best.card, leadSuit) > 0 ? current : best))
  }

  const getValidCards = (playerIndex: number) => {
    const player = players.value[playerIndex]
    const leadSuit = trick.value[0]?.card.suit

    if (!player) return []
    if (!leadSuit) return player.hand

    const sameSuitCards = player.hand.filter(card => card.suit === leadSuit)
    const winningPlay = getTrickWinningPlay()

    if (sameSuitCards.length) {
      if (leadSuit === trumpSuit.value && winningPlay) {
        const higherTrumpCards = sameSuitCards.filter(card => trumpStrength[card.rank] > trumpStrength[winningPlay.card.rank])
        if (higherTrumpCards.length) {
          return higherTrumpCards
        }
      }
      return sameSuitCards
    }

    const trumpCards = player.hand.filter(card => card.suit === trumpSuit.value)
    if (!trumpCards.length) return player.hand

    const partnerWinning = Boolean(
      winningPlay && resolveSource(modeSource) === 'teams' && isSameTeam(playerIndex, winningPlay.playerIndex),
    )

    if (partnerWinning) {
      return player.hand
    }

    const currentHighestTrump = trick.value
      .filter(play => play.card.suit === trumpSuit.value)
      .map(play => play.card)
      .sort((left, right) => trumpStrength[right.rank] - trumpStrength[left.rank])[0]

    if (!currentHighestTrump) return trumpCards

    const higherTrumps = trumpCards.filter(card => trumpStrength[card.rank] > trumpStrength[currentHighestTrump.rank])
    if (higherTrumps.length) return higherTrumps

    return trumpCards
  }

  const evaluateSuitStrength = (hand: Card[], suit: Suit) => hand
    .filter(card => card.suit === suit)
    .reduce((score, card) => score + (suit === trumpSuit.value ? trumpCardPoints[card.rank] : normalCardPoints[card.rank]), 0)

  const chooseContract = () => {
    const bids = players.value.map((player, index) => {
      const bestSuit = suits
        .map(suit => ({ suit, value: evaluateSuitStrength(player.hand, suit) }))
        .sort((a, b) => b.value - a.value)[0]

      return {
        takerIndex: index,
        trumpSuit: bestSuit.suit,
        value: bestSuit.value,
      }
    }).sort((a, b) => b.value - a.value)

    const bestBid = bids[0]
    contract.value = {
      takerIndex: bestBid.takerIndex,
      trumpSuit: bestBid.trumpSuit,
      targetPoints: CONTRACT_TARGET,
    }
    trumpSuit.value = bestBid.trumpSuit
  }

  const startTurnTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval)
    }

    timerInterval = setInterval(() => {
      if (roundOver.value || phase.value !== 'playing') return

      timerSeconds.value = Math.max(0, timerSeconds.value - 1)

      if (timerSeconds.value > 0) return

      const activePlayer = players.value[turnIndex.value]
      if (!activePlayer || activePlayer.isAI) {
        resetTurnTimer()
        return
      }

      const forcedCard = getValidCards(turnIndex.value).at(0)
      if (forcedCard) {
        playCard(turnIndex.value, forcedCard.id)
      }
    }, 1000)
  }

  const finalizeRound = () => {
    if (!contract.value) return

    phase.value = 'round-end'
    expectedAction.value = 'new-round'
    roundOver.value = true

    const contractorIndex = contract.value.takerIndex
    const contractorTeamA = contractorIndex % 2 === 0
    let takerPoints = 0
    let defensePoints = 0

    if (resolveSource(modeSource) === 'teams') {
      takerPoints = contractorTeamA ? roundTeamScores.value.teamA : roundTeamScores.value.teamB
      defensePoints = contractorTeamA ? roundTeamScores.value.teamB : roundTeamScores.value.teamA
    }
    else {
      takerPoints = roundPlayerScores.value[contractorIndex]
      defensePoints = roundPlayerScores.value.reduce((sum, score, index) => sum + (index === contractorIndex ? 0 : score), 0)
    }

    const contractMade = takerPoints >= contract.value.targetPoints

    if (resolveSource(modeSource) === 'teams') {
      if (contractMade) {
        totalTeamScores.value.teamA += roundTeamScores.value.teamA
        totalTeamScores.value.teamB += roundTeamScores.value.teamB
      }
      else if (contractorTeamA) {
        totalTeamScores.value.teamB += ROUND_POINT_TOTAL + LAST_TRICK_BONUS
        roundTeamScores.value = { teamA: 0, teamB: ROUND_POINT_TOTAL + LAST_TRICK_BONUS }
      }
      else {
        totalTeamScores.value.teamA += ROUND_POINT_TOTAL + LAST_TRICK_BONUS
        roundTeamScores.value = { teamA: ROUND_POINT_TOTAL + LAST_TRICK_BONUS, teamB: 0 }
      }
    }
    else {
      if (contractMade) {
        totalPlayerScores.value = totalPlayerScores.value.map((total, index) => total + roundPlayerScores.value[index])
      }
      else {
        const defenseShare = Math.floor((ROUND_POINT_TOTAL + LAST_TRICK_BONUS) / 3)
        totalPlayerScores.value = totalPlayerScores.value.map((total, index) => {
          if (index === contractorIndex) return total
          return total + defenseShare
        })

        roundPlayerScores.value = roundPlayerScores.value.map((_, index) => (index === contractorIndex ? 0 : defenseShare))
      }
    }

    roundResult.value = contractMade
      ? `Contrat réussi par ${players.value[contractorIndex].name} (${takerPoints}/${contract.value.targetPoints}).`
      : `Contrat chuté pour ${players.value[contractorIndex].name} (${takerPoints}/${contract.value.targetPoints}), défense à ${defensePoints}.`

    message.value = roundResult.value
  }

  const resolveTrick = () => {
    const leadSuit = trick.value[0]?.card.suit
    if (!leadSuit || trick.value.length !== 4) return

    const winner = trick.value.reduce((best, current) => (compareCards(current.card, best.card, leadSuit) > 0 ? current : best))
    const points = trick.value.reduce((sum, play) => sum + getCardPoints(play.card), 0)
    const withLastTrickBonus = trickCount.value === 7 ? points + LAST_TRICK_BONUS : points

    if (resolveSource(modeSource) === 'teams') {
      if (winner.playerIndex % 2 === 0) {
        roundTeamScores.value.teamA += withLastTrickBonus
      }
      else {
        roundTeamScores.value.teamB += withLastTrickBonus
      }
    }
    else {
      roundPlayerScores.value[winner.playerIndex] += withLastTrickBonus
    }

    message.value = `${players.value[winner.playerIndex].name} remporte le pli (+${withLastTrickBonus}).`
    trickCount.value += 1
    trickLeaderIndex.value = winner.playerIndex
    turnIndex.value = winner.playerIndex

    if (trickCount.value >= 8) {
      finalizeRound()
      return
    }

    setTimeout(() => {
      trick.value = []
      expectedAction.value = 'play-card'
      resetTurnTimer()
      processAiTurns()
    }, 900)
  }

  const playCard = (playerIndex: number, cardId: string) => {
    const player = players.value[playerIndex]
    if (!player || roundOver.value || phase.value !== 'playing' || playerIndex !== turnIndex.value) return false

    const hand = player.hand
    const card = hand.find(entry => entry.id === cardId)
    if (!card) return false

    const validCards = getValidCards(playerIndex)
    if (!validCards.some(entry => entry.id === card.id)) return false

    players.value[playerIndex].hand = hand.filter(entry => entry.id !== card.id)
    trick.value.push({ playerIndex, card })

    if (trick.value.length === 4) {
      expectedAction.value = 'resolve-trick'
      resolveTrick()
      return true
    }

    turnIndex.value = (turnIndex.value + 1) % players.value.length
    expectedAction.value = 'play-card'
    resetTurnTimer()
    processAiTurns()
    return true
  }

  const aiPickCard = (playerIndex: number) => {
    const validCards = getValidCards(playerIndex)
    const leadSuit = trick.value[0]?.card.suit

    if (!validCards.length) return null

    if (!leadSuit) {
      return [...validCards].sort((a, b) => getCardPoints(b) - getCardPoints(a))[0]
    }

    const currentlyWinning = getTrickWinningPlay()
    const winningCards = validCards.filter(card => {
      if (!currentlyWinning) return true
      return compareCards(card, currentlyWinning.card, leadSuit) > 0
    })

    if (winningCards.length) {
      return [...winningCards].sort((a, b) => getCardPoints(a) - getCardPoints(b))[0]
    }

    return [...validCards].sort((a, b) => getCardPoints(a) - getCardPoints(b))[0]
  }

  const processAiTurns = () => {
    if (roundOver.value || phase.value !== 'playing') return

    if (aiTimeout) {
      clearTimeout(aiTimeout)
      aiTimeout = null
    }

    const activePlayer = players.value[turnIndex.value]
    if (!activePlayer?.isAI) return

    aiTimeout = setTimeout(() => {
      const currentPlayer = players.value[turnIndex.value]
      if (!currentPlayer?.isAI) return

      const chosenCard = aiPickCard(turnIndex.value)
      if (chosenCard) {
        playCard(turnIndex.value, chosenCard.id)
      }
    }, 550)
  }

  const beginBidding = () => {
    phase.value = 'bidding'
    expectedAction.value = 'choose-trump'
    message.value = 'Phase de prise d’atout…'

    chooseContract()

    if (contract.value) {
      message.value = `${players.value[contract.value.takerIndex].name} prend à ${contract.value.trumpSuit} (objectif ${contract.value.targetPoints}).`
    }

    phase.value = 'playing'
    expectedAction.value = 'play-card'
    trickLeaderIndex.value = contract.value?.takerIndex ?? 0
    turnIndex.value = trickLeaderIndex.value
    resetTurnTimer()
    processAiTurns()
  }

  const restartRound = () => {
    phase.value = 'distribution'
    expectedAction.value = 'deal'

    const freshDeck = shuffle(createDeck())
    const playerTemplates = createPlayerTemplates(resolveSource(playModeSource))

    players.value = playerTemplates.map((template, index) => ({
      ...template,
      hand: freshDeck.slice(index * 8, (index + 1) * 8),
    }))

    contract.value = null
    trick.value = []
    trickCount.value = 0
    trickLeaderIndex.value = 0
    turnIndex.value = 0
    roundOver.value = false
    roundResult.value = ''
    message.value = 'Nouvelle manche distribuée.'
    roundPlayerScores.value = [0, 0, 0, 0]
    roundTeamScores.value = { teamA: 0, teamB: 0 }
    resetTurnTimer()

    setTimeout(() => {
      beginBidding()
    }, 300)
  }

  const humanTurnPlayerIndex = computed(() => {
    const activePlayer = players.value[turnIndex.value]
    if (!activePlayer || activePlayer.isAI || roundOver.value || phase.value !== 'playing') return -1
    return turnIndex.value
  })

  const humanPlayableCards = computed(() => {
    if (humanTurnPlayerIndex.value < 0) return []
    return getValidCards(humanTurnPlayerIndex.value)
  })

  const canHumanPlay = computed(() => humanTurnPlayerIndex.value >= 0)

  restartRound()
  startTurnTimer()

  onScopeDispose(() => {
    if (timerInterval) clearInterval(timerInterval)
    if (aiTimeout) clearTimeout(aiTimeout)
  })

  return {
    TURN_SECONDS,
    phase,
    expectedAction,
    contract,
    players,
    trumpSuit,
    trick,
    trickCount,
    turnIndex,
    trickLeaderIndex,
    timerSeconds,
    message,
    roundOver,
    roundResult,
    playerScores: roundPlayerScores,
    teamScores: roundTeamScores,
    totalPlayerScores,
    totalTeamScores,
    canHumanPlay,
    humanTurnPlayerIndex,
    humanPlayableCards,
    playCard,
    restartRound,
  }
}
