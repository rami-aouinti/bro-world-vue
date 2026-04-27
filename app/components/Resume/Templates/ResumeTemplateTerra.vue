<script setup lang="ts">
import ResumeSectionExperience from '~/components/Resume/Sections/ResumeSectionExperience.vue'
import ResumeSectionEducation from '~/components/Resume/Sections/ResumeSectionEducation.vue'
import ResumeSectionLanguage from '~/components/Resume/Sections/ResumeSectionLanguage.vue'
import ResumeSectionProject from '~/components/Resume/Sections/ResumeSectionProject.vue'
import { RESUME_SECTION_DESIGN_PRESETS, type ResumeSectionDesignPreset } from '~/constants/resumeSectionDesign'

type LayoutSettings = {
  photoSize?: number
  photoBorderWidth?: number
  photoPosition?: 'left' | 'center' | 'right'
  sidebarWidth?: number
  sectionDividerStyle?: 'none' | 'line' | 'thick'
  headingCase?: 'normal' | 'uppercase'
  dateColumnWidth?: number
  lineDensity?: 'compact' | 'comfortable'
}

type SectionKey = 'experience' | 'education' | 'language' | 'project'
type SectionLayoutEntry = {
  key: SectionKey
  label: string
  variant: string
  region: 'main' | 'aside'
}

const props = withDefaults(defineProps<{ resume: any; showPhoto?: boolean; editable?: boolean; onPhotoClick?: () => void; layoutSettings?: LayoutSettings; sectionLayout?: SectionLayoutEntry[] }>(), {
  showPhoto: true,
  editable: false,
  onPhotoClick: undefined,
  layoutSettings: () => ({}),
  sectionLayout: () => [],
})
const emit = defineEmits<{
  (event: 'add-item', sectionKey: SectionKey): void
  (event: 'change-variant', sectionKey: SectionKey, variant: string): void
  (event: 'move-section', sectionKey: SectionKey, direction: 'up' | 'down'): void
}>()

function updateText(path: string, value: string) {
  const segments = path.split('.')
  const last = segments.pop()
  if (!last) return

  let target: Record<string, any> = props.resume
  for (const segment of segments) {
    if (!(segment in target)) return
    target = target[segment]
  }

  target[last] = value
}

const sidebarStyle = computed(() => ({
  width: `${props.layoutSettings?.sidebarWidth ?? 270}px`,
}))
const layoutStyle = computed(() => ({
  gridTemplateColumns: `${props.layoutSettings?.sidebarWidth ?? 270}px 1fr`,
}))
const photoStyle = computed(() => ({
  width: `${props.layoutSettings?.photoSize ?? 140}px`,
  height: `${props.layoutSettings?.photoSize ?? 140}px`,
  borderWidth: `${props.layoutSettings?.photoBorderWidth ?? 6}px`,
  marginLeft: props.layoutSettings?.photoPosition === 'left' ? '0' : 'auto',
  marginRight: props.layoutSettings?.photoPosition === 'right' ? '0' : 'auto',
}))
const headingStyle = computed(() => ({
  textTransform: props.layoutSettings?.headingCase === 'uppercase' ? 'uppercase' : 'none',
}))
const defaultSectionLayout: SectionLayoutEntry[] = [
  { key: 'experience', label: 'Expérience', variant: 'detailed', region: 'main' },
  { key: 'education', label: 'Education', variant: 'classic', region: 'main' },
  { key: 'language', label: 'Language', variant: 'text-level', region: 'aside' },
  { key: 'project', label: 'Project', variant: 'list', region: 'main' },
]
const visibleSections = computed(() => (
  props.sectionLayout.length
    ? props.sectionLayout
    : defaultSectionLayout
))
const mainSections = computed(() => visibleSections.value.filter(section => section.region === 'main'))
const asideSections = computed(() => visibleSections.value.filter(section => section.region === 'aside'))
function canMoveUp(sectionKey: SectionKey) {
  const currentSection = visibleSections.value.find(section => section.key === sectionKey)
  if (!currentSection) return false
  const regionSections = visibleSections.value.filter(section => section.region === currentSection.region)
  return regionSections.findIndex(section => section.key === sectionKey) > 0
}
function canMoveDown(sectionKey: SectionKey) {
  const currentSection = visibleSections.value.find(section => section.key === sectionKey)
  if (!currentSection) return false
  const regionSections = visibleSections.value.filter(section => section.region === currentSection.region)
  const index = regionSections.findIndex(section => section.key === sectionKey)
  return index > -1 && index < regionSections.length - 1
}
const sectionHeadingByKey: Record<SectionKey, string> = {
  experience: 'Expériences professionnelles',
  education: 'Formations & diplômes',
  language: 'Languages',
  project: 'Projects',
}
const sectionDesignPresets = RESUME_SECTION_DESIGN_PRESETS.terra

