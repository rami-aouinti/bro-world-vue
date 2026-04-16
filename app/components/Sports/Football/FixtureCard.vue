<script setup lang="ts">
import { computed } from 'vue'

import { formatDateTime } from '~/utils/formatDateTime'

interface FootballFixtureCardItem {
  id: number
  date: string
  status?: {
    short?: string
    long?: string
    elapsed?: number | null
  }
  teams: {
    home: { id?: number | null; name: string; logo?: string | null }
    away: { id?: number | null; name: string; logo?: string | null }
  }
  goals?: {
    home: number | null
    away: number | null
  }
}

const props = defineProps<{
  fixture: FootballFixtureCardItem
  active?: boolean
}>()
const { t, locale } = useI18n()

const emit = defineEmits<{
  select: [fixtureId: number]
  selectTeam: [teamId: number]
}>()

interface FixtureStatusChip {
  color: string
  labelKey: string
  live?: boolean
}

const STATUS_CHIP_MAP: Record<string, FixtureStatusChip> = {
  NS: { color: 'info', labelKey: 'pages.applications.football.status.NS' },
  TBD: { color: 'info', labelKey: 'pages.applications.football.status.TBD' },
  PST: { color: 'warning', labelKey: 'pages.applications.football.status.PST' },
  CANC: { color: 'error', labelKey: 'pages.applications.football.status.CANC' },
  ABD: { color: 'error', labelKey: 'pages.applications.football.status.ABD' },
  AWD: { color: 'secondary', labelKey: 'pages.applications.football.status.AWD' },
  WO: { color: 'secondary', labelKey: 'pages.applications.football.status.WO' },
  HT: { color: 'warning', labelKey: 'pages.applications.football.status.HT', live: true },
  FT: { color: 'success', labelKey: 'pages.applications.football.status.FT' },
  AET: { color: 'success', labelKey: 'pages.applications.football.status.AET' },
  PEN: { color: 'secondary', labelKey: 'pages.applications.football.status.PEN', live: true },
  ET: { color: 'warning', labelKey: 'pages.applications.football.status.ET', live: true },
  BT: { color: 'warning', labelKey: 'pages.applications.football.status.BT', live: true },
  INT: { color: 'warning', labelKey: 'pages.applications.football.status.INT', live: true },
  SUSP: { color: 'error', labelKey: 'pages.applications.football.status.SUSP' },
  LIVE: { color: 'error', labelKey: 'pages.applications.football.status.LIVE', live: true },
  '1H': { color: 'error', labelKey: 'pages.applications.football.status._1H', live: true },
  '2H': { color: 'error', labelKey: 'pages.applications.football.status._2H', live: true },
}

const statusShort = computed(() => (props.fixture.status?.short ?? 'NS').toUpperCase())

const statusChip = computed<FixtureStatusChip>(() => {
  return STATUS_CHIP_MAP[statusShort.value] ?? {
    color: 'primary',
    labelKey: '',
  }
})

const elapsedLabel = computed(() => {
  if (!statusChip.value.live) {
    return ''
  }

  const elapsed = props.fixture.status?.elapsed

  if (typeof elapsed !== 'number') {
    return ''
  }

  return `${elapsed}'`
})

const formattedKickoff = computed(() => {
  const kickoff = new Date(props.fixture.date)

  if (Number.isNaN(kickoff.getTime())) {
    return t('pages.applications.football.misc.unknownDate')
  }

  try {
    return formatDateTime(locale.value === 'fr' ? 'fr-FR' : 'en-US', kickoff, { dateStyle: 'medium' })
  }
  catch {
    return formatDateTime('en-US', kickoff)
  }
})

const longStatusLabel = computed(() => {
  if (props.fixture.status?.long) {
    return props.fixture.status.long
  }

  return statusChip.value.labelKey
    ? t(statusChip.value.labelKey)
    : statusShort.value
})

const homeGoals = computed(() => {
  return props.fixture.goals?.home ?? '-'
})

const awayGoals = computed(() => {
  return props.fixture.goals?.away ?? '-'
})

function selectFixture() {
  emit('select', props.fixture.id)
}

function selectTeam(teamId?: number | null) {
  if (typeof teamId === 'number') {
    emit('selectTeam', teamId)
  }
}
</script>

