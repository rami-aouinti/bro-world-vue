import type { RecruitResumeCreatePayload, RecruitBasicMessageResponse } from '~~/server/types/api/recruit'
import { mutatingPrivateApiCall } from '~~/server/utils/privateApi'

export default defineEventHandler(async (event): Promise<RecruitBasicMessageResponse> => {
  const applicationSlug = getRouterParam(event, 'applicationSlug')

  if (!applicationSlug) {
    throw createError({ statusCode: 400, statusMessage: 'Missing application slug' })
  }

  const body = await readBody<RecruitResumeCreatePayload>(event)

  return mutatingPrivateApiCall<RecruitBasicMessageResponse>(
    event,
    `/api/v1/recruit/applications/${applicationSlug}/resumes`,
    {
      method: 'POST',
      body,
      mutationKey: 'recruit-resumes',
    },
  )
})
