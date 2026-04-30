<script setup lang="ts">
import { computed } from 'vue'
import type { GameSurfaceProps } from '~/components/games/surfaces/types'
import ChessGame from '~/components/games/legacy/ChessGame.vue'
import CheckersGame from '~/components/games/legacy/CheckersGame.vue'
import LudoGame from '~/components/games/legacy/LudoGame.vue'
import SudokuGame from '~/components/games/legacy/SudokuGame.vue'
import Game2048 from '~/components/games/legacy/Game2048.vue'
import HiddenWordGame from '~/components/games/legacy/HiddenWordGame.vue'
import NonogramGame from '~/components/games/legacy/NonogramGame.vue'

const props = defineProps<GameSurfaceProps>()

const gameKey = computed(() =>
  String((props.gameState?.gameKey as string | undefined) || '').toLowerCase(),
)

const selectedPlayMode = computed<'ai' | 'pvp'>(() => {
  const mode = String(props.gameState?.selectedPlayMode || '').toLowerCase()
  return mode === 'pvp' ? 'pvp' : 'ai'
})

const componentMap = {
  chess: ChessGame,
  checkers: CheckersGame,
  ludo: LudoGame,
  sudoku: SudokuGame,
  'game-2048': Game2048,
  game2048: Game2048,
  'hidden-word': HiddenWordGame,
  hiddenword: HiddenWordGame,
  nonogram: NonogramGame,
} as const

const resolvedGameComponent = computed(() => {
  const normalized = gameKey.value.replace(/[^a-z0-9-]/gi, '')
  return componentMap[normalized as keyof typeof componentMap] || CheckersGame
})
</script>

<template>
  <component
    :is="resolvedGameComponent"
    :selected-play-mode="selectedPlayMode"
  />
</template>
