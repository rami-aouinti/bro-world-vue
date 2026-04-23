<script setup lang="ts">
import { computed, ref, watch, watchEffect } from "vue";
import GameTableScaffold from "./GameTableScaffold.vue";
import type { GameAsidePanelState } from "./types";
import { useGameFeedback } from "~/composables/games/useGameFeedback";
const { t } = useI18n();

const props = defineProps<{
  selectedPlayMode: "ai" | "pvp";
}>();

const emit = defineEmits<{
  (event: "panel-state", payload: GameAsidePanelState): void;
  (event: "game-finished", payload: { result: "win" | "lose" }): void;
}>();

type PlayerColor = "red" | "blue";

interface Pawn {
  id: string;
  player: PlayerColor;
  steps: number;
}

interface PlayerState {
  id: PlayerColor;
  name: string;
  isAi: boolean;
}

const PATH = [
  { row: 0, col: 0 },
  { row: 0, col: 1 },
  { row: 0, col: 2 },
  { row: 0, col: 3 },
  { row: 0, col: 4 },
  { row: 0, col: 5 },
  { row: 1, col: 5 },
  { row: 2, col: 5 },
  { row: 3, col: 5 },
  { row: 4, col: 5 },
  { row: 5, col: 5 },
  { row: 5, col: 6 },
  { row: 5, col: 7 },
  { row: 5, col: 8 },
  { row: 5, col: 9 },
  { row: 5, col: 10 },
  { row: 6, col: 10 },
  { row: 7, col: 10 },
  { row: 8, col: 10 },
  { row: 9, col: 10 },
  { row: 10, col: 10 },
  { row: 10, col: 9 },
  { row: 10, col: 8 },
  { row: 10, col: 7 },
  { row: 10, col: 6 },
  { row: 10, col: 5 },
  { row: 9, col: 5 },
  { row: 8, col: 5 },
  { row: 7, col: 5 },
  { row: 6, col: 5 },
];

const PLAYER_START_STEP: Record<PlayerColor, number> = {
  red: 0,
  blue: Math.floor(PATH.length / 2),
};

const players = ref<PlayerState[]>([
  { id: "red", name: t("gameComponents.ludo.players.red"), isAi: false },
  { id: "blue", name: t("gameComponents.ludo.players.blue"), isAi: props.selectedPlayMode === "ai" },
]);

const pawns = ref<Pawn[]>([
  { id: "red-1", player: "red", steps: -1 },
  { id: "red-2", player: "red", steps: -1 },
  { id: "blue-1", player: "blue", steps: -1 },
  { id: "blue-2", player: "blue", steps: -1 },
]);

const currentPlayerIndex = ref(0);
const diceValue = ref<number | null>(null);
const hasRolled = ref(false);
const selectedPawnId = ref<string | null>(null);
const statusMessage = ref(t("gameComponents.ludo.messages.rollToStart"));
const finishedPlayer = ref<PlayerColor | null>(null);
const gameFinishedEmitted = ref(false);

const { playUiSound, triggerVisualFeedback } = useGameFeedback();

const currentPlayer = computed(() => players.value[currentPlayerIndex.value]);
const currentPlayerId = computed(() => currentPlayer.value?.id ?? "red");
const isAiTurn = computed(() => currentPlayer.value?.isAi ?? false);
const pathSet = new Set(PATH.map((cell) => `${cell.row}-${cell.col}`));

const pawnsByPlayer = computed(() => ({
  red: pawns.value.filter((pawn) => pawn.player === "red"),
  blue: pawns.value.filter((pawn) => pawn.player === "blue"),
}));

const remainingToGoal = (player: PlayerColor) =>
  pawns.value.filter((pawn) => pawn.player === player && pawn.steps < PATH.length - 1)
    .length;

const getPawnPosition = (pawn: Pawn) => {
  if (pawn.steps < 0 || pawn.steps >= PATH.length) return null;
  const start = PLAYER_START_STEP[pawn.player];
  const index = (start + pawn.steps) % PATH.length;
  return PATH[index] ?? null;
};

const getCellPawns = (row: number, col: number) =>
  pawns.value.filter((pawn) => {
    const position = getPawnPosition(pawn);
    return position?.row === row && position?.col === col;
  });

