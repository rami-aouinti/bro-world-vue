import { describe, expect, it } from 'vitest'
import { normalizeHttpError } from '../../app/utils/httpError'

describe('normalizeHttpError', () => {
  it('reads status from statusCode', () => {
    const error = normalizeHttpError({ statusCode: 401, message: 'Unauthorized' })

    expect(error.statusCode).toBe(401)
    expect(error.isUnauthorized).toBe(true)
    expect(error.message).toBe('Unauthorized')
  })

  it('reads status from data.statusCode', () => {
    const error = normalizeHttpError({
      data: { statusCode: 401, message: 'Token invalid' },
      statusMessage: 'Request failed',
    })

    expect(error.statusCode).toBe(401)
    expect(error.isUnauthorized).toBe(true)
    expect(error.message).toBe('Request failed')
  })

  it('reads status from response.status', () => {
    const rawError = {
      response: { status: 401 },
    }
    const error = normalizeHttpError(rawError)

    expect(error.statusCode).toBe(401)
    expect(error.isUnauthorized).toBe(true)
    expect(error.message).toBe('HTTP request failed')
    expect(error.raw).toBe(rawError)
  })
})
