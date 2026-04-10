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
  return Array.isArray(cards)
    ? (cards as string[])
    : ['A♠', '10♥', '7♣', '2♦', 'K♠']
})

const playerCards = computed(() => {
  const cards = props.gameState?.playerCards
  return Array.isArray(cards) ? (cards as string[]) : ['Q♣', 'Q♦']
})
</script>

<template>
  <CardTablePlaySurface
    class="arena-interactive"
    title="Poker"
    :subtitle="
      session?.sessionId ? `Session ${session.sessionId}` : 'Cash table'
    "
    :seats="seats"
    :community-cards="communityCards"
    :player-cards="playerCards"
  />
</template>
