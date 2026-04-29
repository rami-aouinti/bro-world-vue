export type ResumeTemplateVariant =
  | 'classic'
  | 'modern'
  | 'professional'
  | 'traditional'
  | 'creative'
  | 'minimalist'
  | 'aurora'
  | 'executive'
  | 'terra'
  | 'ocean-split'
  | 'corporate-blue'
  | 'grid-slate'

export type ResumeTemplateFlags = {
  photo: boolean
  twoColumn: boolean
  ats: boolean
  docx: boolean
  customized: boolean
  free: boolean
  timeline: boolean
}

export type ResumeTemplateDefinition = {
  id: string
  title: string
  subtitle: string
  image: string
  variant: ResumeTemplateVariant
  flags: ResumeTemplateFlags
}

export const RESUME_TEMPLATES: ResumeTemplateDefinition[] = [
  {
    id: 'executive-portrait',
    title: 'Executive Portrait',
    subtitle: 'Large hero name with rounded portrait focus',
    image: '/img/cv/cv-1.png',
    variant: 'corporate-blue',
    flags: { photo: true, twoColumn: true, ats: true, docx: true, customized: true, free: true, timeline: false },
  },
  {
    id: 'midnight-banner',
    title: 'Midnight Banner',
    subtitle: 'Dark header band with profile image and split details',
    image: '/img/cv/cv-2.png',
    variant: 'executive',
    flags: { photo: true, twoColumn: true, ats: false, docx: true, customized: true, free: true, timeline: true },
  },
  {
    id: 'minimal-profile',
    title: 'Minimal Profile',
    subtitle: 'Clean profile block with light sidebar and compact details',
    image: '/img/cv/cv-4.png',
    variant: 'minimalist',
    flags: { photo: true, twoColumn: true, ats: true, docx: true, customized: true, free: true, timeline: false },
  },
  {
    id: 'left-profile-stripe',
    title: 'Left Profile Stripe',
    subtitle: 'Profile photo stripe on the left with structured rows',
    image: '/img/cv/cv-3.png',
    variant: 'professional',
    flags: { photo: true, twoColumn: true, ats: false, docx: true, customized: true, free: true, timeline: false },
  },
  {
    id: 'accent-circle',
    title: 'Accent Circle',
    subtitle: 'Bold accent title with circular avatar and clean table lines',
    image: '/img/cv/cv-5.png',
    variant: 'terra',
    flags: { photo: true, twoColumn: true, ats: true, docx: true, customized: true, free: true, timeline: false },
  },
  {
    id: 'terra',
    title: 'Terra Sidebar',
    subtitle: 'Warm sidebar profile style',
    image: '/img/cv/cv-1.png',
    variant: 'terra',
    flags: { photo: true, twoColumn: true, ats: false, docx: true, customized: true, free: true, timeline: false },
  },
  {
    id: 'ocean-split',
    title: 'Ocean Split',
    subtitle: 'Diagonal split with textured blue panel',
    image: '/img/cv/cv-3.png',
    variant: 'ocean-split',
    flags: { photo: true, twoColumn: true, ats: false, docx: false, customized: true, free: true, timeline: false },
  },
  {
    id: 'corporate-blue',
    title: 'Corporate Blue',
    subtitle: 'Executive header with information sidebar',
    image: '/img/cv/cv-2.png',
    variant: 'corporate-blue',
    flags: { photo: true, twoColumn: true, ats: true, docx: true, customized: true, free: true, timeline: false },
  },
  {
    id: 'classic',
    title: 'Classic',
    subtitle: 'Simple and readable format',
    image: '/img/cv/cv-4.png',
    variant: 'classic',
    flags: { photo: false, twoColumn: false, ats: false, docx: true, customized: false, free: true, timeline: false },
  },
  {
    id: 'modern',
    title: 'Modern',
    subtitle: 'Clean blocks and balanced content',
    image: '/img/cv/cv-3.png',
    variant: 'modern',
    flags: { photo: true, twoColumn: true, ats: false, docx: true, customized: true, free: true, timeline: false },
  },
  {
    id: 'professional',
    title: 'Professional',
    subtitle: 'Sidebar profile with details',
    image: '/img/cv/cv-1.png',
    variant: 'professional',
    flags: { photo: true, twoColumn: true, ats: false, docx: true, customized: true, free: true, timeline: false },
  },
  {
    id: 'traditional',
    title: 'Traditional',
    subtitle: 'Formal and timeless structure',
    image: '/img/cv/cv-2.png',
    variant: 'traditional',
    flags: { photo: false, twoColumn: false, ats: false, docx: true, customized: false, free: true, timeline: false },
  },
  {
    id: 'creative',
    title: 'Creative Timeline',
    subtitle: 'Creative layout with timeline sections',
    image: '/img/cv/cv-5.png',
    variant: 'creative',
    flags: { photo: true, twoColumn: true, ats: false, docx: false, customized: true, free: true, timeline: true },
  },
  {
    id: 'minimalist',
    title: 'Minimalist',
    subtitle: 'Monochrome editorial minimalism',
    image: '/img/cv/cv-4.png',
    variant: 'minimalist',
    flags: { photo: false, twoColumn: false, ats: true, docx: true, customized: true, free: true, timeline: false },
  },
  {
    id: 'aurora',
    title: 'Aurora',
    subtitle: 'Dark glassmorphism with neon accents',
    image: '/img/cv/cv-1.png',
    variant: 'aurora',
    flags: { photo: true, twoColumn: true, ats: false, docx: false, customized: true, free: true, timeline: false },
  },
  {
    id: 'executive',
    title: 'Executive Timeline',
    subtitle: 'Leadership layout with timeline details',
    image: '/img/cv/cv-2.png',
    variant: 'executive',
    flags: { photo: true, twoColumn: true, ats: true, docx: true, customized: true, free: true, timeline: true },
  },
]

