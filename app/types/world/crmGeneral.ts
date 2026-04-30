export type CrmGeneralEntityKind =
  | 'companies'
  | 'projects'
  | 'tasks'
  | 'task-requests'
  | 'sprints'
  | 'employees'

export interface CrmDashboardResponse {
  companies: number
  projects: number
  tasks: number
  taskRequests: {
    pending: number
    approved: number
    rejected: number
  }
}

export interface CrmDashboardExecutiveKpiTile {
  title: string
  value: string
  trend: string
  tone: string
  icon: string
  caption: string
}

export interface CrmDashboardExecutiveFunnelStage {
  label: string
  deals: number
  amount: string
}

export interface CrmDashboardExecutiveTeam {
  name: string
  owner: string
  velocity: string
  status: string
}

export interface CrmDashboardExecutiveAgendaItem {
  time: string
  event: string
  owner: string
}

export interface CrmDashboardExecutiveResponse {
  kpiTiles: CrmDashboardExecutiveKpiTile[]
  funnelStages: CrmDashboardExecutiveFunnelStage[]
  teams: CrmDashboardExecutiveTeam[]
  todayAgenda: CrmDashboardExecutiveAgendaItem[]
}

export interface CrmGeneralCollectionResponse<
  T extends Record<string, unknown>,
> {
  items: T[]
  pagination?: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

export interface CrmGeneralMutationResponse<T extends Record<string, unknown>> {
  id?: string
  item?: T
  message?: string
  status?: string
  [key: string]: unknown
}

export interface CrmAdminFormField {
  key: string
  label: string
  type: 'text' | 'email' | 'number' | 'url' | 'textarea'
  required?: boolean
  placeholder?: string
}

export interface CrmAdminEntityConfig {
  key: CrmGeneralEntityKind
  label: string
  icon: string
  idKey: string
  titleKey: string
  subtitleKeys: string[]
  fields: CrmAdminFormField[]
}
