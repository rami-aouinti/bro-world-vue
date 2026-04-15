<script setup lang="ts">
import type {
  CrmDeal,
  CrmPipelineColumn,
  CrmPipelineKpis,
  CrmPipelineResponse,
  CrmPipelineStage,
} from '~/types/crm'
import type { SessionUser } from '~/types/session'
import type { CrmLead, CrmLeadsApiResponse } from '~~/server/types/api/crm'

definePageMeta({ title: 'CRM' })

const { user } = useUserSession()
const sessionUser = computed(() => user.value as SessionUser | null)
const isRoot = computed(() => sessionUser.value?.roles?.includes('ROLE_ROOT') ?? false)

const crmNavItems = computed(() => [
  { title: 'Overview CRM', to: '/world/crm', icon: 'mdi-view-dashboard-outline' },
  { title: 'Projects', to: '/world/crm/projects', icon: 'mdi-folder-outline' },
  { title: 'Company', to: '/world/crm/company', icon: 'mdi-domain' },
  ...(isRoot.value
    ? [{ title: 'Admin', to: '/world/crm/admin', icon: 'mdi-shield-crown-outline', rootOnly: true }]
    : []),
])

const { data: pipelineData, pending, refresh } = await useAsyncData<CrmPipelineResponse>('crm-pipeline', () =>
  $fetch('/api/crm/pipeline'),
)

const isTransitioning = ref(false)
const draggedDealId = ref<string | null>(null)
const dealDrafts = ref<Record<string, { probability: number; expectedCloseDate: string }>>({})

const columns = computed<CrmPipelineColumn[]>(() => pipelineData.value?.columns ?? [])
const deals = computed<CrmDeal[]>(() => pipelineData.value?.deals ?? [])

const emptyKpi: CrmPipelineKpis = {
  activeDeals: 0,
  weightedForecast: 0,
  winRate: 0,
  averageCycleDays: 0,
}

const kpis = computed<CrmPipelineKpis>(() => pipelineData.value?.kpis ?? emptyKpi)

watch(
  deals,
  (nextDeals) => {
    dealDrafts.value = nextDeals.reduce<Record<string, { probability: number; expectedCloseDate: string }>>((acc, deal) => {
      acc[deal.id] = {
        probability: deal.probability,
        expectedCloseDate: deal.expectedCloseDate,
      }
      return acc
    }, {})
  },
  { immediate: true },
)

const dealsByStage = computed(() => {
  return columns.value.reduce<Record<CrmPipelineStage, CrmDeal[]>>(
    (acc, column) => {
      acc[column.stage] = deals.value.filter((deal) => deal.stage === column.stage)
      return acc
    },
    {
      lead: [],
      qualified: [],
      proposal: [],
      negotiation: [],
      won_lost: [],
    },
  )
})

const stageOrder: CrmPipelineStage[] = ['lead', 'qualified', 'proposal', 'negotiation', 'won_lost']

function getDraft(deal: CrmDeal) {
  return dealDrafts.value[deal.id] ?? {
    probability: deal.probability,
    expectedCloseDate: deal.expectedCloseDate,
  }
}

async function moveDeal(
  deal: CrmDeal,
  toStage: CrmPipelineStage,
  overrides: Partial<Pick<CrmDeal, 'probability' | 'expectedCloseDate' | 'outcome'>> = {},
) {
  if (isTransitioning.value) {
    return
  }

  const draft = getDraft(deal)
  const probability = Math.min(100, Math.max(0, Number(overrides.probability ?? draft.probability ?? deal.probability)))
  const expectedCloseDate = String(overrides.expectedCloseDate ?? draft.expectedCloseDate ?? deal.expectedCloseDate)

  isTransitioning.value = true

  try {
    const payload = {
      toStage,
      probability,
      expectedCloseDate,
      outcome: overrides.outcome ?? deal.outcome,
    }

    const response = await $fetch<CrmPipelineResponse>(`/api/crm/deals/${deal.id}/transition`, {
      method: 'PATCH',
      body: payload,
    })

    pipelineData.value = response
  }
  finally {
    isTransitioning.value = false
  }
}

function onDragStart(event: DragEvent, dealId: string) {
  draggedDealId.value = dealId
  event.dataTransfer?.setData('text/plain', dealId)
}

async function onDrop(stage: CrmPipelineStage, event: DragEvent) {
  event.preventDefault()

  const dealId = event.dataTransfer?.getData('text/plain') || draggedDealId.value
  const deal = deals.value.find((entry) => entry.id === dealId)

  if (!deal) {
    return
  }

  await moveDeal(deal, stage)
  draggedDealId.value = null
}

function onDragEnd() {
  draggedDealId.value = null
}

function goToPreviousStage(deal: CrmDeal) {
  const currentIndex = stageOrder.indexOf(deal.stage)

  if (currentIndex <= 0) {
    return
  }

  const previousStage = stageOrder[currentIndex - 1]

  if (!previousStage) {
    return
  }

  return moveDeal(deal, previousStage, { outcome: null })
}

function goToNextStage(deal: CrmDeal) {
  const currentIndex = stageOrder.indexOf(deal.stage)

  if (currentIndex === -1 || currentIndex >= stageOrder.length - 1) {
    return
  }

  const nextStage = stageOrder[currentIndex + 1]

  if (!nextStage) {
    return
  }

  return moveDeal(deal, nextStage)
}


function setDraftProbability(dealId: string, value: number | string) {
  const normalizedValue = Math.min(100, Math.max(0, Number(value) || 0))

  if (!dealDrafts.value[dealId]) {
    dealDrafts.value[dealId] = { probability: normalizedValue, expectedCloseDate: new Date().toISOString().slice(0, 10) }
    return
  }

  dealDrafts.value[dealId].probability = normalizedValue
}

