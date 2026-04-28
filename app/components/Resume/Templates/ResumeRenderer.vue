<script setup lang="ts">
import SectionRenderer from '~/components/Resume/Sections/SectionRenderer.vue'
import SectionToolbar from '~/components/Resume/SectionToolbar.vue'
import AvatarOverlayControls from '~/components/Resume/Templates/AvatarOverlayControls.vue'
import type {
  ResumeSectionKey,
  ResumeTemplateSkin,
} from '~/constants/resumeTemplateSkins'
import { RESUME_SECTION_ICONS } from '~/constants/resumeSectionIcons'

type SectionLayoutVariant = {
  experience: 'detailed' | 'bullets' | 'compact'
  education: 'classic' | 'timeline' | 'two-column'
  language: 'classic' | 'text-level' | 'stars' | 'progress' | 'flags'
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
    roundedClass?: string
    textStyleClass?: string
    density?: 'compact' | 'comfortable'
    dividerStyle?: 'none' | 'line' | 'thick'
    sidebarWidth?: number
    photoSize?: number
    photoBorderWidth?: number
    photoPosition?: 'left' | 'center' | 'right'
    photoOffsetX?: number
    photoOffsetY?: number
    photoScale?: number
    photoHidden?: boolean
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
    roundedClass: 'radius-md',
    textStyleClass: 'text-style-clean',
    density: 'comfortable',
    dividerStyle: 'line',
    sidebarWidth: 280,
    photoSize: 96,
    photoBorderWidth: 4,
    photoPosition: 'right',
    photoOffsetX: 0,
    photoOffsetY: 0,
    photoScale: 1,
    photoHidden: false,
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
  (event: 'move-photo', direction: 'left' | 'right' | 'up' | 'down'): void
  (event: 'open-photo-picker'): void
  (event: 'update:photo-size' | 'update:photo-border-width', value: number): void
  (event: 'update:photo-position', value: 'left' | 'center' | 'right'): void
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
        section.key === 'project' ||
        section.key === 'hobby' ||
        section.key === 'certification' ||
        section.key === 'reference',
    ) as RenderableSectionLayoutEntry[],
)

