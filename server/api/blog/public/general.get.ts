import { getBlogFeedQuery } from '../utils'
import { cachedPublicGet } from '../../../utils/publicApi'
import type { BlogApiResponse } from '~~/server/types/api/blog'

export default defineEventHandler(async (event): Promise<BlogApiResponse> => {
  const { page, limit, tag } = getBlogFeedQuery(event)

  return cachedPublicGet<BlogApiResponse>(
    event,
    '/api/v1/public/blogs/general',
    {
      query: { page, limit, ...(tag ? { tag } : {}) },
      cacheDomain: 'blog',
    },
  )
})
