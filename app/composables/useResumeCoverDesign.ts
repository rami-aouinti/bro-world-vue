import { roundedPxByValue, textStyleVarsByValue, type ResumeTextStyleOption } from '~/composables/useResumeDesignControls'

type CoverTypography = 'sans' | 'serif'
type CoverRounded = 'none' | 'sm' | 'md' | 'lg' | string

type CoverLayoutSettings = {
  dividerStyle?: 'solid' | 'dashed' | 'dotted'
  dividerWeight?: 'none' | 'thin' | 'thick'
}

type CoverDesignOptions = {
  textStyle?: ResumeTextStyleOption['value']
  typography?: CoverTypography
  rounded?: CoverRounded
  layoutSettings?: CoverLayoutSettings
}

const dividerWidthByWeight: Record<NonNullable<CoverLayoutSettings['dividerWeight']>, string> = {
  none: '0px',
  thin: '1px',
  thick: '2px',
}

const roundedKeySet = new Set<keyof typeof roundedPxByValue>(['none', 'sm', 'md', 'lg'])

function resolveTextStyle(textStyle?: ResumeTextStyleOption['value'], typography?: CoverTypography): ResumeTextStyleOption['value'] {
  if (textStyle && textStyle in textStyleVarsByValue) return textStyle
  if (typography === 'serif') return 'serif'
  return 'clean'
}

function resolveRounded(rounded?: CoverRounded) {
  if (!rounded) return roundedPxByValue.md
  if (typeof rounded === 'string' && roundedKeySet.has(rounded as keyof typeof roundedPxByValue)) {
    return roundedPxByValue[rounded as keyof typeof roundedPxByValue]
  }
  return rounded
}

export function buildCoverDesignVars(prefix: 'cp' | 'cl', options: CoverDesignOptions) {
  const resolvedTextStyle = resolveTextStyle(options.textStyle, options.typography)
  const fontVars = textStyleVarsByValue[resolvedTextStyle]
  const dividerWeight = options.layoutSettings?.dividerWeight ?? 'thin'
  const dividerStyle = options.layoutSettings?.dividerStyle ?? 'solid'

  return {
    [`--${prefix}-rounded`]: resolveRounded(options.rounded),
    [`--${prefix}-font-family`]: fontVars.family,
    [`--${prefix}-font-style`]: fontVars.style,
    [`--${prefix}-font-weight`]: fontVars.weight,
    [`--${prefix}-divider-width`]: dividerWidthByWeight[dividerWeight],
    [`--${prefix}-divider-style`]: dividerStyle,
  }
}

export type { CoverLayoutSettings }
