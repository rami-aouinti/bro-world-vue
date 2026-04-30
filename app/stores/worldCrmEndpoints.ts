import type {
  CrmEndpointCatalogResponse,
  CrmEndpointGroup,
} from '~/types/world/crmEndpoints'

const CRM_ENDPOINTS_TTL_MS = 2 * 60 * 1000

export const useWorldCrmEndpointsStore = defineStore(
  'world-crm-endpoints',
  () => {
    const pending = ref(false)
    const error = ref<string | null>(null)
    const groups = ref<CrmEndpointGroup[]>([])
    const lastFetchedAt = ref<number | null>(null)

    function isFresh() {
      return (
        !!lastFetchedAt.value &&
        Date.now() - lastFetchedAt.value < CRM_ENDPOINTS_TTL_MS
      )
    }

    async function fetchCatalog(options?: { force?: boolean }) {
      if (!options?.force && groups.value.length && isFresh()) {
        return groups.value
      }

      pending.value = true
      error.value = null

      try {
        const response = await $fetch<CrmEndpointCatalogResponse>(
          '/api/world/crm/endpoints',
        )
        groups.value = response.groups ?? []
        lastFetchedAt.value = Date.now()
        return groups.value
      } catch (err) {
        error.value =
          err instanceof Error
            ? err.message
            : 'Unable to load CRM endpoints catalog.'
        throw err
      } finally {
        pending.value = false
      }
    }

    return {
      pending,
      error,
      groups,
      lastFetchedAt,
      fetchCatalog,
    }
  },
)
