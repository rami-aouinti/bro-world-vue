import type { RecruitBasicMessageResponse } from '~~/server/types/api/recruit'
import { mutatingPrivateApiCall } from '~~/server/utils/privateApi'

export default defineEventHandler(
  async (event): Promise<RecruitBasicMessageResponse> => {
    const resumeId = getRouterParam(event, 'resumeId')

    if (!resumeId) {
      throw createError({ statusCode: 400, statusMessage: 'Missing resume id' })
    }

    return mutatingPrivateApiCall<RecruitBasicMessageResponse>(
      event,
      `/api/v1/recruit/private/me/resumes/${resumeId}`,
      {
        method: 'DELETE',
        mutationKey: 'recruit-resumes',
      },
    )
  },
)
