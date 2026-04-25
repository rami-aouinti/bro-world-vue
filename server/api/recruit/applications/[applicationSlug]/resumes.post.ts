import type { ApiObject } from '~~/server/types/api/common'
import type { RecruitResumeCreateResponse } from '~~/server/types/api/recruit'
import { mutatingPrivateApiCall } from '~~/server/utils/privateApi'

export default defineEventHandler(
  async (event): Promise<RecruitResumeCreateResponse> => {
    const contentType = getHeader(event, 'content-type') || ''

    if (contentType.includes('multipart/form-data')) {
      const parts = await readMultipartFormData(event)
      const formData = new FormData()

      for (const part of parts || []) {
        if (!part.name || !part.data) {
          continue
        }

        if (part.filename) {
          const file = new File([part.data], part.filename, {
            type: part.type || 'application/octet-stream',
          })
          formData.append(part.name, file)
          continue
        }

        formData.append(part.name, part.data.toString('utf-8'))
      }

      return mutatingPrivateApiCall<RecruitResumeCreateResponse>(
        event,
        `/api/v1/recruit/resumes`,
        {
          method: 'POST',
          body: formData,
          mutationKey: 'recruit-resumes',
        },
      )
    }

    const body = (await readBody<Record<string, unknown>>(event)) as ApiObject

    return mutatingPrivateApiCall<RecruitResumeCreateResponse>(
      event,
      `/api/v1/recruit/resumes`,
      {
        method: 'POST',
        body,
        mutationKey: 'recruit-resumes',
      },
    )
  },
)
