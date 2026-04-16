import type {
  RecruitApplicant,
  RecruitApplicantCreatePayload,
} from '~~/server/types/api/recruit'
import { mutatingPrivateApiCall } from '~~/server/utils/privateApi'

export default defineEventHandler(async (event): Promise<RecruitApplicant> => {
  const body = await readBody<RecruitApplicantCreatePayload>(event)

  return mutatingPrivateApiCall<RecruitApplicant>(
    event,
    '/api/v1/recruit/general/applicants',
    {
      method: 'POST',
      body,
      mutationKey: 'recruit-applicants',
    },
  )
})
