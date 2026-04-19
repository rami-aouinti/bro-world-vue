import type { ApiObject } from '~~/server/types/api/common'
import { mutatingPrivateApiCall } from '~~/server/utils/privateApi'

type ProfileApplicationCreateResponse = Record<string, unknown>

export default defineEventHandler(
  async (event): Promise<ProfileApplicationCreateResponse> => {
    const body = (await readBody<Record<string, unknown>>(event)) as ApiObject

    return mutatingPrivateApiCall<ProfileApplicationCreateResponse>(
      event,
      '/profile/applications',
      {
        method: 'POST',
        body,
        mutationKey: 'recruit-applications',
      },
    )
  },
)
