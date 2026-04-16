import { listCandidatesByContext } from '~~/server/utils/jobsPipelineStore'
import type { JobCandidatesApiResponse } from '~~/server/types/api/jobs'
import { resolveJobAccessRole } from '~~/server/utils/jobsAdminStore'
import { getCached, privateCacheKey, setCached } from '~~/server/utils/apiCache'
import { resolveCacheTtl } from '~~/server/utils/apiCacheConfig'
import type { SessionUser } from '~/types/session'

export default defineEventHandler(
  async (event): Promise<JobCandidatesApiResponse> => {
    await requireUserSession(event)

    const query = getQuery(event)
    const context =
      typeof query.context === 'string' ? query.context : undefined
    const session = await getUserSession(event)
    const user = (session?.user as SessionUser | null) ?? null
    const username = user?.username?.trim()

    if (!username) {
      throw createError({ statusCode: 401, statusMessage: 'Missing username' })
    }

    const role = resolveJobAccessRole(user)
    const cacheKey = privateCacheKey(username, '/jobs/candidates', {
      context,
      role,
    })
    const cached = await getCached<JobCandidatesApiResponse>(cacheKey)

    if (cached) {
      return cached
    }

    const response = listCandidatesByContext(context, { role })
    await setCached(cacheKey, response, resolveCacheTtl('default'))

    return response
  },
)
