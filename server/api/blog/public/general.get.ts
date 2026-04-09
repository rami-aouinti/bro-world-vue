import { getPaginationQuery } from '../utils'
import { cachedPublicGet } from '../../../utils/publicApi'
import type { BlogApiResponse } from '~~/server/types/api/blog'

export default defineEventHandler(async (event): Promise<BlogApiResponse> => {
  const { page, limit } = getPaginationQuery(event)

  return cachedPublicGet<BlogApiResponse>(
    event,
    '/api/v1/public/blogs/general',
    {
      query: { page, limit },
      cacheDomain: 'blog',
    },
  )
})
