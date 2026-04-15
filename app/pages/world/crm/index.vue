<script setup lang="ts">
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

const leadsQuery = {
  page: 1,
  limit: 10,
  sortBy: 'id',
  sortOrder: 'asc' as const,
}

const { data: crmLeadsData } = await useAsyncData<CrmLeadsApiResponse>(
  'crm-leads',
  () => $fetch('/api/world/crm/leads', { query: leadsQuery }),
)

const crmRows = computed<CrmLead[]>(() => crmLeadsData.value?.items ?? [])
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
        <v-col cols="12" md="3">
          <v-card rounded="xl" class="pa-3 postcard-gradient-card">
            <p class="text-caption text-medium-emphasis mb-1">Active deals</p>
            <h3 class="text-h5">42</h3>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card rounded="xl" class="pa-3 postcard-gradient-card">
            <p class="text-caption text-medium-emphasis mb-1">Weighted forecast</p>
            <h3 class="text-h5">$1.2M</h3>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card rounded="xl" class="pa-3 postcard-gradient-card">
            <p class="text-caption text-medium-emphasis mb-1">Tasks due today</p>
            <h3 class="text-h5">17</h3>
          </v-card>
        </v-col>
        <v-col cols="12" md="3">
          <v-card rounded="xl" class="pa-3 postcard-gradient-card">
            <p class="text-caption text-medium-emphasis mb-1">Customer health</p>
            <h3 class="text-h5">89%</h3>
          </v-card>
        </v-col>
      </v-row>

      <WorldFeatureScaffold
        title="CRM Command Center"
        subtitle="Pilotage complet des leads, comptes entreprise et suivi des opportunités."
        form-title="Create new opportunity"
        form-description="Crée une opportunité avec les infos clés pour l’équipe commerciale."
        :fields="[
          { key: 'account', label: 'Account name', type: 'text', placeholder: 'Acme Corp' },
          { key: 'owner', label: 'Owner', type: 'text', placeholder: 'Sales owner' },
          {
            key: 'stage',
            label: 'Stage',
            type: 'select',
            options: [
              { title: 'Discovery', value: 'discovery' },
              { title: 'Proposal', value: 'proposal' },
              { title: 'Negotiation', value: 'negotiation' },
            ],
          },
          { key: 'amount', label: 'Estimated amount', type: 'number', placeholder: '15000' },
          { key: 'closeDate', label: 'Expected close date', type: 'date' },
          { key: 'notes', label: 'Internal notes', type: 'textarea', placeholder: 'Scope, blockers, dependencies...' },
        ]"
        :headers="[
          { title: 'ID', key: 'id' },
          { title: 'Project', key: 'project' },
          { title: 'Owner', key: 'owner' },
          { title: 'Status', key: 'status' },
          { title: 'Budget', key: 'budget' },
        ]"
        :rows="crmRows"
        create-label="Save opportunity"
      />
    </v-container>
  </div>
</template>
