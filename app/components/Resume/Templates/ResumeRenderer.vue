<script setup lang="ts">
import SectionRenderer from '~/components/Resume/Sections/SectionRenderer.vue'
import SectionToolbar from '~/components/Resume/SectionToolbar.vue'
import type {
  ResumeSectionKey,
  ResumeTemplateSkin,
} from '~/constants/resumeTemplateSkins'

type SectionLayoutVariant = {
  experience: 'detailed' | 'bullets' | 'compact'
  education: 'classic' | 'timeline' | 'two-column'
  language: 'classic' | 'text-level' | 'stars' | 'progress'
  project: 'classic' | 'list' | 'cards' | 'two-column'
  skill: 'classic'
  reference: 'classic'
  hobby: 'classic'
  certification: 'classic'
}

type ResumeSectionActionKey =
  | ResumeSectionKey
  | 'skill'
  | 'course'
  | 'reference'
  | 'hobby'
  | 'certification'
type ResumeSectionLayoutKey = Exclude<ResumeSectionActionKey, 'course'>

type PhotoShapeOption = {
  label: string
  value: string
  icon?: string
}

type SectionLayoutEntry<
  K extends ResumeSectionLayoutKey = ResumeSectionLayoutKey,
> = {
  key: K
  region: 'main' | 'aside'
  order: number
  variant: SectionLayoutVariant[K]
}

const props = withDefaults(
  defineProps<{
    resume: any
    editable?: boolean
    showPhoto?: boolean
    onPhotoClick?: () => void
    photoShapeOptions?: PhotoShapeOption[]
    selectedPhotoShape?: string
    onPhotoShapeSelect?: (shape: string) => void
    sectionLayout?: SectionLayoutEntry[]
    sectionVariants?: Partial<Record<ResumeSectionLayoutKey, string>>
    themeTokens?: Record<string, string>
    templateSkin: ResumeTemplateSkin
  }>(),
  {
    editable: false,
    showPhoto: true,
    onPhotoClick: undefined,
    photoShapeOptions: () => [],
    selectedPhotoShape: 'circle',
    onPhotoShapeSelect: undefined,
    sectionLayout: () => [],
    sectionVariants: () => ({}),
    themeTokens: () => ({}),
  },
)

const emit = defineEmits<{
  (event: 'add-item', sectionKey: ResumeSectionActionKey): void
  (
    event: 'change-variant',
    sectionKey: ResumeSectionActionKey,
    variant: string,
  ): void
  (
    event: 'move-section',
    sectionKey: ResumeSectionActionKey,
    direction: 'up' | 'down',
  ): void
}>()

const normalizedSectionLayout = computed<SectionLayoutEntry[]>(() => {
  if (props.sectionLayout.length) return props.sectionLayout
  return props.templateSkin.defaultSectionLayout.map((entry) => ({
    ...entry,
    variant: fallbackVariant(entry.key),
  })) as SectionLayoutEntry[]
})

type RenderableSectionLayoutEntry = SectionLayoutEntry<ResumeSectionKey>
const renderableSections = computed<RenderableSectionLayoutEntry[]>(
  () =>
    normalizedSectionLayout.value.filter(
      (section) =>
        section.key === 'experience' ||
        section.key === 'education' ||
        section.key === 'language' ||
        section.key === 'project',
    ) as RenderableSectionLayoutEntry[],
)

const mainSections = computed(() =>
  renderableSections.value.filter((section) => section.region === 'main'),
)
const asideSections = computed(() =>
  renderableSections.value.filter((section) => section.region === 'aside'),
)
const photoControlsVisible = ref(false)
const hasRenderedAvatar = computed(() =>
  Boolean(props.showPhoto && props.resume?.photoUrl),
)

function fallbackVariant(sectionKey: ResumeSectionLayoutKey): string {
  if (sectionKey === 'experience') return 'detailed'
  if (sectionKey === 'education') return 'classic'
  if (sectionKey === 'language') return 'text-level'
  if (
    sectionKey === 'skill' ||
    sectionKey === 'reference' ||
    sectionKey === 'hobby' ||
    sectionKey === 'certification'
  )
    return 'classic'
  return 'list'
}

function sectionVariant(section: SectionLayoutEntry) {
  return (
    props.sectionVariants[section.key] ??
    section.variant ??
    fallbackVariant(section.key)
  )
}

