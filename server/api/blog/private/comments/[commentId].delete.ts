import { createProxyHandler } from '../../../../utils/createProxyHandler'
import { getRequiredRouterParam } from '../utils'
import type { BlogApiResponse } from '~~/server/types/api/blog'

export default createProxyHandler<BlogApiResponse>({
  method: 'DELETE',
  endpointTemplate: '/api/v1/private/blog/comments/:commentId',
  mutationKey: 'blog:posts:comments:delete',
  resolveParams: (event) => ({
    commentId: getRequiredRouterParam(event, 'commentId', 'comment'),
  }),
})
