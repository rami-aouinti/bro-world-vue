import type {
  ResumeLayout,
  ResumeSkin,
  ResumeStructure,
  ResumeTemplateConfig,
  ResumeTemplateType,
} from '~/types/resumeTemplateConfig'
import { RESUME_SKIN_PALETTES, type ResumeSkinPaletteId } from '~/constants/resumeDesign'

const DEFAULT_VISIBLE_OPTIONS: ResumeTemplateConfig['visibleOptions'] = {
  photo: true,
  twoColumn: true,
  ats: true,
  docx: true,
  customized: true,
  free: true,
  timeline: false,
}

const RESUME_SECTIONS: ResumeLayout['sections'][number]['section'][] = [
  'experience',
  'education',
  'project',
  'certification',
  'skill',
  'language',
  'reference',
  'hobby',
]

const createSections = (
  distribution: Array<{ zone: 'main' | 'aside'; sections: ResumeLayout['sections'][number]['section'][] }>,
): ResumeLayout['sections'] => {
  const byPriority = [...distribution[0].sections, ...distribution.slice(1).flatMap(entry => entry.sections)]

  return distribution.flatMap((entry, zoneIndex) =>
    entry.sections.map((section, sectionIndex) => ({
      section,
      zone: entry.zone,
      order: sectionIndex + 1,
      priority: byPriority.indexOf(section) + 1 + zoneIndex,
    })),
  )
}

export const RESUME_STRUCTURES_CATALOG: ResumeStructure[] = [
  { id: 'no-aside' },
  { id: 'aside-left' },
  { id: 'aside-right' },
]

export const RESUME_LAYOUTS_CATALOG: ResumeLayout[] = [
  { id: 'layout-no-aside-a', structureId: 'no-aside', sections: createSections([{ zone: 'main', sections: RESUME_SECTIONS }]) },
  {
    id: 'layout-no-aside-b',
    structureId: 'no-aside',
    sections: createSections([
      { zone: 'main', sections: ['experience', 'project', 'education', 'certification', 'skill', 'language', 'reference', 'hobby'] },
    ]),
  },
  {
    id: 'layout-no-aside-c',
    structureId: 'no-aside',
    sections: createSections([
      { zone: 'main', sections: ['education', 'experience', 'skill', 'project', 'certification', 'language', 'reference', 'hobby'] },
    ]),
  },
  {
    id: 'layout-aside-left-a',
    structureId: 'aside-left',
    sections: createSections([
      { zone: 'main', sections: ['experience', 'project', 'education', 'certification'] },
      { zone: 'aside', sections: ['skill', 'language', 'reference', 'hobby'] },
    ]),
  },
  {
    id: 'layout-aside-left-b',
    structureId: 'aside-left',
    sections: createSections([
      { zone: 'main', sections: ['experience', 'education', 'project', 'certification'] },
      { zone: 'aside', sections: ['skill', 'reference', 'language', 'hobby'] },
    ]),
  },
  {
    id: 'layout-aside-left-c',
    structureId: 'aside-left',
    sections: createSections([
      { zone: 'main', sections: ['project', 'experience', 'education', 'certification'] },
      { zone: 'aside', sections: ['skill', 'language', 'hobby', 'reference'] },
    ]),
  },
  {
    id: 'layout-aside-right-a',
    structureId: 'aside-right',
    sections: createSections([
      { zone: 'main', sections: ['experience', 'education', 'project', 'certification'] },
      { zone: 'aside', sections: ['skill', 'language', 'reference', 'hobby'] },
    ]),
  },
  {
    id: 'layout-aside-right-b',
    structureId: 'aside-right',
    sections: createSections([
      { zone: 'main', sections: ['experience', 'project', 'education', 'certification'] },
      { zone: 'aside', sections: ['skill', 'reference', 'language', 'hobby'] },
    ]),
  },
  {
    id: 'layout-aside-right-c',
    structureId: 'aside-right',
    sections: createSections([
      { zone: 'main', sections: ['project', 'experience', 'education', 'certification'] },
      { zone: 'aside', sections: ['skill', 'language', 'hobby', 'reference'] },
    ]),
  },
]

