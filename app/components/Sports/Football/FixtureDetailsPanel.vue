<script setup lang="ts">
import type {
  FixtureEventViewModel,
  FixtureLineupViewModel,
  FixturePlayerStatViewModel,
} from '~/composables/useFootballData'

const props = withDefaults(defineProps<{
  events: FixtureEventViewModel[]
  lineups: FixtureLineupViewModel[]
  playerStats: FixturePlayerStatViewModel[]
  mode?: 'tabs' | 'single'
  initialTab?: 'timeline' | 'lineups' | 'statistics' | 'player-notes'
  homeTeamId?: number | null
  awayTeamId?: number | null
}>(), {
  mode: 'tabs',
  initialTab: 'timeline',
  homeTeamId: null,
  awayTeamId: null,
})

const emit = defineEmits<{
  selectTeam: [teamId: number]
  selectPlayer: [playerId: number]
}>()

const { t } = useI18n()

const activeTab = ref<'timeline' | 'lineups' | 'statistics' | 'player-notes'>(props.initialTab)
const selectedTeamFilter = ref<'all' | string>('all')

watch(() => props.initialTab, (value) => {
  activeTab.value = value
})

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

  return [
    { title: t('pages.applications.football.filters.allTeams'), value: 'all' },
    ...teams.values(),
  ]
})

const filteredPlayerStats = computed(() => {
  if (selectedTeamFilter.value === 'all') {
    return props.playerStats
  }

  return props.playerStats.filter(
    stat => `${stat.teamId}` === selectedTeamFilter.value,
  )
})

const teamStatsRows = computed(() => {
  const groups = new Map<number | 'unknown', { teamId: number | null; teamName: string; rating: number; goals: number; shots: number; passes: number; tackles: number }>()

  props.playerStats.forEach((stat) => {
    const key = stat.teamId ?? 'unknown'
    const row = groups.get(key) ?? {
      teamId: stat.teamId,
      teamName: stat.teamName,
      rating: 0,
      goals: 0,
      shots: 0,
      passes: 0,
      tackles: 0,
    }

    row.rating += Number(stat.rating) || 0
    row.goals += Number(stat.goals) || 0
    row.shots += Number(stat.shots) || 0
    row.passes += Number(stat.passes) || 0
    row.tackles += Number(stat.tackles) || 0

    groups.set(key, row)
  })

  return [...groups.values()].slice(0, 2)
})

const statisticsRows = computed(() => {
  const [home, away] = teamStatsRows.value
  if (!home || !away) return []

  const metrics = [
    { label: 'Rating', left: home.rating, right: away.rating },
    { label: 'Goals', left: home.goals, right: away.goals },
    { label: 'Shots', left: home.shots, right: away.shots },
    { label: 'Passes', left: home.passes, right: away.passes },
    { label: 'Tackles', left: home.tackles, right: away.tackles },
  ]

  return metrics.map((metric) => {
    const total = metric.left + metric.right
    const leftPct = total > 0 ? (metric.left / total) * 100 : 50
    return { ...metric, leftPct, rightPct: 100 - leftPct }
  })
})

const playerNotesGroups = computed(() => {
  const grouped = new Map<string, FixturePlayerStatViewModel[]>()

  filteredPlayerStats.value.forEach((stat) => {
    const group = grouped.get(stat.teamName) ?? []
    group.push(stat)
    grouped.set(stat.teamName, group)
  })

  return [...grouped.entries()].map(([teamName, players]) => ({
    teamName,
    players: [...players].sort((a, b) => (Number(b.rating) || 0) - (Number(a.rating) || 0)),
  }))
})

const lineupStarters = computed(() => {
  return props.lineups.map((lineup) => {
    const rows = Array.from({ length: 6 }, () => [] as typeof lineup.starters)
    lineup.starters.forEach((starter) => {
      const [rawRow] = starter.grid.split(':')
      const rowIndex = Math.max(1, Math.min(6, Number(rawRow) || 1)) - 1
      const row = rows[rowIndex]
      if (row) row.push(starter)
    })
    return { ...lineup, rows: rows.filter(row => row.length > 0) }
  })
})

