import type {
  CrmAdminApiResponse,
  CrmCompaniesApiResponse,
  CrmCompaniesListQuery,
  CrmPipelineApiResponse,
  CrmProjectsApiResponse,
  CrmProjectsListQuery,
  PaginatedResponse,
} from '~~/server/types/api/crm'
import type { CrmTransitionApiPayload } from '~~/server/types/api/crm'

export interface WorldPaginationState {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface WorldCrmFilters {
  search?: string
  manager?: string
  phase?: CrmProjectsListQuery['phase']
  industry?: string
  health?: CrmCompaniesListQuery['health']
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface WorldCrmCacheEntry<T> {
  data: T
  fetchedAt: number
}

export type WorldCrmPaginatedList<T> = PaginatedResponse<T>

export type WorldCrmProjectsListResponse = CrmProjectsApiResponse
export type WorldCrmCompaniesListResponse = CrmCompaniesApiResponse
export type WorldCrmPipelineDetailResponse = CrmPipelineApiResponse
export type WorldCrmAdminDetailResponse = CrmAdminApiResponse
export type WorldCrmTransitionPayload = CrmTransitionApiPayload
