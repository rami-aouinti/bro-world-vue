import { cachedPrivateGet } from '../../utils/privateApi'
import type { StoriesApiResponse } from '~~/server/types/api/stories'

export default defineEventHandler(
  async (event): Promise<StoriesApiResponse> => {
    const query = getQuery(event)
    const parsedLimit = Number(query.limit)
    const limit = Number.isFinite(parsedLimit)
      ? Math.min(100, Math.max(1, Math.trunc(parsedLimit)))
      : 50

    return cachedPrivateGet<StoriesApiResponse>(
      event,
      '/api/v1/private/stories',
      {
        query: { limit },
        cacheDomain: 'stories',
      },
    )
  },
)
