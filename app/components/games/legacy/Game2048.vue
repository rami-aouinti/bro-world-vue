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

const GRID_SIZE = 4
const STORAGE_KEY = 'bro-world:game-2048-state'
const BEST_SCORE_KEY = 'bro-world:game-2048-best-score'
const SWIPE_THRESHOLD = 30

type Direction = 'up' | 'down' | 'left' | 'right'
type Grid = number[][]

interface SavedState {
  grid: Grid
  score: number
}

const createEmptyGrid = (): Grid =>
  Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => 0),
  )

const cloneGrid = (grid: Grid): Grid => grid.map((row) => [...row])

const hasEmptyCell = (grid: Grid) =>
  grid.some((row) => row.some((cell) => cell === 0))

const addRandomTile = (grid: Grid) => {
  const emptyCells: Array<{ row: number; col: number }> = []

  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      if (grid[row][col] === 0) {
        emptyCells.push({ row, col })
      }
    }
  }

  if (!emptyCells.length) {
    return
  }

  const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)]
  grid[randomCell.row][randomCell.col] = Math.random() < 0.9 ? 2 : 4
}

const shiftAndMergeLine = (line: number[]) => {
  const compacted = line.filter((value) => value !== 0)
  const merged: number[] = []
  let gainedScore = 0

  for (let index = 0; index < compacted.length; index += 1) {
    const current = compacted[index]
    const next = compacted[index + 1]

    if (next && current === next) {
      const mergedValue = current * 2
      merged.push(mergedValue)
      gainedScore += mergedValue
      index += 1
      continue
    }

    merged.push(current)
  }

  while (merged.length < GRID_SIZE) {
    merged.push(0)
  }

  return {
    line: merged,
    gainedScore,
  }
}

const getRowsByDirection = (source: Grid, direction: Direction) => {
  if (direction === 'left' || direction === 'right') {
    return source.map((row) =>
      direction === 'left' ? [...row] : [...row].reverse(),
    )
  }

  return Array.from({ length: GRID_SIZE }, (_, col) => {
    const column = Array.from(
      { length: GRID_SIZE },
      (_, row) => source[row][col],
    )
    return direction === 'up' ? column : column.reverse()
  })
}

const applyRowsByDirection = (
  target: Grid,
  rows: Grid,
  direction: Direction,
) => {
  if (direction === 'left' || direction === 'right') {
    rows.forEach((row, rowIndex) => {
      target[rowIndex] = direction === 'left' ? row : [...row].reverse()
    })
    return
  }

  rows.forEach((column, colIndex) => {
    const normalized = direction === 'up' ? column : [...column].reverse()
    normalized.forEach((value, rowIndex) => {
      target[rowIndex][colIndex] = value
    })
  })
}

const canMove = (source: Grid) => {
  if (hasEmptyCell(source)) {
    return true
  }

  for (let row = 0; row < GRID_SIZE; row += 1) {
    for (let col = 0; col < GRID_SIZE; col += 1) {
      const value = source[row][col]
      if (col + 1 < GRID_SIZE && source[row][col + 1] === value) {
        return true
      }

      if (row + 1 < GRID_SIZE && source[row + 1][col] === value) {
        return true
      }
    }
  }

  return false
}

const grid = ref<Grid>(createEmptyGrid())
const score = ref(0)
const bestScore = ref(0)
const gameOver = ref(false)
const gameFinishedEmitted = ref(false)
const touchStart = ref<{ x: number; y: number } | null>(null)

const highestTile = computed(() => Math.max(...grid.value.flat()))
const hasWon = computed(() => highestTile.value >= 2048)

