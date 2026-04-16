import type {
  RecruitApplicationCreatePayload,
  RecruitApplicationSummary,
} from '~~/server/types/api/recruit'
import { mutatingPrivateApiCall } from '~~/server/utils/privateApi'

export default defineEventHandler(
  async (event): Promise<RecruitApplicationSummary> => {
    const body = await readBody<RecruitApplicationCreatePayload>(event)

    return mutatingPrivateApiCall<RecruitApplicationSummary>(
      event,
      '/api/v1/recruit/general/applications',
      {
        method: 'POST',
        body,
        mutationKey: 'recruit-applications',
      },
    )
  },
)
