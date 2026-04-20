export type CrmEndpointMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

export interface CrmEndpointDefinition {
  id: string
  title: string
  method: CrmEndpointMethod
  path: string
  description?: string
  defaultQuery?: Record<string, unknown>
  defaultBody?: Record<string, unknown>
}

export interface CrmEndpointGroup {
  key: string
  title: string
  endpoints: CrmEndpointDefinition[]
}

export interface CrmEndpointCatalogResponse {
  groups: CrmEndpointGroup[]
}
