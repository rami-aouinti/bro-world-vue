<script setup lang="ts">
import { computed, ref, watch, watchEffect } from "vue";
import type { GameAsidePanelState } from "./types";
import {
  NONOGRAM_PUZZLES,
  type NonogramDifficulty,
  type NonogramPuzzle,
} from "~/data/games/nonogram-puzzles";
const { t } = useI18n();

const props = defineProps<{
  selectedPlayMode: "ai";
}>();
const emit = defineEmits<{
  (event: "panel-state", payload: GameAsidePanelState): void;
  (event: "game-finished", payload: { result: "win" | "lose" }): void;
}>();

type PlayerCell = "empty" | "filled" | "marked";

const difficulty = ref<NonogramDifficulty>("small");
const difficultyLevels: NonogramDifficulty[] = ["small", "medium", "large"];
const puzzleIndex = ref(0);
const victory = ref(false);
const gameFinishedEmitted = ref(false);

const currentPuzzle = computed<NonogramPuzzle>(
  () => NONOGRAM_PUZZLES[difficulty.value][puzzleIndex.value],
);

const createPlayerGrid = (puzzle: NonogramPuzzle) =>
  puzzle.grid.map((row) => row.map((): PlayerCell => "empty"));

const playerGrid = ref<PlayerCell[][]>(createPlayerGrid(currentPuzzle.value));

const gridSizeClass = computed(() => {
  if (difficulty.value === "small") return "grid-small";
  if (difficulty.value === "medium") return "grid-medium";
  return "grid-large";
});

const sequenceFromLine = (line: number[]) => {
  const sequences: number[] = [];
  let count = 0;

  for (const value of line) {
    if (value === 1) {
      count += 1;
    } else if (count > 0) {
      sequences.push(count);
      count = 0;
    }
  }

  if (count > 0) {
    sequences.push(count);
  }

  return sequences.length ? sequences : [0];
};

const rowHints = computed(() =>
  currentPuzzle.value.grid.map((row) => sequenceFromLine(row)),
);

const columnHints = computed(() => {
  const width = currentPuzzle.value.grid[0]?.length ?? 0;
  const columns: number[][] = [];

  for (let col = 0; col < width; col += 1) {
    const column = currentPuzzle.value.grid.map((row) => row[col]);
    columns.push(sequenceFromLine(column));
  }

  return columns;
});

const maxColumnHintDepth = computed(() =>
  Math.max(...columnHints.value.map((hints) => hints.length), 1),
);

const selectDifficulty = (level: NonogramDifficulty) => {
  difficulty.value = level;
  puzzleIndex.value = 0;
};

const nextPuzzle = () => {
  const puzzles = NONOGRAM_PUZZLES[difficulty.value];
  puzzleIndex.value = (puzzleIndex.value + 1) % puzzles.length;
};

const resetGrid = () => {
  playerGrid.value = createPlayerGrid(currentPuzzle.value);
  victory.value = false;
  gameFinishedEmitted.value = false;
};

const checkVictory = () => {
  const solved = currentPuzzle.value.grid.every((row, rowIndex) =>
    row.every((value, colIndex) => {
      const cell = playerGrid.value[rowIndex][colIndex];

      if (value === 1) {
        return cell === "filled";
      }

      return cell !== "filled";
    }),
  );

  victory.value = solved;
};

const fillCell = (row: number, col: number) => {
  const current = playerGrid.value[row][col];
  playerGrid.value[row][col] = current === "filled" ? "empty" : "filled";
  checkVictory();
};

const markCellAsEmpty = (row: number, col: number) => {
  const current = playerGrid.value[row][col];
  playerGrid.value[row][col] = current === "marked" ? "empty" : "marked";
  checkVictory();
};

watch(currentPuzzle, () => {
  resetGrid();
});

watch(victory, (hasWon) => {
  if (!hasWon || gameFinishedEmitted.value) {
    return;
  }

  gameFinishedEmitted.value = true;
  emit("game-finished", { result: "win" });
});

const panelState = computed<GameAsidePanelState>(() => ({
  gameKey: "nonogram",
  title: t("gameComponents.nonogram.puzzle"),
  phase: t(`common.size.${difficulty.value}`),
  turnLabel: props.selectedPlayMode.toUpperCase(),
  status: victory.value
    ? t("gameComponents.nonogram.victory")
    : t("gameComponents.nonogram.instructions"),
  highlights: [
    `${t("gameComponents.nonogram.puzzle")}: ${currentPuzzle.value.name}`,
    `${t("gameComponents.nonogram.mode")} ${props.selectedPlayMode.toUpperCase()}`,
  ],
  kpis: [
    {
      id: "width",
      label: "Cols",
      value: currentPuzzle.value.grid[0]?.length ?? 0,
      variant: "outlined",
    },
    {
      id: "height",
      label: "Rows",
      value: currentPuzzle.value.grid.length,
      variant: "outlined",
    },
  ],
  actions: [
    { id: "next", label: t("gameComponents.nonogram.actions.nextPuzzle") },
    { id: "reset", label: t("gameComponents.nonogram.actions.reset") },
  ],
}));

