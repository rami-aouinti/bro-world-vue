<script setup lang="ts">
import CardTablePlaySurface from '~/components/games/play/CardTablePlaySurface.vue'
import type { GameSurfaceProps } from '~/components/games/surfaces/types'

const props = defineProps<GameSurfaceProps>()

const seats = computed(() =>
  props.players.map((player) => ({
    id: player.id,
    name: player.name,
    stack: player.stack,
    position: player.position || 'top',
    isActive: player.isActive,
  })),
)

const communityCards = computed(() => {
  const cards = props.gameState?.communityCards
  return Array.isArray(cards) ? (cards as string[]) : ['+4', 'Skip', 'Reverse']
})

const playerCards = computed(() => {
  const cards = props.gameState?.playerCards
  return Array.isArray(cards) ? (cards as string[]) : ['Red 8', 'Blue 1', 'Wild']
})
</script>

<template>
  <CardTablePlaySurface
    class="arena-interactive"
    title="UNO"
    :subtitle="session?.sessionId ? `Session ${session.sessionId}` : 'Live game'"
    :seats="seats"
    :community-cards="communityCards"
    :player-cards="playerCards"
  />
</template>
