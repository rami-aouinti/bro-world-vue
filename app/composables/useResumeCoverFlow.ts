import type { LocationQuery, LocationQueryRaw } from 'vue-router'

type ResumeCoverFlowState = {
  template: string
  title: string
  subtitle: string
  summary: string
  draftId?: string
}

function pickQueryString(query: LocationQuery, key: string): string {
  const value = query[key]

  if (Array.isArray(value)) {
    return typeof value[0] === 'string' ? value[0] : ''
  }

  return typeof value === 'string' ? value : ''
}

export function useResumeCoverFlow() {
  const toCoverLetterQuery = (
    state: ResumeCoverFlowState,
  ): LocationQueryRaw => ({
    coverPageTemplate: state.template,
    coverPageTitle: state.title,
    coverPageSubtitle: state.subtitle,
    coverPageSummary: state.summary,
    ...(state.draftId ? { coverPageDraftId: state.draftId } : {}),
  })

  const parseCoverFlowQuery = (query: LocationQuery) => ({
    template: pickQueryString(query, 'coverPageTemplate'),
    title: pickQueryString(query, 'coverPageTitle'),
    subtitle: pickQueryString(query, 'coverPageSubtitle'),
    summary: pickQueryString(query, 'coverPageSummary'),
    draftId: pickQueryString(query, 'coverPageDraftId'),
  })

  return {
    parseCoverFlowQuery,
    toCoverLetterQuery,
  }
}