function mapPresetToThemeTokens(preset: ResumeSectionDesignPreset, isCompact: boolean) {
  const spacingByDensity = {
    compact: isCompact ? '8px' : '10px',
    normal: isCompact ? '8px' : '14px',
    spacious: isCompact ? '12px' : '18px',
  } as const
  const headingByStyle = {
    underline: { '--rs-heading-border-bottom': '1px solid color-mix(in srgb, var(--cv-accent) 24%, var(--cv-page))' },
    badge: { '--rs-heading-bg': 'color-mix(in srgb, var(--cv-accent) 14%, var(--cv-page))', '--rs-heading-padding': '3px 10px', '--rs-heading-radius': '999px' },
    minimal: {},
  } as const
  const separatorByStyle = {
    none: 'none',
    line: '1px solid color-mix(in srgb, var(--cv-accent) 18%, transparent)',
    thick: '2px solid color-mix(in srgb, var(--cv-accent) 30%, transparent)',
  } as const
  const cardByStyle = {
    flat: {},
    soft: { '--rs-card-bg': 'color-mix(in srgb, var(--cv-page) 88%, var(--cv-accent))', '--rs-card-padding': '10px 12px', '--rs-card-radius': '10px' },
    outlined: { '--rs-card-border': '1px solid color-mix(in srgb, var(--cv-accent) 24%, transparent)', '--rs-card-padding': '10px 12px', '--rs-card-radius': '10px' },
  } as const
  const accentByStyle = {
    dot: { '--rs-marker-size': '7px', '--rs-marker-radius': '999px' },
    bar: { '--rs-marker-height': '14px', '--rs-marker-width': '3px', '--rs-marker-radius': '3px' },
    'left-border': { '--rs-entry-border-left': '2px solid color-mix(in srgb, var(--cv-accent) 38%, transparent)', '--rs-entry-padding-left': '10px' },
  } as const

  return {
    '--entry-gap': spacingByDensity[preset.spacingDensity],
    '--rs-section-separator': separatorByStyle[preset.separators],
    ...headingByStyle[preset.headingStyle],
    ...cardByStyle[preset.cardStyle],
    ...accentByStyle[preset.accentMarker],
  }
}

function getSectionBindings(sectionKey: SectionKey) {
  const preset = sectionDesignPresets[sectionKey]
  const isCompact = props.layoutSettings?.lineDensity === 'compact'
  return {
    variant: preset.variant,
    layoutDensity: preset.spacingDensity === 'spacious'
      ? 'spacious'
      : isCompact
        ? 'compact'
        : preset.spacingDensity,
    themeTokens: mapPresetToThemeTokens(preset, isCompact),
  }
}
</script>

