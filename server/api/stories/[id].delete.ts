import { mutatingPrivateApiCall } from '../../utils/privateApi'
import type { StoriesApiResponse } from '~~/server/types/api/stories'

export default defineEventHandler(
  async (event): Promise<StoriesApiResponse> => {
    const id = getRouterParam(event, 'id')

    if (!id) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid story id',
      })
    }

    return mutatingPrivateApiCall<StoriesApiResponse>(
      event,
      `/api/v1/private/stories/${id}`,
      {
        mutationKey: 'stories:delete',
        method: 'DELETE',
      },
    )
  },
)
