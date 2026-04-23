import type { RecruitJobsStatsResponse } from '~~/server/types/api/recruit'
import { cachedPrivateGet } from '~~/server/utils/privateApi'

export default defineEventHandler(
  async (event): Promise<RecruitJobsStatsResponse> => {
    return cachedPrivateGet<RecruitJobsStatsResponse>(
      event,
      `/api/v1/recruit/private/jobs/stats`,
    )
  },
)
