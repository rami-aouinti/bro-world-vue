<script setup lang="ts">
import type { CrmOpportunity, CrmPipelineStage } from '~/types/crm'
import { useCrmPermissions } from '~/composables/useCrmPermissions'
import { useCrmStore } from '~/stores/crm'

definePageMeta({ title: 'CRM' })

const { can } = useCrmPermissions()
const crmStore = useCrmStore()
const activeView = ref<'pipeline' | 'list' | 'detail' | 'dashboard'>('pipeline')

const crmNavItems = computed(() => [
  { title: 'Overview CRM', to: '/world/crm', icon: 'mdi-view-dashboard-outline' },
  { title: 'Projects', to: '/world/crm/projects', icon: 'mdi-folder-outline' },
  { title: 'Company', to: '/world/crm/company', icon: 'mdi-domain' },
  ...(can('crm.admin.manage')
    ? [{ title: 'Admin', to: '/world/crm/admin', icon: 'mdi-shield-crown-outline' }]
    : []),
])

if (can('crm.opportunities.read')) {
  await crmStore.fetchOverview()
}

const filters = computed(() => crmStore.filters)
const columns = computed(() => crmStore.columns)
const opportunities = computed(() => crmStore.opportunities)
const selectedDetail = computed(() => crmStore.selectedOpportunityDetail)
const analytics = computed(() => crmStore.analytics)

const stageOrder: CrmPipelineStage[] = [
  'lead',
  'qualified',
  'proposal',
  'negotiation',
  'closed',
]

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount)
}

function stageColor(stage: CrmPipelineStage) {
  if (stage === 'closed') return 'success'
  if (stage === 'negotiation') return 'warning'
  return 'primary'
}

async function refreshData() {
  await crmStore.fetchOverview()
}

async function selectOpportunity(opportunityId: string) {
  await crmStore.fetchOpportunityDetail(opportunityId)
  activeView.value = 'detail'
}

function onListRowClick(_event: unknown, row: { item: CrmOpportunity }) {
  return selectOpportunity(row.item.id)
}

async function moveStage(opportunity: CrmOpportunity, direction: 'next' | 'prev') {
  if (!can('crm.opportunities.edit')) {
    return
  }

  const currentIndex = stageOrder.indexOf(opportunity.stage)
  if (currentIndex === -1) return

  const targetIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1
  const toStage = stageOrder[targetIndex]

  if (!toStage) return

  await crmStore.transitionOpportunity(opportunity.id, {
    toStage,
    probability: opportunity.probability,
    expectedCloseDate: opportunity.expectedCloseDate,
    outcome: toStage === 'closed' ? opportunity.outcome ?? 'won' : null,
  })

  await crmStore.fetchOpportunityDetail(opportunity.id)
}

async function closeOpportunity(opportunity: CrmOpportunity, outcome: 'won' | 'lost') {
  if (!can('crm.opportunities.edit')) {
    return
  }

  await crmStore.transitionOpportunity(opportunity.id, {
    toStage: 'closed',
    probability: outcome === 'won' ? 100 : 0,
    expectedCloseDate: opportunity.expectedCloseDate,
    outcome,
  })

  await crmStore.fetchOpportunityDetail(opportunity.id)
}
</script>