function canMove(sectionKey: ResumeSectionLayoutKey, direction: 'up' | 'down') {
  const target = normalizedSectionLayout.value.find(
    (section) => section.key === sectionKey,
  )
  if (!target) return false
  const regionSections = normalizedSectionLayout.value.filter(
    (section) => section.region === target.region,
  )
  const index = regionSections.findIndex(
    (section) => section.key === sectionKey,
  )
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

function onSectionAddItem(sectionKey: ResumeSectionActionKey) {
  emit('add-item', sectionKey)
}

function onSectionVariantChange(
  sectionKey: ResumeSectionActionKey,
  variant: string,
) {
  emit('change-variant', sectionKey, variant)
}

function onSectionMove(
  sectionKey: ResumeSectionActionKey,
  direction: 'up' | 'down',
) {
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

function onPhotoFrameFocusOut(event: FocusEvent) {
  const currentTarget = event.currentTarget as HTMLElement | null
  const relatedTarget = event.relatedTarget as Node | null
  if (currentTarget?.contains(relatedTarget)) return
  photoControlsVisible.value = false
}
</script>

<template>
  <article :class="templateSkin.rootClass" :style="themeTokens">
    <header class="resume-skin__header">
      <div>
        <h1>
          <span
            class="editable-text"
            :contenteditable="editable"
            @input="
              (event) =>
                updateText('firstName', (event.target as HTMLElement).innerText)
            "
            >{{ resume.firstName }}</span
          >
          <span
            class="editable-text"
            :contenteditable="editable"
            @input="
              (event) =>
                updateText('lastName', (event.target as HTMLElement).innerText)
            "
            >{{ resume.lastName }}</span
          >
        </h1>
        <p
          class="editable-text"
          :contenteditable="editable"
          @input="
            (event) =>
              updateText('role', (event.target as HTMLElement).innerText)
          "
        >
          {{ resume.role }}
        </p>
        <p
          v-if="templateSkin.showContactInHeader"
          class="resume-skin__header-contact"
        >
          <span
            class="editable-text"
            :contenteditable="editable"
            @input="
              (event) =>
                updateText('city', (event.target as HTMLElement).innerText)
            "
            >{{ resume.city }}</span
          >
          ·
          <span
            class="editable-text"
            :contenteditable="editable"
            @input="
              (event) =>
                updateText('email', (event.target as HTMLElement).innerText)
            "
            >{{ resume.email }}</span
          >
          ·
          <span
            class="editable-text"
            :contenteditable="editable"
            @input="
              (event) =>
                updateText('phone', (event.target as HTMLElement).innerText)
            "
            >{{ resume.phone }}</span
          >
        </p>
      </div>
      <div
        v-if="hasRenderedAvatar"
        class="photo-frame"
        tabindex="0"
        @mouseenter="photoControlsVisible = true"
        @mouseleave="photoControlsVisible = false"
        @focusin="photoControlsVisible = true"
        @focusout="onPhotoFrameFocusOut"
      >
        <div
          v-if="photoShapeOptions.length"
          class="photo-shape-picker"
          :class="{
            'photo-shape-picker--visible':
              photoControlsVisible && hasRenderedAvatar,
          }"
        >
          <v-btn
            v-for="shape in photoShapeOptions"
            :key="`preview-photo-shape-${shape.value}`"
            size="x-small"
            variant="tonal"
            :color="selectedPhotoShape === shape.value ? 'primary' : undefined"
            @click="onPhotoShapeSelect?.(shape.value)"
          >
            {{ shape.icon ?? shape.label }}
          </v-btn>
        </div>
        <v-avatar
          size="96"
          class="resume-skin__avatar"
          @click="onPhotoClick?.()"
        >
          <v-img :src="resume.photoUrl" cover />
        </v-avatar>
      </div>
    </header>

    <div :class="templateSkin.wrapperClass">
      <aside :class="templateSkin.asideClass">
        <section v-if="templateSkin.showContactInAside">
          <h3 class="cv-heading-section">Contact</h3>
          <p
            class="editable-text"
            :contenteditable="editable"
            @input="
              (event) =>
                updateText('city', (event.target as HTMLElement).innerText)
            "
          >
            {{ resume.city }}, {{ resume.country }}
          </p>
          <p
            class="editable-text"
            :contenteditable="editable"
            @input="
              (event) =>
                updateText('phone', (event.target as HTMLElement).innerText)
            "
          >
            {{ resume.phone }}
          </p>
          <p
            class="editable-text"
            :contenteditable="editable"
            @input="
              (event) =>
                updateText('email', (event.target as HTMLElement).innerText)
            "
          >
            {{ resume.email }}
          </p>
        </section>

        <section v-if="templateSkin.showProfileInAside">
          <h3 class="cv-heading-section">Profile</h3>
          <p
            class="editable-text"
            :contenteditable="editable"
            @input="
              (event) =>
                updateText('profile', (event.target as HTMLElement).innerText)
            "
          >
            {{ resume.profile }}
          </p>
        </section>

        <section
          v-if="templateSkin.showSkillsInAside"
          class="resume-section-hoverable resume-skin__skills-section"
        >
          <SectionToolbar
            section-key="skill"
            :variants="[{ label: 'Classic', value: 'classic' }]"
            current-variant="classic"
            :can-move-up="canMove('skill', 'up')"
            :can-move-down="canMove('skill', 'down')"
            @add-item="() => emit('add-item', 'skill')"
            @change-variant="
              (_, variant) => emit('change-variant', 'skill', variant)
            "
            @move-up="() => emit('move-section', 'skill', 'up')"
            @move-down="() => emit('move-section', 'skill', 'down')"
          />
          <h3 class="cv-heading-section">Skills</h3>
          <ul class="resume-skin__skills">
            <li
              v-for="(skill, index) in resume.skills"
              :key="`${skill.name}-${index}`"
            >
              <span
                class="editable-text"
                :contenteditable="editable"
                @input="
                  (event) =>
                    updateText(
                      `skills.${index}.name`,
                      (event.target as HTMLElement).innerText,
                    )
                "
                >{{ skill.name }}</span
              >
              <div class="progress">
                <i :style="{ width: `${skill.level}%` }" />
              </div>
            </li>
          </ul>
        </section>

        <SectionRenderer
          v-for="section in asideSections"
          :key="`aside-${section.key}`"
          :section-key="section.key"
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
          <p
            class="editable-text"
            :contenteditable="editable"
            @input="
              (event) =>
                updateText('profile', (event.target as HTMLElement).innerText)
            "
          >
            {{ resume.profile }}
          </p>
        </section>

        <SectionRenderer
          v-for="section in mainSections"
          :key="`main-${section.key}`"
          :section-key="section.key"
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
.resume-skin {
  padding: 18px;
}
.resume-skin__layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 20px;
}
.resume-skin__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.resume-skin__header-contact {
  font-size: 0.9rem;
  opacity: 0.8;
}
.photo-frame {
  position: relative;
  display: inline-flex;
  isolation: isolate;
  z-index: 0;
}

