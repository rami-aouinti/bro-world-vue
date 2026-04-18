import { getHeader, readMultipartFormData } from 'h3'
import { mutatingPrivateApiCall } from '../../../../../utils/privateApi'
import { getRequiredRouterParam } from '../../../utils'
import type {
  BlogApiResponse,
  CreateBlogPostPayload,
} from '~~/server/types/api/blog'

export default defineEventHandler(async (event): Promise<BlogApiResponse> => {
  const blogId = getRequiredRouterParam(event, 'blogId', 'blog')
  const endpoint = `/api/v1/private/blogs/${encodeURIComponent(blogId)}/posts`
  const contentType = (getHeader(event, 'content-type') || '').toLowerCase()

  if (contentType.includes('multipart/form-data')) {
    const parts = (await readMultipartFormData(event)) || []
    const formData = new FormData()

    for (const part of parts) {
      if (!part.name || !part.data) {
        continue
      }

      if (part.filename) {
        const file = new File([part.data], part.filename, {
          type: part.type || 'application/octet-stream',
        })
        formData.append(part.name, file)
      } else {
        formData.append(part.name, part.data.toString('utf-8'))
      }
    }

    return mutatingPrivateApiCall<BlogApiResponse>(event, endpoint, {
      mutationKey: 'blog:posts:create',
      method: 'POST',
      body: formData,
    })
  }

  const body = await readBody<CreateBlogPostPayload>(event)

  return mutatingPrivateApiCall<BlogApiResponse>(event, endpoint, {
    mutationKey: 'blog:posts:create',
    method: 'POST',
    body,
  })
})
