<script setup lang="ts">
import CoverLetterTemplateAtsMinimal from '~/components/Resume/Templates/CoverLetterTemplateAtsMinimal.vue'
import CoverLetterTemplateClassic from '~/components/Resume/Templates/CoverLetterTemplateClassic.vue'
import CoverLetterTemplateModern from '~/components/Resume/Templates/CoverLetterTemplateModern.vue'
import CoverLetterTemplatePremiumEditorial from '~/components/Resume/Templates/CoverLetterTemplatePremiumEditorial.vue'
import CoverLetterTemplateSplitFocus from '~/components/Resume/Templates/CoverLetterTemplateSplitFocus.vue'
import type { RoundedOptionId, Typography } from '~/constants/resumeDesign'
import { COVER_LETTER_TEMPLATE_IDS, COVER_PAGE_TEMPLATE_IDS } from '~/constants/resumeTemplates'
import { useResumeDesignControls } from '~/composables/useResumeDesignControls'

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
] as const

const activeTab = ref<'edit' | 'template'>('edit')
const toolbarTemplateMenuOpen = ref(false)
const fallbackTemplateId = COVER_LETTER_TEMPLATE_IDS[0] ?? 'cover-letter-classic'
const fallbackCoverPageTemplateId = COVER_PAGE_TEMPLATE_IDS[0] ?? ''
const selectedTemplate = ref(fallbackTemplateId)
const selectedTheme = ref('ocean')
const selectedRounded = ref<RoundedOptionId>('md')
const selectedTextStyle = ref<Typography>('clean')
const { colorThemes, roundedOptions, textStyleOptions, toCoverPalette } = useResumeDesignControls()
const coverLayoutSettings = reactive({
  dividerStyle: 'solid' as const,
  dividerWeight: 'thin' as const,
})

const importedFlow = computed(() => parseCoverFlowQuery(route.query))

