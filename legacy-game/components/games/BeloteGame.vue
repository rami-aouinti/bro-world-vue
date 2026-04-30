<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import CardTableLayout from './CardTableLayout.vue'
import CardFanHand from './cards/CardFanHand.vue'
import DeckStack from './cards/DeckStack.vue'
import TrickPile from './cards/TrickPile.vue'
import type { GameAsidePanelState } from './types'
import {
  type BeloteMode,
  useBeloteEngine,
} from '~/composables/games/useBeloteEngine'

const props = defineProps<{
  selectedPlayMode: 'ai' | 'pvp'
  beloteMode: BeloteMode
}>()
const emit = defineEmits<{
  (event: 'panel-state', payload: GameAsidePanelState): void
}>()

const { t } = useI18n()

const {
  TURN_SECONDS,
  phase,
  expectedAction,
  contract,
  players,
  trumpSuit,
  trick,
  trickCount,
  turnIndex,
  timerSeconds,
  message,
  roundOver,
  roundResult,
  playerScores,
  teamScores,
  totalPlayerScores,
  totalTeamScores,
  canHumanPlay,
  humanTurnPlayerIndex,
  humanPlayableCards,
  playCard,
  restartRound,
} = useBeloteEngine(
  () => props.beloteMode,
  () => props.selectedPlayMode,
)

const displayHandPlayerIndex = computed(() => {
  if (props.selectedPlayMode === 'ai') return 0
  return humanTurnPlayerIndex.value
})

const displayHandPlayer = computed(() => {
  const index = displayHandPlayerIndex.value
  return index >= 0 ? players.value[index] : null
})

const infoPanelPlayers = computed(() =>
  players.value.filter((_, index) => index !== displayHandPlayerIndex.value),
)

const getSeatRoleLabel = (seatIndex: number) => {
  const referenceSeat = displayHandPlayerIndex.value

  if (referenceSeat < 0) return t('gameComponents.belote.seatRoles.localPlayer')
  if (props.beloteMode !== 'teams')
    return t('gameComponents.belote.seatRoles.opponent')

  return (seatIndex - referenceSeat + 4) % 2 === 0
    ? t('gameComponents.belote.seatRoles.partner')
    : t('gameComponents.belote.seatRoles.opponent')
}

const handsPanelTitle = computed(() =>
  props.selectedPlayMode === 'ai'
    ? t('gameComponents.belote.hands.aiHands')
    : t('gameComponents.belote.hands.localHands'),
)

const isHumanCardPlayable = (cardId: string) =>
  humanPlayableCards.value.some((card) => card.id === cardId)

const selectedCardId = ref<string | null>(null)
const rejectedCardId = ref<string | null>(null)
const wonCardIds = ref<string[]>([])

const tableSeatOrder = ['north', 'east', 'south', 'west'] as const
type TableSeat = (typeof tableSeatOrder)[number]

const tablePlayerIndexes = computed(() => {
  const localPlayerIndex = displayHandPlayerIndex.value

  if (players.value.length !== 4 || localPlayerIndex < 0) {
    return players.value.map((_, index) => index)
  }

  return tableSeatOrder.map(
    (_, seatIndex) => (localPlayerIndex + ((seatIndex - 2 + 4) % 4)) % 4,
  )
})

const tablePlayers = computed(() =>
  tablePlayerIndexes.value.map((playerIndex) => {
    const player = players.value[playerIndex]

    return {
      id: player.id,
      name: player.name,
      isAI: player.isAI,
      handCount: player.hand.length,
      isCurrentTurn: turnIndex.value === playerIndex,
      timerSeconds:
        turnIndex.value === playerIndex ? timerSeconds.value : undefined,
    }
  }),
)

const seatByPlayerIndex = computed(() =>
  tablePlayerIndexes.value.reduce(
    (mapping, playerIndex, seatIndex) => {
      const seat = tableSeatOrder[seatIndex] ?? tableSeatOrder[0]
      mapping[playerIndex] = seat
      return mapping
    },
    {} as Record<number, TableSeat>,
  ),
)

