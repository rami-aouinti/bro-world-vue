import type { JobsDataRetentionPolicy } from '~~/server/types/api/jobs'
import { updateJobsPolicy } from '~~/server/utils/jobsAdminStore'
import type { SessionUser } from '~/types/session'

type PolicyBody = Partial<JobsDataRetentionPolicy>

export default defineEventHandler(
  async (event): Promise<{ policy: JobsDataRetentionPolicy }> => {
    await requireUserSession(event)

    const session = await getUserSession(event)
    const user = (session?.user as SessionUser | null) ?? null

    if (
      !(
        user?.roles?.includes('ROLE_ROOT') ||
        user?.roles?.includes('ROLE_ADMIN') ||
        user?.roles?.includes('ROLE_HR_ADMIN')
      )
    ) {
      throw createError({ statusCode: 403, statusMessage: 'Access denied' })
    }

    const body = await readBody<PolicyBody>(event)

    return {
      policy: updateJobsPolicy(body),
    }
  },
)
