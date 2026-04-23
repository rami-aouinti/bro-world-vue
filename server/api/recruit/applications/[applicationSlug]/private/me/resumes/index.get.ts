import type { RecruitBasicMessageResponse } from '~~/server/types/api/recruit'
import { cachedPrivateGet } from '~~/server/utils/privateApi'

export default defineEventHandler(
  async (event): Promise<RecruitBasicMessageResponse> => {
    return cachedPrivateGet<RecruitBasicMessageResponse>(
      event,
      `/api/v1/recruit/private/me/resumes`,
    )
  },
)
