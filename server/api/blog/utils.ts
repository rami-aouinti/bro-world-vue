import type { H3Event } from 'h3'

export function getPaginationQuery(event: H3Event, defaultLimit = 20) {
  const query = getQuery(event)
  const page = Number(query.page ?? 1)
  const limit = Number(query.limit ?? defaultLimit)

  if (!Number.isInteger(page) || page <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid page parameter',
    })
  }

  if (!Number.isInteger(limit) || limit <= 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid limit parameter',
    })
  }

  return { page, limit }
}

export function getRequiredRouterParam(event: H3Event, name: string, label: string) {
  const value = getRouterParam(event, name)

  if (!value) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid ${label} id`,
    })
  }

  return value
}
