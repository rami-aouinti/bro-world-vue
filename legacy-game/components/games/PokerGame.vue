<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  ref,
  watch,
  watchEffect,
} from 'vue'
import type { PokerCard } from '~/composables/games/usePokerEngine'
import { usePokerEngine } from '~/composables/games/usePokerEngine'
import type { GameAsidePanelState } from './types'
import CardTableLayout from './CardTableLayout.vue'

defineProps<{
  selectedPlayMode: 'ai' | 'pvp'
}>()

const emit = defineEmits<{
  (event: 'panel-state', payload: GameAsidePanelState): void
}>()

const { t } = useI18n()

const engine = usePokerEngine()

let aiTimeout: ReturnType<typeof setTimeout> | null = null

const handNumber = computed(() => engine.handNumber.value)
const street = computed(() => engine.street.value)
const pot = computed(() => engine.pot.value)
const currentBet = computed(() => engine.currentBet.value)
const players = computed(() => engine.players.value)
const humanPlayer = computed(() => engine.humanPlayer.value)
const currentTurnIndex = computed(() => engine.currentTurnIndex.value)
const actionMessage = computed(() => engine.actionMessage.value)

const currentPlayer = computed(() => players.value[currentTurnIndex.value])
const isHumanTurn = computed(
  () => currentPlayer.value?.id === humanPlayer.value?.id,
)
const flyingChips = ref<
  Array<{
    id: number
    fromSeat: number
    amount: number
    count: number
    phase: 'start' | 'end'
  }>
>([])
let chipAnimationId = 0

const tablePlayers = computed(() =>
  players.value.map((player, index) => ({
    id: player.id,
    name: player.name,
    isAI: player.isAI,
    handCount: player.hand.length,
    stack: player.stack,
    currentBet: player.currentBet,
    lastAction: player.lastAction,
    seatIndex: index,
    isCurrentTurn:
      street.value !== 'hand-over' && currentTurnIndex.value === index,
  })),
)

const opponents = computed(() =>
  players.value.filter((player) => player.id !== humanPlayer.value?.id),
)

const revealedBoardCards = computed(() => {
  if (street.value === 'preflop' || street.value === 'hand-over') return 0
  if (street.value === 'flop') return 3
  if (street.value === 'turn') return 4
  return 5
})

const boardCardAnimations = ref<Array<'idle' | 'dealing' | 'flip'>>(
  Array(5).fill('idle'),
)
const boardAnimationTimers: ReturnType<typeof setTimeout>[] = []

const getVisibleCountForStreet = (currentStreet: string) => {
  if (currentStreet === 'preflop' || currentStreet === 'hand-over') return 0
  if (currentStreet === 'flop') return 3
  if (currentStreet === 'turn') return 4
  return 5
}

const clearBoardAnimationTimers = () => {
  boardAnimationTimers.forEach((timer) => clearTimeout(timer))
  boardAnimationTimers.length = 0
}

const resetBoardCardAnimations = () => {
  boardCardAnimations.value = Array(5).fill('idle')
}

const boardSlots = computed(() =>
  Array.from({ length: 5 }, (_, index) => {
    const card = engine.board.value[index]
    const animationState = boardCardAnimations.value[index] ?? 'idle'
    return {
      key: `board-${index}`,
      card,
      isVisible: index < revealedBoardCards.value && Boolean(card),
      animationClasses: {
        'table-card--dealing': animationState === 'dealing',
        'table-card--flip': animationState === 'flip',
      },
    }
  }),
)

const centerCards = computed(() =>
  boardSlots.value
    .filter((slot) => slot.isVisible && slot.card)
    .map((slot) => engine.formatCard(slot.card as PokerCard)),
)

const playerCallAmount = computed(() => {
  const player = humanPlayer.value
  if (!player) return 0
  return Math.min(
    player.stack,
    Math.max(0, currentBet.value - player.currentBet),
  )
})

const canCheck = computed(() => playerCallAmount.value === 0)
const canCall = computed(
  () => playerCallAmount.value > 0 && (humanPlayer.value?.stack ?? 0) > 0,
)
const canRaise = computed(() => {
  const player = humanPlayer.value
  if (!player) return false

  const minimum = engine.getMinimumRaiseToTotal(0)
  const maximum = engine.getMaximumRaiseToTotal(0)
  return minimum <= maximum && maximum > currentBet.value
})

