<script setup lang="ts">
import CoverPageTemplateElegant from '~/components/Resume/Templates/CoverPageTemplateElegant.vue'
import CoverPageTemplateTerra from '~/components/Resume/Templates/CoverPageTemplateTerra.vue'
import { COVER_PAGE_TEMPLATE_IDS } from '~/constants/resumeTemplates'

definePageMeta({
  title: 'Resume · Cover Page Editor',
  layout: 'resume',
})

type Typography = 'sans' | 'serif'
type PaletteId = 'ocean' | 'terra' | 'midnight'

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
const { coverPageTemplates } = useResumeTemplates()

const tabs = [
  { value: 'edit', label: 'Edit' },
  { value: 'template', label: 'Template' },
  { value: 'design', label: 'Design' },
] as const

const palettes = {
  ocean: { page: '#f8fafc', soft: '#dbeafe', accent: '#1d4ed8', text: '#0f172a' },
  terra: { page: '#fffaf6', soft: '#f5e2d8', accent: '#9a3412', text: '#431407' },
  midnight: { page: '#f8fafc', soft: '#dbe4ff', accent: '#312e81', text: '#1f2937' },
} as const

const activeTab = ref<'edit' | 'template' | 'design'>('edit')
const fallbackTemplateId = COVER_PAGE_TEMPLATE_IDS[0] ?? 'cover-page-terra'
const selectedTemplate = ref(fallbackTemplateId)
const selectedPalette = ref<PaletteId>('ocean')
const selectedTypography = ref<Typography>('sans')

const model = reactive<CoverPageModel>({
  fullName: typeof route.query.coverPageTitle === 'string' ? route.query.coverPageTitle : 'John Doe',
  role: 'Full Stack Developer',
  summary: typeof route.query.coverPageSummary === 'string' ? route.query.coverPageSummary : 'Professional application pack cover page.',
  location: 'Paris, France',
  email: 'john@example.com',
  phone: '+33 6 00 00 00 00',
  date: new Date().toLocaleDateString('fr-FR'),
  photoUrl: '/img/default_avatar.svg',
})

const templateComponents = {
  'cover-page-terra': CoverPageTemplateTerra,
  'cover-page-elegant': CoverPageTemplateElegant,
} as const

const activeTemplateComponent = computed(() => templateComponents[selectedTemplate.value as keyof typeof templateComponents] ?? CoverPageTemplateTerra)
const activePalette = computed(() => palettes[selectedPalette.value])

onMounted(() => {
  if (typeof route.query.template === 'string' && COVER_PAGE_TEMPLATE_IDS.includes(route.query.template)) {
    selectedTemplate.value = route.query.template
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
.palette-grid { display: grid; grid-template-columns: repeat(3, minmax(68px, 1fr)); gap: 12px; }
.palette-item { border: 1px solid rgba(15, 23, 42, .15); border-radius: 12px; padding: 6px; display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; background: transparent; }
.palette-item span { border-radius: 8px; height: 20px; }
.palette-item--active { border-color: rgb(var(--v-theme-primary)); box-shadow: 0 0 0 1px rgb(var(--v-theme-primary)); }
@media (max-width: 1260px) { .builder-layout { grid-template-columns: 1fr; } .builder-form { border-right: 0; border-bottom: 1px solid rgba(var(--v-border-color), var(--v-border-opacity)); } }
</style>
