import type { ResumeTemplateVariant } from '~/constants/resumeTemplates'
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
  if (!isRecord(source)) {
    return {
      templateVariant,
      sectionOrder: DEFAULT_SECTION_ORDER.map(entry => ({ ...entry })),
      style: { palette: 'ocean', density: 'comfortable', radius: 'md', typography: 'clean' },
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
      density: style.density === 'compact' ? 'compact' : 'comfortable',
      radius: (style.radius as ResumeDocumentModel['style']['radius']) ?? 'md',
      typography: (style.typography as ResumeDocumentModel['style']['typography']) ?? 'clean',
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
