import { cachedPrivateGet } from '../../../utils/privateApi'
import { getBlogFeedQuery } from '../utils'
import type { BlogApiResponse } from '~~/server/types/api/blog'

export default defineEventHandler(async (event): Promise<BlogApiResponse> => {
  const { page, limit, tag } = getBlogFeedQuery(event)

  return cachedPrivateGet<BlogApiResponse>(
    event,
    '/api/v1/private/blogs/general',
    {
      query: { page, limit, ...(tag ? { tag } : {}) },
      cacheDomain: 'blog',
    },
  )
})
