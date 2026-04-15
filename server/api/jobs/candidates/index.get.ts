import { listCandidatesByContext } from '~~/server/utils/jobsPipelineStore'
import type { JobCandidatesApiResponse } from '~~/server/types/api/jobs'
import { resolveJobAccessRole } from '~~/server/utils/jobsAdminStore'
import type { SessionUser } from '~/types/session'

export default defineEventHandler(async (event): Promise<JobCandidatesApiResponse> => {
  await requireUserSession(event)

  const query = getQuery(event)
  const context = typeof query.context === 'string' ? query.context : undefined
  const session = await getUserSession(event)
  const user = (session?.user as SessionUser | null) ?? null
  const role = resolveJobAccessRole(user)

  return listCandidatesByContext(context, { role })
})
