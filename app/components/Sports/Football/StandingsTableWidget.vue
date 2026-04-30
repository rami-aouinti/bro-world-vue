<script setup lang="ts">
import { computed } from 'vue'
import type {
  FootballSection,
  FootballStandingRow,
  FootballStandingsGroup,
  FootballStandingsLeague,
} from '~/composables/useFootballData'

interface ZoneRules {
  qualification: number
  relegation: number
}

const props = withDefaults(
  defineProps<{
    standings: FootballStandingsGroup[]
    standingsLeague: FootballStandingsLeague | null
    section: FootballSection
    zoneRules?: Partial<ZoneRules>
  }>(),
  {
    zoneRules: () => ({
      qualification: 4,
      relegation: 3,
    }),
  },
)
const { t } = useI18n()

const emit = defineEmits<{
  selectTeam: [teamId: number]
}>()

const mergedZoneRules = computed<ZoneRules>(() => ({
  qualification: Math.max(0, props.zoneRules.qualification ?? 4),
  relegation: Math.max(0, props.zoneRules.relegation ?? 3),
}))

const getInitial = (name: string) => name?.trim().charAt(0).toUpperCase() || '?'

const normalizeText = (value: string | null | undefined) =>
  (value || '').toLowerCase().trim()

const getZoneFromApi = (row: FootballStandingRow) => {
  const description = normalizeText(row.description)
  const status = normalizeText(row.status)

  if (
    /champions|qualification|qualifying|play-offs|europa|conference|promotion|title/.test(
      `${description} ${status}`,
    )
  ) {
    return 'qualification'
  }

  if (/relegation|demotion/.test(`${description} ${status}`)) {
    return 'relegation'
  }

  return null
}

const getZoneFromDefaultRules = (
  row: FootballStandingRow,
  rowsCount: number,
) => {
  if (row.rank <= mergedZoneRules.value.qualification) {
    return 'qualification'
  }

  if (row.rank > rowsCount - mergedZoneRules.value.relegation) {
    return 'relegation'
  }

  return null
}

const getZone = (row: FootballStandingRow, rowsCount: number) => {
  return getZoneFromApi(row) ?? getZoneFromDefaultRules(row, rowsCount)
}

const getZoneClass = (row: FootballStandingRow, rowsCount: number) => {
  const zone = getZone(row, rowsCount)

  if (!zone) {
    return ''
  }

  return zone === 'qualification'
    ? 'standings-row--qualification'
    : 'standings-row--relegation'
}

const onRowKeydown = (event: KeyboardEvent, teamId: number) => {
  if (event.key !== 'Enter' && event.key !== ' ') {
    return
  }

  event.preventDefault()
  emit('selectTeam', teamId)
}
</script>

