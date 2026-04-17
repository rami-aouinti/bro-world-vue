<script setup lang="ts">
import {
  SPORT_SLUGS,
  SPORTS_BY_SLUG,
  type SportDefinition,
  type SportSlug,
} from '~/types/sports'
import {
  useFootballData,
  type FootballSectionKey,
} from '~/composables/useFootballData'
import SportsFootballMatchHeroWidget from '~/components/Sports/Football/MatchHeroWidget.vue'
import SportsFootballFixturesListWidget from '~/components/Sports/Football/FixturesListWidget.vue'
import SportsFootballStandingsTableWidget from '~/components/Sports/Football/StandingsTableWidget.vue'
import SportsFootballTeamDetailsWidget from '~/components/Sports/Football/TeamDetailsWidget.vue'
import SportsFootballPlayerDetailsWidget from '~/components/Sports/Football/PlayerDetailsWidget.vue'

definePageMeta({
  title: 'appbar.sports',
})

const { t } = useI18n()
const route = useRoute()

const isSportSlug = (value: string): value is SportSlug => {
  return (SPORT_SLUGS as readonly string[]).includes(value)
}

const sportSlug = computed<SportSlug | null>(() => {
  const slug = route.params.sport

  if (typeof slug !== 'string' || !isSportSlug(slug)) {
    return null
  }

  return slug
})

if (!sportSlug.value) {
  throw createError({
    statusCode: 404,
    statusMessage: t('pages.applications.football.errors.sportNotFound'),
  })
}

const sport = computed<SportDefinition>(
  () => SPORTS_BY_SLUG[sportSlug.value as SportSlug],
)

const {
  leagues,
  fixtures,
  standings,
  standingsLeague,
  mappedFixtureEvents,
  mappedFixtureLineups,
  mappedFixturePlayerStats,
  teamDetails,
  playerDetails,
  footballSections,
  selectedLeague,
  seasons,
  selectedLeagueId,
  selectedSeason,
  selectedFixtureId,
  selectedTeamId,
  selectedPlayerId,
  leaguesState,
  loadLeagues,
  loadLeagueSeasonData,
  loadFixtureDetails,
  loadTeamDetails,
  loadPlayerDetails,
  selectLeague,
  selectSeason,
} = useFootballData()

const FEATURED_LEAGUE_IDS = new Set([1, 4, 39, 140, 135, 78])
const FEATURED_LEAGUE_NAMES = new Set([
  'worldcup',
  'fifaworldcup',
  'uefaeurochampionship',
  'uefaeuro',
  'premierleague',
  'laliga',
  'seriea',
  'bundesliga',
])

const normalizeLeagueName = (name: string) => {
  return name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
}

const featuredLeagues = computed(() => {
  return leagues.value.filter((league) => {
    if (FEATURED_LEAGUE_IDS.has(league.id)) {
      return true
    }

    return FEATURED_LEAGUE_NAMES.has(normalizeLeagueName(league.name))
  })
})

const getSection = (
  key: FootballSectionKey,
  fallbackTitle: string,
  fallbackEmptyMessage: string,
) =>
  computed(() => {
    return (
      footballSections.value.find((section) => section.key === key) ?? {
        key,
        title: fallbackTitle,
        state: 'empty' as const,
        error: '',
        emptyMessage: fallbackEmptyMessage,
      }
    )
  })

const leaguesSection = getSection(
  'leagues',
  t('pages.applications.football.sections.leagues.title'),
  t('pages.applications.football.sections.leagues.empty'),
)
const fixturesSection = getSection(
  'fixtures',
  t('pages.applications.football.sections.fixtures.title'),
  t('pages.applications.football.sections.fixtures.empty'),
)
const standingsSection = getSection(
  'standings',
  t('pages.applications.football.sections.standings.title'),
  t('pages.applications.football.sections.standings.empty'),
)
const teamDetailsSection = getSection(
  'teamDetails',
  t('pages.applications.football.sections.teamDetails.title'),
  t('pages.applications.football.sections.teamDetails.empty'),
)
const playerDetailsSection = getSection(
  'playerDetails',
  t('pages.applications.football.sections.playerDetails.title'),
  t('pages.applications.football.sections.playerDetails.empty'),
)

const hasSelection = computed(() => {
  return Boolean(
    selectedFixtureId.value || selectedTeamId.value || selectedPlayerId.value,
  )
})

const teamModalOpen = ref(false)
const playerModalOpen = ref(false)
const teamModalLoading = ref(false)
const playerModalLoading = ref(false)
const teamModalRequestedId = ref<number | null>(null)
const playerModalRequestedId = ref<number | null>(null)

const findTeamName = (teamId: number) => {
  const inFixtures = fixtures.value
    .flatMap((fixture) => [fixture.teams.home, fixture.teams.away])
    .find((team) => team.id === teamId)?.name
  if (inFixtures) {
    return inFixtures
  }

  const inStandings = standings.value
    .flatMap((group) => group.rows)
    .find((row) => row.team.id === teamId)?.team.name
  return inStandings ?? ''
}

