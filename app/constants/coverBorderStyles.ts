export type CoverBorderStyleId =
  | 'swoosh-right'
  | 'diagonal-ribbon'
  | 'rounded-corners'
  | 'executive-green-frame'
  | 'cyan-side-curve'
  | 'purple-wave-frame'
  | 'top-striped-band'
  | 'bottom-contact-band'
  | 'dual-corner-sweep'
  | 'minimal-corner-tabs'
  | 'gold-signature-line'
  | 'navy-architect-grid'
  | 'coral-profile-orbit'
  | 'emerald-sidebar-notch'
  | 'graphite-double-rule'
  | 'amber-soft-arches'
  | 'royal-blue-cap'
  | 'rose-corner-bloom'
  | 'slate-asymmetric-frame'
  | 'ivory-editorial-mat'
  | 'monogram-watermark-frame'
  | 'executive-foil-corners'
  | 'glassmorphism-orbital'
  | 'luxury-vertical-ribbon'
  | 'midnight-neon-trace'
  | 'botanical-corner-vine'
  | 'atlas-coordinate-grid'
  | 'platinum-inset-frame'
  | 'gradient-silk-sash'
  | 'architect-blueprint-lines'

export type CoverBorderAccentPlacement =
  | 'right-swoosh'
  | 'diagonal-hero'
  | 'all-corners'
  | 'full-frame'
  | 'left-curve'
  | 'wave-frame'
  | 'top-band'
  | 'bottom-band'
  | 'opposite-corners'
  | 'corner-tabs'
  | 'signature-rule'
  | 'grid-frame'
  | 'profile-orbit'
  | 'sidebar-notch'
  | 'double-rule'
  | 'soft-arches'
  | 'header-cap'
  | 'corner-bloom'
  | 'asymmetric-frame'
  | 'editorial-mat'
  | 'monogram-frame'
  | 'foil-corners'
  | 'halo-orbit'
  | 'vertical-ribbon'
  | 'neon-trace'
  | 'corner-vine'
  | 'coordinate-grid'
  | 'inset-frame'
  | 'silk-sash'
  | 'blueprint-lines'

export type CoverBorderStyle = {
  id: CoverBorderStyleId
  name: string
  className: string
  accentPlacement: CoverBorderAccentPlacement
  recommendedPalettes: string[]
  cssVars?: Record<`--${string}`, string>
}

