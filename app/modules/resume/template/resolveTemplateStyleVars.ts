import type { CSSProperties } from 'vue'

type AnyTemplate = any

const DENSITY_MAP = {
  compact: { space: '8px', sectionPad: '8px', panelPad: '10px', gap: '14px' },
  normal: { space: '12px', sectionPad: '12px', panelPad: '12px', gap: '20px' },
  comfortable: { space: '14px', sectionPad: '14px', panelPad: '14px', gap: '24px' },
  spacious: { space: '16px', sectionPad: '16px', panelPad: '16px', gap: '28px' },
} as const

const TEXT_STYLE_MAP = {
  clean: { family: "'Inter', 'Segoe UI', sans-serif", letterSpacing: 'normal' },
  italic: { family: "'Inter', 'Segoe UI', sans-serif", letterSpacing: '0.01em' },
  serif: { family: "'Merriweather', 'Georgia', serif", letterSpacing: 'normal' },
  mono: { family: "'JetBrains Mono', 'SFMono-Regular', monospace", letterSpacing: '0.01em' },
  display: { family: "'Poppins', 'Inter', sans-serif", letterSpacing: '0.015em' },
} as const

function normalizeSize(value: unknown, fallback: string): string {
  if (typeof value === 'number') return `${value}px`
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  return trimmed || fallback
}

export function resolveTemplateStyleVars(template?: AnyTemplate): CSSProperties {
  const density = DENSITY_MAP[template?.theme?.density as keyof typeof DENSITY_MAP] ?? DENSITY_MAP.normal
  const textStyle = TEXT_STYLE_MAP[template?.theme?.textStyle as keyof typeof TEXT_STYLE_MAP] ?? TEXT_STYLE_MAP.clean
  const lineStyle = template?.theme?.line ?? 'solid'

  return {
    '--primary': template?.theme?.palette?.primary ?? '#0f4c81',
    '--secondary': template?.theme?.palette?.secondary ?? '#334155',
    '--text': template?.theme?.palette?.text ?? '#0f172a',
    '--muted': template?.theme?.palette?.muted ?? '#64748b',
    '--page-bg': template?.theme?.palette?.pageBackground ?? '#ffffff',
    '--aside-width': normalizeSize(template?.aside?.width, '240px'),
    '--layout-gap': density.gap,
    '--section-space': density.space,
    '--section-pad': density.sectionPad,
    '--panel-pad': density.panelPad,
    '--font-family': textStyle.family,
    '--font-letter-spacing': textStyle.letterSpacing,
    '--font-style': template?.theme?.textStyle === 'italic' ? 'italic' : 'normal',
    '--line-style': lineStyle,
    '--line-color': template?.theme?.palette?.muted ?? '#cbd5e1',
    background: template?.theme?.palette?.pageBackground ?? '#ffffff',
    color: template?.theme?.palette?.text ?? '#0f172a',
  } as CSSProperties
}
