<script setup lang="ts">
import type {
  FootballSection,
  FixtureEventViewModel,
  FixtureLineupViewModel,
  FixturePlayerStatViewModel,
} from '~/composables/useFootballData'
import SportsFootballFixtureDetailsPanel from '~/components/Sports/Football/FixtureDetailsPanel.vue'

defineProps<{
  section: FootballSection
  events: FixtureEventViewModel[]
  lineups: FixtureLineupViewModel[]
  playerStats: FixturePlayerStatViewModel[]
}>()
</script>

<template>
  <v-card class="h-100 football-surface football-surface--dark football-interactive-card" variant="outlined">
    <v-card-title>{{ section.title }}</v-card-title>
    <v-divider />
    <v-card-text>
      <template v-if="section.state === 'loading'">
        <v-progress-circular indeterminate color="primary" size="22" class="mr-3" />
        <span>Loading fixture details…</span>
      </template>
      <v-alert v-else-if="section.state === 'error'" type="error" variant="tonal" density="comfortable">
        {{ section.error }}
      </v-alert>
      <v-alert v-else-if="section.state === 'empty'" type="info" variant="tonal" density="comfortable">
        {{ section.emptyMessage }}
      </v-alert>
      <SportsFootballFixtureDetailsPanel
        v-else
        :events="events"
        :lineups="lineups"
        :player-stats="playerStats"
      />
    </v-card-text>
  </v-card>
</template>
