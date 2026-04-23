import type {
  RecruitOfferCreatePayload,
  RecruitBasicMessageResponse,
} from '~~/server/types/api/recruit'
import { mutatingPrivateApiCall } from '~~/server/utils/privateApi'

export default defineEventHandler(
  async (event): Promise<RecruitBasicMessageResponse> => {
    const applicationId = getRouterParam(event, 'applicationId')

    if (!applicationId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing application id',
      })
    }

    const body = await readBody<RecruitOfferCreatePayload>(event)

    return mutatingPrivateApiCall<RecruitBasicMessageResponse>(
      event,
      `/api/v1/recruit/private/applications/${applicationId}/offers`,
      {
        method: 'POST',
        body,
        mutationKey: 'recruit-offers',
      },
    )
  },
)
