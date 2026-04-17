<script setup lang="ts">
import type { FootballPlayerDetails, FootballSection } from '~/composables/useFootballData'
import SportsFootballPlayerDetailsPanel from '~/components/Sports/Football/PlayerDetailsPanel.vue'

const { t } = useI18n()

withDefaults(defineProps<{
  section: FootballSection
  playerDetails: FootballPlayerDetails | null
  title?: string
  loadingOverride?: boolean
}>(), {
  title: '',
  loadingOverride: false,
})
</script>

<template>
  <v-card class="h-100 football-surface football-surface--glow football-interactive-card" variant="outlined">
    <v-card-title>{{ title || section.title }}</v-card-title>
    <v-divider />
    <v-card-text>
      <template v-if="loadingOverride || section.state === 'loading'">
        <v-progress-circular indeterminate color="primary" size="22" class="mr-3" />
        <span>{{ t('pages.applications.football.loading.playerDetails') }}</span>
      </template>
      <v-alert v-else-if="section.state === 'error'" type="error" variant="tonal" density="comfortable">
        {{ section.error }}
      </v-alert>
      <v-alert v-else-if="section.state === 'empty'" type="info" variant="tonal" density="comfortable">
        {{ section.emptyMessage }}
      </v-alert>
      <SportsFootballPlayerDetailsPanel v-else-if="playerDetails?.profile" :details="playerDetails" />
    </v-card-text>
  </v-card>
</template>