const streetLabel = computed(() => {
  const key = street.value
  return t(`gameComponents.poker.states.${key}`)
})

const panelState = computed<GameAsidePanelState>(() => ({
  gameKey: 'poker',
  title: t('gameComponents.poker.title'),
  phase: streetLabel.value,
  turnLabel: currentPlayer.value?.name ?? '—',
  status: actionMessage.value,
  highlights: [
    `${t('gameComponents.poker.handNumber', { count: handNumber.value })} · ${t('gameComponents.poker.statesLabel')}: ${streetLabel.value}`,
    `${t('gameComponents.poker.pot')}: ${pot.value} · ${t('gameComponents.poker.turn')}: ${currentPlayer.value?.name ?? '—'}`,
  ],
  kpis: [
    {
      id: 'pot',
      label: t('gameComponents.poker.pot'),
      value: pot.value,
      color: 'primary',
      variant: 'flat',
    },
    {
      id: 'current-bet',
      label: t('gameComponents.poker.currentBet'),
      value: currentBet.value,
      variant: 'outlined',
    },
    {
      id: 'street',
      label: t('gameComponents.poker.statesLabel'),
      value: streetLabel.value,
      variant: 'tonal',
    },
  ],
}))

const tableActions = computed(() => [
  {
    id: 'fold',
    label: t('gameComponents.poker.actions.fold'),
    disabled: !isHumanTurn.value || street.value === 'hand-over',
  },
  {
    id: 'check',
    label: t('gameComponents.poker.actions.check'),
    disabled:
      !isHumanTurn.value || !canCheck.value || street.value === 'hand-over',
  },
  {
    id: 'call',
    label:
      `${t('gameComponents.poker.actions.call')} ${canCall.value ? `(${playerCallAmount.value})` : ''}`.trim(),
    disabled:
      !isHumanTurn.value || !canCall.value || street.value === 'hand-over',
  },
  {
    id: 'raise',
    label: t('gameComponents.poker.actions.raise'),
    disabled:
      !isHumanTurn.value || !canRaise.value || street.value === 'hand-over',
  },
  {
    id: 'next-hand',
    label: t('gameComponents.poker.actions.nextHand'),
    disabled: street.value !== 'hand-over',
  },
])

watchEffect(() => {
  emit('panel-state', panelState.value)
})

const handleAsideAction = (actionId: string) => {
  if (actionId === 'next-hand') {
    engine.startNewHand()
    return
  }

  if (!isHumanTurn.value || street.value === 'hand-over') {
    return
  }

  if (actionId === 'fold') {
    engine.performAction(currentTurnIndex.value, 'fold')
    return
  }

  if (actionId === 'check') {
    engine.performAction(currentTurnIndex.value, 'check')
    return
  }

  if (actionId === 'call') {
    engine.performAction(currentTurnIndex.value, 'call')
    return
  }

  if (actionId === 'raise') {
    const raiseToTotal = engine.getMinimumRaiseToTotal(currentTurnIndex.value)
    engine.performAction(currentTurnIndex.value, 'raise', raiseToTotal)
  }
}

defineExpose({
  handleAsideAction,
})

const getCardTone = (cardLabel: string) => {
  if (/♥|♦/.test(cardLabel)) return 'table-card--red'
  if (/♣|♠/.test(cardLabel)) return 'table-card--black'
  return 'table-card--back'
}

const getCardRank = (cardLabel: string) => cardLabel.replace(/[♠♥♦♣]/g, '')
const getCardSuit = (cardLabel: string) => cardLabel.match(/[♠♥♦♣]/)?.[0] ?? ''
const getChipVisualCount = (amount: number) => {
  if (amount <= 0) return 0
  return Math.min(12, Math.max(1, Math.round(amount / 20)))
}