const findPlayerName = (playerId: number) => {
  const inPlayerStats = mappedFixturePlayerStats.value.find(
    (player) => player.playerId === playerId,
  )?.playerName
  return inPlayerStats ?? ''
}

const teamModalTitle = computed(() => {
  return (
    teamDetails.value?.statistics?.team?.name ||
    (teamModalRequestedId.value ? findTeamName(teamModalRequestedId.value) : '') ||
    teamDetailsSection.value.title
  )
})

const playerModalTitle = computed(() => {
  return (
    playerDetails.value?.profile?.name ||
    (playerModalRequestedId.value ? findPlayerName(playerModalRequestedId.value) : '') ||
    playerDetailsSection.value.title
  )
})

const openTeamModal = async (teamId: number) => {
  playerModalOpen.value = false
  teamModalRequestedId.value = teamId
  teamModalLoading.value = true
  teamModalOpen.value = true

  try {
    await loadTeamDetails(teamId)
  } finally {
    teamModalLoading.value = false
  }
}

const openPlayerModal = async (playerId: number) => {
  teamModalOpen.value = false
  playerModalRequestedId.value = playerId
  playerModalLoading.value = true
  playerModalOpen.value = true

  try {
    await loadPlayerDetails(playerId)
  } finally {
    playerModalLoading.value = false
  }
}

const initializeFootballPage = async () => {
  if (sportSlug.value !== 'football') {
    return
  }

  await loadLeagues()
}

watch(
  sportSlug,
  async (slug, previousSlug) => {
    if (slug !== 'football') {
      return
    }

    if (slug === previousSlug) {
      return
    }

    await initializeFootballPage()
  },
  { immediate: true },
)

watch(
  () => [sportSlug.value, selectedLeagueId.value, selectedSeason.value] as const,
  ([slug, leagueId, season], previous) => {
    if (slug !== 'football') {
      return
    }

    if (!leagueId || !season) {
      return
    }

    if (previous) {
      const [previousSlug, previousLeagueId, previousSeason] = previous

      if (
        slug === previousSlug &&
        leagueId === previousLeagueId &&
        season === previousSeason
      ) {
        return
      }
    }

    void loadLeagueSeasonData()
  },
  { immediate: true },
)
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #left>
        <v-row class="mb-4 pt-3">
          <SportsFootballFixturesListWidget
            :fixtures="fixtures"
            :section="fixturesSection"
            :selected-fixture-id="selectedFixtureId"
            @select="loadFixtureDetails"
            @select-team="openTeamModal"
          />
        </v-row>
      </template>

      <template #right>
        <v-row class="pa-4">
          <v-col cols="12" md="6">
            <v-select
              :model-value="selectedLeagueId"
              :items="leagues"
              item-title="name"
              item-value="id"
              :label="t('pages.applications.football.filters.league')"
              density="comfortable"
              :loading="leaguesState === 'loading'"
              :disabled="leaguesState !== 'ready'"
              variant="outlined"
              hide-details
              @update:model-value="selectLeague"
            />
          </v-col>

          <v-col cols="12" md="6">
            <v-select
              :model-value="selectedSeason"
              :items="seasons"
              :label="t('pages.applications.football.filters.season')"
              density="comfortable"
              :disabled="!selectedLeague"
              variant="outlined"
              hide-details
              @update:model-value="selectSeason"
            />
          </v-col>
        </v-row>
        <v-card-title>{{ leaguesSection.title }}</v-card-title>
        <v-divider />
        <v-card-text>
          <template v-if="leaguesSection.state === 'loading'">
            <v-progress-circular
              indeterminate
              color="primary"
              size="22"
              class="mr-3"
            />
            <span>{{ t('pages.applications.football.loading.leagues') }}</span>
          </template>

          <v-alert
            v-else-if="leaguesSection.state === 'error'"
            type="error"
            variant="tonal"
            density="comfortable"
          >
            {{ leaguesSection.error }}
          </v-alert>

          <v-alert
            v-else-if="leaguesSection.state === 'empty'"
            type="info"
            variant="tonal"
            density="comfortable"
          >
            {{ leaguesSection.emptyMessage }}
          </v-alert>

          <v-list v-else density="compact" lines="one" class="pa-0">
            <v-list-item
              v-for="league in featuredLeagues"
              :key="league.id"
              :title="league.name"
              :subtitle="league.country.name"
              :active="selectedLeagueId === league.id"
              active-class="text-primary"
              @click="selectLeague(league.id)"
            />
          </v-list>
        </v-card-text>
      </template>
    </AppPageDrawers>

    <v-container fluid>
      <template v-if="sport.slug === 'football'">
        <v-row class="football-stagger">
          <v-col cols="12" class="football-fade-up">
            <SportsFootballMatchHeroWidget
              :fixtures="fixtures"
              :selected-fixture-id="selectedFixtureId"
              :events="mappedFixtureEvents"
              :lineups="mappedFixtureLineups"
              :player-stats="mappedFixturePlayerStats"
              @select="loadFixtureDetails"
              @select-team="openTeamModal"
              @select-player="openPlayerModal"
            />
          </v-col>
          <template v-if="hasSelection">
            <v-col cols="12" class="football-fade-up">
              <SportsFootballStandingsTableWidget
                :standings="standings"
                :standings-league="standingsLeague"
                :section="standingsSection"
                @select-team="openTeamModal"
              />
            </v-col>
          </template>
        </v-row>
      </template>

      <template v-else>
        <v-alert type="info" variant="tonal" density="comfortable">
          {{ t('pages.applications.football.empty.otherSports') }}
        </v-alert>
      </template>
    </v-container>

    <AppModal
      v-model="teamModalOpen"
      :title="teamModalTitle"
      :max-width="1000"
      density="compact"
    >
      <SportsFootballTeamDetailsWidget
        :section="teamDetailsSection"
        :team-details="teamDetails"
        :selected-player-id="selectedPlayerId"
        :loading-override="teamModalLoading"
        @select-player="openPlayerModal"
      />
    </AppModal>

    <AppModal
      v-model="playerModalOpen"
      :title="playerModalTitle"
      :max-width="760"
      density="compact"
    >
      <SportsFootballPlayerDetailsWidget
        :section="playerDetailsSection"
        :player-details="playerDetails"
        :loading-override="playerModalLoading"
      />
    </AppModal>
  </div>
