import type { ResumeLayout, ResumeSkin, ResumeTemplateConfig } from '~/types/resumeTemplateConfig'

export type ResumeBasePreset = {
  id: string
  layoutId: string
  structureId: ResumeLayout['structureId']
  name: string
  thumbnail: string
  tags: string[]
  version: string
}

export type ResumeStylePack = {
  id: ResumeSkin['id']
  skinId: ResumeSkin['id']
  name: string
  tags: string[]
  version: string
}

export type ResumeComposedPresetMeta = {
  id: string
  basePresetId: string
  stylePackId: string
  name: string
  thumbnail: string
  tags: string[]
  version: string
}

export const RESUME_BASE_PRESETS: ResumeBasePreset[] = [
  { id: 'base-no-aside-a', layoutId: 'layout-no-aside-a', structureId: 'no-aside', name: 'Mono Classic Flow', thumbnail: '/img/cv/resume-modern.svg', tags: ['mono', 'classic'], version: '1.0.0' },
  { id: 'base-no-aside-b', layoutId: 'layout-no-aside-b', structureId: 'no-aside', name: 'Mono Skills First', thumbnail: '/img/cv/resume-modern.svg', tags: ['mono', 'skills'], version: '1.0.0' },
  { id: 'base-no-aside-c', layoutId: 'layout-no-aside-c', structureId: 'no-aside', name: 'Mono ATS Mix', thumbnail: '/img/cv/resume-modern.svg', tags: ['mono', 'ats'], version: '1.0.0' },
  { id: 'base-aside-left-a', layoutId: 'layout-aside-left-a', structureId: 'aside-left', name: 'Left Sidebar Standard', thumbnail: '/img/cv/resume-modern.svg', tags: ['left-sidebar'], version: '1.0.0' },
  { id: 'base-aside-left-b', layoutId: 'layout-aside-left-b', structureId: 'aside-left', name: 'Left Sidebar Skills', thumbnail: '/img/cv/resume-modern.svg', tags: ['left-sidebar', 'skills'], version: '1.0.0' },
  { id: 'base-aside-left-c', layoutId: 'layout-aside-left-c', structureId: 'aside-left', name: 'Left Sidebar Hybrid', thumbnail: '/img/cv/resume-modern.svg', tags: ['left-sidebar', 'hybrid'], version: '1.0.0' },
  { id: 'base-aside-right-a', layoutId: 'layout-aside-right-a', structureId: 'aside-right', name: 'Right Sidebar Standard', thumbnail: '/img/cv/resume-modern.svg', tags: ['right-sidebar'], version: '1.0.0' },
  { id: 'base-aside-right-b', layoutId: 'layout-aside-right-b', structureId: 'aside-right', name: 'Right Sidebar Skills', thumbnail: '/img/cv/resume-modern.svg', tags: ['right-sidebar', 'skills'], version: '1.0.0' },
  { id: 'base-aside-right-c', layoutId: 'layout-aside-right-c', structureId: 'aside-right', name: 'Right Sidebar Hybrid', thumbnail: '/img/cv/resume-modern.svg', tags: ['right-sidebar', 'hybrid'], version: '1.0.0' },
  { id: 'base-hero-header', layoutId: 'layout-hero-header-content-split', structureId: 'no-aside', name: 'Hero Header Split', thumbnail: '/img/cv/resume-midnight-banner.svg', tags: ['hero', 'banner'], version: '1.0.0' },
]

export const RESUME_STYLE_PACKS: ResumeStylePack[] = [
  { id: 'skin-classic', skinId: 'skin-classic', name: 'Classic Ink', tags: ['serif', 'traditional'], version: '1.0.0' },
  { id: 'skin-urban', skinId: 'skin-urban', name: 'Urban Slate', tags: ['modern', 'outline'], version: '1.0.0' },
  { id: 'skin-compact-ats', skinId: 'skin-compact-ats', name: 'ATS Compact', tags: ['ats', 'compact'], version: '1.0.0' },
  { id: 'skin-executive', skinId: 'skin-executive', name: 'Executive Premium', tags: ['executive', 'filled'], version: '1.0.0' },
  { id: 'skin-midnight-banner', skinId: 'skin-midnight-banner', name: 'Midnight Banner', tags: ['dark', 'timeline'], version: '1.0.0' },
  { id: 'skin-minimal-profile', skinId: 'skin-minimal-profile', name: 'Minimal Profile', tags: ['minimal', 'light'], version: '1.0.0' },
  { id: 'skin-graphite-pro', skinId: 'skin-graphite-pro', name: 'Graphite Pro', tags: ['graphite', 'rounded'], version: '1.0.0' },
  { id: 'skin-terra', skinId: 'skin-terra', name: 'Terra Warm', tags: ['warm', 'serif'], version: '1.0.0' },
  { id: 'skin-elegant', skinId: 'skin-elegant', name: 'Elegant Ivory', tags: ['elegant', 'clean'], version: '1.0.0' },
  { id: 'skin-oceanic', skinId: 'skin-oceanic', name: 'Oceanic Blue', tags: ['oceanic', 'contrast'], version: '1.0.0' },
]

const INCOHERENT_COMBINATIONS = new Set<string>([
  'base-hero-header::skin-compact-ats',
  'base-hero-header::skin-minimal-profile',
  'base-hero-header::skin-elegant',
  'base-hero-header::skin-classic',
  'base-hero-header::skin-terra',
  'base-hero-header::skin-urban',
  'base-hero-header::skin-graphite-pro',
  'base-hero-header::skin-oceanic',
  'base-hero-header::skin-executive',
  'base-hero-header::skin-midnight-banner',
])

export const RESUME_COMPOSED_PRESET_METADATA: ResumeComposedPresetMeta[] = RESUME_BASE_PRESETS.flatMap(base =>
  RESUME_STYLE_PACKS
    .filter(style => !INCOHERENT_COMBINATIONS.has(`${base.id}::${style.id}`))
    .map(style => ({
      id: `resume-${base.id.replace('base-', '')}-${style.id.replace('skin-', '')}`,
      basePresetId: base.id,
      stylePackId: style.id,
      name: `${base.name} · ${style.name}`,
      thumbnail: base.thumbnail,
      tags: [...new Set([...base.tags, ...style.tags])],
      version: '1.0.0',
    })),
)

if (RESUME_COMPOSED_PRESET_METADATA.length !== 90) {
  throw new Error(`Expected 90 composed resume presets, received ${RESUME_COMPOSED_PRESET_METADATA.length}`)
}

export function buildResumeTemplateFromPreset(meta: ResumeComposedPresetMeta): Pick<ResumeTemplateConfig, 'id' | 'label' | 'subtitle' | 'image'> {
  return {
    id: meta.id,
    label: meta.name,
    subtitle: `Preset ${meta.name} (v${meta.version})`,
    image: meta.thumbnail,
  }
}
