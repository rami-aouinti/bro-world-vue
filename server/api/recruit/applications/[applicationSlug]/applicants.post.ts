import type {
  RecruitApplicationCreatePayload,
  RecruitBasicMessageResponse,
} from '~~/server/types/api/recruit'
import { mutatingPrivateApiCall } from '~~/server/utils/privateApi'

export default defineEventHandler(
  async (event): Promise<RecruitBasicMessageResponse> => {
    const body = await readBody<RecruitApplicationCreatePayload>(event)

    return mutatingPrivateApiCall<RecruitBasicMessageResponse>(
      event,
      `/api/v1/recruit/applicants`,
      {
        method: 'POST',
        body,
        mutationKey: 'recruit-applications',
      },
    )
  },
)