const createFlyingChips = (fromSeat: number, amount: number) => {
  if (amount <= 0) return

  const id = ++chipAnimationId
  const chip = {
    id,
    fromSeat,
    amount,
    count: getChipVisualCount(amount),
    phase: 'start' as const,
  }

  flyingChips.value.push(chip)

  nextTick(() => {
    const activeChip = flyingChips.value.find((entry) => entry.id === id)
    if (activeChip) {
      activeChip.phase = 'end'
    }
  })

  setTimeout(() => {
    flyingChips.value = flyingChips.value.filter((entry) => entry.id !== id)
  }, 850)
}

const formatCard = (card: PokerCard) => engine.formatCard(card)

watch(
  [
    () => engine.currentTurnIndex.value,
    () => engine.currentBet.value,
    () => engine.street.value,
  ],
  () => {
    if (aiTimeout) {
      clearTimeout(aiTimeout)
      aiTimeout = null
    }

    const player = players.value[currentTurnIndex.value]
    if (!player?.isAI || street.value === 'hand-over') return

    aiTimeout = setTimeout(() => {
      engine.runAiAction()
    }, 650)
  },
  { immediate: true },
)

watch(
  () => ({
    pot: pot.value,
    currentBet: currentBet.value,
    playerBets: players.value.map((player, index) => ({
      id: player.id,
      seat: index,
      currentBet: player.currentBet,
    })),
  }),
  (next, previous) => {
    if (!previous) return

    next.playerBets.forEach((playerBet, index) => {
      const previousBet = previous.playerBets[index]
      if (!previousBet) return
      const delta = playerBet.currentBet - previousBet.currentBet
      if (delta > 0) {
        createFlyingChips(playerBet.seat, delta)
      }
    })

    const potDelta = next.pot - previous.pot
    const currentBetDelta = next.currentBet - previous.currentBet

    if (potDelta > 0 && currentBetDelta > 0) {
      createFlyingChips(
        currentTurnIndex.value,
        Math.max(potDelta, currentBetDelta),
      )
    }
  },
)

watch(
  () => street.value,
  (nextStreet, previousStreet) => {
    const previousVisible = getVisibleCountForStreet(
      previousStreet ?? 'preflop',
    )
    const nextVisible = getVisibleCountForStreet(nextStreet)

    if (nextVisible <= previousVisible) {
      clearBoardAnimationTimers()
      resetBoardCardAnimations()
      return
    }

    const newVisibleIndexes = Array.from(
      { length: nextVisible - previousVisible },
      (_, offset) => previousVisible + offset,
    )

    const baseDelay = nextStreet === 'flop' ? 120 : 0
    newVisibleIndexes.forEach((index, sequencePosition) => {
      const delay = sequencePosition * baseDelay

      const dealingTimer = setTimeout(() => {
        boardCardAnimations.value[index] = 'dealing'
      }, delay)
      boardAnimationTimers.push(dealingTimer)

      const flipTimer = setTimeout(() => {
        boardCardAnimations.value[index] = 'flip'
      }, delay + 180)
      boardAnimationTimers.push(flipTimer)

      const cleanupTimer = setTimeout(() => {
        boardCardAnimations.value[index] = 'idle'
      }, delay + 600)
      boardAnimationTimers.push(cleanupTimer)
    })
  },
)

onBeforeUnmount(() => {
  clearBoardAnimationTimers()

  if (aiTimeout) {
    clearTimeout(aiTimeout)
  }
})
</script>

