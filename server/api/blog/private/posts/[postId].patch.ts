import { createProxyHandler } from '../../../../utils/createProxyHandler'
import { getRequiredRouterParam } from '../../utils'
import type {
  BlogApiResponse,
  UpdateBlogPostPayload,
} from '~~/server/types/api/blog'

export default createProxyHandler<BlogApiResponse, UpdateBlogPostPayload>({
  method: 'PATCH',
  endpointTemplate: '/api/v1/private/blog/posts/:postId',
  mutationKey: 'blog:posts:update',
  resolveParams: (event) => ({
    postId: getRequiredRouterParam(event, 'postId', 'post'),
  }),
})
