import { getRouterParam } from 'h3'
import type { RecruitJobDetailResponse } from '~/types/world/jobs'
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

    return $fetch<RecruitJobDetailResponse>(
      resolveApiUrl(
        runtimeConfig.public.apiBaseUrl,
        `/recruit/general/jobs/${encodeURIComponent(slug)}`,
      ),
      {
        headers: {
          accept: 'application/json',
        },
      },
    )
  },
)
