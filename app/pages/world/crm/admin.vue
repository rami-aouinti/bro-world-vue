<script setup lang="ts">
interface CrmDashboardResponse {
  companies: number
  projects: number
  tasks: number
  taskRequests: {
    pending: number
    approved: number
    rejected: number
  }
}

definePageMeta({ title: 'CRM Admin' })

const router = useRouter()
const { crmNavItems } = useWorldCrmNavItems()

const { data: dashboardData, pending: dashboardPending } =
  await useFetch<CrmDashboardResponse>('/api/crm/general/dashboard')

const dashboardCards = computed(() => {
  if (!dashboardData.value) return []

  return [
    {
      title: 'Companies',
      value: dashboardData.value.companies,
      icon: 'mdi-domain',
    },
    {
      title: 'Projects',
      value: dashboardData.value.projects,
      icon: 'mdi-folder-multiple-outline',
    },
    {
      title: 'Tasks',
      value: dashboardData.value.tasks,
      icon: 'mdi-format-list-checks',
    },
    {
      title: 'Requests pending',
      value: dashboardData.value.taskRequests.pending,
      icon: 'mdi-timer-sand',
    },
    {
      title: 'Requests approved',
      value: dashboardData.value.taskRequests.approved,
      icon: 'mdi-check-circle-outline',
    },
    {
      title: 'Requests rejected',
      value: dashboardData.value.taskRequests.rejected,
      icon: 'mdi-close-circle-outline',
    },
  ]
})

const adminSections = [
  { label: 'Companies', icon: 'mdi-domain', to: '/world/crm/admin/companies' },
  { label: 'Projects', icon: 'mdi-folder-outline', to: '/world/crm/admin/projects' },
  { label: 'Tasks', icon: 'mdi-format-list-checks', to: '/world/crm/admin/tasks' },
  { label: 'Task requests', icon: 'mdi-file-document-edit-outline', to: '/world/crm/admin/task-requests' },
  { label: 'Sprints', icon: 'mdi-run-fast', to: '/world/crm/admin/sprints' },
  { label: 'Billings', icon: 'mdi-receipt-text-outline', to: '/world/crm/admin/billings' },
  { label: 'Contacts', icon: 'mdi-account-box-multiple-outline', to: '/world/crm/admin/contacts' },
]
</script>

<template>
  <div>
    <WorldModuleDrawers
      module-title="CRM"
      module-icon="mdi-account-group-outline"
      module-description="CRM Admin dashboard et accès rapide aux entités."
      :nav-items="crmNavItems"
      action-label="Actualiser"
      action-icon="mdi-refresh"
      @action="refreshNuxtData('/api/crm/general/dashboard')"
    />

    <v-container fluid>
      <v-card rounded="xl" class="pa-4 mb-4 postcard-gradient-card">
        <h2 class="text-h5 mb-2">CRM Admin center</h2>
        <p class="text-body-2 text-medium-emphasis mb-0">
          Dashboard global + navigation par cards vers chaque section admin.
        </p>
      </v-card>

      <v-alert
        v-if="dashboardPending"
        type="info"
        variant="tonal"
        class="mb-4"
      >
        Chargement du dashboard CRM...
      </v-alert>

      <v-row v-else class="mb-6">
        <v-col
          v-for="card in dashboardCards"
          :key="card.title"
          cols="12"
          sm="6"
          lg="4"
        >
          <v-card rounded="xl" class="pa-4 postcard-gradient-card h-100">
            <div class="d-flex align-center justify-space-between">
              <div>
                <p class="text-caption text-medium-emphasis mb-1">
                  {{ card.title }}
                </p>
                <p class="text-h5 font-weight-bold mb-0">
                  {{ card.value }}
                </p>
              </div>
              <v-avatar color="primary" variant="tonal" size="42">
                <v-icon>{{ card.icon }}</v-icon>
              </v-avatar>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <h3 class="text-h6 mb-3">Sections admin</h3>
      <v-row>
        <v-col
          v-for="section in adminSections"
          :key="section.to"
          cols="12"
          sm="6"
          lg="4"
        >
          <v-card
            rounded="xl"
            class="pa-4 postcard-gradient-card h-100 cursor-pointer"
            @click="router.push(section.to)"
          >
            <div class="d-flex align-center justify-space-between ga-2">
              <div class="d-flex align-center ga-3">
                <v-avatar color="primary" variant="tonal" size="42">
                  <v-icon>{{ section.icon }}</v-icon>
                </v-avatar>
                <div>
                  <p class="text-subtitle-1 font-weight-medium mb-0">
                    {{ section.label }}
                  </p>
                  <p class="text-body-2 text-medium-emphasis mb-0">
                    Ouvrir la section
                  </p>
                </div>
              </div>
              <v-icon color="primary">mdi-chevron-right</v-icon>
            </div>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
