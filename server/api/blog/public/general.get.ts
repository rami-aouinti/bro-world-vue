import { getPaginationQuery } from '../utils'
import { resolveApiUrl } from '../../../utils/resolveApiUrl'
import type { BlogApiResponse } from '~~/server/types/api/blog'

export default defineEventHandler(async (event): Promise<BlogApiResponse> => {
  const runtimeConfig = useRuntimeConfig(event)
  const { page, limit } = getPaginationQuery(event)

  return $fetch<BlogApiResponse>(
    resolveApiUrl(
      runtimeConfig.public.apiBaseUrl,
      '/api/v1/public/blogs/general',
    ),
    {
      query: { page, limit },
      headers: {
        accept: 'application/json',
      },
    },
  )
})
