import { createProxyHandler } from '../../../../../utils/createProxyHandler'
import { getRequiredRouterParam } from '../../../utils'
import type {
  BlogApiResponse,
  CreateBlogCommentPayload,
} from '~~/server/types/api/blog'

export default createProxyHandler<BlogApiResponse, CreateBlogCommentPayload>({
  method: 'POST',
  endpointTemplate: '/api/v1/private/blog/posts/:postId/comments',
  mutationKey: 'blog:posts:comments:create',
  resolveParams: (event) => ({
    postId: getRequiredRouterParam(event, 'postId', 'post'),
  }),
})
