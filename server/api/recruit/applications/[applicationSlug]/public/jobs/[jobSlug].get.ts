import type { RecruitBasicMessageResponse } from '~~/server/types/api/recruit'
import { getCached, publicCacheKey, setCached } from '~~/server/utils/apiCache'
import { resolveCacheTtl } from '~~/server/utils/apiCacheConfig'
import { resolveApiUrl } from '~~/server/utils/resolveApiUrl'

export default defineEventHandler(
  async (event): Promise<RecruitBasicMessageResponse> => {
    const applicationSlug = getRouterParam(event, 'applicationSlug')
    const jobSlug = getRouterParam(event, 'jobSlug')

    if (!applicationSlug || !jobSlug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing application slug or job slug',
      })
    }

    const endpoint = `/recruit/applications/${applicationSlug}/public/jobs/${jobSlug}`
    const cacheKey = publicCacheKey(endpoint)

    const cached = await getCached<RecruitBasicMessageResponse>(cacheKey)
    if (cached) {
      return cached
    }

    const runtimeConfig = useRuntimeConfig(event)
    const response = await $fetch<RecruitBasicMessageResponse>(
      resolveApiUrl(runtimeConfig.public.apiBaseUrl, endpoint),
      {
        headers: { accept: 'application/json' },
      },
    )

    await setCached(cacheKey, response, resolveCacheTtl('recruit'))

    return response
  },
)
