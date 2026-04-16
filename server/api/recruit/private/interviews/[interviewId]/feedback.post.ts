import type {
  RecruitInterviewFeedbackPayload,
  RecruitInterviewWithFeedback,
} from '~~/server/types/api/recruit'
import { mutatingPrivateApiCall } from '~~/server/utils/privateApi'

export default defineEventHandler(
  async (event): Promise<RecruitInterviewWithFeedback> => {
    const interviewId = getRouterParam(event, 'interviewId')

    if (!interviewId) {
      throw createError({ statusCode: 400, statusMessage: 'Missing interview id' })
    }

    const body = await readBody<RecruitInterviewFeedbackPayload>(event)

    return mutatingPrivateApiCall<RecruitInterviewWithFeedback>(
      event,
      `/api/v1/recruit/private/interviews/${interviewId}/feedback`,
      {
        method: 'POST',
        body,
        mutationKey: 'recruit-interviews-feedback',
      },
    )
  },
)
