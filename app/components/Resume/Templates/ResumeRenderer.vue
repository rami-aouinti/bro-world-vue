<script setup lang="ts">
import SectionRenderer from '~/components/Resume/Sections/SectionRenderer.vue'
import ResumeSectionHeading from '~/components/Resume/Sections/ResumeSectionHeading.vue'
import SectionToolbar from '~/components/Resume/SectionToolbar.vue'
import AvatarOverlayControls from '~/components/Resume/Templates/AvatarOverlayControls.vue'
import TemplateDecorations from '~/components/Resume/Templates/TemplateDecorations.vue'
import { buildThemeVars } from '~/modules/resume/theme/buildThemeVars'
import type {
  ResumeLayoutMode,
  ResumeSectionIconStyleVariant,
  ResumeTemplateSkin,
} from '~/constants/resumeTemplateSkins'
import { RESUME_SECTION_ICONS } from '~/constants/resumeSectionIcons'
import {
  buildLayoutEntries,
  getDefaultLayoutForStructure,
  getResumeLayoutById,
} from '~/constants/resumeLayouts'
import type {
  ResumeEditableSectionKey,
  ResumeSectionActionKey,
} from '~/types/resumeDocumentModel'
import type { ResumeSectionVariantBySection } from '~/types/resumeSectionVariants'

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
  variant: ResumeSectionVariantBySection[K]
}

type ResumeRendererDesignState = {
  headerStyleVariant?: 'neutral' | 'hero'
  headerHeight?: string
  asideFullHeight?: boolean
  splitContactRow?: boolean
  sectionRibbonStyle?: 'none' | 'soft' | 'accent'
  separatorStyleVariant?: 'neutral' | 'vertical-line'
  accentPaletteVariant?: 'default' | 'contrast' | 'muted'
  themeTokens?: Record<string, string>
  sectionTokens?: Record<string, Record<string, string>>
  profile?: {
    typography: string
    spacing: string
    separators: string
    cards: string
  }
  roundedClass?: string
  textStyleClass?: string
  density?: 'compact' | 'normal' | 'spacious' | 'comfortable'
  dividerStyle?: 'none' | 'line' | 'soft'
  sidebarWidth?: number
  sidebarHeight?: number
  photoSize?: number
  photoBorderWidth?: number
  photoPosition?: 'left' | 'right'
  photo?: {
    position?: 'left' | 'right'
    size?: number
    border?: number
    shape?: 'circle' | 'rounded' | 'square'
  }
  photoOffsetX?: number
  photoOffsetY?: number
  photoScale?: number
  showSectionIcons?: boolean
  showContactIcons?: boolean
  sectionIconStyleVariant?: ResumeSectionIconStyleVariant
  iconSizeVariant?: 's' | 'm' | 'l'
  iconColorMode?: 'accent' | 'neutral'
  layoutMode?: ResumeLayoutMode
  decorativeShapeA?: DecorativeShapeSettings
  decorativeShapeB?: DecorativeShapeSettings
}

type DecorativeShapeSettings = {
  enabled: boolean
  type: 'circle' | 'square' | 'ring' | 'bar' | 'diamond' | 'triangle' | 'pill'
  width: number
  height: number
  size: number
  color: string
  opacity: number
  x: number
  y: number
  rotation: number
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
    dividerStyle?: 'none' | 'line' | 'soft'
    sidebarWidth?: number
    sidebarHeight?: number
    photoSize?: number
    photoBorderWidth?: number
    photoPosition?: 'left' | 'right'
    photoOffsetX?: number
    photoOffsetY?: number
    photoScale?: number
    photoHidden?: boolean
    headerStyleVariant?: 'neutral' | 'hero'
    headerHeight?: string
    asideFullHeight?: boolean
    splitContactRow?: boolean
    sectionRibbonStyle?: 'none' | 'soft' | 'accent'
    showSectionIcons?: boolean
    showContactIcons?: boolean
    sectionIconStyleVariant?: ResumeSectionIconStyleVariant
    iconSizeVariant?: 's' | 'm' | 'l'
    iconColorMode?: 'accent' | 'neutral'
    layoutMode?: ResumeLayoutMode
    templateSkin: ResumeTemplateSkin
    templateId?: string
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
    sidebarHeight: 100,
    photoSize: 96,
    photoBorderWidth: 4,
    photoPosition: 'right',
    photoOffsetX: 0,
    photoOffsetY: 0,
    photoScale: 1,
    photoHidden: false,
    headerStyleVariant: 'neutral',
    headerHeight: 'auto',
    asideFullHeight: false,
    splitContactRow: false,
    sectionRibbonStyle: 'none',
    showSectionIcons: undefined,
    showContactIcons: true,
    sectionIconStyleVariant: undefined,
    iconSizeVariant: 'm',
    templateId: undefined,
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
  (event: 'delete-section', sectionKey: ResumeEditableSectionKey): void
  (event: 'move-photo', direction: 'left' | 'right' | 'up' | 'down'): void
  (event: 'open-photo-picker' | 'remove-photo'): void
  (
    event: 'update:photo-size' | 'update:photo-border-width',
    value: number,
  ): void
  (event: 'update:photo-position', value: 'left' | 'right'): void
}>()

const resolvedTemplateConfig = computed(() => ({
  structureId: props.resume?.template?.structureId as string | undefined,
  layoutId: props.resume?.template?.layoutId as string | undefined,
  skinId: props.resume?.template?.skinId as string | undefined,
}))

