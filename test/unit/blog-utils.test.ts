import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import {
  MAX_LIMIT,
  getBlogFeedQuery,
  getPaginationQuery,
} from '../../server/api/blog/utils'

type Query = Record<string, string | number | undefined>
type TestEvent = { __query?: Query }

describe('getPaginationQuery', () => {
  const originalGetQuery = globalThis.getQuery
  const originalCreateError = globalThis.createError

  beforeAll(() => {
    globalThis.getQuery = ((event: TestEvent) =>
      event.__query ?? {}) as typeof getQuery
    globalThis.createError = ((error: {
      statusCode: number
      statusMessage: string
    }) => {
      return Object.assign(new Error(error.statusMessage), error)
    }) as typeof createError
  })

  afterAll(() => {
    globalThis.getQuery = originalGetQuery
    globalThis.createError = originalCreateError
  })

  it('returns page and limit for a valid limit', () => {
    const pagination = getPaginationQuery({
      __query: { page: '2', limit: '50' },
    } as never)

    expect(pagination).toEqual({ page: 2, limit: 50 })
  })

  it('throws for negative limit', () => {
    expect(() =>
      getPaginationQuery({ __query: { limit: '-1' } } as never),
    ).toThrowError('Invalid limit parameter')
  })

  it('throws for limit above MAX_LIMIT', () => {
    expect(() =>
      getPaginationQuery({
        __query: { limit: String(MAX_LIMIT + 1) },
      } as never),
    ).toThrowError(`Invalid limit parameter (maximum: ${MAX_LIMIT})`)
  })
})

describe('getBlogFeedQuery', () => {
  const originalGetQuery = globalThis.getQuery
  const originalCreateError = globalThis.createError

  beforeAll(() => {
    globalThis.getQuery = ((event: TestEvent) =>
      event.__query ?? {}) as typeof getQuery
    globalThis.createError = ((error: {
      statusCode: number
      statusMessage: string
    }) => {
      return Object.assign(new Error(error.statusMessage), error)
    }) as typeof createError
  })

  afterAll(() => {
    globalThis.getQuery = originalGetQuery
    globalThis.createError = originalCreateError
  })

  it('returns trimmed tag when provided', () => {
    const query = getBlogFeedQuery({
      __query: { page: '1', limit: '20', tag: '  tag-1-1-1  ' },
    } as never)

    expect(query).toEqual({
      page: 1,
      limit: 20,
      tag: 'tag-1-1-1',
    })
  })

  it('returns null tag when empty', () => {
    const query = getBlogFeedQuery({
      __query: { page: '1', limit: '20', tag: '   ' },
    } as never)

    expect(query.tag).toBeNull()
  })
})
