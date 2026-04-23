const CRM_BASE_URL = 'https://bro-world.org/api/v1/crm'

type CrmGeneralMethod = 'GET' | 'POST' | 'PATCH' | 'DELETE'

interface CrmGeneralFetchOptions {
  method?: CrmGeneralMethod
  body?: Record<string, unknown>
  query?: Record<string, string | number | boolean | undefined>
}

export async function fetchCrmGeneral<T = unknown>(
  path: string,
  options: CrmGeneralFetchOptions = {},
): Promise<T> {
  const method = options.method ?? 'GET'

  return await $fetch<T>(`${CRM_BASE_URL}/${path}`, {
    method,
    body: options.body,
    query: options.query,
  })
}
