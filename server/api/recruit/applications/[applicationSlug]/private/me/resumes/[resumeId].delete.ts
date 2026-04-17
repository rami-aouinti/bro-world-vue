import type { RecruitBasicMessageResponse } from '~~/server/types/api/recruit'
import { mutatingPrivateApiCall } from '~~/server/utils/privateApi'

export default defineEventHandler(async (event): Promise<RecruitBasicMessageResponse> => {
  const applicationSlug = getRouterParam(event, 'applicationSlug')
  const resumeId = getRouterParam(event, 'resumeId')

  if (!applicationSlug || !resumeId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing application slug or resume id' })
  }

  return mutatingPrivateApiCall<RecruitBasicMessageResponse>(
    event,
    `/api/v1/recruit/applications/${applicationSlug}/private/me/resumes/${resumeId}`,
    {
      method: 'DELETE',
      mutationKey: 'recruit-resumes',
    },
  )
})
