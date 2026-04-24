import type {
  RecruitBasicMessageResponse,
  RecruitResumePatchPayload,
} from '~~/server/types/api/recruit'
import { mutatingPrivateApiCall } from '~~/server/utils/privateApi'

export default defineEventHandler(
  async (event): Promise<RecruitBasicMessageResponse> => {
    const resumeId = getRouterParam(event, 'resumeId')
    const contentType = getHeader(event, 'content-type') || ''

    if (!resumeId) {
      throw createError({ statusCode: 400, statusMessage: 'Missing resume id' })
    }

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

      return mutatingPrivateApiCall<RecruitBasicMessageResponse>(
        event,
        `/api/v1/recruit/private/me/resumes/${resumeId}`,
        {
          method: 'PATCH',
          body: formData,
          mutationKey: 'recruit-resumes',
        },
      )
    }

    const body = await readBody<RecruitResumePatchPayload>(event)

    return mutatingPrivateApiCall<RecruitBasicMessageResponse>(
      event,
      `/api/v1/recruit/private/me/resumes/${resumeId}`,
      {
        method: 'PATCH',
        body,
        mutationKey: 'recruit-resumes',
      },
    )
  },
)
