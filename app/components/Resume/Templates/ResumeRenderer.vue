<script setup lang="ts">
import ResumeSectionExperience from '~/components/Resume/Sections/ResumeSectionExperience.vue'
import ResumeSectionEducation from '~/components/Resume/Sections/ResumeSectionEducation.vue'
import ResumeSectionLanguage from '~/components/Resume/Sections/ResumeSectionLanguage.vue'
import ResumeSectionProject from '~/components/Resume/Sections/ResumeSectionProject.vue'
import type { ResumeRendererLayoutEntry, ResumeSectionKey, ResumeTemplateSkin } from '~/constants/resumeTemplateSkins'

type SectionLayoutVariant = {
  experience: 'detailed' | 'bullets' | 'compact'
  education: 'classic' | 'timeline' | 'two-column'
  language: 'classic' | 'text-level' | 'stars' | 'progress'
  project: 'classic' | 'list' | 'cards' | 'two-column'
}

type SectionLayoutEntry<K extends ResumeSectionKey = ResumeSectionKey> = ResumeRendererLayoutEntry & {
  key: K
  variant: SectionLayoutVariant[K]
}

const props = withDefaults(defineProps<{
  resume: any
  editable?: boolean
  showPhoto?: boolean
  onPhotoClick?: () => void
  sectionLayout?: SectionLayoutEntry[]
  sectionVariants?: Partial<Record<ResumeSectionKey, string>>
  themeTokens?: Record<string, string>
  templateSkin: ResumeTemplateSkin
}>(), {
  editable: false,
  showPhoto: true,
  onPhotoClick: undefined,
  sectionLayout: () => [],
  sectionVariants: () => ({}),
  themeTokens: () => ({}),
})

const emit = defineEmits<{
  (event: 'add-item', sectionKey: ResumeSectionKey): void
  (event: 'change-variant', sectionKey: ResumeSectionKey, variant: string): void
  (event: 'move-section', sectionKey: ResumeSectionKey, direction: 'up' | 'down'): void
}>()

const componentBySectionKey = {
  experience: ResumeSectionExperience,
  education: ResumeSectionEducation,
  language: ResumeSectionLanguage,
  project: ResumeSectionProject,
} as const

const normalizedSectionLayout = computed<SectionLayoutEntry[]>(() => {
  if (props.sectionLayout.length) return props.sectionLayout
  return props.templateSkin.defaultSectionLayout.map((entry) => ({ ...entry, variant: fallbackVariant(entry.key) })) as SectionLayoutEntry[]
})

const mainSections = computed(() => normalizedSectionLayout.value.filter(section => section.region === 'main'))
const asideSections = computed(() => normalizedSectionLayout.value.filter(section => section.region === 'aside'))

function fallbackVariant(sectionKey: ResumeSectionKey): string {
  if (sectionKey === 'experience') return 'detailed'
  if (sectionKey === 'education') return 'classic'
  if (sectionKey === 'language') return 'text-level'
  return 'list'
}

function sectionVariant(section: SectionLayoutEntry) {
  return props.sectionVariants[section.key] ?? section.variant ?? fallbackVariant(section.key)
}

function canMove(sectionKey: ResumeSectionKey, direction: 'up' | 'down') {
  const target = normalizedSectionLayout.value.find(section => section.key === sectionKey)
  if (!target) return false
  const regionSections = normalizedSectionLayout.value.filter(section => section.region === target.region)
  const index = regionSections.findIndex(section => section.key === sectionKey)
  if (index < 0) return false
  return direction === 'up' ? index > 0 : index < regionSections.length - 1
}

function mergedSectionTokens(sectionKey: ResumeSectionKey) {
  return {
    ...props.themeTokens,
    ...(props.templateSkin.themeTokens ?? {}),
    ...(props.templateSkin.sectionTokens?.[sectionKey] ?? {}),
  }
}


function onSectionAddItem(sectionKey: ResumeSectionKey) {
  emit('add-item', sectionKey)
}

function onSectionVariantChange(sectionKey: ResumeSectionKey, variant: string) {
  emit('change-variant', sectionKey, variant)
}

