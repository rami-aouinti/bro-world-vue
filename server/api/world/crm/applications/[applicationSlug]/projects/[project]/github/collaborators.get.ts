import { cachedPrivateGet } from '~~/server/utils/privateApi'
import type { ApiQuery } from '~~/server/types/api/common'

function normalizeQuery(query: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== null),
  ) as Record<string, unknown>
}

export default defineEventHandler(async (event): Promise<unknown> => {
  const applicationSlug = getRouterParam(event, 'applicationSlug')
  const projectId = getRouterParam(event, 'project')

  if (!applicationSlug) {
    throw createError({ statusCode: 400, statusMessage: 'Missing application slug' })
  }

  if (!projectId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing project id' })
  }

  const query = normalizeQuery(getQuery(event) as Record<string, unknown>) as ApiQuery
  const endpoint = `/crm/applications/${encodeURIComponent(applicationSlug)}/projects/${encodeURIComponent(projectId)}/github/collaborators`

  return await cachedPrivateGet(event, endpoint, {
    query,
    cacheDomain: 'crm',
  })
})
