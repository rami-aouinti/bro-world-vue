import {
  cachedCrmGitlabGeneralGet,
  mutateCrmGitlabGeneral,
} from '~~/server/utils/crmGitlabGeneralApi'

function normalizeQuery(query: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== null),
  ) as Record<string, unknown>
}

export default defineEventHandler(async (event): Promise<unknown> => {
  const projectId = getRouterParam(event, 'project')
  const resource = getRouterParam(event, 'resource')

  if (!projectId) {
    throw createError({ statusCode: 400, statusMessage: 'Missing project id' })
  }

  if (!resource) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing gitlab resource path',
    })
  }

  const path = `projects/${projectId}/gitlab/${resource}`
  const method = getMethod(event)
  const query = normalizeQuery(getQuery(event) as Record<string, unknown>)

  if (method === 'GET') {
    return await cachedCrmGitlabGeneralGet(event, path, query)
  }

  const body = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)
    ? await readBody<Record<string, unknown> | undefined>(event)
    : undefined

  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    throw createError({
      statusCode: 405,
      statusMessage: `Method ${method} not allowed`,
    })
  }

  return await mutateCrmGitlabGeneral(event, path, {
    method: method as 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    body,
    query,
  })
})
