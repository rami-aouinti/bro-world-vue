<script setup lang="ts">
useSeoMeta({
  robots: 'index, follow',
  keywords: 'free, IA, AI, resume help, resume documentation, cv assistant',
})
definePageMeta({ layout: 'resume', title: 'IA Features' })
const { t, tm, rt } = useI18n()

type IaSection = { title: string; description: string; icon: string; chips: string[] }
const sections = computed(() => tm('resumeResources.iaFeatures.sections') as IaSection[])
const benefits = computed(() => (tm('resumeResources.iaFeatures.benefits') as unknown[]).map((item) => rt(item)))
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
        <h1 class="text-h3 font-weight-bold mb-2">{{ t('resumeResources.iaFeatures.title') }}</h1>
        <p class="text-medium-emphasis text-body-1">{{ t('resumeResources.iaFeatures.description') }}</p>
      </div>

    <v-row>
      <v-col v-for="(section, index) in sections" :key="section.title" cols="12" md="6">
        <v-card class="feature-card h-100 postcard-gradient-card" :style="{ animationDelay: `${index * 0.08}s` }" elevation="4">
          <v-card-item>
            <template #prepend>
              <v-avatar color="primary" variant="tonal" size="44">
                <v-icon :icon="section.icon" />
              </v-avatar>
            </template>
            <v-card-title class="text-wrap">{{ rt(section.title) }}</v-card-title>
            <v-card-subtitle class="text-wrap">{{ rt(section.description) }}</v-card-subtitle>
          </v-card-item>
          <v-card-text>
            <div class="d-flex flex-wrap ga-2">
              <v-chip v-for="chip in section.chips" :key="chip" color="primary" variant="outlined" size="small">
                {{ rt(chip) }}
              </v-chip>
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

      <v-card class="mt-8 postcard-gradient-card" color="surface-variant" variant="text">
        <v-card-title class="text-h6">Impact</v-card-title>
        <v-list bg-color="transparent">
          <v-list-item v-for="(benefit, i) in benefits" :key="i" :title="benefit" prepend-icon="mdi-check-decagram" />
        </v-list>
      </v-card>
    </v-container>
  </div>
</template>

<style scoped>
.hero {
  border-left: 4px solid rgb(var(--v-theme-primary));
  padding-left: 16px;
}

.feature-card {
  animation: rise 0.6s ease both;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgb(0 0 0 / 16%);
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
