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
  const resource = getRouterParam(event, 'resource')

  if (!resource) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing sync resource path',
    })
  }

  const path = `gitlab/sync/${resource}`
  const method = getMethod(event)
  const query = normalizeQuery(getQuery(event) as Record<string, unknown>)

  if (method === 'GET') {
    return await cachedCrmGitlabGeneralGet(event, path, query)
  }

  if (method !== 'POST') {
    throw createError({
      statusCode: 405,
      statusMessage: `Method ${method} not allowed`,
    })
  }

  const body = await readBody<Record<string, unknown> | undefined>(event)

  return await mutateCrmGitlabGeneral(event, path, {
    method: 'POST',
    body,
    query,
  })
})
