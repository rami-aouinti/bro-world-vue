import type {
  RecruitJobUpsertPayload,
  RecruitBasicMessageResponse,
} from '~~/server/types/api/recruit'
import { mutatingPrivateApiCall } from '~~/server/utils/privateApi'

export default defineEventHandler(
  async (event): Promise<RecruitBasicMessageResponse> => {
    const jobId = getRouterParam(event, 'jobId')

    if (!jobId) {
      throw createError({ statusCode: 400, statusMessage: 'Missing job id' })
    }

    const body = await readBody<RecruitJobUpsertPayload>(event)

    return mutatingPrivateApiCall<RecruitBasicMessageResponse>(
      event,
      `/api/v1/recruit/jobs/${jobId}`,
      {
        method: 'PATCH',
        body,
        mutationKey: 'recruit-jobs',
      },
    )
  },
)
