import type { RecruitResumePatchPayload, RecruitBasicMessageResponse } from '~~/server/types/api/recruit'
import { mutatingPrivateApiCall } from '~~/server/utils/privateApi'

export default defineEventHandler(async (event): Promise<RecruitBasicMessageResponse> => {
  const applicationSlug = getRouterParam(event, 'applicationSlug')
  const resumeId = getRouterParam(event, 'resumeId')

  if (!applicationSlug || !resumeId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing application slug or resume id' })
  }

  const body = await readBody<RecruitResumePatchPayload>(event)

  return mutatingPrivateApiCall<RecruitBasicMessageResponse>(
    event,
    `/api/v1/recruit/applications/${applicationSlug}/private/me/resumes/${resumeId}`,
    {
      method: 'PATCH',
      body,
      mutationKey: 'recruit-resumes',
    },
  )
})