const canMovePawn = (pawn: Pawn, rolledValue: number | null) => {
  if (pawn.player !== currentPlayerId.value || !rolledValue) return false;
  if (pawn.steps < 0) {
    return rolledValue === 6;
  }

  return pawn.steps + rolledValue <= PATH.length - 1;
};

const playablePawnIds = computed(() => {
  if (!hasRolled.value || diceValue.value === null) return new Set<string>();
  return new Set(
    pawns.value
      .filter((pawn) => canMovePawn(pawn, diceValue.value))
      .map((pawn) => pawn.id),
  );
});

const changeTurn = () => {
  hasRolled.value = false;
  diceValue.value = null;
  selectedPawnId.value = null;
  currentPlayerIndex.value = (currentPlayerIndex.value + 1) % players.value.length;
  statusMessage.value = t("gameComponents.ludo.messages.turnStart", {
    player: currentPlayer.value.name,
  });
};

const movePawn = (pawnId: string) => {
  if (finishedPlayer.value) return;

  const pawn = pawns.value.find((item) => item.id === pawnId);
  if (!pawn || !diceValue.value) return;

  if (!playablePawnIds.value.has(pawnId)) {
    statusMessage.value = t("gameComponents.ludo.errors.invalidMove");
    triggerVisualFeedback("game-surface", "shake", 420);
    playUiSound("alert");
    return;
  }

  selectedPawnId.value = pawnId;
  if (pawn.steps < 0) {
    pawn.steps = 0;
  } else {
    pawn.steps += diceValue.value;
  }

  playUiSound("confirm");
  triggerVisualFeedback("game-surface", "pulse", 280);

  if (pawn.steps >= PATH.length - 1) {
    pawn.steps = PATH.length - 1;
  }

  const hasWon = pawns.value
    .filter((item) => item.player === pawn.player)
    .every((item) => item.steps >= PATH.length - 1);

  if (hasWon) {
    finishedPlayer.value = pawn.player;
    statusMessage.value = t("gameComponents.ludo.messages.victory", {
      player: currentPlayer.value.name,
    });
    return;
  }

  if (diceValue.value === 6) {
    hasRolled.value = false;
    diceValue.value = null;
    selectedPawnId.value = null;
    statusMessage.value = t("gameComponents.ludo.messages.reroll", {
      player: currentPlayer.value.name,
    });
    return;
  }

  changeTurn();
};

const rollDice = () => {
  if (finishedPlayer.value) return;
  if (hasRolled.value) {
    statusMessage.value = t("gameComponents.ludo.errors.alreadyRolled");
    return;
  }

  diceValue.value = Math.floor(Math.random() * 6) + 1;
  hasRolled.value = true;
  playUiSound("confirm");

  if (playablePawnIds.value.size === 0) {
    statusMessage.value = t("gameComponents.ludo.messages.noMoveAvailable", {
      player: currentPlayer.value.name,
      dice: diceValue.value,
    });
    triggerVisualFeedback("game-surface", "shake", 380);
    setTimeout(() => {
      if (!finishedPlayer.value) {
        changeTurn();
      }
    }, 520);
    return;
  }

  statusMessage.value = t("gameComponents.ludo.messages.diceResult", {
    player: currentPlayer.value.name,
    dice: diceValue.value,
  });
};

const onPawnClick = (pawn: Pawn) => {
  if (finishedPlayer.value) return;

  if (!hasRolled.value || diceValue.value === null) {
    statusMessage.value = t("gameComponents.ludo.errors.rollBeforeMove");
    return;
  }

  movePawn(pawn.id);
};

const resetGame = () => {
  pawns.value = [
    { id: "red-1", player: "red", steps: -1 },
    { id: "red-2", player: "red", steps: -1 },
    { id: "blue-1", player: "blue", steps: -1 },
    { id: "blue-2", player: "blue", steps: -1 },
  ];
  currentPlayerIndex.value = 0;
  diceValue.value = null;
  hasRolled.value = false;
  selectedPawnId.value = null;
  finishedPlayer.value = null;
  gameFinishedEmitted.value = false;
  statusMessage.value = t("gameComponents.ludo.messages.newGame");
};

