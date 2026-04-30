import type {
  ApiListResponse,
  CrmTaskRequestItem,
} from '~~/server/types/api/crm-general'
import { fetchCrmGeneral } from '~~/server/utils/crmGeneralApi'

export default defineEventHandler(
  async (event): Promise<ApiListResponse<CrmTaskRequestItem>> => {
    return fetchCrmGeneral<ApiListResponse<CrmTaskRequestItem>>(
      event,
      'me/assigned-task-requests',
      {
        query: getQuery(event) as Record<
          string,
          string | number | boolean | undefined
        >,
      },
    )
  },
)
