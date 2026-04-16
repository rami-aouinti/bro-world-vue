<script setup lang="ts">
import type {
  FootballFixture,
  FixtureEventViewModel,
  FixtureLineupViewModel,
  FixturePlayerStatViewModel,
} from '~/composables/useFootballData'
import SportsFootballFixtureDetailsPanel from '~/components/Sports/Football/FixtureDetailsPanel.vue'

const props = defineProps<{
  fixtures: FootballFixture[]
  selectedFixtureId: number | null
  events: FixtureEventViewModel[]
  lineups: FixtureLineupViewModel[]
  playerStats: FixturePlayerStatViewModel[]
}>()
const { t } = useI18n()

const emit = defineEmits<{
  select: [fixtureId: number]
  selectTeam: [teamId: number]
  selectPlayer: [playerId: number]
}>()

const liveStatusCodes = new Set(['1H', '2H', 'ET', 'P', 'BT', 'HT', 'INT'])

const heroFixture = computed<FootballFixture | null>(() => {
  if (!props.fixtures.length) return null
  const selectedFixture = props.fixtures.find(fixture => fixture.id === props.selectedFixtureId)
  if (selectedFixture) return selectedFixture
  const liveFixture = props.fixtures.find(fixture => liveStatusCodes.has(fixture.status?.short ?? ''))
  return liveFixture ?? props.fixtures[0] ?? null
})

const heroSubtitle = computed(() => {
  if (!heroFixture.value) return t('pages.applications.football.empty.selectLeagueHero')
  const dateLabel = new Date(heroFixture.value.date).toLocaleDateString()
  const statusLabel = heroFixture.value.status?.long ?? t('pages.applications.football.misc.scheduled')
  return `${statusLabel} · ${dateLabel}`
})

const heroMinute = computed(() => {
  const elapsed = heroFixture.value?.status?.elapsed
  return typeof elapsed === 'number' ? `${elapsed}'` : null
})

const scoreLabel = computed(() => {
  const fixture = heroFixture.value
  if (!fixture || !fixture.goals) return 'vs'
  return `${fixture.goals.home ?? '-'} - ${fixture.goals.away ?? '-'}`
})

const detailsModalOpen = ref(false)
const selectedDetailsTab = ref<'timeline' | 'lineups' | 'statistics' | 'player-notes'>('timeline')

function selectHeroFixture() {
  if (heroFixture.value) emit('select', heroFixture.value.id)
}

function openDetailsTab(tab: 'timeline' | 'lineups' | 'statistics' | 'player-notes') {
  selectedDetailsTab.value = tab
  detailsModalOpen.value = true
  selectHeroFixture()
}

function onSelectTeam(teamId?: number | null) {
  if (typeof teamId === 'number') emit('selectTeam', teamId)
}

function onSelectPlayer(playerId?: number | null) {
  if (typeof playerId === 'number') emit('selectPlayer', playerId)
}
</script>

<template>
  <v-card class="postcard-gradient-card football-surface football-surface--glow football-interactive-card" variant="outlined">
    <v-card-title class="d-flex align-center justify-space-between">
      <span>{{ t('pages.applications.football.sections.matchHero') }}</span>
      <v-chip size="small" color="primary" variant="tonal">{{ heroFixture?.status?.short || 'NS' }}</v-chip>
    </v-card-title>

    <v-divider />

    <v-card-text>
      <div class="text-caption text-medium-emphasis mb-3">{{ heroSubtitle }}</div>

      <template v-if="heroFixture">
        <div class="d-flex align-center justify-space-between ga-3">
          <button class="hero-team text-left" type="button" @click="onSelectTeam(heroFixture.teams.home.id)">
            <v-avatar size="34" class="mb-1"><v-img :src="heroFixture.teams.home.logo || undefined" :alt="heroFixture.teams.home.name" /></v-avatar>
            <div class="text-body-2 font-weight-bold text-truncate">{{ heroFixture.teams.home.name }}</div>
          </button>

          <div class="text-center">
            <div class="text-h6 font-weight-bold">{{ scoreLabel }}</div>
            <div v-if="heroMinute" class="text-caption text-primary">{{ heroMinute }}</div>
          </div>

          <button class="hero-team text-right" type="button" @click="onSelectTeam(heroFixture.teams.away.id)">
            <v-avatar size="34" class="mb-1"><v-img :src="heroFixture.teams.away.logo || undefined" :alt="heroFixture.teams.away.name" /></v-avatar>
            <div class="text-body-2 font-weight-bold text-truncate">{{ heroFixture.teams.away.name }}</div>
          </button>
        </div>

        <div class="d-flex flex-wrap justify-center ga-2 mt-4">
          <v-btn size="small" variant="tonal" color="primary" @click="openDetailsTab('timeline')">Timeline</v-btn>
          <v-btn size="small" variant="tonal" color="primary" @click="openDetailsTab('lineups')">Lineup</v-btn>
          <v-btn size="small" variant="tonal" color="primary" @click="openDetailsTab('statistics')">Statistics</v-btn>
          <v-btn size="small" variant="tonal" color="primary" @click="openDetailsTab('player-notes')">Player notes</v-btn>
        </div>
      </template>

      <v-alert v-else type="info" density="comfortable" variant="tonal">{{ t('pages.applications.football.empty.noMatchHero') }}</v-alert>
    </v-card-text>
  </v-card>

  <v-dialog v-model="detailsModalOpen" max-width="1040">
    <v-card class="football-surface football-surface--dark" variant="outlined">
      <v-card-title class="d-flex align-center justify-space-between">
        <span>Fixture details</span>
        <v-btn icon="mdi-close" variant="text" @click="detailsModalOpen = false" />
      </v-card-title>
      <v-divider />
      <v-card-text>
        <SportsFootballFixtureDetailsPanel
          :events="events"
          :lineups="lineups"
          :player-stats="playerStats"
          mode="single"
          :initial-tab="selectedDetailsTab"
          :home-team-id="heroFixture?.teams.home.id ?? null"
          :away-team-id="heroFixture?.teams.away.id ?? null"
          @select-team="onSelectTeam"
          @select-player="onSelectPlayer"
        />
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<style scoped>
.hero-team {
  width: min(38%, 240px);
  background: transparent;
  border: 0;
  color: inherit;
  cursor: pointer;
}
</style>
