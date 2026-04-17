import type { RecruitJobUpsertPayload, RecruitBasicMessageResponse } from '~~/server/types/api/recruit'
import { mutatingPrivateApiCall } from '~~/server/utils/privateApi'

export default defineEventHandler(async (event): Promise<RecruitBasicMessageResponse> => {
  const applicationSlug = getRouterParam(event, 'applicationSlug')

  if (!applicationSlug) {
    throw createError({ statusCode: 400, statusMessage: 'Missing application slug' })
  }

  const body = await readBody<RecruitJobUpsertPayload>(event)

  return mutatingPrivateApiCall<RecruitBasicMessageResponse>(
    event,
    `/api/v1/recruit/applications/${applicationSlug}/jobs`,
    {
      method: 'POST',
      body,
      mutationKey: 'recruit-jobs',
    },
  )
})
