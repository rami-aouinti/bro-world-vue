import type { JobsAdminPolicyResponse } from '~~/server/types/api/jobs'
import { getJobsAdminPolicy } from '~~/server/utils/jobsAdminStore'
import type { SessionUser } from '~/types/session'

export default defineEventHandler(async (event): Promise<JobsAdminPolicyResponse> => {
  await requireUserSession(event)

  const session = await getUserSession(event)
  const user = (session?.user as SessionUser | null) ?? null

  if (!(user?.roles?.includes('ROLE_ROOT') || user?.roles?.includes('ROLE_ADMIN') || user?.roles?.includes('ROLE_HR_ADMIN'))) {
    throw createError({ statusCode: 403, statusMessage: 'Access denied' })
  }

  return getJobsAdminPolicy()
})