export const COVER_BORDER_STYLES: CoverBorderStyle[] = [
  {
    id: 'swoosh-right',
    name: 'Swoosh right',
    className: 'cover-border--swoosh-right',
    accentPlacement: 'right-swoosh',
    recommendedPalettes: ['ocean', 'corporate-blue', 'sky-light'],
    cssVars: {
      '--cover-border-accent-width': '112px',
      '--cover-border-curve-radius': '64%',
    },
  },
  {
    id: 'diagonal-ribbon',
    name: 'Diagonal ribbon',
    className: 'cover-border--diagonal-ribbon',
    accentPlacement: 'diagonal-hero',
    recommendedPalettes: ['charcoal', 'ruby', 'sunset'],
    cssVars: {
      '--cover-border-ribbon-angle': '-12deg',
      '--cover-border-ribbon-size': '34%',
    },
  },
  {
    id: 'rounded-corners',
    name: 'Rounded corners',
    className: 'cover-border--rounded-corners',
    accentPlacement: 'all-corners',
    recommendedPalettes: ['minimal', 'pearl-light', 'slate'],
    cssVars: {
      '--cover-border-corner-size': '46px',
      '--cover-border-corner-radius': '24px',
    },
  },
  {
    id: 'executive-green-frame',
    name: 'Executive green frame',
    className: 'cover-border--executive-green-frame',
    accentPlacement: 'full-frame',
    recommendedPalettes: ['forest', 'emerald', 'executive'],
    cssVars: {
      '--cover-border-frame-width': '10px',
      '--cover-border-inner-gap': '12px',
    },
  },
  {
    id: 'cyan-side-curve',
    name: 'Cyan side curve',
    className: 'cover-border--cyan-side-curve',
    accentPlacement: 'left-curve',
    recommendedPalettes: ['teal', 'oceanic', 'sky-light'],
    cssVars: {
      '--cover-border-curve-width': '92px',
      '--cover-border-curve-offset': '-26px',
    },
  },
  {
    id: 'purple-wave-frame',
    name: 'Purple wave frame',
    className: 'cover-border--purple-wave-frame',
    accentPlacement: 'wave-frame',
    recommendedPalettes: ['plum', 'violet', 'aurora'],
    cssVars: {
      '--cover-border-wave-height': '76px',
      '--cover-border-wave-opacity': '0.22',
    },
  },
  {
    id: 'top-striped-band',
    name: 'Top striped band',
    className: 'cover-border--top-striped-band',
    accentPlacement: 'top-band',
    recommendedPalettes: ['corporate-blue', 'graphite', 'slate'],
    cssVars: {
      '--cover-border-band-height': '42px',
      '--cover-border-stripe-size': '12px',
    },
  },
  {
    id: 'bottom-contact-band',
    name: 'Bottom contact band',
    className: 'cover-border--bottom-contact-band',
    accentPlacement: 'bottom-band',
    recommendedPalettes: ['urban', 'charcoal', 'teal'],
    cssVars: {
      '--cover-border-band-height': '64px',
      '--cover-border-band-radius': '28px',
    },
  },
  {
    id: 'dual-corner-sweep',
    name: 'Dual corner sweep',
    className: 'cover-border--dual-corner-sweep',
    accentPlacement: 'opposite-corners',
    recommendedPalettes: ['sunset', 'amber', 'terra'],
    cssVars: {
      '--cover-border-sweep-size': '126px',
      '--cover-border-sweep-radius': '72px',
    },
  },
  {
    id: 'minimal-corner-tabs',
    name: 'Minimal corner tabs',
    className: 'cover-border--minimal-corner-tabs',
    accentPlacement: 'corner-tabs',
    recommendedPalettes: ['minimal', 'ivory-light', 'classic'],
    cssVars: {
      '--cover-border-tab-length': '58px',
      '--cover-border-tab-width': '6px',
    },
  },
  {
    id: 'gold-signature-line',
    name: 'Gold signature line',
    className: 'cover-border--gold-signature-line',
    accentPlacement: 'signature-rule',
    recommendedPalettes: ['executive', 'charcoal', 'amber'],
    cssVars: {
      '--cover-border-rule-width': '2px',
      '--cover-border-rule-offset': '38px',
    },
  },
  {
    id: 'navy-architect-grid',
    name: 'Navy architect grid',
    className: 'cover-border--navy-architect-grid',
    accentPlacement: 'grid-frame',
    recommendedPalettes: ['corporate-blue', 'ocean', 'grid-slate'],
    cssVars: {
      '--cover-border-grid-size': '18px',
      '--cover-border-grid-opacity': '0.16',
    },
  },
  {
    id: 'coral-profile-orbit',
    name: 'Coral profile orbit',
    className: 'cover-border--coral-profile-orbit',
    accentPlacement: 'profile-orbit',
    recommendedPalettes: ['rose', 'ruby', 'sunset'],
    cssVars: {
      '--cover-border-orbit-size': '154px',
      '--cover-border-orbit-width': '8px',
    },
  },
  {
    id: 'emerald-sidebar-notch',
    name: 'Emerald sidebar notch',
    className: 'cover-border--emerald-sidebar-notch',
    accentPlacement: 'sidebar-notch',
    recommendedPalettes: ['emerald', 'forest', 'teal'],
    cssVars: {
      '--cover-border-notch-width': '84px',
      '--cover-border-notch-height': '132px',
    },
  },
  {
    id: 'graphite-double-rule',
    name: 'Graphite double rule',
    className: 'cover-border--graphite-double-rule',
    accentPlacement: 'double-rule',
    recommendedPalettes: ['graphite', 'slate', 'charcoal'],
    cssVars: {
      '--cover-border-outer-rule': '4px',
      '--cover-border-inner-rule': '1px',
    },
  },
  {
    id: 'amber-soft-arches',
    name: 'Amber soft arches',
    className: 'cover-border--amber-soft-arches',
    accentPlacement: 'soft-arches',
    recommendedPalettes: ['amber', 'terra', 'ivory-light'],
    cssVars: {
      '--cover-border-arch-width': '118px',
      '--cover-border-arch-opacity': '0.2',
    },
  },
  {
    id: 'royal-blue-cap',
    name: 'Royal blue cap',
    className: 'cover-border--royal-blue-cap',
    accentPlacement: 'header-cap',
    recommendedPalettes: ['corporate-blue', 'ocean', 'classic'],
    cssVars: {
      '--cover-border-cap-height': '74px',
      '--cover-border-cap-radius': '0 0 34px 34px',
    },
  },
  {
    id: 'rose-corner-bloom',
    name: 'Rose corner bloom',
    className: 'cover-border--rose-corner-bloom',
    accentPlacement: 'corner-bloom',
    recommendedPalettes: ['rose', 'plum', 'elegant'],
    cssVars: {
      '--cover-border-bloom-size': '138px',
      '--cover-border-bloom-opacity': '0.18',
    },
  },
  {
    id: 'slate-asymmetric-frame',
    name: 'Slate asymmetric frame',
    className: 'cover-border--slate-asymmetric-frame',
    accentPlacement: 'asymmetric-frame',
    recommendedPalettes: ['slate', 'graphite', 'urban'],
    cssVars: {
      '--cover-border-left-width': '18px',
      '--cover-border-top-width': '7px',
    },
  },

  {
    id: 'monogram-watermark-frame',
    name: 'Monogram watermark frame',
    className: 'cover-border--monogram-watermark-frame',
    accentPlacement: 'monogram-frame',
    recommendedPalettes: ['executive', 'ivory-light', 'classic'],
    cssVars: {
      '--cover-border-monogram-size': '210px',
      '--cover-border-frame-inset': '34px',
    },
  },
  {
    id: 'executive-foil-corners',
    name: 'Executive foil corners',
    className: 'cover-border--executive-foil-corners',
    accentPlacement: 'foil-corners',
    recommendedPalettes: ['charcoal', 'executive', 'amber'],
    cssVars: {
      '--cover-border-foil-size': '132px',
      '--cover-border-foil-weight': '9px',
    },
  },
  {
    id: 'glassmorphism-orbital',
    name: 'Glassmorphism orbital',
    className: 'cover-border--glassmorphism-orbital',
    accentPlacement: 'halo-orbit',
    recommendedPalettes: ['aurora', 'sky-light', 'plum'],
    cssVars: {
      '--cover-border-orbital-size': '340px',
      '--cover-border-glass-opacity': '0.32',
    },
  },
  {
    id: 'luxury-vertical-ribbon',
    name: 'Luxury vertical ribbon',
    className: 'cover-border--luxury-vertical-ribbon',
    accentPlacement: 'vertical-ribbon',
    recommendedPalettes: ['ruby', 'charcoal', 'elegant'],
    cssVars: {
      '--cover-border-ribbon-width': '74px',
      '--cover-border-ribbon-offset': '34px',
    },
  },
  {
    id: 'midnight-neon-trace',
    name: 'Midnight neon trace',
    className: 'cover-border--midnight-neon-trace',
    accentPlacement: 'neon-trace',
    recommendedPalettes: ['midnight', 'ocean', 'violet'],
    cssVars: {
      '--cover-border-neon-blur': '18px',
      '--cover-border-trace-width': '3px',
    },
  },
  {
    id: 'botanical-corner-vine',
    name: 'Botanical corner vine',
    className: 'cover-border--botanical-corner-vine',
    accentPlacement: 'corner-vine',
    recommendedPalettes: ['forest', 'emerald', 'ivory-light'],
    cssVars: {
      '--cover-border-vine-size': '210px',
      '--cover-border-leaf-size': '28px',
    },
  },
  {
    id: 'atlas-coordinate-grid',
    name: 'Atlas coordinate grid',
    className: 'cover-border--atlas-coordinate-grid',
    accentPlacement: 'coordinate-grid',
    recommendedPalettes: ['grid-slate', 'corporate-blue', 'graphite'],
    cssVars: {
      '--cover-border-coordinate-size': '34px',
      '--cover-border-coordinate-opacity': '0.24',
    },
  },
  {
    id: 'platinum-inset-frame',
    name: 'Platinum inset frame',
    className: 'cover-border--platinum-inset-frame',
    accentPlacement: 'inset-frame',
    recommendedPalettes: ['minimal', 'slate', 'classic'],
    cssVars: {
      '--cover-border-platinum-inset': '42px',
      '--cover-border-platinum-glow': '0.22',
    },
  },
  {
    id: 'gradient-silk-sash',
    name: 'Gradient silk sash',
    className: 'cover-border--gradient-silk-sash',
    accentPlacement: 'silk-sash',
    recommendedPalettes: ['aurora', 'rose', 'sunset'],
    cssVars: {
      '--cover-border-sash-width': '190px',
      '--cover-border-sash-opacity': '0.68',
    },
  },
  {
    id: 'architect-blueprint-lines',
    name: 'Architect blueprint lines',
    className: 'cover-border--architect-blueprint-lines',
    accentPlacement: 'blueprint-lines',
    recommendedPalettes: ['corporate-blue', 'ocean', 'grid-slate'],
    cssVars: {
      '--cover-border-blueprint-step': '28px',
      '--cover-border-blueprint-opacity': '0.18',
    },
  },
  {
    id: 'ivory-editorial-mat',
    name: 'Ivory editorial mat',
    className: 'cover-border--ivory-editorial-mat',
    accentPlacement: 'editorial-mat',
    recommendedPalettes: ['ivory-light', 'classic', 'elegant'],
    cssVars: {
      '--cover-border-mat-width': '26px',
      '--cover-border-hairline': '1px',
    },
  },
]

export const COVER_BORDER_STYLE_BY_ID = Object.fromEntries(
  COVER_BORDER_STYLES.map((style) => [style.id, style]),
) as Record<CoverBorderStyleId, CoverBorderStyle>

export const COVER_BORDER_STYLE_IDS = COVER_BORDER_STYLES.map(
  (style) => style.id,
) as CoverBorderStyleId[]

export const getCoverBorderStyle = (id: CoverBorderStyleId): CoverBorderStyle =>
  COVER_BORDER_STYLE_BY_ID[id]
