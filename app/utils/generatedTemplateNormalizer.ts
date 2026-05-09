export type GeneratedTemplateLike = Record<string, any> | null | undefined

export function getGeneratedTemplateDesign(template: GeneratedTemplateLike) {
  if (!template || typeof template !== 'object') return {}
  return (
    template.design && typeof template.design === 'object'
      ? template.design
      : template
  ) as Record<string, any>
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
