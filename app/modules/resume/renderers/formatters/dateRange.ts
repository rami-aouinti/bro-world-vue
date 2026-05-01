const MONTH_FORMATTER = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})

function parseDate(value: unknown): Date | null {
  if (typeof value !== 'string' || !value.trim()) {
    return null
  }

  const date = new Date(value)

  if (Number.isNaN(date.getTime())) {
    return null
  }

  return date
}

function formatDate(value: unknown): string | null {
  const parsed = parseDate(value)
  return parsed ? MONTH_FORMATTER.format(parsed) : null
}

export function formatDateRange(startDate: unknown, endDate: unknown): string {
  const formattedStart = formatDate(startDate)
  const formattedEnd = formatDate(endDate)

  if (formattedStart && formattedEnd) {
    return `${formattedStart} – ${formattedEnd}`
  }

  if (formattedStart) {
    return `${formattedStart} – Present`
  }

  if (formattedEnd) {
    return formattedEnd
  }

  return ''
}

export function sortByStartDateDescKeepingSourceOrder<T extends Record<string, unknown>>(items: T[]): T[] {
  return items
    .map((item, index) => ({ item, index, start: parseDate(item.startDate ?? item.start) }))
    .sort((a, b) => {
      if (a.start && b.start) {
        return b.start.getTime() - a.start.getTime()
      }

      if (a.start && !b.start) {
        return -1
      }

      if (!a.start && b.start) {
        return 1
      }

      return a.index - b.index
    })
    .map(({ item }) => item)
}
