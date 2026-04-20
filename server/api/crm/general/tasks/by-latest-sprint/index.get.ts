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

interface CrmTasksByLatestSprintResponse {
  items: CrmSprintBucket[]
  meta?: {
    sprint: CrmSprintBucket['sprint'] | null
  }
}

export default defineEventHandler(async (event): Promise<CrmTasksByLatestSprintResponse> => {

  return cachedCrmGeneralGet<CrmTasksByLatestSprintResponse>(
    event,
    'tasks/by-latest-sprint',
    getQuery(event),
  )
})
