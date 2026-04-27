<script setup lang="ts">
import CoverLetterTemplateAtsMinimal from '~/components/Resume/Templates/CoverLetterTemplateAtsMinimal.vue'
import CoverLetterTemplateClassic from '~/components/Resume/Templates/CoverLetterTemplateClassic.vue'
import CoverLetterTemplateModern from '~/components/Resume/Templates/CoverLetterTemplateModern.vue'
import CoverLetterTemplatePremiumEditorial from '~/components/Resume/Templates/CoverLetterTemplatePremiumEditorial.vue'
import CoverLetterTemplateSplitFocus from '~/components/Resume/Templates/CoverLetterTemplateSplitFocus.vue'
import { COVER_LETTER_TEMPLATE_IDS, COVER_PAGE_TEMPLATE_IDS } from '~/constants/resumeTemplates'
import { useResumeDesignControls, type ResumeTextStyleOption } from '~/composables/useResumeDesignControls'

definePageMeta({
  title: 'Resume · Cover Letter Editor',
  layout: 'resume',
})

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

const activeTab = ref<'edit' | 'template' | 'design'>('edit')
const fallbackTemplateId = COVER_LETTER_TEMPLATE_IDS[0] ?? 'cover-letter-classic'
const fallbackCoverPageTemplateId = COVER_PAGE_TEMPLATE_IDS[0] ?? ''
const selectedTemplate = ref(fallbackTemplateId)
const selectedTheme = ref('ocean')
const selectedRounded = ref<'none' | 'sm' | 'md' | 'lg'>('md')
const selectedTextStyle = ref<ResumeTextStyleOption['value']>('clean')
const { colorThemes, roundedOptions, textStyleOptions, roundedPxByValue, toCoverPalette, toCoverTypography } = useResumeDesignControls()

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
  'cover-letter-ats-minimal': CoverLetterTemplateAtsMinimal,
  'cover-letter-premium-editorial': CoverLetterTemplatePremiumEditorial,
  'cover-letter-split-focus': CoverLetterTemplateSplitFocus,
} as const

const activeTemplateComponent = computed(() => templateComponents[selectedTemplate.value as keyof typeof templateComponents] ?? CoverLetterTemplateClassic)
const activePalette = computed(() => toCoverPalette(selectedTheme.value))
const activeTypography = computed(() => toCoverTypography(selectedTextStyle.value))
const activeRounded = computed(() => roundedPxByValue[selectedRounded.value])

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
            <article class="form-section mb-4">
              <header class="mb-4">
                <h2>Design</h2>
                <p>Ajustez rapidement les réglages visuels pour aligner la lettre de motivation avec votre CV.</p>
              </header>

              <p class="section-label">Color palette</p>
              <div class="palette-grid mb-4">
                <button
                  v-for="theme in colorThemes"
                  :key="theme.name"
                  type="button"
                  class="palette-item"
                  :class="{ 'palette-item--active': selectedTheme === theme.name }"
                  @click="selectedTheme = theme.name"
                >
                  <span :style="{ background: theme.sidebar }" />
                  <span :style="{ background: theme.accent }" />
                  <span :style="{ background: theme.page }" />
                </button>
              </div>

              <p class="section-label">Rounded</p>
              <v-btn-toggle v-model="selectedRounded" mandatory divided class="rounded-toggle" color="primary">
                <v-btn v-for="option in roundedOptions" :key="option.value" :value="option.value" variant="text">
                  {{ option.title }}
                </v-btn>
              </v-btn-toggle>

              <p class="section-label mt-4">Text style</p>
              <AppSelect
                v-model="selectedTextStyle"
                :items="textStyleOptions"
                item-title="label"
                item-value="value"
                label="Typography preset"
                density="comfortable"
                hide-details
              />
            </article>
          </v-window-item>
        </v-window>
      </section>

      <aside class="builder-preview py-6 px-5 px-md-8">
        <div class="preview-grid">
          <component
            :is="activeTemplateComponent"
            :model="model"
            :palette="activePalette"
            :typography="activeTypography"
            :rounded="activeRounded"
          />
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
.form-section { border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); border-radius: 14px; padding: 18px; background: rgb(var(--v-theme-surface)); }
.form-section h2 { margin: 0; font-size: 1.1rem; }
.form-section p { color: rgba(var(--v-theme-on-surface), .72); }
.section-label { font-size: .78rem; text-transform: uppercase; letter-spacing: .08em; color: rgba(var(--v-theme-on-surface), .65); margin-bottom: 10px; }
.palette-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(68px, 1fr)); gap: 12px; }
.palette-item { border: 1px solid rgba(15, 23, 42, .15); border-radius: 12px; padding: 6px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; background: transparent; }
.palette-item span { border-radius: 8px; height: 20px; }
.palette-item--active { border-color: rgb(var(--v-theme-primary)); box-shadow: 0 0 0 1px rgb(var(--v-theme-primary)); }
@media (max-width: 1260px) { .builder-layout { grid-template-columns: 1fr; } .builder-form { border-right: 0; border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); } }
</style>
