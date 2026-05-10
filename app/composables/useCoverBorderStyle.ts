import { computed, toValue, type MaybeRefOrGetter } from 'vue'
import { COVER_BORDER_STYLE_BY_ID } from '~/constants/coverBorderStyles'

export const COVER_BORDER_SIMPLE_CLASS = 'cover-border--simple'

export const COVER_BORDER_DEFAULTS = {
  enabled: false,
  width: 0,
  color: '#0f172a',
  radius: 0,
} as const

const COVER_BORDER_STYLE_CLASS_MAP = {
  simple: COVER_BORDER_SIMPLE_CLASS,
  'swoosh-right': 'cover-border--swoosh-right',
  'diagonal-ribbon': 'cover-border--diagonal-ribbon',
  'rounded-corners': 'cover-border--rounded-corners',
  'executive-green-frame': 'cover-border--executive-green-frame',
  'cyan-side-curve': 'cover-border--cyan-side-curve',
  'purple-wave-frame': 'cover-border--purple-wave-frame',
  'top-striped-band': 'cover-border--top-striped-band',
  'bottom-contact-band': 'cover-border--bottom-contact-band',
  'dual-corner-sweep': 'cover-border--dual-corner-sweep',
  'minimal-corner-tabs': 'cover-border--minimal-corner-tabs',
  'gold-signature-line': 'cover-border--gold-signature-line',
  'navy-architect-grid': 'cover-border--navy-architect-grid',
  'coral-profile-orbit': 'cover-border--coral-profile-orbit',
  'emerald-sidebar-notch': 'cover-border--emerald-sidebar-notch',
  'graphite-double-rule': 'cover-border--graphite-double-rule',
  'amber-soft-arches': 'cover-border--amber-soft-arches',
  'royal-blue-cap': 'cover-border--royal-blue-cap',
  'rose-corner-bloom': 'cover-border--rose-corner-bloom',
  'slate-asymmetric-frame': 'cover-border--slate-asymmetric-frame',
  'ivory-editorial-mat': 'cover-border--ivory-editorial-mat',
} as const

type CoverBorderStyleId = keyof typeof COVER_BORDER_STYLE_CLASS_MAP

type CoverTemplateDesign = Record<string, any> | null | undefined

type CoverBorderControlValue = MaybeRefOrGetter<unknown>

interface CoverBorderControls {
  enabled?: CoverBorderControlValue
  width?: CoverBorderControlValue
  color?: CoverBorderControlValue
  radius?: CoverBorderControlValue
  style?: CoverBorderControlValue
}

interface CoverBorderValues {
  enabled: boolean
  width: number
  color: string
  radius: number
}

function toFiniteNumber(value: unknown, fallback: number): number {
  const parsed =
    typeof value === 'number' ? value : Number.parseFloat(String(value ?? ''))
  return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeCoverBorderStyleId(style: unknown): CoverBorderStyleId {
  const rawStyle = String(style ?? '')
    .trim()
    .replace(/^cover-border--/, '')

  if (rawStyle && rawStyle in COVER_BORDER_STYLE_CLASS_MAP)
    return rawStyle as CoverBorderStyleId

  return 'simple'
}

function getPageBorder(design: CoverTemplateDesign) {
  return design?.theme?.pageBorder || {}
}

export function getCoverBorderValues(
  design: CoverTemplateDesign,
): CoverBorderValues {
  const pageBorder = getPageBorder(design)

  return {
    enabled: Boolean(pageBorder?.enabled ?? COVER_BORDER_DEFAULTS.enabled),
    width: toFiniteNumber(pageBorder?.width, COVER_BORDER_DEFAULTS.width),
    color: String(pageBorder?.color || COVER_BORDER_DEFAULTS.color),
    radius: toFiniteNumber(pageBorder?.radius, COVER_BORDER_DEFAULTS.radius),
  }
}

export function resolveCoverBorderStyle(design: CoverTemplateDesign) {
  const styleId = normalizeCoverBorderStyleId(
    design?.borderStyle?.id || getPageBorder(design)?.style,
  )

  return {
    styleId,
    className: COVER_BORDER_STYLE_CLASS_MAP[styleId],
  }
}

export function getCoverBorderCssVars(
  values: CoverBorderValues,
  styleId: CoverBorderStyleId = 'simple',
) {
  const presetVars =
    styleId === 'simple' ? {} : COVER_BORDER_STYLE_BY_ID[styleId]?.cssVars || {}

  return {
    ...presetVars,
    '--cp-page-border-width': values.enabled ? `${values.width}px` : '0px',
    '--cp-page-border-color': values.color,
    '--cp-page-border-radius': `${values.radius}px`,
  }
}

export function useCoverBorderStyle(
  design: MaybeRefOrGetter<CoverTemplateDesign>,
  controls: CoverBorderControls = {},
) {
  const resolvedBorderStyle = computed(() => {
    if (controls.style !== undefined) {
      const styleId = normalizeCoverBorderStyleId(toValue(controls.style))

      return {
        styleId,
        className: COVER_BORDER_STYLE_CLASS_MAP[styleId],
      }
    }

    return resolveCoverBorderStyle(toValue(design))
  })

  const coverBorderValues = computed<CoverBorderValues>(() => {
    const defaults = getCoverBorderValues(toValue(design))

    return {
      enabled:
        controls.enabled === undefined
          ? defaults.enabled
          : Boolean(toValue(controls.enabled)),
      width:
        controls.width === undefined
          ? defaults.width
          : toFiniteNumber(toValue(controls.width), defaults.width),
      color:
        controls.color === undefined
          ? defaults.color
          : String(toValue(controls.color) || defaults.color),
      radius:
        controls.radius === undefined
          ? defaults.radius
          : toFiniteNumber(toValue(controls.radius), defaults.radius),
    }
  })

  const coverBorderCssVars = computed(() =>
    getCoverBorderCssVars(
      coverBorderValues.value,
      resolvedBorderStyle.value.styleId,
    ),
  )

  const borderStyleClass = computed(
    () => resolvedBorderStyle.value.className || COVER_BORDER_SIMPLE_CLASS,
  )

  return {
    borderStyleClass,
    coverBorderCssVars,
    coverBorderValues,
    resolvedBorderStyle,
  }
}
