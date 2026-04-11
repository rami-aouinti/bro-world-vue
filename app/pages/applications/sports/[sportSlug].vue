<script setup lang="ts">
import { SPORTS_BY_SLUG, type SportSlug } from '~/types/sports'

definePageMeta({
  title: 'appbar.sports',
})

const route = useRoute()

const sport = computed(() => {
  const slug = route.params.sportSlug

  if (typeof slug !== 'string') {
    return null
  }

  return SPORTS_BY_SLUG[slug as SportSlug] ?? null
})

if (!sport.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Sport not found',
  })
}
</script>

<template>
  <v-container fluid>
    <v-card class="pa-6">
      <v-img :src="sport?.image" :alt="sport?.label" height="220" cover class="mb-4" />
      <h2 class="text-h5 mb-2">{{ sport?.label }}</h2>
      <p class="text-medium-emphasis mb-0">Slug: {{ sport?.slug }}</p>
    </v-card>
  </v-container>
</template>
