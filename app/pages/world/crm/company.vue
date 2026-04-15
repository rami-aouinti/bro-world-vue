<script setup lang="ts">
import type { CrmCompaniesApiResponse } from '~~/server/types/api/crm'
import { useCrmPermissions } from '~/composables/useCrmPermissions'

definePageMeta({ title: 'CRM Company' })

const { can } = useCrmPermissions()

const crmNavItems = computed(() => [
  { title: 'Overview CRM', to: '/world/crm', icon: 'mdi-view-dashboard-outline' },
  { title: 'Projects', to: '/world/crm/projects', icon: 'mdi-folder-outline' },
  { title: 'Company', to: '/world/crm/company', icon: 'mdi-domain' },
  ...(can('crm.admin.manage')
    ? [{ title: 'Admin', to: '/world/crm/admin', icon: 'mdi-shield-crown-outline' }]
    : []),
])

const companiesQuery = {
  page: 1,
  limit: 10,
  sortBy: 'id',
  sortOrder: 'asc' as const,
}

const { data: companiesData } = await useAsyncData<CrmCompaniesApiResponse>(
  'crm-companies',
  () => $fetch('/api/world/crm/companies', { query: companiesQuery }),
)

const rows = computed<Record<string, string | number>[]>(() => companiesData.value?.items ?? [])
</script>

<template>
  <div>
    <WorldModuleDrawers
      module-title="CRM"
      module-icon="mdi-account-group-outline"
      module-description="Navigation CRM avec gestion des projets et entreprises."
      :nav-items="crmNavItems"
      action-label="Add company"
      action-icon="mdi-domain-plus"
    />

    <v-container fluid class="pt-0">
      <WorldFeatureScaffold
        title="Company Accounts"
        subtitle="Gère les fiches sociétés, contacts clés et segmentation business."
        form-title="Create company profile"
        form-description="Ajoute une entreprise avec contact principal et catégorie."
        :fields="[
          { key: 'companyName', label: 'Company name', type: 'text' },
          { key: 'industry', label: 'Industry', type: 'text' },
          { key: 'contactEmail', label: 'Contact email', type: 'email' },
          { key: 'accountOwner', label: 'Account owner', type: 'text' },
          { key: 'employeeCount', label: 'Employees', type: 'number' },
          { key: 'notes', label: 'Notes', type: 'textarea' },
        ]"
        :headers="[
          { title: 'ID', key: 'id' },
          { title: 'Company', key: 'company' },
          { title: 'Industry', key: 'industry' },
          { title: 'Owner', key: 'owner' },
          { title: 'Health', key: 'health' },
        ]"
        :rows="rows"
        create-label="Save company"
      />
    </v-container>
  </div>
</template>
