import { createProxyHandler } from '../../../../utils/createProxyHandler'
import { getRequiredRouterParam } from '../utils'
import type {
  BlogApiResponse,
  BlogReactionPayload,
} from '~~/server/types/api/blog'

export default createProxyHandler<BlogApiResponse, BlogReactionPayload>({
  method: 'PATCH',
  endpointTemplate: '/api/v1/private/blog/reactions/:reactionId',
  mutationKey: 'blog:posts:reactions:update',
  resolveParams: (event) => ({
    reactionId: getRequiredRouterParam(event, 'reactionId', 'reaction'),
  }),
})
