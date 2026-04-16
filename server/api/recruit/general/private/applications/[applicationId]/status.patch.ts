import type {
  RecruitApplicationStatusPatchPayload,
  RecruitOwnerJobApplication,
} from '~~/server/types/api/recruit'
import { mutatingPrivateApiCall } from '~~/server/utils/privateApi'

export default defineEventHandler(
  async (event): Promise<RecruitOwnerJobApplication> => {
    const applicationId = getRouterParam(event, 'applicationId')

    if (!applicationId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing application id',
      })
    }

    const body = await readBody<RecruitApplicationStatusPatchPayload>(event)

    return mutatingPrivateApiCall<RecruitOwnerJobApplication>(
      event,
      `/api/v1/recruit/general/private/applications/${applicationId}/status`,
      {
        method: 'PATCH',
        body,
        mutationKey: 'recruit-applications',
      },
    )
  },
)
