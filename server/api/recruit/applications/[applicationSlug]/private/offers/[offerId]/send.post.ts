import type { RecruitOfferActionPayload, RecruitBasicMessageResponse } from '~~/server/types/api/recruit'
import { mutatingPrivateApiCall } from '~~/server/utils/privateApi'

export default defineEventHandler(async (event): Promise<RecruitBasicMessageResponse> => {
  const applicationSlug = getRouterParam(event, 'applicationSlug')
  const offerId = getRouterParam(event, 'offerId')

  if (!applicationSlug || !offerId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing application slug or offer id' })
  }

  const body = await readBody<RecruitOfferActionPayload>(event)

  return mutatingPrivateApiCall<RecruitBasicMessageResponse>(
    event,
    `/api/v1/recruit/applications/${applicationSlug}/private/offers/${offerId}/send`,
    {
      method: 'POST',
      body,
      mutationKey: 'recruit-offers',
    },
  )
})
