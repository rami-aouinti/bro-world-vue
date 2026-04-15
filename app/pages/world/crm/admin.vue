<script setup lang="ts">
type CrmAdminTab = 'dashboard' | 'companies' | 'billings' | 'contacts' | 'reports'

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

interface CrmCompanyItem {
  id: string
  name: string
  industry: string
  website: string
  contactEmail: string
  phone: string
}

interface CrmContactItem {
  id: string
  companyId: string
  firstName: string
  lastName: string
  email: string
  phone: string
  jobTitle: string
  city: string
  score: number
}

interface CrmReportsResponse {
  metadata: {
    period: string
    timezone: string
    generatedAt: string
    version: string
  }
  kpis: {
    pipeline: number
    dealsWon: number
    cycleDays: number
    npsClients: number
  }
  counts: {
    companies: number
    contacts: number
    employees: number
    billings: number
    tasks: number
  }
  recommendedActions: Array<{
    priority: string
    title: string
    owner: string
    etaDays: number
  }>
}

interface CrmCollectionResponse<T> {
  items: T[]
  pagination?: {
    page: number
    limit: number
    totalItems: number
    totalPages: number
  }
}

definePageMeta({ title: 'CRM Admin' })

const activeTab = ref<CrmAdminTab>('dashboard')

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
  {
    title: 'Admin',
    to: '/world/crm/admin',
    icon: 'mdi-shield-crown-outline',
  },
]

const { data: dashboardData, pending: dashboardPending } = await useFetch<CrmDashboardResponse>(
  '/api/world/crm/general/dashboard',
)
const { data: companiesData, pending: companiesPending } =
  await useFetch<CrmCollectionResponse<CrmCompanyItem>>(
    '/api/world/crm/general/companies',
  )
const { data: billingsData, pending: billingsPending } =
  await useFetch<CrmCollectionResponse<Record<string, unknown>>>(
    '/api/world/crm/general/billings',
  )
const { data: contactsData, pending: contactsPending } =
  await useFetch<CrmCollectionResponse<CrmContactItem>>(
    '/api/world/crm/general/contacts',
  )
const { data: reportsData, pending: reportsPending } =
  await useFetch<CrmReportsResponse>('/api/world/crm/general/reports')

const adminTabs = [
  { value: 'dashboard', label: 'Dashboard', icon: 'mdi-view-dashboard-outline' },
  { value: 'companies', label: 'Companies', icon: 'mdi-domain' },
  { value: 'billings', label: 'Billings', icon: 'mdi-receipt-text-outline' },
  { value: 'contacts', label: 'Contacts', icon: 'mdi-account-box-multiple-outline' },
  { value: 'reports', label: 'Reports', icon: 'mdi-chart-box-outline' },
]

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

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatMoney(value: number) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}
</script>

