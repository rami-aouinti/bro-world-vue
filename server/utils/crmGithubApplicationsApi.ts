import type { H3Event } from 'h3'
import type { ApiObject, ApiQuery } from '../types/api/common'
import { cachedPrivateGet, mutatingPrivateApiCall } from './privateApi'

const CRM_APPLICATION_BASE_ENDPOINT = '/crm/applications'
const CRM_GITHUB_APPLICATION_MUTATION_KEY = 'crm:applications:github:mutate'

function crmApplicationGithubEndpoint(path: string) {
  const normalizedPath = path.replace(/^\/+/, '')
  return `${CRM_APPLICATION_BASE_ENDPOINT}/${normalizedPath}`
}

export function cachedCrmGithubApplicationsGet<TResponse extends ApiObject | ApiObject[]>(
  event: H3Event,
  path: string,
  query?: ApiQuery,
) {
  return cachedPrivateGet<TResponse>(event, crmApplicationGithubEndpoint(path), {
    query,
    cacheDomain: 'crm',
  })
}

export function mutateCrmGithubApplications<TResponse extends ApiObject | ApiObject[]>(
  event: H3Event,
  path: string,
  options: {
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    body?: BodyInit | ApiObject | null
    query?: ApiQuery
  },
) {
  return mutatingPrivateApiCall<TResponse>(event, crmApplicationGithubEndpoint(path), {
    method: options.method,
    body: options.body,
    query: options.query,
    mutationKey: CRM_GITHUB_APPLICATION_MUTATION_KEY,
  })
}
