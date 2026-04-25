import type { H3Event } from 'h3'
import type { ApiObject, ApiQuery } from '../types/api/common'
import { invalidateByPrefix } from './apiCache'
import { callPrivateApi, cachedPrivateGet, getSessionAuth } from './privateApi'
import { invalidateMutationCaches } from './mutationInvalidation'

const CRM_APPLICATION_BASE_ENDPOINT = '/crm/applications'
const CRM_GITLAB_APPLICATION_MUTATION_KEY = 'crm:applications:gitlab:mutate'
const CRM_CACHE_PREFIX = 'crm'

function crmApplicationGitlabEndpoint(path: string) {
  const normalizedPath = path.replace(/^\/+/, '')
  return `${CRM_APPLICATION_BASE_ENDPOINT}/${normalizedPath}`
}

export function cachedCrmGitlabApplicationsGet<TResponse extends ApiObject | ApiObject[]>(
  event: H3Event,
  path: string,
  query?: ApiQuery,
) {
  return cachedPrivateGet<TResponse>(event, crmApplicationGitlabEndpoint(path), {
    query,
    cacheDomain: 'crm',
  })
}

export function mutateCrmGitlabApplications<TResponse extends ApiObject | ApiObject[]>(
  event: H3Event,
  path: string,
  options: {
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    body?: BodyInit | ApiObject | null
    query?: ApiQuery
  },
) {
  const endpoint = crmApplicationGitlabEndpoint(path)
  return callPrivateApi<TResponse>(event, endpoint, {
    method: options.method,
    body: options.body,
    query: options.query,
  }).then(async (response) => {
    await invalidateMutationCaches(event, CRM_GITLAB_APPLICATION_MUTATION_KEY)
    await invalidateCrmGitlabApplicationPrefixes(event, buildCrmGitlabApplicationMutationPrefixes(path))
    return response
  })
}

function buildCrmPrivateEndpointPrefix(username: string, endpoint: string) {
  const normalizedUsername = username.trim()
  const normalizedEndpoint = endpoint.trim().replace(/^\/+|\/+$/g, '')
  return `api:private:${normalizedUsername}:${CRM_CACHE_PREFIX}:${normalizedEndpoint}:`
}

function buildCrmPublicEndpointPrefix(endpoint: string) {
  const normalizedEndpoint = endpoint.trim().replace(/^\/+|\/+$/g, '')
  return `api:public:${CRM_CACHE_PREFIX}:${normalizedEndpoint}:`
}

function buildCrmGitlabApplicationMutationPrefixes(path: string) {
  const normalizedPath = path.replace(/^\/+/, '')
  const scopedMatch = normalizedPath.match(/^([^/]+)\/projects\/([^/]+)\/gitlab\/(.+)$/)

  if (!scopedMatch) {
    return []
  }

  const [, applicationSlug, projectId, resourcePath] = scopedMatch
  const firstSegment = resourcePath.split('/')[0]

  if (!firstSegment) {
    return []
  }

  const projectRoot = `crm/applications/${applicationSlug}/projects/${projectId}/gitlab`
  const prefixes = new Set<string>([
    `${projectRoot}/${firstSegment}`,
    `${projectRoot}/dashboard`,
  ])

  if (firstSegment === 'actions') {
    prefixes.add(`${projectRoot}/actions/workflows`)
    prefixes.add(`${projectRoot}/actions/runs`)
  }

  return Array.from(prefixes)
}

async function invalidateCrmGitlabApplicationPrefixes(
  event: H3Event,
  endpointPrefixes: string[],
) {
  if (!endpointPrefixes.length) {
    return
  }

  const session = await getSessionAuth(event).catch(() => null)

  await Promise.all(
    endpointPrefixes.flatMap((endpointPrefix) => {
      const prefixes = [buildCrmPublicEndpointPrefix(endpointPrefix)]

      if (session?.username) {
        prefixes.push(buildCrmPrivateEndpointPrefix(session.username, endpointPrefix))
      }

      return prefixes.map(prefix => invalidateByPrefix(prefix))
    }),
  )
}