</template>

<style>
.football-stagger {
  --football-gap: 1rem;
  row-gap: var(--football-gap);
}

.football-fade-up {
  animation: football-fade-up 360ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.football-surface {
  border-color: rgba(var(--v-theme-on-surface), 0.16) !important;
  box-shadow: 0 10px 24px rgba(5, 10, 24, 0.18);
  backdrop-filter: blur(5px);
  transition: transform 180ms ease, border-color 180ms ease, box-shadow 180ms ease;
}

.football-surface--dark {
  background: linear-gradient(
    175deg,
    rgba(var(--v-theme-surface), 0.9),
    rgba(var(--v-theme-surface-variant), 0.64)
  );
  border-color: rgba(var(--v-theme-on-surface), 0.2) !important;
}

.football-surface--glow {
  box-shadow:
    0 14px 28px rgba(6, 17, 34, 0.25),
    0 0 0 1px rgba(var(--v-theme-primary), 0.16),
    0 0 24px rgba(var(--v-theme-primary), 0.16);
}

.football-interactive-card:hover,
.football-interactive-card:focus-within {
  transform: translateY(-2px);
  border-color: rgba(var(--v-theme-primary), 0.46) !important;
  box-shadow:
    0 16px 30px rgba(8, 18, 38, 0.3),
    0 0 0 1px rgba(var(--v-theme-primary), 0.22);
}

.football-interactive-item {
  border-radius: 10px;
  transition: background-color 180ms ease, transform 180ms ease;
}

.football-interactive-item:hover,
.football-interactive-item:focus-visible {
  background-color: rgba(var(--v-theme-primary), 0.1);
  transform: translateX(3px);
}

.football-transition-list {
  display: grid;
  gap: 0.55rem;
}

.stagger-enter-active {
  animation: football-fade-up 320ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.stagger-enter-from,
.stagger-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.stagger-leave-active {
  transition: opacity 200ms ease;
}

.stagger-move {
  transition: transform 220ms ease;
}

.football-transition-list > *:nth-child(1) {
  animation-delay: 30ms;
}
.football-transition-list > *:nth-child(2) {
  animation-delay: 60ms;
}
.football-transition-list > *:nth-child(3) {
  animation-delay: 90ms;
}
.football-transition-list > *:nth-child(4) {
  animation-delay: 120ms;
}
.football-transition-list > *:nth-child(5) {
  animation-delay: 150ms;
}
.football-transition-list > *:nth-child(6) {
  animation-delay: 180ms;
}

@keyframes football-fade-up {
  from {
    opacity: 0;
    transform: translateY(14px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 959px) {
  .football-stagger {
    --football-gap: 0.75rem;
  }

  :deep(.football-stagger .v-card-title) {
    padding-bottom: 0.4rem;
  }

  :deep(.football-stagger .v-card-text) {
    padding-top: 0.7rem;
    padding-bottom: 0.8rem;
  }
}

@media (min-width: 960px) {
  .football-stagger {
    --football-gap: 1.1rem;
  }

  :deep(.football-stagger .v-card-text) {
    padding-top: 0.95rem;
    padding-bottom: 1rem;
  }
}

@media (prefers-reduced-motion: reduce) {
  .football-fade-up,
  .stagger-enter-active,
  .stagger-leave-active,
  .stagger-move,
  .football-interactive-card,
  .football-interactive-item {
    animation: none !important;
    transition: none !important;
    transform: none !important;
  }
}
</style>