const resolvedLayoutDefinition = computed(
  () =>
    getResumeLayoutById(
      resolvedTemplateConfig.value.layoutId ?? props.templateId,
    ) ?? getDefaultLayoutForStructure(resolvedDesignState.value.layoutMode),
)

const normalizedSectionLayout = computed<SectionLayoutEntry[]>(() => {
  if (props.sectionLayout.length) return props.sectionLayout

  return buildLayoutEntries(resolvedLayoutDefinition.value).map((entry) => ({
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
  if (section.key !== 'skill') return true
  if (resolvedDesignState.value.layoutMode === 'no-aside') return true
  return props.templateSkin.showSkillsInAside ?? true
}

function compareSectionOrder(
  left: RenderableSectionLayoutEntry,
  right: RenderableSectionLayoutEntry,
) {
  if (left.order !== right.order) return left.order - right.order
  return left.key.localeCompare(right.key)
}

const sectionsByRegion = computed(() => ({
  main: renderableSections.value
    .filter((section) => section.region === 'main' && isSectionVisible(section))
    .sort(compareSectionOrder),
  aside: renderableSections.value
    .filter(
      (section) => section.region === 'aside' && isSectionVisible(section),
    )
    .sort(compareSectionOrder),
}))

const mainSections = computed(() => sectionsByRegion.value.main)
const asideSections = computed(() => sectionsByRegion.value.aside)
const hasRenderedAvatar = computed(() =>
  Boolean(props.showPhoto && props.resume?.photoUrl && !props.photoHidden),
)
const normalizeLayoutMode = (value: unknown): ResumeLayoutMode => {
  if (value === 'aside-left' || value === 'aside-right' || value === 'no-aside')
    return value
  if (typeof value !== 'string') return 'aside-left'
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/[\s_]+/g, '-')
  if (
    normalized === 'aside-left' ||
    normalized === 'aside-right' ||
    normalized === 'no-aside'
  ) {
    return normalized as ResumeLayoutMode
  }
  return 'aside-left'
}

const resolvedDesignState = computed(() => ({
  themeTokens: props.designState?.themeTokens ?? props.themeTokens,
  roundedClass: props.designState?.roundedClass ?? props.roundedClass,
  textStyleClass: props.designState?.textStyleClass ?? props.textStyleClass,
  density: props.designState?.density ?? props.density,
  dividerStyle: props.designState?.dividerStyle ?? props.dividerStyle,
  sidebarWidth: props.designState?.sidebarWidth ?? props.sidebarWidth,
  sidebarHeight: props.designState?.sidebarHeight ?? props.sidebarHeight,
  photoSize:
    props.designState?.photo?.size ??
    props.designState?.photoSize ??
    props.photoSize,
  photoBorderWidth:
    props.designState?.photo?.border ??
    props.designState?.photoBorderWidth ??
    props.photoBorderWidth,
  photoPosition:
    props.designState?.photo?.position === 'left' ||
    props.designState?.photo?.position === 'right'
      ? props.designState.photo.position
      : props.designState?.photoPosition === 'left' ||
          props.designState?.photoPosition === 'right'
        ? props.designState.photoPosition
        : props.photoPosition === 'left' || props.photoPosition === 'right'
          ? props.photoPosition
          : 'right',
  photoOffsetX: props.designState?.photoOffsetX ?? 0,
  photoOffsetY: props.designState?.photoOffsetY ?? 0,
  photoScale: props.designState?.photoScale ?? 1,
  showSectionIcons:
    props.designState?.showSectionIcons ?? props.showSectionIcons,
  showContactIcons:
    props.designState?.showContactIcons ?? props.showContactIcons,
  sectionIconStyleVariant:
    props.designState?.sectionIconStyleVariant ?? props.sectionIconStyleVariant,
  iconSizeVariant: props.designState?.iconSizeVariant ?? props.iconSizeVariant,
  iconColorMode: props.designState?.iconColorMode ?? props.iconColorMode,
  headerStyleVariant:
    props.designState?.headerStyleVariant ?? props.headerStyleVariant,
  headerHeight: props.designState?.headerHeight ?? props.headerHeight,
  asideFullHeight: props.designState?.asideFullHeight ?? props.asideFullHeight,
  splitContactRow: props.designState?.splitContactRow ?? props.splitContactRow,
  sectionRibbonStyle:
    props.designState?.sectionRibbonStyle ?? props.sectionRibbonStyle,
  separatorStyleVariant: props.designState?.separatorStyleVariant ?? 'neutral',
  accentPaletteVariant: props.designState?.accentPaletteVariant ?? 'default',
  decorativeShapeA: props.designState?.decorativeShapeA,
  decorativeShapeB: props.designState?.decorativeShapeB,
  layoutMode: normalizeLayoutMode(
    props.designState?.layoutMode ??
      props.layoutMode ??
      props.templateSkin.layoutMode,
  ),
}))
const rootDesignClasses = computed(() => [
  resolvedDesignState.value.roundedClass,
  resolvedDesignState.value.textStyleClass,
  `density-${resolvedDesignState.value.density}`,
  `divider-${resolvedDesignState.value.dividerStyle}`,
  `photo-position-${resolvedDesignState.value.photoPosition}`,
  `profile-typography-${props.templateSkin.profile.typography}`,
  `profile-spacing-${props.templateSkin.profile.spacing}`,
  `profile-separators-${props.templateSkin.profile.separators}`,
  `profile-cards-${props.templateSkin.profile.cards}`,
  `resume-header-${resolvedDesignState.value.headerStyleVariant}`,
  `resume-separator-${resolvedDesignState.value.separatorStyleVariant}`,
  `resume-accent-${resolvedDesignState.value.accentPaletteVariant}`,
  resolvedDesignState.value.asideFullHeight ? 'aside-full' : '',
  resolvedDesignState.value.splitContactRow ? 'split-contact-row' : '',
  `section-ribbon-${resolvedDesignState.value.sectionRibbonStyle}`,
])
const skinCssVars = computed<Record<string, string>>(() => {
  const profile = props.templateSkin.profile
  return {
    '--resume-skin-id':
      resolvedTemplateConfig.value.skinId ?? props.templateSkin.id,
    '--resume-structure-id':
      resolvedTemplateConfig.value.structureId ??
      resolvedLayoutDefinition.value.structure,
    '--resume-layout-id': resolvedLayoutDefinition.value.layoutId,
    '--resume-profile-typography': profile.typography,
    '--resume-profile-radius': profile.cards,
    '--resume-profile-icon-style': resolvedSectionIconStyle.value.variant,
    '--resume-profile-section-variant': profile.separators,
  }
})

const rootThemeVars = computed(() =>
  buildThemeVars({
    primary: String(
      props.themeTokens?.['--cv-accent'] ??
        props.templateSkin.themeTokens?.['--cv-accent'] ??
        '',
    ),
    pageBg: String(
      props.themeTokens?.['--cv-surface'] ??
        props.templateSkin.themeTokens?.['--cv-surface'] ??
        '',
    ),
    asideWidth: resolvedDesignState.value.sidebarWidth,
    lineStyle: resolvedDesignState.value.dividerStyle,
    fontStyle: props.templateSkin.profile.typography,
    photo: {
      position: resolvedDesignState.value.photoPosition,
      size: resolvedDesignState.value.photoSize,
      border: resolvedDesignState.value.photoBorderWidth,
      shape: (props.designState?.photo?.shape ?? 'circle') as
        | 'circle'
        | 'rounded'
        | 'square'
        | 'hex'
        | 'blob',
    },
  }),
)

const layoutStyle = computed(() => ({
  '--resume-sidebar-width': `${resolvedDesignState.value.sidebarWidth}px`,
  '--resume-sidebar-height': `${resolvedDesignState.value.sidebarHeight}%`,
  '--resume-header-height': resolvedDesignState.value.headerHeight,
}))
const layoutModeClass = computed(
  () => `layout-mode-${resolvedDesignState.value.layoutMode}`,
)
const shouldRenderAside = computed(
  () => resolvedDesignState.value.layoutMode !== 'no-aside',
)
const noAsideSectionOrderPolicy = 'main-first-then-aside' as const
const visibleMainSections = computed(() => {
  if (resolvedDesignState.value.layoutMode !== 'no-aside')
    return mainSections.value

  // In no-aside mode we remap aside sections into the main flow.
  // Ordering rule: keep main sections first (by order), then aside sections (by order).
  // This avoids cross-column ordering jumps while preserving predictable reordering.
  if (noAsideSectionOrderPolicy === 'main-first-then-aside') {
    return [...mainSections.value, ...asideSections.value]
  }

  return [...mainSections.value, ...asideSections.value].sort(
    compareSectionOrder,
  )
})
const noAsideLeftColumnKeys: ResumeEditableSectionKey[] = [
  'language',
  'reference',
  'hobby',
  'certification',
]
const noAsideRightColumnKeys: ResumeEditableSectionKey[] = ['skill']
const noAsideLeftSections = computed(() =>
  noAsideRightSections.value.length > 0
    ? visibleMainSections.value.filter((section) =>
        noAsideLeftColumnKeys.includes(section.key),
      )
    : [],
)
const noAsideRightSections = computed(() =>
  visibleMainSections.value.filter((section) =>
    noAsideRightColumnKeys.includes(section.key),
  ),
)
const noAsideRemainingSections = computed(() =>
  visibleMainSections.value
    .filter(
      (section) =>
        !noAsideLeftColumnKeys.includes(section.key) &&
        !noAsideRightColumnKeys.includes(section.key),
    )
    .concat(
      noAsideRightSections.value.length === 0
        ? visibleMainSections.value.filter((section) =>
            noAsideLeftColumnKeys.includes(section.key),
          )
        : [],
    )
    .sort(compareSectionOrder),
)
const avatarImageStyle = computed(() => ({
  transform: `translate(${props.photoOffsetX + (resolvedDesignState.value.photoOffsetX ?? 0)}px, ${props.photoOffsetY + (resolvedDesignState.value.photoOffsetY ?? 0)}px) scale(${props.photoScale * (resolvedDesignState.value.photoScale ?? 1)})`,
  transformOrigin: 'center',
}))
const sectionLayoutDensity = computed<'compact' | 'normal' | 'spacious'>(() =>
  resolvedDesignState.value.density === 'compact'
    ? 'compact'
    : resolvedDesignState.value.density === 'spacious'
      ? 'spacious'
      : 'normal',
)
const shouldShowSectionIcons = computed(
  () =>
    resolvedDesignState.value.showSectionIcons ??
    props.templateSkin.showSectionIcons,
)
const resolvedSectionIconStyle = computed(() => {
  const style = props.templateSkin.sectionIconStyle
  const variant =
    resolvedDesignState.value.sectionIconStyleVariant ?? style.variant
  const iconSizeByVariant = { s: 16, m: 18, l: 22 } as const
  const iconColorByMode = {
    accent: 'var(--resume-accent, var(--cv-accent))',
    neutral: 'var(--resume-secondary, var(--cv-secondary))',
  } as const

  return {
    ...style,
    variant,
    size:
      iconSizeByVariant[resolvedDesignState.value.iconSizeVariant] ??
      style.size,
    color:
      iconColorByMode[resolvedDesignState.value.iconColorMode] ?? style.color,
  }
})
const contactIconSize = computed(() => {
  const sizeByVariant = { s: 14, m: 16, l: 20 } as const
  return (
    sizeByVariant[resolvedDesignState.value.iconSizeVariant] ?? sizeByVariant.m
  )
})
const contactIconColor = computed(() =>
  resolvedDesignState.value.iconColorMode === 'neutral'
    ? 'var(--resume-secondary, var(--cv-secondary))'
    : 'var(--resume-accent, var(--cv-accent))',
)
type ContactLayoutZone = 'header' | 'aside' | 'main'

function getContactGridClass(
  layoutMode: ResumeLayoutMode,
  zone: ContactLayoutZone,
): string {
  return `resume-skin__contact-grid--${layoutMode}-${zone}`
}
const sectionIconCssVars = computed<Record<string, string>>(() => ({
  '--resume-section-icon-size': `${resolvedSectionIconStyle.value.size}px`,
  '--resume-section-icon-color': resolvedSectionIconStyle.value.color,
  '--resume-section-icon-gap': `${resolvedSectionIconStyle.value.spacing}px`,
  '--resume-section-icon-radius': resolvedSectionIconStyle.value
    .roundedBackground
    ? '999px'
    : '8px',
  '--resume-contact-icon-size': `${contactIconSize.value}px`,
  '--resume-contact-icon-color': contactIconColor.value,
}))
const decorativeShapes = computed<DecorativeShapeSettings[]>(() =>
  [
    resolvedDesignState.value.decorativeShapeA,
    resolvedDesignState.value.decorativeShapeB,
  ].filter((shape): shape is DecorativeShapeSettings =>
    Boolean(shape?.enabled),
  ),
)

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
  const regionSections = normalizedSectionLayout.value
    .filter((section) => section.region === target.region)
    .sort((left, right) => left.order - right.order)
  const index = regionSections.findIndex(
    (section) => section.key === sectionKey,
  )
  if (index < 0) return false
  return direction === 'up' ? index > 0 : index < regionSections.length - 1
}

function mergedSectionTokens(sectionKey: ResumeEditableSectionKey) {
  return {
    ...resolvedDesignState.value.themeTokens,
    ...(props.designState?.sectionTokens?.[sectionKey] ?? {}),
    ...(props.templateSkin.themeTokens ?? {}),
    ...(sectionKey === 'skill'
      ? {}
      : (props.templateSkin.sectionTokens?.[sectionKey] ?? {})),
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

function onSectionDelete(sectionKey: ResumeEditableSectionKey) {
  emit('delete-section', sectionKey)
}

type ContactFieldKey = 'birthDate' | 'location' | 'phone' | 'email'
const contactFieldOrder: ContactFieldKey[] = [
  'birthDate',
  'location',
  'phone',
  'email',
]
const hasContactDetails = computed(() =>
  Boolean(
    (props.resume.birthDate ?? props.resume.birthday ?? '').trim() ||
    props.resume.birthPlace?.trim() ||
    props.resume.city?.trim() ||
    props.resume.country?.trim() ||
    props.resume.phone?.trim() ||
    props.resume.email?.trim() ||
    props.resume.homepage?.trim() ||
    props.resume.repoProfile?.trim(),
  ),
)
const contactBirthLine = computed(() => {
  const birthDate = (
    props.resume.birthDate ??
    props.resume.birthday ??
    ''
  ).trim()
  const birthPlace = (props.resume.birthPlace ?? '').trim()
  if (birthDate && birthPlace) return `${birthDate}, ${birthPlace}`
  return birthDate || birthPlace
})

function removeContactItem(field: ContactFieldKey) {
  if (field === 'birthDate') {
    updateText('birthDate', '')
    updateText('birthday', '')
    return
  }
  if (field === 'location') {
    updateText('city', '')
    updateText('country', '')
    return
  }
  updateText(field, '')
}

function removeContactSection() {
  for (const field of contactFieldOrder) {
    removeContactItem(field)
  }
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
  <article
    :class="[templateSkin.rootClass, ...rootDesignClasses]"
    :style="{
      ...themeTokens,
      ...(templateSkin.themeTokens ?? {}),
      ...skinCssVars,
      ...sectionIconCssVars,
      ...rootThemeVars,
    }"
  >
    <TemplateDecorations :shapes="decorativeShapes" />
    <header
      class="resume-skin__header"
      :class="[
        `resume-skin__header--${templateSkin.profile.typography}`,
        `resume-header-${resolvedDesignState.headerStyleVariant}`,
      ]"
    >
      <div>
        <h1>
          <span
            class="editable-text resume-skin__text"
            :contenteditable="editable"
            dir="ltr"
            @input="
              (event) =>
                updateText('firstName', (event.target as HTMLElement).innerText)
            "
            >{{ resume.firstName }}</span
          >
          <span
            class="editable-text resume-skin__text mx-3"
            :contenteditable="editable"
            dir="ltr"
            @input="
              (event) =>
                updateText('lastName', (event.target as HTMLElement).innerText)
            "
            >{{ resume.lastName }}</span
          >
        </h1>
        <p
          class="editable-text resume-skin__text"
          :contenteditable="editable"
          dir="ltr"
          @input="
            (event) =>
              updateText('role', (event.target as HTMLElement).innerText)
          "
        >
          {{ resume.role }}
        </p>
        <div
          v-if="templateSkin.showContactInHeader"
          :class="[
            'resume-skin__contact-grid',
            'resume-skin__header-contact',
            getContactGridClass(resolvedDesignState.layoutMode, 'header'),
          ]"
        >
          <div class="resume-skin__contact-item">
            <v-icon
              v-if="showContactIcons"
              class="resume-skin__contact-icon"
              icon="mdi-calendar-month-outline"
              :size="contactIconSize"
            />
            <span
              class="editable-text resume-skin__text"
              :contenteditable="editable"
              @input="
                (event) =>
                  updateText(
                    'birthDate',
                    (event.target as HTMLElement).innerText,
                  )
              "
              >{{ contactBirthLine }}</span
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
                class="editable-text resume-skin__text"
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
                class="editable-text resume-skin__text"
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
              class="editable-text resume-skin__text"
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
              class="editable-text resume-skin__text"
              :contenteditable="editable"
              @input="
                (event) =>
                  updateText('email', (event.target as HTMLElement).innerText)
              "
              >{{ resume.email }}</span
            >
          </div>
          <div v-if="resume.homepage" class="resume-skin__contact-item">
            <v-icon
              v-if="showContactIcons"
              class="resume-skin__contact-icon"
              icon="mdi-web"
              :size="contactIconSize"
            />
            <a
              :href="resume.homepage"
              target="_blank"
              rel="noopener noreferrer"
              class="resume-skin__text"
              >{{ resume.homepage }}</a
            >
          </div>
          <div v-if="resume.repoProfile" class="resume-skin__contact-item">
            <v-icon
              v-if="showContactIcons"
              class="resume-skin__contact-icon"
              icon="mdi-github"
              :size="contactIconSize"
            />
            <a
              :href="resume.repoProfile"
              target="_blank"
              rel="noopener noreferrer"
              class="resume-skin__text"
              >{{ resume.repoProfile }}</a
            >
          </div>
        </div>
      </div>
      <div v-if="hasRenderedAvatar" class="photo-frame" tabindex="0">
        <AvatarOverlayControls
          v-if="photoShapeOptions.length"
          :options="photoShapeOptions"
          :selected-value="selectedPhotoShape"
          :photo-size="resolvedDesignState.photoSize"
          :photo-border-width="resolvedDesignState.photoBorderWidth"
          @select="onPhotoShapeSelect?.($event)"
          @upload="emit('open-photo-picker')"
          @remove="emit('remove-photo')"
          @update:photo-size="emit('update:photo-size', $event)"
          @update:photo-border-width="emit('update:photo-border-width', $event)"
        />
        <v-avatar class="resume-skin__avatar" @click="onPhotoClick?.()">
          <v-img
            class="resume-skin__avatar-image"
            :src="resume.photoUrl"
            :style="avatarImageStyle"
            cover
          />
        </v-avatar>
        <v-btn
          class="photo-upload-corner"
          icon
          size="x-small"
          color="primary"
          aria-label="Upload photo"
          @click.stop="emit('open-photo-picker')"
        >
          <v-icon icon="mdi-camera-plus" size="14" />
        </v-btn>
      </div>
    </header>

    <div
      :class="[templateSkin.wrapperClass, layoutModeClass]"
      :style="layoutStyle"
    >
      <aside
        v-if="shouldRenderAside"
        :class="[
          templateSkin.asideClass,
          `resume-skin__aside--${templateSkin.profile.cards}`,
          resolvedDesignState.asideFullHeight ? 'aside-full' : '',
        ]"
      >
        <section
          v-if="(templateSkin.showContactInAside ?? true) && hasContactDetails"
          class="resume-section-hoverable resume-contact-section"
        >
          <SectionToolbar
            v-if="editable"
            section-key="contact"
            :actions="['delete-section']"
            @delete-section="removeContactSection"
          />
          <ResumeSectionHeading
            title="Contact"
            :icon="shouldShowSectionIcons ? 'mdi-card-account-phone-outline' : undefined"
            :tone="isOnPrimary ? 'on-primary' : 'default'"
            divider
          />
          <div
            :class="[
              'resume-skin__contact-grid',
              getContactGridClass(resolvedDesignState.layoutMode, 'aside'),
            ]"
          >
            <div
              v-if="resume.birthDate ?? resume.birthday"
              class="resume-skin__contact-item"
            >
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
                >{{ contactBirthLine }}</span
              >
              <v-btn
                v-if="editable"
                class="resume-contact-item-delete"
                icon
                size="x-small"
                variant="text"
                color="error"
                aria-label="Supprimer la date de naissance"
                @click="removeContactItem('birthDate')"
              >
                <v-icon icon="mdi-close" size="14" />
              </v-btn>
            </div>
            <div
              v-if="resume.city || resume.country"
              class="resume-skin__contact-item"
            >
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
                      updateText(
                        'city',
                        (event.target as HTMLElement).innerText,
                      )
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
              <v-btn
                v-if="editable"
                class="resume-contact-item-delete"
                icon
                size="x-small"
                variant="text"
                color="error"
                aria-label="Remove location"
                @click="removeContactItem('location')"
              >
                <v-icon icon="mdi-close" size="14" />
              </v-btn>
            </div>
            <div v-if="resume.phone" class="resume-skin__contact-item">
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
              <v-btn
                v-if="editable"
                class="resume-contact-item-delete"
                icon
                size="x-small"
                variant="text"
                color="error"
                aria-label="Remove phone"
                @click="removeContactItem('phone')"
              >
                <v-icon icon="mdi-close" size="14" />
              </v-btn>
            </div>
            <div v-if="resume.email" class="resume-skin__contact-item">
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
              <v-btn
                v-if="editable"
                class="resume-contact-item-delete"
                icon
                size="x-small"
                variant="text"
                color="error"
                aria-label="Supprimer l'email"
                @click="removeContactItem('email')"
              >
                <v-icon icon="mdi-close" size="14" />
              </v-btn>
            </div>
            <div v-if="resume.homepage" class="resume-skin__contact-item">
              <v-icon
                v-if="showContactIcons"
                class="resume-skin__contact-icon"
                icon="mdi-web"
                :size="contactIconSize"
              />
              <a
                :href="resume.homepage"
                target="_blank"
                rel="noopener noreferrer"
                class="resume-skin__text"
                >{{ resume.homepage }}</a
              >
            </div>
            <div v-if="resume.repoProfile" class="resume-skin__contact-item">
              <v-icon
                v-if="showContactIcons"
                class="resume-skin__contact-icon"
                icon="mdi-github"
                :size="contactIconSize"
              />
              <a
                :href="resume.repoProfile"
                target="_blank"
                class="resume-skin__text"
                rel="noopener noreferrer"
                >{{ resume.repoProfile }}</a
              >
            </div>
          </div>
        </section>

        <section v-if="templateSkin.showProfileInAside ?? true">
          <ResumeSectionHeading
            title="Profile"
            :tone="isOnPrimary ? 'on-primary' : 'default'"
            divider
          />
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
          @delete-section="onSectionDelete"
        />
      </aside>

      <main
        :class="[
          templateSkin.mainClass,
          `resume-skin__main--${templateSkin.profile.spacing}`,
        ]"
      >
        <section
          v-if="
            resolvedDesignState.layoutMode === 'no-aside' &&
            (templateSkin.showContactInAside ?? true) &&
            hasContactDetails
          "
        >
          <ResumeSectionHeading
            title="Contact"
            variant="h2"
            :tone="isOnPrimary ? 'on-primary' : 'default'"
            divider
          />
          <div
            :class="[
              'resume-skin__contact-grid',
              getContactGridClass(resolvedDesignState.layoutMode, 'main'),
            ]"
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
                >{{ contactBirthLine }}</span
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
                      updateText(
                        'city',
                        (event.target as HTMLElement).innerText,
                      )
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
            <div v-if="resume.homepage" class="resume-skin__contact-item">
              <v-icon
                v-if="showContactIcons"
                class="resume-skin__contact-icon"
                icon="mdi-web"
                :size="contactIconSize"
              />
              <a
                :href="resume.homepage"
                target="_blank"
                rel="noopener noreferrer"
                class="resume-skin__text"
                >{{ resume.homepage }}</a
              >
            </div>
            <div v-if="resume.repoProfile" class="resume-skin__contact-item">
              <v-icon
                v-if="showContactIcons"
                class="resume-skin__contact-icon"
                icon="mdi-github"
                :size="contactIconSize"
              />
              <a
                :href="resume.repoProfile"
                target="_blank"
                rel="noopener noreferrer"
                class="resume-skin__text"
                >{{ resume.repoProfile }}</a
              >
            </div>
          </div>
        </section>

        <section
          v-if="
            resolvedDesignState.layoutMode === 'no-aside' &&
            (templateSkin.showProfileInAside ?? true)
          "
        >
          <ResumeSectionHeading
            title="Profile"
            variant="h2"
            :tone="isOnPrimary ? 'on-primary' : 'default'"
            divider
          />
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
          <ResumeSectionHeading
            title="Profile"
            variant="h2"
            :tone="isOnPrimary ? 'on-primary' : 'default'"
            divider
          />
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

        <template v-if="resolvedDesignState.layoutMode === 'no-aside'">
          <SectionRenderer
            v-for="section in noAsideRemainingSections"
            :key="`main-no-aside-top-${section.key}`"
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
            @delete-section="onSectionDelete"
          />
          <div class="resume-skin__no-aside-columns">
            <div style="padding-right: 20px">
              <SectionRenderer
                v-for="section in noAsideLeftSections"
                :key="`main-no-aside-left-${section.key}`"
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
                @delete-section="onSectionDelete"
              />
            </div>
            <div>
              <SectionRenderer
                v-for="section in noAsideRightSections"
                :key="`main-no-aside-right-${section.key}`"
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
                @delete-section="onSectionDelete"
              />
            </div>
          </div>
        </template>
        <template v-else>
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
            @delete-section="onSectionDelete"
          />
        </template>
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
  --cv-border-soft: color-mix(
    in srgb,
    var(--resume-secondary, var(--cv-secondary)) 20%,
    transparent
  );
  --cv-border-strong: color-mix(
    in srgb,
    var(--resume-accent, var(--cv-accent)) 24%,
    transparent
  );
  --cv-surface-soft: color-mix(
    in srgb,
    var(--resume-page, var(--cv-page)) 78%,
    transparent
  );
  --cv-shadow-soft: color-mix(
    in srgb,
    var(--resume-sidebar, var(--cv-sidebar)) 12%,
    transparent
  );
  --cv-progress-bg: color-mix(
    in srgb,
    var(--resume-accent, var(--cv-accent)) 22%,
    var(--resume-page, var(--cv-page))
  );

  font-family: var(
    --resume-font-family,
    var(--cv-font-family, 'Inter', 'Segoe UI', Arial, sans-serif)
  );
  font-style: var(--resume-font-style, var(--cv-font-style, normal));
  font-weight: var(--resume-font-weight, var(--cv-font-weight, 400));
  padding: 18px;
  position: relative;
  overflow: hidden;
}
.resume-skin__decorative-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.resume-skin__shape {
  position: absolute;
  background: var(--shape-color);
  opacity: var(--shape-opacity);
}
.resume-skin__shape--circle {
  border-radius: 999px;
}
.resume-skin__shape--square {
  border-radius: 10px;
}
.resume-skin__shape--ring {
  border-radius: 999px;
  background: transparent;
  border: 8px solid color-mix(in srgb, var(--shape-color) 90%, white);
}
.resume-skin__shape--bar {
  border-radius: 999px;
}

