import type {
  RecruitJobUpsertPayload,
  RecruitBasicMessageResponse,
} from '~~/server/types/api/recruit'
import { mutatingPrivateApiCall } from '~~/server/utils/privateApi'

export default defineEventHandler(
  async (event): Promise<RecruitBasicMessageResponse> => {
    const body = await readBody<RecruitJobUpsertPayload>(event)

    return mutatingPrivateApiCall<RecruitBasicMessageResponse>(
      event,
      `/api/v1/recruit/jobs`,
      {
        method: 'POST',
        body,
        mutationKey: 'recruit-jobs',
      },
    )
  },
)
