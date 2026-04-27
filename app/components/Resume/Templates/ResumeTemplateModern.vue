<script setup lang="ts">
import ResumeSectionExperience from '~/components/Resume/Sections/ResumeSectionExperience.vue'
import ResumeSectionEducation from '~/components/Resume/Sections/ResumeSectionEducation.vue'
import ResumeSectionLanguage from '~/components/Resume/Sections/ResumeSectionLanguage.vue'
import ResumeSectionProject from '~/components/Resume/Sections/ResumeSectionProject.vue'
import { RESUME_SECTION_DESIGN_PRESETS, type ResumeSectionDesignPreset } from '~/constants/resumeSectionDesign'

type SectionKey = 'experience' | 'education' | 'language' | 'project'
type SectionLayoutEntry = { key: SectionKey; label: string; variant: string; region: 'main' | 'aside' }

const props = withDefaults(defineProps<{ resume: any; showPhoto?: boolean; editable?: boolean; onPhotoClick?: () => void; sectionLayout?: SectionLayoutEntry[] }>(), {
  showPhoto: false,
  editable: false,
  onPhotoClick: undefined,
  sectionLayout: () => [],
})
const emit = defineEmits<{
  (event: 'add-item', sectionKey: SectionKey): void
  (event: 'change-variant', sectionKey: SectionKey, variant: string): void
  (event: 'move-section', sectionKey: SectionKey, direction: 'up' | 'down'): void
}>()

const sectionVariantOptions: Record<SectionKey, { label: string; value: string }[]> = {
  experience: [{ label: 'Detailed', value: 'detailed' }, { label: 'Bullets', value: 'bullets' }, { label: 'Compact', value: 'compact' }],
  education: [{ label: 'Classic', value: 'classic' }, { label: 'Timeline', value: 'timeline' }, { label: 'Two columns', value: 'two-column' }],
  language: [{ label: 'Text level', value: 'text-level' }, { label: 'Stars', value: 'stars' }, { label: 'Progress', value: 'progress' }],
  project: [{ label: 'List', value: 'list' }, { label: 'Cards', value: 'cards' }, { label: 'Two columns', value: 'two-column' }],
}
const defaultSectionLayout: SectionLayoutEntry[] = [
  { key: 'experience', label: 'Expérience', variant: 'detailed', region: 'main' },
  { key: 'education', label: 'Education', variant: 'classic', region: 'main' },
  { key: 'language', label: 'Language', variant: 'text-level', region: 'aside' },
  { key: 'project', label: 'Project', variant: 'list', region: 'main' },
]
const normalizedSectionLayout = computed<SectionLayoutEntry[]>(() => (
  props.sectionLayout.length
    ? props.sectionLayout
    : defaultSectionLayout
))
const mainSections = computed(() => normalizedSectionLayout.value.filter(section => section.region === 'main'))
const asideSections = computed(() => normalizedSectionLayout.value.filter(section => section.region === 'aside'))
function currentVariant(sectionKey: SectionKey) {
  return normalizedSectionLayout.value.find(section => section.key === sectionKey)?.variant
    ?? getSectionBindings(sectionKey).variant
    ?? sectionVariantOptions[sectionKey][0]?.value
}
function canMoveUp(sectionKey: SectionKey) {
  const targetSection = normalizedSectionLayout.value.find(section => section.key === sectionKey)
  if (!targetSection) return false
  const regionSections = normalizedSectionLayout.value.filter(section => section.region === targetSection.region)
  return regionSections.findIndex(section => section.key === sectionKey) > 0
}
function canMoveDown(sectionKey: SectionKey) {
  const targetSection = normalizedSectionLayout.value.find(section => section.key === sectionKey)
  if (!targetSection) return false
  const regionSections = normalizedSectionLayout.value.filter(section => section.region === targetSection.region)
  const index = regionSections.findIndex(section => section.key === sectionKey)
  return index > -1 && index < regionSections.length - 1
}

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

