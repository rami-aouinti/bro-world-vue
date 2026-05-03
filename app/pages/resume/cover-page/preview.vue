<script setup lang="ts">
import CoverPageTemplateAuroraFrame from '~/components/Resume/Templates/CoverPageTemplateAuroraFrame.vue'
import CoverPageTemplateElegant from '~/components/Resume/Templates/CoverPageTemplateElegant.vue'
import CoverPageTemplateHeroCentered from '~/components/Resume/Templates/CoverPageTemplateHeroCentered.vue'
import CoverPageTemplateSidebarPulse from '~/components/Resume/Templates/CoverPageTemplateSidebarPulse.vue'
import CoverPageTemplateSplitEditorial from '~/components/Resume/Templates/CoverPageTemplateSplitEditorial.vue'
import CoverPageTemplateTerra from '~/components/Resume/Templates/CoverPageTemplateTerra.vue'
import { COVER_PAGE_TEMPLATE_IDS } from '~/constants/resumeTemplates'
import type { RoundedOptionId, Typography } from '~/constants/resumeDesign'
import { useResumeDesignControls } from '~/composables/useResumeDesignControls'

definePageMeta({ title: 'Resume · Cover Page Preview', layout: 'resume' })

type CoverPageModel = { fullName: string; role: string; summary: string; location: string; email: string; phone: string; date: string; photoUrl: string }
const route = useRoute()
const { coverPageTemplates } = useResumeTemplates()
const fallbackTemplateId = COVER_PAGE_TEMPLATE_IDS[0] ?? 'cover-page-terra'
const selectedTemplate = ref(fallbackTemplateId)
const selectedTheme = ref('ocean')
const selectedRounded = ref<RoundedOptionId>('md')
const selectedTextStyle = ref<Typography>('clean')
const { colorThemes, roundedOptions, textStyleOptions, toCoverPalette } = useResumeDesignControls()
const coverLayoutSettings = reactive({ dividerStyle: 'solid' as const, dividerWeight: 'thin' as const })

const photoOptions = ['/img/team-1.jpg', '/img/team-2.jpg', '/img/team-3.jpg', '/img/team-4.jpg']

const model = reactive<CoverPageModel>({
  fullName: 'John Doe', role: 'Full Stack Developer', summary: 'Professional application pack cover page.',
  location: 'Paris, France', email: 'john@example.com', phone: '+33 6 00 00 00 00', date: new Date().toLocaleDateString('en-US'), photoUrl: photoOptions[0],
})

const templateComponents = {
  'cover-page-terra': CoverPageTemplateTerra,
  'cover-page-elegant': CoverPageTemplateElegant,
  'cover-page-hero-centered': CoverPageTemplateHeroCentered,
  'cover-page-sidebar-pulse': CoverPageTemplateSidebarPulse,
  'cover-page-split-editorial': CoverPageTemplateSplitEditorial,
  'cover-page-aurora-frame': CoverPageTemplateAuroraFrame,
} as const
const activeTemplateComponent = computed(() => templateComponents[selectedTemplate.value as keyof typeof templateComponents] ?? CoverPageTemplateTerra)
const activePalette = computed(() => toCoverPalette(selectedTheme.value))

onMounted(() => {
  const q = typeof route.query.template === 'string' ? route.query.template : ''
  if (q && COVER_PAGE_TEMPLATE_IDS.includes(q)) selectedTemplate.value = q
})
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #left>
        <v-text-field v-model="model.fullName" label="Full name" variant="outlined" hide-details />
        <v-text-field v-model="model.role" label="Title" variant="outlined" hide-details />
        <v-textarea v-model="model.summary" label="Summary" variant="outlined" auto-grow hide-details />
        <v-text-field v-model="model.location" label="Location" variant="outlined" hide-details />
        <v-text-field v-model="model.email" label="Email" variant="outlined" hide-details />
        <v-text-field v-model="model.phone" label="Phone" variant="outlined" hide-details />
        <v-select v-model="model.photoUrl" :items="photoOptions" label="Photo" variant="outlined" hide-details />
      </template>
      <template #right>
        <v-select v-model="selectedTemplate" :items="coverPageTemplates.map((t) => ({ title: t.title, value: t.id }))" label="Template" variant="outlined" hide-details />
        <v-select v-model="selectedTheme" :items="colorThemes" item-title="label" item-value="value" label="Theme" variant="outlined" hide-details />
        <v-select v-model="selectedRounded" :items="roundedOptions" item-title="label" item-value="value" label="Rounded" variant="outlined" hide-details />
        <v-select v-model="selectedTextStyle" :items="textStyleOptions" item-title="label" item-value="value" label="Typography" variant="outlined" hide-details />
      </template>
    </AppPageDrawers>

    <v-container fluid class="py-8">
      <component :is="activeTemplateComponent" :model="model" :palette="activePalette" :rounded="selectedRounded" :text-style="selectedTextStyle" :layout-settings="coverLayoutSettings" />
    </v-container>
  </div>
</template>
