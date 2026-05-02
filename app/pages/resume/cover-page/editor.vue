<script setup lang="ts">
import CoverPageTemplateElegant from '~/components/Resume/Templates/CoverPageTemplateElegant.vue'
import CoverPageTemplateHeroCentered from '~/components/Resume/Templates/CoverPageTemplateHeroCentered.vue'
import CoverPageTemplateSidebarPulse from '~/components/Resume/Templates/CoverPageTemplateSidebarPulse.vue'
import CoverPageTemplateSplitEditorial from '~/components/Resume/Templates/CoverPageTemplateSplitEditorial.vue'
import CoverPageTemplateTerra from '~/components/Resume/Templates/CoverPageTemplateTerra.vue'
import type { RoundedOptionId, Typography } from '~/constants/resumeDesign'
import { COVER_PAGE_TEMPLATE_IDS } from '~/constants/resumeTemplates'
import { useResumeDesignControls } from '~/composables/useResumeDesignControls'
import HoverRichTextEditor from '~/components/Resume/Create/HoverRichTextEditor.vue'
import { listMyResumes, type ResumeApiItem } from '~/services/resumeApi'

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
const { loggedIn } = useUserSession()
const { coverPageTemplates } = useResumeTemplates()
const { parseCoverFlowQuery, toCoverLetterQuery } = useResumeCoverFlow()

const tabs = [
  { value: 'edit', label: 'Edit' },
  { value: 'template', label: 'Template' },
] as const

const activeTab = ref<'edit' | 'template'>('edit')
const toolbarTemplateMenuOpen = ref(false)
const fallbackTemplateId = COVER_PAGE_TEMPLATE_IDS[0] ?? 'cover-page-terra'
const selectedTemplate = ref(fallbackTemplateId)
const selectedTheme = ref('ocean')
const selectedRounded = ref<RoundedOptionId>('md')
const selectedTextStyle = ref<Typography>('clean')
const { colorThemes, roundedOptions, textStyleOptions, toCoverPalette } =
  useResumeDesignControls()
const coverLayoutSettings = reactive({
  dividerStyle: 'solid' as const,
  dividerWeight: 'thin' as const,
})

const importedFlow = parseCoverFlowQuery(route.query)

const model = reactive<CoverPageModel>({
  fullName: importedFlow.title || 'John Doe',
  role: importedFlow.subtitle || 'Full Stack Developer',
  summary: importedFlow.summary || 'Professional application pack cover page.',
  location: 'Paris, France',
  email: 'john@example.com',
  phone: '+33 6 00 00 00 00',
  date: new Date().toLocaleDateString('en-US'),
  photoUrl: '/img/default_avatar.svg',
})

const fallbackResumeData: ResumeApiItem = {
  id: 'fallback-cover-page-resume',
  documentUrl: null,
  resumeInformation: {
    fullName: 'Rami Aouinti',
    title: 'Backend Developer',
    email: 'rami.aouinti@gmail.com',
    phone: '0176 35587613',
    adresse: 'Widdersdorfer Landstr.11, 50589 Köln',
    photo: '/img/default_avatar.svg',
  },
}

const templateComponents = {
  'cover-page-terra': CoverPageTemplateTerra,
  'cover-page-elegant': CoverPageTemplateElegant,
  'cover-page-hero-centered': CoverPageTemplateHeroCentered,
  'cover-page-sidebar-pulse': CoverPageTemplateSidebarPulse,
  'cover-page-split-editorial': CoverPageTemplateSplitEditorial,
} as const

const activeTemplateComponent = computed(
  () =>
    templateComponents[
      selectedTemplate.value as keyof typeof templateComponents
    ] ?? CoverPageTemplateTerra,
)
const activePalette = computed(() => toCoverPalette(selectedTheme.value))

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

const openToolbarTab = (tab: 'template') => {
  activeTab.value = tab
}

