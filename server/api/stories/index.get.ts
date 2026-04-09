import { cachedPrivateGet } from '../../utils/privateApi'
import type { StoriesApiResponse } from '~~/server/types/api/stories'

export default defineEventHandler(
  async (event): Promise<StoriesApiResponse> => {
    return cachedPrivateGet<StoriesApiResponse>(
      event,
      '/api/v1/private/stories',
      {
        cacheDomain: 'stories',
      },
    )
  },
)
