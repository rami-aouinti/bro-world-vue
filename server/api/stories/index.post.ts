import { mutatingPrivateApiCall } from '../../utils/privateApi'
import type { StoriesApiResponse } from '~~/server/types/api/stories'

export default defineEventHandler(
  async (event): Promise<StoriesApiResponse> => {
    const contentType = getHeader(event, 'content-type')
    const body = await readRawBody(event, false)

    const headers = new Headers()

    if (contentType) {
      headers.set('content-type', contentType)
    }

    return mutatingPrivateApiCall<StoriesApiResponse>(
      event,
      '/api/v1/private/stories',
      {
        mutationKey: 'stories:create',
        method: 'POST',
        headers,
        body: body as BodyInit | null,
      },
    )
  },
)
