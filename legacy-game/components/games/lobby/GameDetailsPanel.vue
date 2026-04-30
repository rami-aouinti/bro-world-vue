<script setup lang="ts">
import type { GameEntry } from '~/types/game'

defineProps<{
  selectedGame: GameEntry
  selectedGameConcept: {
    rulesSummary: string[]
  }
  safeTranslate: (key?: string | null) => string
  selectedGameLevel: string
  gameDetailTags: string[]
  gameDetailFeatures: string[]
  formatMetaChip: (value: string) => string
}>()
</script>

<template>
  <section class="d-flex flex-column ga-4">
    <v-card variant="outlined" class="pa-4">
      <h3 class="text-h6 mb-3">Game Details</h3>
      <div class="d-flex flex-column ga-3">
        <div>
          <p class="text-caption text-medium-emphasis mb-1">Nom</p>
          <p class="text-body-1 font-weight-medium mb-0">
            {{ safeTranslate(selectedGame.nameKey) }}
          </p>
        </div>
        <div>
          <p class="text-caption text-medium-emphasis mb-1">Description</p>
          <p class="text-body-2 mb-0">
            {{ safeTranslate(selectedGame.descriptionKey) }}
          </p>
        </div>
        <div class="d-flex flex-wrap ga-2">
          <v-chip size="small" variant="outlined">
            Catégorie: {{ safeTranslate(selectedGame.categoryKey) }}
          </v-chip>
          <v-chip size="small" variant="outlined">
            Sous-catégorie: {{ safeTranslate(selectedGame.subcategoryKey) }}
          </v-chip>
          <v-chip size="small" variant="outlined">
            Niveau: {{ selectedGameLevel }}
          </v-chip>
        </div>
        <div v-if="gameDetailTags.length" class="d-flex flex-wrap ga-2">
          <v-chip
            v-for="tag in gameDetailTags"
            :key="`game-tag-${tag}`"
            size="small"
            color="primary"
            variant="tonal"
          >
            {{ formatMetaChip(tag) }}
          </v-chip>
        </div>
        <div v-if="gameDetailFeatures.length" class="d-flex flex-wrap ga-2">
          <v-chip
            v-for="feature in gameDetailFeatures"
            :key="`game-feature-${feature}`"
            size="small"
            color="secondary"
            variant="tonal"
          >
            {{ formatMetaChip(feature) }}
          </v-chip>
        </div>
        <div>
          <p class="text-caption text-medium-emphasis mb-1">
            Résumé des règles
          </p>
          <ul class="pl-5 mb-0">
            <li
              v-for="rule in selectedGameConcept.rulesSummary"
              :key="`game-rule-${rule}`"
              class="mb-1"
            >
              {{ rule }}
            </li>
          </ul>
        </div>
      </div>
    </v-card>
  </section>
</template>
