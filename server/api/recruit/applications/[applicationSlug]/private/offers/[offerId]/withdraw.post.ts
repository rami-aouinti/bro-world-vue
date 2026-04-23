import type {
  RecruitOfferActionPayload,
  RecruitBasicMessageResponse,
} from '~~/server/types/api/recruit'
import { mutatingPrivateApiCall } from '~~/server/utils/privateApi'

export default defineEventHandler(
  async (event): Promise<RecruitBasicMessageResponse> => {
    const offerId = getRouterParam(event, 'offerId')

    if (!offerId) {
      throw createError({ statusCode: 400, statusMessage: 'Missing offer id' })
    }

    const body = await readBody<RecruitOfferActionPayload>(event)

    return mutatingPrivateApiCall<RecruitBasicMessageResponse>(
      event,
      `/api/v1/recruit/private/offers/${offerId}/withdraw`,
      {
        method: 'POST',
        body,
        mutationKey: 'recruit-offers',
      },
    )
  },
)