<template>
  <CardTableLayout
    :players="tablePlayers"
    :center-cards="centerCards"
    table-theme="poker"
    class="poker-table-layout"
  >
    <template #center>
      <div class="poker-table-surface">
        <div class="poker-rail">
          <div class="poker-pot-zone">
            <div class="pot-stack">
              <p class="pot-stack__label mb-1">
                {{ t('gameComponents.poker.pot') }}
              </p>
              <div class="chip-stack chip-stack--pot" aria-hidden="true">
                <span
                  v-for="chipIndex in getChipVisualCount(pot)"
                  :key="`pot-chip-${chipIndex}`"
                  class="chip-stack__chip"
                />
              </div>
              <strong class="pot-stack__amount">{{ pot }}</strong>
            </div>

            <div class="board-row board-row--center">
              <span
                v-for="slot in boardSlots"
                :key="slot.key"
                class="table-card"
                :class="[
                  slot.isVisible && slot.card
                    ? getCardTone(formatCard(slot.card))
                    : 'table-card--back',
                  slot.animationClasses,
                ]"
              >
                <template v-if="slot.isVisible && slot.card">
                  <span class="table-card__rank">{{
                    getCardRank(formatCard(slot.card))
                  }}</span>
                  <span class="table-card__suit">{{
                    getCardSuit(formatCard(slot.card))
                  }}</span>
                </template>
                <template v-else>
                  <span class="table-card__back-pattern">🂠</span>
                </template>
              </span>
            </div>

            <p class="active-turn-indicator mb-0">
              {{ t('gameComponents.poker.turn') }}:
              {{ currentPlayer?.name ?? '—' }}
            </p>
          </div>
        </div>

        <div class="flying-chips-layer" aria-hidden="true">
          <div
            v-for="chip in flyingChips"
            :key="chip.id"
            class="flying-chip"
            :class="[
              `flying-chip--seat-${chip.fromSeat}`,
              { 'flying-chip--end': chip.phase === 'end' },
            ]"
          >
            <span
              v-for="tokenIndex in chip.count"
              :key="`${chip.id}-token-${tokenIndex}`"
              class="chip-stack__chip chip-stack__chip--small"
            />
          </div>
        </div>
      </div>
    </template>

    <template #seat-north-hand>
      <section class="seat-hand seat-hand--opponent">
        <div class="card-back-row">
          <span
            v-for="n in opponents[0]?.hand.length ?? 0"
            :key="`north-${n}`"
            class="card-back"
            >🂠</span
          >
        </div>
      </section>
    </template>

    <template #seat-east-hand>
      <section class="seat-hand seat-hand--opponent seat-hand--side">
        <div class="card-back-row card-back-row--side">
          <span
            v-for="n in opponents[1]?.hand.length ?? 0"
            :key="`east-${n}`"
            class="card-back"
            >🂠</span
          >
        </div>
      </section>
    </template>

    <template #seat-south-hand>
      <section class="seat-hand seat-hand--player">
        <p class="text-caption text-white mb-2">
          {{ t('gameComponents.poker.yourCards') }} ·
          {{ humanPlayer?.stack ?? 0 }}
        </p>
        <div class="table-actions">
          <v-btn
            v-for="action in tableActions"
            :key="`poker-action-${action.id}`"
            size="small"
            color="primary"
            variant="outlined"
            :disabled="action.disabled"
            @click="handleAsideAction(action.id)"
          >
            {{ action.label }}
          </v-btn>
        </div>
        <div class="board-row board-row--center">
          <span
            v-for="card in humanPlayer?.hand ?? []"
            :key="card.id"
            class="table-card"
            :class="getCardTone(formatCard(card))"
          >
            <span class="table-card__rank">{{
              getCardRank(formatCard(card))
            }}</span>
            <span class="table-card__suit">{{
              getCardSuit(formatCard(card))
            }}</span>
          </span>
        </div>
      </section>
    </template>

    <template #seat-west-hand>
      <section class="seat-hand seat-hand--opponent seat-hand--side">
        <div class="card-back-row card-back-row--side">
          <span
            v-for="n in opponents[2]?.hand.length ?? 0"
            :key="`west-${n}`"
            class="card-back"
            >🂠</span
          >
        </div>
      </section>
    </template>
  </CardTableLayout>
</template>

<style scoped>
.poker-shell {
  border-radius: 18px;
  border: 1px solid
    color-mix(in srgb, rgb(var(--v-theme-primary)) 20%, transparent);
}

.board-row {
  --card-width: 58px;
  --card-height: 84px;
  --card-gap: 8px;
  display: flex;
  gap: var(--card-gap);
  flex-wrap: wrap;
}

.board-row--center {
  justify-content: center;
}

.poker-table-surface {
  position: relative;
  width: min(100%, 700px);
  margin-inline: auto;
  padding: 18px;
  border-radius: 999px;
  background: radial-gradient(
    circle at center,
    rgba(104, 239, 168, 0.28) 0%,
    rgba(9, 39, 21, 0.52) 72%
  );
  box-shadow:
    inset 0 0 40px rgba(8, 30, 18, 0.54),
    0 12px 24px rgba(6, 20, 12, 0.35);
}

