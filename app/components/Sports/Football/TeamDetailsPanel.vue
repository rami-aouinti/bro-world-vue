<script setup lang="ts">
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

defineProps<{
  details: TeamDetails
  selectedPlayerId?: number | null
}>()

defineEmits<{
  selectPlayer: [playerId: number]
}>()
</script>

<template>
  <div>
    <div class="d-flex align-center mb-3">
      <v-avatar size="34" class="mr-2">
        <v-img :src="details.statistics.team.logo || undefined" />
      </v-avatar>
      <div>
        <div class="text-subtitle-1 font-weight-bold">{{ details.statistics.team.name }}</div>
        <div class="text-caption">Form: {{ details.statistics.form || 'N/A' }}</div>
      </div>
    </div>

    <v-chip-group class="mb-3">
      <v-chip color="primary" size="small">Played: {{ details.statistics.fixtures?.played?.total ?? '-' }}</v-chip>
      <v-chip color="success" size="small">Wins: {{ details.statistics.fixtures?.wins?.total ?? '-' }}</v-chip>
      <v-chip color="warning" size="small">Goals: {{ details.statistics.goals?.for?.total?.total ?? '-' }}</v-chip>
    </v-chip-group>

    <div class="text-caption mb-2">Squad (click player)</div>
    <v-list density="compact" lines="one" class="pa-0 football-list-scroll">
      <v-list-item
        v-for="player in details.squad.players"
        :key="player.id"
        :title="player.name"
        :subtitle="`${player.position || 'Unknown position'} · #${player.number ?? '-'}`"
        :active="selectedPlayerId === player.id"
        @click="$emit('selectPlayer', player.id)"
      >
        <template #prepend>
          <v-avatar size="26">
            <v-img :src="player.photo || undefined" />
          </v-avatar>
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
</style>
