import type {
  CrmAccount as CrmCoreAccount,
  CrmActivity as CrmCoreActivity,
  CrmAnalytics,
  CrmContact as CrmCoreContact,
  CrmLead as CrmCoreLead,
  CrmNote as CrmCoreNote,
  CrmOpportunity as CrmCoreOpportunity,
  CrmOpportunityDetail,
  CrmPipelineColumn,
  CrmPipelineKpis,
  CrmPipelineStage,
  CrmTransitionPayload,
} from '../../../app/types/crm'
import type { CrmPermission } from '~~/shared/crmAccess'

export type SortOrder = 'asc' | 'desc'

export interface PaginatedResponse<T> {
  items: T[]
  page: number
  limit: number
  total: number
  totalPages: number
  sortBy: string
  sortOrder: SortOrder
  filters: Record<string, string>
}

export type CrmLeadStatus = 'In progress' | 'Blocked' | 'Review'

export interface CrmLead {
  id: string
  project: string
  owner: string
  status: CrmLeadStatus
  budget: string
}

export interface CrmLeadsListQuery {
  page?: string | number
  limit?: string | number
  sortBy?: string
  sortOrder?: SortOrder
  search?: string
  owner?: string
  status?: CrmLeadStatus
}

export type CrmProjectPhase = 'Build' | 'QA' | 'Design'

export interface CrmProject {
  id: string
  project: string
  manager: string
  phase: CrmProjectPhase
  progress: string
}

export interface CrmProjectsListQuery {
  page?: string | number
  limit?: string | number
  sortBy?: string
  sortOrder?: SortOrder
  search?: string
  manager?: string
  phase?: CrmProjectPhase
}

export type CrmCompanyHealth = 'Great' | 'At risk' | 'Stable'

export interface CrmCompany {
  id: string
  company: string
  industry: string
  owner: string
  health: CrmCompanyHealth
}

export interface CrmCompaniesListQuery {
  page?: string | number
  limit?: string | number
  sortBy?: string
  sortOrder?: SortOrder
  search?: string
  industry?: string
  health?: CrmCompanyHealth
}

export type CrmProjectsApiResponse = PaginatedResponse<CrmProject>
export type CrmCompaniesApiResponse = PaginatedResponse<CrmCompany>
export type CrmLeadsApiResponse = PaginatedResponse<CrmLead>

export interface CrmRolePermissionMapping {
  role: string
  permissions: CrmPermission[]
}

export interface CrmAuditLogEntry {
  id: string
  actor: string
  action: string
  targetType: 'project' | 'account' | 'policy' | 'role_mapping'
  targetId: string
  changedAt: string
  details: string
}

export interface CrmAdminPolicy {
  enforceLeadAssignmentRules: boolean
  enableAuditLogs: boolean
  requireContractTemplate: boolean
  defaultSlaHours: number
  regionPolicy: 'global' | 'eu' | 'us'
}

export interface CrmAdminApiResponse {
  policy: CrmAdminPolicy
  roleMappings: CrmRolePermissionMapping[]
  auditLogs: CrmAuditLogEntry[]
  currentUserPermissions: CrmPermission[]
}

export interface CrmPipelineApiResponse {
  columns: CrmPipelineColumn[]
  opportunities: CrmCoreOpportunity[]
  deals: CrmCoreOpportunity[]
  kpis: CrmPipelineKpis
  analytics: CrmAnalytics
  updatedAt: string
}

export type CrmTransitionApiPayload = CrmTransitionPayload

export interface CrmOverviewQuery {
  search?: string
  owner?: string
  stage?: CrmPipelineStage | 'all'
  industry?: string
  minAmount?: string | number
  maxAmount?: string | number
  fromExpectedCloseDate?: string
  toExpectedCloseDate?: string
}

export interface CrmOverviewApiResponse {
  leads: CrmCoreLead[]
  accounts: CrmCoreAccount[]
  contacts: CrmCoreContact[]
  opportunities: CrmCoreOpportunity[]
  activities: CrmCoreActivity[]
  notes: CrmCoreNote[]
  pipeline: {
    columns: CrmPipelineColumn[]
    opportunities: CrmCoreOpportunity[]
  }
  analytics: CrmAnalytics
  filtersApplied: Record<string, string>
  updatedAt: string
}

export type CrmOpportunityDetailApiResponse = CrmOpportunityDetail
