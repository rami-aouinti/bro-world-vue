<script setup lang="ts">
import GENERATED_RESUME_TEMPLATES from '~/data/resume-templates/generated-20-resume.json'
import CvLayoutAside from '~/components/cv/layouts/CvLayoutAside.vue'
import CvLayoutAsideLeft from '~/components/cv/layouts/CvLayoutAsideLeft.vue'
import CvLayoutAsideRight from '~/components/cv/layouts/CvLayoutAsideRight.vue'
import CvLayoutNoAside from '~/components/cv/layouts/CvLayoutNoAside.vue'
import CvLayoutAsideFullLeft from '~/components/cv/layouts/CvLayoutAsideFullLeft.vue'
import CvLayoutAsideFullRight from '~/components/cv/layouts/CvLayoutAsideFullRight.vue'
import CvLayoutAsideBarLeft from '~/components/cv/layouts/CvLayoutAsideBarLeft.vue'
import CvLayoutAsideBarRight from '~/components/cv/layouts/CvLayoutAsideBarRight.vue'

definePageMeta({ layout: false })

const route = useRoute()
const templateId = computed(() => {
  const fromParams = typeof route.params.templateId === 'string' ? route.params.templateId : ''
  const fromQuery = typeof route.query.template === 'string' ? route.query.template : ''
  return String(fromParams || fromQuery || 'tpl-001')
})

function resolveGeneratedTemplateId(rawTemplateId: string): string {
  const normalized = rawTemplateId.trim()
  if (!normalized) return ''
  const withoutTemplatePrefix = normalized.startsWith('template=')
    ? normalized.slice('template='.length).trim()
    : normalized

  const exactGenerated = GENERATED_RESUME_TEMPLATES.find((template) => template.id === withoutTemplatePrefix)
  if (exactGenerated) return exactGenerated.id

  const unprefixed = withoutTemplatePrefix.startsWith('resume-') ? withoutTemplatePrefix.slice('resume-'.length) : withoutTemplatePrefix
  const prefixedGenerated = GENERATED_RESUME_TEMPLATES.find((template) => template.id === unprefixed)
  if (prefixedGenerated) return prefixedGenerated.id
  const startsWithGenerated = GENERATED_RESUME_TEMPLATES.find((template) => template.id.startsWith(withoutTemplatePrefix))
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
  'aside-bar-left': CvLayoutAsideBarLeft,
  'aside-bar-right': CvLayoutAsideBarRight,
} as const

const activeLayoutComponent = computed(() => cvLayoutComponentMap[selectedTemplate.value.layout as keyof typeof cvLayoutComponentMap] || CvLayoutNoAside)

const asideDesign = computed(() => ({
  width: String(selectedTemplate.value?.aside?.width || '100%'),
  height: String(selectedTemplate.value?.aside?.height || '1100px'),
  radius: String(selectedTemplate.value?.aside?.radius || '24px'),
}))

const fakeData = computed(() => selectedTemplate.value?.fakeData || {})

const sectionEntries = computed(() => {
  const sections = selectedTemplate.value?.sections
  if (!sections || typeof sections !== 'object') return []
  return Object.entries(sections as Record<string, string>)
    .filter(([key]) => !key.toLowerCase().includes('label'))
})

function toLabel(raw: string): string {
  return raw
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}

function previewValue(key: string): string {
  const source = fakeData.value as Record<string, any>
  const value = source?.[key]
  if (typeof value === 'string') return value
  if (Array.isArray(value) && value.length > 0) {
    const first = value[0]
    if (typeof first === 'string') return first
    if (first && typeof first === 'object') {
      const best = first.title || first.role || first.name || first.company || first.degree
      if (typeof best === 'string') return best
    }
  }
  return 'Sample content'
}
</script>

<template>
  <main class="capture-cv-page">
    <component :is="activeLayoutComponent" :style="{ background: selectedTemplate?.theme?.palette?.pageBackground || '#ffffff', border: selectedTemplate?.theme?.pageBorder?.enabled ? `${selectedTemplate?.theme?.pageBorder?.width ?? 0}px solid ${selectedTemplate?.theme?.pageBorder?.color ?? 'transparent'}` : 'none', borderRadius: `${selectedTemplate?.theme?.pageBorder?.radius ?? 0}px`, '--cv-primary': selectedTemplate?.theme?.palette?.primary || '#1d4ed8', '--cv-aside-width': asideDesign.width, '--cv-aside-height': asideDesign.height, '--cv-aside-radius': asideDesign.radius }">
      <template #header>
        <div class="capture-empty-state">
          <h2>{{ selectedTemplate.name }}</h2>
          <p>{{ selectedTemplate.id }} · {{ selectedTemplate.layout }}</p>
        </div>
      </template>
      <template #content>
        <div class="capture-content">
          <div
            v-for="[sectionKey, sectionVariant] in sectionEntries"
            :key="sectionKey"
            class="capture-section"
          >
            <strong>{{ toLabel(sectionKey) }}</strong>
            <small>{{ sectionVariant }}</small>
            <p>{{ previewValue(sectionKey) }}</p>
          </div>
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

.capture-content {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  padding: 12px;
}

.capture-section {
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 8px;
  background: rgba(255, 255, 255, 0.65);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.capture-section small {
  color: #64748b;
  text-transform: uppercase;
}

.capture-section p {
  margin: 0;
  color: #0f172a;
  font-size: 12px;
  line-height: 1.35;
}
</style>
