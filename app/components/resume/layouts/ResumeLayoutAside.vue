<script setup lang="ts">
import { computed, ref, watch, type CSSProperties } from 'vue'
import { useI18n } from 'vue-i18n'
import type { ResumeApiItem } from '~/services/resumeApi'
import ResumeSectionHeader from '~/components/resume/sections/ResumeSectionHeader.vue'
import ResumeSectionContact from '~/components/resume/sections/ResumeSectionContact.vue'
import ResumeSectionProfile from '~/components/resume/sections/ResumeSectionProfile.vue'
import ResumeSectionRenderer from '~/components/resume/sections/ResumeSectionRenderer.vue'
import ResumeSectionBlock from '~/components/resume/sections/ResumeSectionBlock.vue'
import { isSectionEmpty, resolveLayoutZonesWithConfig } from './sectionStructureResolver'
import { resolveTemplateStyleVars } from '~/modules/resume/template/resolveTemplateStyleVars'
import { resolveSectionIcon } from '~/modules/resume/renderers/sectionIcons'

const emit = defineEmits<{ (event: 'change-variant', sectionKey: string, variant: string): void }>()
const props = defineProps<{ resume: ResumeApiItem; template?: any; headerBandHeight?: number }>()
const { t, te } = useI18n()

const usesHeaderContact = computed(() => true)
const resolvedZones = computed(() => resolveLayoutZonesWithConfig(props.template?.structure, props.template?.structureConfig))
const fallbackSplitZones = resolveLayoutZonesWithConfig('structure-2')
const asideSections = computed(() => (resolvedZones.value.aside.length ? resolvedZones.value.aside : fallbackSplitZones.aside))
const mainSections = computed(() => (resolvedZones.value.main.length ? resolvedZones.value.main : fallbackSplitZones.main))

const localAsideSections = ref<{ id: string; rendererKey: string }[]>([])
const localMainSections = ref<{ id: string; rendererKey: string }[]>([])
watch([asideSections, mainSections], ([a, m]) => {
  localAsideSections.value = a.map((item: any) => ({ ...item }))
  localMainSections.value = m.map((item: any) => ({ ...item }))
}, { immediate: true })

const SECTION_TITLE_KEYS: Record<string, string> = { contact: 'resumeBuilder.create.registry.sections.contact', profile: 'resumeBuilder.create.registry.sections.profile', experience: 'resumeBuilder.create.registry.sections.experience', education: 'resumeBuilder.create.registry.sections.education', skills: 'resumeBuilder.create.registry.sections.skill', projects: 'resumeBuilder.create.registry.sections.project', languages: 'resumeBuilder.create.registry.sections.language', certifications: 'resumeBuilder.create.registry.sections.certification', references: 'resumeBuilder.create.registry.sections.reference', interests: 'resumeBuilder.create.registry.sections.hobby' }
const SECTION_TITLE_FALLBACKS: Record<string, string> = { contact: 'Contact', profile: 'Profile', experience: 'Experience', education: 'Education', skills: 'Skills', projects: 'Projects', languages: 'Languages', certifications: 'Certifications', references: 'References', interests: 'Interests' }
const getSectionTitle = (sectionKey: string) => { const i18nKey = SECTION_TITLE_KEYS[sectionKey]; return (i18nKey && te(i18nKey)) ? t(i18nKey) : (SECTION_TITLE_FALLBACKS[sectionKey] ?? sectionKey) }
const shouldShowSectionIcons = computed(() => props.template?.theme?.showIcon !== false)

function sectionEmpty(sectionId: string) { return isSectionEmpty(props.resume, sectionId) }
function mapSectionKeyToResumeField(sectionKey: string) { return ({ experience: 'experiences', education: 'educations', educations: 'educations', skill: 'skills', skills: 'skills', language: 'languages', languages: 'languages', project: 'projects', projects: 'projects', certification: 'certifications', certifications: 'certifications', reference: 'references', references: 'references', hobby: 'hobbies', interests: 'hobbies' } as Record<string, string>)[sectionKey] || '' }
function onAddItem(sectionKey: string, payload: Record<string, string>) { const resumeField = mapSectionKeyToResumeField(sectionKey); if (!resumeField) return; const list = ((props.resume as any)[resumeField] || []) as Record<string, any>[]; (props.resume as any)[resumeField] = [...list, payload] }
function onMove() {}
function onDeleteSection() {}
function onChangeVariant(sectionKey: string, variant: string) { emit('change-variant', sectionKey, variant) }