<template>
  <div>
    <WorldModuleDrawers
      module-title="CRM"
      module-icon="mdi-account-group-outline"
      module-description="Leads, comptes, contacts, opportunités, activités et analytics pipeline."
      :nav-items="crmNavItems"
      action-label="Create CRM lead"
      action-icon="mdi-account-plus-outline"
    />

    <v-container fluid>
      <v-alert v-if="!can('crm.opportunities.read')" type="error" variant="tonal">
        Vous n'avez pas la permission de lecture CRM (opportunities.read).
      </v-alert>

      <template v-else>
        <v-card rounded="xl" class="pa-4 mb-4 postcard-gradient-card">
          <v-row>
            <v-col cols="12" md="3">
              <v-text-field
                v-model="filters.search"
                label="Search"
                density="comfortable"
                variant="outlined"
                hide-details
                @keyup.enter="refreshData"
              />
            </v-col>
            <v-col cols="12" md="2">
              <v-text-field
                v-model="filters.owner"
                label="Owner"
                density="comfortable"
                variant="outlined"
                hide-details
                @keyup.enter="refreshData"
              />
            </v-col>
            <v-col cols="12" md="2">
              <v-text-field
                v-model="filters.industry"
                label="Industry"
                density="comfortable"
                variant="outlined"
                hide-details
                @keyup.enter="refreshData"
              />
            </v-col>
            <v-col cols="6" md="2">
              <v-text-field
                v-model.number="filters.minAmount"
                label="Min amount"
                type="number"
                density="comfortable"
                variant="outlined"
                hide-details
              />
            </v-col>
            <v-col cols="6" md="2">
              <v-text-field
                v-model.number="filters.maxAmount"
                label="Max amount"
                type="number"
                density="comfortable"
                variant="outlined"
                hide-details
              />
            </v-col>
            <v-col cols="12" md="1" class="d-flex align-center justify-end">
              <v-btn color="primary" :loading="crmStore.pending" @click="refreshData">
                Apply
              </v-btn>
            </v-col>
          </v-row>
        </v-card>

        <v-tabs v-model="activeView" color="primary" class="mb-4">
          <v-tab value="pipeline">Pipeline</v-tab>
          <v-tab value="list">List</v-tab>
          <v-tab value="detail">Detail</v-tab>
          <v-tab value="dashboard">Dashboard</v-tab>
        </v-tabs>

        <v-window v-model="activeView">
          <v-window-item value="pipeline">
            <v-row>
              <v-col v-for="column in columns" :key="column.stage" cols="12" md="6" lg="4" xl="2">
                <v-card rounded="xl" class="pa-3 h-100 postcard-gradient-card">
                  <div class="d-flex align-center justify-space-between mb-3">
                    <h3 class="text-subtitle-1">{{ column.title }}</h3>
                    <v-chip size="small" :color="stageColor(column.stage)">
                      {{ crmStore.opportunitiesByStage.get(column.stage)?.length ?? 0 }}
                    </v-chip>
                  </div>
                  <v-card
                    v-for="opportunity in crmStore.opportunitiesByStage.get(column.stage)"
                    :key="opportunity.id"
                    rounded="lg"
                    class="pa-3 mb-2"
                    variant="tonal"
                  >
                    <p class="text-caption mb-1">{{ opportunity.id }} · {{ opportunity.owner }}</p>
                    <p class="font-weight-medium mb-1">{{ opportunity.name }}</p>
                    <p class="text-body-2 mb-2">{{ formatCurrency(opportunity.amount) }}</p>
                    <div class="d-flex flex-wrap ga-2">
                      <v-btn size="x-small" variant="outlined" @click="selectOpportunity(opportunity.id)">
                        Detail
                      </v-btn>
                      <v-btn
                        size="x-small"
                        variant="outlined"
                        :disabled="!can('crm.opportunities.edit')"
                        @click="moveStage(opportunity, 'prev')"
                      >
                        Prev
                      </v-btn>
                      <v-btn
                        size="x-small"
                        color="primary"
                        variant="outlined"
                        :disabled="!can('crm.opportunities.edit')"
                        @click="moveStage(opportunity, 'next')"
                      >
                        Next
                      </v-btn>
                      <v-btn
                        size="x-small"
                        color="success"
                        variant="text"
                        :disabled="!can('crm.opportunities.edit')"
                        @click="closeOpportunity(opportunity, 'won')"
                      >
                        Won
                      </v-btn>
                      <v-btn
                        size="x-small"
                        color="error"
                        variant="text"
                        :disabled="!can('crm.opportunities.edit')"
                        @click="closeOpportunity(opportunity, 'lost')"
                      >
                        Lost
                      </v-btn>
                    </div>
                  </v-card>
                </v-card>
              </v-col>
            </v-row>
          </v-window-item>

          <v-window-item value="list">
            <v-card rounded="xl" class="pa-4 postcard-gradient-card">
              <v-data-table
                :items="opportunities"
                :headers="[
                  { title: 'ID', key: 'id' },
                  { title: 'Opportunity', key: 'name' },
                  { title: 'Owner', key: 'owner' },
                  { title: 'Stage', key: 'stage' },
                  { title: 'Probability', key: 'probability' },
                  { title: 'Amount', key: 'amount' },
                  { title: 'Expected close', key: 'expectedCloseDate' },
                ]"
                item-value="id"
                density="comfortable"
                @click:row="onListRowClick"
              >
                <template #item.amount="{ item }">
                  {{ formatCurrency(item.amount) }}
                </template>
              </v-data-table>
            </v-card>
          </v-window-item>

          <v-window-item value="detail">
            <v-card v-if="selectedDetail" rounded="xl" class="pa-4 postcard-gradient-card">
              <h2 class="text-h6 mb-1">{{ selectedDetail.opportunity.name }}</h2>
              <p class="text-medium-emphasis mb-3">
                {{ selectedDetail.account?.name || 'No account' }} ·
                {{ selectedDetail.opportunity.stage }} ·
                {{ formatCurrency(selectedDetail.opportunity.amount) }}
              </p>

              <v-row>
                <v-col cols="12" md="6">
                  <h3 class="text-subtitle-1 mb-2">Activities journal</h3>
                  <v-timeline density="compact" side="end" truncate-line="both">
                    <v-timeline-item
                      v-for="entry in selectedDetail.journal"
                      :key="entry.id"
                      :dot-color="entry.eventType === 'stage_transition' ? 'primary' : 'secondary'"
                      size="small"
                    >
                      <p class="text-caption mb-1">{{ entry.actor }} · {{ entry.timestamp }}</p>
                      <p class="mb-0">{{ entry.message }}</p>
                    </v-timeline-item>
                  </v-timeline>
                </v-col>
                <v-col cols="12" md="6">
                  <h3 class="text-subtitle-1 mb-2">Notes & attachments</h3>
                  <v-card
                    v-for="note in selectedDetail.notes"
                    :key="note.id"
                    rounded="lg"
                    class="pa-3 mb-2"
                    variant="tonal"
                  >
                    <p class="text-caption mb-1">{{ note.author }} · {{ note.createdAt }}</p>
                    <p class="mb-2">{{ note.body }}</p>
                    <v-chip
                      v-for="attachment in note.attachments"
                      :key="attachment.id"
                      size="small"
                      class="mr-2 mb-1"
                    >
                      {{ attachment.fileName }} ({{ attachment.sizeKb }}kb)
                    </v-chip>
                  </v-card>
                </v-col>
              </v-row>
            </v-card>
            <v-alert v-else type="info" variant="tonal">
              Sélectionnez une opportunité depuis la vue Pipeline ou List.
            </v-alert>
          </v-window-item>

          <v-window-item value="dashboard">
            <v-row>
              <v-col cols="12" md="3">
                <v-card rounded="xl" class="pa-3 postcard-gradient-card">
                  <p class="text-caption text-medium-emphasis">Conversion rate</p>
                  <h3 class="text-h5">{{ analytics?.conversionRate.toFixed(1) }}%</h3>
                </v-card>
              </v-col>
              <v-col cols="12" md="3">
                <v-card rounded="xl" class="pa-3 postcard-gradient-card">
                  <p class="text-caption text-medium-emphasis">Win / Loss</p>
                  <h3 class="text-h6">
                    {{ analytics?.winRate.toFixed(1) }}% / {{ analytics?.lossRate.toFixed(1) }}%
                  </h3>
                </v-card>
              </v-col>
              <v-col cols="12" md="3">
                <v-card rounded="xl" class="pa-3 postcard-gradient-card">
                  <p class="text-caption text-medium-emphasis">Cycle moyen</p>
                  <h3 class="text-h5">{{ analytics?.averageCycleDays.toFixed(1) }} j</h3>
                </v-card>
              </v-col>
              <v-col cols="12" md="3">
                <v-card rounded="xl" class="pa-3 postcard-gradient-card">
                  <p class="text-caption text-medium-emphasis">Weighted forecast</p>
                  <h3 class="text-h6">{{ formatCurrency(analytics?.weightedForecast || 0) }}</h3>
                </v-card>
              </v-col>
            </v-row>
          </v-window-item>
        </v-window>
      </template>
    </v-container>
  </div>
</template>
