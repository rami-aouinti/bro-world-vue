import { describe, expect, it } from 'vitest'
import { formatDateTime } from '~/utils/formatDateTime'

describe('formatDateTime', () => {
  const fixedDate = new Date('2026-04-06T13:05:00.000Z')

  it('formats EN locale with month/day and 12-hour time', () => {
    const formatted = formatDateTime('en', fixedDate, { timeZone: 'UTC' })

    expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{2,4}/)
    expect(formatted).toMatch(/AM|PM/i)
  })

  it('formats DE locale with dot separators and 24-hour time', () => {
    const formatted = formatDateTime('de', fixedDate, { timeZone: 'UTC' })

    expect(formatted).toMatch(/\d{1,2}\.\d{1,2}\.\d{2,4}/)
    expect(formatted).not.toMatch(/AM|PM/i)
  })

  it('formats FR locale with slash separators and 24-hour time', () => {
    const formatted = formatDateTime('fr', fixedDate, { timeZone: 'UTC' })

    expect(formatted).toMatch(/\d{1,2}\/\d{1,2}\/\d{2,4}/)
    expect(formatted).not.toMatch(/AM|PM/i)
  })
})