const saveState = () => {
  if (!import.meta.client) {
    return
  }

  const payload: SavedState = {
    grid: grid.value,
    score: score.value,
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  localStorage.setItem(BEST_SCORE_KEY, String(bestScore.value))
}

const refreshGameOver = () => {
  gameOver.value = !canMove(grid.value)
}

const initializeNewGame = () => {
  const nextGrid = createEmptyGrid()
  addRandomTile(nextGrid)
  addRandomTile(nextGrid)

  grid.value = nextGrid
  score.value = 0
  gameOver.value = false
  gameFinishedEmitted.value = false
  saveState()
}

const loadState = () => {
  if (!import.meta.client) {
    return
  }

  const storedBest = Number(localStorage.getItem(BEST_SCORE_KEY) ?? '0')
  bestScore.value = Number.isFinite(storedBest) ? storedBest : 0

  const rawState = localStorage.getItem(STORAGE_KEY)
  if (!rawState) {
    initializeNewGame()
    return
  }

  try {
    const parsed = JSON.parse(rawState) as Partial<SavedState>
    const parsedGrid = parsed.grid

    const validGrid =
      Array.isArray(parsedGrid) &&
      parsedGrid.length === GRID_SIZE &&
      parsedGrid.every(
        (row) =>
          Array.isArray(row) &&
          row.length === GRID_SIZE &&
          row.every((cell) => Number.isInteger(cell) && cell >= 0),
      )

    if (!validGrid || typeof parsed.score !== 'number' || parsed.score < 0) {
      initializeNewGame()
      return
    }

    grid.value = cloneGrid(parsedGrid)
    score.value = Math.floor(parsed.score)
    if (score.value > bestScore.value) {
      bestScore.value = score.value
    }
    refreshGameOver()
    saveState()
  } catch {
    initializeNewGame()
  }
}

const move = (direction: Direction) => {
  if (gameOver.value) {
    return
  }

  const source = cloneGrid(grid.value)
  const rows = getRowsByDirection(source, direction)

  let moved = false
  let gainedTotal = 0

  const transformedRows = rows.map((line) => {
    const { line: shiftedLine, gainedScore } = shiftAndMergeLine(line)
    if (!moved && shiftedLine.some((value, index) => value !== line[index])) {
      moved = true
    }
    gainedTotal += gainedScore
    return shiftedLine
  })

  if (!moved) {
    return
  }

  const nextGrid = createEmptyGrid()
  applyRowsByDirection(nextGrid, transformedRows, direction)
  addRandomTile(nextGrid)

  grid.value = nextGrid
  score.value += gainedTotal

  if (score.value > bestScore.value) {
    bestScore.value = score.value
  }

  refreshGameOver()
  saveState()
}

const handleKeydown = (event: KeyboardEvent) => {
  const map: Record<string, Direction> = {
    ArrowUp: 'up',
    ArrowDown: 'down',
    ArrowLeft: 'left',
    ArrowRight: 'right',
  }

  const direction = map[event.key]
  if (!direction) {
    return
  }

  event.preventDefault()
  move(direction)
}

const onTouchStart = (event: TouchEvent) => {
  const touch = event.touches[0]
  touchStart.value = { x: touch.clientX, y: touch.clientY }
}

const onTouchEnd = (event: TouchEvent) => {
  if (!touchStart.value) {
    return
  }

  const touch = event.changedTouches[0]
  const deltaX = touch.clientX - touchStart.value.x
  const deltaY = touch.clientY - touchStart.value.y
  touchStart.value = null

  if (
    Math.abs(deltaX) < SWIPE_THRESHOLD &&
    Math.abs(deltaY) < SWIPE_THRESHOLD
  ) {
    return
  }

  if (Math.abs(deltaX) > Math.abs(deltaY)) {
    move(deltaX > 0 ? 'right' : 'left')
    return
  }

  move(deltaY > 0 ? 'down' : 'up')
}

const getTileColor = (value: number) => {
  const colors: Record<number, string> = {
    0: '#dbe5f4',
    2: '#eef6ff',
    4: '#dceafe',
    8: '#bfdbfe',
    16: '#93c5fd',
    32: '#60a5fa',
    64: '#3b82f6',
    128: '#2563eb',
    256: '#1d4ed8',
    512: '#1e40af',
    1024: '#1e3a8a',
    2048: '#172554',
  }

  return colors[value] ?? '#0f172a'
}

onMounted(() => {
  loadState()
  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeydown)
})

watch([hasWon, gameOver], ([won, over]) => {
  if (gameFinishedEmitted.value) {
    return
  }

  if (won) {
    gameFinishedEmitted.value = true
    emit('game-finished', { result: 'win' })
    return
  }

  if (over) {
    gameFinishedEmitted.value = true
    emit('game-finished', { result: 'lose' })
  }
})

