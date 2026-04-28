<script setup lang="ts">
import SectionRenderer from '~/components/Resume/Sections/SectionRenderer.vue'
import AvatarOverlayControls from '~/components/Resume/Templates/AvatarOverlayControls.vue'
import type {
  ResumeLayoutMode,
  ResumeSectionIconStyleVariant,
  ResumeTemplateSkin,
} from '~/constants/resumeTemplateSkins'
import { RESUME_SECTION_ICONS } from '~/constants/resumeSectionIcons'
import type { ResumeEditableSectionKey, ResumeSectionActionKey } from '~/types/resumeDocumentModel'

type SectionLayoutVariant = {
  experience: 'detailed' | 'bullets' | 'compact'
  education: 'classic' | 'timeline' | 'two-column'
  language: 'classic' | 'text-level' | 'stars' | 'progress' | 'flags'
  project: 'classic' | 'list' | 'cards' | 'two-column'
  skill: 'classic' | 'text-level' | 'stars' | 'dots' | 'progress'
  reference: 'classic'
  hobby: 'classic'
  certification: 'classic'
}

type ResumeSectionLayoutKey = ResumeEditableSectionKey

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

type ResumeRendererDesignState = {
  themeTokens?: Record<string, string>
  roundedClass?: string
  textStyleClass?: string
  density?: 'compact' | 'normal' | 'spacious' | 'comfortable'
  dividerStyle?: 'none' | 'line' | 'thick'
  sidebarWidth?: number
  photoSize?: number
  photoBorderWidth?: number
  photoPosition?: 'left' | 'center' | 'right'
  showSectionIcons?: boolean
  showContactIcons?: boolean
  sectionIconStyleVariant?: ResumeSectionIconStyleVariant
  iconSizeVariant?: 's' | 'm' | 'l'
  iconColorMode?: 'accent' | 'neutral'
  layoutMode?: ResumeLayoutMode
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
    designState?: ResumeRendererDesignState
    themeTokens?: Record<string, string>
    roundedClass?: string
    textStyleClass?: string
    density?: 'compact' | 'normal' | 'spacious' | 'comfortable'
    dividerStyle?: 'none' | 'line' | 'thick'
    sidebarWidth?: number
    photoSize?: number
    photoBorderWidth?: number
    photoPosition?: 'left' | 'center' | 'right'
    photoOffsetX?: number
    photoOffsetY?: number
    photoScale?: number
    photoHidden?: boolean
    showSectionIcons?: boolean
    showContactIcons?: boolean
    sectionIconStyleVariant?: ResumeSectionIconStyleVariant
    iconSizeVariant?: 's' | 'm' | 'l'
    iconColorMode?: 'accent' | 'neutral'
    layoutMode?: ResumeLayoutMode
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
    designState: undefined,
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
    showSectionIcons: undefined,
    showContactIcons: true,
    sectionIconStyleVariant: undefined,
    iconSizeVariant: 'm',
    iconColorMode: 'accent',
    layoutMode: undefined,
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

type RenderableSectionLayoutEntry = SectionLayoutEntry<ResumeEditableSectionKey>
const renderableSections = computed<RenderableSectionLayoutEntry[]>(
  () =>
    normalizedSectionLayout.value.filter(
      (section) =>
        section.key === 'experience' ||
        section.key === 'education' ||
        section.key === 'language' ||
        section.key === 'project' ||
        section.key === 'skill' ||
        section.key === 'hobby' ||
        section.key === 'certification' ||
        section.key === 'reference',
    ) as RenderableSectionLayoutEntry[],
)

function isSectionVisible(section: RenderableSectionLayoutEntry) {
  return section.key !== 'skill' || props.templateSkin.showSkillsInAside
}

const mainSections = computed(() =>
  renderableSections.value.filter((section) => section.region === 'main' && isSectionVisible(section)),
)
const asideSections = computed(() =>
  renderableSections.value.filter((section) => section.region === 'aside' && isSectionVisible(section)),
)
const hasRenderedAvatar = computed(() =>
  Boolean(props.showPhoto && props.resume?.photoUrl && !props.photoHidden),
)
const resolvedDesignState = computed(() => ({
  themeTokens: props.designState?.themeTokens ?? props.themeTokens,
  roundedClass: props.designState?.roundedClass ?? props.roundedClass,
  textStyleClass: props.designState?.textStyleClass ?? props.textStyleClass,
  density: props.designState?.density ?? props.density,
  dividerStyle: props.designState?.dividerStyle ?? props.dividerStyle,
  sidebarWidth: props.designState?.sidebarWidth ?? props.sidebarWidth,
  photoSize: props.designState?.photoSize ?? props.photoSize,
  photoBorderWidth: props.designState?.photoBorderWidth ?? props.photoBorderWidth,
  photoPosition: props.designState?.photoPosition ?? props.photoPosition,
  showSectionIcons: props.designState?.showSectionIcons ?? props.showSectionIcons,
  showContactIcons: props.designState?.showContactIcons ?? props.showContactIcons,
  sectionIconStyleVariant: props.designState?.sectionIconStyleVariant ?? props.sectionIconStyleVariant,
  iconSizeVariant: props.designState?.iconSizeVariant ?? props.iconSizeVariant,
  iconColorMode: props.designState?.iconColorMode ?? props.iconColorMode,
  layoutMode: props.designState?.layoutMode ?? props.layoutMode ?? props.templateSkin.layoutMode,
}))
const rootDesignClasses = computed(() => [
  resolvedDesignState.value.roundedClass,
  resolvedDesignState.value.textStyleClass,
  `density-${resolvedDesignState.value.density}`,
  `divider-${resolvedDesignState.value.dividerStyle}`,
  `photo-position-${resolvedDesignState.value.photoPosition}`,
])
const layoutStyle = computed(() => ({
  '--resume-sidebar-width': `${resolvedDesignState.value.sidebarWidth}px`,
}))
const layoutModeClass = computed(
  () => `layout-mode-${resolvedDesignState.value.layoutMode}`,
)
const shouldRenderAside = computed(
  () =>
    resolvedDesignState.value.layoutMode !== 'no-aside' &&
    (
      props.templateSkin.showContactInAside ||
      props.templateSkin.showProfileInAside ||
      asideSections.value.length > 0
    ),
)
const visibleMainSections = computed(() => {
  if (resolvedDesignState.value.layoutMode !== 'no-aside') return mainSections.value

  return [...mainSections.value, ...asideSections.value]
    .sort((left, right) => {
      if (left.order !== right.order) return left.order - right.order
      return left.region === right.region ? 0 : left.region === 'main' ? -1 : 1
    })
})
const avatarStyle = computed(() => ({
  width: `${resolvedDesignState.value.photoSize}px`,
  height: `${resolvedDesignState.value.photoSize}px`,
  borderWidth: `${resolvedDesignState.value.photoBorderWidth}px`,
}))
const avatarImageStyle = computed(() => ({
  transform: `translate(${props.photoOffsetX}px, ${props.photoOffsetY}px) scale(${props.photoScale})`,
  transformOrigin: 'center',
}))
const sectionLayoutDensity = computed<'compact' | 'normal' | 'spacious'>(() =>
  resolvedDesignState.value.density === 'compact'
    ? 'compact'
    : resolvedDesignState.value.density === 'spacious'
      ? 'spacious'
      : 'normal',
)
const shouldShowSectionIcons = computed(() =>
  resolvedDesignState.value.showSectionIcons ?? props.templateSkin.showSectionIcons,
)
const resolvedSectionIconStyle = computed(() => {
  const style = props.templateSkin.sectionIconStyle
  const variant = resolvedDesignState.value.sectionIconStyleVariant ?? style.variant
  const iconSizeByVariant = { s: 16, m: 18, l: 22 } as const
  const iconColorByMode = {
    accent: 'var(--cv-accent)',
    neutral: 'var(--cv-secondary)',
  } as const

  return {
    ...style,
    variant,
    size: iconSizeByVariant[resolvedDesignState.value.iconSizeVariant] ?? style.size,
    color: iconColorByMode[resolvedDesignState.value.iconColorMode] ?? style.color,
  }
})
const contactIconSize = computed(() => {
  const sizeByVariant = { s: 14, m: 16, l: 20 } as const
  return sizeByVariant[resolvedDesignState.value.iconSizeVariant] ?? sizeByVariant.m
})
const contactIconColor = computed(() =>
  resolvedDesignState.value.iconColorMode === 'neutral' ? 'var(--cv-secondary)' : 'var(--cv-accent)',
)
const sectionIconCssVars = computed<Record<string, string>>(() => ({
  '--resume-section-icon-size': `${resolvedSectionIconStyle.value.size}px`,
  '--resume-section-icon-color': resolvedSectionIconStyle.value.color,
  '--resume-section-icon-gap': `${resolvedSectionIconStyle.value.spacing}px`,
  '--resume-section-icon-radius': resolvedSectionIconStyle.value.roundedBackground ? '999px' : '8px',
  '--resume-contact-icon-size': `${contactIconSize.value}px`,
  '--resume-contact-icon-color': contactIconColor.value,
}))

function fallbackVariant(sectionKey: ResumeSectionLayoutKey): string {
  if (sectionKey === 'experience') return 'detailed'
  if (sectionKey === 'education') return 'classic'
  if (sectionKey === 'language') return 'text-level'
  if (sectionKey === 'skill') return 'progress'
  if (
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

function mergedSectionTokens(sectionKey: ResumeEditableSectionKey) {
  return {
    ...resolvedDesignState.value.themeTokens,
    ...(props.templateSkin.themeTokens ?? {}),
    ...(sectionKey === 'skill' ? {} : (props.templateSkin.sectionTokens?.[sectionKey] ?? {})),
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
  <article :class="[templateSkin.rootClass, ...rootDesignClasses]" :style="{ ...themeTokens, ...sectionIconCssVars }">
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
        <div
          v-if="templateSkin.showContactInHeader"
          class="resume-skin__contact-grid resume-skin__header-contact"
        >
          <div class="resume-skin__contact-item">
            <v-icon
              v-if="showContactIcons"
              class="resume-skin__contact-icon"
              icon="mdi-calendar-month-outline"
              :size="contactIconSize"
            />
            <span
              class="editable-text"
              :contenteditable="editable"
              @input="
                (event) =>
                  updateText(
                    'birthDate',
                    (event.target as HTMLElement).innerText,
                  )
              "
              >{{ resume.birthDate ?? resume.birthday ?? '' }}</span
            >
          </div>
          <div class="resume-skin__contact-item">
            <v-icon
              v-if="showContactIcons"
              class="resume-skin__contact-icon"
              icon="mdi-map-marker-outline"
              :size="contactIconSize"
            />
            <span>
              <span
                class="editable-text"
                :contenteditable="editable"
                @input="
                  (event) =>
                    updateText('city', (event.target as HTMLElement).innerText)
                "
                >{{ resume.city }}</span
              >
              <span v-if="resume.country">, </span>
              <span
                v-if="resume.country"
                class="editable-text"
                :contenteditable="editable"
                @input="
                  (event) =>
                    updateText(
                      'country',
                      (event.target as HTMLElement).innerText,
                    )
                "
                >{{ resume.country }}</span
              >
            </span>
          </div>
          <div class="resume-skin__contact-item">
            <v-icon
              v-if="showContactIcons"
              class="resume-skin__contact-icon"
              icon="mdi-phone-outline"
              :size="contactIconSize"
            />
            <span
              class="editable-text"
              :contenteditable="editable"
              @input="
                (event) =>
                  updateText('phone', (event.target as HTMLElement).innerText)
              "
              >{{ resume.phone }}</span
            >
          </div>
          <div class="resume-skin__contact-item">
            <v-icon
              v-if="showContactIcons"
              class="resume-skin__contact-icon"
              icon="mdi-email-outline"
              :size="contactIconSize"
            />
            <span
              class="editable-text"
              :contenteditable="editable"
              @input="
                (event) =>
                  updateText('email', (event.target as HTMLElement).innerText)
              "
              >{{ resume.email }}</span
            >
          </div>
        </div>
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

    <div :class="[templateSkin.wrapperClass, layoutModeClass]" :style="layoutStyle">
      <aside v-if="shouldRenderAside" :class="templateSkin.asideClass">
        <section v-if="templateSkin.showContactInAside">
          <h3 class="cv-heading-section">Contact</h3>
          <div class="resume-skin__contact-grid">
            <div class="resume-skin__contact-item">
              <v-icon
                v-if="showContactIcons"
                class="resume-skin__contact-icon"
                icon="mdi-calendar-month-outline"
                :size="contactIconSize"
              />
              <span
                class="editable-text"
                :contenteditable="editable"
                @input="
                  (event) =>
                    updateText(
                      'birthDate',
                      (event.target as HTMLElement).innerText,
                    )
                "
                >{{ resume.birthDate ?? resume.birthday ?? '' }}</span
              >
            </div>
            <div class="resume-skin__contact-item">
              <v-icon
                v-if="showContactIcons"
                class="resume-skin__contact-icon"
                icon="mdi-map-marker-outline"
                :size="contactIconSize"
              />
              <span>
                <span
                  class="editable-text"
                  :contenteditable="editable"
                  @input="
                    (event) =>
                      updateText('city', (event.target as HTMLElement).innerText)
                  "
                  >{{ resume.city }}</span
                >
                <span v-if="resume.country">, </span>
                <span
                  v-if="resume.country"
                  class="editable-text"
                  :contenteditable="editable"
                  @input="
                    (event) =>
                      updateText(
                        'country',
                        (event.target as HTMLElement).innerText,
                      )
                  "
                  >{{ resume.country }}</span
                >
              </span>
            </div>
            <div class="resume-skin__contact-item">
              <v-icon
                v-if="showContactIcons"
                class="resume-skin__contact-icon"
                icon="mdi-phone-outline"
                :size="contactIconSize"
              />
              <span
                class="editable-text"
                :contenteditable="editable"
                @input="
                  (event) =>
                    updateText('phone', (event.target as HTMLElement).innerText)
                "
                >{{ resume.phone }}</span
              >
            </div>
            <div class="resume-skin__contact-item">
              <v-icon
                v-if="showContactIcons"
                class="resume-skin__contact-icon"
                icon="mdi-email-outline"
                :size="contactIconSize"
              />
              <span
                class="editable-text"
                :contenteditable="editable"
                @input="
                  (event) =>
                    updateText('email', (event.target as HTMLElement).innerText)
                "
                >{{ resume.email }}</span
              >
            </div>
          </div>
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
          :show-section-icon="shouldShowSectionIcons"
          :section-icon-style="resolvedSectionIconStyle"
          @add-item="onSectionAddItem"
          @change-variant="onSectionVariantChange"
          @move-section="onSectionMove"
        />
      </aside>

      <main :class="templateSkin.mainClass">
        <section
          v-if="resolvedDesignState.layoutMode === 'no-aside' && templateSkin.showContactInAside"
        >
          <h2 class="cv-heading-section">Contact</h2>
          <div class="resume-skin__contact-grid">
            <div class="resume-skin__contact-item">
              <v-icon
                v-if="showContactIcons"
                class="resume-skin__contact-icon"
                icon="mdi-calendar-month-outline"
                :size="contactIconSize"
              />
              <span
                class="editable-text"
                :contenteditable="editable"
                @input="
                  (event) =>
                    updateText(
                      'birthDate',
                      (event.target as HTMLElement).innerText,
                    )
                "
                >{{ resume.birthDate ?? resume.birthday ?? '' }}</span
              >
            </div>
            <div class="resume-skin__contact-item">
              <v-icon
                v-if="showContactIcons"
                class="resume-skin__contact-icon"
                icon="mdi-map-marker-outline"
                :size="contactIconSize"
              />
              <span>
                <span
                  class="editable-text"
                  :contenteditable="editable"
                  @input="
                    (event) =>
                      updateText('city', (event.target as HTMLElement).innerText)
                  "
                  >{{ resume.city }}</span
                >
                <span v-if="resume.country">, </span>
                <span
                  v-if="resume.country"
                  class="editable-text"
                  :contenteditable="editable"
                  @input="
                    (event) =>
                      updateText(
                        'country',
                        (event.target as HTMLElement).innerText,
                      )
                  "
                  >{{ resume.country }}</span
                >
              </span>
            </div>
            <div class="resume-skin__contact-item">
              <v-icon
                v-if="showContactIcons"
                class="resume-skin__contact-icon"
                icon="mdi-phone-outline"
                :size="contactIconSize"
              />
              <span
                class="editable-text"
                :contenteditable="editable"
                @input="
                  (event) =>
                    updateText('phone', (event.target as HTMLElement).innerText)
                "
                >{{ resume.phone }}</span
              >
            </div>
            <div class="resume-skin__contact-item">
              <v-icon
                v-if="showContactIcons"
                class="resume-skin__contact-icon"
                icon="mdi-email-outline"
                :size="contactIconSize"
              />
              <span
                class="editable-text"
                :contenteditable="editable"
                @input="
                  (event) =>
                    updateText('email', (event.target as HTMLElement).innerText)
                "
                >{{ resume.email }}</span
              >
            </div>
          </div>
        </section>

        <section
          v-if="resolvedDesignState.layoutMode === 'no-aside' && templateSkin.showProfileInAside"
        >
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
          v-for="section in visibleMainSections"
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
          :show-section-icon="shouldShowSectionIcons"
          :section-icon-style="resolvedSectionIconStyle"
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
  margin-top: var(--cv-space-2);
}
.resume-skin__contact-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--cv-space-2) var(--cv-space-4);
}
.resume-skin__contact-item {
  display: inline-flex;
  align-items: center;
  gap: var(--cv-space-2);
  min-width: 0;
}
.resume-skin__contact-item .editable-text {
  min-width: 0;
}
.resume-skin__contact-icon {
  color: var(--resume-contact-icon-color, var(--cv-accent));
  transition: color .2s ease;
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
  margin-top: var(--resume-header-content-gap, 12px);
}

.resume-skin__main {
  grid-area: main;
}

.resume-skin__aside {
  grid-area: aside;
}

.layout-mode-aside-left {
  grid-template-columns: var(--resume-sidebar-width, 280px) minmax(0, 1fr);
  grid-template-areas: 'aside main';
}

.layout-mode-aside-right {
  grid-template-columns: minmax(0, 1fr) var(--resume-sidebar-width, 280px);
  grid-template-areas: 'main aside';
}

.layout-mode-no-aside {
  grid-template-columns: minmax(0, 1fr);
  grid-template-areas: 'main';
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

@media (max-width: 768px) {
  .resume-skin__contact-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
