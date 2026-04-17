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
  teamStatistics?: Partial<Record<'match' | 'firstHalf' | 'secondHalf', {
    home?: Partial<Record<'xg' | 'possession' | 'shotsTotal' | 'shotsOnTarget' | 'bigChances' | 'passes' | 'corners' | 'cards', string | number | null>>
    away?: Partial<Record<'xg' | 'possession' | 'shotsTotal' | 'shotsOnTarget' | 'bigChances' | 'passes' | 'corners' | 'cards', string | number | null>>
  }>>
}>(), {
  mode: 'tabs',
  initialTab: 'timeline',
  homeTeamId: null,
  awayTeamId: null,
  teamStatistics: () => ({}),
})

const emit = defineEmits<{
  selectTeam: [teamId: number]
  selectPlayer: [playerId: number]
}>()

const { t } = useI18n()

const activeTab = ref<'timeline' | 'lineups' | 'statistics' | 'player-notes'>(props.initialTab)
const selectedPlayerNotesFilter = ref<'all' | 'home' | 'away'>('all')
const lineupView = ref<'combined' | 'home' | 'away'>('combined')
const selectedStatsFilter = ref<'match' | 'firstHalf' | 'secondHalf'>('match')

watch(() => props.initialTab, (value) => {
  activeTab.value = value
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

type StatsKey = 'xg' | 'possession' | 'shotsTotal' | 'shotsOnTarget' | 'bigChances' | 'passes' | 'corners' | 'cards'
type StatsPeriod = 'match' | 'firstHalf' | 'secondHalf'

const statisticsMetricDefinitions: Array<{ key: StatsKey; label: string }> = [
  { key: 'xg', label: 'xG' },
  { key: 'possession', label: 'Possession' },
  { key: 'shotsTotal', label: 'Shots total' },
  { key: 'shotsOnTarget', label: 'Shots on target' },
  { key: 'bigChances', label: 'Big chances' },
  { key: 'passes', label: 'Passes' },
  { key: 'corners', label: 'Corners' },
  { key: 'cards', label: 'Cards' },
]

const toNumericValue = (value: string | number | null | undefined) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value !== 'string') return null
  const parsed = Number(value.replace('%', '').trim())
  return Number.isFinite(parsed) ? parsed : null
}

const normalizeStatDisplay = (value: string | number | null | undefined, key: StatsKey) => {
  if (value === null || typeof value === 'undefined' || `${value}`.trim() === '') {
    return { text: 'data unavailable', numeric: null }
  }

  if (key === 'possession') {
    const numeric = toNumericValue(value)
    if (numeric === null) return { text: 'data unavailable', numeric: null }
    return { text: `${numeric}%`, numeric }
  }

  const numeric = toNumericValue(value)
  if (numeric === null) return { text: `${value}`, numeric: null }
  if (key === 'xg') return { text: numeric.toFixed(2), numeric }
  return { text: `${numeric}`, numeric }
}

const fallbackMatchStats = computed<Record<StatsKey, { home: string | number | null; away: string | number | null }>>(() => {
  const [home, away] = teamStatsRows.value
  return {
    xg: { home: null, away: null },
    possession: { home: null, away: null },
    shotsTotal: { home: home?.shots ?? null, away: away?.shots ?? null },
    shotsOnTarget: { home: null, away: null },
    bigChances: { home: null, away: null },
    passes: { home: home?.passes ?? null, away: away?.passes ?? null },
    corners: { home: null, away: null },
    cards: { home: null, away: null },
  }
})

const availableStatsPeriods = computed<Array<{ title: string; value: StatsPeriod }>>(() => {
  const periods: Array<{ title: string; value: StatsPeriod }> = [{ title: 'Match', value: 'match' }]
  if (props.teamStatistics?.firstHalf) periods.push({ title: '1st Half', value: 'firstHalf' })
  if (props.teamStatistics?.secondHalf) periods.push({ title: '2nd Half', value: 'secondHalf' })
  return periods
})

watch(availableStatsPeriods, (periods) => {
  if (!periods.some(period => period.value === selectedStatsFilter.value)) {
    selectedStatsFilter.value = 'match'
  }
}, { immediate: true })

