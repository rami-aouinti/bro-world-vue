import { listCandidatesByContext } from '~~/server/utils/jobsPipelineStore'
import type { JobCandidatesApiResponse } from '~~/server/types/api/jobs'

export default defineEventHandler((event): JobCandidatesApiResponse => {
  const query = getQuery(event)
  const context = typeof query.context === 'string' ? query.context : undefined

  return listCandidatesByContext(context)
})
