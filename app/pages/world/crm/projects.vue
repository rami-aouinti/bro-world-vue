<script setup lang="ts">
import type { CrmProjectsApiResponse } from '~~/server/types/api/crm'
import { useCrmPermissions } from '~/composables/useCrmPermissions'

definePageMeta({ title: 'CRM Projects' })

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

const projectsQuery = {
  page: 1,
  limit: 10,
  sortBy: 'id',
  sortOrder: 'asc' as const,
}

const { data: projectsData } = await useAsyncData<CrmProjectsApiResponse>(
  'crm-projects',
  () => $fetch('/api/world/crm/projects', { query: projectsQuery }),
)

const rows = computed<Record<string, string | number>[]>(() => projectsData.value?.items ?? [])
</script>

<template>
  <div>
    <WorldModuleDrawers
      :module-title="t('world.crm.label', 'CRM')"
      module-icon="mdi-account-group-outline"
      :module-description="t('world.crm.moduleDescription', 'Navigation CRM avec gestion des projets et entreprises.')"
      :nav-items="crmNavItems"
      action-label="New project"
      action-icon="mdi-folder-plus-outline"
    />

    <v-container fluid class="pt-0">
      <WorldFeatureScaffold
        title="CRM Projects"
        subtitle="Planifie, assigne et suis l’avancement des projets clients."
        form-title="Create project"
        form-description="Configure timeline, manager, budget et priorité opérationnelle."
        :fields="[
          { key: 'name', label: 'Project name', type: 'text' },
          { key: 'manager', label: 'Project manager', type: 'text' },
          { key: 'priority', label: 'Priority', type: 'select', options: [
            { title: 'Low', value: 'low' },
            { title: 'Medium', value: 'medium' },
            { title: 'High', value: 'high' },
          ] },
          { key: 'startDate', label: 'Start date', type: 'date' },
          { key: 'budget', label: 'Budget', type: 'number' },
          { key: 'notes', label: 'Brief', type: 'textarea' },
        ]"
        :headers="[
          { title: 'ID', key: 'id' },
          { title: 'Project', key: 'project' },
          { title: 'Manager', key: 'manager' },
          { title: 'Phase', key: 'phase' },
          { title: 'Progress', key: 'progress' },
        ]"
        :rows="rows"
        create-label="Create project"
      />
    </v-container>
  </div>
</template>