const statisticsRows = computed(() => {
  const periodStats = props.teamStatistics?.[selectedStatsFilter.value]
  const source = periodStats
    ? {
        xg: { home: periodStats.home?.xg ?? null, away: periodStats.away?.xg ?? null },
        possession: { home: periodStats.home?.possession ?? null, away: periodStats.away?.possession ?? null },
        shotsTotal: { home: periodStats.home?.shotsTotal ?? null, away: periodStats.away?.shotsTotal ?? null },
        shotsOnTarget: { home: periodStats.home?.shotsOnTarget ?? null, away: periodStats.away?.shotsOnTarget ?? null },
        bigChances: { home: periodStats.home?.bigChances ?? null, away: periodStats.away?.bigChances ?? null },
        passes: { home: periodStats.home?.passes ?? null, away: periodStats.away?.passes ?? null },
        corners: { home: periodStats.home?.corners ?? null, away: periodStats.away?.corners ?? null },
        cards: { home: periodStats.home?.cards ?? null, away: periodStats.away?.cards ?? null },
      }
    : fallbackMatchStats.value

  return statisticsMetricDefinitions.map((metric) => {
    const home = normalizeStatDisplay(source[metric.key].home, metric.key)
    const away = normalizeStatDisplay(source[metric.key].away, metric.key)
    const total = (home.numeric ?? 0) + (away.numeric ?? 0)
    const leftPct = total > 0 ? ((home.numeric ?? 0) / total) * 100 : 50

    return {
      label: metric.label,
      leftText: home.text,
      rightText: away.text,
      leftPct,
      rightPct: 100 - leftPct,
      unavailable: home.numeric === null || away.numeric === null,
    }
  })
})

const toNumericStat = (value: string | number | null | undefined) => {
  if (typeof value === 'number') return Number.isFinite(value) ? value : null
  if (typeof value !== 'string') return null
  const normalized = value.trim()
  if (!normalized) return null
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : null
}

type PlayerMetricKey = 'rating' | 'shots' | 'xg' | 'keyPasses' | 'tackles'

const playerMetricDefinitions: Array<{
  key: PlayerMetricKey
  label: string
  getValue: (stat: FixturePlayerStatViewModel) => number | null
  format: (value: number) => string
}> = [
  {
    key: 'rating',
    label: 'Rating',
    getValue: stat => toNumericStat(stat.rating),
    format: value => value.toFixed(2),
  },
  {
    key: 'shots',
    label: 'Shots total',
    getValue: stat => toNumericStat(stat.shots),
    format: value => `${value}`,
  },
  {
    key: 'xg',
    label: 'xG',
    getValue: (stat) => {
      const raw = (stat as FixturePlayerStatViewModel & { xg?: string | number | null; expectedGoals?: string | number | null })
      return toNumericStat(raw.xg ?? raw.expectedGoals ?? null)
    },
    format: value => value.toFixed(2),
  },
  {
    key: 'keyPasses',
    label: 'Key passes',
    getValue: (stat) => {
      const raw = (stat as FixturePlayerStatViewModel & {
        keyPasses?: string | number | null
        key_passes?: string | number | null
        passesKey?: string | number | null
      })
      return toNumericStat(raw.keyPasses ?? raw.key_passes ?? raw.passesKey ?? null)
    },
    format: value => `${value}`,
  },
  {
    key: 'tackles',
    label: 'Tackles',
    getValue: stat => toNumericStat(stat.tackles),
    format: value => `${value}`,
  },
]

const normalizedTeamKey = (name: string | null | undefined) => (name ?? '').trim().toLowerCase()

const teamVisuals = computed(() => {
  const byId = new Map<number, { teamName: string; teamLogo: string | null }>()
  const byName = new Map<string, { teamName: string; teamLogo: string | null }>()

  props.lineups.forEach((lineup) => {
    if (lineup.teamId !== null) byId.set(lineup.teamId, { teamName: lineup.teamName, teamLogo: lineup.teamLogo })
    const key = normalizedTeamKey(lineup.teamName)
    if (key) byName.set(key, { teamName: lineup.teamName, teamLogo: lineup.teamLogo })
  })

  return { byId, byName }
})

const teamMatches = (stat: FixturePlayerStatViewModel, teamId: number | null, teamName: string) => {
  if (teamId !== null && stat.teamId === teamId) return true
  const targetName = normalizedTeamKey(teamName)
  return targetName.length > 0 && normalizedTeamKey(stat.teamName) === targetName
}

const filteredPlayerNotesStats = computed(() => {
  if (selectedPlayerNotesFilter.value === 'all') return props.playerStats
  if (selectedPlayerNotesFilter.value === 'home') {
    return props.playerStats.filter(stat => teamMatches(stat, props.homeTeamId ?? null, homeTeamName.value))
  }
  return props.playerStats.filter(stat => teamMatches(stat, props.awayTeamId ?? null, awayTeamName.value))
})

