import { callPrivateApi } from '../../../utils/privateApi'
import { getPaginationQuery } from '../utils'
import type { BlogApiResponse } from '~~/server/types/api/blog'

export default defineEventHandler(async (event): Promise<BlogApiResponse> => {
  const { page, limit } = getPaginationQuery(event)

  return callPrivateApi<BlogApiResponse>(
    event,
    '/api/v1/private/blogs/general',
    {
      query: { page, limit },
    },
  )
})
