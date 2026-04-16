import type { JobsAdminPolicyResponse } from '~~/server/types/api/jobs'
import { getCached, privateCacheKey, setCached } from '~~/server/utils/apiCache'
import { resolveCacheTtl } from '~~/server/utils/apiCacheConfig'
import { getJobsAdminPolicy } from '~~/server/utils/jobsAdminStore'
import type { SessionUser } from '~/types/session'

export default defineEventHandler(
  async (event): Promise<JobsAdminPolicyResponse> => {
    await requireUserSession(event)

    const session = await getUserSession(event)
    const user = (session?.user as SessionUser | null) ?? null
    const username = user?.username?.trim()

    if (!username) {
      throw createError({ statusCode: 401, statusMessage: 'Missing username' })
    }

    if (
      !(
        user?.roles?.includes('ROLE_ROOT') ||
        user?.roles?.includes('ROLE_ADMIN') ||
        user?.roles?.includes('ROLE_HR_ADMIN')
      )
    ) {
      throw createError({ statusCode: 403, statusMessage: 'Access denied' })
    }

    const cacheKey = privateCacheKey(username, '/jobs/admin/policy')
    const cached = await getCached<JobsAdminPolicyResponse>(cacheKey)

    if (cached) {
      return cached
    }

    const response = getJobsAdminPolicy()
    await setCached(cacheKey, response, resolveCacheTtl('default'))

    return response
  },
)
