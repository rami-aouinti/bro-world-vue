<script setup lang="ts">
import { computed, ref, watch, type CSSProperties } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ResumeApiItem } from '~/services/resumeApi'
import ResumeSectionHeader from '~/components/resume/sections/ResumeSectionHeader.vue'
import ResumeSectionContact from '~/components/resume/sections/ResumeSectionContact.vue'
import ResumeSectionProfile from '~/components/resume/sections/ResumeSectionProfile.vue'
import ResumeSectionRenderer from '~/components/resume/sections/ResumeSectionRenderer.vue'
import { isSectionEmpty, resolveLayoutZonesWithConfig } from './sectionStructureResolver'
import ResumeSectionBlock from '~/components/resume/sections/ResumeSectionBlock.vue'
import { resolveTemplateStyleVars } from '~/modules/resume/template/resolveTemplateStyleVars'
import { resolveSectionIcon } from '~/modules/resume/renderers/sectionIcons'

const emit = defineEmits<{ (event: 'change-variant', sectionKey: string, variant: string): void }>()

const props = defineProps<{ resume: ResumeApiItem; template?: any; headerOnPrimary?: boolean }>()

const usesHeaderContact = computed(() => ['aside', 'aside-full-right', 'aside-full-left', 'no-aside'].includes(props.template?.layout || ''))

const { t, te } = useI18n()

const SECTION_TITLE_KEYS: Record<string, string> = {
  contact: 'resumeBuilder.create.registry.sections.contact',
  profile: 'resumeBuilder.create.registry.sections.profile',
  experience: 'resumeBuilder.create.registry.sections.experience',
  education: 'resumeBuilder.create.registry.sections.education',
  skills: 'resumeBuilder.create.registry.sections.skill',
  projects: 'resumeBuilder.create.registry.sections.project',
  languages: 'resumeBuilder.create.registry.sections.language',
  certifications: 'resumeBuilder.create.registry.sections.certification',
  references: 'resumeBuilder.create.registry.sections.reference',
  interests: 'resumeBuilder.create.registry.sections.hobby',
}

const SECTION_TITLE_FALLBACKS: Record<string, string> = {
  contact: 'Contact',
  profile: 'Profile',
  experience: 'Experience',
  education: 'Education',
  skills: 'Skills',
  projects: 'Projects',
  languages: 'Languages',
  certifications: 'Certifications',
  references: 'References',
  interests: 'Interests',
}

const getSectionTitle = (sectionKey: string) => {
  const i18nKey = SECTION_TITLE_KEYS[sectionKey]
  if (i18nKey && te(i18nKey)) return t(i18nKey)
  return SECTION_TITLE_FALLBACKS[sectionKey] ?? sectionKey
}

const shouldShowSectionIcons = computed(() => props.template?.theme?.showIcon !== false)

const resolvedZones = computed(() => resolveLayoutZonesWithConfig(props.template?.structure, props.template?.structureConfig))
const orderedSections = computed(() => resolvedZones.value.main)
const localSections = ref<{ id: string; rendererKey: string }[]>([])
watch(orderedSections, (v) => { localSections.value = v.map((i: any) => ({ ...i })) }, { immediate: true })

function sectionEmpty(sectionId: string) {
  return isSectionEmpty(props.resume, sectionId)
}

