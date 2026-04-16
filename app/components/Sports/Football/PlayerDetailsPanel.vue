<script setup lang="ts">
import PlayerHeroCard from './PlayerHeroCard.vue'
import PlayerStatsGrid from './PlayerStatsGrid.vue'

interface PlayerDetails {
  profile: {
    name: string
    nationality: string | null
    age: number | null
    photo: string | null
    height: string | null
    weight: string | null
  } | null
  statistics: Array<Record<string, any>>
}

defineProps<{
  details: PlayerDetails
}>()
</script>

<template>
  <template v-if="details.profile">
    <PlayerHeroCard :profile="details.profile" />

    <v-expansion-panels variant="accordion">
      <v-expansion-panel
        v-for="(stat, index) in details.statistics"
        :key="`stat-${index}`"
      >
        <v-expansion-panel-title>
          {{ stat.league?.name || 'League' }} · {{ stat.team?.name || 'Team' }}
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <PlayerStatsGrid :stats="stat" />
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </template>
</template>
