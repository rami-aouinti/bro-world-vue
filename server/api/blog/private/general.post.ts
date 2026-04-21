import { mutatingPrivateApiCall } from '../../../utils/privateApi'
import { getConnectedBlogAuthor } from '../utils'
import type {
  CreateBlogPostPayload,
  BlogApiResponse,
} from '~~/server/types/api/blog'

export default defineEventHandler(async (event): Promise<BlogApiResponse> => {
  const payload = await readBody<CreateBlogPostPayload & { blogId?: string }>(
    event,
  )
  const author = await getConnectedBlogAuthor(event)
  const blogId = payload.blogId?.trim() || 'general'
  const { blogId: _blogId, ...body } = payload
  const requestBody = author ? { ...body, author } : body

  return mutatingPrivateApiCall<BlogApiResponse>(
    event,
    `/api/v1/private/blogs/${encodeURIComponent(blogId)}/posts`,
    {
      mutationKey: 'blog:posts:create',
      method: 'POST',
      body: requestBody,
    },
  )
})
