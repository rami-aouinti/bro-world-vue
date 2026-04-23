import type { RecruitPipelineResponse } from '~~/server/types/api/recruit'
import { cachedPrivateGet } from '~~/server/utils/privateApi'

export default defineEventHandler(
  async (event): Promise<RecruitPipelineResponse> => {
    return cachedPrivateGet<RecruitPipelineResponse>(
      event,
      `/api/v1/recruit/private/pipeline`,
    )
  },
)
