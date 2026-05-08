<script setup lang="ts">
definePageMeta({ layout: 'resume', title: 'FAQ' })
const { t, tm, rt } = useI18n()

type HelpFaq = { q: string; a: string }
const faqs = computed(() => tm('resumeResources.help.faqs') as HelpFaq[])
</script>

<template>
  <v-container class="py-8" max-width="1100">
    <div class="mb-8">
      <v-chip
        color="primary"
        variant="tonal"
        prepend-icon="mdi-frequently-asked-questions"
        class="mb-3"
      >
        FAQ
      </v-chip>
      <h1 class="text-h3 font-weight-bold mb-2">
        {{ t('resumeResources.help.title') }}
      </h1>
      <p class="text-medium-emphasis">
        {{ t('resumeResources.help.description') }}
      </p>
    </div>

    <v-row>
      <v-col v-for="faq in faqs" :key="faq.q" cols="12" md="6">
        <v-card class="faq-card h-100" variant="outlined">
          <v-card-title class="text-wrap">{{ rt(faq.q) }}</v-card-title>
          <v-card-text class="text-medium-emphasis">{{
            rt(faq.a)
          }}</v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<style scoped>
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
