import {
  cachedCrmGithubGeneralGet,
  mutateCrmGithubGeneral,
} from '~~/server/utils/crmGithubGeneralApi'

function normalizeQuery(query: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(query).filter(([, value]) => value !== null),
  ) as Record<string, unknown>
}

export default defineEventHandler(async (event): Promise<unknown> => {
  const taskRequestId = getRouterParam(event, 'taskRequest')
  const resource = getRouterParam(event, 'resource')

  if (!taskRequestId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing task request id',
    })
  }

  if (!resource) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing github resource path',
    })
  }

  const path = `task-requests/${taskRequestId}/github/${resource}`
  const method = getMethod(event)
  const query = normalizeQuery(getQuery(event) as Record<string, unknown>)

  if (method === 'GET') {
    return await cachedCrmGithubGeneralGet(event, path, query)
  }

  const body = ['POST', 'DELETE'].includes(method)
    ? await readBody<Record<string, unknown> | undefined>(event)
    : undefined

  if (!['POST', 'DELETE'].includes(method)) {
    throw createError({
      statusCode: 405,
      statusMessage: `Method ${method} not allowed`,
    })
  }

  return await mutateCrmGithubGeneral(event, path, {
    method: method as 'POST' | 'DELETE',
    body,
    query,
  })
})
