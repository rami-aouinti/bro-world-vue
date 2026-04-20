import type { CrmTaskItem } from '~~/server/types/api/crm-general'
import { fetchCrmGeneral } from '~~/server/utils/crmGeneralApi'

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
  return fetchCrmGeneral<CrmTasksByLatestSprintResponse>(
    'tasks/by-latest-sprint',
    { query: getQuery(event) as Record<string, string | number | boolean | undefined> },
  )
})
