<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  stats: Record<string, any>
}>()
const { t } = useI18n()

const appearances = computed(
  () => props.stats.games?.appearances ?? props.stats.games?.appearences ?? '-',
)

const items = computed(() => [
  {
    label: t('pages.applications.football.stats.apps'),
    value: appearances.value,
  },
  {
    label: t('pages.applications.football.stats.minutes'),
    value: props.stats.games?.minutes ?? '-',
  },
  {
    label: t('pages.applications.football.stats.goals'),
    value: props.stats.goals?.total ?? '-',
  },
  {
    label: t('pages.applications.football.stats.assists'),
    value: props.stats.goals?.assists ?? '-',
  },
  {
    label: t('pages.applications.football.stats.rating'),
    value: props.stats.games?.rating ?? '-',
  },
])
</script>

<template>
  <v-row dense>
    <v-col v-for="item in items" :key="item.label" cols="6" md="4" lg="2">
      <v-sheet border rounded="lg" class="pa-3 h-100">
        <div class="text-caption text-medium-emphasis">{{ item.label }}</div>
        <div class="text-subtitle-1 font-weight-bold">{{ item.value }}</div>
      </v-sheet>
    </v-col>
  </v-row>
</template>
