<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch, watchEffect } from 'vue'
import CardTableLayout from './CardTableLayout.vue'
import type { GameAsidePanelState } from './types'
import {
  type UnoCard,
  type UnoColor,
  useUnoEngine,
} from '~/composables/games/useUnoEngine'
import { useGameFeedback } from '~/composables/games/useGameFeedback'

const props = defineProps<{
  selectedPlayMode: 'ai' | 'pvp'
}>()

const emit = defineEmits<{
  (event: 'panel-state', payload: GameAsidePanelState): void
  (event: 'game-finished', payload: { result: 'win' | 'lose' }): void
}>()

const TURN_SECONDS = 20
const COLOR_ORDER: UnoColor[] = ['red', 'yellow', 'green', 'blue']

const {
  players,
  roundState,
  playableCards,
  message,
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
} = useUnoEngine({
  playerCount: 4,
  includeHumanPlayer: true,
  scoreTarget: 500,
})

const timer = ref(TURN_SECONDS)
const autoUnoEnabled = ref(true)
const isColorDialogOpen = ref(false)
const pendingWildCardId = ref<string | null>(null)
const playedCardPulseId = ref<string | null>(null)
const drawPulse = ref(false)
const gameFinishedEmitted = ref(false)
const { playUiSound, triggerVisualFeedback } = useGameFeedback()

let timerInterval: ReturnType<typeof setInterval> | null = null
let aiTimeout: ReturnType<typeof setTimeout> | null = null
let pulseTimeout: ReturnType<typeof setTimeout> | null = null

const isColorChoiceRequired = computed(() =>
  getValidMoves(roundState.value.currentPlayerIndex).some(
    (move) => move.type === 'choose-color',
  ),
)

const localPlayer = computed(() => players.value[0] ?? null)
const currentPlayer = computed(
  () => players.value[roundState.value.currentPlayerIndex] ?? null,
)
const isLocalTurn = computed(() => roundState.value.currentPlayerIndex === 0)
const playableCardIds = computed(
  () => new Set(playableCards.value.map((card) => card.id)),
)

const tablePlayers = computed(() =>
  players.value.map((player, index) => ({
    id: player.id,
    name: player.name,
    isAI: props.selectedPlayMode === 'ai' ? player.isAI : false,
    handCount: player.hand.length,
    isCurrentTurn: roundState.value.currentPlayerIndex === index,
    timerSeconds:
      roundState.value.currentPlayerIndex === index ? timer.value : undefined,
  })),
)

const colorLabelMap: Record<UnoColor, string> = {
  red: 'Rouge',
  yellow: 'Jaune',
  green: 'Vert',
  blue: 'Bleu',
}

const colorBadgeClass = computed(
  () => `uno-color-badge--${roundState.value.currentColor}`,
)
const directionLabel = computed(() =>
  roundState.value.direction === 1 ? 'Horaire' : 'Anti-horaire',
)
const discardTopCard = computed(() => roundState.value.discardPileTop)
const activeEffectLabel = computed(() => {
  const top = discardTopCard.value
  if (!top) return 'Aucun'

  if (top.value === 'draw-two') return '+2 actif'
  if (top.value === 'wild-draw-four') return '+4 actif'
  if (top.value === 'skip') return 'Skip actif'
  if (top.value === 'reverse') return 'Reverse actif'
  return 'Aucun'
})

const canLocalDraw = computed(
  () =>
    isLocalTurn.value &&
    !roundWinnerIndex.value &&
    !gameWinnerIndex.value &&
    !isColorChoiceRequired.value,
)
const canCallUno = computed(
  () =>
    isLocalTurn.value &&
    localPlayer.value?.hand.length === 1 &&
    !localPlayer.value?.hasCalledUno,
)
const canRestartRound = computed(
  () => roundWinnerIndex.value !== null || gameWinnerIndex.value !== null,
)
const canResolveColorChoice = computed(
  () => isColorChoiceRequired.value && isLocalTurn.value,
)
const primaryRoundAction = computed(() => ({
  id: gameWinnerIndex.value !== null ? 'play-again' : 'new-round',
  label: gameWinnerIndex.value !== null ? 'Rejouer' : 'Nouvelle manche',
}))

const statusText = computed(() => {
  if (gameWinnerIndex.value !== null) {
    return `${players.value[gameWinnerIndex.value]?.name ?? 'Un joueur'} gagne la partie (${scoreTarget} pts).`
  }

  if (roundWinnerIndex.value !== null) {
    return `${players.value[roundWinnerIndex.value]?.name ?? 'Un joueur'} gagne la manche.`
  }

  return message.value
})

