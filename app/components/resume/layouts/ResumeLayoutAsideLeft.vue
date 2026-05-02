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

const props = defineProps<{ resume: ResumeApiItem; template?: any; reverse?: boolean; headerOnPrimary?: boolean; headerBandHeight?: number; barOnly?: boolean }>()

const usesHeaderContact = computed(() => ['aside', 'aside-full-right', 'aside-full-left'].includes(props.template?.layout || ''))

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
const localAsideSections = ref<{ id: string; rendererKey: string }[]>([])
const localMainSections = ref<{ id: string; rendererKey: string }[]>([])
watch([asideSections, mainSections], ([a, m]) => {
  if (!localAsideSections.value.length && !localMainSections.value.length) {
    localAsideSections.value = a.map((item: any) => ({ ...item }))
    localMainSections.value = m.map((item: any) => ({ ...item }))
  }
}, { immediate: true })

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



function mapSectionKeyToResumeField(sectionKey: string) {
  const map: Record<string, string> = {
    experience: 'experiences', education: 'educations', educations: 'educations',
    skill: 'skills', skills: 'skills', language: 'languages', languages: 'languages',
    project: 'projects', projects: 'projects', certification: 'certifications', certifications: 'certifications',
    reference: 'references', references: 'references', hobby: 'hobbies', interests: 'hobbies',
  }
  return map[sectionKey] || ''
}

function onAddItem(sectionKey: string, payload: Record<string, string>) {
  const resumeField = mapSectionKeyToResumeField(sectionKey)
  if (!resumeField) return
  const list = ((props.resume as any)[resumeField] || []) as Record<string, any>[]
  ;(props.resume as any)[resumeField] = [...list, payload]
}

function allSections() { return [...localAsideSections.value, ...localMainSections.value] }
function setAllSections(next: { id: string; rendererKey: string }[]) {
  const asideIds = new Set(localAsideSections.value.map((s) => s.id))
  const mainIds = new Set(localMainSections.value.map((s) => s.id))
  localAsideSections.value = next.filter((s) => asideIds.has(s.id))
  localMainSections.value = next.filter((s) => mainIds.has(s.id))
}
function onMove(sectionKey: string, direction: 'up' | 'down') {
  const sections = allSections()
  const idx = sections.findIndex((s) => s.id === sectionKey)
  if (idx < 0) return
  const target = direction === 'up' ? idx - 1 : idx + 1
  if (target < 0 || target >= sections.length) return
  const clone = [...sections]
  const [item] = clone.splice(idx, 1)
  clone.splice(target, 0, item)
  setAllSections(clone)
}
function onDeleteSection(sectionKey: string) {
  localAsideSections.value = localAsideSections.value.filter((s) => s.id !== sectionKey)
  localMainSections.value = localMainSections.value.filter((s) => s.id !== sectionKey)
}
function onChangeVariant(sectionKey: string, variant: string) {
  if (!props.template) return
  if (!props.template.sections) props.template.sections = {}
  props.template.sections[sectionKey] = variant
  emit('change-variant', sectionKey, variant)
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
    '--aside-radius': props.template?.aside?.radius ?? '18px',
    '--header-band-height': `${Math.min(100, Math.max(0, props.headerBandHeight ?? 100))}%`,
  } as CSSProperties
})
</script>

<template>
  <div class="aside-left" :class="{ reverse, 'bar-only': barOnly }" :style="styleVars">
    <ResumeSectionHeader class="full" :class="{ 'full--on-primary': headerOnPrimary }" :resume="resume" :template="template" :show-contact-in-header="usesHeaderContact" />
    <aside class="aside-surface" :class="{ 'on-primary': !barOnly, 'text-dark': barOnly }">
      <ResumeSectionBlock v-for="section in localAsideSections" :key="`aside-${section.id}`" tone="on-primary" :title="getSectionTitle(section.id)" :icon="resolveSectionIcon(section.id)" :show-icon="shouldShowSectionIcons" :is-empty="sectionEmpty(section.id)" :section-key="section.id" @move-up="onMove($event, 'up')" @move-down="onMove($event, 'down')" @delete-section="onDeleteSection" @submit-add-item="onAddItem" @change-variant="onChangeVariant">
        <ResumeSectionContact v-if="section.id === 'contact' && !usesHeaderContact" :resume="resume" :show-title="false" :contact-style="template?.sections?.contact || template?.contactStyle || 'labels'" />
        <ResumeSectionRenderer v-else :section-key="section.rendererKey" :resume="resume" :template="template" />
      </ResumeSectionBlock>
    </aside>
    <main>
      <ResumeSectionBlock v-for="section in localMainSections" :key="`main-${section.id}`" :title="getSectionTitle(section.id)" :icon="resolveSectionIcon(section.id)" :show-icon="shouldShowSectionIcons" :is-empty="sectionEmpty(section.id)" :section-key="section.id" @move-up="onMove($event, 'up')" @move-down="onMove($event, 'down')" @delete-section="onDeleteSection" @submit-add-item="onAddItem" @change-variant="onChangeVariant">
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
  padding-inline: var(--layout-edge-pad, 10px);
  box-sizing: border-box;
  min-height: 100%;
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
  border-radius: 0;
  height: var(--aside-height, 100%);
  align-self: start;
  overflow: hidden;
}

