<script setup lang="ts">
import BoardTablePlaySurface from '~/components/games/play/BoardTablePlaySurface.vue'
import type { GameSurfaceProps } from '~/components/games/surfaces/types'

const props = defineProps<GameSurfaceProps>()

interface BoardPiece {
  id: string
  tone: 'light' | 'dark'
  label?: string
}

interface BoardCellRef {
  row: number
  col: number
}

const board = computed(() => {
  const stateBoard = props.gameState?.board

  if (Array.isArray(stateBoard)) {
    return stateBoard as (BoardPiece | null)[][]
  }

  const size = 8
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, col) => {
      if (row < 2 && (row + col) % 2 === 1)
        return { id: `d-${row}-${col}`, tone: 'dark' as const }
      if (row > 5 && (row + col) % 2 === 1)
        return { id: `l-${row}-${col}`, tone: 'light' as const }
      return null
    }),
  )
})

const selectedCell = computed(() => (props.gameState?.selectedCell as BoardCellRef | null) || null)
const possibleMoves = computed(() => (Array.isArray(props.gameState?.possibleMoves) ? (props.gameState?.possibleMoves as BoardCellRef[]) : []))
const lastMove = computed(() => (props.gameState?.lastMove as { from: BoardCellRef; to: BoardCellRef } | null) || null)

const boardPlayers = computed(() =>
  props.players.map((player) => ({
    id: player.id,
    name: player.name,
    side: player.side || 'light',
    score: player.score ?? '0',
    isActive: player.isActive,
  })),
)
</script>

<template>
  <BoardTablePlaySurface
    class="arena-interactive"
    :title="session?.sessionId ? `Checkers · ${session.sessionId}` : 'Checkers'"
    :board="board"
    :players="boardPlayers"
    :selected-cell="selectedCell"
    :possible-moves="possibleMoves"
    :last-move="lastMove"
  />
</template>
