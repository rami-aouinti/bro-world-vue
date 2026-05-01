<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'
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

const props = defineProps<{ resume: ResumeApiItem; template?: any; reverse?: boolean; headerOnPrimary?: boolean; headerBandHeight?: number }>()

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
const shouldShowSectionIcons = computed(() => props.template?.theme?.showIcon !== false)

const resolvedZones = computed(() =>
  resolveLayoutZonesWithConfig(props.template?.structure, props.template?.structureConfig),
)
const fallbackSplitZones = resolveLayoutZonesWithConfig('structure-2')
const usesFallbackSplit = computed(() => resolvedZones.value.aside.length === 0)
const asideSections = computed(() =>
  usesFallbackSplit.value ? fallbackSplitZones.aside : resolvedZones.value.aside,
)
const mainSections = computed(() =>
  usesFallbackSplit.value ? fallbackSplitZones.main : resolvedZones.value.main,
)

function sectionEmpty(sectionId: string) {
  return isSectionEmpty(props.resume, sectionId)
}


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
    '--aside-bg': palette.asideBackground ?? primary,
    '--aside-text': palette.asideText ?? resolveAsideTextColor(primary),
    '--header-band-height': `${Math.min(100, Math.max(0, props.headerBandHeight ?? 100))}%`,
  } as CSSProperties
})
</script>

<template>
  <div class="aside-left" :class="{ reverse }" :style="styleVars">
    <ResumeSectionHeader class="full" :class="{ 'full--on-primary': headerOnPrimary }" :resume="resume" :template="template" />
    <aside class="aside-surface on-primary">
      <ResumeSectionBlock v-for="section in asideSections" :key="`aside-${section.id}`" tone="on-primary" :title="getSectionTitle(section.id)" :icon="resolveSectionIcon(section.id)" :show-icon="shouldShowSectionIcons" :is-empty="sectionEmpty(section.id)" :section-key="section.id">
        <ResumeSectionContact v-if="section.id === 'contact'" :resume="resume" :show-title="false" :contact-style="template?.sections?.contact || template?.contactStyle || 'labels'" />
        <ResumeSectionRenderer v-else :section-key="section.rendererKey" :resume="resume" :template="template" />
      </ResumeSectionBlock>
    </aside>
    <main>
      <ResumeSectionBlock v-for="section in mainSections" :key="`main-${section.id}`" :title="getSectionTitle(section.id)" :icon="resolveSectionIcon(section.id)" :show-icon="shouldShowSectionIcons" :is-empty="sectionEmpty(section.id)" :section-key="section.id">
        <ResumeSectionProfile v-if="section.id === 'profile'" :resume="resume" :show-title="false" />
        <ResumeSectionRenderer v-else :section-key="section.rendererKey" :resume="resume" :template="template" />
      </ResumeSectionBlock>
    </main>
  </div>
</template>

<style scoped>
.aside-left {
  display: grid;
  grid-template-columns: var(--aside-width, 240px) 1fr;
  grid-template-areas: 'header header' 'aside main';
  font-family: var(--font-family, 'Inter', 'Segoe UI', sans-serif);
  letter-spacing: var(--font-letter-spacing, normal);
  font-style: var(--font-style, normal);
}
.aside-left.reverse {
  grid-template-columns: 1fr var(--aside-width, 240px);
  grid-template-areas: 'header header' 'main aside';
}
.full {
  grid-area: header;
  position: relative;
}
.full--on-primary {
  background:
    linear-gradient(
      to bottom,
      var(--aside-bg, var(--primary, #0f4c81)) 0,
      var(--aside-bg, var(--primary, #0f4c81)) var(--header-band-height, 100%),
      transparent var(--header-band-height, 100%),
      transparent 100%
    );
  color: var(--aside-text, #ffffff);
}
aside {
  grid-area: aside;
  padding: var(--panel-pad, 12px);
  background: var(--aside-bg, var(--primary, #0f4c81));
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
:where(aside, .full--on-primary) :deep(h1),
:where(aside, .full--on-primary) :deep(h2),
:where(aside, .full--on-primary) :deep(h3),
:where(aside, .full--on-primary) :deep(h4),
:where(aside, .full--on-primary) :deep(h5),
:where(aside, .full--on-primary) :deep(h6),
:where(aside, .full--on-primary) :deep(p),
:where(aside, .full--on-primary) :deep(span),
:where(aside, .full--on-primary) :deep(label),
:where(aside, .full--on-primary) :deep(li),
:where(aside, .full--on-primary) :deep(a),
:where(aside, .full--on-primary) :deep(svg),
:where(aside, .full--on-primary) :deep(i),
:where(aside, .full--on-primary) :deep(strong),
:where(aside, .full--on-primary) :deep(em),
:where(aside, .full--on-primary) :deep(small),
:where(aside, .full--on-primary) :deep(.section-title),
:where(aside, .full--on-primary) :deep(.resume-section-title),
:where(aside, .full--on-primary) :deep(.resume-section-content),
:where(aside, .full--on-primary) :deep(.resume-item),
:where(aside, .full--on-primary) :deep(.icon),
:where(aside, .full--on-primary) :deep(::marker) {
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
aside.aside-surface :deep(.resume-section-block > :not(.resume-section-heading)) {
  font-size: 0.88em;
  line-height: 1.35;
}
aside.aside-surface :deep(.resume-section-block > :not(.resume-section-heading) *) {
  font-size: inherit;
}
aside.aside-surface :deep(.resume-section-block + .resume-section-block) {
  border-top: 1px var(--line-style, solid) var(--aside-separator);
  padding-top: var(--section-space, 12px);
}
</style>
