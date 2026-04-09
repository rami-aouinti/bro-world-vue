import { cachedPublicGet } from '../../utils/publicApi'
import type { ApplicationApiResponse } from '~~/server/types/api/application'

export default defineEventHandler(
  async (event): Promise<ApplicationApiResponse> => {
    const query = getQuery(event)
    const page = Number(query.page ?? 1)
    const limit = Number(query.limit ?? 20)

    return cachedPublicGet<ApplicationApiResponse>(
      event,
      '/application/public',
      {
        query: { page, limit },
        cacheDomain: 'application',
      },
    )
  },
)
