import type {
  ApiListResponse,
  CrmTaskItem,
} from '~~/server/types/api/crm-general'
import { cachedCrmGeneralGet } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(
  async (event): Promise<ApiListResponse<CrmTaskItem>> => {
    const sprint = getRouterParam(event, 'sprint')

    if (!sprint) {
      throw createError({ statusCode: 400, statusMessage: 'Missing sprint id' })
    }

    return cachedCrmGeneralGet<ApiListResponse<CrmTaskItem>>(
      event,
      `sprints/${encodeURIComponent(sprint)}/tasks`,
      getQuery(event),
    )
  },
)
