import type { RecruitApplicationCreatePayload, RecruitBasicMessageResponse } from '~~/server/types/api/recruit'
import { mutatingPrivateApiCall } from '~~/server/utils/privateApi'

export default defineEventHandler(async (event): Promise<RecruitBasicMessageResponse> => {
  const applicationSlug = getRouterParam(event, 'applicationSlug')

  if (!applicationSlug) {
    throw createError({ statusCode: 400, statusMessage: 'Missing application slug' })
  }

  const body = await readBody<RecruitApplicationCreatePayload>(event)

  return mutatingPrivateApiCall<RecruitBasicMessageResponse>(
    event,
    `/api/v1/recruit/applications/${applicationSlug}/applicants`,
    {
      method: 'POST',
      body,
      mutationKey: 'recruit-applications',
    },
  )
})
