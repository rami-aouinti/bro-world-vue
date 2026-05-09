<script setup lang="ts">
useSeoMeta({
  robots: 'index, follow',
  keywords: 'free, IA, AI, resume help, resume documentation, cv assistant',
})
definePageMeta({ layout: 'resume', title: 'Help' })
const { t, tm, rt } = useI18n()

type HelpStep = { title: string; details: string }
type HelpFaq = { q: string; a: string }
const steps = computed(() => tm('resumeResources.help.steps') as HelpStep[])
const faqs = computed(() => tm('resumeResources.help.faqs') as HelpFaq[])
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #right>
        <RandomResumeDrawerCards />
      </template>
    </AppPageDrawers>
    <v-container class="py-8" max-width="1100">
      <h1 class="text-h3 font-weight-bold mb-2">{{ t('resumeResources.help.title') }}</h1>
      <p class="text-medium-emphasis mb-8">{{ t('resumeResources.help.description') }}</p>

    <v-timeline align="start" density="compact" side="end" class="mb-10">
      <v-timeline-item
        v-for="(step, index) in steps"
        :key="step.title"
        dot-color="primary"
        fill-dot
        :icon="`mdi-numeric-${index + 1}-circle`"
      >
        <v-card class="step-card" elevation="3">
          <v-card-title>{{ rt(step.title) }}</v-card-title>
          <v-card-text class="text-medium-emphasis">{{ rt(step.details) }}</v-card-text>
        </v-card>
      </v-timeline-item>
    </v-timeline>

      <v-row>
        <v-col v-for="faq in faqs" :key="faq.q" cols="12" md="6">
          <v-card class="faq-card h-100" variant="outlined">
            <v-card-title class="text-wrap">{{ rt(faq.q) }}</v-card-title>
            <v-card-text class="text-medium-emphasis">{{ rt(faq.a) }}</v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
.step-card,
.faq-card {
  transition: transform 0.25s ease;
}
.step-card:hover,
.faq-card:hover {
  transform: translateY(-4px);
}
</style>