const mainSections = computed(() =>
  renderableSections.value.filter((section) => section.region === 'main'),
)
const asideSections = computed(() =>
  renderableSections.value.filter((section) => section.region === 'aside'),
)
const hasRenderedAvatar = computed(() =>
  Boolean(props.showPhoto && props.resume?.photoUrl && !props.photoHidden),
)
const rootDesignClasses = computed(() => [
  props.roundedClass,
  props.textStyleClass,
  `density-${props.density}`,
  `divider-${props.dividerStyle}`,
  `photo-position-${props.photoPosition}`,
])
const layoutStyle = computed(() => ({
  '--resume-sidebar-width': `${props.sidebarWidth}px`,
}))
const avatarStyle = computed(() => ({
  width: `${props.photoSize}px`,
  height: `${props.photoSize}px`,
  borderWidth: `${props.photoBorderWidth}px`,
}))
const avatarImageStyle = computed(() => ({
  transform: `translate(${props.photoOffsetX}px, ${props.photoOffsetY}px) scale(${props.photoScale})`,
  transformOrigin: 'center',
}))
const sectionLayoutDensity = computed<'compact' | 'normal' | 'spacious'>(() =>
  props.density === 'compact' ? 'compact' : 'normal',
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

</script>

<template>
  <article :class="[templateSkin.rootClass, ...rootDesignClasses]" :style="themeTokens">
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
      <div v-if="hasRenderedAvatar" class="photo-frame" tabindex="0">
        <AvatarOverlayControls
          v-if="photoShapeOptions.length"
          :options="photoShapeOptions"
          :selected-value="selectedPhotoShape"
          :photo-size="photoSize"
          :photo-border-width="photoBorderWidth"
          :photo-position="photoPosition"
          @select="onPhotoShapeSelect?.($event)"
          @upload="emit('open-photo-picker')"
          @update:photo-size="emit('update:photo-size', $event)"
          @update:photo-border-width="emit('update:photo-border-width', $event)"
          @update:photo-position="emit('update:photo-position', $event)"
          @move="emit('move-photo', $event)"
        />
        <v-avatar
          class="resume-skin__avatar"
          :style="avatarStyle"
          @click="onPhotoClick?.()"
        >
          <v-img :src="resume.photoUrl" :style="avatarImageStyle" cover />
        </v-avatar>
      </div>
    </header>

    <div :class="templateSkin.wrapperClass" :style="layoutStyle">
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
          :layout-density="sectionLayoutDensity"
          :title="templateSkin.sectionTitles?.[section.key]"
          :toolbar-enabled="true"
          :can-move-up="canMove(section.key, 'up')"
          :can-move-down="canMove(section.key, 'down')"
          :theme-tokens="mergedSectionTokens(section.key)"
          :section-icon="RESUME_SECTION_ICONS[section.key]"
          :show-section-icon="templateSkin.showSectionIcons"
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
          :layout-density="sectionLayoutDensity"
          :title="templateSkin.sectionTitles?.[section.key]"
          :toolbar-enabled="true"
          :can-move-up="canMove(section.key, 'up')"
          :can-move-down="canMove(section.key, 'down')"
          :theme-tokens="mergedSectionTokens(section.key)"
          :section-icon="RESUME_SECTION_ICONS[section.key]"
          :show-section-icon="templateSkin.showSectionIcons"
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
  --cv-space-1: var(--cv-space-1, 4px);
  --cv-space-2: var(--cv-space-2, 8px);
  --cv-space-3: var(--cv-space-3, 12px);
  --cv-space-4: var(--cv-space-4, 16px);
  --cv-space-5: var(--cv-space-5, 20px);
  --cv-space-6: var(--cv-space-6, 24px);
  --cv-space-7: var(--cv-space-7, 28px);
  --cv-space-8: var(--cv-space-8, 32px);
  --cv-space-9: var(--cv-space-9, 36px);
  --cv-border-soft: color-mix(in srgb, var(--cv-secondary) 20%, transparent);
  --cv-border-strong: color-mix(in srgb, var(--cv-accent) 24%, transparent);
  --cv-surface-soft: color-mix(in srgb, var(--cv-page) 78%, transparent);
  --cv-shadow-soft: color-mix(in srgb, var(--cv-sidebar) 12%, transparent);
  --cv-progress-bg: color-mix(in srgb, var(--cv-accent) 22%, var(--cv-page));

  font-family: var(--cv-font-family, 'Inter', 'Segoe UI', Arial, sans-serif);
  font-style: var(--cv-font-style, normal);
  font-weight: var(--cv-font-weight, 400);
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
  border-style: solid;
  border-color: color-mix(in srgb, var(--cv-accent) 28%, var(--cv-page));
}

.photo-frame:hover :deep(.avatar-overlay-controls),
.photo-frame:focus-within :deep(.avatar-overlay-controls) {
  opacity: 1;
  pointer-events: auto;
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
  background: var(--cv-progress-bg);
  margin-top: var(--cv-space-1);
}
.progress i {
  display: block;
  height: 100%;
  background: var(--cv-accent);
}
.resume-skin__main,
.resume-skin__aside {
  display: grid;
  gap: var(--resume-section-gap, var(--cv-space-3));
  padding: var(--resume-column-padding, 0);
}

.resume-skin__layout {
  grid-template-columns: var(--resume-sidebar-width, 280px) minmax(0, 1fr);
  margin-top: var(--resume-header-content-gap, 12px);
}

.density-compact {
  --resume-header-content-gap: 12px;
  --resume-column-padding: 10px;
  --resume-section-gap: 10px;
}

.density-comfortable {
  --resume-header-content-gap: 20px;
  --resume-column-padding: 16px;
  --resume-section-gap: 16px;
}

.photo-position-left .resume-skin__header {
  justify-content: flex-start;
  gap: var(--cv-space-4);
}

.photo-position-center .resume-skin__header {
  justify-content: center;
  gap: var(--cv-space-4);
}

.photo-position-right .resume-skin__header {
  justify-content: space-between;
}

.divider-line :deep(.resume-section),
.divider-line .resume-skin__main > section,
.divider-line .resume-skin__aside > section {
  border-bottom: 1px solid var(--cv-border-soft);
  padding-bottom: calc(var(--cv-space-2) + var(--cv-space-1) / 2);
}

.divider-thick :deep(.resume-section),
.divider-thick .resume-skin__main > section,
.divider-thick .resume-skin__aside > section {
  border-bottom: 2px solid var(--cv-border-strong);
  padding-bottom: var(--cv-space-3);
}

.divider-none :deep(.resume-section),
.divider-none .resume-skin__main > section,
.divider-none .resume-skin__aside > section {
  border-bottom: none;
  padding-bottom: 0;
}
</style>
