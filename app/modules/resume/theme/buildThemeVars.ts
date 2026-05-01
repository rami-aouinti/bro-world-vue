export type ResumePhotoConfig = {
  position?: 'left' | 'right'
  size?: number
  border?: number
  shape?: 'circle' | 'rounded' | 'square' | 'hex' | 'blob'
}

export type ResumeThemeConfig = {
  primary?: string
  pageBg?: string
  asideWidth?: number
  lineStyle?: string
  fontStyle?: string
  photo?: ResumePhotoConfig
}

const toPx = (value: unknown, fallback: number) => {
  const n = typeof value === 'number' ? value : Number(value)
  return `${Number.isFinite(n) ? n : fallback}px`
}

export function buildThemeVars(
  config: ResumeThemeConfig = {},
): Record<string, string> {
  const photoShape = config.photo?.shape ?? 'circle'
  const photoRadius =
    photoShape === 'square'
      ? '0px'
      : photoShape === 'rounded'
        ? '16px'
        : photoShape === 'blob'
          ? '58% 42% 62% 38% / 36% 56% 44% 64%'
          : '999px'
  const photoClipPath =
    photoShape === 'hex'
      ? 'polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0 50%)'
      : photoShape === 'circle'
        ? 'circle(50% at 50% 50%)'
        : 'none'

  return {
    '--primary': config.primary ?? 'var(--cv-accent)',
    '--page-bg': config.pageBg ?? 'var(--cv-surface)',
    '--aside-width': toPx(config.asideWidth, 280),
    '--line-style': config.lineStyle ?? 'solid',
    '--font-style': config.fontStyle ?? 'normal',
    '--photo-position': config.photo?.position ?? 'right',
    '--photo-size': toPx(config.photo?.size, 96),
    '--photo-border': toPx(config.photo?.border, 4),
    '--photo-shape': photoShape,
    '--photo-radius': photoRadius,
    '--photo-clip-path': photoClipPath,
  }
}