const normalizedTeamName = (name: string | null | undefined) => {
  return (name ?? '').trim().toLowerCase()
}

const homeTeamName = computed(() => {
  return (
    props.lineups.find(lineup => lineup.teamId === props.homeTeamId)?.teamName
    ?? props.playerStats.find(stat => stat.teamId === props.homeTeamId)?.teamName
    ?? props.lineups[0]?.teamName
    ?? ''
  )
})

const awayTeamName = computed(() => {
  return (
    props.lineups.find(lineup => lineup.teamId === props.awayTeamId)?.teamName
    ?? props.playerStats.find(stat => stat.teamId === props.awayTeamId)?.teamName
    ?? props.lineups[1]?.teamName
    ?? ''
  )
})

const resolveEventSide = (event: FixtureEventViewModel): 'left' | 'right' => {
  if (props.homeTeamId !== null && event.teamId === props.homeTeamId) return 'left'
  if (props.awayTeamId !== null && event.teamId === props.awayTeamId) return 'right'

  const eventTeamName = normalizedTeamName(event.teamName)
  const homeName = normalizedTeamName(homeTeamName.value)
  const awayName = normalizedTeamName(awayTeamName.value)

  if (eventTeamName && homeName && eventTeamName.includes(homeName)) return 'left'
  if (eventTeamName && awayName && eventTeamName.includes(awayName)) return 'right'

  return 'left'
}

const timelineEvents = computed(() => {
  return props.events.map(event => ({
    ...event,
    side: resolveEventSide(event),
  }))
})

function onSelectTeam(teamId: number | null | undefined) {
  if (typeof teamId === 'number') emit('selectTeam', teamId)
}

function onSelectPlayer(playerId: number | null | undefined) {
  if (typeof playerId === 'number') emit('selectPlayer', playerId)
}
</script>

