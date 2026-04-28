const MONTH_NAME_TO_INDEX: Record<string, number> = {
  jan: 1,
  january: 1,
  fev: 2,
  fév: 2,
  feb: 2,
  february: 2,
  mar: 3,
  march: 3,
  avr: 4,
  april: 4,
  may: 5,
  mai: 5,
  jun: 6,
  june: 6,
  jul: 7,
  july: 7,
  aou: 8,
  août: 8,
  aug: 8,
  august: 8,
  sep: 9,
  sept: 9,
  september: 9,
  oct: 10,
  october: 10,
  nov: 11,
  november: 11,
  dec: 12,
  déc: 12,
  december: 12,
}

function toTwoDigitYear(year: number) {
  return String(year).slice(-2).padStart(2, '0')
}

function toMonthYear(month: number, year: number) {
  if (!Number.isFinite(month) || !Number.isFinite(year)) return ''
  if (month < 1 || month > 12) return ''
  return `${String(month).padStart(2, '0')}-${toTwoDigitYear(year)}`
}

export function formatResumeMonthYear(input: unknown) {
  const raw = String(input ?? '').trim()
  if (!raw) return ''

  const normalized = raw
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

  const compactMatch = normalized.match(/^(\d{1,2})\s*[-/.]\s*(\d{2,4})$/)
  if (compactMatch) {
    const month = Number(compactMatch[1])
    const year = Number(
      compactMatch[2].length === 2 ? `20${compactMatch[2]}` : compactMatch[2],
    )
    const output = toMonthYear(month, year)
    if (output) return output
  }

  const yearFirstMatch = normalized.match(/^(\d{4})\s*[-/.]\s*(\d{1,2})$/)
  if (yearFirstMatch) {
    const output = toMonthYear(
      Number(yearFirstMatch[2]),
      Number(yearFirstMatch[1]),
    )
    if (output) return output
  }

  const monthNameMatch = normalized.match(/^([a-z]+)\s+(\d{2,4})$/)
  if (monthNameMatch) {
    const month = MONTH_NAME_TO_INDEX[monthNameMatch[1]]
    const year = Number(
      monthNameMatch[2].length === 2
        ? `20${monthNameMatch[2]}`
        : monthNameMatch[2],
    )
    const output = toMonthYear(month, year)
    if (output) return output
  }

  const parsed = new Date(raw)
  if (!Number.isNaN(parsed.getTime())) {
    return toMonthYear(parsed.getUTCMonth() + 1, parsed.getUTCFullYear()) || raw
  }

  return raw
}
