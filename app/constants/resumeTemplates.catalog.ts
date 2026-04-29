import type { ResumeTemplateConfig } from '~/types/resumeTemplateConfig'

const DEFAULT_RESUME_SECTIONS: ResumeTemplateConfig['sections'] = [
  'experience',
  'education',
  'project',
  'certification',
  'skill',
  'language',
  'reference',
  'hobby',
]

export const RESUME_TEMPLATES_CATALOG: ResumeTemplateConfig[] = [
  {
    id: 'executive-portrait', label: 'Executive Portrait', subtitle: 'Large hero name with rounded portrait focus', type: 'resume', image: '/img/cv/cv-1.png', variant: 'corporate-blue', layoutMode: 'split', sections: DEFAULT_RESUME_SECTIONS, styleVars: { palette: 'corporate-blue', radius: 'soft', typography: 'executive', sectionVariant: 'detailed', iconStyle: 'filled' }, visibleOptions: { photo: true, twoColumn: true, ats: true, docx: true, customized: true, free: true, timeline: false },
  },
  { id: 'midnight-banner', label: 'Midnight Banner', subtitle: 'Dark header band with profile image and split details', type: 'resume', image: '/img/cv/cv-2.png', variant: 'executive', layoutMode: 'split', sections: DEFAULT_RESUME_SECTIONS, styleVars: { palette: 'midnight', radius: 'soft', typography: 'modern', sectionVariant: 'timeline', iconStyle: 'outline' }, visibleOptions: { photo: true, twoColumn: true, ats: false, docx: true, customized: true, free: true, timeline: true } },
  { id: 'minimal-profile', label: 'Minimal Profile', subtitle: 'Clean profile block with light sidebar and compact details', type: 'resume', image: '/img/cv/cv-4.png', variant: 'minimalist', layoutMode: 'split', sections: DEFAULT_RESUME_SECTIONS, styleVars: { palette: 'minimal', radius: 'none', typography: 'clean', sectionVariant: 'compact', iconStyle: 'text' }, visibleOptions: { photo: true, twoColumn: true, ats: true, docx: true, customized: true, free: true, timeline: false } },
  { id: 'classic', label: 'Classic', subtitle: 'Simple and readable format', type: 'resume', image: '/img/cv/cv-4.png', variant: 'classic', layoutMode: 'stacked', sections: DEFAULT_RESUME_SECTIONS, styleVars: { palette: 'classic', radius: 'none', typography: 'serif', sectionVariant: 'classic', iconStyle: 'text' }, visibleOptions: { photo: false, twoColumn: false, ats: false, docx: true, customized: false, free: true, timeline: false } },
  { id: 'modern', label: 'Modern', subtitle: 'Clean blocks and balanced content', type: 'resume', image: '/img/cv/cv-3.png', variant: 'modern', layoutMode: 'split', sections: DEFAULT_RESUME_SECTIONS, styleVars: { palette: 'modern', radius: 'soft', typography: 'sans', sectionVariant: 'list', iconStyle: 'filled' }, visibleOptions: { photo: true, twoColumn: true, ats: false, docx: true, customized: true, free: true, timeline: false } },

  { id: 'cover-page-terra', label: 'Cover Page Terra', subtitle: 'Simple cover page with title and photo', type: 'cover-page', image: '/img/cv/cv-4.png', variant: 'terra', layoutMode: 'stacked', sections: ['hobby'], styleVars: { palette: 'terra', radius: 'soft', typography: 'serif', iconStyle: 'text' }, visibleOptions: { photo: true, twoColumn: false, ats: false, docx: true, customized: true, free: true, timeline: false } },
  { id: 'cover-page-elegant', label: 'Cover Page Elegant', subtitle: 'Centered elegant cover page', type: 'cover-page', image: '/img/cv/cv-5.png', variant: 'minimalist', layoutMode: 'stacked', sections: ['hobby'], styleVars: { palette: 'elegant', radius: 'soft', typography: 'serif', iconStyle: 'text' }, visibleOptions: { photo: false, twoColumn: false, ats: false, docx: true, customized: true, free: true, timeline: false } },

  { id: 'cover-letter-classic', label: 'Cover Letter Classic', subtitle: 'Classic letter ready to customize', type: 'cover-letter', image: '/img/cv/cv-1.png', variant: 'traditional', layoutMode: 'stacked', sections: ['experience'], styleVars: { palette: 'classic', radius: 'none', typography: 'serif', iconStyle: 'text' }, visibleOptions: { photo: false, twoColumn: false, ats: true, docx: true, customized: true, free: true, timeline: false } },
  { id: 'cover-letter-modern', label: 'Cover Letter Modern', subtitle: 'Modern letter highlighting profile', type: 'cover-letter', image: '/img/cv/cv-3.png', variant: 'modern', layoutMode: 'stacked', sections: ['experience'], styleVars: { palette: 'modern', radius: 'soft', typography: 'sans', iconStyle: 'outline' }, visibleOptions: { photo: true, twoColumn: false, ats: false, docx: true, customized: true, free: true, timeline: false } },
]
