<script setup lang="ts">
definePageMeta({ layout: 'resume', title: 'FAQ' })
const { t, tm, rt } = useI18n()

type HelpFaq = { q: string; a: string }
const faqs = computed(() => tm('resumeResources.help.faqs') as HelpFaq[])
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
        <h1 class="text-h3 font-weight-bold mb-2">
          {{ t('resumeResources.help.title') }}
        </h1>
        <p class="text-medium-emphasis">
          {{ t('resumeResources.help.description') }}
        </p>
      </div>

      <v-row>
        <v-col v-for="faq in faqs" :key="faq.q" cols="12" md="6">
          <v-card class="faq-card h-100 postcard-gradient-card" variant="text">
            <v-card-title class="text-wrap">{{ rt(faq.q) }}</v-card-title>
            <v-card-text class="text-medium-emphasis">{{
              rt(faq.a)
            }}</v-card-text>
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

.faq-card {
  transition:
    transform 0.25s ease,
    box-shadow 0.25s ease;
}

.faq-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px rgb(0 0 0 / 14%);
}
</style>