function resolveAsideTextColor(primary: unknown): string {
  if (typeof primary !== 'string') return '#ffffff'
  const hex = primary.trim().replace('#', '')
  const normalized = hex.length === 3 ? hex.split('').map((char) => `${char}${char}`).join('') : hex
  if (!/^[0-9a-fA-F]{6}$/.test(normalized)) return '#ffffff'
  const [r, g, b] = [0, 2, 4].map((index) => parseInt(normalized.slice(index, index + 2), 16) / 255)
  const [lr, lg, lb] = [r, g, b].map((channel) => (channel <= 0.03928 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4))
  return (0.2126 * lr + 0.7152 * lg + 0.0722 * lb) > 0.45 ? '#0f172a' : '#ffffff'
}

const styleVars = computed(() => {
  const baseVars = resolveTemplateStyleVars(props.template)
  const palette = props.template?.theme?.palette ?? {}
  const primary = palette.primary ?? '#0f4c81'
  return {
    ...baseVars,
    '--aside-bg': palette.asideBackground ?? primary,
    '--aside-text': palette.asideText ?? resolveAsideTextColor(primary),
    '--aside-radius': props.template?.aside?.radius ?? '18px',
    '--header-band-height': `${Math.min(100, Math.max(0, props.headerBandHeight ?? 100))}%`,
  } as CSSProperties
})
</script>

<template>
  <div class="aside-top" :style="styleVars">
    <ResumeSectionHeader :resume="resume" :template="template" :show-contact-in-header="usesHeaderContact" class="layout-header" />
    <aside class="aside-surface">
      <ResumeSectionBlock v-for="section in localAsideSections" :key="`aside-${section.id}`" tone="on-primary" :title="getSectionTitle(section.id)" :icon="resolveSectionIcon(section.id)" :show-icon="shouldShowSectionIcons" :is-empty="sectionEmpty(section.id)" :section-key="section.id" @move-up="onMove" @move-down="onMove" @delete-section="onDeleteSection" @submit-add-item="onAddItem" @change-variant="onChangeVariant">
        <ResumeSectionContact v-if="section.id === 'contact' && !usesHeaderContact" :resume="resume" :show-title="false" :contact-style="template?.sections?.contact || template?.contactStyle || 'labels'" />
        <ResumeSectionRenderer v-else :section-key="section.rendererKey || section.id" :resume="resume" :template="template" />
      </ResumeSectionBlock>
    </aside>
    <main>
      <ResumeSectionBlock v-for="section in localMainSections" :key="`main-${section.id}`" :title="getSectionTitle(section.id)" :icon="resolveSectionIcon(section.id)" :show-icon="shouldShowSectionIcons" :is-empty="sectionEmpty(section.id)" :section-key="section.id" @move-up="onMove" @move-down="onMove" @delete-section="onDeleteSection" @submit-add-item="onAddItem" @change-variant="onChangeVariant">
        <ResumeSectionProfile v-if="section.id === 'profile'" :resume="resume" :show-title="false" />
        <ResumeSectionRenderer v-else :section-key="section.rendererKey || section.id" :resume="resume" :template="template" />
      </ResumeSectionBlock>
    </main>
  </div>
</template>

<style scoped>
.aside-top { padding-inline: var(--layout-edge-pad, 10px); }
.aside-surface {
  margin-top: 8px;
  padding: var(--panel-pad, 12px);
  background: var(--aside-bg, var(--primary, #0f4c81));
  color: var(--aside-text, #fff);
  border-radius: var(--aside-radius, 18px);
  height: var(--aside-height, 100%);
  overflow: hidden;
}
main { padding: var(--panel-pad, 12px); }
</style>