.poker-rail {
  position: relative;
  border-radius: 999px;
  padding: 20px;
  border: 2px solid rgba(17, 10, 6, 0.72);
  background: linear-gradient(
    165deg,
    rgba(21, 10, 5, 0.78) 0%,
    rgba(8, 4, 2, 0.92) 100%
  );
  box-shadow:
    inset 0 1px 2px rgba(255, 228, 184, 0.12),
    inset 0 -2px 8px rgba(0, 0, 0, 0.55),
    0 8px 20px rgba(0, 0, 0, 0.4);
}

.poker-pot-zone {
  position: relative;
  border-radius: 999px;
  padding: 18px 22px;
  background:
    radial-gradient(
      circle at center,
      rgba(250, 255, 205, 0.28) 0%,
      rgba(53, 138, 83, 0.12) 36%,
      rgba(7, 30, 19, 0) 70%
    ),
    radial-gradient(
      circle at center,
      rgba(42, 143, 79, 0.5) 0%,
      rgba(24, 100, 58, 0.65) 85%
    );
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.pot-stack {
  position: absolute;
  left: 50%;
  top: -10px;
  transform: translateX(-50%);
  display: grid;
  justify-items: center;
  gap: 4px;
}

.pot-stack__label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(248, 250, 252, 0.82);
}

.pot-stack__amount {
  font-size: 0.86rem;
  color: rgba(255, 255, 255, 0.95);
}

.chip-stack {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  min-height: 12px;
}

.chip-stack--pot {
  gap: 1px;
}

.chip-stack__chip {
  width: 11px;
  height: 11px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, 0.72);
  background: radial-gradient(
    circle at 30% 30%,
    #ffffff 0%,
    #ef4444 35%,
    #7f1d1d 100%
  );
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.35);
}

.chip-stack__chip--small {
  width: 8px;
  height: 8px;
}

.flying-chips-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.flying-chip {
  position: absolute;
  display: flex;
  gap: 2px;
  opacity: 0.95;
  transition:
    transform 700ms ease,
    opacity 700ms ease;
}

.flying-chip--end {
  transform: translate(calc(50% - var(--chip-x)), calc(50% - var(--chip-y)))
    scale(0.8);
  opacity: 0;
}

.flying-chip--seat-0 {
  --chip-x: 15%;
  --chip-y: 82%;
  left: 15%;
  top: 82%;
}
.flying-chip--seat-1 {
  --chip-x: 84%;
  --chip-y: 74%;
  left: 84%;
  top: 74%;
}
.flying-chip--seat-2 {
  --chip-x: 84%;
  --chip-y: 24%;
  left: 84%;
  top: 24%;
}
.flying-chip--seat-3 {
  --chip-x: 15%;
  --chip-y: 24%;
  left: 15%;
  top: 24%;
}
.flying-chip--seat-4 {
  --chip-x: 50%;
  --chip-y: 12%;
  left: 50%;
  top: 12%;
}
.flying-chip--seat-5 {
  --chip-x: 50%;
  --chip-y: 88%;
  left: 50%;
  top: 88%;
}

.seat-hand {
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(3, 9, 6, 0.2);
  padding: 6px;
}

.seat-hand--player {
  width: min(100%, 620px);
}

.table-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  margin-bottom: 8px;
}

.seat-hand--side {
  max-width: 180px;
}

.card-back-row {
  --card-back-gap: 6px;
  display: flex;
  flex-wrap: wrap;
  gap: var(--card-back-gap);
  justify-content: center;
  min-height: calc(var(--card-height) + 2px);
}

.card-back-row--side {
  justify-content: flex-start;
}

.card-back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: var(--card-width);
  height: var(--card-height);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  background:
    repeating-linear-gradient(
      135deg,
      rgba(30, 58, 138, 0.85) 0 6px,
      rgba(37, 99, 235, 0.88) 6px 12px
    ),
    linear-gradient(145deg, #172554 0%, #1e3a8a 100%);
  color: rgba(229, 237, 255, 0.92);
  box-shadow:
    0 10px 18px rgba(8, 12, 24, 0.28),
    inset 0 0 0 1px rgba(255, 255, 255, 0.12);
  font-size: 1.2rem;
  line-height: 1;
}