const panelState = computed<GameAsidePanelState>(() => ({
  gameKey: 'uno',
  title: 'UNO',
  phase: `Manche ${currentRound.value}`,
  turnLabel: currentPlayer.value?.name ?? '—',
  status: statusText.value,
  kpis: [
    {
      id: 'timer',
      label: 'Timer',
      value: `${timer.value}s`,
      color: 'primary',
      variant: 'tonal',
    },
    {
      id: 'draw',
      label: 'Pioche',
      value: roundState.value.drawPileCount,
      variant: 'outlined',
    },
    {
      id: 'direction',
      label: 'Sens',
      value: directionLabel.value,
      variant: 'outlined',
    },
  ],
  highlights: [
    `Couleur active: ${colorLabelMap[roundState.value.currentColor]}`,
    `Effet: ${activeEffectLabel.value}`,
  ],
}))

const tableActions = computed(() => [
  {
    id: 'draw',
    label: 'Piocher',
    disabled: !canLocalDraw.value,
    icon: 'mdi-cards-playing-outline',
  },
  {
    id: 'call-uno',
    label: 'UNO',
    disabled: !canCallUno.value,
    icon: 'mdi-bullhorn',
  },
  {
    id: primaryRoundAction.value.id,
    label: primaryRoundAction.value.label,
    disabled: !canRestartRound.value,
    icon: 'mdi-refresh',
  },
  {
    id: 'choose-color-auto',
    label: 'Couleur auto',
    disabled: !canResolveColorChoice.value,
    icon: 'mdi-palette-outline',
  },
])

const cardValueLabel = (value: UnoCard['value']) => {
  if (value === 'draw-two') return '+2'
  if (value === 'wild-draw-four') return 'W+4'
  if (value === 'wild') return 'Wild'
  if (value === 'reverse') return '⟲'
  if (value === 'skip') return '⏭'
  return value
}

const cardColorClass = (card: UnoCard) =>
  card.color ? `uno-card--${card.color}` : 'uno-card--wild'

const isCardPlayableForLocal = (card: UnoCard) =>
  isLocalTurn.value &&
  playableCardIds.value.has(card.id) &&
  !isColorChoiceRequired.value

const chooseRandomColor = (): UnoColor => {
  const hand = players.value[roundState.value.currentPlayerIndex]?.hand ?? []
  const coloredCards = hand.filter((card) => card.color) as Array<
    UnoCard & { color: UnoColor }
  >

  if (!coloredCards.length) {
    return COLOR_ORDER[Math.floor(Math.random() * COLOR_ORDER.length)]
  }

  const counts = COLOR_ORDER.map((color) => ({
    color,
    total: coloredCards.filter((card) => card.color === color).length,
  })).sort((a, b) => b.total - a.total)

  return counts[0]?.color ?? 'red'
}

const startPulse = (type: 'play' | 'draw') => {
  if (pulseTimeout) clearTimeout(pulseTimeout)

  if (type === 'play') {
    playedCardPulseId.value = discardTopCard.value?.id ?? null
  } else {
    drawPulse.value = true
  }

  pulseTimeout = setTimeout(() => {
    playedCardPulseId.value = null
    drawPulse.value = false
  }, 280)
}

const runAiTurn = () => {
  if (props.selectedPlayMode !== 'ai') return
  const index = roundState.value.currentPlayerIndex
  const aiPlayer = players.value[index]

  if (
    !aiPlayer?.isAI ||
    roundWinnerIndex.value !== null ||
    gameWinnerIndex.value !== null
  ) {
    return
  }

  if (aiTimeout) clearTimeout(aiTimeout)
  aiTimeout = setTimeout(() => {
    if (isColorChoiceRequired.value) {
      chooseColor(chooseRandomColor())
      return
    }

    const move = getValidMoves(index).find(
      (candidate) => candidate.type === 'play',
    )
    if (move?.cardId) {
      playCard(index, move.cardId)
      startPulse('play')
      const aiAfterPlay = players.value[index]
      if (aiAfterPlay?.hand.length === 1) {
        callUno(index)
      }
      return
    }

    drawCard(index)
    startPulse('draw')
  }, 650)
}