.resume-skin__shape--diamond {
  border-radius: 12px;
  transform: var(--shape-transform, translate(-50%, -50%)) rotate(45deg);
}
.resume-skin__shape--triangle {
  width: 0 !important;
  height: 0 !important;
  border-left: calc(var(--shape-size, 100px) / 2) solid transparent;
  border-right: calc(var(--shape-size, 100px) / 2) solid transparent;
  border-bottom: var(--shape-size, 100px) solid var(--shape-color);
  background: transparent;
}
.resume-skin__shape--pill {
  border-radius: 999px;
}
.resume-skin__layout {
  display: grid;
  gap: 20px;
}
.resume-skin__header {
  position: relative;
  z-index: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.resume-skin__header-contact {
  font-size: 0.9rem;
  opacity: 0.8;
  margin-top: var(--resume-space-2, var(--cv-space-2));
}
.resume-skin__contact-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--resume-contact-row-gap, var(--resume-space-2, var(--cv-space-2)))
    var(--resume-contact-column-gap, var(--resume-space-4, var(--cv-space-4)));
}
.resume-contact-section {
  position: relative;
  container-type: inline-size;
  margin-top: var(--resume-space-2, var(--cv-space-2));
}
.resume-contact-section .resume-skin__contact-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
  margin-top: var(--resume-space-2, var(--cv-space-2));
}
.resume-skin__contact-item {
  display: inline-flex;
  align-items: center;
  gap: var(--resume-space-1, var(--cv-space-1));
  min-width: 0;
  position: relative;
}
.resume-contact-item-delete {
  margin-left: auto;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.16s ease;
}
.resume-skin__contact-item:hover .resume-contact-item-delete,
.resume-skin__contact-item:focus-within .resume-contact-item-delete {
  opacity: 1;
  pointer-events: auto;
}
.resume-skin__contact-item .editable-text {
  min-width: 0;
}
.resume-skin :deep(.editable-text[contenteditable='true']) {
  direction: ltr;
  unicode-bidi: plaintext;
  text-align: left;
}
.resume-skin__contact-item a {
  color: inherit !important;
  text-decoration: none !important;
}

