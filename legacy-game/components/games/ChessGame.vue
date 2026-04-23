<script setup lang="ts">
import { computed, ref, watch, watchEffect } from "vue";
import GameTableScaffold from "./GameTableScaffold.vue";
import type { GameAsidePanelState } from "./types";
import { useChessEngine } from "~/composables/games/useChessEngine";
import { useGameFeedback } from "~/composables/games/useGameFeedback";

const props = defineProps<{
  selectedPlayMode: "ai" | "pvp";
}>();
const emit = defineEmits<{
  (event: "panel-state", payload: GameAsidePanelState): void;
  (event: "game-finished", payload: { result: "win" | "lose" }): void;
}>();
const { t } = useI18n();
const gameFinishedEmitted = ref(false);
const { playUiSound, triggerVisualFeedback } = useGameFeedback();

const {
  board,
  currentTurn,
  selectedSquare,
  legalTargets,
  moveHistory,
  winner,
  statusMessage,
  isAiThinking,
  isInCheck,
  selectSquare,
  reset,
  formatHistoryMove,
} = useChessEngine(props.selectedPlayMode);

const pieceGlyph: Record<string, string> = {
  "white-king": "♔",
  "white-queen": "♕",
  "white-rook": "♖",
  "white-bishop": "♗",
  "white-knight": "♘",
  "white-pawn": "♙",
  "black-king": "♚",
  "black-queen": "♛",
  "black-rook": "♜",
  "black-bishop": "♝",
  "black-knight": "♞",
  "black-pawn": "♟",
};

const boardRows = computed(() =>
  board.value.map((row, rowIndex) =>
    row.map((cell, colIndex) => ({
      row: rowIndex,
      col: colIndex,
      piece: cell,
    })),
  ),
);

const cellClasses = (row: number, col: number) => ({
  "chess-cell": true,
  "chess-cell--dark": (row + col) % 2 === 1,
  "chess-cell--selected": Boolean(
    selectedSquare.value &&
      selectedSquare.value.row === row &&
      selectedSquare.value.col === col,
  ),
  "chess-cell--target": legalTargets.value.some(
    (target) => target.row === row && target.col === col,
  ),
});

const cellLabel = (row: number, col: number) =>
  `${String.fromCharCode(97 + col)}${8 - row}`;

const sideLabel = computed(() =>
  currentTurn.value === "white"
    ? t("gameComponents.chess.sides.white")
    : t("gameComponents.chess.sides.black"),
);

const panelState = computed<GameAsidePanelState>(() => ({
  gameKey: "chess",
  title: t("gameComponents.chess.title"),
  phase: winner.value
    ? t("gameComponents.chess.check")
    : t("gameComponents.chess.turn"),
  turnLabel: sideLabel.value,
  status: statusMessage.value,
  highlights: [
    `${t("gameComponents.chess.turn")} : ${sideLabel.value}`,
    isAiThinking.value
      ? t("gameComponents.chess.aiThinking")
      : t("gameComponents.chess.history"),
  ],
  kpis: [
    {
      id: "moves",
      label: t("gameComponents.chess.history"),
      value: moveHistory.value.length,
      variant: "outlined",
    },
    {
      id: "check",
      label: t("gameComponents.chess.check"),
      value: isInCheck.value ? "Oui" : "Non",
      color: isInCheck.value ? "warning" : "success",
      variant: "tonal",
    },
  ],
  actions: [{ id: "new-game", label: t("gameComponents.chess.actions.newGame") }],
}));

watchEffect(() => {
  emit("panel-state", panelState.value);
});

watch(winner, (nextWinner) => {
  if (!nextWinner) {
    gameFinishedEmitted.value = false;
    return;
  }

  if (gameFinishedEmitted.value) {
    return;
  }

  gameFinishedEmitted.value = true;
  playUiSound(nextWinner === "white" ? "win" : "lose");
  triggerVisualFeedback(
    "game-surface",
    nextWinner === "white" ? "glow" : "shake",
    620,
  );
  emit("game-finished", { result: nextWinner === "white" ? "win" : "lose" });
});

const handleAsideAction = (actionId: string) => {
  if (actionId === "new-game") {
    playUiSound("confirm");
    triggerVisualFeedback("game-surface", "pulse");
    reset();
  }
};

defineExpose({
  handleAsideAction,
});
</script>

