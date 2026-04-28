<script setup lang="ts">
import ResumeSectionExperience from '~/components/Resume/Sections/ResumeSectionExperience.vue'
import ResumeSectionEducation from '~/components/Resume/Sections/ResumeSectionEducation.vue'
import ResumeSectionLanguage from '~/components/Resume/Sections/ResumeSectionLanguage.vue'
import ResumeSectionProject from '~/components/Resume/Sections/ResumeSectionProject.vue'
import ResumeSectionHobby from '~/components/Resume/Sections/ResumeSectionHobby.vue'
import ResumeSectionCertification from '~/components/Resume/Sections/ResumeSectionCertification.vue'
import ResumeSectionReference from '~/components/Resume/Sections/ResumeSectionReference.vue'
import ResumeSectionSkill from '~/components/Resume/Sections/ResumeSectionSkill.vue'
import type { ResumeSectionKey } from '~/constants/resumeTemplateSkins'

const props = withDefaults(defineProps<{
  sectionKey: ResumeSectionKey | 'skill'
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
}>(), {
  editable: false,
  layoutDensity: 'normal',
  title: undefined,
  toolbarEnabled: true,
  canMoveUp: false,
  canMoveDown: false,
  themeTokens: () => ({}),
  sectionIcon: undefined,
  showSectionIcon: true,
})

const emit = defineEmits<{
  (event: 'add-item', sectionKey: ResumeSectionKey | 'skill'): void
  (event: 'change-variant', sectionKey: ResumeSectionKey | 'skill', variant: string): void
  (event: 'move-section', sectionKey: ResumeSectionKey | 'skill', direction: 'up' | 'down'): void
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
  if (
    props.sectionKey === 'education' ||
    props.sectionKey === 'experience' ||
    props.sectionKey === 'project' ||
    props.sectionKey === 'reference' ||
    props.sectionKey === 'certification'
  ) {
    return {
      sectionIcon: props.sectionIcon,
      showSectionIcon: props.showSectionIcon,
    }
  }

  return {}
})

function onVariantChange(_: ResumeSectionKey | 'skill', variant: string) {
  emit('change-variant', props.sectionKey, variant)
}

function onMoveSection(_: ResumeSectionKey | 'skill', direction: 'up' | 'down') {
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
  />
</template>
