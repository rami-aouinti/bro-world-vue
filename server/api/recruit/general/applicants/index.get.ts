import type { RecruitApplicant } from '~~/server/types/api/recruit'
import { cachedPrivateGet } from '~~/server/utils/privateApi'

export default defineEventHandler(
  async (event): Promise<RecruitApplicant[]> => {
    return cachedPrivateGet<RecruitApplicant[]>(
      event,
      '/api/v1/recruit/general/applicants',
    )
  },
)