const handleCardClick = (card: UnoCard) => {
  if (!isCardPlayableForLocal(card)) return

  const success = playCard(0, card.id)
  if (!success) return

  startPulse('play')

  if (card.value === 'wild' || card.value === 'wild-draw-four') {
    pendingWildCardId.value = card.id
    isColorDialogOpen.value = true
  }
}

const handleDrawCard = () => {
  if (!canLocalDraw.value) return
  drawCard(0)
  startPulse('draw')
}

const handleCallUno = () => {
  if (!canCallUno.value) return
  callUno(0)
}

const handleChooseColor = (color: UnoColor) => {
  chooseColor(color)
  isColorDialogOpen.value = false
  pendingWildCardId.value = null
}

const restartRound = () => {
  if (gameWinnerIndex.value !== null) {
    startRound()
    return
  }

  if (roundWinnerIndex.value !== null) {
    startNextRound()
    return
  }

  startRound()
}

const handleTurnTimeout = () => {
  if (roundWinnerIndex.value !== null || gameWinnerIndex.value !== null) return

  if (isColorChoiceRequired.value) {
    chooseColor(chooseRandomColor())
    return
  }

  if (isLocalTurn.value) {
    drawCard(0)
    startPulse('draw')
    return
  }

  runAiTurn()
}

const resetTimer = () => {
  timer.value = TURN_SECONDS
}

const startTurnTimer = () => {
  if (timerInterval) clearInterval(timerInterval)
  timerInterval = setInterval(() => {
    if (roundWinnerIndex.value !== null || gameWinnerIndex.value !== null)
      return

    timer.value = Math.max(0, timer.value - 1)
    if (timer.value === 0) {
      handleTurnTimeout()
      resetTimer()
    }
  }, 1000)
}

const handleAsideAction = (actionId: string) => {
  playUiSound('confirm')
  triggerVisualFeedback('game-surface', 'pulse')

  if (actionId === 'call-uno') {
    handleCallUno()
    return
  }

  if (actionId === 'draw') {
    handleDrawCard()
    return
  }

  if (actionId === 'play-again' || actionId === 'new-round') {
    restartRound()
    return
  }

  if (actionId === 'choose-color-auto' && canResolveColorChoice.value) {
    handleChooseColor(chooseRandomColor())
  }
}

watchEffect(() => {
  emit('panel-state', panelState.value)
})

watch(
  () => roundState.value.currentPlayerIndex,
  () => {
    resetTimer()
    if (!isColorChoiceRequired.value) {
      runAiTurn()
    }
  },
  { immediate: true },
)

watch(
  () => isColorChoiceRequired.value,
  (required) => {
    if (!required) {
      isColorDialogOpen.value = false
      pendingWildCardId.value = null
      return
    }

    if (!isLocalTurn.value) {
      runAiTurn()
    }
  },
)

watch(
  () => [
    localPlayer.value?.hand.length,
    isLocalTurn.value,
    autoUnoEnabled.value,
  ],
  ([handSize, isTurn, autoUno]) => {
    if (!autoUno || !isTurn || handSize !== 1) return
    callUno(0)
  },
)

watch(
  () => discardTopCard.value?.id,
  (nextId, prevId) => {
    if (nextId && nextId !== prevId) {
      playedCardPulseId.value = nextId
    }
  },
)

watch(gameWinnerIndex, (winnerIndex) => {
  if (winnerIndex === null) {
    gameFinishedEmitted.value = false
    return
  }

  if (gameFinishedEmitted.value) {
    return
  }

  gameFinishedEmitted.value = true
  playUiSound(winnerIndex === 0 ? 'win' : 'lose')
  triggerVisualFeedback(
    'game-surface',
    winnerIndex === 0 ? 'glow' : 'shake',
    620,
  )
  emit('game-finished', { result: winnerIndex === 0 ? 'win' : 'lose' })
})

startTurnTimer()

onBeforeUnmount(() => {
  if (timerInterval) clearInterval(timerInterval)
  if (aiTimeout) clearTimeout(aiTimeout)
  if (pulseTimeout) clearTimeout(pulseTimeout)
})

defineExpose({
  handleAsideAction,
})
</script>

