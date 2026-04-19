import type {
  RecruitBasicMessageResponse,
  RecruitResumePatchPayload,
} from '~~/server/types/api/recruit'
import { mutatingPrivateApiCall } from '~~/server/utils/privateApi'

export default defineEventHandler(async (event): Promise<RecruitBasicMessageResponse> => {
  const resumeId = getRouterParam(event, 'resumeId')

  if (!resumeId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing resume id' })
  }

  const body = await readBody<RecruitResumePatchPayload>(event)

  return mutatingPrivateApiCall<RecruitBasicMessageResponse>(
    event,
    `/api/v1/recruit/general/private/me/resumes/${resumeId}`,
    {
      method: 'PATCH',
      body,
      mutationKey: 'recruit-resumes',
    },
  )
})
