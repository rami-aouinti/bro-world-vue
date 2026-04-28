import type { ResumeTemplateVariant } from '~/constants/resumeTemplates'
import { resolveTemplateSkin } from '~/constants/resumeTemplateSkins'
import type {
  ResumeDocumentCustomizationState,
  ResumeDocumentModel,
  ResumeSectionLayoutModel,
} from '~/types/resumeDocumentModel'

const STORAGE_KEY = 'resume-document-model-v1'

const DEFAULT_SECTION_ORDER: ResumeSectionLayoutModel[] = [
  { key: 'experience', variant: 'detailed', region: 'main', order: 0 },
  { key: 'education', variant: 'classic', region: 'main', order: 1 },
  { key: 'project', variant: 'classic', region: 'main', order: 2 },
  { key: 'certification', variant: 'classic', region: 'main', order: 3 },
  { key: 'skill', variant: 'classic', region: 'aside', order: 0 },
  { key: 'language', variant: 'classic', region: 'aside', order: 1 },
  { key: 'reference', variant: 'classic', region: 'aside', order: 2 },
  { key: 'hobby', variant: 'classic', region: 'aside', order: 3 },
]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizeSectionOrder(sectionOrder: unknown): ResumeSectionLayoutModel[] {
  if (!Array.isArray(sectionOrder)) return DEFAULT_SECTION_ORDER.map(entry => ({ ...entry }))

  const parsedByKey = new Map<string, Partial<ResumeSectionLayoutModel>>()
  for (const entry of sectionOrder) {
    if (!isRecord(entry) || typeof entry.key !== 'string') continue
    parsedByKey.set(entry.key, entry as Partial<ResumeSectionLayoutModel>)
  }

  return DEFAULT_SECTION_ORDER.map((fallback) => {
    const parsed = parsedByKey.get(fallback.key)
    return {
      key: fallback.key,
      variant: typeof parsed?.variant === 'string' ? parsed.variant : fallback.variant,
      region: parsed?.region === 'main' || parsed?.region === 'aside' ? parsed.region : fallback.region,
      order: typeof parsed?.order === 'number' ? parsed.order : fallback.order,
    }
  })
}

