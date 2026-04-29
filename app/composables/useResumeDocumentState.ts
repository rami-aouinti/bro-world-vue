import type { ResumeTemplateVariant } from '~/constants/resumeTemplates'
import { resolveTemplateSkin } from '~/constants/resumeTemplateSkins'
import { DEFAULT_RESUME_STYLE, DEFAULT_SECTION_ORDER } from '~/constants/resumeDefaults'
import type {
  ResumeDocumentCustomizationState,
  ResumeDocumentModel,
  ResumeSectionLayoutModel,
} from '~/types/resumeDocumentModel'

const STORAGE_KEY = 'resume-document-model-v1'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function clampNumber(value: unknown, min: number, max: number, fallback: number, round = false) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  const clamped = Math.min(max, Math.max(min, value))
  return round ? Math.round(clamped) : clamped
}

export function normalizeEnum<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === 'string' && allowed.includes(value as T) ? (value as T) : fallback
}

export function normalizeDecorativeShape(
  shape: unknown,
  defaults: ResumeDocumentModel['style']['decorativeShapeA'],
  allowedTypes: readonly ResumeDocumentModel['style']['decorativeShapeA']['type'][],
): ResumeDocumentModel['style']['decorativeShapeA'] {
  if (!isRecord(shape)) return { ...defaults }

  return {
    enabled: typeof shape.enabled === 'boolean' ? shape.enabled : defaults.enabled,
    type: normalizeEnum(shape.type, allowedTypes, defaults.type),
    width: clampNumber(shape.width, 30, 360, defaults.width),
    height: clampNumber(shape.height, 30, 360, defaults.height),
    size: clampNumber(shape.size, 30, 360, defaults.size),
    color: typeof shape.color === 'string' ? shape.color : defaults.color,
    opacity: clampNumber(shape.opacity, 0.05, 1, defaults.opacity),
    x: clampNumber(shape.x, 0, 100, defaults.x),
    y: clampNumber(shape.y, 0, 100, defaults.y),
    rotation: clampNumber(shape.rotation, -180, 180, defaults.rotation),
  }
}

export function normalizeSectionOrder(sectionOrder: unknown): ResumeSectionLayoutModel[] {
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

export function normalizeStyle(
  styleSource: unknown,
  defaultLayoutMode: ResumeDocumentModel['style']['layoutMode'],
): ResumeDocumentModel['style'] {
  const style = isRecord(styleSource) ? styleSource : {}
  const defaults = { ...DEFAULT_RESUME_STYLE, layoutMode: defaultLayoutMode }

  return {
    palette: typeof style.palette === 'string' ? style.palette : defaults.palette,
    pageBackground: normalizeEnum(style.pageBackground, ['white', 'sky-light', 'pearl-light', 'ivory-light'] as const, defaults.pageBackground),
    density: normalizeEnum(style.density, ['compact', 'comfortable'] as const, defaults.density),
    radius: (style.radius as ResumeDocumentModel['style']['radius']) ?? defaults.radius,
    typography: (style.typography as ResumeDocumentModel['style']['typography']) ?? defaults.typography,
    photoPosition: normalizeEnum(style.photoPosition, ['left', 'right'] as const, defaults.photoPosition),
    asideWidth: clampNumber(style.asideWidth, 220, 380, defaults.asideWidth, true),
    showSectionIcons: typeof style.showSectionIcons === 'boolean' ? style.showSectionIcons : defaults.showSectionIcons,
    showContactIcons: typeof style.showContactIcons === 'boolean' ? style.showContactIcons : defaults.showContactIcons,
    sectionIconStyle: normalizeEnum(style.sectionIconStyle, ['outline', 'filled', 'rounded'] as const, defaults.sectionIconStyle),
    iconSize: normalizeEnum(style.iconSize, ['s', 'm', 'l'] as const, defaults.iconSize),
    iconColor: normalizeEnum(style.iconColor, ['accent', 'neutral'] as const, defaults.iconColor),
    layoutMode: normalizeEnum(style.layoutMode, ['aside-left', 'aside-right', 'no-aside'] as const, defaults.layoutMode),
    decorativeShapeA: normalizeDecorativeShape(style.decorativeShapeA, defaults.decorativeShapeA, ['circle', 'square', 'ring', 'bar'] as const),
    decorativeShapeB: normalizeDecorativeShape(style.decorativeShapeB, defaults.decorativeShapeB, ['circle', 'square', 'ring', 'bar'] as const),
  }
}

export function normalizeModel(source: unknown, templateVariant: ResumeTemplateVariant): ResumeDocumentModel {
  const defaultLayoutMode = resolveTemplateSkin(templateVariant).layoutMode

  if (!isRecord(source)) {
    return {
      templateVariant,
      sectionOrder: DEFAULT_SECTION_ORDER.map(entry => ({ ...entry })),
      style: normalizeStyle(null, defaultLayoutMode),
    }
  }

  return {
    templateVariant: typeof source.templateVariant === 'string' ? source.templateVariant as ResumeTemplateVariant : templateVariant,
    sectionOrder: normalizeSectionOrder(source.sectionOrder),
    style: normalizeStyle(source.style, defaultLayoutMode),
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