.resume-skin__header h1 :deep(.resume-skin__text),
.resume-skin__header > div > p.resume-skin__text {
  color: var(
    --resume-header-text-color,
    var(--resume-secondary, var(--cv-secondary))
  );
}

.resume-skin__header > div > p.resume-skin__text {
  color: var(
    --resume-header-subtitle-color,
    var(--resume-secondary, var(--cv-secondary))
  );
}

.resume-skin__contact-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 1.25em;
  min-width: 1.25em;
  line-height: 1;
  color: var(
    --resume-contact-icon-color,
    var(--resume-accent, var(--cv-accent))
  );
  flex-shrink: 0;
  transition: color 0.2s ease;
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
  width: var(--photo-size);
  height: var(--photo-size);
  border-width: var(--photo-border);
  border-style: solid;
  border-radius: var(--photo-radius, 999px);
  clip-path: var(--photo-clip-path, none);
  overflow: hidden;
  border-color: color-mix(
    in srgb,
    var(--resume-accent, var(--cv-accent)) 28%,
    var(--resume-page, var(--cv-page))
  );
}

.resume-skin__avatar-image,
.resume-skin__avatar-image :deep(.v-responsive),
.resume-skin__avatar-image :deep(.v-img) {
  width: 100%;
  height: 100%;
}

