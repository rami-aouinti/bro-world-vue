<script setup lang="ts">
import type {
  FootballSection,
  FootballStandingsGroup,
  FootballStandingsLeague,
} from '~/composables/useFootballData'

defineProps<{
  standings: FootballStandingsGroup[]
  standingsLeague: FootballStandingsLeague | null
  section: FootballSection
}>()

defineEmits<{
  selectTeam: [teamId: number]
}>()

const getInitial = (name: string) => name?.trim().charAt(0).toUpperCase() || '?'
</script>

<template>
  <v-card class="h-100 football-surface football-interactive-card" variant="outlined">
    <v-card-title class="d-flex align-center justify-space-between">
      <span>{{ section.title }}</span>
      <v-avatar v-if="standingsLeague?.flag" size="22" rounded="sm" class="ml-2">
        <v-img :src="standingsLeague.flag" :alt="standingsLeague.country" />
      </v-avatar>
    </v-card-title>

    <v-divider />

    <v-card-text>
      <template v-if="section.state === 'loading'">
        <v-progress-circular indeterminate color="primary" size="22" class="mr-3" />
        <span>Loading standings…</span>
      </template>

      <v-alert v-else-if="section.state === 'error'" type="error" variant="tonal" density="comfortable">
        {{ section.error }}
      </v-alert>

      <v-alert v-else-if="section.state === 'empty'" type="info" variant="tonal" density="comfortable">
        {{ section.emptyMessage }}
      </v-alert>

      <v-list v-else density="compact" lines="one" class="pa-0">
        <template v-for="group in standings" :key="group.name">
          <v-list-subheader>{{ group.name }}</v-list-subheader>
          <v-list-item
            v-for="row in group.rows"
            :key="`${group.name}-${row.team.id}`"
            class="football-interactive-item"
            :title="`${row.rank}. ${row.team.name}`"
            :subtitle="`${row.points} pts | ${row.all.played} played`"
            @click="$emit('selectTeam', row.team.id)"
          >
            <template #prepend>
              <v-avatar size="22" color="primary" variant="tonal">
                <v-img v-if="row.team.logo" :src="row.team.logo" :alt="row.team.name" />
                <span v-else class="text-caption">
                  {{ getInitial(row.team.name) }}
                </span>
              </v-avatar>
            </template>
          </v-list-item>
        </template>
      </v-list>
    </v-card-text>
  </v-card>
</template>
