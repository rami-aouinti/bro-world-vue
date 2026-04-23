<script setup lang="ts">
import { computed, ref, watch } from "vue";
import CardTableLayout from "./CardTableLayout.vue";
import CardFanHand from "./cards/CardFanHand.vue";
import TrickPile from "./cards/TrickPile.vue";
import type { GameAsidePanelState } from "~/components/games/types";
import { useHeartsEngine } from "~/composables/games/engines/useHeartsEngine";

const props = defineProps<{
  selectedPlayMode: "ai" | "pvp";
}>();

const emit = defineEmits<{
  (event: "panel-state", payload: GameAsidePanelState): void;
  (event: "finished", payload: { result: "win" | "lose" }): void;
}>();

const engine = useHeartsEngine();

const humanPlayer = computed(() => engine.players.value[0]);
const currentPlayer = computed(() => engine.players.value[engine.turnIndex.value]);
const tableSeatOrder = ["north", "east", "south", "west"] as const;
type TableSeat = (typeof tableSeatOrder)[number];

const tablePlayerIndexes = computed(() =>
  tableSeatOrder.map((_, seatIndex) => (0 + ((seatIndex - 2 + 4) % 4)) % 4),
);

const tablePlayers = computed(() =>
  tablePlayerIndexes.value.map((playerIndex) => {
    const player = engine.players.value[playerIndex];
    return {
      id: player?.id ?? `seat-${playerIndex}`,
      name: player?.name ?? `J${playerIndex + 1}`,
      isAI: Boolean(player?.isAI),
      isCurrentTurn: engine.turnIndex.value === playerIndex,
    };
  }),
);

const seatByPlayerIndex = computed(() =>
  tablePlayerIndexes.value.reduce(
    (mapping, playerIndex, seatIndex) => {
      mapping[playerIndex] = tableSeatOrder[seatIndex] ?? tableSeatOrder[0];
      return mapping;
    },
    {} as Record<number, TableSeat>,
  ),
);

const trickCards = computed(() =>
  engine.trick.value.flatMap((play) => {
    const seat = seatByPlayerIndex.value[play.playerIndex];
    if (!seat) return [];
    return {
      id: play.card.id,
      seat,
      rank: play.card.rank,
      suit: play.card.suit,
      playerName: engine.players.value[play.playerIndex]?.name,
    };
  }),
);

const winnerSeat = computed(() => {
  if (trickCards.value.length === 0) return null;
  return seatByPlayerIndex.value[engine.leaderIndex.value] ?? null;
});

const playableCardIds = computed(() =>
  (humanPlayer.value?.hand ?? [])
    .filter((card) => engine.canPlayCard(0, card))
    .map((card) => card.id),
);

const disabledCardIds = computed(() =>
  currentPlayer.value?.isAI ? (humanPlayer.value?.hand ?? []).map((card) => card.id) : [],
);

const finishedEmitted = ref(false);

watch(() => engine.isHandOver.value, (isOver) => {
  if (!isOver || finishedEmitted.value) return;
  const humanScore = engine.players.value[0]?.score ?? Number.POSITIVE_INFINITY;
  const bestScore = Math.min(...engine.players.value.map(player => player.score));
  finishedEmitted.value = true;
  emit("finished", { result: humanScore === bestScore ? "win" : "lose" });
});

watch(() => engine.handNumber.value, () => {
  if (!engine.isHandOver.value) {
    finishedEmitted.value = false;
  }
});

const playHumanCard = (cardId: string) => {
  engine.applyMove({ type: "play", playerIndex: 0, cardId });
};

const runAiUntilHuman = () => {
  let protection = 30;
  while (protection > 0) {
    const player = engine.players.value[engine.turnIndex.value];
    if (!player?.isAI) break;
    const played = engine.nextAiTurn();
    if (!played) break;
    protection -= 1;
  }
};

const panelState = computed<GameAsidePanelState>(() => ({
  title: "Hearts",
  subtitle: `Mode ${props.selectedPlayMode === "ai" ? "solo" : "duel local"}`,
  kpis: [
    { id: "hearts-hand", label: "Main", value: engine.handNumber.value },
    { id: "hearts-score", label: "Score vous", value: humanPlayer.value?.score ?? 0 },
  ],
  actions: [
    { id: "new-hand", label: "Nouvelle manche", icon: "mdi-cards" },
    { id: "ai-turn", label: "Tour IA", icon: "mdi-robot" },
    { id: "undo", label: "Annuler", icon: "mdi-undo" },
  ],
}));

const handleAsideAction = (actionId: string) => {
  if (actionId === "new-hand") {
    engine.startNewHand();
    return;
  }

  if (actionId === "ai-turn") {
    runAiUntilHuman();
    return;
  }

  if (actionId === "undo") {
    engine.undo();
  }
};

watch(panelState, (value) => emit("panel-state", value), { immediate: true });

defineExpose({
  handleAsideAction,
});
</script>

<template>
  <CardTableLayout :players="tablePlayers">
    <template #aside>
      <div class="d-flex ga-2 flex-wrap text-center">
        <v-chip
            v-for="(player, index) in engine.players.value"
            :key="player.id"
            :color="index === engine.turnIndex.value ? 'primary' : undefined"
            size="small"
        >
          {{ player.name }} · Score {{ player.score }}
        </v-chip>
      </div>
    </template>
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
</template>