export const DEFAULT_RESUME_TEMPLATE_ID = RESUME_TEMPLATES[0]?.id ?? 'terra'

export type CoverTemplateDefinition = {
  id: string
  title: string
  subtitle: string
  image: string
}

export const COVER_PAGE_TEMPLATES: CoverTemplateDefinition[] = [
  {
    id: 'cover-page-terra',
    title: 'Cover Page Terra',
    subtitle: 'Simple cover page with title and photo',
    image: '/img/cv/cv-4.png',
  },
  {
    id: 'cover-page-elegant',
    title: 'Cover Page Elegant',
    subtitle: 'Centered elegant cover page',
    image: '/img/cv/cv-5.png',
  },
  {
    id: 'cover-page-hero-centered',
    title: 'Cover Page Hero Centered',
    subtitle: 'Centered hero with strong visual identity',
    image: '/img/cv/cv-2.png',
  },
  {
    id: 'cover-page-sidebar-pulse',
    title: 'Cover Page Sidebar Pulse',
    subtitle: 'Side layout for context and contacts',
    image: '/img/cv/cv-1.png',
  },
  {
    id: 'cover-page-split-editorial',
    title: 'Cover Page Split Editorial',
    subtitle: 'Premium editorial vertical split',
    image: '/img/cv/cv-3.png',
  },
]

export const COVER_LETTER_TEMPLATES: CoverTemplateDefinition[] = [
  {
    id: 'cover-letter-classic',
    title: 'Cover Letter Classic',
    subtitle: 'Classic letter ready to customize',
    image: '/img/cv/cv-1.png',
  },
  {
    id: 'cover-letter-modern',
    title: 'Cover Letter Modern',
    subtitle: 'Modern letter highlighting profile',
    image: '/img/cv/cv-3.png',
  },
  {
    id: 'cover-letter-ats-minimal',
    title: 'Cover Letter ATS Minimal',
    subtitle: 'Minimal structure optimized for ATS readability',
    image: '/img/cv/cv-4.png',
  },
  {
    id: 'cover-letter-premium-editorial',
    title: 'Cover Letter Premium Editorial',
    subtitle: 'Premium style with editorial rhythm',
    image: '/img/cv/cv-5.png',
  },
  {
    id: 'cover-letter-split-focus',
    title: 'Cover Letter Split Focus',
    subtitle: 'Side split focused on profile and argument',
    image: '/img/cv/cv-2.png',
  },
]

export const RESUME_TEMPLATE_IDS = RESUME_TEMPLATES.map(template => template.id)
export const COVER_PAGE_TEMPLATE_IDS = COVER_PAGE_TEMPLATES.map(template => template.id)
export const COVER_LETTER_TEMPLATE_IDS = COVER_LETTER_TEMPLATES.map(template => template.id)