const trickBySeat = computed(() => {
  const bySeat = {
    north: null,
    east: null,
    south: null,
    west: null,
  } as Record<TableSeat, (typeof trick.value)[number] | null>

  for (const play of trick.value) {
    const seat = seatByPlayerIndex.value[play.playerIndex]
    if (seat) bySeat[seat] = play
  }

  return bySeat
})

const trickCards = computed(() =>
  tableSeatOrder.flatMap((seat) => {
    const play = trickBySeat.value[seat]
    if (!play) return []
    return {
      seat,
      rank: play.card.rank,
      suit: play.card.suit,
      playerName: players.value[play.playerIndex]?.name,
    }
  }),
)

const winnerSeat = computed<TableSeat | null>(() => {
  if (!trick.value.length || !roundOver.value) {
    return null
  }

  const previousTurn = (turnIndex.value + 3) % 4
  return seatByPlayerIndex.value[previousTurn] ?? null
})
const trickCountValue = computed(() => trickCount.value)

const scoreboardRows = computed(() => {
  if (props.beloteMode === 'teams') {
    return [
      {
        id: 'team-a',
        label: t('gameComponents.belote.teams.teamA', {
          p1: players.value[0]?.name ?? 'J1',
          p2: players.value[2]?.name ?? 'J3',
        }),
        score: teamScores.value.teamA,
      },
      {
        id: 'team-b',
        label: t('gameComponents.belote.teams.teamB', {
          p1: players.value[1]?.name ?? 'J2',
          p2: players.value[3]?.name ?? 'J4',
        }),
        score: teamScores.value.teamB,
      },
    ]
  }

  return players.value.map((player, index) => ({
    id: player.id,
    label: player.name,
    score: playerScores.value[index],
  }))
})

const _modeLabel = computed(() =>
  props.beloteMode === 'teams'
    ? t('gameComponents.belote.modes.teams')
    : t('gameComponents.belote.modes.freeForAll'),
)
const phaseLabel = computed(() =>
  t(`gameComponents.belote.phases.${phase.value}`),
)
const expectedActionLabel = computed(() =>
  t(`gameComponents.belote.expectedActions.${expectedAction.value}`),
)

const panelState = computed<GameAsidePanelState>(() => ({
  gameKey: 'belote',
  title: t('gameComponents.belote.title'),
  phase: phaseLabel.value,
  turnLabel: players.value[turnIndex.value]?.name ?? '—',
  status: roundOver.value ? roundResult.value : message.value,
  kpis: [
    {
      id: 'timer',
      label: t('gameComponents.belote.timer'),
      value: `${timerSeconds.value}s`,
      color: 'primary',
      variant: 'tonal',
    },
    {
      id: 'tricks',
      label: t('gameComponents.belote.tricksPlayed', {
        count: trickCountValue.value,
      }),
      value: trickCountValue.value,
      variant: 'outlined',
    },
    {
      id: 'trump',
      label: t('gameComponents.belote.trump'),
      value: trumpSuit.value,
      color: 'warning',
      variant: 'flat',
    },
  ],
  highlights: [
    `${t('gameComponents.belote.expectedAction')}: ${expectedActionLabel.value}`,
    contract.value
      ? `${t('gameComponents.belote.contract')}: ${players.value[contract.value.takerIndex]?.name} · ${contract.value.trumpSuit}`
      : t('gameComponents.belote.actions.newDeal'),
  ],
}))

watchEffect(() => {
  emit('panel-state', panelState.value)
})

watchEffect(() => {
  if (!displayHandPlayer.value) {
    selectedCardId.value = null
    return
  }

  if (
    selectedCardId.value &&
    !displayHandPlayer.value.hand.some(
      (card) => card.id === selectedCardId.value,
    )
  ) {
    selectedCardId.value = null
  }
})

watchEffect(() => {
  if (!winnerSeat.value) return

  const winningPlay = trickCards.value.find(
    (play) => play.seat === winnerSeat.value,
  )
  if (!winningPlay) return

  wonCardIds.value = [`${winningPlay.rank}${winningPlay.suit}`]
})

