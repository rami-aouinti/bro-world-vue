<script setup lang="ts">
import { SPORTS } from '~/types/sports'

definePageMeta({
  title: 'appbar.sports',
})

const { t } = useI18n()

const quickSports = computed(() => SPORTS.slice(0, 6))
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #left>
        <div class="pa-4">
          <h3 class="text-subtitle-1 font-weight-bold mb-2">
            {{ t('appbar.sports') }}
          </h3>
          <p class="text-body-2 text-medium-emphasis mb-0">
            {{ t('pages.applications.sportsDescription') }}
          </p>
        </div>
      </template>

      <template #right>
        <div class="pa-4">
          <h3 class="text-subtitle-1 font-weight-bold mb-3">
            {{ t('pages.applications.quickSportsTitle', 'Quick sports') }}
          </h3>
          <v-list density="compact" lines="one" class="pa-0 bg-transparent">
            <v-list-item
              v-for="sport in quickSports"
              :key="`quick-${sport.slug}`"
              :title="sport.label"
              :to="`/applications/sports/${sport.slug}`"
              rounded="lg"
            >
              <template #prepend>
                <v-avatar size="40" rounded="lg" class="mr-2">
                  <v-img :src="sport.image" :alt="sport.label" cover />
                </v-avatar>
              </template>
            </v-list-item>
          </v-list>
        </div>
      </template>
    </AppPageDrawers>

    <v-container fluid>
      <v-row>
        <v-col
          v-for="sport in SPORTS"
          :key="sport.slug"
          cols="12"
          sm="6"
          md="4"
        >
          <v-card
            class="sport-card h-100"
            :to="`/applications/sports/${sport.slug}`"
            link
            variant="outlined"
          >
            <v-img :src="sport.image" :alt="sport.label" height="120" cover />

            <v-card-text class="d-flex align-center justify-space-between py-4">
              <span class="text-subtitle-1 font-weight-medium">{{
                sport.label
              }}</span>
              <v-icon icon="mdi-chevron-right" />
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
.sport-card {
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;
}

.sport-card:hover,
.sport-card:focus-visible {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px rgba(2, 16, 63, 0.2);
  border-color: rgb(var(--v-theme-primary));
}
</style>
