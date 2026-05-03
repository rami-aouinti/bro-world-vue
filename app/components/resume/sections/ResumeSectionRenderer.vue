<script setup lang="ts">
import { computed } from 'vue'
import type { ResumeApiItem } from '~/services/resumeApi'
import {
  resolveSectionRenderer,
  type ResumeRendererSectionKey,
} from '~/modules/resume/renderers/sectionRegistry'

const props = defineProps<{
  resume: ResumeApiItem
  template?: any
  sectionKey:
    | 'experience'
    | 'education'
    | 'skill'
    | 'project'
    | 'certification'
    | 'reference'
    | 'hobby'
    | 'language'
}>()

const SECTION_TO_RENDERER_KEY: Record<string, ResumeRendererSectionKey> = {
  experience: 'experience',
  education: 'education',
  skill: 'skills',
  project: 'projects',
  certification: 'certifications',
  reference: 'references',
  hobby: 'interests',
  language: 'languages',
}

const SECTION_TEMPLATE_KEYS: Record<string, string[]> = {
  experience: ['experience'],
  education: ['education'],
  skill: ['skill', 'skills'],
  project: ['project', 'projects'],
  certification: ['certification', 'certifications'],
  reference: ['reference', 'references'],
  hobby: ['hobby', 'interests'],
  language: ['language', 'languages'],
}

const SECTION_TO_ITEMS: Record<string, (resume: ResumeApiItem) => unknown[]> = {
  experience: (resume) => resume.experiences || [],
  education: (resume) => resume.educations || [],
  skill: (resume) => resume.skills || [],
  project: (resume) => resume.projects || [],
  certification: (resume) => resume.certifications || [],
  reference: (resume) => resume.references || [],
  hobby: (resume) => resume.hobbies || [],
  language: (resume) => resume.languages || [],
}

const selectedVariant = computed(() => {
  const sectionEntries = props.template?.sections || {}
  const keys = SECTION_TEMPLATE_KEYS[props.sectionKey] || [props.sectionKey]
  for (const key of keys) {
    const requested = sectionEntries[key]
    if (typeof requested === 'string') return requested
  }
  return 'classic'
})

const dynamicComponent = computed(() => {
  const rendererKey = SECTION_TO_RENDERER_KEY[props.sectionKey]
  return resolveSectionRenderer(rendererKey, selectedVariant.value)
})

const items = computed(
  () => SECTION_TO_ITEMS[props.sectionKey]?.(props.resume) || [],
)
</script>

<template>
  <component
    :is="dynamicComponent"
    :resume="resume"
    :items="items"
    :theme="template?.theme"
    :editable="true"
  />
</template>
