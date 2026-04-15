export type SortOrder = 'asc' | 'desc'

export type CrmLeadStatus = 'In progress' | 'Blocked' | 'Review'
export type CrmProjectPhase = 'Build' | 'QA' | 'Design'
export type CrmCompanyHealth = 'Great' | 'At risk' | 'Stable'

export interface CrmLead {
  [key: string]: string
  id: string
  project: string
  owner: string
  status: CrmLeadStatus
  budget: string
}

export interface CrmProject {
  [key: string]: string
  id: string
  project: string
  manager: string
  phase: CrmProjectPhase
  progress: string
}

export interface CrmCompany {
  [key: string]: string
  id: string
  company: string
  industry: string
  owner: string
  health: CrmCompanyHealth
}

export interface CrmAdminPolicy {
  enforceLeadAssignmentRules: boolean
  enableAuditLogs: boolean
  requireContractTemplate: boolean
  defaultSlaHours: number
  regionPolicy: 'global' | 'eu' | 'us'
}

export interface CrmListQueryBase {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: SortOrder
  search?: string
}

export interface CrmLeadsListQuery extends CrmListQueryBase {
  status?: CrmLeadStatus
  owner?: string
}

export interface CrmProjectsListQuery extends CrmListQueryBase {
  phase?: CrmProjectPhase
  manager?: string
}

export interface CrmCompaniesListQuery extends CrmListQueryBase {
  industry?: string
  health?: CrmCompanyHealth
}

export interface PaginatedApiResponse<TItem, TFilters extends object> {
  items: TItem[]
  page: number
  limit: number
  total: number
  totalPages: number
  sortBy: string
  sortOrder: SortOrder
  filters: TFilters
}

export type CrmLeadsApiResponse = PaginatedApiResponse<CrmLead, {
  search?: string
  status?: CrmLeadStatus
  owner?: string
}>

export type CrmProjectsApiResponse = PaginatedApiResponse<CrmProject, {
  search?: string
  phase?: CrmProjectPhase
  manager?: string
}>

export type CrmCompaniesApiResponse = PaginatedApiResponse<CrmCompany, {
  search?: string
  industry?: string
  health?: CrmCompanyHealth
}>

export interface CrmAdminApiResponse {
  policy: CrmAdminPolicy
}
