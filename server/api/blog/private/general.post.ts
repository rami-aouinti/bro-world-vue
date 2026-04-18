import { mutatingPrivateApiCall } from '../../../utils/privateApi'
import type {
  CreateBlogPostPayload,
  BlogApiResponse,
} from '~~/server/types/api/blog'

export default defineEventHandler(async (event): Promise<BlogApiResponse> => {
  const payload = await readBody<CreateBlogPostPayload & { blogId?: string }>(
    event,
  )
  const blogId = payload.blogId?.trim() || 'general'
  const { blogId: _blogId, ...body } = payload

  return mutatingPrivateApiCall<BlogApiResponse>(
    event,
    `/api/v1/private/blog/blogs/${encodeURIComponent(blogId)}/posts`,
    {
      mutationKey: 'blog:posts:create',
      method: 'POST',
      body,
    },
  )
})