.resume-skin__avatar {
  position: relative;
  z-index: 1;
}

.photo-shape-picker {
  --picker-radius: var(--cv-radius, 14px);
  --picker-border: color-mix(in srgb, var(--cv-accent) 16%, var(--cv-page));
  --picker-surface: color-mix(in srgb, var(--cv-page) 78%, transparent);

  position: absolute;
  top: 8px;
  left: 50%;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-height: 28px;
  padding: 3px;
  border-radius: calc(var(--picker-radius) - 2px);
  border: 1px solid var(--picker-border);
  background: var(--picker-surface);
  backdrop-filter: blur(6px);
  box-shadow: 0 8px 16px color-mix(in srgb, var(--cv-sidebar) 12%, transparent);
  opacity: 0;
  transform: translate(-50%, -8px) scale(0.98);
  pointer-events: none;
  transition:
    opacity 180ms ease,
    transform 200ms ease;
}

.photo-shape-picker--visible {
  opacity: 1;
  transform: translate(-50%, 0) scale(1);
  pointer-events: auto;
}

.photo-shape-picker :deep(.v-btn) {
  width: 24px;
  min-width: 24px;
  height: 24px;
  border-radius: calc(var(--picker-radius) - 6px);
  padding: 0;
}

.photo-shape-picker :deep(.v-btn__content) {
  display: grid;
  place-items: center;
  font-size: 0.72rem;
  line-height: 1;
}
.resume-skin__skills {
  list-style: none;
  padding: 0;
}
.resume-skin__skills-section {
  position: relative;
}
.progress {
  height: 4px;
  background: color-mix(in srgb, var(--cv-accent) 22%, var(--cv-page));
  margin-top: 4px;
}
.progress i {
  display: block;
  height: 100%;
  background: var(--cv-accent);
}
.resume-skin__main,
.resume-skin__aside {
  display: grid;
  gap: 14px;
}
</style>