const playerNotesMetricSections = computed(() => {
  return playerMetricDefinitions.map((metric) => {
    const topPlayers = filteredPlayerNotesStats.value
      .map((stat) => {
        const value = metric.getValue(stat)
        if (value === null) return null

        const visualsById = typeof stat.teamId === 'number' ? teamVisuals.value.byId.get(stat.teamId) : null
        const visuals = visualsById ?? teamVisuals.value.byName.get(normalizedTeamKey(stat.teamName))

        return {
          id: stat.id,
          playerId: stat.playerId,
          playerName: stat.playerName,
          playerPhoto: stat.playerPhoto,
          position: stat.position || 'Position unavailable',
          teamId: stat.teamId,
          teamName: visuals?.teamName ?? stat.teamName,
          teamLogo: visuals?.teamLogo ?? null,
          value,
          valueLabel: metric.format(value),
        }
      })
      .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry))
      .sort((a, b) => b.value - a.value || a.playerName.localeCompare(b.playerName))
      .slice(0, 3)
      .map((player, index) => ({ ...player, rank: index + 1 }))

    return {
      key: metric.key,
      label: metric.label,
      players: topPlayers,
      empty: topPlayers.length === 0,
    }
  })
})

const numericRating = (value: string | null | undefined) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

const getRatingColor = (rating: number | null) => {
  if (rating === null) return 'rgba(var(--v-theme-on-surface), .5)'
  if (rating >= 7.5) return 'rgb(var(--v-theme-success))'
  if (rating >= 6.8) return 'rgb(var(--v-theme-primary))'
  if (rating >= 6) return 'rgb(var(--v-theme-warning))'
  return 'rgb(var(--v-theme-error))'
}

const toShortName = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length <= 1) return name
  return `${parts[0]?.[0]}. ${parts[parts.length - 1]}`
}

const parseGrid = (grid: string) => {
  const match = grid.match(/^(\d+):(\d+)$/)
  if (!match) return null
  return { row: Number(match[1]), col: Number(match[2]) }
}

const lineupLayouts = computed(() => {
  const lower = (value: string) => value.trim().toLowerCase()

  return props.lineups.map((lineup) => {
    const valid = lineup.starters
      .map((starter) => {
        const grid = parseGrid(starter.grid)
        return grid ? { starter, ...grid } : null
      })
      .filter((entry): entry is { starter: FixtureLineupViewModel['starters'][number]; row: number; col: number } => Boolean(entry))

    const maxRow = Math.max(...valid.map(entry => entry.row), 1)
    const maxCol = Math.max(...valid.map(entry => entry.col), 1)

    const positionedPlayers = valid.map((entry) => {
      const stat = props.playerStats.find((playerStat) => {
        const sameTeam = lineup.teamId !== null
          ? playerStat.teamId === lineup.teamId
          : lower(playerStat.teamName) === lower(lineup.teamName)
        const samePlayer = entry.starter.id !== null
          ? playerStat.playerId === entry.starter.id
          : lower(playerStat.playerName) === lower(entry.starter.name)
        return sameTeam && samePlayer
      })

      const rowRatio = maxRow > 1 ? (entry.row - 1) / (maxRow - 1) : 0.5
      const colRatio = maxCol > 1 ? (entry.col - 1) / (maxCol - 1) : 0.5

      return {
        ...entry.starter,
        shortName: toShortName(entry.starter.name),
        playerPhoto: stat?.playerPhoto ?? null,
        rating: stat?.rating ?? null,
        ratingColor: getRatingColor(numericRating(stat?.rating)),
        rowRatio,
        colRatio,
        top: 10 + rowRatio * 80,
        left: 16 + colRatio * 68,
      }
    })

    const fallbackPlayers = lineup.starters.map((starter) => {
      const stat = props.playerStats.find(playerStat => playerStat.playerId === starter.id)
      return {
        ...starter,
        shortName: toShortName(starter.name),
        playerPhoto: stat?.playerPhoto ?? null,
        rating: stat?.rating ?? null,
        ratingColor: getRatingColor(numericRating(stat?.rating)),
      }
    })

    return {
      ...lineup,
      hasGrid: positionedPlayers.length > 0,
      positionedPlayers,
      fallbackPlayers,
    }
  })
})

const resolveLineupSide = (lineup: { teamId: number | null; teamName: string }, index: number): 'home' | 'away' => {
  if (props.homeTeamId !== null && lineup.teamId === props.homeTeamId) return 'home'
  if (props.awayTeamId !== null && lineup.teamId === props.awayTeamId) return 'away'

  const normalized = normalizedTeamName(lineup.teamName)
  if (normalized && normalized === normalizedTeamName(homeTeamName.value)) return 'home'
  if (normalized && normalized === normalizedTeamName(awayTeamName.value)) return 'away'

  return index === 0 ? 'home' : 'away'
}

