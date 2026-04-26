<script setup lang="ts">
import CoverLetterTemplateClassic from '~/components/Resume/Templates/CoverLetterTemplateClassic.vue'
import CoverLetterTemplateModern from '~/components/Resume/Templates/CoverLetterTemplateModern.vue'
import { COVER_LETTER_TEMPLATE_IDS, COVER_PAGE_TEMPLATE_IDS } from '~/constants/resumeTemplates'

definePageMeta({
  title: 'Resume · Cover Letter Editor',
  layout: 'resume',
})

type Typography = 'sans' | 'serif'
type PaletteId = 'ocean' | 'terra' | 'midnight' | 'forest' | 'sunset' | 'lavender'

type CoverLetterModel = {
  fullName: string
  role: string
  recipient: string
  company: string
  date: string
  intro: string
  body: string
  closing: string
  email: string
  phone: string
}

const route = useRoute()
const router = useRouter()
const { coverLetterTemplates } = useResumeTemplates()
const { parseCoverFlowQuery, toCoverLetterQuery } = useResumeCoverFlow()

const tabs = [
  { value: 'edit', label: 'Edit' },
  { value: 'template', label: 'Template' },
  { value: 'design', label: 'Design' },
] as const

const palettes = {
  ocean: { page: '#f8fafc', soft: '#dbeafe', accent: '#1d4ed8', text: '#0f172a' },
  terra: { page: '#fffaf6', soft: '#f5e2d8', accent: '#9a3412', text: '#431407' },
  midnight: { page: '#f8fafc', soft: '#dbe4ff', accent: '#312e81', text: '#1f2937' },
  forest: { page: '#f7fdf8', soft: '#d9f3df', accent: '#166534', text: '#052e16' },
  sunset: { page: '#fffaf5', soft: '#ffe4d6', accent: '#ea580c', text: '#7c2d12' },
  lavender: { page: '#faf7ff', soft: '#ede9fe', accent: '#7c3aed', text: '#3b0764' },
} as const

const activeTab = ref<'edit' | 'template' | 'design'>('edit')
const fallbackTemplateId = COVER_LETTER_TEMPLATE_IDS[0] ?? 'cover-letter-classic'
const fallbackCoverPageTemplateId = COVER_PAGE_TEMPLATE_IDS[0] ?? ''
const selectedTemplate = ref(fallbackTemplateId)
const selectedPalette = ref<PaletteId>('ocean')
const selectedTypography = ref<Typography>('sans')

const importedFlow = computed(() => parseCoverFlowQuery(route.query))

const model = reactive<CoverLetterModel>({
  fullName: importedFlow.value.title || 'John Doe',
  role: importedFlow.value.subtitle || 'Full Stack Developer',
  recipient: 'Hiring Manager',
  company: 'Company Name',
  date: new Date().toLocaleDateString('fr-FR'),
  intro: 'Je vous adresse ma candidature avec enthousiasme pour rejoindre votre équipe.',
  body: 'Mon expérience en développement produit, en architecture front-end et en collaboration transverse me permet de contribuer rapidement sur des enjeux business et techniques.',
  closing: 'Je reste disponible pour un échange et vous remercie pour votre attention.',
  email: 'john@example.com',
  phone: '+33 6 00 00 00 00',
})

const selectedCoverPageBase = computed(() => ({
  templateId: importedFlow.value.template && COVER_PAGE_TEMPLATE_IDS.includes(importedFlow.value.template)
    ? importedFlow.value.template
    : fallbackCoverPageTemplateId,
  title: importedFlow.value.title || 'John Doe',
  subtitle: importedFlow.value.subtitle || 'Full Stack Developer',
  summary: importedFlow.value.summary || 'Professional application pack cover page.',
  draftId: importedFlow.value.draftId,
}))

const goBackToCoverPage = async () => {
  await router.push({
    path: '/resume/cover-page/editor',
    query: toCoverLetterQuery({
      template: selectedCoverPageBase.value.templateId,
      title: selectedCoverPageBase.value.title,
      subtitle: selectedCoverPageBase.value.subtitle,
      summary: selectedCoverPageBase.value.summary,
      draftId: selectedCoverPageBase.value.draftId,
    }),
  })
}

const templateComponents = {
  'cover-letter-classic': CoverLetterTemplateClassic,
  'cover-letter-modern': CoverLetterTemplateModern,
} as const

const activeTemplateComponent = computed(() => templateComponents[selectedTemplate.value as keyof typeof templateComponents] ?? CoverLetterTemplateClassic)
const activePalette = computed(() => palettes[selectedPalette.value])

onMounted(() => {
  if (typeof route.query.template === 'string' && COVER_LETTER_TEMPLATE_IDS.includes(route.query.template)) {
    selectedTemplate.value = route.query.template
  }
})
</script>

