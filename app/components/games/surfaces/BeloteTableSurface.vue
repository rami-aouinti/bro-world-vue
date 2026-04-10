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

const trickCards = computed(() => {
  const cards = props.gameState?.communityCards
  return Array.isArray(cards) ? (cards as string[]) : ['A♣', '10♣', 'K♣', 'Q♣']
})

const handPreview = computed(() => {
  const cards = props.gameState?.playerCards
  return Array.isArray(cards) ? (cards as string[]) : ['J♦', '9♦', 'A♥', '7♠']
})
</script>

<template>
  <CardTablePlaySurface
    class="arena-interactive"
    title="Belote"
    :subtitle="
      session?.sessionId ? `Session ${session.sessionId}` : 'Table 4 joueurs'
    "
    :seats="seats"
    :community-cards="trickCards"
    :player-cards="handPreview"
  />
</template>