const runAiTurn = () => {
  if (!isAiTurn.value || finishedPlayer.value) return;

  if (!hasRolled.value) {
    setTimeout(() => rollDice(), 420);
    return;
  }

  const firstPlayable = pawns.value.find((pawn) => playablePawnIds.value.has(pawn.id));
  if (firstPlayable) {
    setTimeout(() => movePawn(firstPlayable.id), 520);
  }
};

const panelState = computed<GameAsidePanelState>(() => ({
  gameKey: "ludo",
  title: t("gameComponents.ludo.title"),
  phase: finishedPlayer.value
    ? t("gameComponents.ludo.phase.finished")
    : t("gameComponents.ludo.phase.local"),
  turnLabel: currentPlayer.value.name,
  status: statusMessage.value,
  highlights: [
    t("gameComponents.ludo.highlights.mode", {
      mode:
        props.selectedPlayMode === "ai"
          ? t("gameComponents.ludo.modes.vsAi")
          : t("gameComponents.ludo.modes.playerVsPlayer"),
    }),
    hasRolled.value && diceValue.value
      ? t("gameComponents.ludo.highlights.diceCurrent", { dice: diceValue.value })
      : t("gameComponents.ludo.highlights.diceWaiting"),
  ],
  kpis: [
    {
      id: "dice",
      label: t("gameComponents.ludo.kpi.dice"),
      value: diceValue.value ?? "—",
      color: "primary",
      variant: "tonal",
    },
    {
      id: "red-remaining",
      label: t("gameComponents.ludo.kpi.redRemaining"),
      value: remainingToGoal("red"),
      variant: "outlined",
    },
    {
      id: "blue-remaining",
      label: t("gameComponents.ludo.kpi.blueRemaining"),
      value: remainingToGoal("blue"),
      variant: "outlined",
    },
  ],
  actions: [
    {
      id: "roll",
      label: t("gameComponents.ludo.actions.rollDice"),
      disabled: hasRolled.value || Boolean(finishedPlayer.value),
    },
    {
      id: "restart",
      label: t("gameComponents.ludo.actions.restart"),
      disabled: false,
    },
  ],
}));

const handleAsideAction = (actionId: string) => {
  if (actionId === "roll") {
    rollDice();
    return;
  }

  if (actionId === "restart") {
    resetGame();
  }
};

watchEffect(() => {
  emit("panel-state", panelState.value);
});

watch(
  () => [currentPlayerIndex.value, hasRolled.value, finishedPlayer.value],
  () => {
    runAiTurn();
  },
  { immediate: true },
);

watch(finishedPlayer, (winner) => {
  if (!winner || gameFinishedEmitted.value) return;

  gameFinishedEmitted.value = true;
  const result = winner === "red" ? "win" : "lose";
  playUiSound(result === "win" ? "win" : "lose");
  triggerVisualFeedback("game-surface", result === "win" ? "glow" : "shake", 620);
  emit("game-finished", { result });
});

defineExpose({
  handleAsideAction,
});
</script>

