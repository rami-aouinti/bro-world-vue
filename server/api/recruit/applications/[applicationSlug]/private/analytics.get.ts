import type { RecruitAnalyticsResponse } from '~~/server/types/api/recruit'
import { cachedPrivateGet } from '~~/server/utils/privateApi'

export default defineEventHandler(
  async (event): Promise<RecruitAnalyticsResponse> => {
    return cachedPrivateGet<RecruitAnalyticsResponse>(
      event,
      `/api/v1/recruit/private/analytics`,
    )
  },
)
