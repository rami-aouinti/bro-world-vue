import type { ResumeTemplateIconStyle, ResumeTemplateSkinId } from '~/types/resumeTemplateConfig'

export type ResumeSkinSectionStyle = 'none' | 'line' | 'accent' | 'soft-block'

export type ResumeSkinTokens = {
  id: ResumeTemplateSkinId
  colors: {
    accent: string
    page: string
    sidebar: string
    text: string
  }
  radius: string
  typography: {
    family: string
    weight: string
    style: string
  }
  iconStyle: ResumeTemplateIconStyle
  sectionStyle: ResumeSkinSectionStyle
}

export const RESUME_SKINS_REGISTRY: Record<ResumeTemplateSkinId, ResumeSkinTokens> = {
  'skin-executive-portrait': {
    id: 'skin-executive-portrait',
    colors: { accent: '#1d4ed8', page: '#f8fafc', sidebar: '#1e3a8a', text: '#0f172a' },
    radius: '10px',
    typography: { family: 'Inter, system-ui, sans-serif', weight: '600', style: 'normal' },
    iconStyle: 'filled',
    sectionStyle: 'accent',
  },
  'skin-midnight-banner': {
    id: 'skin-midnight-banner',
    colors: { accent: '#38bdf8', page: '#0b1120', sidebar: '#111827', text: '#e5e7eb' },
    radius: '10px',
    typography: { family: 'Inter, system-ui, sans-serif', weight: '500', style: 'normal' },
    iconStyle: 'outline',
    sectionStyle: 'line',
  },
  'skin-minimal-profile': {
    id: 'skin-minimal-profile',
    colors: { accent: '#6b7280', page: '#ffffff', sidebar: '#f3f4f6', text: '#111827' },
    radius: '0px',
    typography: { family: 'Inter, system-ui, sans-serif', weight: '400', style: 'normal' },
    iconStyle: 'text',
    sectionStyle: 'none',
  },
  'skin-classic': {
    id: 'skin-classic',
    colors: { accent: '#1f2937', page: '#ffffff', sidebar: '#f8fafc', text: '#111827' },
    radius: '0px',
    typography: { family: 'Merriweather, Georgia, serif', weight: '400', style: 'normal' },
    iconStyle: 'text',
    sectionStyle: 'line',
  },
  'skin-modern': {
    id: 'skin-modern',
    colors: { accent: '#0f766e', page: '#f0fdfa', sidebar: '#134e4a', text: '#0f172a' },
    radius: '10px',
    typography: { family: 'Inter, system-ui, sans-serif', weight: '500', style: 'normal' },
    iconStyle: 'filled',
    sectionStyle: 'soft-block',
  },
  'skin-cover-page-terra': {
    id: 'skin-cover-page-terra',
    colors: { accent: '#b45309', page: '#fffbeb', sidebar: '#78350f', text: '#3f2a1d' },
    radius: '10px',
    typography: { family: 'Merriweather, Georgia, serif', weight: '500', style: 'normal' },
    iconStyle: 'text',
    sectionStyle: 'line',
  },
  'skin-cover-page-elegant': {
    id: 'skin-cover-page-elegant',
    colors: { accent: '#6d28d9', page: '#faf5ff', sidebar: '#4c1d95', text: '#2e1065' },
    radius: '10px',
    typography: { family: 'Merriweather, Georgia, serif', weight: '500', style: 'italic' },
    iconStyle: 'text',
    sectionStyle: 'accent',
  },
  'skin-cover-letter-classic': {
    id: 'skin-cover-letter-classic',
    colors: { accent: '#334155', page: '#ffffff', sidebar: '#f8fafc', text: '#1e293b' },
    radius: '0px',
    typography: { family: 'Merriweather, Georgia, serif', weight: '400', style: 'normal' },
    iconStyle: 'text',
    sectionStyle: 'none',
  },
  'skin-cover-letter-modern': {
    id: 'skin-cover-letter-modern',
    colors: { accent: '#0f766e', page: '#f0fdfa', sidebar: '#99f6e4', text: '#134e4a' },
    radius: '10px',
    typography: { family: 'Inter, system-ui, sans-serif', weight: '500', style: 'normal' },
    iconStyle: 'outline',
    sectionStyle: 'soft-block',
  },
  'skin-graphite-pro': {
    id: 'skin-graphite-pro',
    colors: { accent: '#4f46e5', page: '#f8fafc', sidebar: '#312e81', text: '#0f172a' },
    radius: '8px',
    typography: { family: 'Inter, system-ui, sans-serif', weight: '600', style: 'normal' },
    iconStyle: 'rounded',
    sectionStyle: 'accent',
  },
}

export const RESUME_SKIN_IDS = Object.keys(RESUME_SKINS_REGISTRY) as ResumeTemplateSkinId[]
