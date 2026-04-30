<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import CardTableLayout from './CardTableLayout.vue'
import CardFanHand from './cards/CardFanHand.vue'
import TrickPile from './cards/TrickPile.vue'
import type { GameAsidePanelState } from '~/components/games/types'
import { useSpadesEngine } from '~/composables/games/engines/useSpadesEngine'

const props = defineProps<{
  selectedPlayMode: 'ai' | 'pvp'
}>()

const emit = defineEmits<{
  (event: 'panel-state', payload: GameAsidePanelState): void
  (event: 'finished', payload: { result: 'win' | 'lose' }): void
}>()

const engine = useSpadesEngine()

const humanPlayer = computed(() => engine.players.value[0])
const currentPlayer = computed(
  () => engine.players.value[engine.turnIndex.value],
)
const tableSeatOrder = ['north', 'east', 'south', 'west'] as const
type TableSeat = (typeof tableSeatOrder)[number]

const tablePlayerIndexes = computed(() =>
  tableSeatOrder.map((_, seatIndex) => (0 + ((seatIndex - 2 + 4) % 4)) % 4),
)

const tablePlayers = computed(() =>
  tablePlayerIndexes.value.map((playerIndex) => {
    const player = engine.players.value[playerIndex]
    return {
      id: player?.id ?? `seat-${playerIndex}`,
      name: player?.name ?? `J${playerIndex + 1}`,
      isAI: Boolean(player?.isAI),
      isCurrentTurn: engine.turnIndex.value === playerIndex,
    }
  }),
)

const seatByPlayerIndex = computed(() =>
  tablePlayerIndexes.value.reduce(
    (mapping, playerIndex, seatIndex) => {
      mapping[playerIndex] = tableSeatOrder[seatIndex] ?? tableSeatOrder[0]
      return mapping
    },
    {} as Record<number, TableSeat>,
  ),
)

const trickCards = computed(() =>
  engine.trick.value.flatMap((play) => {
    const seat = seatByPlayerIndex.value[play.playerIndex]
    if (!seat) return []
    return {
      id: play.card.id,
      seat,
      rank: play.card.rank,
      suit: play.card.suit,
      playerName: engine.players.value[play.playerIndex]?.name,
    }
  }),
)

const winnerSeat = computed(() => {
  if (trickCards.value.length === 0) return null
  return seatByPlayerIndex.value[engine.leaderIndex.value] ?? null
})

const playableCardIds = computed(() =>
  (humanPlayer.value?.hand ?? [])
    .filter((card) => engine.canPlayCard(0, card))
    .map((card) => card.id),
)

const disabledCardIds = computed(() =>
  currentPlayer.value?.isAI
    ? (humanPlayer.value?.hand ?? []).map((card) => card.id)
    : [],
)

const finishedEmitted = ref(false)

watch(
  () => engine.isHandOver.value,
  (isOver) => {
    if (!isOver || finishedEmitted.value) return
    const humanScore =
      engine.players.value[0]?.score ?? Number.NEGATIVE_INFINITY
    const bestScore = Math.max(
      ...engine.players.value.map((player) => player.score),
    )
    finishedEmitted.value = true
    emit('finished', { result: humanScore === bestScore ? 'win' : 'lose' })
  },
)

watch(
  () => engine.handNumber.value,
  () => {
    if (!engine.isHandOver.value) {
      finishedEmitted.value = false
    }
  },
)

const playHumanCard = (cardId: string) => {
  engine.applyMove({ type: 'play', playerIndex: 0, cardId })
}

const runAiUntilHuman = () => {
  let protection = 30
  while (protection > 0) {
    const player = engine.players.value[engine.turnIndex.value]
    if (!player?.isAI) break
    const played = engine.nextAiTurn()
    if (!played) break
    protection -= 1
  }
}

const panelState = computed<GameAsidePanelState>(() => ({
  title: 'Spades',
  subtitle: `Mode ${props.selectedPlayMode === 'ai' ? 'solo' : 'duel local'}`,
  kpis: [
    { id: 'spades-hand', label: 'Main', value: engine.handNumber.value },
    {
      id: 'spades-score',
      label: 'Score vous',
      value: humanPlayer.value?.score ?? 0,
    },
  ],
  actions: [
    { id: 'new-hand', label: 'Main suivante', icon: 'mdi-cards-playing-spade' },
    { id: 'ai-turn', label: 'Tour IA', icon: 'mdi-robot' },
    { id: 'undo', label: 'Annuler', icon: 'mdi-undo' },
  ],
}))

const handleAsideAction = (actionId: string) => {
  if (actionId === 'new-hand') {
    engine.startNewHand()
    return
  }

  if (actionId === 'ai-turn') {
    runAiUntilHuman()
    return
  }

  if (actionId === 'undo') {
    engine.undo()
  }
}

watch(panelState, (value) => emit('panel-state', value), { immediate: true })

defineExpose({
  handleAsideAction,
})
</script>

<template>
  <v-card class="pa-6">
    <v-card-title class="text-h5 d-flex justify-space-between align-center">
      <span>Spades</span>
      <v-chip
        :color="engine.spadesBroken.value ? 'warning' : 'default'"
        size="small"
      >
        Atout {{ engine.spadesBroken.value ? 'activé' : 'préservé' }}
      </v-chip>
    </v-card-title>

    <v-card-text class="d-flex flex-column ga-4">
      <div class="d-flex ga-2 flex-wrap">
        <v-chip
          v-for="(player, index) in engine.players.value"
          :key="player.id"
          :color="index === engine.turnIndex.value ? 'primary' : undefined"
          size="small"
        >
          {{ player.name }} · Enchère {{ player.bid }} · Plis
          {{ player.tricksWon }} · Score {{ player.score }}
        </v-chip>
      </div>

      <CardTableLayout :players="tablePlayers">
        <template #center>
          <TrickPile :trick="trickCards" :winner-seat="winnerSeat" />
        </template>
        <template #seat-south-hand>
          <CardFanHand
            :cards="humanPlayer?.hand ?? []"
            :playable-card-ids="playableCardIds"
            :disabled-card-ids="disabledCardIds"
            @play-card="({ id }) => playHumanCard(id)"
          />
        </template>
      </CardTableLayout>

      <div class="d-flex ga-2 flex-wrap">
        <v-btn variant="tonal" @click="runAiUntilHuman">Lancer IA</v-btn>
        <v-btn variant="tonal" @click="engine.startNewHand"
          >Main suivante</v-btn
        >
        <v-btn variant="text" @click="engine.undo">Undo</v-btn>
      </div>

      <p class="text-body-2 mb-0">{{ engine.message.value }}</p>
    </v-card-text>
  </v-card>
</template>