const sectionDesignPresets = RESUME_SECTION_DESIGN_PRESETS.modern
function mapPresetToThemeTokens(preset: ResumeSectionDesignPreset) {
  const spacingByDensity = {
    compact: '8px',
    normal: '12px',
    spacious: '16px',
  } as const
  const headingByStyle = {
    underline: { '--rs-heading-border-bottom': '1px solid color-mix(in srgb, var(--cv-accent) 24%, transparent)' },
    badge: { '--rs-heading-bg': 'color-mix(in srgb, var(--cv-accent) 15%, white)', '--rs-heading-padding': '3px 10px', '--rs-heading-radius': '999px' },
    minimal: {},
  } as const
  const separatorByStyle = {
    none: 'none',
    line: '1px solid color-mix(in srgb, var(--cv-accent) 14%, transparent)',
    thick: '2px solid color-mix(in srgb, var(--cv-accent) 24%, transparent)',
  } as const
  const cardByStyle = {
    flat: {},
    soft: { '--rs-card-bg': 'color-mix(in srgb, var(--cv-accent) 8%, white)', '--rs-card-padding': '10px 12px', '--rs-card-radius': '10px' },
    outlined: { '--rs-card-border': '1px solid color-mix(in srgb, var(--cv-accent) 20%, transparent)', '--rs-card-padding': '10px 12px', '--rs-card-radius': '10px' },
  } as const
  const accentByStyle = {
    dot: { '--rs-marker-size': '7px', '--rs-marker-radius': '999px' },
    bar: { '--rs-marker-height': '14px', '--rs-marker-width': '3px', '--rs-marker-radius': '3px' },
    'left-border': { '--rs-entry-border-left': '2px solid color-mix(in srgb, var(--cv-accent) 32%, transparent)', '--rs-entry-padding-left': '10px' },
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
  return {
    variant: preset.variant,
    layoutDensity: preset.spacingDensity,
    themeTokens: mapPresetToThemeTokens(preset),
  }
}
</script>

<template>
  <div class="modern-template cv-template-base text-dark">
    <header class="modern-header">
      <v-avatar v-if="showPhoto && resume.photoUrl" size="82" class="mb-3 modern-avatar" @click="onPhotoClick?.()">
        <v-img :src="resume.photoUrl" cover />
      </v-avatar>
      <h1>
        <span class="editable-text" :contenteditable="editable" @input="event => updateText('firstName', (event.target as HTMLElement).innerText)">{{ resume.firstName }}</span>
        <span class="editable-text" :contenteditable="editable" @input="event => updateText('lastName', (event.target as HTMLElement).innerText)">{{ resume.lastName }}</span>
      </h1>
      <p class="editable-text" :contenteditable="editable" @input="event => updateText('role', (event.target as HTMLElement).innerText)">{{ resume.role }}</p>
      <p>
        <span class="editable-text" :contenteditable="editable" @input="event => updateText('city', (event.target as HTMLElement).innerText)">{{ resume.city }}</span>,
        <span class="editable-text" :contenteditable="editable" @input="event => updateText('country', (event.target as HTMLElement).innerText)">{{ resume.country }}</span>
        · <span class="editable-text" :contenteditable="editable" @input="event => updateText('phone', (event.target as HTMLElement).innerText)">{{ resume.phone }}</span>
        · <span class="editable-text" :contenteditable="editable" @input="event => updateText('email', (event.target as HTMLElement).innerText)">{{ resume.email }}</span>
      </p>
    </header>

    <div class="modern-grid">
      <aside class="cv-sidebar-surface">
        <section>
          <h3>Skills</h3>
          <ul class="bars">
            <li v-for="(skill, index) in resume.skills" :key="skill.name" class="text-dark">
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`skills.${index}.name`, (event.target as HTMLElement).innerText)">{{ skill.name }}</span>
              <div><i :style="{ width: `${skill.level}%` }" /></div>
            </li>
          </ul>
        </section>
        <section
          v-for="section in asideSections"
          :key="`aside-${section.key}`"
          class="resume-section-hoverable resume-section-block"
        >
          <ResumeSectionLanguage
            v-if="section.key === 'language'"
            :resume="resume"
            :editable="editable"
            :variant="currentVariant('language')"
            :toolbar-enabled="true"
            :can-move-up="canMoveUp('language')"
            :can-move-down="canMoveDown('language')"
            :layout-density="getSectionBindings('language').layoutDensity"
            :theme-tokens="getSectionBindings('language').themeTokens"
            title="Languages"
            @add-item="() => emit('add-item', 'language')"
            @change-variant="(_, variant) => emit('change-variant', 'language', variant)"
            @move-section="(_, direction) => emit('move-section', 'language', direction)"
          />
        </section>
      </aside>

      <main>
        <section>
          <h2 class="cv-heading-section">Profile</h2>
          <p class="text-dark editable-text" :contenteditable="editable" @input="event => updateText('profile', (event.target as HTMLElement).innerText)">{{ resume.profile || 'Add a professional summary from the Edit tab.' }}</p>
        </section>
        <section
          v-for="section in mainSections"
          :key="`main-${section.key}`"
          class="resume-section-hoverable resume-section-block"
        >
          <ResumeSectionExperience
            v-if="section.key === 'experience'"
            :resume="resume"
            :editable="editable"
            :variant="currentVariant('experience')"
            :toolbar-enabled="true"
            :can-move-up="canMoveUp('experience')"
            :can-move-down="canMoveDown('experience')"
            :layout-density="getSectionBindings('experience').layoutDensity"
            :theme-tokens="getSectionBindings('experience').themeTokens"
            title="Employment History"
            @add-item="() => emit('add-item', 'experience')"
            @change-variant="(_, variant) => emit('change-variant', 'experience', variant)"
            @move-section="(_, direction) => emit('move-section', 'experience', direction)"
          />
          <ResumeSectionEducation
            v-else-if="section.key === 'education'"
            :resume="resume"
            :editable="editable"
            :variant="currentVariant('education')"
            :toolbar-enabled="true"
            :can-move-up="canMoveUp('education')"
            :can-move-down="canMoveDown('education')"
            :layout-density="getSectionBindings('education').layoutDensity"
            :theme-tokens="getSectionBindings('education').themeTokens"
            title="Education"
            @add-item="() => emit('add-item', 'education')"
            @change-variant="(_, variant) => emit('change-variant', 'education', variant)"
            @move-section="(_, direction) => emit('move-section', 'education', direction)"
          />
          <ResumeSectionProject
            v-else-if="section.key === 'project'"
            :resume="resume"
            :editable="editable"
            :variant="currentVariant('project')"
            :toolbar-enabled="true"
            :can-move-up="canMoveUp('project')"
            :can-move-down="canMoveDown('project')"
            :layout-density="getSectionBindings('project').layoutDensity"
            :theme-tokens="getSectionBindings('project').themeTokens"
            title="Projects"
            @add-item="() => emit('add-item', 'project')"
            @change-variant="(_, variant) => emit('change-variant', 'project', variant)"
            @move-section="(_, direction) => emit('move-section', 'project', direction)"
          />
        </section>
        <section>
          <h2 class="cv-heading-section">Certifications</h2>
          <article v-for="(course, index) in resume.courses" :key="`course-${index}`" class="entry text-dark">
            <h4 class="text-dark">
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`courses.${index}.title`, (event.target as HTMLElement).innerText)">{{ course.title }}</span>
            </h4>
            <p class="dates">
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`courses.${index}.school`, (event.target as HTMLElement).innerText)">{{ course.school }}</span>
              ·
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`courses.${index}.start`, (event.target as HTMLElement).innerText)">{{ course.start }}</span>
              -
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`courses.${index}.end`, (event.target as HTMLElement).innerText)">{{ course.end }}</span>
            </p>
          </article>
        </section>
        <section>
          <h2 class="cv-heading-section">References</h2>
          <article v-for="(reference, index) in resume.references" :key="`reference-${index}`" class="entry text-dark">
            <h4 class="text-dark editable-text" :contenteditable="editable" @input="event => updateText(`references.${index}.name`, (event.target as HTMLElement).innerText)">{{ reference.name }}</h4>
            <p class="text-dark">
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`references.${index}.company`, (event.target as HTMLElement).innerText)">{{ reference.company }}</span>
              ·
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`references.${index}.email`, (event.target as HTMLElement).innerText)">{{ reference.email }}</span>
              ·
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`references.${index}.phone`, (event.target as HTMLElement).innerText)">{{ reference.phone }}</span>
            </p>
          </article>
        </section>
      </main>
    </div>
  </div>
