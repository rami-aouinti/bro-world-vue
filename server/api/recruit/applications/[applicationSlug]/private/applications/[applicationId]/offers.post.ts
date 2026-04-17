import type { RecruitOfferCreatePayload, RecruitBasicMessageResponse } from '~~/server/types/api/recruit'
import { mutatingPrivateApiCall } from '~~/server/utils/privateApi'

export default defineEventHandler(async (event): Promise<RecruitBasicMessageResponse> => {
  const applicationSlug = getRouterParam(event, 'applicationSlug')
  const applicationId = getRouterParam(event, 'applicationId')

  if (!applicationSlug || !applicationId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing application slug or id' })
  }

  const body = await readBody<RecruitOfferCreatePayload>(event)

  return mutatingPrivateApiCall<RecruitBasicMessageResponse>(
    event,
    `/api/v1/recruit/applications/${applicationSlug}/private/applications/${applicationId}/offers`,
    {
      method: 'POST',
      body,
      mutationKey: 'recruit-offers',
    },
  )
})
