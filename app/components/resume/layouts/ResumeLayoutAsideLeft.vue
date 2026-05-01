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

const props = defineProps<{ resume: ResumeApiItem; template?: any; reverse?: boolean }>()

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
const SECTION_TITLE_FALLBACKS: Record<string, string> = { contact: 'Contact', profile: 'Profile', experience: 'Experience', education: 'Education', skills: 'Skills', projects: 'Projects', languages: 'Languages', certifications: 'Certifications', references: 'References', interests: 'Interests' }
const getSectionTitle = (sectionKey: string) => {
  const i18nKey = SECTION_TITLE_KEYS[sectionKey]
  if (i18nKey && te(i18nKey)) return t(i18nKey)
  return SECTION_TITLE_FALLBACKS[sectionKey] ?? sectionKey
}
const isContactEmpty = computed(() => {
  const info = props.resume.resumeInformation
  return ![info?.email, info?.phone, info?.adresse, info?.birthDate, info?.homepage, info?.repo_profile].some((value) => typeof value === 'string' && value.trim().length > 0)
})
const isProfileEmpty = computed(() => !(props.resume.resumeInformation?.profileText || '').trim())
const shouldShowSectionIcons = computed(() => props.template?.theme?.showIcon !== false)


function resolveAsideTextColor(primary: unknown): string {
  if (typeof primary !== 'string') return '#ffffff'
  const value = primary.trim()
  const hex = value.replace('#', '')
  const normalized = hex.length === 3 ? hex.split('').map((char) => `${char}${char}`).join('') : hex
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return '#ffffff'

  const [r, g, b] = [0, 2, 4].map((index) => parseInt(normalized.slice(index, index + 2), 16) / 255)
  const [lr, lg, lb] = [r, g, b].map((channel) => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
  const luminance = 0.2126 * lr + 0.7152 * lg + 0.0722 * lb

  return luminance > 0.45 ? '#0f172a' : '#ffffff'
}

const styleVars = computed(() => {
  const baseVars = resolveTemplateStyleVars(props.template)
  const palette = props.template?.theme?.palette ?? {}
  const primary = palette.primary ?? '#0f4c81'

  return {
    ...baseVars,
    '--primary': primary,
    '--secondary': palette.secondary ?? '#334155',
    '--text': palette.text ?? '#0f172a',
    '--muted': palette.muted ?? '#64748b',
    '--page-bg': palette.pageBackground ?? '#ffffff',
    '--aside-bg': 'var(--primary)',
    '--aside-text': resolveAsideTextColor(primary),
  } as CSSProperties
})
</script>

<template>
  <div class="aside-left" :class="{ reverse }" :style="styleVars">
    <ResumeSectionHeader class="full" :resume="resume" :template="template" />
    <aside class="aside-surface on-primary">
      <ResumeSectionBlock tone="on-primary" :title="getSectionTitle('contact')" :icon="resolveSectionIcon('contact')" :show-icon="shouldShowSectionIcons" :is-empty="isContactEmpty"><ResumeSectionContact :resume="resume" :show-title="false" :contact-style="template?.sections?.contact || template?.contactStyle || 'labels'" /></ResumeSectionBlock>
      <ResumeSectionBlock tone="on-primary" :title="getSectionTitle('skills')" :icon="resolveSectionIcon('skills')" :show-icon="shouldShowSectionIcons" :is-empty="!(resume.skills?.length)"><ResumeSectionRenderer section-key="skill" :resume="resume" :template="template" /></ResumeSectionBlock>
      <ResumeSectionBlock tone="on-primary" :title="getSectionTitle('languages')" :icon="resolveSectionIcon('languages')" :show-icon="shouldShowSectionIcons" :is-empty="!(resume.languages?.length)"><ResumeSectionRenderer section-key="language" :resume="resume" :template="template" /></ResumeSectionBlock>
      <ResumeSectionBlock tone="on-primary" :title="getSectionTitle('references')" :icon="resolveSectionIcon('references')" :show-icon="shouldShowSectionIcons" :is-empty="!(resume.references?.length)"><ResumeSectionRenderer section-key="reference" :resume="resume" :template="template" /></ResumeSectionBlock>
      <ResumeSectionBlock tone="on-primary" :title="getSectionTitle('certifications')" :icon="resolveSectionIcon('certifications')" :show-icon="shouldShowSectionIcons" :is-empty="!(resume.certifications?.length)"><ResumeSectionRenderer section-key="certification" :resume="resume" :template="template" /></ResumeSectionBlock>
      <ResumeSectionBlock tone="on-primary" :title="getSectionTitle('interests')" :icon="resolveSectionIcon('interests')" :show-icon="shouldShowSectionIcons" :is-empty="!(resume.hobbies?.length)"><ResumeSectionRenderer section-key="hobby" :resume="resume" :template="template" /></ResumeSectionBlock>
    </aside>
    <main>
      <ResumeSectionBlock :title="getSectionTitle('profile')" :icon="resolveSectionIcon('profile')" :show-icon="shouldShowSectionIcons" :is-empty="isProfileEmpty"><ResumeSectionProfile :resume="resume" :show-title="false" /></ResumeSectionBlock>
      <ResumeSectionBlock :title="getSectionTitle('experience')" :icon="resolveSectionIcon('experience')" :show-icon="shouldShowSectionIcons" :is-empty="!(resume.experiences?.length)"><ResumeSectionRenderer section-key="experience" :resume="resume" :template="template" /></ResumeSectionBlock>
      <ResumeSectionBlock :title="getSectionTitle('education')" :icon="resolveSectionIcon('education')" :show-icon="shouldShowSectionIcons" :is-empty="!(resume.educations?.length)"><ResumeSectionRenderer section-key="education" :resume="resume" :template="template" /></ResumeSectionBlock>
      <ResumeSectionBlock :title="getSectionTitle('projects')" :icon="resolveSectionIcon('projects')" :show-icon="shouldShowSectionIcons" :is-empty="!(resume.projects?.length)"><ResumeSectionRenderer section-key="project" :resume="resume" :template="template" /></ResumeSectionBlock>
    </main>
  </div>
</template>

<style scoped>
.aside-left {
  display: grid;
  grid-template-columns: var(--aside-width, 240px) 1fr;
  grid-template-areas: 'header header' 'aside main';
  gap: var(--layout-gap, 20px);
  font-family: var(--font-family, 'Inter', 'Segoe UI', sans-serif);
  letter-spacing: var(--font-letter-spacing, normal);
  font-style: var(--font-style, normal);
}
.aside-left.reverse {
  grid-template-columns: 1fr var(--aside-width, 240px);
  grid-template-areas: 'header header' 'main aside';
}
.full { grid-area: header; }
aside {
  grid-area: aside;
  padding: var(--panel-pad, 12px);
  background: var(--primary, #0f4c81);
  color: var(--aside-text-primary, var(--aside-text, #f8fafc));
  border: 1px var(--line-style, solid) color-mix(in srgb, var(--aside-text, #ffffff) 22%, transparent);
}
aside.aside-surface {
  --aside-text-primary: color-mix(in srgb, var(--aside-text, #ffffff) 96%, #fff 4%);
  --aside-text-secondary: color-mix(in srgb, var(--aside-text-primary) 68%, transparent);
  --aside-link: color-mix(in srgb, var(--aside-text-primary) 88%, #fff 12%);
  --aside-separator: color-mix(in srgb, var(--aside-text-primary) 24%, transparent);
}
aside.on-primary {
  --text: var(--aside-text-primary);
  --muted: var(--aside-text-secondary);
}
main {
  grid-area: main;
  padding: var(--panel-pad, 12px);
}
aside :deep(h1),
aside :deep(h2),
aside :deep(h3),
aside :deep(h4),
aside :deep(h5),
aside :deep(h6),
aside :deep(p),
aside :deep(span),
aside :deep(label),
aside :deep(li),
aside :deep(a),
aside :deep(svg),
aside :deep(i),
aside :deep(strong),
aside :deep(em),
aside :deep(small),
aside :deep(.section-title),
aside :deep(.resume-section-title),
aside :deep(.resume-section-content),
aside :deep(.resume-item),
aside :deep(.icon),
aside :deep(::marker) {
  color: inherit !important;
}
aside.aside-surface :deep(a) {
  color: var(--aside-link) !important;
  text-decoration-line: underline;
  text-decoration-color: color-mix(in srgb, var(--aside-link) 55%, transparent);
  text-decoration-thickness: 1px;
  text-underline-offset: 0.12em;
}
aside.aside-surface :deep(a:hover),
aside.aside-surface :deep(a:focus-visible) {
  color: var(--aside-text-primary) !important;
  text-decoration-color: currentColor;
}
aside.aside-surface :deep(a:focus-visible) {
  outline: 2px solid color-mix(in srgb, var(--aside-text-primary) 72%, transparent);
  outline-offset: 2px;
  border-radius: 2px;
}
aside.aside-surface :deep(svg),
aside.aside-surface :deep(i),
aside.aside-surface :deep(.icon) {
  color: var(--aside-text-primary) !important;
}
aside.aside-surface :deep(.resume-section-block + .resume-section-block) {
  border-top: 1px var(--line-style, solid) var(--aside-separator);
  padding-top: var(--section-space, 12px);
}
</style>
