import type { RecruitJobUpsertPayload, RecruitBasicMessageResponse } from '~~/server/types/api/recruit'
import { mutatingPrivateApiCall } from '~~/server/utils/privateApi'

export default defineEventHandler(async (event): Promise<RecruitBasicMessageResponse> => {
  const applicationSlug = getRouterParam(event, 'applicationSlug')
  const jobId = getRouterParam(event, 'jobId')

  if (!applicationSlug || !jobId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing application slug or job id' })
  }

  const body = await readBody<RecruitJobUpsertPayload>(event)

  return mutatingPrivateApiCall<RecruitBasicMessageResponse>(
    event,
    `/api/v1/recruit/applications/${applicationSlug}/jobs/${jobId}`,
    {
      method: 'PATCH',
      body,
      mutationKey: 'recruit-jobs',
    },
  )
})
