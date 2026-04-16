<script setup lang="ts">
import type { FootballFixture } from '~/composables/useFootballData'

const props = defineProps<{
  fixtures: FootballFixture[]
  selectedFixtureId: number | null
}>()

const emit = defineEmits<{
  select: [fixtureId: number]
}>()

const liveStatusCodes = new Set(['1H', '2H', 'ET', 'P', 'BT', 'HT', 'INT'])

const heroFixture = computed<FootballFixture | null>(() => {
  if (!props.fixtures.length) {
    return null
  }

  const selectedFixture = props.fixtures.find(
    fixture => fixture.id === props.selectedFixtureId,
  )

  if (selectedFixture) {
    return selectedFixture
  }

  const liveFixture = props.fixtures.find(fixture =>
    liveStatusCodes.has(fixture.status?.short ?? ''),
  )

  return liveFixture ?? props.fixtures[0] ?? null
})

const heroSubtitle = computed(() => {
  if (!heroFixture.value) {
    return 'Sélectionnez une ligue pour afficher le prochain match.'
  }

  const dateLabel = new Date(heroFixture.value.date).toLocaleString()
  const statusLabel = heroFixture.value.status?.long ?? 'Scheduled'

  return `${statusLabel} · ${dateLabel}`
})

const heroMinute = computed(() => {
  const elapsed = heroFixture.value?.status?.elapsed
  return typeof elapsed === 'number' ? `${elapsed}'` : null
})

const scoreLabel = computed(() => {
  const fixture = heroFixture.value
  if (!fixture) {
    return '-'
  }

  if (!fixture.goals) {
    return 'vs'
  }

  return `${fixture.goals.home ?? '-'} - ${fixture.goals.away ?? '-'}`
})

const selectHeroFixture = () => {
  if (heroFixture.value) {
    emit('select', heroFixture.value.id)
  }
}
</script>

<template>
  <v-card
    class="football-surface football-surface--glow football-interactive-card"
    variant="outlined"
    @click="selectHeroFixture"
  >
    <v-card-title class="d-flex align-center justify-space-between">
      <span>Match Hero</span>
      <v-chip size="small" color="primary" variant="tonal">
        {{ heroFixture?.status?.short || 'NS' }}
      </v-chip>
    </v-card-title>

    <v-divider />

    <v-card-text>
      <div class="text-subtitle-2 text-medium-emphasis mb-3">
        {{ heroSubtitle }}
      </div>

      <template v-if="heroFixture">
        <div class="d-flex align-center justify-space-between ga-3">
          <div class="hero-team text-left">
            <div class="text-body-1 font-weight-bold text-truncate">
              {{ heroFixture.teams.home.name }}
            </div>
          </div>

          <div class="text-center">
            <div class="text-h5 font-weight-bold">{{ scoreLabel }}</div>
            <div v-if="heroMinute" class="text-caption text-primary">
              {{ heroMinute }}
            </div>
          </div>

          <div class="hero-team text-right">
            <div class="text-body-1 font-weight-bold text-truncate">
              {{ heroFixture.teams.away.name }}
            </div>
          </div>
        </div>
      </template>

      <v-alert
        v-else
        type="info"
        density="comfortable"
        variant="tonal"
      >
        Aucun match à afficher pour le moment.
      </v-alert>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.hero-team {
  width: min(38%, 240px);
}
</style>
