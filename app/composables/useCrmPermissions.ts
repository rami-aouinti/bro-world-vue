import type { SessionUser } from '~/types/session'
import {
  hasCrmPermission,
  resolveCrmPermissionsForUser,
  type CrmPermission,
} from '~~/shared/crmAccess'

export function useCrmPermissions() {
  const { user } = useUserSession()
  const sessionUser = computed(() => user.value as SessionUser | null)

  const permissions = computed(() =>
    resolveCrmPermissionsForUser(sessionUser.value),
  )

  const can = (permission: CrmPermission) =>
    hasCrmPermission(sessionUser.value, permission)

  return {
    sessionUser,
    permissions,
    can,
  }
}
