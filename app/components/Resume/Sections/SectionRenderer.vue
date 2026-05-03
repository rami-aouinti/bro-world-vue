<script setup lang="ts">
import ResumeSectionExperience from '~/components/resume/sections/ResumeSectionExperience.vue'
import ResumeSectionEducation from '~/components/resume/sections/ResumeSectionEducation.vue'
import ResumeSectionLanguage from '~/components/resume/sections/ResumeSectionLanguage.vue'
import ResumeSectionProject from '~/components/resume/sections/ResumeSectionProject.vue'
import ResumeSectionHobby from '~/components/Resume/Sections/ResumeSectionHobby.vue'
import ResumeSectionCertification from '~/components/resume/sections/ResumeSectionCertification.vue'
import ResumeSectionReference from '~/components/resume/sections/ResumeSectionReference.vue'
import ResumeSectionSkill from '~/components/resume/sections/ResumeSectionSkill.vue'
import { getSectionRegistryEntry } from '~/constants/resumeSectionRegistry'
import type { ResumeSectionIconStyle } from '~/constants/resumeTemplateSkins'
import type { ResumeEditableSectionKey } from '~/types/resumeDocumentModel'

const props = withDefaults(
  defineProps<{
    sectionKey: ResumeEditableSectionKey
    resume: any
    editable?: boolean
    variant: string
    layoutDensity?: 'compact' | 'normal' | 'spacious' | string
    title?: string
    toolbarEnabled?: boolean
    canMoveUp?: boolean
    canMoveDown?: boolean
    themeTokens?: Record<string, string>
    sectionIcon?: string
    showSectionIcon?: boolean
    sectionIconStyle?: ResumeSectionIconStyle
  }>(),
  {
    editable: false,
    layoutDensity: 'normal',
    title: undefined,
    toolbarEnabled: true,
    canMoveUp: false,
    canMoveDown: false,
    themeTokens: () => ({}),
    sectionIcon: undefined,
    showSectionIcon: true,
    sectionIconStyle: undefined,
  },
)

const emit = defineEmits<{
  (event: 'add-item' | 'delete-section', sectionKey: ResumeEditableSectionKey): void
  (
    event: 'change-variant',
    sectionKey: ResumeEditableSectionKey,
    variant: string,
  ): void
  (
    event: 'move-section',
    sectionKey: ResumeEditableSectionKey,
    direction: 'up' | 'down',
  ): void
}>()

const componentBySectionKey = {
  experience: ResumeSectionExperience,
  education: ResumeSectionEducation,
  language: ResumeSectionLanguage,
  project: ResumeSectionProject,
  hobby: ResumeSectionHobby,
  certification: ResumeSectionCertification,
  reference: ResumeSectionReference,
  skill: ResumeSectionSkill,
} as const

const sectionComponent = computed(() => componentBySectionKey[props.sectionKey])

const sectionHeadingProps = computed(() => {
  const sectionRegistry = getSectionRegistryEntry(props.sectionKey)
  if (sectionRegistry.icon) {
    return {
      sectionIcon: props.sectionIcon,
      showSectionIcon: props.showSectionIcon,
      sectionIconStyle: props.sectionIconStyle,
    }
  }

  return {}
})

function onVariantChange(_: ResumeEditableSectionKey, variant: string) {
  emit('change-variant', props.sectionKey, variant)
}

function onMoveSection(_: ResumeEditableSectionKey, direction: 'up' | 'down') {
  emit('move-section', props.sectionKey, direction)
}
</script>

<template>
  <component
    :is="sectionComponent"
    :resume="resume"
    :editable="editable"
    :variant="variant"
    :layout-density="layoutDensity"
    :title="title"
    :toolbar-enabled="toolbarEnabled"
    :can-move-up="canMoveUp"
    :can-move-down="canMoveDown"
    :theme-tokens="themeTokens"
    v-bind="sectionHeadingProps"
    @add-item="emit('add-item', sectionKey)"
    @change-variant="onVariantChange"
    @move-section="onMoveSection"
    @delete-section="emit('delete-section', sectionKey)"
  />
</template>
