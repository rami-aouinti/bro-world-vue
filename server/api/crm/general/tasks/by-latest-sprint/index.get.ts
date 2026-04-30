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

export default defineEventHandler(
  async (event): Promise<CrmTasksByLatestSprintResponse> => {
    const sprintsResponse = await cachedCrmGeneralGet<{
      items: Array<CrmSprintBucket['sprint']>
    }>(event, 'sprints', getQuery(event))

    const latestSprint = sprintsResponse.items?.[0] ?? null

    if (!latestSprint?.id) {
      return {
        items: [],
        meta: {
          sprint: null,
        },
      }
    }

    const tasksResponse = await cachedCrmGeneralGet<{ items: CrmTaskItem[] }>(
      event,
      `sprints/${encodeURIComponent(latestSprint.id)}/tasks`,
    )

    return {
      items: [
        {
          sprint: latestSprint,
          tasks: tasksResponse.items ?? [],
        },
      ],
      meta: {
        sprint: latestSprint,
      },
    }
  },
)