<template>
  <div class="d-flex flex-column ga-4">
    <v-tabs v-if="mode === 'tabs'" v-model="activeTab" color="primary" density="comfortable">
      <v-tab value="timeline">Timeline</v-tab>
      <v-tab value="lineups">Lineup</v-tab>
      <v-tab value="statistics">Statistics</v-tab>
      <v-tab value="player-notes">Player notes</v-tab>
    </v-tabs>

    <v-window v-model="activeTab">
      <v-window-item value="timeline">
        <div class="timeline-split" role="list">
          <div
            v-for="event in timelineEvents"
            :key="event.id"
            class="timeline-row"
            role="listitem"
          >
            <div class="timeline-col timeline-col--left">
              <article v-if="event.side === 'left'" class="timeline-card">
                <header class="timeline-card__header">
                  <v-chip size="small" variant="flat" color="primary" class="timeline-minute">{{ event.timeLabel }}</v-chip>
                  <v-icon :icon="event.icon" size="18" :color="event.color" />
                </header>
                <div class="timeline-card__title">{{ event.detail }}</div>
                <div class="timeline-card__meta text-caption">
                  <a href="#" class="timeline-link" @click.prevent="onSelectPlayer(event.playerId)">{{ event.playerName }}</a>
                  <span class="mx-1">·</span>
                  <a href="#" class="timeline-link" @click.prevent="onSelectTeam(event.teamId)">{{ event.teamName }}</a>
                </div>
                <div v-if="event.comment" class="text-caption text-medium-emphasis">{{ event.comment }}</div>
              </article>
            </div>

            <div class="timeline-axis" aria-hidden="true">
              <span class="timeline-axis__line" />
              <span class="timeline-axis__dot" :style="{ backgroundColor: `rgb(var(--v-theme-${event.color}))` }" />
            </div>

            <div class="timeline-col timeline-col--right">
              <article v-if="event.side === 'right'" class="timeline-card">
                <header class="timeline-card__header">
                  <v-chip size="small" variant="flat" color="primary" class="timeline-minute">{{ event.timeLabel }}</v-chip>
                  <v-icon :icon="event.icon" size="18" :color="event.color" />
                </header>
                <div class="timeline-card__title">{{ event.detail }}</div>
                <div class="timeline-card__meta text-caption">
                  <a href="#" class="timeline-link" @click.prevent="onSelectPlayer(event.playerId)">{{ event.playerName }}</a>
                  <span class="mx-1">·</span>
                  <a href="#" class="timeline-link" @click.prevent="onSelectTeam(event.teamId)">{{ event.teamName }}</a>
                </div>
                <div v-if="event.comment" class="text-caption text-medium-emphasis">{{ event.comment }}</div>
              </article>
            </div>
          </div>
        </div>

        <v-alert v-if="!events.length" class="mt-2" type="info" variant="tonal" density="comfortable">
          {{ t('pages.applications.football.empty.events') }}
        </v-alert>
      </v-window-item>

      <v-window-item value="lineups">
        <v-row>
          <v-col v-for="lineup in lineupStarters" :key="lineup.teamId ?? lineup.teamName" cols="12" md="6">
            <v-sheet class="pa-3 rounded border lineup-board">
              <div class="d-flex align-center ga-3 mb-3">
                <v-avatar size="28" rounded="0">
                  <v-img :src="lineup.teamLogo || undefined" :alt="lineup.teamName" cover />
                </v-avatar>
                <div>
                  <a href="#" class="lineup-team text-subtitle-1 font-weight-bold" @click.prevent="onSelectTeam(lineup.teamId)">{{ lineup.teamName }}</a>
                  <div class="text-caption text-medium-emphasis">{{ lineup.formation }} · {{ lineup.coachName }}</div>
                </div>
              </div>

              <div class="pitch pa-2">
                <div v-for="(row, index) in lineup.rows" :key="`${lineup.teamName}-row-${index}`" class="pitch-row">
                  <div v-for="player in row" :key="`${lineup.teamName}-${player.name}-${player.number}`" class="pitch-player" @click="onSelectPlayer(player.id)">
                    <div class="pitch-player__badge">#{{ player.number }}</div>
                    <div class="pitch-player__name">{{ player.name }}</div>
                  </div>
                </div>
              </div>
            </v-sheet>
          </v-col>
        </v-row>

        <v-alert v-if="!lineups.length" class="mt-2" type="info" variant="tonal" density="comfortable">
          {{ t('pages.applications.football.empty.lineups') }}
        </v-alert>
      </v-window-item>

      <v-window-item value="statistics">
        <v-sheet class="pa-3 rounded border">
          <div v-for="row in statisticsRows" :key="row.label" class="mb-4">
            <div class="d-flex align-center justify-space-between mb-1 text-body-2">
              <span>{{ row.left }}</span>
              <span class="font-weight-bold">{{ row.label }}</span>
              <span>{{ row.right }}</span>
            </div>
            <div class="stats-bar">
              <div class="stats-bar__left" :style="{ width: `${row.leftPct}%` }" />
              <div class="stats-bar__right" :style="{ width: `${row.rightPct}%` }" />
            </div>
          </div>
        </v-sheet>

        <v-alert v-if="!statisticsRows.length" class="mt-2" type="info" variant="tonal" density="comfortable">
          Not enough data for team statistics.
        </v-alert>
      </v-window-item>

      <v-window-item value="player-notes">
        <div class="d-flex justify-end mb-3">
          <v-select
            v-model="selectedTeamFilter"
            :items="teamFilters"
            item-title="title"
            item-value="value"
            :label="t('pages.applications.football.filters.team')"
            density="comfortable"
            variant="outlined"
            hide-details
            max-width="260"
          />
        </div>

        <v-sheet v-for="group in playerNotesGroups" :key="group.teamName" class="pa-3 rounded border mb-3">
          <div class="text-subtitle-2 mb-2">{{ group.teamName }}</div>
          <v-list density="compact" class="pa-0">
            <v-list-item v-for="player in group.players" :key="player.id" class="player-note-item" @click="onSelectPlayer(player.playerId)">
              <template #prepend>
                <v-avatar size="34" class="mr-2">
                  <v-img :src="player.playerPhoto || undefined" :alt="player.playerName" />
                </v-avatar>
              </template>
              <v-list-item-title class="text-body-2">{{ player.playerName }}</v-list-item-title>
              <v-list-item-subtitle>{{ player.position }}</v-list-item-subtitle>
              <template #append>
                <v-chip color="primary" size="small">{{ player.rating }}</v-chip>
              </template>
            </v-list-item>
          </v-list>
        </v-sheet>
      </v-window-item>
    </v-window>
  </div>
