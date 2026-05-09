<script setup lang="ts">
definePageMeta({ layout: 'resume', title: 'Mes Files' })

import RandomResumeDrawerCards
  from "~/components/Resume/RandomResumeDrawerCards.vue";

const myFileCards = [
  {
    title: 'CV',
    description: 'Affiche mes CV.',
    icon: 'mdi-file-document-outline',
    to: '/profile',
  },
  {
    title: 'Cover Page',
    description: 'Affiche mes cover pages.',
    icon: 'mdi-file-account-outline',
    to: '/profile',
  },
  {
    title: 'Cover Letter',
    description: 'Affiche mes cover letters.',
    icon: 'mdi-email-outline',
    to: '/profile',
  },
] as const
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #right>
        <RandomResumeDrawerCards />
      </template>
    </AppPageDrawers>
    <v-container class="py-8" max-width="1100">
      <div class="hero mb-8">
        <h1 class="text-h3 font-weight-bold mb-2">Mes Files</h1>
        <p class="text-medium-emphasis text-body-1">
          My Files.
        </p>
      </div>

      <v-row>
        <v-col v-for="card in myFileCards" :key="card.title" cols="12" md="4">
          <v-card class="h-100 postcard-gradient-card my-file-card" rounded="xl" :to="card.to">
            <v-card-text>
              <div class="d-flex align-center ga-3 mb-2">
                <v-icon :icon="card.icon" size="28" color="primary" />
                <h2 class="text-h6">{{ card.title }}</h2>
              </div>
              <p class="text-body-2 text-medium-emphasis mb-0">{{ card.description }}</p>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
.hero {
  border-left: 4px solid rgb(var(--v-theme-primary));
  padding-left: 16px;
}
.my-file-card {
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.my-file-card:hover {
  transform: translateY(-2px);
}
</style>
