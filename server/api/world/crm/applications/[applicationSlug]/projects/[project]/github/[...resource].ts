import type { ApiObject, ApiQuery } from '~~/server/types/api/common'
import {
  cachedCrmGithubApplicationsGet,
  mutateCrmGithubApplications,
} from '~~/server/utils/crmGithubApplicationsApi'

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
    throw createError({ statusCode: 400, statusMessage: 'Missing github resource path' })
  }

  const path = `${encodeURIComponent(applicationSlug)}/projects/${encodeURIComponent(projectId)}/github/${resource}`
  const method = getMethod(event)
  const query = normalizeQuery(getQuery(event) as Record<string, unknown>)

  if (method === 'GET') {
    return await cachedCrmGithubApplicationsGet<ApiObject | ApiObject[]>(event, path, query)
  }

  const body = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
    ? await readBody<BodyInit | ApiObject | null>(event)
    : undefined

  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    throw createError({ statusCode: 405, statusMessage: `Method ${method} not allowed` })
  }

  return await mutateCrmGithubApplications<ApiObject | ApiObject[]>(event, path, {
    method: method as 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    body,
    query,
  })
})
