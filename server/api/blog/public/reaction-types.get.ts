import { resolveApiUrl } from '../../../utils/resolveApiUrl'
import type { BlogApiResponse } from '~~/server/types/api/blog'

export default defineEventHandler(async (event): Promise<BlogApiResponse> => {
  const runtimeConfig = useRuntimeConfig(event)

  return $fetch<BlogApiResponse>(
    resolveApiUrl(
      runtimeConfig.public.apiBaseUrl,
      '/api/v1/public/blogs/reactions/types',
    ),
    {
      headers: {
        accept: 'application/json',
      },
    },
  )
})
