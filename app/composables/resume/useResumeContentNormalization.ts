import type { ResumeContentStyle } from '~/constants/resumeSectionRegistry'

export type TimelineEvent = { label: string; detail: string }

export function useResumeContentNormalization() {
  function parseMultilineList(value: string) {
    return value
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  function parseTimelineEvents(value: string): TimelineEvent[] {
    return parseMultilineList(value).map((line) => {
      const [label, ...detailParts] = line.split('|')
      if (detailParts.length === 0) {
        const [fallbackLabel, ...fallbackDetailParts] = line.split(':')
        if (fallbackDetailParts.length === 0) return { label: '', detail: line }
        return {
          label: fallbackLabel.trim(),
          detail: fallbackDetailParts.join(':').trim(),
        }
      }
      return { label: label.trim(), detail: detailParts.join('|').trim() }
    })
  }

  function normalizeSectionContentStyle(style?: string): ResumeContentStyle {
    if (style === 'points' || style === 'dashes' || style === 'timeline')
      return style
    return 'points'
  }

  function applyContentFields(
    model: {
      contentStyle?: ResumeContentStyle
      points?: string[]
      dashes?: string[]
      timelineEvents?: TimelineEvent[]
    },
    rawMultiline: string,
  ) {
    const parsedLines = parseMultilineList(rawMultiline)
    const parsedTimelineEvents = parseTimelineEvents(rawMultiline)
    model.points = model.contentStyle === 'points' ? parsedLines : []
    model.dashes = model.contentStyle === 'dashes' ? parsedLines : []
    model.timelineEvents =
      model.contentStyle === 'timeline' ? parsedTimelineEvents : []
  }

  return {
    parseMultilineList,
    parseTimelineEvents,
    normalizeSectionContentStyle,
    applyContentFields,
  }
}
