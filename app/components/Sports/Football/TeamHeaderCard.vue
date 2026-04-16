<script setup lang="ts">
defineProps<{
  team: {
    name: string
    logo?: string | null
  }
  form: string | null
  fixtures: Record<string, any>
  goals: Record<string, any>
}>()
</script>

<template>
  <v-sheet rounded="lg" border class="pa-4 mb-4">
    <div class="d-flex align-center mb-3">
      <v-avatar size="42" class="mr-3">
        <v-img :src="team.logo || undefined" />
      </v-avatar>
      <div>
        <div class="text-subtitle-1 font-weight-bold">{{ team.name }}</div>
        <div class="text-caption">Form: {{ form || 'N/A' }}</div>
      </div>
    </div>

    <v-chip-group>
      <v-chip color="primary" size="small" variant="tonal">Played: {{ fixtures?.played?.total ?? '-' }}</v-chip>
      <v-chip color="success" size="small" variant="tonal">Wins: {{ fixtures?.wins?.total ?? '-' }}</v-chip>
      <v-chip color="warning" size="small" variant="tonal">Goals: {{ goals?.for?.total?.total ?? '-' }}</v-chip>
    </v-chip-group>
  </v-sheet>
</template>
