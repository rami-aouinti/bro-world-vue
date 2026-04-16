<script setup lang="ts">
interface FootballFixtureCardItem {
  id: number
  date: string
  status?: {
    short?: string
    long?: string
    elapsed?: number | null
  }
  teams: {
    home: { name: string }
    away: { name: string }
  }
}

defineProps<{
  fixture: FootballFixtureCardItem
  active?: boolean
}>()

defineEmits<{
  select: [fixtureId: number]
}>()
</script>

<template>
  <v-card
    variant="outlined"
    class="fixture-card mb-2"
    :class="{ 'fixture-card--active': active }"
    @click="$emit('select', fixture.id)"
  >
    <v-card-text class="py-3 px-3">
      <div class="d-flex align-center justify-space-between mb-2">
        <span class="text-caption text-medium-emphasis">
          {{ new Date(fixture.date).toLocaleString() }}
        </span>
        <v-chip size="x-small" color="primary" variant="tonal">
          {{ fixture.status?.short || 'NS' }}
        </v-chip>
      </div>

      <div class="d-flex align-center justify-space-between text-body-2 font-weight-bold">
        <span class="text-truncate">{{ fixture.teams.home.name }}</span>
        <span class="mx-2 text-medium-emphasis">vs</span>
        <span class="text-truncate text-right">{{ fixture.teams.away.name }}</span>
      </div>

      <div class="text-caption text-medium-emphasis mt-2 text-truncate">
        {{ fixture.status?.long || 'Scheduled' }}
      </div>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.fixture-card {
  cursor: pointer;
  transition: all 180ms ease;
}

.fixture-card:hover {
  border-color: rgba(var(--v-theme-primary), 0.6);
  transform: translateY(-1px);
}

.fixture-card--active {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 8px 20px rgba(14, 165, 233, 0.22);
}
</style>
