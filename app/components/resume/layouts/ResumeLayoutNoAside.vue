<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ResumeApiItem } from '~/services/resumeApi'
import ResumeSectionHeader from '~/components/resume/sections/ResumeSectionHeader.vue'
import ResumeSectionContact from '~/components/resume/sections/ResumeSectionContact.vue'
import ResumeSectionProfile from '~/components/resume/sections/ResumeSectionProfile.vue'
import ResumeSectionRenderer from '~/components/resume/sections/ResumeSectionRenderer.vue'
import ResumeSectionBlock from '~/components/resume/sections/ResumeSectionBlock.vue'
import { resolveTemplateStyleVars } from '~/modules/resume/template/resolveTemplateStyleVars'
import { resolveSectionIcon } from '~/modules/resume/renderers/sectionIcons'

const props = defineProps<{ resume: ResumeApiItem; template?: any; headerOnPrimary?: boolean }>()

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

const isContactEmpty = computed(() => {
  const info = props.resume.resumeInformation
  return ![
    info?.email,
    info?.phone,
    info?.adresse,
    info?.birthDate,
    info?.homepage,
    info?.repo_profile,
  ].some((value) => typeof value === 'string' && value.trim().length > 0)
})

const isProfileEmpty = computed(() => !(props.resume.resumeInformation?.profileText || '').trim())
const shouldShowSectionIcons = computed(() => props.template?.theme?.showIcon !== false)


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

const styleVars = computed(() => {
  const baseVars = resolveTemplateStyleVars(props.template)
  const primary = props.template?.theme?.palette?.primary ?? '#0f4c81'
  return {
    ...baseVars,
    '--primary': primary,
    '--header-text': resolveHeaderTextColor(primary),
  } as CSSProperties
})
</script>

<template>
  <div class="no-aside" :class="{ 'header-on-primary': headerOnPrimary }" :style="styleVars">
    <ResumeSectionHeader class="layout-header" :resume="resume" :template="template" />
    <ResumeSectionBlock :title="getSectionTitle('contact')" :icon="resolveSectionIcon('contact')" :show-icon="shouldShowSectionIcons" :is-empty="isContactEmpty"><ResumeSectionContact :resume="resume" :show-title="false" /></ResumeSectionBlock>
    <ResumeSectionBlock :title="getSectionTitle('profile')" :icon="resolveSectionIcon('profile')" :show-icon="shouldShowSectionIcons" :is-empty="isProfileEmpty"><ResumeSectionProfile :resume="resume" :show-title="false" /></ResumeSectionBlock>
    <ResumeSectionBlock :title="getSectionTitle('experience')" :icon="resolveSectionIcon('experience')" :show-icon="shouldShowSectionIcons" :is-empty="!(resume.experiences?.length)"><ResumeSectionRenderer section-key="experience" :resume="resume" :template="template" /></ResumeSectionBlock>
    <ResumeSectionBlock :title="getSectionTitle('education')" :icon="resolveSectionIcon('education')" :show-icon="shouldShowSectionIcons" :is-empty="!(resume.educations?.length)"><ResumeSectionRenderer section-key="education" :resume="resume" :template="template" /></ResumeSectionBlock>
    <ResumeSectionBlock :title="getSectionTitle('skills')" :icon="resolveSectionIcon('skills')" :show-icon="shouldShowSectionIcons" :is-empty="!(resume.skills?.length)"><ResumeSectionRenderer section-key="skill" :resume="resume" :template="template" /></ResumeSectionBlock>
    <ResumeSectionBlock :title="getSectionTitle('projects')" :icon="resolveSectionIcon('projects')" :show-icon="shouldShowSectionIcons" :is-empty="!(resume.projects?.length)"><ResumeSectionRenderer section-key="project" :resume="resume" :template="template" /></ResumeSectionBlock>
    <ResumeSectionBlock :title="getSectionTitle('languages')" :icon="resolveSectionIcon('languages')" :show-icon="shouldShowSectionIcons" :is-empty="!(resume.languages?.length)"><ResumeSectionRenderer section-key="language" :resume="resume" :template="template" /></ResumeSectionBlock>
    <ResumeSectionBlock :title="getSectionTitle('references')" :icon="resolveSectionIcon('references')" :show-icon="shouldShowSectionIcons" :is-empty="!(resume.references?.length)"><ResumeSectionRenderer section-key="reference" :resume="resume" :template="template" /></ResumeSectionBlock>
    <ResumeSectionBlock :title="getSectionTitle('certifications')" :icon="resolveSectionIcon('certifications')" :show-icon="shouldShowSectionIcons" :is-empty="!(resume.certifications?.length)"><ResumeSectionRenderer section-key="certification" :resume="resume" :template="template" /></ResumeSectionBlock>
    <ResumeSectionBlock :title="getSectionTitle('interests')" :icon="resolveSectionIcon('interests')" :show-icon="shouldShowSectionIcons" :is-empty="!(resume.hobbies?.length)"><ResumeSectionRenderer section-key="hobby" :resume="resume" :template="template" /></ResumeSectionBlock>
  </div>
</template>

<style scoped>
.no-aside {
  font-family: var(--font-family, 'Inter', 'Segoe UI', sans-serif);
  letter-spacing: var(--font-letter-spacing, normal);
  font-style: var(--font-style, normal);
}
.no-aside.header-on-primary .layout-header {
  background: var(--primary, #0f4c81);
  color: var(--header-text, #ffffff);
  padding: var(--panel-pad, 12px);
}
.no-aside.header-on-primary .layout-header :deep(*) {
  color: inherit !important;
}
</style>
