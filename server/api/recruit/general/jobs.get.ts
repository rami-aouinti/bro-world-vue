import type { RecruitJobsListResponse } from '~/types/world/jobs'
import { getCached, publicCacheKey, setCached } from '~~/server/utils/apiCache'
import { resolveCacheTtl } from '~~/server/utils/apiCacheConfig'
import { resolveApiUrl } from '~~/server/utils/resolveApiUrl'

export default defineEventHandler(
  async (event): Promise<RecruitJobsListResponse> => {
    const runtimeConfig = useRuntimeConfig(event)
    const query = getQuery(event)
    const endpoint = '/api/v1/recruit/public/jobs'
    const cacheKey = publicCacheKey(endpoint, query)

    const cached = await getCached<RecruitJobsListResponse>(cacheKey)
    if (cached) {
      return cached
    }

    const response = await $fetch<RecruitJobsListResponse>(
      resolveApiUrl(runtimeConfig.public.apiBaseUrl, endpoint),
      {
        query,
        headers: {
          accept: 'application/json',
        },
      },
    )

    await setCached(cacheKey, response, resolveCacheTtl('recruit'))

    return response
  },
)
