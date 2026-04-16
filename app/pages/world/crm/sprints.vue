<script setup lang="ts">
interface CrmSprintItem {
  id: string
  name: string
  status: string
  startDate: string
  endDate: string
  projectId: string
}

interface CrmSprintResponse {
  items: CrmSprintItem[]
}

definePageMeta({ title: 'CRM Sprints' })

const { locale } = useI18n()

const crmNavItems = [
  {
    title: 'Overview CRM',
    to: '/world/crm',
    icon: 'mdi-view-dashboard-outline',
  },
  { title: 'Projects', to: '/world/crm/projects', icon: 'mdi-folder-outline' },
  { title: 'Tasks', to: '/world/crm/tasks', icon: 'mdi-format-list-checks' },
  { title: 'Sprints', to: '/world/crm/sprints', icon: 'mdi-run-fast' },
  { title: 'Company', to: '/world/crm/company', icon: 'mdi-domain' },
  { title: 'Admin', to: '/world/crm/admin', icon: 'mdi-shield-crown-outline' },
]

const { data, pending, error } = await useFetch<CrmSprintResponse>(
  '/api/world/crm/general/sprints',
)

function formatDate(value: string) {
  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: 'medium',
  }).format(new Date(value))
}
</script>

<template>
  <div>
    <WorldModuleDrawers
      module-title="CRM"
      module-icon="mdi-account-group-outline"
      module-description="Liste publique des sprints CRM"
      :nav-items="crmNavItems"
      action-label="Create sprint"
      action-icon="mdi-plus"
    />

    <v-container fluid>
      <v-alert v-if="pending" type="info" variant="tonal" class="mb-4"
        >Chargement des sprints...</v-alert
      >
      <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4"
        >Erreur de chargement des sprints.</v-alert
      >

      <v-row v-else>
        <v-col
          v-for="sprint in data?.items ?? []"
          :key="sprint.id"
          cols="12"
          md="6"
          xl="4"
        >
          <v-card rounded="xl" class="pa-4 postcard-gradient-card h-100">
            <div class="d-flex align-start justify-space-between ga-2 mb-2">
              <h3 class="text-subtitle-1 mb-0">{{ sprint.name }}</h3>
              <v-chip size="small" color="secondary" variant="tonal">{{
                sprint.status
              }}</v-chip>
            </div>
            <p class="text-body-2 mb-1">
              Start: {{ formatDate(sprint.startDate) }}
            </p>
            <p class="text-body-2 mb-0">
              End: {{ formatDate(sprint.endDate) }}
            </p>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
