<script setup lang="ts">
import type {
  FootballFixture,
  FootballSection,
} from '~/composables/useFootballData'
import SportsFootballFixtureCard from '~/components/Sports/Football/FixtureCard.vue'

const { t } = useI18n()

defineProps<{
  fixtures: FootballFixture[]
  selectedFixtureId: number | null
  section: FootballSection
}>()

defineEmits<{
  select: [fixtureId: number]
  selectTeam: [teamId: number]
}>()
</script>

<template>
  <template v-if="section.state === 'loading'">
    <v-progress-circular indeterminate color="primary" size="22" class="mr-3" />
    <span>{{ t('pages.applications.football.loading.fixtures') }}</span>
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

  <v-list v-else density="compact" class="pa-0">
    <TransitionGroup name="stagger" tag="div" class="football-transition-list">
      <SportsFootballFixtureCard
        v-for="fixture in fixtures"
        :key="fixture.id"
        :fixture="fixture"
        :active="selectedFixtureId === fixture.id"
        class="fixtures-list-widget__card"
        @select="$emit('select', $event)"
        @select-team="$emit('selectTeam', $event)"
      />
    </TransitionGroup>
  </v-list>
</template>

<style scoped>
.football-transition-list {
  display: grid;
  row-gap: 8px;
}

.fixtures-list-widget__card {
  margin-bottom: 0 !important;
}
</style>
