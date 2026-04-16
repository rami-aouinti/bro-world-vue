<script setup lang="ts">
import {
  SPORT_SLUGS,
  SPORTS_BY_SLUG,
  type SportDefinition,
  type SportSlug,
} from '~/types/sports'
import { useFootballData } from '~/composables/useFootballData'
import SportsFootballFixtureCard from '~/components/Sports/Football/FixtureCard.vue'
import SportsFootballTeamDetailsPanel from '~/components/Sports/Football/TeamDetailsPanel.vue'
import SportsFootballPlayerDetailsPanel from '~/components/Sports/Football/PlayerDetailsPanel.vue'

definePageMeta({
  title: 'appbar.sports',
})

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
    statusMessage: 'Sport not found',
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
  teams,
  fixtureDetails,
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

const getInitial = (name: string) => {
  return name?.trim().charAt(0).toUpperCase() || '?'
}

const getSection = (
  key: string,
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

const leaguesSection = getSection('leagues', 'Leagues', 'No league available.')
const fixturesSection = getSection(
  'fixtures',
  'Fixtures / Matches',
  'No fixture for this league/season.',
)
const standingsSection = getSection(
  'standings',
  'Results / Standings',
  'No standings data.',
)
const teamsSection = getSection('teams', 'Clubs / Teams', 'No teams data.')
const fixtureDetailsSection = getSection(
  'fixtureDetails',
  'Fixture details',
  'Select a fixture to see events, lineups and player stats.',
)
const teamDetailsSection = getSection(
  'teamDetails',
  'Team details',
  'Select a team to see full team and squad details.',
)
const playerDetailsSection = getSection(
  'playerDetails',
  'Player details',
  'Select a player to open the player profile and statistics.',
)

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
        <v-row class="mb-4">
          <v-col cols="12">
            <v-select
              :model-value="selectedLeagueId"
              :items="leagues"
              item-title="name"
              item-value="id"
              label="League"
              density="comfortable"
              :loading="leaguesState === 'loading'"
              :disabled="leaguesState !== 'ready'"
              variant="outlined"
              hide-details
              @update:model-value="selectLeague"
            />
          </v-col>

          <v-col cols="12">
            <v-select
              :model-value="selectedSeason"
              :items="seasons"
              label="Season"
              density="comfortable"
              :disabled="!selectedLeague"
              variant="outlined"
              hide-details
              @update:model-value="selectSeason"
            />
          </v-col>
        </v-row>
      </template>

      <template #right>
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
            <span>Loading leagues…</span>
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
              v-for="league in leagues"
              :key="league.id"
              :title="league.name"
              :subtitle="league.country.name"
            />
          </v-list>
        </v-card-text>
      </template>
    </AppPageDrawers>
    <v-container fluid>
      <template v-if="sport.slug === 'football'">
        <v-row class="football-stagger">
          <v-col cols="12" md="6" class="football-fade-up">
            <v-card class="h-100 football-surface football-surface--glow football-interactive-card" variant="outlined">
              <v-card-title>{{ fixturesSection.title }}</v-card-title>
              <v-divider />
              <v-card-text>
                <template v-if="fixturesSection.state === 'loading'">
                  <v-progress-circular
                    indeterminate
                    color="primary"
                    size="22"
                    class="mr-3"
                  />
                  <span>Loading fixtures…</span>
                </template>

                <v-alert
                  v-else-if="fixturesSection.state === 'error'"
                  type="error"
                  variant="tonal"
                  density="comfortable"
                >
                  {{ fixturesSection.error }}
                </v-alert>

                <v-alert
                  v-else-if="fixturesSection.state === 'empty'"
                  type="info"
                  variant="tonal"
                  density="comfortable"
                >
                  {{ fixturesSection.emptyMessage }}
                </v-alert>

                <v-list v-else density="compact" class="pa-0">
                  <TransitionGroup name="stagger" tag="div" class="football-transition-list">
                    <SportsFootballFixtureCard
                      v-for="fixture in fixtures"
                      :key="fixture.id"
                      :fixture="fixture"
                      :active="selectedFixtureId === fixture.id"
                      @select="loadFixtureDetails"
                    />
                  </TransitionGroup>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6" class="football-fade-up">
            <v-card class="h-100 football-surface football-interactive-card" variant="outlined">
              <v-card-title class="d-flex align-center justify-space-between">
                <span>{{ standingsSection.title }}</span>
                <v-avatar
                  v-if="standingsLeague?.flag"
                  size="22"
                  rounded="sm"
                  class="ml-2"
                >
                  <v-img :src="standingsLeague.flag" :alt="standingsLeague.country" />
                </v-avatar>
              </v-card-title>
              <v-divider />
              <v-card-text>
                <template v-if="standingsSection.state === 'loading'">
                  <v-progress-circular
                    indeterminate
                    color="primary"
                    size="22"
                    class="mr-3"
                  />
                  <span>Loading standings…</span>
                </template>

                <v-alert
                  v-else-if="standingsSection.state === 'error'"
                  type="error"
                  variant="tonal"
                  density="comfortable"
                >
                  {{ standingsSection.error }}
                </v-alert>

                <v-alert
                  v-else-if="standingsSection.state === 'empty'"
                  type="info"
                  variant="tonal"
                  density="comfortable"
                >
                  {{ standingsSection.emptyMessage }}
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
                    >
                      <template #prepend>
                        <v-avatar size="22" color="primary" variant="tonal">
                          <v-img
                            v-if="row.team.logo"
                            :src="row.team.logo"
                            :alt="row.team.name"
                          />
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
          </v-col>

          <v-col cols="12" md="6" class="football-fade-up">
            <v-card class="h-100 football-surface football-interactive-card" variant="outlined">
              <v-card-title>{{ teamsSection.title }}</v-card-title>
              <v-divider />
              <v-card-text>
                <template v-if="teamsSection.state === 'loading'">
                  <v-progress-circular
                    indeterminate
                    color="primary"
                    size="22"
                    class="mr-3"
                  />
                  <span>Loading teams…</span>
                </template>

                <v-alert
                  v-else-if="teamsSection.state === 'error'"
                  type="error"
                  variant="tonal"
                  density="comfortable"
                >
                  {{ teamsSection.error }}
                </v-alert>

                <v-alert
                  v-else-if="teamsSection.state === 'empty'"
                  type="info"
                  variant="tonal"
                  density="comfortable"
                >
                  {{ teamsSection.emptyMessage }}
                </v-alert>

                <v-list v-else density="compact" lines="one" class="pa-0">
                  <v-list-item
                    v-for="team in teams"
                    :key="team.id"
                    :title="team.name"
                    :active="selectedTeamId === team.id"
                    class="football-interactive-item"
                    @click="loadTeamDetails(team.id)"
                  >
                    <template #prepend>
                      <v-avatar size="22" color="primary" variant="tonal">
                        <v-img v-if="team.logo" :src="team.logo" :alt="team.name" />
                        <span v-else class="text-caption">
                          {{ getInitial(team.name) }}
                        </span>
                      </v-avatar>
                    </template>
                  </v-list-item>
                </v-list>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6" class="football-fade-up">
            <v-card class="h-100 football-surface football-surface--dark football-interactive-card" variant="outlined">
              <v-card-title>{{ fixtureDetailsSection.title }}</v-card-title>
              <v-divider />
              <v-card-text>
                <template v-if="fixtureDetailsSection.state === 'loading'">
                  <v-progress-circular
                    indeterminate
                    color="primary"
                    size="22"
                    class="mr-3"
                  />
                  <span>Loading fixture details…</span>
                </template>

                <v-alert
                  v-else-if="fixtureDetailsSection.state === 'error'"
                  type="error"
                  variant="tonal"
                  density="comfortable"
                >
                  {{ fixtureDetailsSection.error }}
                </v-alert>

                <v-alert
                  v-else-if="fixtureDetailsSection.state === 'empty'"
                  type="info"
                  variant="tonal"
                  density="comfortable"
                >
                  {{ fixtureDetailsSection.emptyMessage }}
                </v-alert>

                <template v-else-if="fixtureDetails">
                  <div class="mb-3 text-subtitle-2">
                    Events: {{ fixtureDetails.events.length }} · Lineups:
                    {{ fixtureDetails.lineups.length }} · Player stats:
                    {{ fixtureDetails.playerStats.length }}
                  </div>
                  <v-list density="compact" lines="two" class="pa-0">
                    <v-list-item
                      v-for="event in fixtureDetails.events"
                      :key="`${event.time.elapsed}-${event.type}-${event.player.name}`"
                      class="football-interactive-item"
                      :title="`${event.time.elapsed ?? '-'}' ${event.type}`"
                      :subtitle="`${event.team.name ?? 'Unknown team'} · ${event.player.name ?? 'Unknown player'}`"
                    />
                  </v-list>
                </template>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6" class="football-fade-up" >
            <v-card class="h-100 football-surface football-surface--dark football-interactive-card" variant="outlined">
              <v-card-title>{{ teamDetailsSection.title }}</v-card-title>
              <v-divider />
              <v-card-text>
                <template v-if="teamDetailsSection.state === 'loading'">
                  <v-progress-circular indeterminate color="primary" size="22" class="mr-3" />
                  <span>Loading team details…</span>
                </template>
                <v-alert v-else-if="teamDetailsSection.state === 'error'" type="error" variant="tonal" density="comfortable">
                  {{ teamDetailsSection.error }}
                </v-alert>
                <v-alert v-else-if="teamDetailsSection.state === 'empty'" type="info" variant="tonal" density="comfortable">
                  {{ teamDetailsSection.emptyMessage }}
                </v-alert>
                <template v-else-if="teamDetails">
                  <SportsFootballTeamDetailsPanel
                    :details="teamDetails"
                    :selected-player-id="selectedPlayerId"
                    @select-player="loadPlayerDetails"
                  />
                </template>
              </v-card-text>
            </v-card>
          </v-col>

          <v-col cols="12" md="6" class="football-fade-up">
            <v-card class="h-100 football-surface football-surface--glow football-interactive-card" variant="outlined">
              <v-card-title>{{ playerDetailsSection.title }}</v-card-title>
              <v-divider />
              <v-card-text>
                <template v-if="playerDetailsSection.state === 'loading'">
                  <v-progress-circular indeterminate color="primary" size="22" class="mr-3" />
                  <span>Loading player details…</span>
                </template>
                <v-alert v-else-if="playerDetailsSection.state === 'error'" type="error" variant="tonal" density="comfortable">
                  {{ playerDetailsSection.error }}
                </v-alert>
                <v-alert v-else-if="playerDetailsSection.state === 'empty'" type="info" variant="tonal" density="comfortable">
                  {{ playerDetailsSection.emptyMessage }}
                </v-alert>
                <SportsFootballPlayerDetailsPanel v-else-if="playerDetails?.profile" :details="playerDetails" />
              </v-card-text>
            </v-card>
          </v-col>
        </v-row>
      </template>

      <template v-else>
        <v-alert type="info" variant="tonal" density="comfortable">
          Detailed stats are currently available for football. Select another
          sport from the catalog while we roll out additional leagues and data
          feeds.
        </v-alert>
      </template>
    </v-container>
  </div>
</template>