export const RESUME_SKINS_CATALOG: ResumeSkin[] = [
  { id: 'skin-classic', palette: 'classic', radius: 'none', typography: 'serif', sectionVariant: 'classic', iconStyle: 'text' },
  { id: 'skin-urban', palette: 'urban', radius: 'soft', typography: 'modern', sectionVariant: 'list', iconStyle: 'outline' },
  { id: 'skin-compact-ats', palette: 'compact-ats', radius: 'none', typography: 'clean', sectionVariant: 'compact', iconStyle: 'text' },
  { id: 'skin-executive', palette: 'executive', radius: 'soft', typography: 'executive', sectionVariant: 'detailed', iconStyle: 'filled' },
  { id: 'skin-midnight-banner', palette: 'midnight', radius: 'soft', typography: 'modern', sectionVariant: 'timeline', iconStyle: 'outline' },
  { id: 'skin-minimal-profile', palette: 'minimal', radius: 'none', typography: 'clean', sectionVariant: 'compact', iconStyle: 'text' },
  { id: 'skin-graphite-pro', palette: 'graphite', radius: 'soft', typography: 'sans', sectionVariant: 'detailed', iconStyle: 'rounded' },
  { id: 'skin-terra', palette: 'terra', radius: 'soft', typography: 'serif', sectionVariant: 'classic', iconStyle: 'outline' },
  { id: 'skin-elegant', palette: 'elegant', radius: 'soft', typography: 'serif', sectionVariant: 'compact', iconStyle: 'text' },
  { id: 'skin-oceanic', palette: 'oceanic', radius: 'soft', typography: 'sans', sectionVariant: 'list', iconStyle: 'filled' },
]

RESUME_SKINS_CATALOG.forEach((skin) => {
  if (!RESUME_SKIN_PALETTES[skin.palette as ResumeSkinPaletteId]) {
    throw new Error(`Unknown palette mapping for skin ${skin.id}`)
  }
})

const COVER_TEMPLATES: ResumeTemplateConfig[] = [
  { id: 'cover-page-terra', structureId: 'no-aside', layoutId: 'layout-no-aside-a', skinId: 'skin-terra', label: 'Cover Page Terra', subtitle: 'Simple cover page with title and photo', type: 'cover-page', image: '/img/cv/cv-4.png', templateId: 'cv-socle', visibleOptions: { ...DEFAULT_VISIBLE_OPTIONS, twoColumn: false } },
  { id: 'cover-page-elegant', structureId: 'no-aside', layoutId: 'layout-no-aside-a', skinId: 'skin-elegant', label: 'Cover Page Elegant', subtitle: 'Centered elegant cover page', type: 'cover-page', image: '/img/cv/cv-5.png', templateId: 'cv-socle', visibleOptions: { ...DEFAULT_VISIBLE_OPTIONS, photo: false, twoColumn: false } },
  { id: 'cover-letter-classic', structureId: 'no-aside', layoutId: 'layout-no-aside-a', skinId: 'skin-classic', label: 'Cover Letter Classic', subtitle: 'Classic letter ready to customize', type: 'cover-letter', image: '/img/cv/cv-1.png', templateId: 'cv-socle', visibleOptions: { ...DEFAULT_VISIBLE_OPTIONS, photo: false, twoColumn: false } },
  { id: 'cover-letter-modern', structureId: 'no-aside', layoutId: 'layout-no-aside-a', skinId: 'skin-urban', label: 'Cover Letter Modern', subtitle: 'Modern letter highlighting profile', type: 'cover-letter', image: '/img/cv/cv-3.png', templateId: 'cv-socle', visibleOptions: { ...DEFAULT_VISIBLE_OPTIONS, twoColumn: false, ats: false } },
]

const formatLabel = (value: string): string =>
  value
    .replace(/^layout-/, '')
    .replace(/^skin-/, '')
    .split('-')
    .map(token => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ')

const RESUME_GENERATED_TEMPLATES: ResumeTemplateConfig[] = RESUME_LAYOUTS_CATALOG.flatMap(layout =>
  RESUME_SKINS_CATALOG.map(skin => {
    const isTwoColumn = layout.structureId !== 'no-aside'
    const templateType: ResumeTemplateType = 'resume'

    return {
      id: `${layout.id}__${skin.id}`,
      structureId: layout.structureId,
      layoutId: layout.id,
      skinId: skin.id,
      label: `${formatLabel(layout.id)} · ${formatLabel(skin.id)}`,
      subtitle: `Template CV ${formatLabel(layout.id)} avec skin ${formatLabel(skin.id)}`,
      type: templateType,
      image: '/img/cv/resume-modern.svg',
      templateId: 'cv-socle',
      visibleOptions: {
        ...DEFAULT_VISIBLE_OPTIONS,
        twoColumn: isTwoColumn,
        timeline: false,
      },
    }
  }),
)

export const RESUME_TEMPLATES_CATALOG: ResumeTemplateConfig[] = [...RESUME_GENERATED_TEMPLATES, ...COVER_TEMPLATES]
