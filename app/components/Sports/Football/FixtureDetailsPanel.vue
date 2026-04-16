<script setup lang="ts">
import type {
  FixtureEventViewModel,
  FixtureLineupViewModel,
  FixturePlayerStatViewModel,
} from '~/composables/useFootballData'

const props = defineProps<{
  events: FixtureEventViewModel[]
  lineups: FixtureLineupViewModel[]
  playerStats: FixturePlayerStatViewModel[]
}>()

const activeTab = ref<'timeline' | 'lineups' | 'player-stats'>('timeline')
const selectedTeamFilter = ref<'all' | string>('all')

const teamFilters = computed(() => {
  const teams = new Map<string, { title: string; value: string }>()

  props.playerStats.forEach((stat) => {
    if (stat.teamId !== null) {
      teams.set(`${stat.teamId}`, {
        title: stat.teamName,
        value: `${stat.teamId}`,
      })
    }
  })

  return [{ title: 'All teams', value: 'all' }, ...teams.values()]
})

const filteredPlayerStats = computed(() => {
  if (selectedTeamFilter.value === 'all') {
    return props.playerStats
  }

  return props.playerStats.filter(
    stat => `${stat.teamId}` === selectedTeamFilter.value,
  )
})

const playerStatsHeaders = [
  { title: 'Player', key: 'playerName' },
  { title: 'Team', key: 'teamName' },
  { title: 'Rating', key: 'rating' },
  { title: 'Min', key: 'minutes' },
  { title: 'Goals', key: 'goals' },
  { title: 'Assists', key: 'assists' },
  { title: 'Shots', key: 'shots' },
  { title: 'Passes', key: 'passes' },
  { title: 'Tackles', key: 'tackles' },
]
</script>

<template>
  <div class="d-flex flex-column ga-4">
    <v-tabs v-model="activeTab" color="primary" density="comfortable">
      <v-tab value="timeline">Timeline</v-tab>
      <v-tab value="lineups">Lineups</v-tab>
      <v-tab value="player-stats">Player stats</v-tab>
    </v-tabs>

    <v-window v-model="activeTab">
      <v-window-item value="timeline">
        <v-timeline side="end" density="compact" align="start" truncate-line="both">
          <v-timeline-item
            v-for="event in events"
            :key="event.id"
            :dot-color="event.color"
            fill-dot
            size="small"
          >
            <template #icon>
              <v-icon :icon="event.icon" size="16" />
            </template>

            <div class="d-flex align-start justify-space-between flex-wrap ga-2">
              <div>
                <div class="font-weight-medium">{{ event.detail }}</div>
                <div class="text-body-2 text-medium-emphasis">
                  {{ event.playerName }} · {{ event.teamName }}
                </div>
                <div v-if="event.comment" class="text-caption text-medium-emphasis">
                  {{ event.comment }}
                </div>
              </div>
              <v-chip size="x-small" variant="outlined">{{ event.timeLabel }}</v-chip>
            </div>
          </v-timeline-item>
        </v-timeline>

        <v-alert
          v-if="!events.length"
          class="mt-2"
          type="info"
          variant="tonal"
          density="comfortable"
        >
          No event available for this fixture.
        </v-alert>
      </v-window-item>

      <v-window-item value="lineups">
        <v-row>
          <v-col
            v-for="lineup in lineups"
            :key="lineup.teamId ?? lineup.teamName"
            cols="12"
            md="6"
          >
            <v-sheet class="pa-3 rounded border">
              <div class="d-flex align-center ga-3 mb-3">
                <v-avatar size="28" rounded="0">
                  <v-img :src="lineup.teamLogo || undefined" :alt="lineup.teamName" cover />
                </v-avatar>
                <div>
                  <div class="text-subtitle-1 font-weight-bold">{{ lineup.teamName }}</div>
                  <div class="text-caption text-medium-emphasis">
                    Formation {{ lineup.formation }} · Coach {{ lineup.coachName }}
                  </div>
                </div>
              </div>

              <div class="text-overline">Starting XI</div>
              <v-list density="compact" class="pa-0 mb-2">
                <v-list-item
                  v-for="starter in lineup.starters"
                  :key="starter.id ?? `${lineup.teamName}-${starter.name}-starter`"
                  :title="starter.name"
                  :subtitle="`#${starter.number} · ${starter.position}`"
                />
              </v-list>

              <div class="text-overline">Substitutes</div>
              <v-list density="compact" class="pa-0">
                <v-list-item
                  v-for="sub in lineup.substitutes"
                  :key="sub.id ?? `${lineup.teamName}-${sub.name}-sub`"
                  :title="sub.name"
                  :subtitle="`#${sub.number} · ${sub.position}`"
                />
              </v-list>
            </v-sheet>
          </v-col>
        </v-row>

        <v-alert
          v-if="!lineups.length"
          class="mt-2"
          type="info"
          variant="tonal"
          density="comfortable"
        >
          No lineup available for this fixture.
        </v-alert>
      </v-window-item>

      <v-window-item value="player-stats">
        <div class="d-flex justify-end mb-3">
          <v-select
            v-model="selectedTeamFilter"
            :items="teamFilters"
            item-title="title"
            item-value="value"
            label="Filter team"
            density="comfortable"
            variant="outlined"
            hide-details
            max-width="260"
          />
        </div>

        <v-data-table
          :headers="playerStatsHeaders"
          :items="filteredPlayerStats"
          item-key="id"
          density="comfortable"
          class="fixture-player-stats-table"
        />

        <v-alert
          v-if="!playerStats.length"
          class="mt-2"
          type="info"
          variant="tonal"
          density="comfortable"
        >
          No player stats available for this fixture.
        </v-alert>
      </v-window-item>
    </v-window>
  </div>
</template>
