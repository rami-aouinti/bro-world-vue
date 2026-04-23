import type {
  RecruitInterview,
  RecruitInterviewPatchPayload,
} from '~~/server/types/api/recruit'
import { mutatingPrivateApiCall } from '~~/server/utils/privateApi'

export default defineEventHandler(async (event): Promise<RecruitInterview> => {
  const interviewId = getRouterParam(event, 'interviewId')

  if (!interviewId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing interview id',
    })
  }

  const body = await readBody<RecruitInterviewPatchPayload>(event)

  return mutatingPrivateApiCall<RecruitInterview>(
    event,
    `/api/v1/recruit/private/interviews/${interviewId}`,
    {
      method: 'PATCH',
      body,
      mutationKey: 'recruit-interviews',
    },
  )
})
