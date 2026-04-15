import type { JobAccessRole, JobPermissionMatrix } from '~~/server/types/api/jobs'
import { JOB_ACCESS_ROLES } from '~~/server/types/api/jobs'
import { updateRolePermission } from '~~/server/utils/jobsAdminStore'
import type { SessionUser } from '~/types/session'

type PermissionBody = Partial<JobPermissionMatrix>

const isJobRole = (role: string): role is JobAccessRole => {
  return JOB_ACCESS_ROLES.includes(role as JobAccessRole)
}

export default defineEventHandler(async (event): Promise<{ role: JobAccessRole; permissions: JobPermissionMatrix }> => {
  await requireUserSession(event)

  const session = await getUserSession(event)
  const user = (session?.user as SessionUser | null) ?? null

  if (!(user?.roles?.includes('ROLE_ROOT') || user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_HR_ADMIN'))) {
    throw createError({ statusCode: 403, statusMessage: 'Access denied' })
  }

  const roleParam = getRouterParam(event, 'role')

  if (!roleParam || !isJobRole(roleParam)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid role' })
  }

  const body = await readBody<PermissionBody>(event)

  return {
    role: roleParam,
    permissions: updateRolePermission(roleParam, body),
  }
})
