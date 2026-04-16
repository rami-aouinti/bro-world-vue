<script setup lang="ts">
interface PlayerDetails {
  profile: {
    name: string
    nationality: string | null
    age: number | null
    photo: string | null
    height: string | null
    weight: string | null
  } | null
  statistics: Array<Record<string, any>>
}

defineProps<{
  details: PlayerDetails
}>()
</script>

<template>
  <template v-if="details.profile">
    <div class="d-flex align-start mb-4">
      <v-avatar size="72" class="mr-3">
        <v-img :src="details.profile.photo || undefined" />
      </v-avatar>
      <div>
        <div class="text-h6">{{ details.profile.name }}</div>
        <div class="text-body-2">
          {{ details.profile.nationality || 'Unknown nationality' }} ·
          Age {{ details.profile.age ?? '-' }}
        </div>
        <div class="text-caption">
          {{ details.profile.height || '-' }} / {{ details.profile.weight || '-' }}
        </div>
      </div>
    </div>

    <v-expansion-panels variant="accordion">
      <v-expansion-panel
        v-for="(stat, index) in details.statistics"
        :key="`stat-${index}`"
      >
        <v-expansion-panel-title>
          {{ stat.league?.name || 'League' }} · {{ stat.team?.name || 'Team' }}
        </v-expansion-panel-title>
        <v-expansion-panel-text>
          <div class="text-body-2">Appearances: {{ stat.games?.appearences ?? '-' }}</div>
          <div class="text-body-2">Minutes: {{ stat.games?.minutes ?? '-' }}</div>
          <div class="text-body-2">Goals: {{ stat.goals?.total ?? '-' }}</div>
          <div class="text-body-2">Assists: {{ stat.goals?.assists ?? '-' }}</div>
          <div class="text-body-2">Rating: {{ stat.games?.rating ?? '-' }}</div>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>
  </template>
</template>
