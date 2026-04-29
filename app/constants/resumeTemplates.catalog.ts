import type {
  ResumeLayout,
  ResumeSkin,
  ResumeStructure,
  ResumeTemplateConfig,
} from '~/types/resumeTemplateConfig'

const DEFAULT_RESUME_SECTIONS: ResumeLayout['sections'] = [
  'experience',
  'education',
  'project',
  'certification',
  'skill',
  'language',
  'reference',
  'hobby',
].map((section, index) => ({ section, zone: index < 4 ? 'main' : 'aside', order: index + 1, priority: index + 1 }))

export const RESUME_STRUCTURES_CATALOG: ResumeStructure[] = [
  { id: 'no-aside' },
  { id: 'aside-left' },
  { id: 'aside-right' },
]

export const RESUME_LAYOUTS_CATALOG: ResumeLayout[] = [
  { id: 'layout-split-left', structureId: 'aside-left', sections: DEFAULT_RESUME_SECTIONS },
  { id: 'layout-split-right', structureId: 'aside-right', sections: DEFAULT_RESUME_SECTIONS },
  {
    id: 'layout-stacked',
    structureId: 'no-aside',
    sections: DEFAULT_RESUME_SECTIONS.map(entry => ({ ...entry, zone: 'main' })),
  },
]

export const RESUME_SKINS_CATALOG: ResumeSkin[] = [
  { id: 'skin-executive-portrait', palette: 'corporate-blue', radius: 'soft', typography: 'executive', sectionVariant: 'detailed', iconStyle: 'filled' },
  { id: 'skin-midnight-banner', palette: 'midnight', radius: 'soft', typography: 'modern', sectionVariant: 'timeline', iconStyle: 'outline' },
  { id: 'skin-minimal-profile', palette: 'minimal', radius: 'none', typography: 'clean', sectionVariant: 'compact', iconStyle: 'text' },
  { id: 'skin-classic', palette: 'classic', radius: 'none', typography: 'serif', sectionVariant: 'classic', iconStyle: 'text' },
  { id: 'skin-modern', palette: 'modern', radius: 'soft', typography: 'sans', sectionVariant: 'list', iconStyle: 'filled' },
  { id: 'skin-cover-page-terra', palette: 'terra', radius: 'soft', typography: 'serif', iconStyle: 'text' },
  { id: 'skin-cover-page-elegant', palette: 'elegant', radius: 'soft', typography: 'serif', iconStyle: 'text' },
  { id: 'skin-cover-letter-classic', palette: 'classic', radius: 'none', typography: 'serif', iconStyle: 'text' },
  { id: 'skin-cover-letter-modern', palette: 'modern', radius: 'soft', typography: 'sans', iconStyle: 'outline' },
]

export const RESUME_TEMPLATES_CATALOG: ResumeTemplateConfig[] = [
  {
    id: 'executive-portrait', structureId: 'aside-left', layoutId: 'layout-split-left', skinId: 'skin-executive-portrait', label: 'Executive Portrait', subtitle: 'Large hero name with rounded portrait focus', type: 'resume', image: '/img/cv/resume-executive-portrait.svg', templateId: 'cv-socle', visibleOptions: { photo: true, twoColumn: true, ats: true, docx: true, customized: true, free: true, timeline: false },
  },
  { id: 'midnight-banner', structureId: 'aside-right', layoutId: 'layout-split-right', skinId: 'skin-midnight-banner', label: 'Midnight Banner', subtitle: 'Dark header band with profile image and split details', type: 'resume', image: '/img/cv/resume-midnight-banner.svg', templateId: 'cv-socle', visibleOptions: { photo: true, twoColumn: true, ats: false, docx: true, customized: true, free: true, timeline: true } },
  { id: 'minimal-profile', structureId: 'aside-right', layoutId: 'layout-split-right', skinId: 'skin-minimal-profile', label: 'Minimal Profile', subtitle: 'Clean profile block with light sidebar and compact details', type: 'resume', image: '/img/cv/resume-minimal-profile.svg', templateId: 'cv-socle', visibleOptions: { photo: true, twoColumn: true, ats: true, docx: true, customized: true, free: true, timeline: false } },
  { id: 'classic', structureId: 'no-aside', layoutId: 'layout-stacked', skinId: 'skin-classic', label: 'Classic', subtitle: 'Simple and readable format', type: 'resume', image: '/img/cv/resume-classic.svg', templateId: 'cv-socle', visibleOptions: { photo: false, twoColumn: false, ats: false, docx: true, customized: false, free: true, timeline: false } },
  { id: 'modern', structureId: 'aside-right', layoutId: 'layout-split-right', skinId: 'skin-modern', label: 'Modern', subtitle: 'Clean blocks and balanced content', type: 'resume', image: '/img/cv/resume-modern.svg', templateId: 'cv-socle', visibleOptions: { photo: true, twoColumn: true, ats: false, docx: true, customized: true, free: true, timeline: false } },

  { id: 'cover-page-terra', structureId: 'no-aside', layoutId: 'layout-stacked', skinId: 'skin-cover-page-terra', label: 'Cover Page Terra', subtitle: 'Simple cover page with title and photo', type: 'cover-page', image: '/img/cv/cv-4.png', templateId: 'cv-socle', visibleOptions: { photo: true, twoColumn: false, ats: false, docx: true, customized: true, free: true, timeline: false } },
  { id: 'cover-page-elegant', structureId: 'no-aside', layoutId: 'layout-stacked', skinId: 'skin-cover-page-elegant', label: 'Cover Page Elegant', subtitle: 'Centered elegant cover page', type: 'cover-page', image: '/img/cv/cv-5.png', templateId: 'cv-socle', visibleOptions: { photo: false, twoColumn: false, ats: false, docx: true, customized: true, free: true, timeline: false } },

  { id: 'cover-letter-classic', structureId: 'no-aside', layoutId: 'layout-stacked', skinId: 'skin-cover-letter-classic', label: 'Cover Letter Classic', subtitle: 'Classic letter ready to customize', type: 'cover-letter', image: '/img/cv/cv-1.png', templateId: 'cv-socle', visibleOptions: { photo: false, twoColumn: false, ats: true, docx: true, customized: true, free: true, timeline: false } },
  { id: 'cover-letter-modern', structureId: 'no-aside', layoutId: 'layout-stacked', skinId: 'skin-cover-letter-modern', label: 'Cover Letter Modern', subtitle: 'Modern letter highlighting profile', type: 'cover-letter', image: '/img/cv/cv-3.png', templateId: 'cv-socle', visibleOptions: { photo: true, twoColumn: false, ats: false, docx: true, customized: true, free: true, timeline: false } },
]
