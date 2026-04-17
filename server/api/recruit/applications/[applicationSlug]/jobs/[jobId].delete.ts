import type { RecruitBasicMessageResponse } from '~~/server/types/api/recruit'
import { mutatingPrivateApiCall } from '~~/server/utils/privateApi'

export default defineEventHandler(async (event): Promise<RecruitBasicMessageResponse> => {
  const applicationSlug = getRouterParam(event, 'applicationSlug')
  const jobId = getRouterParam(event, 'jobId')

  if (!applicationSlug || !jobId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing application slug or job id' })
  }

  return mutatingPrivateApiCall<RecruitBasicMessageResponse>(
    event,
    `/api/v1/recruit/applications/${applicationSlug}/jobs/${jobId}`,
    {
      method: 'DELETE',
      mutationKey: 'recruit-jobs',
    },
  )
})
