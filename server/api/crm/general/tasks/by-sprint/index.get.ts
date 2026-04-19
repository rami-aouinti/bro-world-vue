import type { CrmTaskItem } from '~~/server/types/api/crm-general'
import { cachedCrmGeneralGet } from '~~/server/utils/crmGeneralPrivateApi'

interface CrmSprintBucket {
  sprint: {
    id: string | null
    name: string | null
    status: string | null
    startDate: string | null
    endDate: string | null
  }
  tasks: CrmTaskItem[]
}

interface CrmTasksBySprintResponse {
  items: CrmSprintBucket[]
}

export default defineEventHandler(async (event): Promise<CrmTasksBySprintResponse> => {
  return cachedCrmGeneralGet<CrmTasksBySprintResponse>(
    event,
    'tasks/by-sprint',
    getQuery(event),
  )
})