<template>
  <v-card
    variant="outlined"
    class="postcard-gradient-card fixture-card"
    :class="{ 'fixture-card--active': active }"
    role="button"
    tabindex="0"
    @click="selectFixture"
    @keydown.enter.prevent="selectFixture"
    @keydown.space.prevent="selectFixture"
  >
    <v-card-text class="fixture-card__content">
      <div class="mb-2">
        <span class="fixture-card__date">
          {{ formattedKickoff }}
        </span>
      </div>

      <div class="fixture-card__main-row">
        <div class="d-flex align-center fixture-card__team fixture-card__team--clickable" @click.stop="selectTeam(fixture.teams.home.id)">
          <v-avatar size="28" class="mr-2" color="primary" variant="tonal">
            <v-img
              v-if="fixture.teams.home.logo"
              :src="fixture.teams.home.logo"
              :alt="fixture.teams.home.name"
            />
            <span v-else class="text-caption font-weight-bold">
              {{ fixture.teams.home.name.charAt(0).toUpperCase() || '?' }}
            </span>
          </v-avatar>
          <span class="text-truncate fixture-card__team-name">{{ fixture.teams.home.name }}</span>
        </div>

        <div class="fixture-card__score" :aria-label="t('pages.applications.football.misc.score')">
          <span class="fixture-card__score-goal">{{ homeGoals }}</span>
          <span class="fixture-card__score-separator">-</span>
          <span class="fixture-card__score-goal">{{ awayGoals }}</span>
        </div>

        <div class="d-flex align-center justify-end fixture-card__team fixture-card__team--clickable" @click.stop="selectTeam(fixture.teams.away.id)">
          <span class="text-truncate text-right fixture-card__team-name">{{ fixture.teams.away.name }}</span>
          <v-avatar size="28" class="ml-2" color="primary" variant="tonal">
            <v-img
              v-if="fixture.teams.away.logo"
              :src="fixture.teams.away.logo"
              :alt="fixture.teams.away.name"
            />
            <span v-else class="text-caption font-weight-bold">
              {{ fixture.teams.away.name.charAt(0).toUpperCase() || '?' }}
            </span>
          </v-avatar>
        </div>
      </div>

      <div class="fixture-card__status-row mt-2">
        <div class="text-truncate fixture-card__status-long">
          {{ longStatusLabel }}
        </div>
        <div class="d-flex align-center ga-1">
          <span
            v-if="elapsedLabel"
            class="fixture-card__elapsed"
          >
            {{ elapsedLabel }}
          </span>
          <v-chip
            size="x-small"
            :color="statusChip.color"
            variant="tonal"
            class="fixture-card__status-chip"
          >
            {{ statusShort }}
          </v-chip>
        </div>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.fixture-card {
  cursor: pointer;
  border-color: rgba(var(--v-theme-on-surface), 0.15);
  transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease, background-color 180ms ease;
}

.fixture-card__content {
  padding: 14px 14px 12px;
}

.fixture-card__date,
.fixture-card__status-long {
  color: rgba(var(--v-theme-on-surface), 0.66);
}

.fixture-card__date {
  font-size: 0.72rem;
  line-height: 1.2;
  font-weight: 500;
}

.fixture-card__main-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.fixture-card__team {
  flex: 1;
  min-width: 0;
}
.fixture-card__team--clickable {
  cursor: pointer;
}

.fixture-card__team-name {
  font-size: 0.85rem;
  line-height: 1.2;
  font-weight: 500;
}

.fixture-card__score {
  min-width: 64px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  text-align: center;
}

.fixture-card__score-goal {
  min-width: 12px;
  font-size: 1.02rem;
  line-height: 1;
  font-weight: 700;
  color: rgba(var(--v-theme-on-surface), 0.96);
}

.fixture-card__score-separator {
  color: rgba(var(--v-theme-on-surface), 0.48);
  font-weight: 600;
  font-size: 0.9rem;
}

.fixture-card__elapsed {
  font-size: 0.68rem;
  line-height: 1;
  font-weight: 700;
  color: rgb(var(--v-theme-error));
}

.fixture-card__status-chip {
  font-weight: 700;
  letter-spacing: 0.02em;
  font-size: 0.62rem;
}

.fixture-card__status-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.fixture-card__status-long {
  font-size: 0.72rem;
  line-height: 1.2;
}

.fixture-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.62);
  box-shadow: 0 8px 20px rgba(14, 165, 233, 0.18);
  transform: translateY(-1px);
}

.fixture-card:focus-visible {
  outline: 2px solid rgba(var(--v-theme-primary), 0.9);
  outline-offset: 2px;
  border-color: rgb(var(--v-theme-primary));
}

.fixture-card--active {
  border-color: rgb(var(--v-theme-primary));
  background-color: rgba(var(--v-theme-primary), 0.08);
  box-shadow: 0 10px 24px rgba(14, 165, 233, 0.22);
}

@media (max-width: 600px) {
  .fixture-card__content {
    padding: 12px;
  }

  .fixture-card__score {
    min-width: 56px;
    gap: 3px;
  }

  .fixture-card__score-goal {
    font-size: 0.98rem;
  }
}
</style>
