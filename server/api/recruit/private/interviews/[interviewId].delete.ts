import type { ApiObject } from '~~/server/types/api/common'
import { mutatingPrivateApiCall } from '~~/server/utils/privateApi'

export default defineEventHandler(async (event): Promise<ApiObject> => {
  const interviewId = getRouterParam(event, 'interviewId')

  if (!interviewId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing interview id',
    })
  }

  return mutatingPrivateApiCall<ApiObject>(
    event,
    `/api/v1/recruit/private/interviews/${interviewId}`,
    {
      method: 'DELETE',
      mutationKey: 'recruit-interviews',
    },
  )
})