const applyTemplateFromToolbar = (templateId: string) => {
  selectedTemplate.value = templateId
  activeTab.value = 'template'
  toolbarTemplateMenuOpen.value = false
}

const hydrateFromConnectedUser = async () => {
  try {
    const me = await $fetch<{
      user?: {
        firstName?: string
        lastName?: string
        email?: string
        phone?: string
        city?: string
        country?: string
      }
    }>('/api/users/me')
    const user = me?.user
    if (!user) return
    const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim()
    if (fullName) model.fullName = fullName
    if (user.email) model.email = user.email
    if (user.phone) model.phone = user.phone
    const location = [user.city, user.country].filter(Boolean).join(', ')
    if (location) model.location = location
  } catch {
    // no-op
  }
}

const hydrateFromResume = (resume: ResumeApiItem | null | undefined) => {
  const info = resume?.resumeInformation
  if (!info) return
  if (info.fullName) model.fullName = info.fullName
  if (info.title) model.role = info.title
  if (info.email) model.email = info.email
  if (info.phone) model.phone = info.phone
  const location = info.adresse || info.address
  if (location) model.location = location
  if (info.photo) model.photoUrl = info.photo
}

const goToImportFlow = async () => {
  await router.push('/resume/preview?tab=import')
}

onMounted(async () => {
  if (loggedIn.value) {
    try {
      const resumes = await listMyResumes()
      if (Array.isArray(resumes) && resumes.length > 0) {
        hydrateFromResume(resumes[0])
      } else {
        hydrateFromResume(fallbackResumeData)
      }
    } catch {
      hydrateFromResume(fallbackResumeData)
    }
  } else {
    hydrateFromResume(fallbackResumeData)
  }
  await hydrateFromConnectedUser()
  const queryTemplate =
    typeof route.query.template === 'string' ? route.query.template : ''
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
  <div>
    <AppPageDrawers>
      <template #left>
        <v-tabs v-model="activeTab" color="primary" grow class="mb-4">
          <v-tab v-for="tab in tabs" :key="tab.value" :value="tab.value">{{
            tab.label
          }}</v-tab>
        </v-tabs>

        <v-window v-model="activeTab">
          <v-window-item value="edit">
            <v-text-field
              v-model="model.fullName"
              label="Full name"
              variant="outlined"
              hide-details
            />
            <v-text-field
              v-model="model.role"
              label="Title"
              variant="outlined"
              hide-details
            />
            <v-textarea
              v-model="model.summary"
              label="Summary"
              variant="outlined"
              auto-grow
              hide-details
            />
            <v-text-field
              v-model="model.location"
              label="Location"
              variant="outlined"
              hide-details
            />
            <v-text-field
              v-model="model.email"
              label="Email"
              variant="outlined"
              hide-details
            />
            <v-text-field
              v-model="model.phone"
              label="Phone"
              variant="outlined"
              hide-details
            />
            <v-text-field
              v-model="model.date"
              label="Date"
              variant="outlined"
              hide-details
            />
            <v-text-field
              v-model="model.photoUrl"
              label="Photo URL"
              variant="outlined"
              hide-details
            />
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
                    :class="{
                      'template-card--active': selectedTemplate === template.id,
                    }"
                    variant="outlined"
                    @click="selectedTemplate = template.id"
                  >
                    <v-img :src="template.image" height="130" cover />
                    <v-card-text class="template-card__content">
                      <div class="template-card__title">
                        {{ template.title }}
                      </div>
                      <div class="template-card__subtitle">
                        {{ template.subtitle }}
                      </div>
                    </v-card-text>
                  </v-card>
                </div>
              </v-card-text>
            </v-card>
          </v-window-item>
        </v-window>

        <v-btn
          color="primary"
          size="large"
          class="mt-2"
          block
          @click="continueToCoverLetter"
        >
          Continue to Cover Letter
        </v-btn>
      </template>
      <template #right />
    </AppPageDrawers>

    <v-container fluid>
      <div class="local-toolbar-actions">
        <div class="local-toolbar-actions__row">
          <v-btn
            class="local-toolbar-btn"
            color="primary"
            size="small"
            variant="outlined"
            prepend-icon="mdi-content-save-cog-outline"
            >Save / Import</v-btn
          >
          <v-btn
            class="local-toolbar-btn"
            color="primary"
            size="small"
            variant="outlined"
            prepend-icon="mdi-view-list-outline"
            >Sections</v-btn
          >
          <v-btn
            class="local-toolbar-btn"
            color="primary"
            size="small"
            variant="outlined"
            prepend-icon="mdi-signature-freehand"
            >Signature</v-btn
          >
          <v-menu
            v-model="toolbarTemplateMenuOpen"
            location="bottom center"
            origin="top center"
          >
            <template #activator="{ props }">
              <v-btn
                class="local-toolbar-btn"
                color="primary"
                size="small"
                variant="outlined"
                prepend-icon="mdi-view-grid-outline"
                v-bind="props"
                @click="openToolbarTab('template')"
                >Templates</v-btn
              >
            </template>
            <v-card class="toolbar-menu-card">
              <div class="toolbar-template-grid">
                <v-card
                  v-for="template in coverPageTemplates"
                  :key="`toolbar-cover-page-${template.id}`"
                  class="template-card"
                  :class="{
                    'template-card--active': selectedTemplate === template.id,
                  }"
                  variant="outlined"
                  @click="applyTemplateFromToolbar(template.id)"
                >
                  <v-img :src="template.image" height="96" cover />
                  <v-card-text class="py-2 text-caption">{{
                    template.title
                  }}</v-card-text>
                </v-card>
              </div>
            </v-card>
          </v-menu>
          <v-menu location="bottom center" origin="top center" max-width="520">
            <template #activator="{ props }">
              <v-btn
                class="local-toolbar-btn"
                color="primary"
                size="small"
                variant="outlined"
                prepend-icon="mdi-palette-outline"
                v-bind="props"
                >Design</v-btn
              >
            </template>
            <v-card class="toolbar-menu-card">
              <v-card-title class="text-subtitle-2">Design</v-card-title>
              <v-card-text>
                <p class="section-label">Color palette</p>
                <div class="palette-grid mb-4">
                  <button
                    v-for="theme in colorThemes"
                    :key="`toolbar-theme-${theme.name}`"
                    type="button"
                    class="palette-item"
                    :class="{
                      'palette-item--active': selectedTheme === theme.name,
                    }"
                    @click="selectedTheme = theme.name"
                  >
                    <span :style="{ background: theme.sidebar }" />
                    <span :style="{ background: theme.accent }" />
                    <span :style="{ background: theme.page }" />
                  </button>
                </div>
                <p class="section-label">Rounded</p>
                <v-btn-toggle
                  v-model="selectedRounded"
                  mandatory
                  divided
                  class="rounded-toggle"
                  color="primary"
                >
                  <v-btn
                    v-for="option in roundedOptions"
                    :key="`toolbar-rounded-${option.value}`"
                    :value="option.value"
                    variant="text"
                    >{{ option.title }}</v-btn
                  >
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
              </v-card-text>
            </v-card>
          </v-menu>
          <v-menu location="bottom center" origin="top center" max-width="460">
            <template #activator="{ props }">
              <v-btn
                class="local-toolbar-btn"
                color="primary"
                size="small"
                variant="outlined"
                prepend-icon="mdi-file-import-outline"
                v-bind="props"
                >Import</v-btn
              >
            </template>
            <v-card class="toolbar-menu-card">
              <v-card-title class="text-subtitle-2">Import</v-card-title>
              <v-card-text class="d-flex flex-column ga-2">
                <v-btn
                  prepend-icon="mdi-file-document-edit-outline"
                  color="primary"
                  variant="outlined"
                  text="Open resume import page"
                  @click="goToImportFlow"
                />
              </v-card-text>
            </v-card>
          </v-menu>
          <v-btn
            class="local-toolbar-btn"
            color="primary"
            size="small"
            variant="outlined"
            icon="mdi-creation"
          />
        </div>
      </div>
      <div class="preview-grid">
        <div class="content-editors">
          <HoverRichTextEditor
            v-model="model.summary"
            label="Summary"
            placeholder="Write your cover page summary"
          />
        </div>
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
.editor-shell {
  min-height: calc(100vh - 70px);
}
.builder-layout {
  display: grid;
  grid-template-columns: minmax(360px, 45%) 1fr;
  gap: 0;
  min-height: calc(100vh - 70px);
}
.builder-form {
  border-right: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  background: rgb(var(--v-theme-surface));
  overflow: auto;
}
.builder-preview {
  background: rgb(var(--v-theme-surface-variant));
}
.form-card {
  border-radius: 14px;
}
.preview-grid {
  min-height: calc(100vh - 120px);
  background: #fff;
  border-radius: 16px;
  padding: 14px;
}
.content-editors {
  display: grid;
  gap: 10px;
  margin-bottom: 14px;
}
.template-grid {
  display: grid;
  gap: 14px;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
}
.template-card {
  cursor: pointer;
  transition: 0.2s ease;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.08);
}
.template-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.12);
}
.template-card__content {
  display: grid;
  gap: 6px;
}
.template-card__title {
  font-weight: 600;
  line-height: 1.25;
}
.template-card__subtitle {
  font-size: 0.78rem;
  color: rgba(var(--v-theme-on-surface), 0.68);
  line-height: 1.35;
}
.template-card--active {
  border-color: rgb(var(--v-theme-primary));
  box-shadow:
    0 0 0 1px rgb(var(--v-theme-primary)),
    0 14px 28px rgba(var(--v-theme-primary), 0.18);
  background: color-mix(
    in srgb,
    rgb(var(--v-theme-primary)) 4%,
    rgb(var(--v-theme-surface))
  );
}
.form-section {
  border: 1px solid rgba(var(--v-border-color), var(--v-border-opacity));
  border-radius: 14px;
  padding: 18px;
  background: rgb(var(--v-theme-surface));
}
.form-section h2 {
  margin: 0;
  font-size: 1.1rem;
}
.form-section p {
  color: rgba(var(--v-theme-on-surface), 0.72);
}
.section-label {
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(var(--v-theme-on-surface), 0.65);
  margin-bottom: 10px;
}
.palette-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(68px, 1fr));
  gap: 12px;
}
.palette-item {
  border: 1px solid rgba(15, 23, 42, 0.15);
  border-radius: 12px;
  padding: 6px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  background: transparent;
}
.palette-item span {
  border-radius: 8px;
  height: 20px;
}
.palette-item--active {
  border-color: rgb(var(--v-theme-primary));
  box-shadow: 0 0 0 1px rgb(var(--v-theme-primary));
}
.local-toolbar-actions {
  position: fixed;
  top: 70px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  display: flex;
  justify-content: center;
  width: min(100%, 980px);
  padding-inline: 12px;
}
.local-toolbar-actions__row {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-radius: 20px;
  border: 1px solid
    color-mix(in srgb, rgb(var(--v-theme-primary)) 30%, transparent);
  background: color-mix(in srgb, rgb(var(--v-theme-surface)) 84%, transparent);
  backdrop-filter: blur(10px);
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.22);
}
.local-toolbar-btn {
  height: 56px !important;
  min-width: 56px !important;
  border-radius: 16px !important;
}
.toolbar-menu-card {
  width: min(92vw, 980px);
  max-height: min(76vh, 760px);
  overflow: auto;
}
.toolbar-template-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  padding: 12px;
}
@media (max-width: 1260px) {
  .builder-layout {
    grid-template-columns: 1fr;
  }
  .builder-form {
    border-right: 0;
    border-bottom: 1px solid
      rgba(var(--v-border-color), var(--v-border-opacity));
  }
}
</style>
