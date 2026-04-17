import { getRouterParam } from 'h3'
import type { RecruitJobDetailResponse } from '~/types/world/jobs'
import { getCached, publicCacheKey, setCached } from '~~/server/utils/apiCache'
import { resolveCacheTtl } from '~~/server/utils/apiCacheConfig'
import { resolveApiUrl } from '~~/server/utils/resolveApiUrl'

export default defineEventHandler(
  async (event): Promise<RecruitJobDetailResponse> => {
    const runtimeConfig = useRuntimeConfig(event)
    const slug = getRouterParam(event, 'slug')

    if (!slug) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing job slug',
      })
    }

    const endpoint = `/recruit/general/jobs/${encodeURIComponent(slug)}`
    const cacheKey = publicCacheKey(endpoint)
    const cached = await getCached<RecruitJobDetailResponse>(cacheKey)

    if (cached) {
      return cached
    }

    const response = await $fetch<RecruitJobDetailResponse>(
      resolveApiUrl(runtimeConfig.public.apiBaseUrl, endpoint),
      {
        headers: {
          accept: 'application/json',
        },
      },
    )

    await setCached(cacheKey, response, resolveCacheTtl('recruit'))

    return response
  },
)