</template>

<style scoped>
.timeline-split { display: flex; flex-direction: column; gap: 12px; padding: 4px 0 8px; }
.timeline-row { display: grid; grid-template-columns: minmax(0, 1fr) 36px minmax(0, 1fr); gap: 14px; align-items: stretch; }
.timeline-col { min-height: 100%; }
.timeline-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  height: 100%;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(var(--v-theme-on-surface), .12);
  background: linear-gradient(180deg, rgba(var(--v-theme-surface), .94), rgba(var(--v-theme-surface), .7));
  box-shadow: 0 10px 26px rgba(0, 0, 0, .08);
}

.timeline-card__header { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.timeline-minute { min-width: 56px; justify-content: center; font-weight: 700; }
.timeline-card__title { font-size: .9rem; font-weight: 700; line-height: 1.3; }
.timeline-card__meta { display: flex; flex-wrap: wrap; align-items: center; color: rgba(var(--v-theme-on-surface), .84); }

.timeline-axis { position: relative; display: flex; justify-content: center; }
.timeline-axis__line {
  position: absolute;
  top: -8px;
  bottom: -8px;
  width: 2px;
  border-radius: 99px;
  background: linear-gradient(180deg, rgba(var(--v-theme-primary), .45), rgba(var(--v-theme-on-surface), .2));
}
.timeline-axis__dot {
  position: relative;
  top: 18px;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid rgba(var(--v-theme-surface), 1);
  box-shadow: 0 0 0 4px rgba(var(--v-theme-surface), 1);
}

.timeline-link, .lineup-team { color: rgb(var(--v-theme-primary)); text-decoration: none; }
.timeline-link:hover, .lineup-team:hover { text-decoration: underline; }
.pitch { border: 1px solid rgba(var(--v-theme-on-surface), 0.16); border-radius: 12px; background: radial-gradient(circle at center, rgba(32, 95, 79, 0.35), rgba(var(--v-theme-surface), 0.8)); }
.pitch-row { display: flex; justify-content: center; gap: 8px; margin: 10px 0; flex-wrap: wrap; }
.pitch-player { border: 1px solid rgba(var(--v-theme-on-surface), .15); border-radius: 10px; padding: 4px 8px; background: rgba(var(--v-theme-surface), .55); cursor: pointer; }
.pitch-player__badge { font-size: .68rem; color: rgba(var(--v-theme-on-surface), .75); }
.pitch-player__name { font-size: .74rem; font-weight: 600; }
.stats-bar { height: 8px; border-radius: 99px; display: flex; overflow: hidden; background: rgba(var(--v-theme-on-surface), .1); }
.stats-bar__left { background: rgb(var(--v-theme-primary)); }
.stats-bar__right { background: rgba(var(--v-theme-on-surface), .42); }
.player-note-item { border-radius: 10px; }

@media (max-width: 720px) {
  .timeline-row { grid-template-columns: minmax(0, 1fr) 24px minmax(0, 1fr); gap: 8px; }
  .timeline-card { padding: 10px; border-radius: 12px; }
  .timeline-minute { min-width: 52px; }
  .timeline-card__title { font-size: .85rem; }
  .timeline-axis__dot { top: 16px; width: 10px; height: 10px; }
}
</style>