const handleAsideAction = (actionId: string) => {
  if (actionId === 'new-deal') {
    restartRound()
  }
}

const handlePlayCard = (payload: { id: string }) => {
  if (!displayHandPlayer.value) return

  selectedCardId.value = payload.id
  const canPlay =
    canHumanPlay.value &&
    humanTurnPlayerIndex.value === displayHandPlayerIndex.value
  const allowed = isHumanCardPlayable(payload.id)

  if (!canPlay || !allowed) {
    rejectedCardId.value = payload.id
    window.setTimeout(() => {
      if (rejectedCardId.value === payload.id) rejectedCardId.value = null
    }, 450)
    return
  }

  playCard(displayHandPlayerIndex.value, payload.id)
}

defineExpose({
  handleAsideAction,
})
</script>

<template>
  <CardTableLayout
    :players="tablePlayers"
    :turn-timer-seconds="TURN_SECONDS"
    table-theme="belote"
  >
    <template #seat-south-hand>
      <section v-if="displayHandPlayer" class="belote-seat-hand">
        <p class="belote-seat-hand__title">
          {{ t('gameComponents.belote.yourHand') }} ·
          {{ displayHandPlayer.name }}
        </p>
        <CardFanHand
          :cards="displayHandPlayer.hand"
          :selected-card-ids="selectedCardId ? [selectedCardId] : []"
          :playable-card-ids="humanPlayableCards.map((card) => card.id)"
          :disabled-card-ids="
            !canHumanPlay || humanTurnPlayerIndex !== displayHandPlayerIndex
              ? displayHandPlayer.hand.map((card) => card.id)
              : []
          "
          :highlighted-card-ids="humanPlayableCards.map((card) => card.id)"
          :feedback-by-card-id="
            Object.fromEntries(
              displayHandPlayer.hand.map((card) => [
                card.id,
                rejectedCardId === card.id
                  ? 'error'
                  : wonCardIds.includes(`${card.rank}${card.suit}`)
                    ? 'won'
                    : 'idle',
              ]),
            )
          "
          @play-card="handlePlayCard"
        />
        <div class="table-actions">
          <v-btn
            size="small"
            color="primary"
            prepend-icon="mdi-cards"
            @click="handleAsideAction('new-deal')"
          >
            {{ t('gameComponents.belote.actions.newDeal') }}
          </v-btn>
        </div>
      </section>
    </template>

    <template #center>
      <div class="trick-center">
        <TrickPile :trick="trickCards" :winner-seat="winnerSeat" />
        <DeckStack
          class="trick-center__deck"
          :remaining="Math.max(0, 32 - trickCountValue * 4)"
          :can-draw="false"
          :disabled="true"
        />
      </div>
    </template>

    <v-row class="mb-4" dense>
      <v-col cols="12" md="6">
        <v-card class="pa-3 game-info-card h-100" variant="outlined">
          <p class="text-subtitle-2 font-weight-bold mb-2">
            {{ t('gameComponents.belote.scoreboard.round') }}
          </p>
          <v-table
            density="compact"
            class="belote-score-table"
            :aria-label="t('gameComponents.belote.aria.scoreTable')"
          >
            <thead>
              <tr>
                <th class="text-left">
                  {{ t('gameComponents.belote.scoreboard.side') }}
                </th>
                <th class="text-right">
                  {{ t('gameComponents.belote.scoreboard.points') }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="entry in scoreboardRows" :key="entry.id">
                <td>{{ entry.label }}</td>
                <td class="text-right font-weight-bold">{{ entry.score }}</td>
              </tr>
            </tbody>
          </v-table>
          <p class="text-subtitle-2 font-weight-bold mt-3 mb-1">
            {{ t('gameComponents.belote.scoreboard.global') }}
          </p>
          <p v-if="props.beloteMode === 'teams'" class="mb-1">
            {{
              t('gameComponents.belote.totalTeams', {
                scoreA: totalTeamScores.teamA,
                scoreB: totalTeamScores.teamB,
              })
            }}
          </p>
          <p v-else class="mb-1">
            <span
              v-for="(player, index) in players"
              :key="`${player.id}-global`"
              class="mr-2"
              >{{ player.name }}: {{ totalPlayerScores[index] }}</span
            >
          </p>
          <p class="mb-0 mt-2">{{ roundOver ? roundResult : message }}</p>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="pa-3 game-info-card h-100" variant="outlined">
          <p class="text-subtitle-2 font-weight-bold mb-2">
            {{ handsPanelTitle }}
          </p>
          <div class="ai-hands">
            <div
              v-for="player in infoPanelPlayers"
              :key="player.id"
              class="ai-hand-row"
            >
              <span class="text-caption">{{ player.name }}</span>
              <div class="card-backs">
                <span
                  v-for="n in player.hand.length"
                  :key="`${player.id}-${n}`"
                  class="card-back"
                  >🂠</span
                >
              </div>
              <small class="text-medium-emphasis">{{
                getSeatRoleLabel(
                  players.findIndex((entry) => entry.id === player.id),
                )
              }}</small>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>

    <v-card class="pa-3 game-info-card mb-4" variant="outlined">
      <p class="text-subtitle-2 font-weight-bold mb-2">
        {{ t('gameComponents.belote.quickRules.title') }}
      </p>
      <ul class="mb-0 pl-4 belote-rules">
        <li>{{ t('gameComponents.belote.quickRules.items.roundTricks') }}</li>
        <li>{{ t('gameComponents.belote.quickRules.items.followSuit') }}</li>
        <li>
          {{
            t('gameComponents.belote.quickRules.items.trump', {
              trump: trumpSuit,
            })
          }}
        </li>
        <li>{{ t('gameComponents.belote.quickRules.items.winTrick') }}</li>
        <li>{{ t('gameComponents.belote.quickRules.items.points') }}</li>
      </ul>
    </v-card>
    <p v-if="!displayHandPlayer" class="text-medium-emphasis mb-0">
      {{ t('gameComponents.belote.waitingLocalTurn') }}
    </p>
  </CardTableLayout>
</template>

<style scoped>
.game-card-shell {
  border-radius: 18px;
  border: 1px solid
    color-mix(in srgb, rgb(var(--v-theme-primary)) 20%, transparent);
  background: linear-gradient(
    160deg,
    rgba(255, 255, 255, 0.08),
    rgba(255, 255, 255, 0)
  );
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.09);
}

