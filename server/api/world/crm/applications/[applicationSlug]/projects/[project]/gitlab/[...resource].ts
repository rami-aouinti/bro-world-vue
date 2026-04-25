import type { ApiObject, ApiQuery } from '~~/server/types/api/common'
import {
  cachedCrmGitlabApplicationsGet,
  mutateCrmGitlabApplications,
} from '~~/server/utils/crmGitlabApplicationsApi'

function normalizeQuery(query: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== null),
  ) as ApiQuery
}

export default defineEventHandler(async (event): Promise<unknown> => {
  const applicationSlug = getRouterParam(event, 'applicationSlug')
  const projectId = getRouterParam(event, 'project')
  const resource = getRouterParam(event, 'resource')

  if (!applicationSlug) {
    throw createError({ statusCode: 400, statusMessage: 'Missing application slug' })
  }

  if (!projectId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing project id' })
  }

  if (!resource) {
    throw createError({ statusCode: 400, statusMessage: 'Missing gitlab resource path' })
  }

  const path = `${encodeURIComponent(applicationSlug)}/projects/${encodeURIComponent(projectId)}/gitlab/${resource}`
  const method = getMethod(event)
  const query = normalizeQuery(getQuery(event) as Record<string, unknown>)

  if (method === 'GET') {
    return await cachedCrmGitlabApplicationsGet<ApiObject | ApiObject[]>(event, path, query)
  }

  const body = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
    ? await readBody<BodyInit | ApiObject | null>(event)
    : undefined

  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    throw createError({ statusCode: 405, statusMessage: `Method ${method} not allowed` })
  }

  return await mutateCrmGitlabApplications<ApiObject | ApiObject[]>(event, path, {
    method: method as 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    body,
    query,
  })
})
