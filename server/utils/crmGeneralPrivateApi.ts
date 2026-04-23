import type { H3Event } from 'h3'
import type { ApiObject, ApiQuery } from '../types/api/common'
import { cachedPrivateGet, mutatingPrivateApiCall } from './privateApi'

const CRM_BASE_ENDPOINT = 'https://bro-world.org/api/v1/crm'
const CRM_MUTATION_KEY = 'crm:general:mutate'

function crmEndpoint(path: string) {
  const normalizedPath = path.replace(/^\/+/, '')
  return `${CRM_BASE_ENDPOINT}/${normalizedPath}`
}

export function cachedCrmGeneralGet<TResponse extends ApiObject | ApiObject[]>(
  event: H3Event,
  path: string,
  query?: ApiQuery,
) {
  return cachedPrivateGet<TResponse>(event, crmEndpoint(path), {
    query,
    cacheDomain: 'crm',
  })
}

export function mutateCrmGeneral<TResponse extends ApiObject | ApiObject[]>(
  event: H3Event,
  path: string,
  options: {
    method: 'POST' | 'PUT' | 'PATCH' | 'DELETE'
    body?: BodyInit | ApiObject | null
    query?: ApiQuery
  },
) {
  return mutatingPrivateApiCall<TResponse>(event, crmEndpoint(path), {
    method: options.method,
    body: options.body,
    query: options.query,
    mutationKey: CRM_MUTATION_KEY,
  })
}
