import type { RecruitBasicMessageResponse } from '~~/server/types/api/recruit'
import { getCached, publicCacheKey, setCached } from '~~/server/utils/apiCache'
import { resolveCacheTtl } from '~~/server/utils/apiCacheConfig'
import { resolveApiUrl } from '~~/server/utils/resolveApiUrl'

export default defineEventHandler(
  async (event): Promise<RecruitBasicMessageResponse> => {
    const query = getQuery(event)
    const endpoint = '/api/v1/recruit/public/jobs'
    const cacheKey = publicCacheKey(endpoint, query)

    const cached = await getCached<RecruitBasicMessageResponse>(cacheKey)
    if (cached) {
      return cached
    }

    const runtimeConfig = useRuntimeConfig(event)
    const response = await $fetch<RecruitBasicMessageResponse>(
      resolveApiUrl(runtimeConfig.public.apiBaseUrl, endpoint),
      {
        query,
        headers: { accept: 'application/json' },
      },
    )

    await setCached(cacheKey, response, resolveCacheTtl('recruit'))

    return response
  },
)
