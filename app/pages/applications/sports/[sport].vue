<script setup lang="ts">
import {
  SPORT_SLUGS,
  SPORTS_BY_SLUG,
  type SportDefinition,
  type SportSlug,
} from '~/types/sports'

definePageMeta({
  title: 'appbar.sports',
})

type SectionState = 'loading' | 'error' | 'empty' | 'ready'

interface FootballSection {
  key: string
  title: string
  state: SectionState
  errorMessage?: string
  items: string[]
}

const route = useRoute()

const isSportSlug = (value: string): value is SportSlug => {
  return (SPORT_SLUGS as readonly string[]).includes(value)
}

const sportSlug = computed<SportSlug | null>(() => {
  const slug = route.params.sport

  if (typeof slug !== 'string' || !isSportSlug(slug)) {
    return null
  }

  return slug
})

if (!sportSlug.value) {
  throw createError({
    statusCode: 404,
    statusMessage: 'Sport not found',
  })
}

const sport = computed<SportDefinition>(() => SPORTS_BY_SLUG[sportSlug.value as SportSlug])

const footballSections = ref<FootballSection[]>([
  {
    key: 'leagues',
    title: 'Leagues',
    state: 'ready',
    items: ['Premier League', 'La Liga', 'Serie A'],
  },
  {
    key: 'fixtures',
    title: 'Fixtures / Matches',
    state: 'loading',
    items: [],
  },
  {
    key: 'results',
    title: 'Results / Standings',
    state: 'empty',
    items: [],
  },
  {
    key: 'statistics',
    title: 'Statistics',
    state: 'error',
    errorMessage: 'Unable to load statistics right now.',
    items: [],
  },
  {
    key: 'clubs',
    title: 'Clubs / Teams',
    state: 'ready',
    items: ['Arsenal', 'Real Madrid', 'Inter Milan'],
  },
])
</script>

<template>
  <v-container fluid>
    <v-card class="pa-6 mb-6">
      <v-img :src="sport.image" :alt="sport.label" height="220" cover class="mb-4" />
      <h2 class="text-h5 mb-2">{{ sport.label }}</h2>
      <p class="text-medium-emphasis mb-0">Slug: {{ sport.slug }}</p>
    </v-card>

    <template v-if="sport.slug === 'football'">
      <v-row>
        <v-col
          v-for="section in footballSections"
          :key="section.key"
          cols="12"
          md="6"
          lg="4"
        >
          <v-card class="h-100" variant="outlined">
            <v-card-title>{{ section.title }}</v-card-title>
            <v-divider />
            <v-card-text>
              <template v-if="section.state === 'loading'">
                <v-progress-circular indeterminate color="primary" size="22" class="mr-3" />
                <span>Loading {{ section.title.toLowerCase() }}…</span>
              </template>

              <v-alert
                v-else-if="section.state === 'error'"
                type="error"
                variant="tonal"
                density="comfortable"
              >
                {{ section.errorMessage }}
              </v-alert>

              <v-alert
                v-else-if="section.state === 'empty'"
                type="info"
                variant="tonal"
                density="comfortable"
              >
                No data available for now.
              </v-alert>

              <v-list v-else density="compact" lines="one" class="pa-0">
                <v-list-item v-for="item in section.items" :key="item" :title="item" />
              </v-list>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </template>
  </v-container>
</template>
