<script setup lang="ts">
import RandomResumeDrawerCards
  from "~/components/Resume/RandomResumeDrawerCards.vue";

useSeoMeta({
  robots: 'index, follow',
  keywords: 'free, IA, AI, resume help, resume documentation, cv assistant',
})
definePageMeta({ layout: 'resume', title: 'Documentation' })
const { t, tm, rt } = useI18n()

type DocCategory = { title: string; points: string[] }
const categories = computed(() => tm('resumeResources.documentation.categories') as DocCategory[])
const tips = computed(() => (tm('resumeResources.documentation.tips') as unknown[]).map((item) => rt(item)))
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #right>
        <RandomResumeDrawerCards />
      </template>
    </AppPageDrawers>
    <v-container fluid>
      <div class="hero mb-8">
        <h1 class="text-h3 font-weight-bold mb-2">{{ t('resumeResources.documentation.title') }}</h1>
        <p class="text-medium-emphasis mb-8">{{ t('resumeResources.documentation.description') }}</p>
      </div>

    <v-row>
      <v-col v-for="category in categories" :key="category.title" cols="12" md="6">
        <v-card class="doc-card h-100 postcard-gradient-card" elevation="3">
          <v-card-title class="text-wrap">{{ rt(category.title) }}</v-card-title>
          <v-list density="compact" class="postcard-gradient-card">
            <v-list-item
              v-for="(point, index) in category.points"
              :key="index"
              :title="rt(point)"
              prepend-icon="mdi-chevron-right"
            />
          </v-list>
        </v-card>
      </v-col>
    </v-row>

      <v-card class="mt-8 postcard-gradient-card" color="primary" variant="tonal">
        <v-card-title>Best Practices</v-card-title>
        <v-card-text>
          <v-chip-group column>
            <v-chip v-for="(tip, i) in tips" :key="i" color="primary" variant="flat">{{ tip }}</v-chip>
          </v-chip-group>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>

<style scoped>
.hero {
  border-left: 4px solid rgb(var(--v-theme-primary));
  padding-left: 16px;
}

.doc-card {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.doc-card:hover {
  transform: translateY(-3px) scale(1.01);
  box-shadow: 0 10px 24px rgb(0 0 0 / 14%);
}
</style>
