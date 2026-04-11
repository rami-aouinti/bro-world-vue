<script setup lang="ts">
import {
  SPORT_SLUGS,
  SPORTS_BY_SLUG,
  type SportDefinition,
  type SportSlug,
} from '~/types/sports'
import { useFootballData } from '~/composables/useFootballData'

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

const sport = computed<SportDefinition>(() => SPORTS_BY_SLUG[sportSlug.value as SportSlug])

const {
  leagues,
  fixtures,
  standings,
  teams,
  fixtureDetails,
  selectedLeague,
  seasons,
  selectedLeagueId,
  selectedSeason,
  selectedFixtureId,
  leaguesState,
  fixturesState,
  standingsState,
  teamsState,
  fixtureDetailsState,
  leaguesError,
  fixturesError,
  standingsError,
  teamsError,
  fixtureDetailsError,
  loadLeagues,
  loadLeagueSeasonData,
  loadFixtureDetails,
  selectLeague,
  selectSeason,
} = useFootballData()

watch(selectedSeason, () => {
  loadLeagueSeasonData()
})

await loadLeagues()
if (selectedLeagueId.value && selectedSeason.value) {
  await loadLeagueSeasonData()
}
</script>

<template>
  <v-container fluid>
    <v-card class="pa-6 mb-6">
      <v-img :src="sport.image" :alt="sport.label" height="220" cover class="mb-4" />
      <h2 class="text-h5 mb-2">{{ sport.label }}</h2>
      <p class="text-medium-emphasis mb-0">Slug: {{ sport.slug }}</p>
    </v-card>

    <template v-if="sport.slug === 'football'">
      <v-row class="mb-4">
        <v-col cols="12" md="6">
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

        <v-col cols="12" md="6">
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

      <v-row>
        <v-col cols="12" md="6" lg="4">
          <v-card class="h-100" variant="outlined">
            <v-card-title>Leagues</v-card-title>
            <v-divider />
            <v-card-text>
              <template v-if="leaguesState === 'loading'">
                <v-progress-circular indeterminate color="primary" size="22" class="mr-3" />
                <span>Loading leagues…</span>
              </template>

              <v-alert
                v-else-if="leaguesState === 'error'"
                type="error"
                variant="tonal"
                density="comfortable"
              >
                {{ leaguesError }}
              </v-alert>

              <v-alert
                v-else-if="leaguesState === 'empty'"
                type="info"
                variant="tonal"
                density="comfortable"
              >
                No league available.
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
          </v-card>
        </v-col>

        <v-col cols="12" md="6" lg="4">
          <v-card class="h-100" variant="outlined">
            <v-card-title>Fixtures / Matches</v-card-title>
            <v-divider />
            <v-card-text>
              <template v-if="fixturesState === 'loading'">
                <v-progress-circular indeterminate color="primary" size="22" class="mr-3" />
                <span>Loading fixtures…</span>
              </template>

              <v-alert
                v-else-if="fixturesState === 'error'"
                type="error"
                variant="tonal"
                density="comfortable"
              >
                {{ fixturesError }}
              </v-alert>

              <v-alert
                v-else-if="fixturesState === 'empty'"
                type="info"
                variant="tonal"
                density="comfortable"
              >
                No fixture for this league/season.
              </v-alert>

              <v-list v-else density="compact" class="pa-0">
                <v-list-item
                  v-for="fixture in fixtures"
                  :key="fixture.id"
                  :title="`${fixture.teams.home.name} vs ${fixture.teams.away.name}`"
                  :subtitle="new Date(fixture.date).toLocaleString()"
                  :active="selectedFixtureId === fixture.id"
                  @click="loadFixtureDetails(fixture.id)"
                />
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6" lg="4">
          <v-card class="h-100" variant="outlined">
            <v-card-title>Results / Standings</v-card-title>
            <v-divider />
            <v-card-text>
              <template v-if="standingsState === 'loading'">
                <v-progress-circular indeterminate color="primary" size="22" class="mr-3" />
                <span>Loading standings…</span>
              </template>

              <v-alert
                v-else-if="standingsState === 'error'"
                type="error"
                variant="tonal"
                density="comfortable"
              >
                {{ standingsError }}
              </v-alert>

              <v-alert
                v-else-if="standingsState === 'empty'"
                type="info"
                variant="tonal"
                density="comfortable"
              >
                No standings data.
              </v-alert>

              <v-list v-else density="compact" lines="one" class="pa-0">
                <template v-for="group in standings" :key="group.name">
                  <v-list-subheader>{{ group.name }}</v-list-subheader>
                  <v-list-item
                    v-for="row in group.rows"
                    :key="`${group.name}-${row.team.id}`"
                    :title="`${row.rank}. ${row.team.name}`"
                    :subtitle="`${row.points} pts | ${row.all.played} played`"
                  />
                </template>
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6" lg="4">
          <v-card class="h-100" variant="outlined">
            <v-card-title>Clubs / Teams</v-card-title>
            <v-divider />
            <v-card-text>
              <template v-if="teamsState === 'loading'">
                <v-progress-circular indeterminate color="primary" size="22" class="mr-3" />
                <span>Loading teams…</span>
              </template>

              <v-alert
                v-else-if="teamsState === 'error'"
                type="error"
                variant="tonal"
                density="comfortable"
              >
                {{ teamsError }}
              </v-alert>

              <v-alert
                v-else-if="teamsState === 'empty'"
                type="info"
                variant="tonal"
                density="comfortable"
              >
                No teams data.
              </v-alert>

              <v-list v-else density="compact" lines="one" class="pa-0">
                <v-list-item v-for="team in teams" :key="team.id" :title="team.name" />
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>

        <v-col cols="12" md="6" lg="8">
          <v-card class="h-100" variant="outlined">
            <v-card-title>Fixture details</v-card-title>
            <v-divider />
            <v-card-text>
              <template v-if="fixtureDetailsState === 'loading'">
                <v-progress-circular indeterminate color="primary" size="22" class="mr-3" />
                <span>Loading fixture details…</span>
              </template>

              <v-alert
                v-else-if="fixtureDetailsState === 'error'"
                type="error"
                variant="tonal"
                density="comfortable"
              >
                {{ fixtureDetailsError }}
              </v-alert>

              <v-alert
                v-else-if="fixtureDetailsState === 'empty'"
                type="info"
                variant="tonal"
                density="comfortable"
              >
                Select a fixture to see events, lineups and player stats.
              </v-alert>

              <template v-else-if="fixtureDetails">
                <div class="mb-3 text-subtitle-2">
                  Events: {{ fixtureDetails.events.length }} ·
                  Lineups: {{ fixtureDetails.lineups.length }} ·
                  Player stats: {{ fixtureDetails.playerStats.length }}
                </div>
                <v-list density="compact" lines="two" class="pa-0">
                  <v-list-item
                    v-for="event in fixtureDetails.events"
                    :key="`${event.time.elapsed}-${event.type}-${event.player.name}`"
                    :title="`${event.time.elapsed ?? '-'}' ${event.type}`"
                    :subtitle="`${event.team.name ?? 'Unknown team'} · ${event.player.name ?? 'Unknown player'}`"
                  />
                </v-list>
              </template>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>
