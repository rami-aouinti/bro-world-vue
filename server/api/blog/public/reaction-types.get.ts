import { cachedPublicGet } from '../../../utils/publicApi'
import type { BlogApiResponse } from '~~/server/types/api/blog'

export default defineEventHandler(async (event): Promise<BlogApiResponse> => {
  return cachedPublicGet<BlogApiResponse>(
    event,
    '/api/v1/public/blogs/reactions/types',
    {
      cacheDomain: 'references',
    },
  )
})