<template>
  <div>
    <WorldModuleDrawers
      module-title="CRM"
      module-icon="mdi-account-group-outline"
      module-description="Navigation CRM avec endpoints publics (dashboard, companies, billings, contacts, reports)."
      :nav-items="crmNavItems"
      action-label="Refresh CRM data"
      action-icon="mdi-refresh"
    />

    <v-container fluid>
      <v-card rounded="xl" class="pa-4 mb-4 postcard-gradient-card">
        <h2 class="text-h5 mb-2">CRM Admin center</h2>
        <p class="text-body-2 text-medium-emphasis mb-0">
          Vue centralisée des endpoints publics CRM avec affichage par sous-pages.
        </p>
      </v-card>

      <v-tabs v-model="activeTab" color="primary" class="mb-4" grow>
        <v-tab v-for="tab in adminTabs" :key="tab.value" :value="tab.value">
          <v-icon size="18" start>{{ tab.icon }}</v-icon>
          {{ tab.label }}
        </v-tab>
      </v-tabs>

      <v-window v-model="activeTab">
        <v-window-item value="dashboard">
          <v-alert v-if="dashboardPending" type="info" variant="tonal" class="mb-4">
            Chargement du dashboard CRM...
          </v-alert>
          <v-row v-else>
            <v-col v-for="card in dashboardCards" :key="card.title" cols="12" sm="6" lg="4">
              <v-card rounded="xl" class="pa-4 postcard-gradient-card h-100">
                <div class="d-flex align-center justify-space-between">
                  <div>
                    <p class="text-caption text-medium-emphasis mb-1">{{ card.title }}</p>
                    <p class="text-h5 font-weight-bold mb-0">{{ card.value }}</p>
                  </div>
                  <v-avatar color="primary" variant="tonal" size="42">
                    <v-icon>{{ card.icon }}</v-icon>
                  </v-avatar>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>

        <v-window-item value="companies">
          <v-alert v-if="companiesPending" type="info" variant="tonal" class="mb-4">
            Chargement des companies...
          </v-alert>
          <v-row v-else>
            <v-col
              v-for="company in companiesData?.items ?? []"
              :key="company.id"
              cols="12"
              md="6"
              xl="4"
            >
              <v-card rounded="xl" class="pa-4 postcard-gradient-card h-100">
                <div class="d-flex justify-space-between align-start mb-2 ga-2">
                  <h3 class="text-subtitle-1 mb-0">{{ company.name }}</h3>
                  <v-chip color="primary" size="small" variant="tonal">{{ company.industry }}</v-chip>
                </div>
                <p class="text-body-2 mb-2 text-truncate">{{ company.contactEmail }}</p>
                <p class="text-body-2 mb-3">{{ company.phone }}</p>
                <a :href="company.website" target="_blank" rel="noopener" class="text-decoration-none">
                  {{ company.website }}
                </a>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>

        <v-window-item value="billings">
          <v-alert v-if="billingsPending" type="info" variant="tonal" class="mb-4">
            Chargement des billings...
          </v-alert>
          <v-row v-else>
            <v-col cols="12" md="6">
              <v-card rounded="xl" class="pa-4 postcard-gradient-card">
                <p class="text-caption text-medium-emphasis mb-1">Billing items</p>
                <p class="text-h5 mb-0">{{ billingsData?.items?.length ?? 0 }}</p>
              </v-card>
            </v-col>
            <v-col cols="12" md="6">
              <v-card rounded="xl" class="pa-4 postcard-gradient-card">
                <p class="text-caption text-medium-emphasis mb-1">Reports billings count</p>
                <p class="text-h5 mb-0">{{ reportsData?.counts.billings ?? 0 }}</p>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>

        <v-window-item value="contacts">
          <v-alert v-if="contactsPending" type="info" variant="tonal" class="mb-4">
            Chargement des contacts...
          </v-alert>
          <v-row v-else>
            <v-col
              v-for="contact in contactsData?.items ?? []"
              :key="contact.id"
              cols="12"
              md="6"
              xl="4"
            >
              <v-card rounded="xl" class="pa-4 postcard-gradient-card h-100">
                <div class="d-flex justify-space-between align-start mb-2 ga-2">
                  <h3 class="text-subtitle-1 mb-0">
                    {{ contact.firstName }} {{ contact.lastName }}
                  </h3>
                  <v-chip color="secondary" size="small" variant="tonal">Score {{ contact.score }}</v-chip>
                </div>
                <p class="text-body-2 mb-1">{{ contact.jobTitle }}</p>
                <p class="text-body-2 mb-1">{{ contact.city }}</p>
                <p class="text-body-2 mb-1">{{ contact.email }}</p>
                <p class="text-body-2 mb-0">{{ contact.phone }}</p>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>

        <v-window-item value="reports">
          <v-alert v-if="reportsPending" type="info" variant="tonal" class="mb-4">
            Chargement des reports...
          </v-alert>
          <template v-else>
            <v-row class="mb-2">
              <v-col cols="12" sm="6" lg="3">
                <v-card rounded="xl" class="pa-4 postcard-gradient-card">
                  <p class="text-caption text-medium-emphasis mb-1">Pipeline</p>
                  <p class="text-h6 mb-0">{{ formatMoney(reportsData?.kpis.pipeline ?? 0) }}</p>
                </v-card>
              </v-col>
              <v-col cols="12" sm="6" lg="3">
                <v-card rounded="xl" class="pa-4 postcard-gradient-card">
                  <p class="text-caption text-medium-emphasis mb-1">Deals won</p>
                  <p class="text-h6 mb-0">{{ reportsData?.kpis.dealsWon ?? 0 }}</p>
                </v-card>
              </v-col>
              <v-col cols="12" sm="6" lg="3">
                <v-card rounded="xl" class="pa-4 postcard-gradient-card">
                  <p class="text-caption text-medium-emphasis mb-1">Cycle days</p>
                  <p class="text-h6 mb-0">{{ reportsData?.kpis.cycleDays ?? 0 }}</p>
                </v-card>
              </v-col>
              <v-col cols="12" sm="6" lg="3">
                <v-card rounded="xl" class="pa-4 postcard-gradient-card">
                  <p class="text-caption text-medium-emphasis mb-1">NPS clients</p>
                  <p class="text-h6 mb-0">{{ reportsData?.kpis.npsClients ?? 0 }}</p>
                </v-card>
              </v-col>
            </v-row>

            <v-card rounded="xl" class="pa-4 postcard-gradient-card mb-4">
              <p class="text-caption text-medium-emphasis mb-1">Metadata</p>
              <p class="text-body-2 mb-1">Period: {{ reportsData?.metadata.period }}</p>
              <p class="text-body-2 mb-1">Timezone: {{ reportsData?.metadata.timezone }}</p>
              <p class="text-body-2 mb-0">
                Generated: {{ formatDateTime(reportsData?.metadata.generatedAt ?? new Date().toISOString()) }}
              </p>
            </v-card>

            <v-row>
              <v-col
                v-for="action in reportsData?.recommendedActions ?? []"
                :key="action.title"
                cols="12"
                md="6"
              >
                <v-card rounded="xl" class="pa-4 postcard-gradient-card">
                  <div class="d-flex justify-space-between align-start mb-2">
                    <v-chip size="small" color="warning" variant="outlined">{{ action.priority }}</v-chip>
                    <span class="text-caption text-medium-emphasis">ETA {{ action.etaDays }} jours</span>
                  </div>
                  <p class="text-subtitle-2 mb-1">{{ action.title }}</p>
                  <p class="text-body-2 mb-0">Owner: {{ action.owner }}</p>
                </v-card>
              </v-col>
            </v-row>
          </template>
        </v-window-item>
      </v-window>
    </v-container>
  </div>
</template>
