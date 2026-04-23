import type {
  RecruitInterview,
  RecruitInterviewCreatePayload,
} from '~~/server/types/api/recruit'
import { mutatingPrivateApiCall } from '~~/server/utils/privateApi'

export default defineEventHandler(async (event): Promise<RecruitInterview> => {
  const applicationId = getRouterParam(event, 'applicationId')

  if (!applicationId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing application id',
    })
  }

  const body = await readBody<RecruitInterviewCreatePayload>(event)

  return mutatingPrivateApiCall<RecruitInterview>(
    event,
    `/api/v1/recruit/private/applications/${applicationId}/interviews`,
    {
      method: 'POST',
      body,
      mutationKey: 'recruit-interviews',
    },
  )
})
