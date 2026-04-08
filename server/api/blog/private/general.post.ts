import { mutatingPrivateApiCall } from '../../../utils/privateApi'
import type { CreateBlogPostPayload } from '~~/server/types/api/blog'
import type { BlogApiResponse } from '~~/server/types/api/blog'

export default defineEventHandler(async (event): Promise<BlogApiResponse> => {
  const body = await readBody<CreateBlogPostPayload>(event)

  return mutatingPrivateApiCall<BlogApiResponse>(
    event,
    '/api/v1/private/blogs/general',
    {
      mutationKey: 'blog:posts:create',
      method: 'POST',
      body,
    },
  )
})
