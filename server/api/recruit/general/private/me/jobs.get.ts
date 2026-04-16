import type { RecruitMyJobsResponse } from '~~/server/types/api/recruit'
import { cachedPrivateGet } from '~~/server/utils/privateApi'

export default defineEventHandler(
  async (event): Promise<RecruitMyJobsResponse> => {
    return cachedPrivateGet<RecruitMyJobsResponse>(
      event,
      '/api/v1/recruit/general/private/me/jobs',
    )
  },
)
