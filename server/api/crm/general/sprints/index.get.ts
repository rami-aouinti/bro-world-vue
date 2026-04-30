import type {
  CrmSprintItem,
  ApiListResponse,
} from '~~/server/types/api/crm-general'
import { fetchCrmGeneral } from '~~/server/utils/crmGeneralApi'

export default defineEventHandler(
  async (event): Promise<ApiListResponse<CrmSprintItem>> => {
    return fetchCrmGeneral<ApiListResponse<CrmSprintItem>>(event, 'sprints', {
      query: getQuery(event) as Record<
        string,
        string | number | boolean | undefined
      >,
    })
  },
)
