import { createProxyHandler } from '../../../../utils/createProxyHandler'
import { getRequiredRouterParam } from '../utils'
import type {
  BlogApiResponse,
  UpdateBlogCommentPayload,
} from '~~/server/types/api/blog'

export default createProxyHandler<BlogApiResponse, UpdateBlogCommentPayload>({
  method: 'PATCH',
  endpointTemplate: '/api/v1/private/blog/comments/:commentId',
  mutationKey: 'blog:posts:comments:update',
  resolveParams: (event) => ({
    commentId: getRequiredRouterParam(event, 'commentId', 'comment'),
  }),
})
