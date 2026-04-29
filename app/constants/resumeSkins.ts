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
    colors: { accent: '#2563eb', page: '#eff6ff', sidebar: '#0b3a78', text: '#0f172a' },
    radius: '10px',
    typography: { family: 'Inter, system-ui, sans-serif', weight: '600', style: 'normal' },
    iconStyle: 'filled',
    sectionStyle: 'accent',
  },
  'skin-midnight-banner': {
    id: 'skin-midnight-banner',
    colors: { accent: '#7cc6ff', page: '#0f172a', sidebar: '#111827', text: '#e2e8f0' },
    radius: '10px',
    typography: { family: 'Inter, system-ui, sans-serif', weight: '500', style: 'normal' },
    iconStyle: 'outline',
    sectionStyle: 'line',
  },
  'skin-minimal-profile': {
    id: 'skin-minimal-profile',
    colors: { accent: '#4b5563', page: '#f8fafc', sidebar: '#e5e7eb', text: '#111827' },
    radius: '0px',
    typography: { family: 'Inter, system-ui, sans-serif', weight: '400', style: 'normal' },
    iconStyle: 'text',
    sectionStyle: 'none',
  },
  'skin-classic': {
    id: 'skin-classic',
    colors: { accent: '#334155', page: '#ffffff', sidebar: '#f8fafc', text: '#0f172a' },
    radius: '0px',
    typography: { family: 'Merriweather, Georgia, serif', weight: '400', style: 'normal' },
    iconStyle: 'text',
    sectionStyle: 'line',
  },
  'skin-modern': {
    id: 'skin-modern',
    colors: { accent: '#0d9488', page: '#f0fdfa', sidebar: '#134e4a', text: '#042f2e' },
    radius: '10px',
    typography: { family: 'Inter, system-ui, sans-serif', weight: '500', style: 'normal' },
    iconStyle: 'filled',
    sectionStyle: 'soft-block',
  },
  'skin-cover-page-terra': {
    id: 'skin-cover-page-terra',
    colors: { accent: '#d97706', page: '#fffbeb', sidebar: '#78350f', text: '#451a03' },
    radius: '10px',
    typography: { family: 'Merriweather, Georgia, serif', weight: '500', style: 'normal' },
    iconStyle: 'text',
    sectionStyle: 'line',
  },
  'skin-cover-page-elegant': {
    id: 'skin-cover-page-elegant',
    colors: { accent: '#7c3aed', page: '#f5f3ff', sidebar: '#3b0764', text: '#2e1065' },
    radius: '10px',
    typography: { family: 'Merriweather, Georgia, serif', weight: '500', style: 'italic' },
    iconStyle: 'text',
    sectionStyle: 'accent',
  },
  'skin-cover-letter-classic': {
    id: 'skin-cover-letter-classic',
    colors: { accent: '#475569', page: '#ffffff', sidebar: '#f8fafc', text: '#1e293b' },
    radius: '0px',
    typography: { family: 'Merriweather, Georgia, serif', weight: '400', style: 'normal' },
    iconStyle: 'text',
    sectionStyle: 'none',
  },
  'skin-cover-letter-modern': {
    id: 'skin-cover-letter-modern',
    colors: { accent: '#0f766e', page: '#f0fdfa', sidebar: '#ccfbf1', text: '#134e4a' },
    radius: '10px',
    typography: { family: 'Inter, system-ui, sans-serif', weight: '500', style: 'normal' },
    iconStyle: 'outline',
    sectionStyle: 'soft-block',
  },
  'skin-graphite-pro': {
    id: 'skin-graphite-pro',
    colors: { accent: '#6366f1', page: '#f8fafc', sidebar: '#1e1b4b', text: '#0f172a' },
    radius: '8px',
    typography: { family: 'Inter, system-ui, sans-serif', weight: '600', style: 'normal' },
    iconStyle: 'rounded',
    sectionStyle: 'accent',
  },
}

export const RESUME_SKIN_IDS = Object.keys(RESUME_SKINS_REGISTRY) as ResumeTemplateSkinId[]