:global(.resume-skin__avatar .v-img__img) {
  border-radius: inherit;
  display: block;
  object-fit: cover;
  object-position: center;
}

.photo-upload-corner {
  position: absolute;
  top: -6px;
  right: -6px;
  z-index: 3;
  box-shadow: 0 2px 8px rgb(0 0 0 / 28%);
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
  background: var(--resume-progress-bg, var(--cv-progress-bg));
  margin-top: var(--resume-space-1, var(--cv-space-1));
}
.progress i {
  display: block;
  height: 100%;
  background: var(--resume-accent, var(--cv-accent));
}
.resume-skin__main,
.resume-skin__aside {
  display: grid;
  gap: var(--resume-section-gap, var(--resume-space-3, var(--cv-space-3)));
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
  height: var(--resume-sidebar-height, 100%);
  --resume-aside-text-color: var(--resume-page, var(--cv-page));
  --resume-aside-decor-color: var(--resume-secondary, var(--cv-secondary));
  color: var(--resume-aside-text-color);
}

.layout-mode-aside-left .resume-skin__aside :deep(.cv-heading-section),
.layout-mode-aside-right .resume-skin__aside :deep(.cv-heading-section) {
  color: var(--resume-page, var(--cv-page)) !important;
  display: flex;
  align-items: center;
  gap: var(--resume-section-icon-gap, var(--cv-space-2, 8px));
  margin: 0 0 var(--cv-space-2, 8px);
}

