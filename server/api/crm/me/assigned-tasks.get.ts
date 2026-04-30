import type {
  ApiListResponse,
  CrmTaskItem,
} from '~~/server/types/api/crm-general'
import { fetchCrmGeneral } from '~~/server/utils/crmGeneralApi'

export default defineEventHandler(
  async (event): Promise<ApiListResponse<CrmTaskItem>> => {
    return fetchCrmGeneral<ApiListResponse<CrmTaskItem>>(
      event,
      'me/assigned-tasks',
      {
        query: getQuery(event) as Record<
          string,
          string | number | boolean | undefined
        >,
      },
    )
  },
)
