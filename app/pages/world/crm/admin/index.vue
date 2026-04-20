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
const { t } = useI18n()
const { crmNavItems } = useWorldCrmNavItems()
const { sessionUser } = useCrmPermissions()
const isRootAdmin = computed(() =>
  (sessionUser.value?.roles ?? []).includes('ROLE_ROOT'),
)

const { data: dashboardData, pending: dashboardPending } =
  await useFetch<CrmDashboardResponse>('/api/crm/general/dashboard')

const dashboardCards = computed(() => {
  if (!dashboardData.value) return []

  return [
    {
      title: t('world.crm.admin.cards.companies'),
      value: dashboardData.value.companies,
      icon: 'mdi-domain',
    },
    {
      title: t('world.crm.admin.cards.projects'),
      value: dashboardData.value.projects,
      icon: 'mdi-folder-multiple-outline',
    },
    {
      title: t('world.crm.admin.cards.tasks'),
      value: dashboardData.value.tasks,
      icon: 'mdi-format-list-checks',
    },
    {
      title: t('world.crm.admin.cards.requestsPending'),
      value: dashboardData.value.taskRequests.pending,
      icon: 'mdi-timer-sand',
    },
    {
      title: t('world.crm.admin.cards.requestsApproved'),
      value: dashboardData.value.taskRequests.approved,
      icon: 'mdi-check-circle-outline',
    },
    {
      title: t('world.crm.admin.cards.requestsRejected'),
      value: dashboardData.value.taskRequests.rejected,
      icon: 'mdi-close-circle-outline',
    },
  ]
})

const adminSections = computed(() => [
  { label: t('world.crm.admin.sections.companies'), icon: 'mdi-domain', to: '/world/crm/admin/companies' },
  { label: t('world.crm.admin.sections.projects'), icon: 'mdi-folder-outline', to: '/world/crm/admin/projects' },
  { label: t('world.crm.admin.sections.tasks'), icon: 'mdi-format-list-checks', to: '/world/crm/admin/tasks' },
  { label: t('world.crm.admin.sections.taskRequests'), icon: 'mdi-file-document-edit-outline', to: '/world/crm/admin/task-requests' },
  { label: t('world.crm.admin.sections.sprints'), icon: 'mdi-run-fast', to: '/world/crm/admin/sprints' },
  { label: t('world.crm.admin.sections.billings'), icon: 'mdi-receipt-text-outline', to: '/world/crm/admin/billings' },
  { label: t('world.crm.admin.sections.contacts'), icon: 'mdi-account-box-multiple-outline', to: '/world/crm/admin/contacts' },
])

const utilityCards = computed(() => [
  ...(isRootAdmin.value
    ? [{
        label: t('world.crm.admin.utility.githubSync'),
        description: t('world.crm.admin.utility.githubSyncDescription'),
        icon: 'mdi-github',
        to: '/world/crm/github-sync',
      }]
    : []),
])
</script>

<template>
  <div>
    <WorldModuleDrawers
      :module-title="t('world.crm.label')"
      module-key="crm"
      module-path="/world/crm"
      module-icon="mdi-account-group-outline"
      :module-description="t('world.crm.admin.moduleDescription')"
      :nav-items="crmNavItems"
      :action-label="t('world.crm.admin.actions.refresh')"
      action-icon="mdi-refresh"
      @action="refreshNuxtData('/api/crm/general/dashboard')"
    />

    <v-container fluid>
      <v-card rounded="xl" class="pa-4 mb-4 postcard-gradient-card">
        <h2 class="text-h5 mb-2">{{ t('world.crm.admin.page.title') }}</h2>
        <p class="text-body-2 text-medium-emphasis mb-0">
          {{ t('world.crm.admin.page.description') }}
        </p>
      </v-card>

      <CrmPageSkeleton v-if="dashboardPending" variant="dashboard" />

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

      <h3 class="text-h6 mb-3">{{ t('world.crm.admin.sections.title') }}</h3>
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
                    {{ t('world.crm.admin.sections.open') }}
                  </p>
                </div>
              </div>
              <v-icon color="primary">mdi-chevron-right</v-icon>
            </div>
          </v-card>
        </v-col>
      </v-row>

      <template v-if="utilityCards.length">
        <h3 class="text-h6 mt-6 mb-3">{{ t('world.crm.admin.utility.title') }}</h3>
        <v-row>
          <v-col
            v-for="card in utilityCards"
            :key="card.to"
            cols="12"
            sm="6"
            lg="4"
          >
            <v-card
              rounded="xl"
              class="pa-4 postcard-gradient-card h-100 cursor-pointer"
              @click="router.push(card.to)"
            >
              <div class="d-flex align-center justify-space-between ga-2">
                <div class="d-flex align-center ga-3">
                  <v-avatar color="primary" variant="tonal" size="42">
                    <v-icon>{{ card.icon }}</v-icon>
                  </v-avatar>
                  <div>
                    <p class="text-subtitle-1 font-weight-medium mb-0">
                      {{ card.label }}
                    </p>
                    <p class="text-body-2 text-medium-emphasis mb-0">
                      {{ card.description }}
                    </p>
                  </div>
                </div>
                <v-icon color="primary">mdi-chevron-right</v-icon>
              </div>
            </v-card>
          </v-col>
        </v-row>
      </template>
    </v-container>
  </div>
</template>
