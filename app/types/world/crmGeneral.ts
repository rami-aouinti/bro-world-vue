export type CrmGeneralEntityKind =
  | 'companies'
  | 'projects'
  | 'tasks'
  | 'task-requests'
  | 'sprints'

export interface CrmGeneralCollectionResponse<T extends Record<string, unknown>> {
  items: T[]
  pagination?: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

export interface CrmGeneralMutationResponse<T extends Record<string, unknown>> {
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
