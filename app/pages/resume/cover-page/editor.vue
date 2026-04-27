<script setup lang="ts">
import CoverPageTemplateElegant from '~/components/Resume/Templates/CoverPageTemplateElegant.vue'
import CoverPageTemplateHeroCentered from '~/components/Resume/Templates/CoverPageTemplateHeroCentered.vue'
import CoverPageTemplateSidebarPulse from '~/components/Resume/Templates/CoverPageTemplateSidebarPulse.vue'
import CoverPageTemplateSplitEditorial from '~/components/Resume/Templates/CoverPageTemplateSplitEditorial.vue'
import CoverPageTemplateTerra from '~/components/Resume/Templates/CoverPageTemplateTerra.vue'
import { COVER_PAGE_TEMPLATE_IDS } from '~/constants/resumeTemplates'
import { useResumeDesignControls, type ResumeTextStyleOption } from '~/composables/useResumeDesignControls'

definePageMeta({
  title: 'Resume · Cover Page Editor',
  layout: 'resume',
})

type CoverPageModel = {
  fullName: string
  role: string
  summary: string
  location: string
  email: string
  phone: string
  date: string
  photoUrl: string
}

const route = useRoute()
const router = useRouter()
const { coverPageTemplates } = useResumeTemplates()
const { parseCoverFlowQuery, toCoverLetterQuery } = useResumeCoverFlow()

const tabs = [
  { value: 'edit', label: 'Edit' },
  { value: 'template', label: 'Template' },
  { value: 'design', label: 'Design' },
] as const

const activeTab = ref<'edit' | 'template' | 'design'>('edit')
const fallbackTemplateId = COVER_PAGE_TEMPLATE_IDS[0] ?? 'cover-page-terra'
const selectedTemplate = ref(fallbackTemplateId)
const selectedTheme = ref('ocean')
const selectedRounded = ref<'none' | 'sm' | 'md' | 'lg'>('md')
const selectedTextStyle = ref<ResumeTextStyleOption['value']>('clean')
const { colorThemes, roundedOptions, textStyleOptions, roundedPxByValue, toCoverPalette, toCoverTypography } = useResumeDesignControls()

const importedFlow = parseCoverFlowQuery(route.query)

const model = reactive<CoverPageModel>({
  fullName: importedFlow.title || 'John Doe',
  role: importedFlow.subtitle || 'Full Stack Developer',
  summary: importedFlow.summary || 'Professional application pack cover page.',
  location: 'Paris, France',
  email: 'john@example.com',
  phone: '+33 6 00 00 00 00',
  date: new Date().toLocaleDateString('fr-FR'),
  photoUrl: '/img/default_avatar.svg',
})

const templateComponents = {
  'cover-page-terra': CoverPageTemplateTerra,
  'cover-page-elegant': CoverPageTemplateElegant,
  'cover-page-hero-centered': CoverPageTemplateHeroCentered,
  'cover-page-sidebar-pulse': CoverPageTemplateSidebarPulse,
  'cover-page-split-editorial': CoverPageTemplateSplitEditorial,
} as const

const activeTemplateComponent = computed(() => templateComponents[selectedTemplate.value as keyof typeof templateComponents] ?? CoverPageTemplateTerra)
const activePalette = computed(() => toCoverPalette(selectedTheme.value))
const activeTypography = computed(() => toCoverTypography(selectedTextStyle.value))
const activeRounded = computed(() => roundedPxByValue[selectedRounded.value])

const continueToCoverLetter = async () => {
  await router.push({
    path: '/resume/cover-letter/editor',
    query: toCoverLetterQuery({
      template: selectedTemplate.value,
      title: model.fullName,
      subtitle: model.role,
      summary: model.summary,
      draftId: importedFlow.draftId || '',
    }),
  })
}

onMounted(() => {
  const queryTemplate = typeof route.query.template === 'string' ? route.query.template : ''
  const flowTemplate = importedFlow.template

  if (queryTemplate && COVER_PAGE_TEMPLATE_IDS.includes(queryTemplate)) {
    selectedTemplate.value = queryTemplate
    return
  }

  if (flowTemplate && COVER_PAGE_TEMPLATE_IDS.includes(flowTemplate)) {
    selectedTemplate.value = flowTemplate
  }
})
</script>

<template>
  <v-container fluid class="editor-shell pa-0">
    <div class="builder-layout">
      <section class="builder-form px-3 px-md-6 py-4">
        <v-tabs v-model="activeTab" color="primary" grow class="mb-4">
          <v-tab v-for="tab in tabs" :key="tab.value" :value="tab.value">{{ tab.label }}</v-tab>
        </v-tabs>

        <v-window v-model="activeTab">
          <v-window-item value="edit">
            <v-card class="form-card mb-4" variant="outlined">
              <v-card-title>Contenu</v-card-title>
              <v-card-text class="d-grid ga-3">
                <v-text-field v-model="model.fullName" label="Nom complet" variant="outlined" hide-details />
                <v-text-field v-model="model.role" label="Titre" variant="outlined" hide-details />
                <v-textarea v-model="model.summary" rows="5" label="Résumé" variant="outlined" hide-details />
                <v-text-field v-model="model.location" label="Localisation" variant="outlined" hide-details />
                <v-text-field v-model="model.email" label="Email" variant="outlined" hide-details />
                <v-text-field v-model="model.phone" label="Téléphone" variant="outlined" hide-details />
              </v-card-text>
            </v-card>
          </v-window-item>

          <v-window-item value="template">
            <v-card class="form-card mb-4" variant="outlined">
              <v-card-title>Templates Cover Page</v-card-title>
              <v-card-text>
                <div class="template-grid">
                  <v-card
                    v-for="template in coverPageTemplates"
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
                <p>Personnalisez la palette, le style de texte et l'arrondi pour harmoniser votre cover page.</p>
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

        <v-btn color="primary" size="large" class="mt-2" block @click="continueToCoverLetter">
          Continuer vers Cover Letter
        </v-btn>
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
