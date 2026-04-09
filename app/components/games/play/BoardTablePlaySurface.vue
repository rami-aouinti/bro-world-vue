<script setup lang="ts">
interface BoardPiece {
  id: string
  tone: 'light' | 'dark'
  label?: string
}

interface BoardCellRef {
  row: number
  col: number
}

interface BoardPlayer {
  id: string
  name: string
  side: 'light' | 'dark'
  score: number | string
  isActive?: boolean
}

interface BoardTablePlaySurfaceProps {
  title?: string
  board?: (BoardPiece | null)[][]
  players?: BoardPlayer[]
  selectedCell?: BoardCellRef | null
  possibleMoves?: BoardCellRef[]
  lastMove?: { from: BoardCellRef; to: BoardCellRef } | null
}

const props = withDefaults(defineProps<BoardTablePlaySurfaceProps>(), {
  title: 'Board table',
  board: () => [],
  players: () => [],
  selectedCell: null,
  possibleMoves: () => [],
  lastMove: null
})

const isSameCell = (a: BoardCellRef | null | undefined, b: BoardCellRef) =>
  Boolean(a && a.row === b.row && a.col === b.col)

const isPossibleMove = (cell: BoardCellRef) =>
  props.possibleMoves.some((move) => move.row === cell.row && move.col === cell.col)

const isLastMoveCell = (cell: BoardCellRef) =>
  Boolean(
    props.lastMove &&
      ((props.lastMove.from.row === cell.row && props.lastMove.from.col === cell.col) ||
        (props.lastMove.to.row === cell.row && props.lastMove.to.col === cell.col))
  )
</script>

<template>
  <section class="board-surface">
    <div class="board-grid" role="grid" aria-label="8 by 8 board">
      <template v-for="(row, rowIndex) in board" :key="`row-${rowIndex}`">
        <button
          v-for="(piece, colIndex) in row"
          :key="`cell-${rowIndex}-${colIndex}`"
          type="button"
          class="board-cell"
          :class="[
              (rowIndex + colIndex) % 2 === 0 ? 'board-cell--light' : 'board-cell--dark',
              {
                'board-cell--selected': isSameCell(selectedCell, { row: rowIndex, col: colIndex }),
                'board-cell--possible': isPossibleMove({ row: rowIndex, col: colIndex }),
                'board-cell--last': isLastMoveCell({ row: rowIndex, col: colIndex })
              }
            ]"
        >
          <span v-if="piece" class="piece" :class="`piece--${piece.tone}`">{{ piece.label || '' }}</span>
        </button>
      </template>
    </div>
  </section>
</template>

<style scoped>
.board-surface {
  display: grid;
  gap: 0.9rem;
}

.board-surface__title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 700;
}

.board-surface__layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(13rem, 16rem);
  gap: 1rem;
  align-items: start;
}

.board-grid {
  max-height: 30rem;
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  aspect-ratio: 1 / 1;
  border-radius: 1rem;
  overflow: hidden;
  background: #6d4a30;
  border: 0.55rem solid #8f6545;
  box-shadow:
    inset 0 0 0 2px rgb(255 255 255 / 14%),
    inset 0 0 28px rgb(0 0 0 / 25%),
    0 14px 30px rgb(0 0 0 / 22%);
}

.board-cell {
  position: relative;
  border: none;
  margin: 0;
  padding: 0;
  display: grid;
  place-items: center;
  background: transparent;
}

.board-cell--light {
  background: linear-gradient(145deg, #d7ba94, #c6a57b);
}

.board-cell--dark {
  background: linear-gradient(145deg, #815d3f, #6f4f35);
}

.board-cell--selected {
  box-shadow: inset 0 0 0 3px rgb(91 192 235 / 96%);
}

.board-cell--possible::after {
  content: '';
  position: absolute;
  width: 32%;
  height: 32%;
  border-radius: 999px;
  background: rgb(56 217 169 / 78%);
  box-shadow: 0 0 10px rgb(56 217 169 / 45%);
}

.board-cell--last {
  box-shadow: inset 0 0 0 3px rgb(255 224 102 / 88%);
}

.piece {
  position: relative;
  z-index: 1;
  width: 62%;
  aspect-ratio: 1 / 1;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-weight: 700;
  font-size: clamp(0.7rem, 1.3vw, 0.95rem);
  box-shadow:
    inset 0 -8px 10px rgb(0 0 0 / 18%),
    0 5px 9px rgb(0 0 0 / 24%);
}

.piece--light {
  color: #473525;
  border: 1px solid rgb(255 255 255 / 62%);
  background: linear-gradient(165deg, #fcf7eb, #dbc8a5);
}

.piece--dark {
  color: #f8f8f9;
  border: 1px solid rgb(255 255 255 / 22%);
  background: linear-gradient(165deg, #2c2f37, #0f1116);
}

.score-panel {
  border-radius: 1rem;
  padding: 1rem;
  background: linear-gradient(165deg, rgb(255 255 255 / 88%), rgb(255 255 255 / 72%));
  border: 1px solid rgb(255 255 255 / 75%);
  box-shadow: 0 12px 28px rgb(0 0 0 / 14%);
}

.score-panel__title {
  margin: 0;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: rgb(var(--v-theme-on-surface), 0.62);
}

.score-player {
  margin-top: 0.7rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.7rem;
  padding: 0.5rem 0.65rem;
  border-radius: 0.75rem;
  border: 1px solid transparent;
}

.score-player--active {
  border-color: rgb(91 192 235 / 72%);
  background: rgb(91 192 235 / 10%);
}

.score-player__identity {
  display: flex;
  align-items: center;
  gap: 0.55rem;
}

.score-player p {
  margin: 0;
  font-weight: 700;
}

.score-player .piece {
  width: 1.2rem;
}

@media (max-width: 960px) {
  .board-surface__layout {
    grid-template-columns: 1fr;
  }
}
</style>
