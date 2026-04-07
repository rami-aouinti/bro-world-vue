<template>
  <v-card rounded="lg" class="mb-4">
    <v-card-title class="text-subtitle-1 font-weight-bold">Stories</v-card-title>
    <v-card-text>
      <div class="d-flex ga-3 overflow-x-auto pb-2">
        <v-sheet
          v-for="story in stories"
          :key="story"
          color="primary"
          rounded="lg"
          class="d-flex align-center justify-center text-white px-4"
          min-width="110"
          height="140"
        >
          {{ story }}
        </v-sheet>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
const stories = ['Story 1', 'Story 2', 'Story 3', 'Story 4', 'Story 5']
</script>
