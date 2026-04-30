import { computed } from 'vue'

export type CardSuit = '♠' | '♣' | '♥' | '♦'

export type CardAnimationPresetName = 'deal' | 'flip' | 'lift' | 'invalidShake'

export interface CardAnimationPreset {
  keyframes: Keyframe[]
  options: KeyframeAnimationOptions
}

export function useCardTheme() {
  const palette = {
    suits: {
      red: '#C1121F',
      black: '#111827',
    },
    accent: {
      primary: '#3B82F6',
      success: '#16A34A',
      warning: '#D97706',
      danger: '#DC2626',
      info: '#0891B2',
    },
    table: {
      felt: '#0D4A2B',
      feltAlt: '#0A3F24',
    },
  } as const

  const tokens = {
    spacing: {
      xxs: '0.125rem',
      xs: '0.25rem',
      sm: '0.5rem',
      md: '0.75rem',
      lg: '1rem',
      xl: '1.5rem',
    },
    radius: {
      sm: '0.5rem',
      md: '0.75rem',
      lg: '1rem',
      pill: '999px',
    },
    shadow: {
      resting: '0 6px 14px rgba(15, 23, 42, 0.22)',
      raised: '0 12px 24px rgba(15, 23, 42, 0.3)',
      focus: '0 0 0 3px rgba(59, 130, 246, 0.38)',
      invalid: '0 0 0 2px rgba(220, 38, 38, 0.38)',
    },
  } as const

  const animationPresets = computed<
    Record<CardAnimationPresetName, CardAnimationPreset>
  >(() => ({
    deal: {
      keyframes: [
        { transform: 'translateY(-26px) scale(0.94)', opacity: 0 },
        { transform: 'translateY(0) scale(1)', opacity: 1 },
      ],
      options: {
        duration: 220,
        easing: 'cubic-bezier(.2,.8,.2,1)',
        fill: 'both',
      },
    },
    flip: {
      keyframes: [
        { transform: 'rotateY(0deg)' },
        { transform: 'rotateY(90deg)' },
        { transform: 'rotateY(0deg)' },
      ],
      options: { duration: 260, easing: 'ease-in-out', fill: 'both' },
    },
    lift: {
      keyframes: [
        { transform: 'translateY(0)' },
        { transform: 'translateY(-10px)' },
      ],
      options: { duration: 160, easing: 'ease-out', fill: 'both' },
    },
    invalidShake: {
      keyframes: [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-4px)' },
        { transform: 'translateX(4px)' },
        { transform: 'translateX(-2px)' },
        { transform: 'translateX(2px)' },
        { transform: 'translateX(0)' },
      ],
      options: { duration: 320, easing: 'ease-in-out', fill: 'both' },
    },
  }))

  const isRedSuit = (suit: CardSuit | string) => suit === '♥' || suit === '♦'

  return {
    palette,
    tokens,
    animationPresets,
    isRedSuit,
  }
}