<template>
  <v-container fluid class="editor-shell pa-0">
    <div class="builder-layout">
      <section class="builder-form px-3 px-md-6 py-4">
        <v-card class="form-card mb-4" variant="outlined">
          <v-card-title>Base importée</v-card-title>
          <v-card-text class="d-grid ga-2">
            <div><strong>Template:</strong> {{ selectedCoverPageBase.templateId }}</div>
            <div><strong>Titre:</strong> {{ selectedCoverPageBase.title }}</div>
            <div><strong>Sous-titre:</strong> {{ selectedCoverPageBase.subtitle }}</div>
            <div><strong>Résumé:</strong> {{ selectedCoverPageBase.summary }}</div>
            <v-btn variant="text" color="primary" class="justify-start px-0" @click="goBackToCoverPage">
              Retour vers Cover Page
            </v-btn>
          </v-card-text>
        </v-card>

        <v-tabs v-model="activeTab" color="primary" grow class="mb-4">
          <v-tab v-for="tab in tabs" :key="tab.value" :value="tab.value">{{ tab.label }}</v-tab>
        </v-tabs>

        <v-window v-model="activeTab">
          <v-window-item value="edit">
            <v-card class="form-card mb-4" variant="outlined">
              <v-card-title>Contenu lettre</v-card-title>
              <v-card-text class="d-grid ga-3">
                <v-text-field v-model="model.fullName" label="Nom complet" variant="outlined" hide-details />
                <v-text-field v-model="model.role" label="Titre" variant="outlined" hide-details />
                <v-text-field v-model="model.recipient" label="Destinataire" variant="outlined" hide-details />
                <v-text-field v-model="model.company" label="Entreprise" variant="outlined" hide-details />
                <v-textarea v-model="model.intro" rows="3" label="Introduction" variant="outlined" hide-details />
                <v-textarea v-model="model.body" rows="7" label="Corps" variant="outlined" hide-details />
                <v-textarea v-model="model.closing" rows="3" label="Conclusion" variant="outlined" hide-details />
              </v-card-text>
            </v-card>
          </v-window-item>

          <v-window-item value="template">
            <v-card class="form-card mb-4" variant="outlined">
              <v-card-title>Templates Cover Letter</v-card-title>
              <v-card-text>
                <div class="template-grid">
                  <v-card
                    v-for="template in coverLetterTemplates"
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
              </v-card-text>
            </v-card>
          </v-window-item>

          <v-window-item value="design">
            <v-card class="form-card mb-4" variant="outlined">
              <v-card-title>Design minimal</v-card-title>
              <v-card-text>
                <p class="text-subtitle-2 mb-2">Palette</p>
                <div class="palette-grid mb-4">
                  <button
                    v-for="(palette, id) in palettes"
                    :key="id"
                    type="button"
                    class="palette-item"
                    :class="{ 'palette-item--active': selectedPalette === id }"
                    @click="selectedPalette = id as PaletteId"
                  >
                    <span :style="{ background: palette.soft }" />
                    <span :style="{ background: palette.accent }" />
                    <span :style="{ background: palette.page }" />
                  </button>
                </div>

                <p class="text-subtitle-2 mb-2">Typographie</p>
                <v-btn-toggle v-model="selectedTypography" mandatory divided color="primary">
                  <v-btn value="sans">Sans</v-btn>
                  <v-btn value="serif">Serif</v-btn>
                </v-btn-toggle>
              </v-card-text>
            </v-card>
          </v-window-item>
        </v-window>
      </section>

      <aside class="builder-preview py-6 px-5 px-md-8">
        <div class="preview-grid">
          <component :is="activeTemplateComponent" :model="model" :palette="activePalette" :typography="selectedTypography" />
        </div>
      </aside>
    </div>
  </v-container>
</template>

<style scoped>
.editor-shell { min-height: calc(100vh - 70px); }
.builder-layout { display: grid; grid-template-columns: minmax(360px, 45%) 1fr; gap: 0; min-height: calc(100vh - 70px); }
.builder-form { border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); background: rgb(var(--v-theme-surface)); overflow: auto; }
.builder-preview { background: rgb(var(--v-theme-surface-variant)); }
.form-card { border-radius: 14px; }
.preview-grid { min-height: calc(100vh - 120px); background: #fff; border-radius: 16px; padding: 14px; }
.template-grid { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); }
.template-card { cursor: pointer; transition: .2s ease; }
.template-card--active { border-color: rgb(var(--v-theme-primary)); box-shadow: 0 0 0 1px rgb(var(--v-theme-primary)); }
.palette-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(68px, 1fr)); gap: 12px; }
.palette-item { border: 1px solid rgba(15, 23, 42, .15); border-radius: 12px; padding: 6px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; background: transparent; }
.palette-item span { border-radius: 8px; height: 20px; }
.palette-item--active { border-color: rgb(var(--v-theme-primary)); box-shadow: 0 0 0 1px rgb(var(--v-theme-primary)); }
@media (max-width: 1260px) { .builder-layout { grid-template-columns: 1fr; } .builder-form { border-right: 0; border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); } }
</style>
