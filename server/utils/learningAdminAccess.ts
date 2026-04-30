import type { SessionUser } from '~/types/session'
import type { H3Event } from 'h3'

export async function requireLearningAdmin(event: H3Event) {
  const { user } = await requireUserSession(event)
  const sessionUser = user as SessionUser | null
  const roles = sessionUser?.roles ?? []
  const canAccess = roles.includes('ROLE_ROOT') || roles.includes('ROLE_ADMIN')

  if (!canAccess) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Learning admin access denied',
    })
  }

  return sessionUser
}
