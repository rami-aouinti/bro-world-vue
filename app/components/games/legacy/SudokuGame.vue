<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  watchEffect,
} from 'vue'
import type { GameAsidePanelState } from './types'
const { t } = useI18n()

const props = defineProps<{
  selectedPlayMode: 'ai' | 'pvp'
}>()
const emit = defineEmits<{
  (event: 'panel-state', payload: GameAsidePanelState): void
  (event: 'game-finished', payload: { result: 'win' | 'lose' }): void
}>()

type Difficulty = 'easy' | 'medium' | 'hard'

type Grid = number[][]

const GRID_SIZE = 9
const BLOCK_SIZE = 3

const PREFILLED_COUNT_BY_DIFFICULTY: Record<Difficulty, number> = {
  easy: 46,
  medium: 36,
  hard: 28,
}

const DIFFICULTY_MULTIPLIER: Record<Difficulty, number> = {
  easy: 1,
  medium: 1.35,
  hard: 1.75,
}

const difficulty = ref<Difficulty>('medium')
const solutionGrid = ref<Grid>([])
const playerGrid = ref<Grid>([])
const fixedCells = ref<boolean[][]>([])
const hasWon = ref(false)
const gameFinishedEmitted = ref(false)
const mistakes = ref(0)
const elapsedSeconds = ref(0)
const timerId = ref<ReturnType<typeof setInterval> | null>(null)

const shuffle = <T,>(values: T[]) => {
  const copy = [...values]

  for (let idx = copy.length - 1; idx > 0; idx -= 1) {
    const swapIdx = Math.floor(Math.random() * (idx + 1))
    ;[copy[idx], copy[swapIdx]] = [copy[swapIdx], copy[idx]]
  }

  return copy
}

const createEmptyGrid = (): Grid =>
  Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => 0),
  )

const cloneGrid = (grid: Grid): Grid => grid.map((row) => [...row])

const canPlaceNumber = (
  grid: Grid,
  row: number,
  col: number,
  value: number,
) => {
  for (let idx = 0; idx < GRID_SIZE; idx += 1) {
    if (idx !== col && grid[row][idx] === value) return false
    if (idx !== row && grid[idx][col] === value) return false
  }

  const blockRowStart = Math.floor(row / BLOCK_SIZE) * BLOCK_SIZE
  const blockColStart = Math.floor(col / BLOCK_SIZE) * BLOCK_SIZE

  for (let r = blockRowStart; r < blockRowStart + BLOCK_SIZE; r += 1) {
    for (let c = blockColStart; c < blockColStart + BLOCK_SIZE; c += 1) {
      if ((r !== row || c !== col) && grid[r][c] === value) return false
    }
  }

  return true
}

const fillGrid = (grid: Grid, cellIndex = 0): boolean => {
  if (cellIndex >= GRID_SIZE * GRID_SIZE) return true

  const row = Math.floor(cellIndex / GRID_SIZE)
  const col = cellIndex % GRID_SIZE

  if (grid[row][col] !== 0) {
    return fillGrid(grid, cellIndex + 1)
  }

  for (const value of shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9])) {
    if (!canPlaceNumber(grid, row, col, value)) {
      continue
    }

    grid[row][col] = value
    if (fillGrid(grid, cellIndex + 1)) {
      return true
    }
    grid[row][col] = 0
  }

  return false
}

const generateSolvedGrid = (): Grid => {
  const grid = createEmptyGrid()
  fillGrid(grid)
  return grid
}

const generatePlayableGrid = (
  solved: Grid,
  prefilledCount: number,
): { grid: Grid; fixed: boolean[][] } => {
  const puzzle = cloneGrid(solved)
  const fixed = Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => true),
  )

  const positions = shuffle(
    Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, idx) => ({
      row: Math.floor(idx / GRID_SIZE),
      col: idx % GRID_SIZE,
    })),
  )

  const toRemove = GRID_SIZE * GRID_SIZE - prefilledCount

  for (let idx = 0; idx < toRemove; idx += 1) {
    const { row, col } = positions[idx]
    puzzle[row][col] = 0
    fixed[row][col] = false
  }

  return { grid: puzzle, fixed }
}

