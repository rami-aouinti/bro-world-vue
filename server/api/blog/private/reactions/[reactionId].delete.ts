import { createProxyHandler } from '../../../../utils/createProxyHandler'
import { getRequiredRouterParam } from '../utils'
import type { BlogApiResponse } from '~~/server/types/api/blog'

export default createProxyHandler<BlogApiResponse>({
  method: 'DELETE',
  endpointTemplate: '/api/v1/private/blog/reactions/:reactionId',
  mutationKey: 'blog:posts:reactions:delete',
  resolveParams: (event) => ({
    reactionId: getRequiredRouterParam(event, 'reactionId', 'reaction'),
  }),
})
