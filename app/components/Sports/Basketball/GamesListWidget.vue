<script setup lang="ts">
import type { BasketballGame } from '~/composables/useBasketballData'
import SportsBasketballTeamAvatar from '~/components/Sports/Basketball/TeamAvatar.vue'

defineProps<{
  games: BasketballGame[]
  selectedGameId: number | null
}>()

const emit = defineEmits<{
  select: [gameId: number]
}>()

function onSelect(gameId: number) {
  emit('select', gameId)
}

const scoreOf = (value: unknown) => {
  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

const scoreLabel = (game: BasketballGame) => {
  const homeScore = scoreOf(game.scores?.home?.total ?? game.scores?.home?.points)
  const awayScore = scoreOf(game.scores?.away?.total ?? game.scores?.away?.points)
  return `${homeScore ?? '-'} - ${awayScore ?? '-'}`
}
</script>

<template>
  <v-card variant="outlined" class="pa-2">
    <v-card-title class="text-subtitle-1">Basketball games</v-card-title>
    <v-divider class="mb-2" />

    <v-alert
      v-if="!games.length"
      type="info"
      variant="tonal"
      density="comfortable"
      class="ma-2"
    >
      No games available for this league and season.
    </v-alert>

    <v-list
      v-else
      density="compact"
      lines="two"
      class="pa-0"
    >
      <v-list-item
        v-for="game in games"
        :key="game.id"
        :active="selectedGameId === game.id"
        active-class="text-primary"
        @click="onSelect(game.id)"
      >
        <template #prepend>
          <sports-basketball-team-avatar
            :team-name="game.teams.home.name"
            :logo="game.teams.home.logo"
          />
        </template>

        <v-list-item-title>
          {{ game.teams.home.name }} vs {{ game.teams.away.name }}
        </v-list-item-title>
        <v-list-item-subtitle>
          {{ scoreLabel(game) }} · {{ game.status?.short || 'NS' }}
        </v-list-item-subtitle>

        <template #append>
          <sports-basketball-team-avatar
            :team-name="game.teams.away.name"
            :logo="game.teams.away.logo"
          />
        </template>
      </v-list-item>
    </v-list>
  </v-card>
</template>