const isCellConflicting = (row: number, col: number) => {
  const value = playerGrid.value[row]?.[col] ?? 0
  if (!value) return false

  for (let idx = 0; idx < GRID_SIZE; idx += 1) {
    if (idx !== col && playerGrid.value[row][idx] === value) return true
    if (idx !== row && playerGrid.value[idx][col] === value) return true
  }

  const blockRowStart = Math.floor(row / BLOCK_SIZE) * BLOCK_SIZE
  const blockColStart = Math.floor(col / BLOCK_SIZE) * BLOCK_SIZE

  for (let r = blockRowStart; r < blockRowStart + BLOCK_SIZE; r += 1) {
    for (let c = blockColStart; c < blockColStart + BLOCK_SIZE; c += 1) {
      if ((r !== row || c !== col) && playerGrid.value[r][c] === value)
        return true
    }
  }

  return false
}

const totalConflicts = computed(() => {
  let count = 0

  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      if (isCellConflicting(row, col)) {
        count += 1
      }
    }
  }

  return count
})

const isComplete = computed(
  () =>
    playerGrid.value.length > 0 &&
    playerGrid.value.every((row) =>
      row.every((value) => value >= 1 && value <= 9),
    ),
)

const formattedTime = computed(() => {
  const minutes = Math.floor(elapsedSeconds.value / 60)
    .toString()
    .padStart(2, '0')
  const seconds = (elapsedSeconds.value % 60).toString().padStart(2, '0')

  return `${minutes}:${seconds}`
})

const finalScore = computed(() => {
  if (!hasWon.value) return 0

  const base = 5000 * DIFFICULTY_MULTIPLIER[difficulty.value]
  const timePenalty = elapsedSeconds.value * 4
  const mistakesPenalty = mistakes.value * 120

  return Math.max(100, Math.round(base - timePenalty - mistakesPenalty))
})

const clearTimer = () => {
  if (!timerId.value) return
  clearInterval(timerId.value)
  timerId.value = null
}

const startTimer = () => {
  clearTimer()
  timerId.value = setInterval(() => {
    elapsedSeconds.value += 1
  }, 1000)
}

const initGame = () => {
  const solved = generateSolvedGrid()
  const prefilledCount = PREFILLED_COUNT_BY_DIFFICULTY[difficulty.value]
  const { grid, fixed } = generatePlayableGrid(solved, prefilledCount)

  solutionGrid.value = solved
  playerGrid.value = grid
  fixedCells.value = fixed
  mistakes.value = 0
  elapsedSeconds.value = 0
  hasWon.value = false
  gameFinishedEmitted.value = false
  startTimer()
}

const sanitizeValue = (rawValue: string) => {
  const cleaned = rawValue.replace(/[^1-9]/g, '').slice(-1)
  if (!cleaned) return 0
  return Number.parseInt(cleaned, 10)
}

const updateCell = (row: number, col: number, rawValue: string) => {
  if (fixedCells.value[row][col] || hasWon.value) return

  const nextValue = sanitizeValue(rawValue)
  const previousValue = playerGrid.value[row][col]

  playerGrid.value[row][col] = nextValue

  if (
    nextValue &&
    nextValue !== solutionGrid.value[row][col] &&
    nextValue !== previousValue
  ) {
    mistakes.value += 1
  }

  const won =
    isComplete.value &&
    totalConflicts.value === 0 &&
    playerGrid.value.every((gridRow, rowIdx) =>
      gridRow.every(
        (value, colIdx) => value === solutionGrid.value[rowIdx][colIdx],
      ),
    )

  if (won) {
    hasWon.value = true
    clearTimer()
  }
}

onMounted(() => {
  initGame()
})

onBeforeUnmount(() => {
  clearTimer()
})

watch(hasWon, (won) => {
  if (!won || gameFinishedEmitted.value) {
    return
  }

  gameFinishedEmitted.value = true
  emit('game-finished', { result: 'win' })
})

const panelState = computed<GameAsidePanelState>(() => ({
  gameKey: 'sudoku',
  title: t('gameComponents.sudoku.mode'),
  phase: t(`common.difficulty.${difficulty.value}`),
  turnLabel:
    props.selectedPlayMode === 'ai'
      ? t('gameComponents.sudoku.modes.assistedSolo')
      : t('gameComponents.sudoku.modes.local'),
  status: hasWon.value
    ? t('gameComponents.sudoku.win', {
        time: formattedTime.value,
        score: finalScore.value,
      })
    : `${t('gameComponents.sudoku.time')} : ${formattedTime.value}`,
  highlights: [
    `${t('gameComponents.sudoku.errors')} : ${mistakes.value}`,
    `${t('gameComponents.sudoku.conflicts')} : ${totalConflicts.value}`,
  ],
  kpis: [
    {
      id: 'time',
      label: t('gameComponents.sudoku.time'),
      value: formattedTime.value,
      color: 'primary',
      variant: 'tonal',
    },
    {
      id: 'errors',
      label: t('gameComponents.sudoku.errors'),
      value: mistakes.value,
      color: 'error',
      variant: 'outlined',
    },
    {
      id: 'conflicts',
      label: t('gameComponents.sudoku.conflicts'),
      value: totalConflicts.value,
      color: totalConflicts.value ? 'warning' : 'success',
      variant: 'outlined',
    },
  ],
  actions: [
    { id: 'new-grid', label: t('gameComponents.sudoku.actions.newGrid') },
  ],
}))

