<script setup lang="ts">
import { useCrmPermissions } from '~/composables/useCrmPermissions'
import { useWorldCrmStore } from '~/stores/worldCrm'

definePageMeta({ title: 'CRM Company' })

const { t } = useI18n()
const { can } = useCrmPermissions()

const crmNavItems = computed(() => [
  { title: t('world.crm.nav.overview', 'Overview CRM'), to: '/world/crm', icon: 'mdi-view-dashboard-outline' },
  { title: t('world.crm.nav.projects', 'Projects'), to: '/world/crm/projects', icon: 'mdi-folder-outline' },
  { title: t('world.crm.nav.company', 'Company'), to: '/world/crm/company', icon: 'mdi-domain' },
  ...(can('crm.admin.manage')
    ? [{ title: t('world.crm.nav.admin', 'Admin'), to: '/world/crm/admin', icon: 'mdi-shield-crown-outline' }]
    : []),
])

const crmStore = useWorldCrmStore()
await crmStore.fetchList('companies', {
  filters: { sortBy: 'id', sortOrder: 'asc' },
  pagination: { page: 1, limit: 10 },
})

const rows = computed<Record<string, string | number>[]>(() => crmStore.items as Record<string, string | number>[])
</script>

<template>
  <div>
    <WorldModuleDrawers
      :module-title="t('world.crm.label', 'CRM')"
      module-icon="mdi-account-group-outline"
      :module-description="t('world.crm.moduleDescription', 'Navigation CRM avec gestion des projets et entreprises.')"
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