function setDraftCloseDate(dealId: string, value: string) {
  if (!dealDrafts.value[dealId]) {
    dealDrafts.value[dealId] = { probability: 0, expectedCloseDate: value }
    return
  }

  dealDrafts.value[dealId].expectedCloseDate = value
}

function persistDealMeta(deal: CrmDeal) {
  const draft = getDraft(deal)

  return moveDeal(deal, deal.stage, {
    probability: draft.probability,
    expectedCloseDate: draft.expectedCloseDate,
  })
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('fr-FR', { month: 'short', day: '2-digit', year: 'numeric' }).format(new Date(date))
}
</script>

<template>
  <div>
    <WorldModuleDrawers
      module-title="CRM"
      module-icon="mdi-account-group-outline"
      module-description="Pipeline client, gouvernance des comptes, tâches équipe et reporting."
      :nav-items="crmNavItems"
      action-label="Create CRM lead"
      action-icon="mdi-account-plus-outline"
    />

    <v-container fluid class="pt-0">
      <v-row class="mb-4">
        <v-col cols="12" md="4">
          <v-card rounded="xl" class="pa-3 postcard-gradient-card">
            <p class="text-caption text-medium-emphasis mb-1">Active deals</p>
            <h3 class="text-h5">{{ kpis.activeDeals }}</h3>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card rounded="xl" class="pa-3 postcard-gradient-card">
            <p class="text-caption text-medium-emphasis mb-1">Weighted forecast</p>
            <h3 class="text-h5">{{ formatCurrency(kpis.weightedForecast) }}</h3>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card rounded="xl" class="pa-3 postcard-gradient-card">
            <p class="text-caption text-medium-emphasis mb-1">Win rate / Cycle moyen</p>
            <h3 class="text-h6">{{ kpis.winRate.toFixed(1) }}% · {{ kpis.averageCycleDays.toFixed(1) }} jours</h3>
          </v-card>
        </v-col>
      </v-row>

      <v-row>
        <v-col v-for="column in columns" :key="column.stage" cols="12" md="6" lg="4" xl="2">
          <v-card
            rounded="xl"
            class="pa-3 h-100"
            :loading="pending || isTransitioning"
            @dragover.prevent
            @drop="onDrop(column.stage, $event)"
          >
            <div class="d-flex align-center justify-space-between mb-3">
              <h3 class="text-subtitle-1">{{ column.title }}</h3>
              <v-chip size="small" color="primary" variant="tonal">{{ dealsByStage[column.stage]?.length ?? 0 }}</v-chip>
            </div>

            <div class="d-flex flex-column ga-3">
              <v-card
                v-for="deal in dealsByStage[column.stage]"
                :key="deal.id"
                rounded="lg"
                class="pa-3"
                variant="tonal"
                draggable="true"
                @dragstart="onDragStart($event, deal.id)"
                @dragend="onDragEnd"
              >
                <div class="d-flex justify-space-between align-start ga-2 mb-1">
                  <div>
                    <p class="text-caption text-medium-emphasis mb-1">{{ deal.id }} · {{ deal.owner }}</p>
                    <p class="font-weight-medium mb-1">{{ deal.account }}</p>
                  </div>
                  <v-chip v-if="deal.outcome" :color="deal.outcome === 'won' ? 'success' : 'error'" size="x-small">
                    {{ deal.outcome.toUpperCase() }}
                  </v-chip>
                </div>

                <p class="text-body-2 mb-2">{{ formatCurrency(deal.amount) }}</p>

                <div class="d-flex ga-2 mb-2">
                  <v-text-field
                    :model-value="getDraft(deal).probability"
                    label="Probabilité"
                    type="number"
                    min="0"
                    max="100"
                    density="compact"
                    hide-details
                    class="flex-grow-1"
                    @update:model-value="setDraftProbability(deal.id, $event)"
                  />
                  <v-text-field
                    :model-value="getDraft(deal).expectedCloseDate"
                    label="Closing estimé"
                    type="date"
                    density="compact"
                    hide-details
                    class="flex-grow-1"
                    @update:model-value="setDraftCloseDate(deal.id, String($event ?? ''))"
                  />
                </div>
                <p class="text-caption text-medium-emphasis mb-3">Actuel: {{ formatDate(deal.expectedCloseDate) }}</p>

                <div class="d-flex flex-wrap ga-2">
                  <v-btn size="x-small" variant="outlined" :disabled="isTransitioning" @click="goToPreviousStage(deal)">
                    Prev
                  </v-btn>
                  <v-btn size="x-small" color="primary" variant="outlined" :disabled="isTransitioning" @click="goToNextStage(deal)">
                    Next
                  </v-btn>
                  <v-btn size="x-small" variant="text" :disabled="isTransitioning" @click="persistDealMeta(deal)">
                    Save meta
                  </v-btn>
                  <v-btn
                    size="x-small"
                    color="success"
                    variant="text"
                    :disabled="isTransitioning"
                    @click="moveDeal(deal, 'won_lost', { outcome: 'won' })"
                  >
                    Won
                  </v-btn>
                  <v-btn
                    size="x-small"
                    color="error"
                    variant="text"
                    :disabled="isTransitioning"
                    @click="moveDeal(deal, 'won_lost', { outcome: 'lost' })"
                  >
                    Lost
                  </v-btn>
                </div>
              </v-card>

              <v-alert v-if="!dealsByStage[column.stage]?.length" density="comfortable" variant="tonal" type="info">
                Aucun deal dans cette étape.
              </v-alert>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <div class="d-flex mt-4">
        <v-btn variant="text" prepend-icon="mdi-refresh" :loading="pending" @click="refresh">Rafraîchir pipeline</v-btn>
      </div>
    </v-container>
  </div>
</template>
