<script setup lang="ts">
definePageMeta({
  title: 'Create Cover Page',
  layout: 'resume',
})

const route = useRoute()

type CoverPageTemplate = {
  id: string
  title: string
  image: string
}

const imagePool = ['/img/cv/cv-1.png', '/img/cv/cv-2.png', '/img/cv/cv-3.png', '/img/cv/cv-4.png', '/img/cv/cv-5.png']

const templates = computed<CoverPageTemplate[]>(() =>
  Array.from({ length: 10 }, (_, index) => ({
    id: `cover-page-template-${index + 1}`,
    title: `Cover Page Template ${index + 1}`,
    image: imagePool[(index + 1) % imagePool.length],
  })),
)

const selectedTemplate = ref('cover-page-template-1')
const coverTitle = ref('John Doe')
const coverSubtitle = ref('Full Stack Developer')
const coverSummary = ref('Professional application pack cover page.')

onMounted(() => {
  if (typeof route.query.template === 'string')
    selectedTemplate.value = route.query.template
})
</script>

<template>
  <v-container fluid class="pa-4 pa-md-8">
    <h1 class="text-h4 mb-4">Create Cover Page</h1>
    <p class="text-medium-emphasis mb-6">
      La cover page est séparée de la cover letter et du résumé.
    </p>

    <div class="template-slider mb-6">
      <v-card
        v-for="template in templates"
        :key="template.id"
        class="template-card"
        :class="{ 'template-card--active': selectedTemplate === template.id }"
        variant="outlined"
        @click="selectedTemplate = template.id"
      >
        <v-img :src="template.image" height="130" cover />
        <v-card-text>{{ template.title }}</v-card-text>
      </v-card>
    </div>

    <v-card variant="outlined">
      <v-card-title>Writing mode</v-card-title>
      <v-card-text class="d-grid ga-4">
        <v-text-field v-model="coverTitle" label="Nom complet" variant="outlined" hide-details />
        <v-text-field v-model="coverSubtitle" label="Titre de poste" variant="outlined" hide-details />
        <v-textarea
          v-model="coverSummary"
          rows="6"
          label="Résumé court"
          variant="outlined"
          hide-details
        />
      </v-card-text>
    </v-card>
  </v-container>
</template>

<style scoped>
.template-slider { display: flex; gap: 16px; overflow-x: auto; padding-bottom: 8px; }
.template-card { min-width: 240px; cursor: pointer; }
.template-card--active { border-color: rgb(var(--v-theme-primary)); box-shadow: 0 0 0 1px rgb(var(--v-theme-primary)); }
</style>
