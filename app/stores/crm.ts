import type {
  CrmOpportunity,
  CrmOpportunityDetail,
  CrmOverviewFilters,
  CrmOverviewResponse,
  CrmTransitionPayload,
} from '~/types/crm'
import type {
  CrmOpportunityDetailApiResponse,
  CrmOverviewApiResponse,
  CrmPipelineApiResponse,
} from '~~/server/types/api/crm'

export const useCrmStore = defineStore('crm', () => {
  const overview = ref<CrmOverviewResponse | null>(null)
  const selectedOpportunityDetail = ref<CrmOpportunityDetail | null>(null)
  const selectedOpportunityId = ref<string | null>(null)
  const filters = ref<CrmOverviewFilters>({ stage: 'all' })
  const pending = ref(false)
  const error = ref<string | null>(null)

  const opportunities = computed(() => overview.value?.opportunities ?? [])
  const columns = computed(() => overview.value?.pipeline.columns ?? [])
  const analytics = computed(() => overview.value?.analytics)

  const opportunitiesByStage = computed(() => {
    const grouped = new Map<string, CrmOpportunity[]>()

    for (const column of columns.value) {
      grouped.set(
        column.stage,
        opportunities.value.filter(
          (opportunity) => opportunity.stage === column.stage,
        ),
      )
    }

    return grouped
  })

  async function fetchOverview(forceFilters?: Partial<CrmOverviewFilters>) {
    pending.value = true
    error.value = null

    filters.value = { ...filters.value, ...(forceFilters ?? {}) }

    try {
      const response = await $fetch<CrmOverviewApiResponse>(
        '/api/crm/overview',
        {
          query: {
            search: filters.value.search,
            owner: filters.value.owner,
            stage: filters.value.stage,
            industry: filters.value.industry,
            minAmount: filters.value.minAmount,
            maxAmount: filters.value.maxAmount,
            fromExpectedCloseDate: filters.value.fromExpectedCloseDate,
            toExpectedCloseDate: filters.value.toExpectedCloseDate,
          },
        },
      )

      overview.value = response

      if (selectedOpportunityId.value) {
        const stillVisible = response.opportunities.some(
          (item) => item.id === selectedOpportunityId.value,
        )

        if (!stillVisible) {
          selectedOpportunityId.value = response.opportunities[0]?.id ?? null
        }
      } else {
        selectedOpportunityId.value = response.opportunities[0]?.id ?? null
      }

      if (selectedOpportunityId.value) {
        await fetchOpportunityDetail(selectedOpportunityId.value)
      }
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Unable to fetch CRM overview'
      throw err
    } finally {
      pending.value = false
    }
  }

  async function fetchOpportunityDetail(opportunityId: string) {
    selectedOpportunityId.value = opportunityId

    try {
      selectedOpportunityDetail.value =
        await $fetch<CrmOpportunityDetailApiResponse>(
          `/api/crm/opportunities/${opportunityId}`,
        )
    } catch (err) {
      error.value =
        err instanceof Error
          ? err.message
          : 'Unable to fetch opportunity detail'
      throw err
    }
  }

  async function transitionOpportunity(
    opportunityId: string,
    payload: CrmTransitionPayload,
  ) {
    pending.value = true
    error.value = null

    try {
      const response = await $fetch<CrmPipelineApiResponse>(
        `/api/crm/opportunities/${opportunityId}/transition`,
        {
          method: 'PATCH',
          body: payload,
        },
      )

      if (overview.value) {
        overview.value.pipeline.columns = response.columns
        overview.value.opportunities = response.opportunities
        overview.value.pipeline.opportunities = response.opportunities
        overview.value.analytics = response.analytics
        overview.value.updatedAt = response.updatedAt
      }

      await fetchOverview()
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : 'Unable to transition opportunity'
      throw err
    } finally {
      pending.value = false
    }
  }

  return {
    overview,
    selectedOpportunityId,
    selectedOpportunityDetail,
    filters,
    pending,
    error,
    opportunities,
    columns,
    opportunitiesByStage,
    analytics,
    fetchOverview,
    fetchOpportunityDetail,
    transitionOpportunity,
  }
})
