import { createProxyHandler } from '../../../../utils/createProxyHandler'
import { getRequiredRouterParam } from '../../utils'
import type { BlogApiResponse } from '~~/server/types/api/blog'

export default createProxyHandler<BlogApiResponse>({
  method: 'DELETE',
  endpointTemplate: '/api/v1/private/blog/posts/:postId',
  mutationKey: 'blog:posts:delete',
  resolveParams: (event) => ({
    postId: getRequiredRouterParam(event, 'postId', 'post'),
  }),
})
