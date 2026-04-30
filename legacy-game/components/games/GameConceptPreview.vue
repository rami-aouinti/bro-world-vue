<script setup lang="ts">
import type { ConceptPlayMode } from '~/types/game'

const props = withDefaults(
  defineProps<{
    title: string
    coreLoop: string[]
    rulesSummary: string[]
    uxMockSections: string[]
    plannedModes: ConceptPlayMode[]
    monetizationNotes?: string[]
    milestones: string[]
  }>(),
  {
    monetizationNotes: () => [],
  },
)

const displayModes = computed(() =>
  props.plannedModes.map((mode) => {
    if (mode === 'ai') return 'AI'
    if (mode === 'pvp') return 'PvP'
    return 'Online'
  }),
)
</script>

<template>
  <v-card variant="outlined" class="pa-4 d-flex flex-column ga-4">
    <div>
      <p class="text-caption text-medium-emphasis mb-1">Vision du jeu</p>
      <p class="text-body-1 font-weight-medium mb-0">{{ title }}</p>
    </div>

    <div>
      <p class="text-caption text-medium-emphasis mb-1">Boucle de gameplay</p>
      <ol class="pl-5 mb-0">
        <li
          v-for="(step, index) in coreLoop"
          :key="`loop-step-${index}-${step}`"
          class="mb-1"
        >
          {{ step }}
        </li>
      </ol>
    </div>

    <div>
      <p class="text-caption text-medium-emphasis mb-1">Résumé des règles</p>
      <ul class="pl-5 mb-0">
        <li v-for="rule in rulesSummary" :key="`rule-${rule}`" class="mb-1">
          {{ rule }}
        </li>
      </ul>
    </div>

    <div>
      <p class="text-caption text-medium-emphasis mb-2">Modes prévus</p>
      <div class="d-flex flex-wrap ga-2">
        <v-chip
          v-for="mode in displayModes"
          :key="`planned-mode-${mode}`"
          size="small"
          color="primary"
          variant="tonal"
        >
          {{ mode }}
        </v-chip>
      </div>
    </div>

    <div>
      <p class="text-caption text-medium-emphasis mb-1">Sections UX mockées</p>
      <ul class="pl-5 mb-0">
        <li
          v-for="section in uxMockSections"
          :key="`ux-${section}`"
          class="mb-1"
        >
          {{ section }}
        </li>
      </ul>
    </div>

    <div v-if="monetizationNotes.length">
      <p class="text-caption text-medium-emphasis mb-1">Monétisation (notes)</p>
      <ul class="pl-5 mb-0">
        <li
          v-for="note in monetizationNotes"
          :key="`monetization-${note}`"
          class="mb-1"
        >
          {{ note }}
        </li>
      </ul>
    </div>

    <div>
      <p class="text-caption text-medium-emphasis mb-1">Milestones</p>
      <ul class="pl-5 mb-0">
        <li
          v-for="milestone in milestones"
          :key="`milestone-${milestone}`"
          class="mb-1"
        >
          {{ milestone }}
        </li>
      </ul>
    </div>
  </v-card>
</template>