<template>
  <v-card
    class="h-100 football-surface football-interactive-card"
    variant="outlined"
  >
    <v-card-title class="d-flex align-center justify-space-between">
      <span>{{ section.title }}</span>
      <div class="d-flex align-center ga-2">
        <span class="text-caption text-medium-emphasis">{{
          standingsLeague?.name
        }}</span>
        <v-avatar v-if="standingsLeague?.flag" size="22" rounded="sm">
          <v-img
            :src="standingsLeague.flag"
            :alt="standingsLeague.country"
            :transition="false"
          />
        </v-avatar>
      </div>
    </v-card-title>

    <v-divider />

    <v-card-text>
      <template v-if="section.state === 'loading'">
        <v-progress-circular
          indeterminate
          color="primary"
          size="22"
          class="mr-3"
        />
        <span>{{ t('pages.applications.football.loading.standings') }}</span>
      </template>

      <v-alert
        v-else-if="section.state === 'error'"
        type="error"
        variant="tonal"
        density="comfortable"
      >
        {{ section.error }}
      </v-alert>

      <v-alert
        v-else-if="section.state === 'empty'"
        type="info"
        variant="tonal"
        density="comfortable"
      >
        {{ section.emptyMessage }}
      </v-alert>

      <div v-else class="standings-groups">
        <section
          v-for="group in standings"
          :key="group.name"
          class="standings-group"
          :aria-label="
            t('pages.applications.football.misc.standingsGroupAria', {
              group: group.name,
            })
          "
        >
          <h3 class="text-subtitle-2 font-weight-medium mb-2">
            {{ group.name }}
          </h3>

          <div class="standings-table-wrap">
            <table class="standings-table">
              <thead>
                <tr>
                  <th>{{ t('pages.applications.football.standings.rank') }}</th>
                  <th class="text-left">
                    {{ t('pages.applications.football.standings.team') }}
                  </th>
                  <th>
                    {{ t('pages.applications.football.standings.playedShort') }}
                  </th>
                  <th>
                    {{ t('pages.applications.football.standings.wonShort') }}
                  </th>
                  <th class="standings-column-mobile">
                    {{ t('pages.applications.football.standings.drawShort') }}
                  </th>
                  <th class="standings-column-mobile">
                    {{ t('pages.applications.football.standings.lostShort') }}
                  </th>
                  <th class="standings-column-desktop">
                    {{
                      t('pages.applications.football.standings.goalsForShort')
                    }}
                  </th>
                  <th class="standings-column-desktop">
                    {{
                      t(
                        'pages.applications.football.standings.goalsAgainstShort',
                      )
                    }}
                  </th>
                  <th>
                    {{
                      t('pages.applications.football.standings.goalDiffShort')
                    }}
                  </th>
                  <th>
                    {{ t('pages.applications.football.standings.pointsShort') }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="row in group.rows"
                  :key="`${group.name}-${row.team.id}`"
                  class="standings-row"
                  :class="getZoneClass(row, group.rows.length)"
                  tabindex="0"
                  role="button"
                  :aria-label="
                    t('pages.applications.football.misc.openTeamDetailsAria', {
                      team: row.team.name,
                    })
                  "
                  @click="emit('selectTeam', row.team.id)"
                  @keydown="onRowKeydown($event, row.team.id)"
                >
                  <td class="font-weight-medium">{{ row.rank }}</td>
                  <td>
                    <div class="standings-team">
                      <v-avatar size="22" color="primary" variant="tonal">
                        <v-img
                          v-if="row.team.logo"
                          :src="row.team.logo"
                          :alt="row.team.name"
                          :transition="false"
                        />
                        <span v-else class="text-caption">
                          {{ getInitial(row.team.name) }}
                        </span>
                      </v-avatar>
                      <span class="standings-team-name">{{
                        row.team.name
                      }}</span>
                    </div>
                  </td>
                  <td>{{ row.all.played }}</td>
                  <td>{{ row.all.win }}</td>
                  <td class="standings-column-mobile">{{ row.all.draw }}</td>
                  <td class="standings-column-mobile">{{ row.all.lose }}</td>
                  <td class="standings-column-desktop">
                    {{ row.all.goals.for }}
                  </td>
                  <td class="standings-column-desktop">
                    {{ row.all.goals.against }}
                  </td>
                  <td>{{ row.goalsDiff }}</td>
                  <td>{{ row.points }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.standings-groups {
  display: grid;
  gap: 0.9rem;
}

.standings-table-wrap {
  max-height: 440px;
  overflow: auto;
  border-radius: 12px;
  border: 1px solid rgba(var(--v-theme-on-surface), 0.14);
}

.standings-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.83rem;
}

.standings-table thead th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: rgba(var(--v-theme-surface), 0.98);
  backdrop-filter: blur(4px);
  text-align: center;
  padding: 0.56rem 0.45rem;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.12);
  white-space: nowrap;
}

.standings-table thead th.text-left {
  text-align: left;
}

.standings-table td {
  text-align: center;
  padding: 0.5rem 0.4rem;
  border-bottom: 1px solid rgba(var(--v-theme-on-surface), 0.09);
  white-space: nowrap;
}

.standings-row {
  cursor: pointer;
  transition:
    background-color 160ms ease,
    transform 160ms ease;
}

.standings-row:hover {
  background: rgba(var(--v-theme-primary), 0.1);
}

.standings-row:focus-visible {
  outline: 2px solid rgba(var(--v-theme-primary), 0.85);
  outline-offset: -2px;
  background: rgba(var(--v-theme-primary), 0.12);
}

.standings-team {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  min-width: 150px;
}

.standings-team-name {
  overflow: hidden;
  text-overflow: ellipsis;
}

.standings-row--qualification {
  box-shadow: inset 3px 0 0 rgba(var(--v-theme-success), 0.95);
}

.standings-row--relegation {
  box-shadow: inset 3px 0 0 rgba(var(--v-theme-error), 0.95);
}

@media (max-width: 760px) {
  .standings-table {
    font-size: 0.75rem;
  }

  .standings-column-desktop,
  .standings-column-mobile {
    display: none;
  }

  .standings-team {
    min-width: 115px;
    max-width: 145px;
  }
}
</style>