.layout-mode-aside-left
  .resume-skin__aside
  :deep(.cv-heading-section .section-icon),
.layout-mode-aside-right
  .resume-skin__aside
  :deep(.cv-heading-section .section-icon) {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 calc(var(--resume-section-icon-size, 18px) + 8px);
  width: calc(var(--resume-section-icon-size, 18px) + 8px);
  height: calc(var(--resume-section-icon-size, 18px) + 8px);
}

.resume-skin__aside :deep(.resume-skin__text),
.resume-skin__aside :deep(.resume-skin__text),
.resume-skin__aside :deep(.editable-text),
.resume-skin__aside :deep(p),
.resume-skin__aside :deep(li),
.resume-skin__aside :deep(small),
.resume-skin__aside :deep(strong),
.resume-skin__aside :deep(h4),
.resume-skin__aside :deep(a) {
  color: var(--resume-aside-text-color) !important;
}

.resume-skin__aside :deep(.section-icon),
.resume-skin__aside :deep(.resume-skin__contact-icon) {
  color: var(--resume-aside-text-color);
}

.resume-skin__aside :deep(.progress) {
  background: color-mix(
    in srgb,
    var(--resume-aside-decor-color) 24%,
    transparent
  );
}

.resume-skin__aside :deep(.progress i) {
  background: var(--resume-aside-decor-color);
}