watchEffect(() => {
  emit('panel-state', panelState.value)
})

const handleAsideAction = (actionId: string) => {
  if (actionId === 'new-grid') {
    initGame()
  }
}

defineExpose({
  handleAsideAction,
})
</script>

<template>
  <div class="d-flex flex-column">
    <div class="d-flex flex-wrap align-center ga-2 mb-4">
      <v-btn
        :variant="difficulty === 'easy' ? 'flat' : 'outlined'"
        color="success"
        @click="
          difficulty = 'easy'
          initGame()
        "
      >
        {{ t('common.difficulty.easy') }}
      </v-btn>
      <v-btn
        :variant="difficulty === 'medium' ? 'flat' : 'outlined'"
        color="info"
        @click="
          difficulty = 'medium'
          initGame()
        "
      >
        {{ t('common.difficulty.medium') }}
      </v-btn>
      <v-btn
        :variant="difficulty === 'hard' ? 'flat' : 'outlined'"
        color="deep-purple"
        @click="
          difficulty = 'hard'
          initGame()
        "
      >
        {{ t('common.difficulty.hard') }}
      </v-btn>
    </div>

    <div class="sudoku-grid mb-4">
      <template
        v-for="(rowValues, rowIndex) in playerGrid"
        :key="`row-${rowIndex}`"
      >
        <input
          v-for="(cell, colIndex) in rowValues"
          :key="`cell-${rowIndex}-${colIndex}`"
          class="sudoku-cell"
          :class="{
            'is-fixed': fixedCells[rowIndex]?.[colIndex],
            'is-conflict': isCellConflicting(rowIndex, colIndex),
            'block-right': (colIndex + 1) % 3 === 0 && colIndex !== 8,
            'block-bottom': (rowIndex + 1) % 3 === 0 && rowIndex !== 8,
          }"
          :value="cell || ''"
          :disabled="fixedCells[rowIndex]?.[colIndex] || hasWon"
          inputmode="numeric"
          maxlength="1"
          @input="
            updateCell(
              rowIndex,
              colIndex,
              ($event.target as HTMLInputElement).value,
            )
          "
        />
      </template>
    </div>

    <v-alert
      v-if="hasWon"
      type="success"
      variant="tonal"
      icon="mdi-trophy-outline"
    >
      {{
        t('gameComponents.sudoku.win', {
          time: formattedTime,
          score: finalScore,
        })
      }}
    </v-alert>
  </div>
</template>

<style scoped>
.sudoku-grid {
  display: grid;
  grid-template-columns: repeat(9, minmax(0, 42px));
  gap: 0;
  width: fit-content;
  border: 2px solid rgba(var(--v-theme-on-surface), 0.6);
  justify-content: center;
  align-items: center;
  border-radius: 8px;
  overflow: hidden;
}

.sudoku-cell {
  width: 42px;
  height: 42px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.2);
  text-align: center;
  font-size: 1.05rem;
  font-weight: 600;
  color: rgb(var(--v-theme-on-surface));
  background: rgba(var(--v-theme-surface), 1);
  outline: none;
}

.sudoku-cell:focus {
  background: rgba(var(--v-theme-info), 0.12);
}

.sudoku-cell.is-fixed {
  font-weight: 800;
  background: rgba(var(--v-theme-primary), 0.16);
}

.sudoku-cell.is-conflict {
  color: rgb(var(--v-theme-error));
  background: rgba(var(--v-theme-error), 0.1);
}

.sudoku-cell.block-right {
  border-right: 2px solid rgba(var(--v-theme-on-surface), 0.65);
}

.sudoku-cell.block-bottom {
  border-bottom: 2px solid rgba(var(--v-theme-on-surface), 0.65);
}
</style>