.action-feedback {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 2px 8px;
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-transform: uppercase;
  color: #fff;
  background: color-mix(
    in srgb,
    rgb(var(--v-theme-warning)) 70%,
    rgba(0, 0, 0, 0.45)
  );
}

.table-card {
  position: relative;
  width: var(--card-width);
  height: var(--card-height);
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.25);
  background: linear-gradient(180deg, #ffffff 0%, #f5f7ff 100%);
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  box-shadow:
    0 12px 20px rgba(5, 8, 18, 0.32),
    0 2px 6px rgba(8, 12, 24, 0.2);
  transform-style: preserve-3d;
  will-change: transform, filter;
}

.table-card--red {
  color: #b91c1c;
}

.table-card--black {
  color: #111827;
}

.table-card--back {
  background: linear-gradient(150deg, #1e3a8a 0%, #172554 100%);
  border-color: rgba(255, 255, 255, 0.3);
  color: #e5edff;
}

.table-card__rank {
  font-size: 1.08rem;
  line-height: 0.95;
  letter-spacing: 0.015em;
  font-weight: 850;
  text-shadow: 0 1px 0 rgba(255, 255, 255, 0.7);
}

.table-card__suit {
  margin-top: 2px;
  font-size: 1.15rem;
  line-height: 0.95;
  filter: saturate(1.08) contrast(1.08);
}

.table-card__back-pattern {
  font-size: 1.35rem;
  opacity: 0.9;
}

.table-card--dealing {
  animation: tableCardDealing 210ms cubic-bezier(0.18, 0.82, 0.26, 1);
}

.table-card--flip {
  animation: tableCardFlip 360ms cubic-bezier(0.22, 0.68, 0.26, 1);
}

@keyframes tableCardDealing {
  0% {
    transform: translateY(-5px) scale(0.985);
    filter: brightness(0.95);
  }

  100% {
    transform: translateY(0) scale(1);
    filter: brightness(1);
  }
}

@keyframes tableCardFlip {
  0% {
    transform: perspective(560px) rotateY(0deg) translateY(-2px);
  }

  50% {
    transform: perspective(560px) rotateY(88deg);
  }

  100% {
    transform: perspective(560px) rotateY(0deg) translateY(0);
  }
}

.poker-table-layout :deep(.card-table-layout__center) {
  background: transparent;
  border: none;
  box-shadow: none;
}

.poker-table-layout :deep(.table-seat) {
  background: rgba(5, 12, 7, 0.52);
  border-color: rgba(255, 255, 255, 0.28);
  box-shadow: 0 10px 20px rgba(4, 10, 6, 0.35);
}

.poker-table-layout :deep(.table-seat--active) {
  border-color: color-mix(in srgb, rgb(var(--v-theme-warning)) 72%, #fff);
  box-shadow:
    0 0 0 2px color-mix(in srgb, rgb(var(--v-theme-warning)) 42%, transparent),
    0 0 16px color-mix(in srgb, rgb(var(--v-theme-warning)) 45%, transparent);
}

.poker-table-layout :deep(.table-seat--active .v-avatar) {
  box-shadow: 0 0 0 3px rgba(255, 241, 118, 0.38);
}

.active-turn-indicator {
  margin-top: 12px;
  text-align: center;
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  color: rgba(255, 255, 255, 0.86);
  text-transform: uppercase;
}

@media (max-width: 960px) {
  .board-row {
    --card-gap: 6px;
  }

  .card-back-row {
    --card-back-gap: 5px;
  }
}

@media (max-width: 640px) {
  .board-row {
    --card-width: 46px;
    --card-height: 66px;
    --card-gap: 5px;
  }

  .card-back-row {
    --card-back-gap: 4px;
    min-height: var(--card-height);
  }

  .board-row--center,
  .card-back-row {
    justify-content: center;
  }

  .seat-hand--side {
    max-width: 100%;
  }

  .table-card__rank {
    font-size: 0.94rem;
  }

  .table-card__suit {
    font-size: 1rem;
    margin-top: 1px;
  }

  .card-back {
    border-radius: 10px;
    font-size: 0.98rem;
  }
}
</style>
