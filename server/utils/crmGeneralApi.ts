const CRM_GENERAL_BASE_URL = 'https://bro-world.org/api/v1/crm/general'

export async function fetchCrmGeneral<T = unknown>(path: string): Promise<T> {
  return await $fetch<T>(`${CRM_GENERAL_BASE_URL}/${path}`)
}