watchEffect(() => {
  emit("panel-state", panelState.value);
});

const handleAsideAction = (actionId: string) => {
  if (actionId === "next") {
    nextPuzzle();
    return;
  }

  if (actionId === "reset") {
    resetGrid();
  }
};

defineExpose({
  handleAsideAction,
});
</script>

<template>
  <v-card class="nonogram pa-4" variant="outlined">
    <div class="d-flex flex-wrap align-center ga-2 mb-4">
      <v-chip prepend-icon="mdi-robot" color="info" variant="tonal"
        >{{ t("gameComponents.nonogram.mode") }}
        {{ props.selectedPlayMode.toUpperCase() }}</v-chip
      >
      <v-chip color="primary" variant="outlined"
        >{{ t("gameComponents.nonogram.puzzle") }}:
        {{ currentPuzzle.name }}</v-chip
      >
      <v-spacer />
      <v-btn
        v-for="level in difficultyLevels"
        :key="level"
        size="small"
        :variant="difficulty === level ? 'flat' : 'outlined'"
        color="primary"
        @click="selectDifficulty(level)"
      >
        {{ t(`common.size.${level}`) }}
      </v-btn>
    </div>

    <div class="d-flex align-start ga-3">
      <div class="row-hints">
        <div
          v-for="(hints, rowIndex) in rowHints"
          :key="`row-hint-${rowIndex}`"
          class="hint-line"
        >
          {{ hints.join(" ") }}
        </div>
      </div>

      <div class="grid-wrapper">
        <div
          class="column-hints"
          :style="{ gridTemplateColumns: `repeat(${columnHints.length}, 1fr)` }"
        >
          <div
            v-for="(hints, colIndex) in columnHints"
            :key="`col-hint-${colIndex}`"
            class="hint-column"
          >
            <span
              v-for="hintIndex in maxColumnHintDepth"
              :key="`col-${colIndex}-hint-${hintIndex}`"
              class="hint-column-item"
            >
              {{
                hints[hints.length - maxColumnHintDepth + hintIndex - 1] ?? ""
              }}
            </span>
          </div>
        </div>

        <div class="nonogram-grid" :class="gridSizeClass">
          <button
            v-for="(cell, index) in playerGrid.flat()"
            :key="`cell-${index}`"
            class="nonogram-cell"
            :class="{
              filled: cell === 'filled',
              marked: cell === 'marked',
            }"
            @click="
              fillCell(
                Math.floor(index / currentPuzzle.grid[0].length),
                index % currentPuzzle.grid[0].length,
              )
            "
            @contextmenu.prevent="
              markCellAsEmpty(
                Math.floor(index / currentPuzzle.grid[0].length),
                index % currentPuzzle.grid[0].length,
              )
            "
          >
            <span v-if="cell === 'marked'">×</span>
          </button>
        </div>
      </div>
    </div>

    <v-alert v-if="victory" type="success" variant="tonal" class="mt-4">
      {{ t("gameComponents.nonogram.victory") }}
    </v-alert>

    <p class="text-caption mt-3 mb-0">
      {{ t("gameComponents.nonogram.instructions") }}
    </p>
  </v-card>
</template>

<style scoped>
.nonogram {
  border-radius: 16px;
}

.row-hints {
  display: grid;
  gap: 2px;
  margin-top: 34px;
}

.hint-line {
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  font-size: 0.78rem;
  color: rgba(var(--v-theme-on-surface), 0.8);
  font-weight: 700;
  min-width: 52px;
}

.grid-wrapper {
  overflow: auto;
}

.column-hints {
  display: grid;
  gap: 2px;
  margin-bottom: 4px;
}

.hint-column {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  align-items: center;
  min-height: 28px;
}

.hint-column-item {
  min-height: 14px;
  font-size: 0.72rem;
  color: rgba(var(--v-theme-on-surface), 0.8);
  font-weight: 700;
}

.nonogram-grid {
  display: grid;
  gap: 2px;
  background: rgba(var(--v-theme-on-surface), 0.16);
  padding: 2px;
  border-radius: 8px;
}

.grid-small {
  grid-template-columns: repeat(5, 32px);
}

.grid-medium {
  grid-template-columns: repeat(8, 32px);
}

.grid-large {
  grid-template-columns: repeat(10, 28px);
}

.nonogram-cell {
  width: 100%;
  height: 32px;
  border: 0;
  background: rgb(var(--v-theme-surface));
  color: rgba(var(--v-theme-on-surface), 0.62);
  font-size: 1.05rem;
  cursor: pointer;
  user-select: none;
}

.grid-large .nonogram-cell {
  height: 28px;
}

.nonogram-cell.filled {
  background: rgb(var(--v-theme-primary));
}

.nonogram-cell.marked {
  background: rgba(var(--v-theme-on-surface), 0.08);
}
</style>
