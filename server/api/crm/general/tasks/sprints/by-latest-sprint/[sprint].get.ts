import type { CrmTaskItem } from '~~/server/types/api/crm-general'
import { fetchCrmGeneral } from '~~/server/utils/crmGeneralApi'

interface CrmSprintMeta {
  id: string | null
  name: string | null
  status: string | null
  startDate: string | null
  endDate: string | null
}

interface CrmSprintBucket {
  sprint: CrmSprintMeta
  tasks: CrmTaskItem[]
}

interface CrmTasksBySprintResponse {
  items: CrmSprintBucket[]
  meta?: {
    sprint: CrmSprintMeta | null
  }
}

export default defineEventHandler(
  (event): Promise<CrmTasksBySprintResponse> => {
    const sprintId = getRouterParam(event, 'sprint')

    if (!sprintId) {
      throw createError({ statusCode: 400, statusMessage: 'Missing sprint id' })
    }

    return fetchCrmGeneral<CrmTasksBySprintResponse>(
      event,
      `tasks/sprints/by-latest-sprint/${encodeURIComponent(sprintId)}`,
      {
        query: getQuery(event) as Record<
          string,
          string | number | boolean | undefined
        >,
      },
    )
  },
)
