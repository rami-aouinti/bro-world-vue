<script setup lang="ts">
import { SPORTS } from '~/types/sports'

definePageMeta({
  title: 'appbar.sports',
})

const { t } = useI18n()
</script>

<template>
  <v-container fluid>
    <v-card class="pa-6 mb-6">
      <h2 class="text-h5 mb-2">{{ t('appbar.sports') }}</h2>
      <p class="text-medium-emphasis mb-0">
        {{ t('pages.applications.sportsDescription') }}
      </p>
    </v-card>

    <v-row>
      <v-col
        v-for="sport in SPORTS"
        :key="sport.slug"
        cols="12"
        sm="6"
        md="4"
        lg="3"
      >
        <v-card
          class="sport-card h-100"
          :to="`/applications/sports/${sport.slug}`"
          link
          variant="outlined"
        >
          <v-img :src="sport.image" :alt="sport.label" height="160" cover />

          <v-card-text class="d-flex align-center justify-space-between py-4">
            <span class="text-subtitle-1 font-weight-medium">{{ sport.label }}</span>
            <v-icon icon="mdi-chevron-right" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
.sport-card {
  transition: transform 0.18s ease, box-shadow 0.18s ease,
    border-color 0.18s ease;
}

.sport-card:hover,
.sport-card:focus-visible {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px rgba(2, 16, 63, 0.2);
  border-color: rgb(var(--v-theme-primary));
}
</style>