const panelState = computed<GameAsidePanelState>(() => ({
  gameKey: 'game-2048',
  title: '2048',
  phase: gameOver.value
    ? t('gameComponents.game2048.status.gameOver', { score: bestScore.value })
    : t('gameComponents.game2048.subtitle'),
  turnLabel: props.selectedPlayMode.toUpperCase(),
  status: gameOver.value
    ? t('gameComponents.game2048.status.gameOver', { score: bestScore.value })
    : t('gameComponents.game2048.status.objective', {
        tile: highestTile.value,
      }),
  highlights: [
    `${t('gameComponents.game2048.score')}: ${score.value}`,
    `${t('gameComponents.game2048.best')}: ${bestScore.value}`,
  ],
  kpis: [
    {
      id: 'score',
      label: t('gameComponents.game2048.score'),
      value: score.value,
      color: 'primary',
      variant: 'tonal',
    },
    {
      id: 'best',
      label: t('gameComponents.game2048.best'),
      value: bestScore.value,
      variant: 'outlined',
    },
    {
      id: 'tile',
      label: 'Max',
      value: highestTile.value,
      color: 'success',
      variant: 'outlined',
    },
  ],
  actions: [
    { id: 'new-game', label: t('gameComponents.game2048.actions.newGame') },
  ],
}))

watchEffect(() => {
  emit('panel-state', panelState.value)
})

const handleAsideAction = (actionId: string) => {
  if (actionId === 'new-game') {
    initializeNewGame()
  }
}

defineExpose({
  handleAsideAction,
})
</script>

<template>
  <section
    class="game-2048"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >
    <div class="header">
      <div>
        <h3 class="title">2048</h3>
        <p class="subtitle">{{ t('gameComponents.game2048.subtitle') }}</p>
      </div>
      <div class="scores">
        <div class="score-box">
          <span>{{ t('gameComponents.game2048.score') }}</span>
          <strong>{{ score }}</strong>
        </div>
        <div class="score-box">
          <span>{{ t('gameComponents.game2048.best') }}</span>
          <strong>{{ bestScore }}</strong>
        </div>
      </div>
    </div>

    <div
      class="grid"
      role="grid"
      :aria-label="t('gameComponents.game2048.aria.board')"
    >
      <div v-for="(row, rowIndex) in grid" :key="`row-${rowIndex}`" class="row">
        <div
          v-for="(tile, colIndex) in row"
          :key="`cell-${rowIndex}-${colIndex}`"
          class="cell"
          :style="{ backgroundColor: getTileColor(tile) }"
        >
          <span>{{ tile || '' }}</span>
        </div>
      </div>
    </div>

    <div class="footer">
      <p class="status">
        <template v-if="gameOver">{{
          t('gameComponents.game2048.status.gameOver', { score: bestScore })
        }}</template>
        <template v-else>{{
          t('gameComponents.game2048.status.objective', { tile: highestTile })
        }}</template>
      </p>
    </div>
  </section>
</template>

<style scoped>
.game-2048 {
  max-width: 480px;
  margin: 0 auto;
  display: grid;
  gap: 1rem;
}

.header,
.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.title {
  margin: 0;
  font-size: 1.6rem;
  font-weight: 800;
}

.subtitle,
.status {
  margin: 0;
  color: rgba(var(--v-theme-on-surface), 0.72);
}

.scores {
  display: flex;
  gap: 0.5rem;
}

.score-box {
  min-width: 86px;
  padding: 0.45rem 0.65rem;
  border-radius: 0.75rem;
  background: rgba(148, 163, 184, 0.2);
  display: grid;
  text-align: center;
}

.score-box span {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.score-box strong {
  font-size: 1.05rem;
}

.grid {
  background: rgba(148, 163, 184, 0.18);
  border-radius: 1rem;
  padding: 0.65rem;
  display: grid;
  gap: 0.5rem;
}

.row {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.5rem;
}

.cell {
  aspect-ratio: 1;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: clamp(1rem, 2vw, 1.6rem);
  font-weight: 800;
}

.footer {
  flex-wrap: wrap;
}

@media (max-width: 680px) {
  .header {
    flex-direction: column;
    align-items: flex-start;
  }

  .scores {
    width: 100%;
  }

  .score-box {
    flex: 1;
  }
}
</style>
