<script setup lang="ts">
import type { FootballSection, FootballTeamDetails } from '~/composables/useFootballData'
import SportsFootballTeamDetailsPanel from '~/components/Sports/Football/TeamDetailsPanel.vue'

const { t } = useI18n()

withDefaults(defineProps<{
  section: FootballSection
  teamDetails: FootballTeamDetails | null
  selectedPlayerId: number | null
  title?: string
  loadingOverride?: boolean
}>(), {
  title: '',
  loadingOverride: false,
})

defineEmits<{
  selectPlayer: [playerId: number]
}>()
</script>

<template>
  <v-card class="h-100 football-surface football-surface--dark football-interactive-card" variant="outlined">
    <v-card-title>{{ title || section.title }}</v-card-title>
    <v-divider />
    <v-card-text>
      <template v-if="loadingOverride || section.state === 'loading'">
        <v-progress-circular indeterminate color="primary" size="22" class="mr-3" />
        <span>{{ t('pages.applications.football.loading.teamDetails') }}</span>
      </template>
      <v-alert v-else-if="section.state === 'error'" type="error" variant="tonal" density="comfortable">
        {{ section.error }}
      </v-alert>
      <v-alert v-else-if="section.state === 'empty'" type="info" variant="tonal" density="comfortable">
        {{ section.emptyMessage }}
      </v-alert>
      <template v-else-if="teamDetails">
        <SportsFootballTeamDetailsPanel
          :details="teamDetails"
          :selected-player-id="selectedPlayerId"
          @select-player="$emit('selectPlayer', $event)"
        />
      </template>
    </v-card-text>
  </v-card>
</template>
