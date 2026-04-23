import type {
  RecruitResumeCreatePayload,
  RecruitBasicMessageResponse,
} from '~~/server/types/api/recruit'
import { mutatingPrivateApiCall } from '~~/server/utils/privateApi'

export default defineEventHandler(
  async (event): Promise<RecruitBasicMessageResponse> => {
    const body = await readBody<RecruitResumeCreatePayload>(event)

    return mutatingPrivateApiCall<RecruitBasicMessageResponse>(
      event,
      `/api/v1/recruit/resumes`,
      {
        method: 'POST',
        body,
        mutationKey: 'recruit-resumes',
      },
    )
  },
)
