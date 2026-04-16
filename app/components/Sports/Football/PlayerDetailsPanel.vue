<script setup lang="ts">
import { computed } from 'vue'
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



const props = defineProps<{
  details: PlayerDetails
}>()
const { t } = useI18n()

const normalizeStat = (stat: Record<string, any>) => {
  const games = stat?.games && typeof stat.games === 'object'
    ? {
        ...stat.games,
        appearances: stat.games?.appearances ?? stat.games?.appearences ?? '-',
      }
    : stat.games

  return {
    ...stat,
    games,
  }
}

const normalizedStatistics = computed(() => props.details.statistics.map(normalizeStat))
</script>

<template>
  <template v-if="details.profile">
    <PlayerHeroCard :profile="details.profile" />

    <v-expansion-panels variant="accordion">
      <v-expansion-panel
        v-for="(stat, index) in normalizedStatistics"
        :key="`stat-${index}`"
      >
        <v-expansion-panel-title>
          {{ (stat as Record<string, any>).league?.name || t('pages.applications.football.stats.league') }} · {{ (stat as Record<string, any>).team?.name || t('pages.applications.football.stats.team') }}
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <PlayerStatsGrid :stats="stat" />
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </template>
</template>
