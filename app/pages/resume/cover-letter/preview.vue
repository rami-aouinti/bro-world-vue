<script setup lang="ts">
import CoverLetterTemplateAtsMinimal from '~/components/Resume/Templates/CoverLetterTemplateAtsMinimal.vue'
import CoverLetterTemplateClassic from '~/components/Resume/Templates/CoverLetterTemplateClassic.vue'
import CoverLetterTemplateModern from '~/components/Resume/Templates/CoverLetterTemplateModern.vue'
import CoverLetterTemplateNordicSlate from '~/components/Resume/Templates/CoverLetterTemplateNordicSlate.vue'
import CoverLetterTemplatePremiumEditorial from '~/components/Resume/Templates/CoverLetterTemplatePremiumEditorial.vue'
import CoverLetterTemplateSplitFocus from '~/components/Resume/Templates/CoverLetterTemplateSplitFocus.vue'
import { COVER_LETTER_TEMPLATE_IDS } from '~/constants/resumeTemplates'
import type { RoundedOptionId, Typography } from '~/constants/resumeDesign'
import { useResumeDesignControls } from '~/composables/useResumeDesignControls'

definePageMeta({ title: 'Resume · Cover Letter Preview', layout: 'resume' })

type CoverLetterModel = { fullName: string; role: string; recipient: string; company: string; date: string; intro: string; body: string; closing: string; email: string; phone: string }
const route = useRoute()
const { coverLetterTemplates } = useResumeTemplates()
const fallbackTemplateId = COVER_LETTER_TEMPLATE_IDS[0] ?? 'cover-letter-classic'
const selectedTemplate = ref(fallbackTemplateId)
const selectedTheme = ref('ocean')
const selectedRounded = ref<RoundedOptionId>('md')
const selectedTextStyle = ref<Typography>('clean')
const { colorThemes, roundedOptions, textStyleOptions, toCoverPalette } = useResumeDesignControls()
const coverLayoutSettings = reactive({ dividerStyle: 'solid' as const, dividerWeight: 'thin' as const })

const model = reactive<CoverLetterModel>({ fullName:'John Doe', role:'Full Stack Developer', recipient:'Hiring Manager', company:'', date:new Date().toLocaleDateString('en-US'), intro:'I am excited to submit my application.', body:'My experience allows me to contribute quickly to business and technical priorities.', closing:'Thank you for your consideration.', email:'john@example.com', phone:'+33 6 00 00 00 00' })

const templateComponents = {
  'cover-letter-classic': CoverLetterTemplateClassic,
  'cover-letter-modern': CoverLetterTemplateModern,
  'cover-letter-ats-minimal': CoverLetterTemplateAtsMinimal,
  'cover-letter-premium-editorial': CoverLetterTemplatePremiumEditorial,
  'cover-letter-split-focus': CoverLetterTemplateSplitFocus,
  'cover-letter-nordic-slate': CoverLetterTemplateNordicSlate,
} as const
const activeTemplateComponent = computed(() => templateComponents[selectedTemplate.value as keyof typeof templateComponents] ?? CoverLetterTemplateClassic)
const activePalette = computed(() => toCoverPalette(selectedTheme.value))

onMounted(() => {
  const q = typeof route.query.template === 'string' ? route.query.template : ''
  if (q && COVER_LETTER_TEMPLATE_IDS.includes(q)) selectedTemplate.value = q
})
</script>

<template>
  <div>
    <AppPageDrawers>
      <template #left>
        <v-text-field v-model="model.fullName" label="Full name" variant="outlined" hide-details />
        <v-text-field v-model="model.role" label="Title" variant="outlined" hide-details />
        <v-text-field v-model="model.recipient" label="Recipient" variant="outlined" hide-details />
        <v-text-field v-model="model.company" label="Company" variant="outlined" hide-details />
        <v-textarea v-model="model.intro" label="Intro" variant="outlined" auto-grow hide-details />
        <v-textarea v-model="model.body" label="Body" variant="outlined" auto-grow hide-details />
      </template>
      <template #right>
        <v-select v-model="selectedTemplate" :items="coverLetterTemplates.map((t) => ({ title: t.title, value: t.id }))" label="Template" variant="outlined" hide-details />
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
