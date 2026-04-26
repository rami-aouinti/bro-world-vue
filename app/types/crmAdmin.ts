export interface EndpointAction {
  id: string
  title: string
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  path: string
  defaultBody?: Record<string, unknown>
}

export interface CrmAdminActionFormField {
  key: string
  label: string
  type: 'text' | 'number' | 'boolean'
}