function onSectionMove(sectionKey: ResumeSectionKey, direction: 'up' | 'down') {
  emit('move-section', sectionKey, direction)
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
</script>

<template>
  <article :class="templateSkin.rootClass" :style="themeTokens">
    <header class="resume-skin__header">
      <div>
        <h1>
          <span class="editable-text" :contenteditable="editable" @input="event => updateText('firstName', (event.target as HTMLElement).innerText)">{{ resume.firstName }}</span>
          <span class="editable-text" :contenteditable="editable" @input="event => updateText('lastName', (event.target as HTMLElement).innerText)">{{ resume.lastName }}</span>
        </h1>
        <p class="editable-text" :contenteditable="editable" @input="event => updateText('role', (event.target as HTMLElement).innerText)">{{ resume.role }}</p>
        <p v-if="templateSkin.showContactInHeader" class="resume-skin__header-contact">
          <span class="editable-text" :contenteditable="editable" @input="event => updateText('city', (event.target as HTMLElement).innerText)">{{ resume.city }}</span>
          ·
          <span class="editable-text" :contenteditable="editable" @input="event => updateText('email', (event.target as HTMLElement).innerText)">{{ resume.email }}</span>
          ·
          <span class="editable-text" :contenteditable="editable" @input="event => updateText('phone', (event.target as HTMLElement).innerText)">{{ resume.phone }}</span>
        </p>
      </div>
      <v-avatar v-if="showPhoto && resume.photoUrl" size="96" class="resume-skin__avatar" @click="onPhotoClick?.()">
        <v-img :src="resume.photoUrl" cover />
      </v-avatar>
    </header>

    <div :class="templateSkin.wrapperClass">
      <aside :class="templateSkin.asideClass">
        <section v-if="templateSkin.showContactInAside">
          <h3 class="cv-heading-section">Contact</h3>
          <p class="editable-text" :contenteditable="editable" @input="event => updateText('city', (event.target as HTMLElement).innerText)">{{ resume.city }}, {{ resume.country }}</p>
          <p class="editable-text" :contenteditable="editable" @input="event => updateText('phone', (event.target as HTMLElement).innerText)">{{ resume.phone }}</p>
          <p class="editable-text" :contenteditable="editable" @input="event => updateText('email', (event.target as HTMLElement).innerText)">{{ resume.email }}</p>
        </section>

        <section v-if="templateSkin.showProfileInAside">
          <h3 class="cv-heading-section">Profile</h3>
          <p class="editable-text" :contenteditable="editable" @input="event => updateText('profile', (event.target as HTMLElement).innerText)">{{ resume.profile }}</p>
        </section>

        <section v-if="templateSkin.showSkillsInAside">
          <h3 class="cv-heading-section">Skills</h3>
          <ul class="resume-skin__skills">
            <li v-for="(skill, index) in resume.skills" :key="`${skill.name}-${index}`">
              <span class="editable-text" :contenteditable="editable" @input="event => updateText(`skills.${index}.name`, (event.target as HTMLElement).innerText)">{{ skill.name }}</span>
              <div class="progress"><i :style="{ width: `${skill.level}%` }" /></div>
            </li>
          </ul>
        </section>

        <component
          :is="componentBySectionKey[section.key]"
          v-for="section in asideSections"
          :key="`aside-${section.key}`"
          :resume="resume"
          :editable="editable"
          :variant="sectionVariant(section)"
          :title="templateSkin.sectionTitles?.[section.key]"
          :toolbar-enabled="true"
          :can-move-up="canMove(section.key, 'up')"
          :can-move-down="canMove(section.key, 'down')"
          :theme-tokens="mergedSectionTokens(section.key)"
          @add-item="onSectionAddItem"
          @change-variant="onSectionVariantChange"
          @move-section="onSectionMove"
        />
      </aside>

      <main :class="templateSkin.mainClass">
        <section v-if="templateSkin.showProfileInMain">
          <h2 class="cv-heading-section">Profile</h2>
          <p class="editable-text" :contenteditable="editable" @input="event => updateText('profile', (event.target as HTMLElement).innerText)">{{ resume.profile }}</p>
        </section>

        <component
          :is="componentBySectionKey[section.key]"
          v-for="section in mainSections"
          :key="`main-${section.key}`"
          :resume="resume"
          :editable="editable"
          :variant="sectionVariant(section)"
          :title="templateSkin.sectionTitles?.[section.key]"
          :toolbar-enabled="true"
          :can-move-up="canMove(section.key, 'up')"
          :can-move-down="canMove(section.key, 'down')"
          :theme-tokens="mergedSectionTokens(section.key)"
          @add-item="onSectionAddItem"
          @change-variant="onSectionVariantChange"
          @move-section="onSectionMove"
        />
      </main>
    </div>
  </article>
</template>

<style scoped>
.resume-skin { padding: 18px; }
.resume-skin__layout { display: grid; grid-template-columns: 280px 1fr; gap: 20px; }
.resume-skin__header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.resume-skin__header-contact { font-size: .9rem; opacity: .8; }
.resume-skin__skills { list-style: none; padding: 0; }
.progress { height: 4px; background: color-mix(in srgb, var(--cv-accent) 22%, var(--cv-page)); margin-top: 4px; }
.progress i { display: block; height: 100%; background: var(--cv-accent); }
.resume-skin__main,
.resume-skin__aside { display: grid; gap: 14px; }
</style>
