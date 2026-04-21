import { mutatingPrivateApiCall } from '../../../../../utils/privateApi'
import { getConnectedBlogAuthor, getRequiredRouterParam } from '../../../utils'
import type {
  BlogApiResponse,
  CreateBlogCommentPayload,
} from '~~/server/types/api/blog'

export default defineEventHandler(async (event): Promise<BlogApiResponse> => {
  const postId = getRequiredRouterParam(event, 'postId', 'post')
  const body = await readBody<CreateBlogCommentPayload>(event)
  const author = await getConnectedBlogAuthor(event)
  const payload = author ? { ...body, author } : body

  return mutatingPrivateApiCall<BlogApiResponse>(
    event,
    `/api/v1/private/blog/posts/${encodeURIComponent(postId)}/comments`,
    {
      mutationKey: 'blog:posts:comments:create',
      method: 'POST',
      body: payload,
    },
  )
})
