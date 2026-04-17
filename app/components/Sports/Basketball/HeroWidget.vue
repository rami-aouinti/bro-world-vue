<script setup lang="ts">
import type { BasketballGame } from '~/composables/useBasketballData'

const props = defineProps<{
  game: BasketballGame | null
  score: string
}>()

const emit = defineEmits<{
  select: [gameId: number]
}>()

const subtitle = computed(() => {
  if (!props.game?.date) {
    return props.game?.status?.long || 'Scheduled'
  }

  const date = new Date(props.game.date)
  const label = Number.isNaN(date.getTime()) ? props.game.date : date.toLocaleDateString()
  return `${props.game?.status?.long || 'Scheduled'} · ${label}`
})

function selectGame() {
  if (props.game) {
    emit('select', props.game.id)
  }
}
</script>

<template>
  <v-card variant="outlined" class="football-surface football-surface--glow football-interactive-card" @click="selectGame">
    <v-card-title class="d-flex align-center justify-space-between">
      <span>Featured game</span>
      <v-chip size="small" color="warning" variant="tonal">{{ game?.status?.short || 'NS' }}</v-chip>
    </v-card-title>
    <v-divider />
    <v-card-text>
      <template v-if="game">
        <div class="text-caption mb-2">{{ subtitle }}</div>
        <div class="d-flex align-center justify-space-between ga-3">
          <div class="text-body-2 font-weight-bold">{{ game.teams.home.name }}</div>
          <div class="text-h6 font-weight-bold">{{ score }}</div>
          <div class="text-body-2 font-weight-bold">{{ game.teams.away.name }}</div>
        </div>
      </template>
      <template v-else>
        <div class="text-medium-emphasis">No game available.</div>
      </template>
    </v-card-text>
  </v-card>
</template>
