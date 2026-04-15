import type { H3Event } from 'h3'
import type { SessionUser } from '~/types/session'
import {
  hasCrmPermission,
  resolveCrmPermissionsForUser,
  type CrmPermission,
} from '~~/shared/crmAccess'

export async function getSessionUser(event: H3Event): Promise<SessionUser> {
  const { user } = await requireUserSession(event)
  return user as SessionUser
}

export async function requireCrmPermission(
  event: H3Event,
  permission: CrmPermission,
): Promise<SessionUser> {
  const user = await getSessionUser(event)

  if (!hasCrmPermission(user, permission)) {
    throw createError({
      statusCode: 403,
      statusMessage: `Missing CRM permission: ${permission}`,
    })
  }

  return user
}

export async function getCurrentUserCrmPermissions(event: H3Event) {
  const user = await getSessionUser(event)
  return resolveCrmPermissionsForUser(user)
}
