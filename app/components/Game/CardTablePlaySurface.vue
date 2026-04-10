<script setup lang="ts">
interface PlaySurfaceProps {
  sessionId: string
  gameName: string
  level: string
  status: string
}

defineProps<PlaySurfaceProps>()
</script>

<template>
  <v-card rounded="xl" class="h-100">
    <v-card-title>{{ gameName || 'Card game' }}</v-card-title>
    <v-card-subtitle>Card play surface</v-card-subtitle>
    <v-card-text class="py-8">
      <div class="text-h6 mb-2">Session {{ sessionId }}</div>
      <div class="text-medium-emphasis">
        Level: {{ level }} · Status: {{ status }}
      </div>
    </v-card-text>
  </v-card>
</template>
