export type ResumeSectionRendererKey =
  | 'experience'
  | 'skills'
  | 'education'
  | 'projects'
  | 'certifications'
  | 'references'
  | 'interests'
  | 'languages'

export type ResumeSectionRendererVariant =
  | 'timeline'
  | 'cards'
  | 'list'
  | 'classic'
  | 'two-columns'
  | 'stars'
  | 'dots'
  | 'progress-line'
  | 'progress-circle'

export type ResumeSectionRendererProps = {
  items?: unknown[]
  sectionKey?: ResumeSectionRendererKey | 'general'
  template?: ResumeSectionRendererVariant
  theme?: Record<string, string | number>
  showIcon?: boolean
  density?: 'compact' | 'normal' | 'spacious' | string
  editable?: boolean
}