const combinedLineup = computed(() => {
  const ordered = lineupLayouts.value
    .map((lineup, index) => ({ ...lineup, side: resolveLineupSide(lineup, index) }))
    .sort((a, b) => (a.side === 'home' ? -1 : 1) - (b.side === 'home' ? -1 : 1))

  const hasGrid = ordered.length >= 2 && ordered.every(lineup => lineup.hasGrid)

  const positionedPlayers = hasGrid
    ? ordered.flatMap((lineup) => {
      return lineup.positionedPlayers.map((player) => {
        const adjustedTop = lineup.side === 'home'
          ? 10 + (1 - player.rowRatio) * 80
          : 10 + player.rowRatio * 80

        return {
          ...player,
          teamId: lineup.teamId,
          teamName: lineup.teamName,
          teamLogo: lineup.teamLogo,
          side: lineup.side,
          top: adjustedTop,
          zIndex: 10 + Math.round(adjustedTop),
        }
      })
    })
      .sort((a, b) => a.zIndex - b.zIndex)
    : []

  return {
    hasGrid,
    lineups: ordered,
    positionedPlayers,
  }
})

const visibleLineups = computed(() => {
  if (lineupView.value === 'combined') return lineupLayouts.value

  const targetTeamId = lineupView.value === 'home' ? props.homeTeamId : props.awayTeamId
  const filteredById = lineupLayouts.value.filter(lineup => lineup.teamId !== null && lineup.teamId === targetTeamId)
  if (filteredById.length) return filteredById
  return lineupLayouts.value.slice(lineupView.value === 'home' ? 0 : 1, lineupView.value === 'home' ? 1 : 2)
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
  return props.events.map((event) => {
    const playerVisual = typeof event.playerId === 'number'
      ? props.playerStats.find(player => player.playerId === event.playerId)
      : null
    const teamVisualById = typeof event.teamId === 'number' ? teamVisuals.value.byId.get(event.teamId) : null
    const teamVisualByName = teamVisuals.value.byName.get(normalizedTeamKey(event.teamName))
    const teamVisual = teamVisualById ?? teamVisualByName ?? null

    return {
      ...event,
      side: resolveEventSide(event),
      playerPhoto: playerVisual?.playerPhoto ?? null,
      teamLogo: teamVisual?.teamLogo ?? null,
    }
  })
})

