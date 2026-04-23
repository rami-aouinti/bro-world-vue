import type { RecruitInterview } from '~~/server/types/api/recruit'
import { cachedPrivateGet } from '~~/server/utils/privateApi'

export default defineEventHandler(
  async (event): Promise<RecruitInterview[]> => {
    const applicationId = getRouterParam(event, 'applicationId')

    if (!applicationId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing application id',
      })
    }

    return cachedPrivateGet<RecruitInterview[]>(
      event,
      `/api/v1/recruit/private/applications/${applicationId}/interviews`,
    )
  },
)
