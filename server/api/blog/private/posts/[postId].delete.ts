import { createProxyHandler } from '../../../../utils/createProxyHandler'
import { getRequiredRouterParam } from '../../utils'

export default createProxyHandler({
  method: 'DELETE',
  endpointTemplate: '/api/v1/private/blog/posts/:postId',
  resolveParams: (event) => ({
    postId: getRequiredRouterParam(event, 'postId', 'post'),
  }),
})
