export interface ApiPagination {
  page: number
  limit: number
  totalItems: number
  totalPages: number
}

export interface ApiMeta {
  filters?: Record<string, unknown>
  module?: string
}

export interface ApiListResponse<TItem> {
  items: TItem[]
  pagination?: ApiPagination
  meta?: ApiMeta
}

export interface CrmCompanyItem {
  id: string
  name: string
  industry: string
  website: string
  contactEmail: string
  phone: string
}

export interface CrmCompanyCreatePayload {
  crmId: string
  name: string
  industry?: string
  website?: string
  contactEmail?: string
  phone?: string
}

export type CrmCompanyUpdatePayload = Partial<Omit<CrmCompanyCreatePayload, 'crmId'>>

export interface CrmContactItem {
  id: string
  companyId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  jobTitle: string
  city: string
  score: number
}

export interface CrmContactCreatePayload {
  companyId: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
  jobTitle?: string
  city?: string
}

export type CrmContactUpdatePayload = Partial<Omit<CrmContactCreatePayload, 'companyId'>>

export interface CrmProvisioningState {
  state: string
  error: string | null
}

export interface CrmProjectListItem {
  id: string
  name: string
  status: string
  githubRepositoriesCount: number
  provisioning: CrmProvisioningState
}

export interface CrmProjectItem extends CrmProjectListItem {
  companyId: string
  code: string
  description: string
  startedAt: string | null
  dueAt: string | null
  attachments: unknown[]
  wikiPages: unknown[]
  githubRepositories: unknown[]
  githubConfigured: boolean
  tasks: unknown[]
  assignees: unknown[]
}

export interface CrmProjectCreatePayload {
  companyId: string
  name: string
  code?: string
  description?: string
  status?: string
  startedAt?: string
  dueAt?: string
}

export type CrmProjectUpdatePayload = Partial<CrmProjectCreatePayload>

export interface CrmSprintItem {
  id: string
  name: string
  status: string
  startDate: string
  endDate: string
  projectId: string
  goal?: string
}

export interface CrmSprintCreatePayload {
  projectId: string
  name: string
  goal?: string
  status?: string
  startDate?: string
  endDate?: string
}

export type CrmSprintUpdatePayload = Partial<Omit<CrmSprintCreatePayload, 'projectId'>>

export interface CrmTaskItem {
  id: string
  title: string
  status: string
  priority: string
  projectId: string
  projectName?: string
  sprintId: string | null
  sprintName?: string
  parentTaskId: string | null
  dueAt: string | null
  estimatedHours: number | null
  updatedAt: string
  attachments: unknown[]
  assignees: unknown[]
  subTasks: CrmTaskItem[]
  children: CrmTaskItem[]
  blog: unknown | null
  description?: string
}

export interface CrmTaskCreatePayload {
  projectId: string
  title: string
  description?: string
  status?: string
  priority?: string
  dueAt?: string | null
  estimatedHours?: number | null
  sprintId?: string | null
  parentTaskId?: string | null
}

export type CrmTaskUpdatePayload = Partial<CrmTaskCreatePayload>

export type CrmSubtaskCreatePayload = Omit<CrmTaskCreatePayload, 'projectId' | 'parentTaskId'>
export type CrmSubtaskUpdatePayload = Partial<
  Omit<CrmTaskCreatePayload, 'projectId'> & { parentTaskId: string | null }
>

export interface CrmBillingItem {
  id: string
  companyId: string
  label: string
  amount: number
  currency: string
  status: string
  dueAt: string | null
  paidAt: string | null
}

export interface CrmBillingCreatePayload {
  companyId: string
  label: string
  amount: number
  currency: string
  status?: string
  dueAt?: string | null
  paidAt?: string | null
}

export type CrmBillingUpdatePayload = Partial<Omit<CrmBillingCreatePayload, 'companyId'>>

export interface CrmTaskRequestItem {
  id: string
  taskId: string
  repositoryId: string
  title: string
  description: string
  status: string
  requestedAt: string
  resolvedAt: string | null
  attachments?: Array<{
    id?: string
    originalName?: string
    name?: string
    url?: string
    mimeType?: string
  }>
  assignees?: Array<{
    id: string
    username?: string
    email?: string
    firstName?: string
    lastName?: string
  }>
  githubIssue?: unknown | null
  githubBranches?: Array<Record<string, unknown>>
  blogId?: string | null
  blog?: {
    id: string
    title: string
    slug?: string
    posts?: Array<{
      id: string
      title: string
      slug?: string
      comments?: Array<{
        id: string
        content: string
        filePath?: string | null
        children?: Array<{
          id: string
          content: string
          filePath?: string | null
        }>
      }>
    }>
  } | null
}

export interface CrmTaskRequestCreatePayload {
  taskId: string
  repositoryId: string
  title: string
  description?: string
  status?: string
  requestedAt?: string
  resolvedAt?: string | null
}

export type CrmTaskRequestUpdatePayload = Partial<
  Omit<CrmTaskRequestCreatePayload, 'taskId' | 'repositoryId' | 'requestedAt'>
>

export interface CrmIdResponse {
  id: string
}

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

export interface CrmDashboardExecutiveResponse {
  kpiTiles: Array<{
    title: string
    value: string
    trend: string
    tone: string
    icon: string
    caption: string
  }>
  funnelStages: Array<{
    label: string
    deals: number
    amount: string
  }>
  teams: Array<{
    name: string
    owner: string
    velocity: string
    status: string
  }>
  todayAgenda: Array<{
    time: string
    event: string
    owner: string
  }>
}

export interface CrmEmployeeItem {
  id: string
  firstName: string
  lastName: string
  email: string
  userId: string
  positionName: string
  roleName: string
  photo?: string
}

export interface CrmEmployeeCreatePayload {
  firstName: string
  lastName: string
  email: string
  userId: string
  positionName?: string
  roleName?: string
  photo?: string
}

export type CrmEmployeeUpdatePayload = Partial<CrmEmployeeCreatePayload>

export type CrmReportFormat = 'json' | 'csv' | 'pdf'

export type CrmJsonReportResponse = Record<string, unknown>