<template>
  <GameTableScaffold class="game-shell-unified" surface-variant="flat">
    <template #surface>
      <div class="chess-board" role="grid" :aria-label="t('gameComponents.chess.aria.board')">
        <button
          v-for="cell in boardRows.flat()"
          :key="`cell-${cell.row}-${cell.col}`"
          type="button"
          :class="cellClasses(cell.row, cell.col)"
          @click="selectSquare({ row: cell.row, col: cell.col })"
        >
          <span class="chess-cell__coord">{{ cellLabel(cell.row, cell.col) }}</span>
          <span v-if="cell.piece" class="chess-piece">
            {{ pieceGlyph[`${cell.piece.color}-${cell.piece.type}`] }}
          </span>
          <span
            v-else-if="legalTargets.some((target) => target.row === cell.row && target.col === cell.col)"
            class="chess-target-dot"
          />
        </button>
      </div>
    </template>

    <div class="d-flex flex-wrap justify-space-between align-center ga-2 mb-3">
      <div>
        <h3 class="game-shell-title mb-1">{{ t("gameComponents.chess.title") }}</h3>
        <p class="game-shell-subtitle mb-0">{{ statusMessage }}</p>
      </div>
      <div class="d-flex flex-wrap ga-2">
        <v-chip color="info" variant="tonal">{{ t("gameComponents.chess.turn") }} : {{ sideLabel }}</v-chip>
        <v-chip v-if="isInCheck && !winner" color="warning" variant="flat">{{ t("gameComponents.chess.check") }}</v-chip>
        <v-chip v-if="props.selectedPlayMode === 'ai'" color="deep-purple" variant="outlined">{{ t("gameComponents.chess.aiMode") }}</v-chip>
      </div>
    </div>

    <v-alert v-if="isAiThinking" type="info" variant="tonal" density="compact" class="mb-0">
      {{ t("gameComponents.chess.aiThinking") }}
    </v-alert>
  </GameTableScaffold>
  <div class="chess-history">
    <h4 class="text-subtitle-1 mb-2">{{ t("gameComponents.chess.history") }}</h4>
    <ol class="history-list">
      <li v-for="(move, index) in moveHistory" :key="`move-${index}`" class="history-item">
        <span class="text-caption text-medium-emphasis mr-2">{{ index + 1 }}.</span>
        <span>{{ formatHistoryMove(move) }}</span>
      </li>
    </ol>
    <p v-if="!moveHistory.length" class="text-body-2 text-medium-emphasis mb-0">{{ t("gameComponents.chess.noMoves") }}</p>
  </div>
</template>

<style scoped>
.game-shell-title { font-size: 1.1rem; font-weight: 800; }
.game-shell-subtitle { color: rgba(var(--v-theme-on-surface), 0.7); }
.chess-board { display: grid; grid-template-columns: repeat(8, minmax(36px, 1fr)); border: 2px solid rgba(var(--v-theme-on-surface), 0.2); border-radius: 12px; overflow: hidden; width: min(100%, 520px); }
.chess-cell { position: relative; aspect-ratio: 1; border: none; cursor: pointer; background: #f2e2c2; color: #2a2a2a; }
.chess-cell:hover { box-shadow: inset 0 0 0 2px rgba(var(--v-theme-primary), 0.35); }
.chess-cell--dark { background: #ad7a4f; color: #fff; }
.chess-cell--selected { box-shadow: inset 0 0 0 3px rgba(var(--v-theme-info), 0.9); }
.chess-cell--target { box-shadow: inset 0 0 0 3px rgba(var(--v-theme-success), 0.85); }
.chess-piece { font-size: clamp(1.25rem, 2.3vw, 2rem); line-height: 1; }
.chess-cell__coord { position: absolute; top: 4px; left: 4px; font-size: 0.58rem; opacity: 0.62; }
.chess-target-dot { width: 0.7rem; height: 0.7rem; border-radius: 999px; background: rgba(var(--v-theme-success), 0.8); display: inline-block; }
.chess-history { border: 1px solid rgba(var(--v-theme-on-surface), 0.14); border-radius: 10px; padding: 0.75rem; max-height: 520px; overflow: auto; background: rgba(var(--v-theme-surface), 0.78); }
.history-list { margin: 0; padding-left: 1rem; display: grid; gap: 0.35rem; }
.history-item { font-size: 0.92rem; }
</style>
