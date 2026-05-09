<script setup lang="ts">
import GENERATED_RESUME_TEMPLATES from '~/data/resume-templates/generated-20-resume.json'

const { allTemplates } = useResumeTemplates()

const generatedResumeTemplates = computed(() =>
  GENERATED_RESUME_TEMPLATES.map((template) => ({
    id: template.id,
    title: `${template.name}`,
    image: template.id ? `/img/cv/generated/${template.id}.png` : '/img/cv/resume-modern.svg',
    type: 'resume' as const,
  })),
)

const byType = computed(() => ({
  resume: generatedResumeTemplates.value,
  'cover-page': allTemplates.value.filter((template) => template.type === 'cover-page'),
  'cover-letter': allTemplates.value.filter((template) => template.type === 'cover-letter'),
}))

function pickRandom<T>(items: T[]): T | null {
  if (!items.length) return null
  return items[Math.floor(Math.random() * items.length)] ?? null
}

const rightDrawerRandomTemplates = computed(() => {
  const picks = [
    pickRandom(byType.value.resume),
    pickRandom(byType.value['cover-page']),
    pickRandom(byType.value['cover-letter']),
  ]

  return picks.filter((item): item is NonNullable<typeof item> => Boolean(item))
})

const templatePreviewRoute = (templateType: 'resume' | 'cover-page' | 'cover-letter', templateId: string) => {
  if (templateType === 'resume') return `/resume/cv/preview?template=${templateId}`
  if (templateType === 'cover-page') return `/resume/cover-page/preview?template=${templateId}`
  return `/resume/cover-letter/preview?template=${templateId}`
}
</script>

<template>
  <v-row dense>
    <v-col v-for="variant in rightDrawerRandomTemplates" :key="variant.id" cols="12">
      <v-card class="preview-variant-card postcard-gradient-card" :to="templatePreviewRoute(variant.type, variant.id)">
        <v-img :src="variant.image" :alt="variant.title" height="130" cover />
        <v-card-text class="py-2">{{ variant.title }}</v-card-text>
      </v-card>
    </v-col>
  </v-row>
</template>