</template>

<style scoped>
/* Theme convention: use only var(--cv-sidebar), var(--cv-accent), var(--cv-page) (+ color-mix). No hardcoded theme colors. */
.modern-template { font-family: var(--cv-font-family, 'Inter', 'Segoe UI', Arial, sans-serif); font-style: var(--cv-font-style, normal); font-weight: var(--cv-font-weight, 400); min-height: calc(100vh - 80px); border-radius: var(--cv-radius, 14px); overflow:hidden; background: var(--cv-page); }
.modern-header { background: color-mix(in srgb, var(--cv-accent) 85%, white); color: color-mix(in srgb, var(--cv-sidebar) 78%, black); padding:26px 30px; }
.modern-avatar { cursor: zoom-in; }
.modern-header h1 { font-size:2.2rem; margin-bottom:4px; }
.modern-grid { display:grid; grid-template-columns: 280px 1fr; }
aside { background:color-mix(in srgb, var(--cv-sidebar) 12%, var(--cv-page)); padding:22px; }
main { padding:24px; }
.resume-section-block { position: relative; }
h2,h3 { color:var(--cv-title); margin-bottom:8px; }
.bars { list-style:none; padding:0; }
.bars li { margin-bottom:10px; }
.bars div { height:4px; background:color-mix(in srgb, var(--cv-accent) 22%, var(--cv-page)); margin-top:4px; }
.bars i { display:block; height:4px; background:var(--cv-accent); }
.dates { font-size:.75rem; color:var(--cv-secondary); /* Intentional neutral gray for dates. */ text-transform: uppercase; }
.editable-text[contenteditable='true'] { outline: 1px dashed transparent; border-radius: 4px; transition: outline-color .2s ease; }
.editable-text[contenteditable='true']:hover,
.editable-text[contenteditable='true']:focus { outline-color: color-mix(in srgb, var(--cv-accent) 50%, transparent); }
@media (max-width:1120px){ .modern-grid{ grid-template-columns: 1fr; } }
</style>
