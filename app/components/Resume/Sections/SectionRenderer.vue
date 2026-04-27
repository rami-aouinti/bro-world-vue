<script setup lang="ts">
import ResumeSectionExperience from '~/components/Resume/Sections/ResumeSectionExperience.vue'
import ResumeSectionEducation from '~/components/Resume/Sections/ResumeSectionEducation.vue'
import ResumeSectionLanguage from '~/components/Resume/Sections/ResumeSectionLanguage.vue'
import ResumeSectionProject from '~/components/Resume/Sections/ResumeSectionProject.vue'
import type { ResumeSectionKey } from '~/constants/resumeTemplateSkins'

const props = withDefaults(defineProps<{
  sectionKey: ResumeSectionKey
  resume: any
  editable?: boolean
  variant: string
  title?: string
  toolbarEnabled?: boolean
  canMoveUp?: boolean
  canMoveDown?: boolean
  themeTokens?: Record<string, string>
}>(), {
  editable: false,
  title: undefined,
  toolbarEnabled: true,
  canMoveUp: false,
  canMoveDown: false,
  themeTokens: () => ({}),
})

const emit = defineEmits<{
  (event: 'add-item', sectionKey: ResumeSectionKey): void
  (event: 'change-variant', sectionKey: ResumeSectionKey, variant: string): void
  (event: 'move-section', sectionKey: ResumeSectionKey, direction: 'up' | 'down'): void
}>()

const componentBySectionKey = {
  experience: ResumeSectionExperience,
  education: ResumeSectionEducation,
  language: ResumeSectionLanguage,
  project: ResumeSectionProject,
} as const

const sectionComponent = computed(() => componentBySectionKey[props.sectionKey])

function onVariantChange(_: ResumeSectionKey, variant: string) {
  emit('change-variant', props.sectionKey, variant)
}

function onMoveSection(_: ResumeSectionKey, direction: 'up' | 'down') {
  emit('move-section', props.sectionKey, direction)
}
</script>

<template>
  <component
    :is="sectionComponent"
    :resume="resume"
    :editable="editable"
    :variant="variant"
    :title="title"
    :toolbar-enabled="toolbarEnabled"
    :can-move-up="canMoveUp"
    :can-move-down="canMoveDown"
    :theme-tokens="themeTokens"
    @add-item="emit('add-item', sectionKey)"
    @change-variant="onVariantChange"
    @move-section="onMoveSection"
  />
</template>
