import type { H3Event } from 'h3'
import type { SessionUser } from '~/types/session'

export const MAX_LIMIT = 100

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

  if (limit > MAX_LIMIT) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid limit parameter (maximum: ${MAX_LIMIT})`,
    })
  }

  return { page, limit }
}

export function getRequiredRouterParam(
  event: H3Event,
  name: string,
  label: string,
) {
  const value = getRouterParam(event, name)

  if (!value) {
    throw createError({
      statusCode: 400,
      statusMessage: `Invalid ${label} id`,
    })
  }

  return value
}

export async function getConnectedBlogAuthor(event: H3Event) {
  const session = await getUserSession(event)
  const user = (session?.user as SessionUser | null) ?? null

  if (!user) {
    return null
  }

  const firstName = user.firstName?.trim() || null
  const lastName = user.lastName?.trim() || null
  const username = user.username?.trim() || null
  const name = [firstName, lastName].filter(Boolean).join(' ').trim()

  return {
    id: user.id,
    username,
    firstName,
    lastName,
    photo: user.photo?.trim() || null,
    name: name || username || null,
  }
}