const model = reactive<CoverLetterModel>({
  fullName: importedFlow.value.title || 'John Doe',
  role: importedFlow.value.subtitle || 'Full Stack Developer',
  recipient: 'Hiring Manager',
  company: 'Company Name',
  date: new Date().toLocaleDateString('en-US'),
  intro: 'I am excited to submit my application to join your team.',
  body: 'My experience in product development, front-end architecture, and cross-functional collaboration allows me to contribute quickly to business and technical priorities.',
  closing: 'I remain available for a discussion and thank you for your consideration.',
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

const openToolbarTab = (tab: 'template') => {
  activeTab.value = tab
}

const applyTemplateFromToolbar = (templateId: string) => {
  selectedTemplate.value = templateId
  activeTab.value = 'template'
  toolbarTemplateMenuOpen.value = false
}

const goToImportFlow = async () => {
  await router.push('/resume/create?tab=import')
}

onMounted(() => {
  if (typeof route.query.template === 'string' && COVER_LETTER_TEMPLATE_IDS.includes(route.query.template)) {
    selectedTemplate.value = route.query.template
  }
})
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #left>
        <div><strong>Template:</strong> {{ selectedCoverPageBase.templateId }}</div>
        <div><strong>Title:</strong> {{ selectedCoverPageBase.title }}</div>
        <div><strong>Subtitle:</strong> {{ selectedCoverPageBase.subtitle }}</div>
        <div><strong>Summary:</strong> {{ selectedCoverPageBase.summary }}</div>
        <v-btn variant="text" color="primary" class="justify-start px-0" @click="goBackToCoverPage">
          Back to Cover Page
        </v-btn>
      </template>
      <template #right>
        <v-tabs v-model="activeTab" color="primary" grow class="mb-4">
          <v-tab v-for="tab in tabs" :key="tab.value" :value="tab.value">{{ tab.label }}</v-tab>
        </v-tabs>

        <v-window v-model="activeTab">
          <v-window-item value="edit">
            <v-card class="form-card mb-4" variant="outlined">
              <v-card-title>Letter content</v-card-title>
              <v-card-text class="d-grid ga-3">
                <v-text-field v-model="model.fullName" label="Full name" variant="outlined" hide-details />
                <v-text-field v-model="model.role" label="Title" variant="outlined" hide-details />
                <v-text-field v-model="model.recipient" label="Recipient" variant="outlined" hide-details />
                <v-text-field v-model="model.company" label="Company" variant="outlined" hide-details />
                <v-textarea v-model="model.intro" rows="3" label="Introduction" variant="outlined" hide-details />
                <v-textarea v-model="model.body" rows="7" label="Body" variant="outlined" hide-details />
                <v-textarea v-model="model.closing" rows="3" label="Closing" variant="outlined" hide-details />
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
                    <v-card-text class="template-card__content">
                      <div class="template-card__title">{{ template.title }}</div>
                      <div class="template-card__subtitle">{{ template.subtitle }}</div>
                    </v-card-text>
                  </v-card>
                </div>
              </v-card-text>
            </v-card>
          </v-window-item>

        </v-window>
      </template>
    </AppPageDrawers>

    <v-container fluid>
      <div class="local-toolbar-actions">
        <div class="local-toolbar-actions__row">
          <v-btn class="local-toolbar-btn" color="primary" size="small" icon="mdi-content-save-outline" />
          <v-btn class="local-toolbar-btn" color="secondary" size="small" variant="outlined" icon="mdi-file-pdf-box" />
          <v-btn class="local-toolbar-btn" color="info" size="small" variant="outlined" icon="mdi-download" />
          <v-menu v-model="toolbarTemplateMenuOpen" location="bottom center" origin="top center">
            <template #activator="{ props }">
              <v-btn class="local-toolbar-btn" color="primary" size="small" variant="outlined" prepend-icon="mdi-view-grid-outline" v-bind="props" @click="openToolbarTab('template')">Templates</v-btn>
            </template>
            <v-card class="toolbar-menu-card">
              <div class="toolbar-template-grid">
                <v-card
                  v-for="template in coverLetterTemplates"
                  :key="`toolbar-cover-letter-${template.id}`"
                  class="template-card"
                  :class="{ 'template-card--active': selectedTemplate === template.id }"
                  variant="outlined"
                  @click="applyTemplateFromToolbar(template.id)"
                >
                  <v-img :src="template.image" height="96" cover />
                  <v-card-text class="py-2 text-caption">{{ template.title }}</v-card-text>
                </v-card>
              </div>
            </v-card>
          </v-menu>
          <v-menu location="bottom center" origin="top center" max-width="520">
            <template #activator="{ props }">
              <v-btn class="local-toolbar-btn" color="primary" size="small" variant="outlined" prepend-icon="mdi-palette-outline" v-bind="props">Design</v-btn>
            </template>
            <v-card class="toolbar-menu-card">
              <v-card-title class="text-subtitle-2">Design</v-card-title>
              <v-card-text>
                <p class="section-label">Color palette</p>
                <div class="palette-grid mb-4">
                  <button v-for="theme in colorThemes" :key="`toolbar-theme-${theme.name}`" type="button" class="palette-item" :class="{ 'palette-item--active': selectedTheme === theme.name }" @click="selectedTheme = theme.name">
                    <span :style="{ background: theme.sidebar }" />
                    <span :style="{ background: theme.accent }" />
                    <span :style="{ background: theme.page }" />
                  </button>
                </div>
                <p class="section-label">Rounded</p>
                <v-btn-toggle v-model="selectedRounded" mandatory divided class="rounded-toggle" color="primary">
                  <v-btn v-for="option in roundedOptions" :key="`toolbar-rounded-${option.value}`" :value="option.value" variant="text">{{ option.title }}</v-btn>
                </v-btn-toggle>
                <p class="section-label mt-4">Text style</p>
                <AppSelect v-model="selectedTextStyle" :items="textStyleOptions" item-title="label" item-value="value" label="Typography preset" density="comfortable" hide-details />
              </v-card-text>
            </v-card>
          </v-menu>
          <v-menu location="bottom center" origin="top center" max-width="460">
            <template #activator="{ props }">
              <v-btn class="local-toolbar-btn" color="primary" size="small" variant="outlined" prepend-icon="mdi-file-import-outline" v-bind="props">Import</v-btn>
            </template>
            <v-card class="toolbar-menu-card">
              <v-card-title class="text-subtitle-2">Import</v-card-title>
              <v-card-text class="d-flex flex-column ga-2">
                <v-btn prepend-icon="mdi-file-document-edit-outline" color="primary" variant="outlined" text="Open resume import page" @click="goToImportFlow" />
              </v-card-text>
            </v-card>
          </v-menu>
          <v-btn class="local-toolbar-btn" color="primary" size="small" variant="outlined" icon="mdi-creation" />
        </div>
      </div>
      <div class="preview-grid">
        <component
          :is="activeTemplateComponent"
          :model="model"
          :palette="activePalette"
          :text-style="selectedTextStyle"
          :rounded="selectedRounded"
          :layout-settings="coverLayoutSettings"
        />
      </div>
    </v-container>
  </div>
</template>

<style scoped>
.editor-shell { min-height: calc(100vh - 70px); }
.builder-layout { display: grid; grid-template-columns: minmax(360px, 45%) 1fr; gap: 0; min-height: calc(100vh - 70px); }
.builder-form { border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); background: rgb(var(--v-theme-surface)); overflow: auto; }
.builder-preview { background: rgb(var(--v-theme-surface-variant)); }
.form-card { border-radius: 14px; }
.preview-grid { min-height: calc(100vh - 120px); background: #fff; border-radius: 16px; padding: 14px; }
.template-grid { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); }
.template-card { cursor: pointer; transition: .2s ease; border-radius: 14px; overflow: hidden; border: 1px solid rgba(15, 23, 42, .08); }
.template-card:hover { transform: translateY(-3px); box-shadow: 0 10px 24px rgba(15, 23, 42, .12); }
.template-card__content { display: grid; gap: 6px; }
.template-card__title { font-weight: 600; line-height: 1.25; }
.template-card__subtitle { font-size: .78rem; color: rgba(var(--v-theme-on-surface), .68); line-height: 1.35; }
.template-card--active { border-color: rgb(var(--v-theme-primary)); box-shadow: 0 0 0 1px rgb(var(--v-theme-primary)), 0 14px 28px rgba(var(--v-theme-primary), .18); background: color-mix(in srgb, rgb(var(--v-theme-primary)) 4%, rgb(var(--v-theme-surface))); }
.form-section { border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); border-radius: 14px; padding: 18px; background: rgb(var(--v-theme-surface)); }
.form-section h2 { margin: 0; font-size: 1.1rem; }
.form-section p { color: rgba(var(--v-theme-on-surface), .72); }
.section-label { font-size: .78rem; text-transform: uppercase; letter-spacing: .08em; color: rgba(var(--v-theme-on-surface), .65); margin-bottom: 10px; }
.palette-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(68px, 1fr)); gap: 12px; }
.palette-item { border: 1px solid rgba(15, 23, 42, .15); border-radius: 12px; padding: 6px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; background: transparent; }
.palette-item span { border-radius: 8px; height: 20px; }
.palette-item--active { border-color: rgb(var(--v-theme-primary)); box-shadow: 0 0 0 1px rgb(var(--v-theme-primary)); }
.local-toolbar-actions { position: fixed; top: 70px; left: 50%; transform: translateX(-50%); z-index: 20; display: flex; justify-content: center; width: min(100%, 980px); padding-inline: 12px; }
.local-toolbar-actions__row { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 8px; padding: 10px 12px; border-radius: 20px; border: 1px solid color-mix(in srgb, rgb(var(--v-theme-primary)) 30%, transparent); background: color-mix(in srgb, rgb(var(--v-theme-surface)) 84%, transparent); backdrop-filter: blur(10px); box-shadow: 0 10px 28px rgba(15, 23, 42, 0.22); }
.local-toolbar-btn { height: 56px !important; min-width: 56px !important; border-radius: 16px !important; }
.toolbar-menu-card { width: min(92vw, 980px); max-height: min(76vh, 760px); overflow: auto; }
.toolbar-template-grid { display: grid; gap: 10px; grid-template-columns: repeat(4, minmax(0, 1fr)); padding: 12px; }
@media (max-width: 1260px) { .builder-layout { grid-template-columns: 1fr; } .builder-form { border-right: 0; border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); } }
</style>