.game-info-card {
  border-radius: 14px;
  border: 1px solid
    color-mix(in srgb, rgb(var(--v-theme-info)) 22%, transparent);
  background: color-mix(
    in srgb,
    rgb(var(--v-theme-surface)) 95%,
    rgb(var(--v-theme-info)) 5%
  );
}

.belote-score-table {
  border: 1px solid rgba(15, 23, 42, 0.12);
  border-radius: 10px;
}

.belote-rules {
  color: rgba(var(--v-theme-on-surface), 0.86);
}

.game-title {
  font-size: 1.2rem;
  font-weight: 800;
}

.game-description {
  color: rgba(var(--v-theme-on-surface), 0.9);
}

.game-subtitle {
  color: rgba(var(--v-theme-on-surface), 0.76);
  font-size: 0.93rem;
}

.belote-seat-hand {
  width: min(520px, calc(100% - 24px));
  margin: 0 auto;
}

.table-actions {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.belote-seat-hand__title {
  margin: 0 0 8px;
  text-align: center;
  color: rgba(var(--v-theme-on-surface), 0.9);
  font-size: 0.82rem;
  font-weight: 600;
}

.ai-hands {
  display: grid;
  gap: 8px;
}

.ai-hand-row {
  display: grid;
  gap: 4px;
}

.card-backs {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.card-back {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 30px;
  border-radius: 6px;
  background: rgba(30, 58, 138, 0.15);
  border: 1px solid rgba(30, 58, 138, 0.28);
}

.trick-center {
  width: 100%;
  display: grid;
  place-items: center;
  gap: 10px;
}

.trick-center__deck {
  transform: scale(0.86);
}

@media (max-width: 700px) {
  .trick-center__deck {
    transform: scale(0.72);
  }
}
</style>