<template>
  <GameTableScaffold class="game-shell-unified" surface-variant="flat">
    <template #surface>
      <div class="ludo-board-wrap">
        <div class="ludo-board">
          <div
            v-for="row in 11"
            :key="`line-${row}`"
            class="ludo-row"
          >
            <button
              v-for="col in 11"
              :key="`cell-${row - 1}-${col - 1}`"
              type="button"
              class="ludo-cell"
              :class="{
                'ludo-cell--path': pathSet.has(`${row - 1}-${col - 1}`),
              }"
            >
              <span
                v-for="pawn in getCellPawns(row - 1, col - 1)"
                :key="pawn.id"
                class="ludo-piece"
                :class="[
                  `ludo-piece--${pawn.player}`,
                  {
                    'ludo-piece--playable': playablePawnIds.has(pawn.id),
                    'ludo-piece--selected': selectedPawnId === pawn.id,
                  },
                ]"
                @click.stop="onPawnClick(pawn)"
              >
                {{ pawn.id.endsWith("1") ? "1" : "2" }}
              </span>
            </button>
          </div>
        </div>
      </div>
    </template>

    <div class="d-flex align-center justify-space-between flex-wrap ga-2 mb-1">
      <h3 class="game-shell-title mb-0">{{ t("gameComponents.ludo.title") }}</h3>
      <v-chip color="primary" variant="tonal">
        {{ t("gameComponents.ludo.currentPlayer", { player: currentPlayer.name }) }}
      </v-chip>
    </div>

    <p class="game-shell-subtitle mb-3">{{ statusMessage }}</p>

    <aside class="info-aside">
      <div class="d-flex align-center ga-3 flex-wrap">
        <v-btn
          color="primary"
          prepend-icon="mdi-dice-5"
          :disabled="hasRolled || Boolean(finishedPlayer) || isAiTurn"
          @click="rollDice"
        >
          {{ t("gameComponents.ludo.actions.rollDice") }}
        </v-btn>
        <v-chip variant="outlined">
          {{ t("gameComponents.ludo.kpi.dice") }}: {{ diceValue ?? "—" }}
        </v-chip>
      </div>

      <div class="pawn-pool mt-3">
        <button
          v-for="pawn in pawnsByPlayer[currentPlayerId]"
          :key="pawn.id"
          type="button"
          class="pawn-selector"
          :class="[
            `pawn-selector--${pawn.player}`,
            {
              'pawn-selector--playable': playablePawnIds.has(pawn.id),
              'pawn-selector--selected': selectedPawnId === pawn.id,
            },
          ]"
          @click="onPawnClick(pawn)"
        >
          {{ pawn.id }}
          <span class="pawn-state">
            {{
              pawn.steps < 0
                ? t("gameComponents.ludo.pawn.base")
                : pawn.steps >= PATH.length - 1
                  ? t("gameComponents.ludo.pawn.arrived")
                  : t("gameComponents.ludo.pawn.cell", { count: pawn.steps + 1 })
            }}
          </span>
        </button>
      </div>
    </aside>
  </GameTableScaffold>
</template>

<style scoped>
.game-shell-title { font-size: 1.1rem; font-weight: 800; }
.game-shell-subtitle { color: rgba(var(--v-theme-on-surface), 0.78); }
.info-aside { border: 1px solid rgba(var(--v-theme-on-surface), 0.14); border-radius: 12px; padding: 1rem; background: rgba(var(--v-theme-surface), 0.8); }
.ludo-board-wrap { display: grid; justify-items: center; }
.ludo-board { display: grid; grid-template-rows: repeat(11, 1fr); width: min(560px, 100%); min-width: 360px; border: 1px solid rgba(var(--v-theme-on-surface), 0.18); border-radius: 14px; overflow: hidden; background: rgba(var(--v-theme-surface), 0.95); }
.ludo-row { display: grid; grid-template-columns: repeat(11, 1fr); }
.ludo-cell { min-height: 40px; border: 1px solid rgba(var(--v-theme-on-surface), 0.08); display: grid; place-items: center; background: rgba(var(--v-theme-surface-variant), 0.26); padding: 0.1rem; }
.ludo-cell--path { background: rgba(var(--v-theme-primary), 0.16); }
.ludo-piece { width: 22px; height: 22px; border-radius: 50%; color: white; font-size: 0.72rem; display: grid; place-items: center; font-weight: 700; cursor: pointer; border: 1px solid rgba(255, 255, 255, 0.8); }
.ludo-piece--red { background: #e53935; }
.ludo-piece--blue { background: #1e88e5; }
.ludo-piece--playable { box-shadow: 0 0 0 2px rgb(var(--v-theme-secondary)); }
.ludo-piece--selected { transform: scale(1.1); }
.pawn-pool { display: grid; grid-template-columns: repeat(2, minmax(140px, 1fr)); gap: 0.5rem; }
.pawn-selector { border: 1px solid rgba(var(--v-theme-on-surface), 0.2); border-radius: 10px; background: rgba(var(--v-theme-surface), 0.9); color: rgba(var(--v-theme-on-surface), 0.88); padding: 0.55rem; display: grid; gap: 0.25rem; justify-items: start; }
.pawn-selector--red { border-color: rgba(229, 57, 53, 0.45); }
.pawn-selector--blue { border-color: rgba(30, 136, 229, 0.45); }
.pawn-selector--playable { box-shadow: inset 0 0 0 2px color-mix(in srgb, rgb(var(--v-theme-primary)) 38%, transparent); }
.pawn-selector--selected { transform: translateY(-1px); }
.pawn-state { font-size: 0.78rem; opacity: 0.78; }
</style>