<template>
  <CardTableLayout
    :players="tablePlayers"
    :turn-timer-seconds="TURN_SECONDS"
    table-theme="uno"
  >
    <template #center>
      <div class="uno-center">
        <div class="uno-pile" :class="{ 'is-pulsing': drawPulse }">
          <div class="uno-pile__card-back">UNO</div>
          <p class="text-caption mb-0">
            Pioche: {{ roundState.drawPileCount }}
          </p>
        </div>

        <div
          class="uno-discard"
          :class="{ 'is-pulsing': playedCardPulseId === discardTopCard?.id }"
        >
          <template v-if="discardTopCard">
            <div :class="['uno-card', cardColorClass(discardTopCard)]">
              <span class="uno-card__value">{{
                cardValueLabel(discardTopCard.value)
              }}</span>
            </div>
          </template>
          <div v-else class="uno-card uno-card--empty">—</div>
          <p class="text-caption mb-0">Défausse</p>
        </div>

        <div class="uno-state-column">
          <v-chip
            size="small"
            :class="['uno-color-badge', colorBadgeClass]"
            variant="flat"
          >
            Couleur: {{ colorLabelMap[roundState.currentColor] }}
          </v-chip>
          <v-chip size="small" color="warning" variant="tonal">
            {{ activeEffectLabel }}
          </v-chip>
        </div>
      </div>
    </template>

    <template #seat-south-hand>
      <div class="uno-local-hand">
        <TransitionGroup
          name="hand-card"
          tag="div"
          class="uno-local-hand__cards"
        >
          <button
            v-for="card in localPlayer?.hand ?? []"
            :key="card.id"
            type="button"
            :class="[
              'uno-card',
              cardColorClass(card),
              {
                'uno-card--playable': isCardPlayableForLocal(card),
                'uno-card--disabled': !isCardPlayableForLocal(card),
              },
            ]"
            @click="handleCardClick(card)"
          >
            <span class="uno-card__value">{{
              cardValueLabel(card.value)
            }}</span>
          </button>
        </TransitionGroup>

        <div class="uno-local-hand__actions">
          <v-btn
            v-for="action in tableActions"
            :key="`uno-action-${action.id}`"
            size="small"
            color="primary"
            :variant="action.id === 'call-uno' ? 'outlined' : 'flat'"
            :prepend-icon="action.icon"
            :disabled="action.disabled"
            @click="handleAsideAction(action.id)"
          >
            {{ action.label }}
          </v-btn>
          <v-switch
            v-model="autoUnoEnabled"
            hide-details
            inset
            color="success"
            label="UNO auto"
          />
        </div>
      </div>
    </template>

    <template #seat-north-hand>
      <div class="uno-opponent-hand">
        {{ players[1]?.hand.length ?? 0 }} cartes
      </div>
    </template>
    <template #seat-east-hand>
      <div class="uno-opponent-hand uno-opponent-hand--vertical">
        {{ players[2]?.hand.length ?? 0 }}
      </div>
    </template>
    <template #seat-west-hand>
      <div class="uno-opponent-hand uno-opponent-hand--vertical">
        {{ players[3]?.hand.length ?? 0 }}
      </div>
    </template>
  </CardTableLayout>

  <v-dialog v-model="isColorDialogOpen" max-width="360" persistent>
    <v-card class="pa-4 rounded-xl">
      <h4 class="text-subtitle-1 font-weight-bold mb-2">Choisir une couleur</h4>
      <p class="text-caption text-medium-emphasis mb-4">
        Wild joué{{ pendingWildCardId ? '' : ' (auto)' }} : sélectionnez la
        couleur active.
      </p>
      <div class="d-grid ga-2">
        <v-btn
          v-for="color in COLOR_ORDER"
          :key="`choose-color-${color}`"
          :class="`uno-color-button uno-color-button--${color}`"
          variant="flat"
          @click="handleChooseColor(color)"
        >
          {{ colorLabelMap[color] }}
        </v-btn>
      </div>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.uno-center {
  --uno-card-width: clamp(62px, 7vw, 82px);
  --uno-card-height: calc(var(--uno-card-width) * 1.44);
  --uno-card-radius: clamp(10px, 1.2vw, 14px);
  display: grid;
  grid-template-columns: minmax(104px, 1fr) minmax(110px, 1fr) minmax(
      124px,
      1fr
    );
  gap: clamp(10px, 2vw, 18px);
  width: 100%;
  align-items: center;
}

