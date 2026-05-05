<script setup lang="ts">
import GENERATED_RESUME_TEMPLATES from '~/data/resume-templates/generated-20-resume.json'
import CvLayoutAside from '~/components/cv/layouts/CvLayoutAside.vue'
import CvLayoutAsideLeft from '~/components/cv/layouts/CvLayoutAsideLeft.vue'
import CvLayoutAsideRight from '~/components/cv/layouts/CvLayoutAsideRight.vue'
import CvLayoutNoAside from '~/components/cv/layouts/CvLayoutNoAside.vue'
import CvLayoutAsideFullLeft from '~/components/cv/layouts/CvLayoutAsideFullLeft.vue'
import CvLayoutAsideFullRight from '~/components/cv/layouts/CvLayoutAsideFullRight.vue'

definePageMeta({ layout: false })

const route = useRoute()
const templateId = computed(() => String(route.params.templateId || 'tpl-001'))

function resolveGeneratedTemplateId(rawTemplateId: string): string {
  const normalized = rawTemplateId.trim()
  if (!normalized) return ''
  const exactGenerated = GENERATED_RESUME_TEMPLATES.find((template) => template.id === normalized)
  if (exactGenerated) return exactGenerated.id
  const unprefixed = normalized.startsWith('resume-') ? normalized.slice('resume-'.length) : normalized
  const prefixedGenerated = GENERATED_RESUME_TEMPLATES.find((template) => template.id === unprefixed)
  if (prefixedGenerated) return prefixedGenerated.id
  const startsWithGenerated = GENERATED_RESUME_TEMPLATES.find((template) => template.id.startsWith(normalized))
  if (startsWithGenerated) return startsWithGenerated.id
  return ''
}

const selectedTemplate = computed(() => {
  const resolvedTemplateId = resolveGeneratedTemplateId(templateId.value)
  return GENERATED_RESUME_TEMPLATES.find((tpl) => tpl.id === resolvedTemplateId) || GENERATED_RESUME_TEMPLATES[0]
})

const cvLayoutComponentMap = {
  aside: CvLayoutAside,
  'no-aside': CvLayoutNoAside,
  'aside-left': CvLayoutAsideLeft,
  'aside-right': CvLayoutAsideRight,
  'aside-full-left': CvLayoutAsideFullLeft,
  'aside-full-right': CvLayoutAsideFullRight,
} as const

const activeLayoutComponent = computed(() => cvLayoutComponentMap[selectedTemplate.value.layout as keyof typeof cvLayoutComponentMap] || CvLayoutNoAside)

const asideDesign = computed(() => ({
  width: String(selectedTemplate.value?.aside?.width || '100%'),
  height: String(selectedTemplate.value?.aside?.height || '1100px'),
  radius: String(selectedTemplate.value?.aside?.radius || '24px'),
}))
</script>

<template>
  <main class="capture-cv-page">
    <component :is="activeLayoutComponent" :style="{ background: selectedTemplate?.theme?.palette?.pageBackground || '#ffffff', '--cv-primary': selectedTemplate?.theme?.palette?.primary || '#1d4ed8', '--cv-aside-width': asideDesign.width, '--cv-aside-height': asideDesign.height, '--cv-aside-radius': asideDesign.radius }">
      <template #header>
        <div class="capture-empty-state">
          <h2>{{ selectedTemplate.name }}</h2>
          <p>{{ selectedTemplate.id }} · {{ selectedTemplate.layout }}</p>
        </div>
      </template>
      <template #content>
        <div class="capture-empty-state">
          <p>Layout capture CV prêt (content vide pour le moment).</p>
        </div>
      </template>
    </component>
  </main>
</template>

<style scoped>
.capture-cv-page {
  min-height: 100vh;
  display: flex;
  justify-content: flex-start;
  align-items: flex-start;
  background: #eef2ff;
  padding: 24px;
}
.capture-empty-state {
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  text-align: center;
  gap: 8px;
  color: #334155;
}
</style>