<template>
  <div class="terra-template cv-template-base text-dark" :style="layoutStyle">
    <aside class="cv-sidebar-surface" :style="sidebarStyle">
      <v-avatar v-if="showPhoto && resume.photoUrl" class="mb-5 terra-photo" :style="photoStyle" @click="onPhotoClick?.()">
        <v-img :src="resume.photoUrl" cover />
      </v-avatar>
      <h3 class="text-dark" :style="headingStyle">Contact</h3>
      <p class="editable-text text-dark" :contenteditable="editable" @input="event => updateText('phone', (event.target as HTMLElement).innerText)">{{ resume.phone }}</p>
      <p class="editable-text text-dark" :contenteditable="editable" @input="event => updateText('email', (event.target as HTMLElement).innerText)">{{ resume.email }}</p>
      <p>
        <span class="editable-text text-dark" :contenteditable="editable" @input="event => updateText('city', (event.target as HTMLElement).innerText)">{{ resume.city }}</span>,
        <span class="editable-text text-dark" :contenteditable="editable" @input="event => updateText('country', (event.target as HTMLElement).innerText)">{{ resume.country }}</span>
      </p>

      <h3 class="text-dark" :style="headingStyle">Compétences</h3>
      <ul>
        <li v-for="(skill, index) in resume.skills" :key="skill.name" class="editable-text text-dark" :contenteditable="editable" @input="event => updateText(`skills.${index}.name`, (event.target as HTMLElement).innerText)">{{ skill.name }}</li>
      </ul>
      <section
        v-for="section in asideSections"
        :key="`aside-${section.key}`"
        class="cv-section resume-section-hoverable mt-4"
      >
        <ResumeSectionLanguage
          v-if="section.key === 'language'"
          :resume="resume"
          :editable="editable"
          :variant="section.variant || getSectionBindings('language').variant"
          :toolbar-enabled="true"
          :can-move-up="canMoveUp('language')"
          :can-move-down="canMoveDown('language')"
          :layout-density="getSectionBindings('language').layoutDensity"
          :theme-tokens="getSectionBindings('language').themeTokens"
          :title="sectionHeadingByKey.language"
          @add-item="() => emit('add-item', 'language')"
          @change-variant="(_, variant) => emit('change-variant', 'language', variant)"
          @move-section="(_, direction) => emit('move-section', 'language', direction)"
        />
      </section>
    </aside>

    <main>
      <header>
        <h1>
          <span class="editable-text text-dark" :contenteditable="editable" @input="event => updateText('firstName', (event.target as HTMLElement).innerText)">{{ resume.firstName }}</span>
          <span class="editable-text text-dark" :contenteditable="editable" @input="event => updateText('lastName', (event.target as HTMLElement).innerText)">{{ resume.lastName }}</span>
        </h1>
        <p class="editable-text text-dark" :contenteditable="editable" @input="event => updateText('role', (event.target as HTMLElement).innerText)">{{ resume.role }}</p>
      </header>

      <section v-for="section in mainSections" :key="section.key">
        <div class="cv-section resume-section-hoverable" tabindex="-1">
          <ResumeSectionExperience
            v-if="section.key === 'experience'"
            :resume="resume"
            :editable="editable"
            :variant="section.variant || getSectionBindings('experience').variant"
            :toolbar-enabled="true"
            :can-move-up="canMoveUp('experience')"
            :can-move-down="canMoveDown('experience')"
            :layout-density="getSectionBindings('experience').layoutDensity"
            :theme-tokens="getSectionBindings('experience').themeTokens"
            :title="sectionHeadingByKey.experience"
            @add-item="() => emit('add-item', 'experience')"
            @change-variant="(_, variant) => emit('change-variant', 'experience', variant)"
            @move-section="(_, direction) => emit('move-section', 'experience', direction)"
          />
          <ResumeSectionEducation
            v-else-if="section.key === 'education'"
            :resume="resume"
            :editable="editable"
            :variant="section.variant || getSectionBindings('education').variant"
            :toolbar-enabled="true"
            :can-move-up="canMoveUp('education')"
            :can-move-down="canMoveDown('education')"
            :layout-density="getSectionBindings('education').layoutDensity"
            :theme-tokens="getSectionBindings('education').themeTokens"
            :title="sectionHeadingByKey.education"
            @add-item="() => emit('add-item', 'education')"
            @change-variant="(_, variant) => emit('change-variant', 'education', variant)"
            @move-section="(_, direction) => emit('move-section', 'education', direction)"
          />
          <ResumeSectionProject
            v-else
            :resume="resume"
            :editable="editable"
            :variant="section.variant || getSectionBindings('project').variant"
            :toolbar-enabled="true"
            :can-move-up="canMoveUp('project')"
            :can-move-down="canMoveDown('project')"
            :layout-density="getSectionBindings('project').layoutDensity"
            :theme-tokens="getSectionBindings('project').themeTokens"
            :title="sectionHeadingByKey.project"
            @add-item="() => emit('add-item', 'project')"
            @change-variant="(_, variant) => emit('change-variant', 'project', variant)"
            @move-section="(_, direction) => emit('move-section', 'project', direction)"
          />
        </div>
      </section>
    </main>
  </div>
</template>

<style scoped>
/* Theme convention: use only var(--cv-sidebar), var(--cv-accent), var(--cv-page) (+ color-mix). No hardcoded theme colors. */
.terra-template { font-family: var(--cv-font-family, 'Inter', 'Segoe UI', Arial, sans-serif); font-style: var(--cv-font-style, normal); font-weight: var(--cv-font-weight, 400); min-height: calc(100vh - 80px); display: grid; grid-template-columns: 270px 1fr; background: var(--cv-page); border-radius: var(--cv-radius, 14px); overflow: hidden; }
aside { background: color-mix(in srgb, var(--cv-sidebar) 18%, var(--cv-page)); padding: 28px 20px; }
.terra-photo { border: 6px solid color-mix(in srgb, var(--cv-page) 96%, white); box-shadow: 0 10px 20px color-mix(in srgb, var(--cv-sidebar) 16%, transparent); }
aside h3 { margin: 18px 0 8px; padding: 8px;  font-size: .88rem; text-transform: uppercase; letter-spacing: .07em; }
aside ul { padding-left: 16px; }
main { padding: 28px 34px; background: var(--cv-gradient-terra-main, linear-gradient(165deg, color-mix(in srgb, var(--cv-accent) 65%, var(--cv-sidebar)) 0 14%, var(--cv-page) 14%)); }
header h1 { color: var(--cv-title); font-size: 2.5rem; line-height: 1; margin-bottom: 6px; }
header p { color: color-mix(in srgb, var(--cv-accent) 72%, var(--cv-sidebar)); margin-bottom: 18px; }
h2 { color: var(--cv-title); border-top: 1px solid color-mix(in srgb, var(--cv-accent) 24%, var(--cv-page)); padding-top: 12px; margin-bottom: 12px; }
article { margin-bottom: 14px; }
.cv-section { position: relative; }
.period { color: var(--cv-secondary); /* Intentional neutral gray metadata. */ font-size: .8rem; }
.editable-text[contenteditable='true'] { outline: 1px dashed transparent; border-radius: 4px; transition: outline-color .2s ease; }
.editable-text[contenteditable='true']:hover,
.editable-text[contenteditable='true']:focus { outline-color: color-mix(in srgb, var(--cv-accent) 45%, transparent); }
@media (max-width:1120px){ .terra-template{ grid-template-columns:1fr; } }
</style>