.resume-skin__aside :deep(.v-rating .v-icon),
.resume-skin__aside :deep(.language-stars-value),
.resume-skin__aside :deep(.bars small:last-child) {
  color: var(--resume-aside-text-color) !important;
}

.resume-skin__aside :deep(.experience .entry) {
  grid-template-columns: minmax(86px, 110px) minmax(0, 1fr);
  column-gap: var(--resume-space-2, var(--cv-space-2));
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

.layout-mode-aside-left .resume-contact-section .resume-skin__contact-grid,
.layout-mode-aside-right .resume-contact-section .resume-skin__contact-grid {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@container (max-width: 360px) {
  .resume-contact-section .resume-skin__contact-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
.resume-skin__no-aside-columns {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--resume-space-4, var(--cv-space-4));
}
.resume-skin__no-aside-columns > div + div {
  border-left: 1px solid
    color-mix(in srgb, var(--resume-accent, var(--cv-accent)) 22%, transparent);
  padding-left: var(--resume-space-4, var(--cv-space-4));
}

.layout-mode-no-aside :deep(.project-grid--two-column),
.layout-mode-no-aside :deep(.education--two-column .education-list) {
  grid-template-columns: minmax(0, 1fr);
}

.layout-mode-no-aside :deep(.experience .entry),
.layout-mode-no-aside :deep(.education .entry),
.layout-mode-no-aside :deep(.project-section .entry) {
  grid-template-columns: minmax(0, 1fr);
  row-gap: var(--resume-space-2, var(--cv-space-2));
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

.photo-position-right .resume-skin__header {
  justify-content: space-between;
}

.photo-position-left .resume-skin__header {
  justify-content: space-between;
}

.photo-position-left .photo-frame {
  order: -1;
}

.divider-line :deep(.resume-section),
.divider-line .resume-skin__main > section,
.divider-line .resume-skin__aside > section {
  border-bottom: 1px solid var(--resume-border-soft, var(--cv-border-soft));
  padding-bottom: calc(
    var(--resume-space-2, var(--cv-space-2)) +
      var(--resume-space-1, var(--cv-space-1)) / 2
  );
}

.divider-soft :deep(.resume-section),
.divider-soft .resume-skin__main > section,
.divider-soft .resume-skin__aside > section {
  border-bottom: 2px solid var(--resume-border-strong, var(--cv-border-strong));
  padding-bottom: var(--resume-space-3, var(--cv-space-3));
}

.divider-none :deep(.resume-section),
.divider-none .resume-skin__main > section,
.divider-none .resume-skin__aside > section {
  border-bottom: none;
  padding-bottom: 0;
}

@container (min-width: 381px) {
  .layout-mode-no-aside .resume-contact-section .resume-skin__contact-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .resume-skin__contact-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .resume-skin__contact-grid--aside-left-aside,
  .resume-skin__contact-grid--aside-left-main,
  .resume-skin__contact-grid--aside-right-aside,
  .resume-skin__contact-grid--aside-right-main,
  .resume-skin__contact-grid--no-aside-main {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 769px) {
  .resume-skin__contact-grid--aside-left-main,
  .resume-skin__contact-grid--aside-right-main,
  .resume-skin__contact-grid--no-aside-main {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media print {
  .layout-mode-no-aside .resume-skin__contact-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }
}
</style>
