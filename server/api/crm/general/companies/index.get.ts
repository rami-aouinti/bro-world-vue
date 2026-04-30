import type {
  CrmCompanyItem,
  ApiListResponse,
} from '~~/server/types/api/crm-general'
import { cachedCrmGeneralGet } from '~~/server/utils/crmGeneralPrivateApi'

export default defineEventHandler(
  async (event): Promise<ApiListResponse<CrmCompanyItem>> => {
    return cachedCrmGeneralGet<ApiListResponse<CrmCompanyItem>>(
      event,
      'companies',
      getQuery(event),
    )
  },
)
