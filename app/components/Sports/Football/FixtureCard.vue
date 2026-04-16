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
    home: { name: string; logo?: string | null }
    away: { name: string; logo?: string | null }
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

const emit = defineEmits<{
  select: [fixtureId: number]
}>()

interface FixtureStatusChip {
  color: string
  label: string
  live?: boolean
}

const STATUS_CHIP_MAP: Record<string, FixtureStatusChip> = {
  NS: { color: 'info', label: 'À venir' },
  TBD: { color: 'info', label: 'À confirmer' },
  PST: { color: 'warning', label: 'Reporté' },
  CANC: { color: 'error', label: 'Annulé' },
  ABD: { color: 'error', label: 'Arrêté' },
  AWD: { color: 'secondary', label: 'Forfait' },
  WO: { color: 'secondary', label: 'Walkover' },
  HT: { color: 'warning', label: 'Mi-temps', live: true },
  FT: { color: 'success', label: 'Terminé' },
  AET: { color: 'success', label: 'Après prolong.' },
  PEN: { color: 'secondary', label: 'Tirs au but', live: true },
  ET: { color: 'warning', label: 'Prolongation', live: true },
  BT: { color: 'warning', label: 'Pause prolong.', live: true },
  INT: { color: 'warning', label: 'Interrompu', live: true },
  SUSP: { color: 'error', label: 'Suspendu' },
  LIVE: { color: 'error', label: 'En direct', live: true },
  '1H': { color: 'error', label: '1re MT', live: true },
  '2H': { color: 'error', label: '2e MT', live: true },
}

const statusShort = computed(() => (props.fixture.status?.short ?? 'NS').toUpperCase())

const statusChip = computed<FixtureStatusChip>(() => {
  return STATUS_CHIP_MAP[statusShort.value] ?? {
    color: 'primary',
    label: statusShort.value,
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
    return 'Date inconnue'
  }

  try {
    return formatDateTime('fr-FR', kickoff, {
      dateStyle: 'medium',
      timeStyle: 'short',
    })
  }
  catch {
    return formatDateTime('en-US', kickoff)
  }
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
</script>

<template>
  <v-card
    variant="outlined"
    class="fixture-card mb-2"
    :class="{ 'fixture-card--active': active }"
    role="button"
    tabindex="0"
    @click="selectFixture"
    @keydown.enter.prevent="selectFixture"
    @keydown.space.prevent="selectFixture"
  >
    <v-card-text class="fixture-card__content">
      <div class="d-flex align-center justify-space-between mb-3 ga-2">
        <span class="text-caption fixture-card__date">
          {{ formattedKickoff }}
        </span>
        <div class="d-flex align-center ga-2">
          <span
            v-if="elapsedLabel"
            class="text-caption font-weight-bold fixture-card__elapsed"
          >
            {{ elapsedLabel }}
          </span>
          <v-chip
            size="small"
            :color="statusChip.color"
            variant="tonal"
            class="fixture-card__status-chip"
          >
            {{ statusShort }}
          </v-chip>
        </div>
      </div>

      <div class="fixture-card__main-row">
        <div class="d-flex align-center fixture-card__team">
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
          <span class="text-truncate">{{ fixture.teams.home.name }}</span>
        </div>

        <div class="fixture-card__score" aria-label="score">
          <span class="fixture-card__score-goal">{{ homeGoals }}</span>
          <span class="fixture-card__score-separator">-</span>
          <span class="fixture-card__score-goal">{{ awayGoals }}</span>
        </div>

        <div class="d-flex align-center justify-end fixture-card__team">
          <span class="text-truncate text-right">{{ fixture.teams.away.name }}</span>
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

      <div class="text-caption mt-3 text-truncate fixture-card__status-long">
        {{ fixture.status?.long || statusChip.label }}
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.fixture-card {
  cursor: pointer;
  border-color: rgba(var(--v-theme-on-surface), 0.15);
  background: rgba(var(--v-theme-surface), 1);
  transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease, background-color 180ms ease;
}

.fixture-card__content {
  padding: 14px 14px 12px;
}

.fixture-card__date,
.fixture-card__status-long {
  color: rgba(var(--v-theme-on-surface), 0.74);
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

.fixture-card__score {
  min-width: 74px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  text-align: center;
}

.fixture-card__score-goal {
  min-width: 14px;
  font-size: 1.35rem;
  line-height: 1;
  font-weight: 800;
  color: rgba(var(--v-theme-on-surface), 0.96);
}

.fixture-card__score-separator {
  color: rgba(var(--v-theme-on-surface), 0.48);
  font-weight: 700;
}

.fixture-card__elapsed {
  color: rgb(var(--v-theme-error));
}

.fixture-card__status-chip {
  font-weight: 700;
  letter-spacing: 0.02em;
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
    min-width: 62px;
    gap: 4px;
  }

  .fixture-card__score-goal {
    font-size: 1.2rem;
  }
}
</style>
