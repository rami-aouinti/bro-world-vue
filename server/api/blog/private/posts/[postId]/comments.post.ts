import { createProxyHandler } from '../../../../../utils/createProxyHandler'
import { getRequiredRouterParam } from '../../../utils'

export default createProxyHandler({
  method: 'POST',
  endpointTemplate: '/api/v1/private/blog/posts/:postId/comments',
  resolveParams: (event) => ({
    postId: getRequiredRouterParam(event, 'postId', 'post'),
  }),
})
