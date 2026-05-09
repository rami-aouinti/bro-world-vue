export type GeneratedTemplateLike = Record<string, any> | null | undefined

const LEGACY_DESIGN_KEYS = [
  'theme',
  'decor',
  'layoutOptions',
  'designTokens',
  'designConfig',
  'hero',
  'textStyles',
  'typography',
  'items',
] as const

export function getGeneratedTemplateDesign(template: GeneratedTemplateLike) {
  if (!template || typeof template !== 'object') return {}

  const embeddedDesign =
    template.design && typeof template.design === 'object'
      ? { ...template.design }
      : {}

  for (const key of LEGACY_DESIGN_KEYS) {
    if (embeddedDesign[key] === undefined && template[key] !== undefined)
      embeddedDesign[key] = template[key]
  }

  return embeddedDesign as Record<string, any>
}

export function getGeneratedTemplateFakeData(template: GeneratedTemplateLike) {
  if (!template || typeof template !== 'object') return {}
  return (template.fakeData || template.defaultValues || {}) as Record<
    string,
    any
  >
}

export function getGeneratedTemplateSectionForm(
  sections: unknown,
  sectionKey: string,
  fallback = 'classic',
) {
  if (!sections || typeof sections !== 'object') return fallback
  const value = (sections as Record<string, any>)[sectionKey]
  if (typeof value === 'string') return value
  if (value && typeof value === 'object') {
    const form = (value as Record<string, any>).form
    if (typeof form === 'string' && form) return form
  }
  return fallback
}
