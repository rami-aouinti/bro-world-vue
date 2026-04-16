<script setup lang="ts">
import { computed } from 'vue'

import TeamHeaderCard from './TeamHeaderCard.vue'

interface SquadPlayer {
  id: number
  name: string
  age: number | null
  number: number | null
  position: string | null
  photo: string | null
}

interface TeamDetails {
  statistics: {
    team: {
      name: string
      logo?: string | null
    }
    form: string | null
    fixtures: Record<string, any>
    goals: Record<string, any>
  }
  squad: {
    players: SquadPlayer[]
  }
}

const props = defineProps<{
  details: TeamDetails
  selectedPlayerId?: number | null
}>()

defineEmits<{
  selectPlayer: [playerId: number]
}>()

const topPlayers = computed(() => props.details.squad.players.slice(0, 4))
</script>

<template>
  <div>
    <TeamHeaderCard
      :team="details.statistics.team"
      :form="details.statistics.form"
      :fixtures="details.statistics.fixtures"
      :goals="details.statistics.goals"
    />

    <div class="text-caption mb-2">Top players</div>
    <div class="d-flex flex-wrap ga-2 mb-4">
      <v-sheet
        v-for="player in topPlayers"
        :key="`top-${player.id}`"
        rounded="lg"
        border
        class="pa-2 top-player-card"
        :class="{ 'top-player-card--active': selectedPlayerId === player.id }"
        @click="$emit('selectPlayer', player.id)"
      >
        <div class="d-flex align-center ga-2">
          <v-avatar size="34">
            <v-img :src="player.photo || undefined" />
          </v-avatar>
          <div>
            <div class="text-caption font-weight-bold">{{ player.name }}</div>
            <div class="text-caption text-medium-emphasis">
              {{ player.position || 'N/A' }} · #{{ player.number ?? '-' }}
            </div>
          </div>
        </div>
      </v-sheet>
    </div>

    <div class="text-caption mb-2">Squad (click player)</div>
    <v-list density="comfortable" lines="one" class="pa-0 football-list-scroll">
      <v-list-item
        v-for="player in details.squad.players"
        :key="player.id"
        :active="selectedPlayerId === player.id"
        rounded="lg"
        class="mb-1"
        @click="$emit('selectPlayer', player.id)"
      >
        <template #prepend>
          <v-avatar size="28" class="mr-2">
            <v-img :src="player.photo || undefined" />
          </v-avatar>
        </template>

        <v-list-item-title class="text-body-2 font-weight-medium">{{ player.name }}</v-list-item-title>
        <v-list-item-subtitle>
          {{ player.position || 'Unknown position' }}
          <span class="text-medium-emphasis"> · {{ player.age ? `${player.age} yrs` : 'Age -' }}</span>
        </v-list-item-subtitle>

        <template #append>
          <div class="d-flex align-center ga-2">
            <v-chip size="x-small" variant="tonal" color="primary">#{{ player.number ?? '-' }}</v-chip>
            <v-icon
              icon="mdi-circle"
              size="10"
              :color="selectedPlayerId === player.id ? 'primary' : 'medium-emphasis'"
            />
          </div>
        </template>
      </v-list-item>
    </v-list>
  </div>
</template>

<style scoped>
.football-list-scroll {
  max-height: 360px;
  overflow: auto;
}

.top-player-card {
  cursor: pointer;
  min-width: 190px;
}

.top-player-card--active {
  border-color: rgb(var(--v-theme-primary));
  background: rgba(var(--v-theme-primary), 0.08);
}
</style>