function normalizeModel(source: unknown, templateVariant: ResumeTemplateVariant): ResumeDocumentModel {
  const defaultLayoutMode = resolveTemplateSkin(templateVariant).layoutMode

  if (!isRecord(source)) {
    return {
      templateVariant,
      sectionOrder: DEFAULT_SECTION_ORDER.map(entry => ({ ...entry })),
      style: {
        palette: 'ocean',
        pageBackground: 'white',
        density: 'comfortable',
        radius: 'md',
        typography: 'clean',
        photoPosition: 'right',
        asideWidth: 280,
        showSectionIcons: true,
        showContactIcons: true,
        sectionIconStyle: 'outline',
        iconSize: 'm',
        iconColor: 'accent',
        layoutMode: defaultLayoutMode,
        decorativeShapeA: {
          enabled: true,
          type: 'circle',
          width: 120,
          height: 120,
          size: 120,
          color: '#1d4ed8',
          opacity: 0.15,
          x: 86,
          y: 10,
          rotation: 0,
        },
        decorativeShapeB: {
          enabled: true,
          type: 'square',
          width: 180,
          height: 48,
          size: 120,
          color: '#0f172a',
          opacity: 0.1,
          x: 6,
          y: 86,
          rotation: -12,
        },
      },
    }
  }

  const style = isRecord(source.style) ? source.style : {}

  return {
    templateVariant: typeof source.templateVariant === 'string'
      ? source.templateVariant as ResumeTemplateVariant
      : templateVariant,
    sectionOrder: normalizeSectionOrder(source.sectionOrder),
    style: {
      palette: typeof style.palette === 'string' ? style.palette : 'ocean',
      pageBackground: style.pageBackground === 'sky-light' || style.pageBackground === 'pearl-light' || style.pageBackground === 'ivory-light' ? style.pageBackground : 'white',
      density: style.density === 'compact' ? 'compact' : 'comfortable',
      radius: (style.radius as ResumeDocumentModel['style']['radius']) ?? 'md',
      typography: (style.typography as ResumeDocumentModel['style']['typography']) ?? 'clean',
      photoPosition: style.photoPosition === 'left' ? 'left' : 'right',
      asideWidth: typeof style.asideWidth === 'number' && Number.isFinite(style.asideWidth)
        ? Math.min(380, Math.max(220, Math.round(style.asideWidth)))
        : 280,
      showSectionIcons: typeof style.showSectionIcons === 'boolean' ? style.showSectionIcons : true,
      showContactIcons: typeof style.showContactIcons === 'boolean' ? style.showContactIcons : true,
      sectionIconStyle: style.sectionIconStyle === 'filled' || style.sectionIconStyle === 'rounded' ? style.sectionIconStyle : 'outline',
      iconSize: style.iconSize === 's' || style.iconSize === 'l' ? style.iconSize : 'm',
      iconColor: style.iconColor === 'neutral' ? 'neutral' : 'accent',
      layoutMode: style.layoutMode === 'aside-left' || style.layoutMode === 'aside-right' || style.layoutMode === 'no-aside'
        ? style.layoutMode
        : defaultLayoutMode,
      decorativeShapeA: isRecord(style.decorativeShapeA)
        ? {
            enabled: typeof style.decorativeShapeA.enabled === 'boolean' ? style.decorativeShapeA.enabled : true,
            type:
              style.decorativeShapeA.type === 'square' ||
              style.decorativeShapeA.type === 'ring' ||
              style.decorativeShapeA.type === 'bar'
                ? style.decorativeShapeA.type
                : 'circle',
            width: typeof style.decorativeShapeA.width === 'number' ? Math.min(360, Math.max(30, style.decorativeShapeA.width)) : 120,
            height: typeof style.decorativeShapeA.height === 'number' ? Math.min(360, Math.max(30, style.decorativeShapeA.height)) : 120,
            size: typeof style.decorativeShapeA.size === 'number' ? Math.min(360, Math.max(30, style.decorativeShapeA.size)) : 120,
            color: typeof style.decorativeShapeA.color === 'string' ? style.decorativeShapeA.color : '#1d4ed8',
            opacity: typeof style.decorativeShapeA.opacity === 'number' ? Math.min(1, Math.max(0.05, style.decorativeShapeA.opacity)) : 0.15,
            x: typeof style.decorativeShapeA.x === 'number' ? Math.min(100, Math.max(0, style.decorativeShapeA.x)) : 86,
            y: typeof style.decorativeShapeA.y === 'number' ? Math.min(100, Math.max(0, style.decorativeShapeA.y)) : 10,
            rotation: typeof style.decorativeShapeA.rotation === 'number' ? Math.min(180, Math.max(-180, style.decorativeShapeA.rotation)) : 0,
          }
        : {
            enabled: true,
            type: 'circle',
            width: 120,
            height: 120,
            size: 120,
            color: '#1d4ed8',
            opacity: 0.15,
            x: 86,
            y: 10,
            rotation: 0,
          },
      decorativeShapeB: isRecord(style.decorativeShapeB)
        ? {
            enabled: typeof style.decorativeShapeB.enabled === 'boolean' ? style.decorativeShapeB.enabled : true,
            type:
              style.decorativeShapeB.type === 'circle' ||
              style.decorativeShapeB.type === 'ring' ||
              style.decorativeShapeB.type === 'bar'
                ? style.decorativeShapeB.type
                : 'square',
            width: typeof style.decorativeShapeB.width === 'number' ? Math.min(360, Math.max(30, style.decorativeShapeB.width)) : 180,
            height: typeof style.decorativeShapeB.height === 'number' ? Math.min(360, Math.max(30, style.decorativeShapeB.height)) : 48,
            size: typeof style.decorativeShapeB.size === 'number' ? Math.min(360, Math.max(30, style.decorativeShapeB.size)) : 120,
            color: typeof style.decorativeShapeB.color === 'string' ? style.decorativeShapeB.color : '#0f172a',
            opacity: typeof style.decorativeShapeB.opacity === 'number' ? Math.min(1, Math.max(0.05, style.decorativeShapeB.opacity)) : 0.1,
            x: typeof style.decorativeShapeB.x === 'number' ? Math.min(100, Math.max(0, style.decorativeShapeB.x)) : 6,
            y: typeof style.decorativeShapeB.y === 'number' ? Math.min(100, Math.max(0, style.decorativeShapeB.y)) : 86,
            rotation: typeof style.decorativeShapeB.rotation === 'number' ? Math.min(180, Math.max(-180, style.decorativeShapeB.rotation)) : -12,
          }
        : {
            enabled: true,
            type: 'square',
            width: 180,
            height: 48,
            size: 120,
            color: '#0f172a',
            opacity: 0.1,
            x: 6,
            y: 86,
            rotation: -12,
          },
    },
  }
}

export function useResumeDocumentState(templateVariant: Ref<ResumeTemplateVariant>) {
  const state = useState<ResumeDocumentCustomizationState>('resume-document-customization-state', () => ({
    customization: normalizeModel(null, templateVariant.value),
  }))

  function hydrateFromStorage() {
    if (!import.meta.client) return

    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return

    try {
      const parsed = JSON.parse(raw)
      state.value.customization = normalizeModel(parsed, templateVariant.value)
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }

  function migrateLegacyStorage(layoutSettingsRaw: string | null, sectionLayoutRaw: string | null) {
    if (!import.meta.client) return

    const current = state.value.customization
    let nextStyle = { ...current.style }
    let nextSectionOrder = current.sectionOrder.map(entry => ({ ...entry }))

    if (layoutSettingsRaw) {
      try {
        const parsed = JSON.parse(layoutSettingsRaw) as Partial<{ lineDensity: 'compact' | 'comfortable' }>
        if (parsed.lineDensity) nextStyle = { ...nextStyle, density: parsed.lineDensity }
      } catch {
        // no-op
      }
    }

    if (sectionLayoutRaw) {
      try {
        const parsed = JSON.parse(sectionLayoutRaw)
        nextSectionOrder = normalizeSectionOrder(parsed)
      } catch {
        // no-op
      }
    }

    state.value.customization = {
      ...current,
      style: nextStyle,
      sectionOrder: nextSectionOrder,
    }
  }

  function persist() {
    if (!import.meta.client) return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.value.customization))
  }

  watch(templateVariant, (nextVariant) => {
    state.value.customization = {
      ...state.value.customization,
      templateVariant: nextVariant,
    }
  })

  return {
    storageKey: STORAGE_KEY,
    defaultSectionOrder: DEFAULT_SECTION_ORDER,
    state,
    hydrateFromStorage,
    migrateLegacyStorage,
    persist,
  }
}