.aside-left:not(.reverse) aside {
  border-top-right-radius: var(--aside-radius, 18px);
}
.aside-left.reverse aside {
  border-top-left-radius: var(--aside-radius, 18px);
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

.aside-left.bar-only aside {
  background: transparent;
  color: var(--text, #0f172a);
  border: 0;
  border-inline-end: 8px solid var(--aside-bg, var(--primary, #0f4c81));
  padding-inline-start: calc(var(--panel-pad, 12px) - 2px);
}
.aside-left.bar-only.reverse aside {
  border-inline-end: 0;
  border-inline-start: 8px solid var(--aside-bg, var(--primary, #0f4c81));
  padding-inline-start: calc(var(--panel-pad, 12px) - 2px);
  padding-inline-end: var(--panel-pad, 12px);
}
.aside-left.bar-only aside ::v-deep(*) {
  color: inherit !important;
}
.aside-left.bar-only aside.text-dark {
  --text: #0f172a;
  --muted: #334155;
  --aside-link: #0f172a;
}
.aside-left.bar-only aside.text-dark ::v-deep(a),
.aside-left.bar-only aside.text-dark ::v-deep(a:hover),
.aside-left.bar-only aside.text-dark ::v-deep(a:focus-visible),
.aside-left.bar-only aside.text-dark ::v-deep(svg),
.aside-left.bar-only aside.text-dark ::v-deep(i),
.aside-left.bar-only aside.text-dark ::v-deep(.icon) {
  color: #0f172a !important;
}

main {
  grid-area: main;
  padding: var(--panel-pad, 12px);
}
.aside-left aside ::v-deep(h1),
.aside-left .full--on-primary ::v-deep(h1),
.aside-left aside ::v-deep(h2),
.aside-left .full--on-primary ::v-deep(h2),
.aside-left aside ::v-deep(h3),
.aside-left .full--on-primary ::v-deep(h3),
.aside-left aside ::v-deep(h4),
.aside-left .full--on-primary ::v-deep(h4),
.aside-left aside ::v-deep(h5),
.aside-left .full--on-primary ::v-deep(h5),
.aside-left aside ::v-deep(h6),
.aside-left .full--on-primary ::v-deep(h6),
.aside-left aside ::v-deep(p),
.aside-left .full--on-primary ::v-deep(p),
.aside-left aside ::v-deep(span),
.aside-left .full--on-primary ::v-deep(span),
.aside-left aside ::v-deep(label),
.aside-left .full--on-primary ::v-deep(label),
.aside-left aside ::v-deep(li),
.aside-left .full--on-primary ::v-deep(li),
.aside-left aside ::v-deep(a),
.aside-left .full--on-primary ::v-deep(a),
.aside-left aside ::v-deep(svg),
.aside-left .full--on-primary ::v-deep(svg),
.aside-left aside ::v-deep(i),
.aside-left .full--on-primary ::v-deep(i),
.aside-left aside ::v-deep(strong),
.aside-left .full--on-primary ::v-deep(strong),
.aside-left aside ::v-deep(em),
.aside-left .full--on-primary ::v-deep(em),
.aside-left aside ::v-deep(small),
.aside-left .full--on-primary ::v-deep(small),
.aside-left aside ::v-deep(.section-title),
.aside-left .full--on-primary ::v-deep(.section-title),
.aside-left aside ::v-deep(.resume-section-title),
.aside-left .full--on-primary ::v-deep(.resume-section-title),
.aside-left aside ::v-deep(.resume-section-content),
.aside-left .full--on-primary ::v-deep(.resume-section-content),
.aside-left aside ::v-deep(.resume-item),
.aside-left .full--on-primary ::v-deep(.resume-item),
.aside-left aside ::v-deep(.icon),
.aside-left .full--on-primary ::v-deep(.icon),
.aside-left aside ::v-deep(::marker),
.aside-left .full--on-primary ::v-deep(::marker) {
  color: inherit !important;
}
aside.aside-surface ::v-deep(a) {
  color: var(--aside-link) !important;
  text-decoration-line: underline;
  text-decoration-color: color-mix(in srgb, var(--aside-link) 55%, transparent);
  text-decoration-thickness: 1px;
  text-underline-offset: 0.12em;
}
aside.aside-surface ::v-deep(a:hover),
aside.aside-surface ::v-deep(a:focus-visible) {
  color: var(--aside-text-primary) !important;
  text-decoration-color: currentColor;
}
aside.aside-surface ::v-deep(a:focus-visible) {
  outline: 2px solid color-mix(in srgb, var(--aside-text-primary) 72%, transparent);
  outline-offset: 2px;
  border-radius: 2px;
}
aside.aside-surface ::v-deep(svg),
aside.aside-surface ::v-deep(i),
aside.aside-surface ::v-deep(.icon) {
  color: var(--aside-text-primary) !important;
}
aside.aside-surface ::v-deep(.resume-section-block > :not(.resume-section-heading)) {
  font-size: 0.88em;
  line-height: 1.35;
}
aside.aside-surface ::v-deep(.resume-section-block > :not(.resume-section-heading) *) {
  font-size: inherit;
}
aside.aside-surface ::v-deep(.resume-section-block + .resume-section-block) {
  border-top: 1px var(--line-style, solid) var(--aside-separator);
  padding-top: var(--section-space, 12px);
}
</style>