.uno-pile,
.uno-discard {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.uno-pile__card-back,
.uno-card {
  width: var(--uno-card-width);
  height: var(--uno-card-height);
  border-radius: var(--uno-card-radius);
  display: grid;
  place-items: center;
  border: 2px solid rgba(255, 255, 255, 0.7);
  box-shadow: 0 8px 14px rgba(0, 0, 0, 0.22);
  color: #fff;
  font-weight: 800;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
}

.uno-pile__card-back {
  background: linear-gradient(145deg, #10294f, #0d1531);
}

.uno-card {
  transition:
    transform 160ms ease,
    box-shadow 160ms ease,
    filter 160ms ease;
}

.uno-card--red {
  background: #d63939;
}
.uno-card--yellow {
  background: #e2b21f;
  color: #222;
}
.uno-card--green {
  background: #329553;
}
.uno-card--blue {
  background: #2d63c8;
}
.uno-card--wild {
  background: conic-gradient(#d63939, #e2b21f, #329553, #2d63c8, #d63939);
}

.uno-card__value {
  font-size: clamp(0.95rem, 1.9vw, 1.15rem);
  letter-spacing: 0.02em;
}

.uno-card--empty {
  background: rgba(255, 255, 255, 0.2);
}

.uno-state-column {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.uno-pile .text-caption,
.uno-discard .text-caption,
.uno-state-column :deep(.v-chip__content) {
  white-space: nowrap;
}

.uno-color-badge {
  color: #fff !important;
}
.uno-color-badge--red {
  background: #d63939 !important;
}
.uno-color-badge--yellow {
  background: #e2b21f !important;
  color: #222 !important;
}
.uno-color-badge--green {
  background: #329553 !important;
}
.uno-color-badge--blue {
  background: #2d63c8 !important;
}

.uno-local-hand {
  display: grid;
  gap: 10px;
  position: relative;
  width: min(100%, 980px);
  margin-inline: auto;
  padding-top: 10px;
}

.uno-local-hand__cards {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 4px 10px 8px;
}

.uno-local-hand__actions {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(8, 25, 42, 0.6);
  backdrop-filter: blur(3px);
  width: fit-content;
  margin-inline: auto;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.26);
}

.uno-local-hand__actions :deep(.v-btn) {
  min-height: 40px;
  padding-inline: 14px;
}

.uno-local-hand__actions :deep(.v-selection-control) {
  min-height: 40px;
}

.uno-card--playable {
  cursor: pointer;
  border-color: rgba(255, 255, 255, 0.96);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.66),
    0 10px 18px rgba(0, 0, 0, 0.35);
}

.uno-card--playable:hover {
  transform: translateY(-5px);
  box-shadow: 0 12px 16px rgba(0, 0, 0, 0.3);
}

.uno-card--disabled {
  filter: grayscale(0.92) brightness(0.72);
  opacity: 0.54;
  border-color: rgba(255, 255, 255, 0.3);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.22);
  cursor: not-allowed;
}

.uno-opponent-hand {
  min-width: 88px;
  padding: 6px 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.18);
  color: #fff;
  text-align: center;
  font-weight: 700;
}

.uno-opponent-hand--vertical {
  writing-mode: vertical-rl;
  text-orientation: mixed;
  min-width: unset;
}

.is-pulsing {
  animation: uno-pulse 260ms ease;
}

.hand-card-enter-active,
.hand-card-leave-active {
  transition: all 180ms ease;
}

.hand-card-enter-from,
.hand-card-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

.uno-color-button {
  color: #fff;
  font-weight: 700;
}

.uno-color-button--red {
  background: #d63939;
}
.uno-color-button--yellow {
  background: #e2b21f;
  color: #222;
}
.uno-color-button--green {
  background: #329553;
}
.uno-color-button--blue {
  background: #2d63c8;
}

@keyframes uno-pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.07);
  }
  100% {
    transform: scale(1);
  }
}

@media (max-width: 960px) {
  .uno-center {
    grid-template-columns: 1fr auto;
    grid-template-areas:
      'pile discard'
      'state state';
    text-align: center;
  }

  .uno-pile {
    grid-area: pile;
  }

  .uno-discard {
    grid-area: discard;
  }

  .uno-state-column {
    grid-area: state;
    flex-direction: row;
    justify-content: center;
    flex-wrap: wrap;
  }
}

@media (max-width: 680px) {
  .uno-center {
    grid-template-columns: 1fr;
    grid-template-areas:
      'pile'
      'discard'
      'state';
    gap: 10px;
  }

  .uno-local-hand {
    gap: 8px;
  }

  .uno-local-hand__actions {
    width: 100%;
    border-radius: 14px;
  }

  .uno-local-hand__actions :deep(.v-btn) {
    min-width: 126px;
  }
}
</style>
