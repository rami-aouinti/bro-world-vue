import { createProxyHandler } from '../../../../../utils/createProxyHandler'
import { getRequiredRouterParam } from '../../../utils'
import type {
  BlogApiResponse,
  CreateBlogPostPayload,
} from '~~/server/types/api/blog'

export default createProxyHandler<BlogApiResponse, CreateBlogPostPayload>({
  method: 'POST',
  endpointTemplate: '/api/v1/private/blogs/:blogId/posts',
  mutationKey: 'blog:posts:create',
  resolveParams: (event) => ({
    blogId: getRequiredRouterParam(event, 'blogId', 'blog'),
  }),
})