function resolveHeaderTextColor(primary: unknown): string {
  if (typeof primary !== 'string') return '#ffffff'
  const hex = primary.trim().replace('#', '')
  const normalized = hex.length === 3 ? hex.split('').map((char) => `${char}${char}`).join('') : hex
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return '#ffffff'
  const [r, g, b] = [0, 2, 4].map((index) => parseInt(normalized.slice(index, index + 2), 16) / 255)
  const [lr, lg, lb] = [r, g, b].map((channel) => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
  const luminance = 0.2126 * lr + 0.7152 * lg + 0.0722 * lb
  return luminance > 0.45 ? '#0f172a' : '#ffffff'
}



function onMove(sectionKey: string, direction: 'up' | 'down') {
  const idx = localSections.value.findIndex((section) => section.id === sectionKey)
  if (idx < 0) return
  const target = direction === 'up' ? idx - 1 : idx + 1
  if (target < 0 || target >= localSections.value.length) return
  const clone = [...localSections.value]
  const [item] = clone.splice(idx, 1)
  clone.splice(target, 0, item)
  localSections.value = clone
}

function onDeleteSection(sectionKey: string) {
  localSections.value = localSections.value.filter((section) => section.id !== sectionKey)
}

function mapSectionKeyToResumeField(sectionKey: string) {
  const map: Record<string, string> = {
    experience: 'experiences',
    education: 'educations',
    skill: 'skills',
    skills: 'skills',
    language: 'languages',
    languages: 'languages',
    project: 'projects',
    projects: 'projects',
    certification: 'certifications',
    certifications: 'certifications',
    reference: 'references',
    references: 'references',
    hobby: 'hobbies',
    interests: 'hobbies',
  }
  return map[sectionKey] || ''
}

function onAddItem(sectionKey: string, payload: Record<string, string>) {
  const resumeField = mapSectionKeyToResumeField(sectionKey)
  if (!resumeField) return
  const list = ((props.resume as any)[resumeField] || []) as Record<string, any>[]
  ;(props.resume as any)[resumeField] = [...list, payload]
}

function onChangeVariant(sectionKey: string, variant: string) {
  if (!props.template) return
  if (!props.template.sections) props.template.sections = {}
  props.template.sections[sectionKey] = variant
  emit('change-variant', sectionKey, variant)
}

const styleVars = computed(() => {
  const baseVars = resolveTemplateStyleVars(props.template)
  const primary = props.template?.theme?.palette?.primary ?? '#0f4c81'
  const secondary = props.template?.theme?.palette?.secondary ?? '#334155'
  return {
    ...baseVars,
    '--primary': primary,
    '--secondary': secondary,
    '--header-text': resolveHeaderTextColor(secondary),
  } as CSSProperties
})
</script>

<template>
  <div class="no-aside" :class="{ 'header-on-primary': headerOnPrimary }" :style="styleVars">
    <ResumeSectionHeader class="layout-header" :resume="resume" :template="template" :show-contact-in-header="usesHeaderContact" />
        <ResumeSectionBlock
      v-for="section in localSections"
      :key="section.id"
      :title="getSectionTitle(section.id)"
      :icon="resolveSectionIcon(section.id)"
      :show-icon="shouldShowSectionIcons"
      :is-empty="sectionEmpty(section.id)"
      :section-key="section.id"
      @move-up="onMove($event, 'up')"
      @move-down="onMove($event, 'down')"
      @delete-section="onDeleteSection"
      @submit-add-item="onAddItem"
      @change-variant="onChangeVariant">
      <ResumeSectionContact v-if="section.id === 'contact' && !usesHeaderContact" :resume="resume" :show-title="false" :contact-style="template?.sections?.contact || template?.contactStyle || 'labels'" />
      <ResumeSectionProfile v-else-if="section.id === 'profile'" :resume="resume" :show-title="false" />
      <ResumeSectionRenderer v-else :section-key="section.rendererKey || section.id" :resume="resume" :template="template" />
    </ResumeSectionBlock>
  </div>
</template>

<style scoped>
.no-aside {
  font-family: var(--font-family, 'Inter', 'Segoe UI', sans-serif);
  letter-spacing: var(--font-letter-spacing, normal);
  font-style: var(--font-style, normal);
  padding-inline: var(--layout-edge-pad, 10px);
  box-sizing: border-box;
}
.no-aside.header-on-primary .layout-header {
  background: var(--secondary, #334155);
  color: var(--header-text, #ffffff);
  padding: var(--panel-pad, 12px);
}
.no-aside.header-on-primary .layout-header :deep(*) {
  color: inherit !important;
}
</style>