const timelineTeams = computed(() => {
  const homeLineup = props.lineups.find(lineup => lineup.teamId === props.homeTeamId) ?? props.lineups[0]
  const awayLineup = props.lineups.find(lineup => lineup.teamId === props.awayTeamId) ?? props.lineups[1]

  const home = {
    id: homeLineup?.teamId ?? props.homeTeamId ?? null,
    name: homeTeamName.value || homeLineup?.teamName || 'Home',
    logo: homeLineup?.teamLogo ?? null,
  }
  const away = {
    id: awayLineup?.teamId ?? props.awayTeamId ?? null,
    name: awayTeamName.value || awayLineup?.teamName || 'Away',
    logo: awayLineup?.teamLogo ?? null,
  }

  return { home, away }
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
    <v-tabs v-if="mode === 'tabs'" v-model="activeTab" color="primary" density="compact">
      <v-tab value="timeline">Timeline</v-tab>
      <v-tab value="lineups">Lineup</v-tab>
      <v-tab value="statistics">Statistics</v-tab>
      <v-tab value="player-notes">Player notes</v-tab>
    </v-tabs>

    <v-window v-model="activeTab">
      <v-window-item value="timeline">
        <div class="timeline-header">
          <button
            type="button"
            class="timeline-team-button"
            @click="onSelectTeam(timelineTeams.home.id)"
          >
            <v-avatar size="28" rounded="0">
              <v-img :src="timelineTeams.home.logo || undefined" :alt="timelineTeams.home.name" cover />
            </v-avatar>
            <span class="text-body-2 font-weight-bold">{{ timelineTeams.home.name }}</span>
          </button>
          <span class="text-caption text-medium-emphasis">Timeline</span>
          <button
            type="button"
            class="timeline-team-button timeline-team-button--right"
            @click="onSelectTeam(timelineTeams.away.id)"
          >
            <span class="text-body-2 font-weight-bold">{{ timelineTeams.away.name }}</span>
            <v-avatar size="28" rounded="0">
              <v-img :src="timelineTeams.away.logo || undefined" :alt="timelineTeams.away.name" cover />
            </v-avatar>
          </button>
        </div>

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
                  <a href="#" class="timeline-link timeline-link--with-avatar" @click.prevent="onSelectPlayer(event.playerId)">
                    <v-avatar size="18">
                      <v-img :src="event.playerPhoto || undefined" :alt="event.playerName" />
                    </v-avatar>
                    <span>{{ event.playerName }}</span>
                  </a>
                  <span class="mx-1">·</span>
                  <a href="#" class="timeline-link timeline-link--with-avatar" @click.prevent="onSelectTeam(event.teamId)">
                    <v-avatar size="16" rounded="0">
                      <v-img :src="event.teamLogo || undefined" :alt="event.teamName" cover />
                    </v-avatar>
                    <span>{{ event.teamName }}</span>
                  </a>
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
                  <a href="#" class="timeline-link timeline-link--with-avatar" @click.prevent="onSelectPlayer(event.playerId)">
                    <v-avatar size="18">
                      <v-img :src="event.playerPhoto || undefined" :alt="event.playerName" />
                    </v-avatar>
                    <span>{{ event.playerName }}</span>
                  </a>
                  <span class="mx-1">·</span>
                  <a href="#" class="timeline-link timeline-link--with-avatar" @click.prevent="onSelectTeam(event.teamId)">
                    <v-avatar size="16" rounded="0">
                      <v-img :src="event.teamLogo || undefined" :alt="event.teamName" cover />
                    </v-avatar>
                    <span>{{ event.teamName }}</span>
                  </a>
                </div>
                <div v-if="event.comment" class="text-caption text-medium-emphasis">{{ event.comment }}</div>
              </article>
            </div>
          </div>
        </div>

        <v-alert v-if="!events.length" class="mt-2" type="info" variant="tonal" density="compact">
          {{ t('pages.applications.football.empty.events') }}
        </v-alert>
      </v-window-item>

      <v-window-item value="lineups">
        <div class="d-flex justify-end mb-3">
          <v-btn-toggle
            v-model="lineupView"
            density="compact"
            rounded="lg"
            variant="tonal"
            color="primary"
            mandatory
            class="modal-filter-toggle"
          >
            <v-btn value="combined" size="small" class="modal-filter-toggle__btn">Combined</v-btn>
            <v-btn value="home" size="small" class="modal-filter-toggle__btn">Home team</v-btn>
            <v-btn value="away" size="small" class="modal-filter-toggle__btn">Away team</v-btn>
          </v-btn-toggle>
        </div>

        <v-sheet
          v-if="lineupView === 'combined' && combinedLineup.hasGrid"
          class="pa-3 rounded border lineup-board mb-3"
        >
          <div class="d-flex align-center justify-space-between flex-wrap ga-3 mb-3">
            <div
              v-for="lineup in combinedLineup.lineups"
              :key="`combined-header-${lineup.teamId ?? lineup.teamName}`"
              class="d-flex align-center ga-2"
            >
              <v-avatar size="26" rounded="0">
                <v-img :src="lineup.teamLogo || undefined" :alt="lineup.teamName" cover />
              </v-avatar>
              <a href="#" class="lineup-team text-body-2 font-weight-bold" @click.prevent="onSelectTeam(lineup.teamId)">
                {{ lineup.teamName }}
              </a>
            </div>
          </div>

          <div class="pitch-layout pitch-layout--combined">
            <div class="pitch-overlay pitch-overlay--combined" aria-hidden="true">
              <span class="pitch-line pitch-line--mid" />
              <span class="pitch-circle" />
              <span class="pitch-area pitch-area--top" />
              <span class="pitch-area pitch-area--bottom" />
            </div>

            <button
              v-for="player in combinedLineup.positionedPlayers"
              :key="`combined-${player.teamName}-${player.name}-${player.number}`"
              type="button"
              class="pitch-player"
              :class="`pitch-player--${player.side}`"
              :style="{ top: `${player.top}%`, left: `${player.left}%`, zIndex: player.zIndex }"
              :title="`${player.teamName} · ${player.name} (#${player.number})`"
              @click="onSelectPlayer(player.id)"
            >
              <div class="pitch-player__avatar">
                <v-avatar size="28">
                  <v-img :src="player.playerPhoto || undefined" :alt="player.name">
                    <template #error>
                      <span class="text-caption font-weight-bold">{{ player.number }}</span>
                    </template>
                  </v-img>
                </v-avatar>
                <span class="pitch-player__rating" :style="{ backgroundColor: player.ratingColor }">
                  {{ player.rating ?? '-' }}
                </span>
              </div>
              <div class="pitch-player__meta">
                <span class="pitch-player__name">{{ player.shortName }}</span>
                <span class="pitch-player__badge">#{{ player.number }}</span>
              </div>
            </button>
          </div>
        </v-sheet>

        <v-row v-if="lineupView !== 'combined' || !combinedLineup.hasGrid">
          <v-col v-for="lineup in visibleLineups" :key="lineup.teamId ?? lineup.teamName" cols="12" :md="lineupView === 'combined' ? 6 : 12">
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

              <div v-if="lineup.hasGrid" class="pitch-layout">
                <div class="pitch-overlay" aria-hidden="true">
                  <span class="pitch-line pitch-line--mid" />
                  <span class="pitch-circle" />
                  <span class="pitch-area pitch-area--top" />
                  <span class="pitch-area pitch-area--bottom" />
                </div>

                <button
                  v-for="player in lineup.positionedPlayers"
                  :key="`${lineup.teamName}-${player.name}-${player.number}`"
                  type="button"
                  class="pitch-player"
                  :style="{ top: `${player.top}%`, left: `${player.left}%` }"
                  :title="`${lineup.teamName} · ${player.name} (#${player.number})`"
                  @click="onSelectPlayer(player.id)"
                >
                  <div class="pitch-player__avatar">
                    <v-avatar size="28">
                      <v-img :src="player.playerPhoto || undefined" :alt="player.name">
                        <template #error>
                          <span class="text-caption font-weight-bold">{{ player.number }}</span>
                        </template>
                      </v-img>
                    </v-avatar>
                    <span class="pitch-player__rating" :style="{ backgroundColor: player.ratingColor }">
                      {{ player.rating ?? '-' }}
                    </span>
                  </div>
                  <div class="pitch-player__meta">
                    <span class="pitch-player__name">{{ player.shortName }}</span>
                    <span class="pitch-player__badge">#{{ player.number }}</span>
                  </div>
                </button>
              </div>

              <v-list v-else density="compact" class="lineup-fallback pa-0">
                <v-list-item
                  v-for="player in lineup.fallbackPlayers"
                  :key="`${lineup.teamName}-fallback-${player.name}-${player.number}`"
                  class="lineup-fallback__item"
                  @click="onSelectPlayer(player.id)"
                >
                  <template #prepend>
                    <v-avatar size="28">
                      <v-img :src="player.playerPhoto || undefined" :alt="player.name" />
                    </v-avatar>
                  </template>
                  <v-list-item-title class="text-body-2">
                    <a href="#" class="lineup-player-link" @click.prevent.stop="onSelectPlayer(player.id)">
                      {{ player.shortName }} · #{{ player.number }}
                    </a>
                  </v-list-item-title>
                  <v-list-item-subtitle>
                    {{ player.position || 'position unavailable' }}
                  </v-list-item-subtitle>
                  <template #append>
                    <v-chip size="x-small" :color="numericRating(player.rating) && Number(player.rating) >= 7 ? 'success' : 'default'">
                      {{ player.rating ?? '-' }}
                    </v-chip>
                  </template>
                </v-list-item>
              </v-list>

              <div v-if="!lineup.hasGrid" class="text-caption text-medium-emphasis mt-2">
                position unavailable
              </div>
            </v-sheet>
          </v-col>
        </v-row>

        <v-alert v-if="!lineups.length" class="mt-2" type="info" variant="tonal" density="compact">
          {{ t('pages.applications.football.empty.lineups') }}
        </v-alert>
      </v-window-item>

      <v-window-item value="statistics">
        <v-sheet class="stats-panel pa-4 rounded border">
          <div class="d-flex align-center justify-space-between ga-3 mb-4">
            <div class="text-subtitle-1 font-weight-bold">Top statistics</div>
            <v-btn-toggle
              v-if="availableStatsPeriods.length > 1"
              v-model="selectedStatsFilter"
              density="compact"
              rounded="lg"
              variant="tonal"
              color="primary"
              mandatory
            >
              <v-btn
                v-for="period in availableStatsPeriods"
                :key="period.value"
                :value="period.value"
                size="small"
              >
                {{ period.title }}
              </v-btn>
            </v-btn-toggle>
          </div>

          <div v-for="row in statisticsRows" :key="row.label" class="stats-row">
            <div class="stats-row__values text-body-2">
              <span class="stats-row__value stats-row__value--home">{{ row.leftText }}</span>
              <span class="stats-row__label">{{ row.label }}</span>
              <span class="stats-row__value stats-row__value--away">{{ row.rightText }}</span>
            </div>
            <div v-if="!row.unavailable" class="stats-bar">
              <div class="stats-bar__left" :style="{ width: `${row.leftPct}%` }" />
              <div class="stats-bar__right" :style="{ width: `${row.rightPct}%` }" />
            </div>
          </div>
        </v-sheet>
      </v-window-item>

      <v-window-item value="player-notes">
        <div class="d-flex justify-end mb-3">
          <v-btn-toggle
            v-model="selectedPlayerNotesFilter"
            density="compact"
            rounded="lg"
            variant="tonal"
            color="primary"
            mandatory
            class="modal-filter-toggle"
          >
            <v-btn value="all" size="small" class="modal-filter-toggle__btn">All</v-btn>
            <v-btn value="home" size="small" class="modal-filter-toggle__btn">Home team</v-btn>
            <v-btn value="away" size="small" class="modal-filter-toggle__btn">Away team</v-btn>
          </v-btn-toggle>
        </div>

        <v-sheet class="player-notes-panel pa-2 pa-sm-3 rounded border">
          <section
            v-for="section in playerNotesMetricSections"
            :key="section.key"
            class="player-metric-section"
          >
            <header class="player-metric-section__header">
              <h4 class="player-metric-section__title">{{ section.label }}</h4>
              <span class="player-metric-section__count text-caption text-medium-emphasis">
                Top {{ section.players.length }}
              </span>
            </header>

            <div v-if="section.empty" class="text-caption text-medium-emphasis py-2 px-1">
              data unavailable
            </div>

            <v-list v-else density="compact" class="pa-0 bg-transparent">
              <v-list-item
                v-for="player in section.players"
                :key="`${section.key}-${player.id}`"
                class="player-note-item player-note-item--ranked"
                @click="onSelectPlayer(player.playerId)"
              >
                <template #prepend>
                  <div class="d-flex align-center ga-2 mr-2">
                    <span class="player-rank-badge">{{ player.rank }}</span>
                    <v-avatar size="34">
                      <v-img :src="player.playerPhoto || undefined" :alt="player.playerName" />
                    </v-avatar>
                  </div>
                </template>

                <v-list-item-title class="text-body-2 font-weight-medium">
                  <a href="#" class="player-link" @click.prevent.stop="onSelectPlayer(player.playerId)">
                    {{ player.playerName }}
                  </a>
                </v-list-item-title>
                <v-list-item-subtitle class="d-flex align-center ga-2 flex-wrap">
                  <span>{{ player.position }}</span>
                  <v-chip
                    size="x-small"
                    variant="tonal"
                    class="player-team-chip"
                    @click.stop.prevent="onSelectTeam(player.teamId)"
                  >
                    <template #prepend>
                      <v-avatar v-if="player.teamLogo" size="14">
                        <v-img :src="player.teamLogo" :alt="player.teamName" />
                      </v-avatar>
                    </template>
                    {{ player.teamName }}
                  </v-chip>
                </v-list-item-subtitle>

                <template #append>
                  <span class="player-metric-value">{{ player.valueLabel }}</span>
                </template>
              </v-list-item>
            </v-list>
          </section>
        </v-sheet>
      </v-window-item>
    </v-window>
  </div>
</template>

<style scoped>
.timeline-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 12px;
}
.timeline-team-button {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  justify-self: start;
  border: 1px solid rgba(var(--v-theme-on-surface), .14);
  background: rgba(var(--v-theme-surface), .35);
  border-radius: 999px;
  padding: 6px 10px;
  color: inherit;
  cursor: pointer;
}
.timeline-team-button--right { justify-self: end; }
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
.timeline-link--with-avatar { display: inline-flex; align-items: center; gap: 6px; }

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
.lineup-player-link, .player-link { color: inherit; text-decoration: none; }
.lineup-player-link:hover, .player-link:hover { color: rgb(var(--v-theme-primary)); text-decoration: underline; }
.pitch-layout {
  position: relative;
  min-height: 520px;
  border-radius: 16px;
  border: 1px solid rgba(var(--v-theme-on-surface), .16);
  background: linear-gradient(180deg, rgba(17, 65, 52, .95), rgba(11, 48, 39, .96));
  overflow: hidden;
}
.pitch-overlay { position: absolute; inset: 0; pointer-events: none; }
.pitch-overlay--combined::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(44, 118, 214, .2) 0%, rgba(44, 118, 214, .08) 48%, transparent 52%),
    linear-gradient(0deg, rgba(221, 84, 84, .22) 0%, rgba(221, 84, 84, .08) 48%, transparent 52%);
}
.pitch-overlay::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(
    180deg,
    rgba(255, 255, 255, .04),
    rgba(255, 255, 255, .04) 32px,
    rgba(255, 255, 255, .01) 32px,
    rgba(255, 255, 255, .01) 64px
  );
}
.pitch-line--mid { position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: rgba(255, 255, 255, .45); }
.pitch-circle {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 84px;
  height: 84px;
  border-radius: 50%;
  border: 1px solid rgba(255, 255, 255, .45);
  transform: translate(-50%, -50%);
}
.pitch-area {
  position: absolute;
  left: 17%;
  right: 17%;
  height: 18%;
  border: 1px solid rgba(255, 255, 255, .45);
}
.pitch-area--top { top: 0; border-top: 0; border-radius: 0 0 12px 12px; }
.pitch-area--bottom { bottom: 0; border-bottom: 0; border-radius: 12px 12px 0 0; }
.pitch-player {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 0;
  background: transparent;
  cursor: pointer;
  z-index: 2;
  width: 76px;
}
.pitch-player__avatar { position: relative; margin-bottom: 4px; }
.pitch-player__rating {
  position: absolute;
  bottom: -3px;
  right: -14px;
  color: #fff;
  font-size: .62rem;
  line-height: 1;
  font-weight: 700;
  padding: 2px 4px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, .35);
}
.pitch-player__meta {
  width: 100%;
  text-align: center;
  border-radius: 10px;
  padding: 4px 6px;
  background: rgba(7, 18, 15, .62);
  border: 1px solid rgba(255, 255, 255, .12);
}
.pitch-player--home .pitch-player__avatar { filter: drop-shadow(0 0 8px rgba(242, 86, 86, .55)); }
.pitch-player--away .pitch-player__avatar { filter: drop-shadow(0 0 8px rgba(82, 151, 255, .55)); }
.pitch-player__badge { display: block; font-size: .62rem; color: rgba(255, 255, 255, .78); }
.pitch-player__name { display: block; font-size: .66rem; font-weight: 700; color: rgba(255, 255, 255, .96); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.lineup-fallback { border: 1px solid rgba(var(--v-theme-on-surface), .12); border-radius: 12px; }
.lineup-fallback__item { border-radius: 10px; margin: 2px 4px; }
.stats-panel {
  background: linear-gradient(180deg, rgba(var(--v-theme-surface), .95), rgba(var(--v-theme-surface), .72));
}
.stats-row { display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px; }
.stats-row:last-child { margin-bottom: 0; }
.stats-row__values {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 10px;
}
.stats-row__value { font-weight: 700; }
.stats-row__value--home { text-align: left; color: rgb(var(--v-theme-primary)); }
.stats-row__value--away { text-align: right; color: rgba(var(--v-theme-on-surface), .92); }
.stats-row__label {
  text-align: center;
  font-size: .75rem;
  text-transform: uppercase;
  letter-spacing: .04em;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), .72);
}
.stats-bar { height: 8px; border-radius: 99px; display: flex; overflow: hidden; background: rgba(var(--v-theme-on-surface), .12); }
.stats-bar__left { background: linear-gradient(90deg, rgba(var(--v-theme-primary), .7), rgb(var(--v-theme-primary))); }
.stats-bar__right { background: rgba(var(--v-theme-on-surface), .42); }
.stats-bar--muted { opacity: .7; }
.modal-filter-toggle {
  background: rgba(var(--v-theme-surface), .42);
  border: 1px solid rgba(var(--v-theme-on-surface), .12);
  padding: 2px;
}
.modal-filter-toggle__btn {
  text-transform: none;
  letter-spacing: 0;
  font-weight: 600;
}
.player-notes-panel {
  background: linear-gradient(180deg, rgba(18, 20, 30, .82), rgba(11, 13, 20, .66));
}
.player-metric-section {
  padding: 10px 8px 6px;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), .12);
}
.player-metric-section:last-child { border-bottom: 0; }
.player-metric-section__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
  padding: 0 4px;
}
.player-metric-section__title {
  font-size: .8rem;
  text-transform: uppercase;
  letter-spacing: .05em;
  font-weight: 800;
  margin: 0;
  color: rgba(var(--v-theme-on-surface), .8);
}
.player-note-item { border-radius: 10px; }
.player-note-item--ranked { margin-bottom: 2px; }
.player-rank-badge {
  min-width: 22px;
  height: 22px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: .7rem;
  font-weight: 800;
  color: rgb(var(--v-theme-primary));
  border: 1px solid rgba(var(--v-theme-primary), .5);
  background: rgba(var(--v-theme-primary), .14);
}
.player-team-chip { cursor: pointer; }
.player-metric-value {
  min-width: 46px;
  text-align: right;
  font-size: .82rem;
  font-weight: 800;
  color: rgb(var(--v-theme-primary));
}

@media (max-width: 720px) {
  .timeline-header { gap: 8px; }
  .timeline-team-button { padding: 4px 8px; font-size: .75rem; }
  .timeline-row { grid-template-columns: minmax(0, 1fr) 24px minmax(0, 1fr); gap: 8px; }
  .timeline-card { padding: 10px; border-radius: 12px; }
  .timeline-minute { min-width: 52px; }
  .timeline-card__title { font-size: .85rem; }
  .timeline-axis__dot { top: 16px; width: 10px; height: 10px; }
  .pitch-layout { min-height: 420px; }
  .pitch-player { width: 68px; }
  .pitch-player__name { font-size: .62rem; }
}
</style>
