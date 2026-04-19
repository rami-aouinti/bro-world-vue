<script setup lang="ts">
import type {
  CrmAdminEntityConfig,
  CrmGeneralCollectionResponse,
  CrmGeneralEntityKind,
  CrmGeneralMutationResponse,
} from '~/types/world/crmGeneral'

type CrmAdminTab =
  | 'dashboard'
  | 'companies'
  | 'projects'
  | 'tasks'
  | 'taskRequests'
  | 'sprints'
  | 'billings'
  | 'contacts'
  | 'reports'

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
  metadata?: {
    period: string
    timezone: string
    generatedAt: string
    version: string
  }
  kpis?: {
    pipeline: number
    dealsWon: number
    cycleDays: number
    npsClients: number
  }
  counts?: {
    companies: number
    contacts: number
    employees: number
    billings: number
    tasks: number
  }
  recommendedActions?: Array<{
    priority: string
    title: string
    owner: string
    etaDays: number
  }>
}

definePageMeta({ title: 'CRM Admin' })

const { locale } = useI18n()
const { crmNavItems } = useWorldCrmNavItems()

const activeTab = ref<CrmAdminTab>('dashboard')
const modalOpen = ref(false)
const modalPending = ref(false)
const modalMode = ref<'create' | 'edit'>('create')
const activeEntityKind = ref<CrmGeneralEntityKind>('companies')
const editingEntityId = ref<string>('')
const submitError = ref<string | null>(null)
const toastVisible = ref(false)
const toastMessage = ref('')
const toastColor = ref<'success' | 'error'>('success')

const formState = reactive<Record<string, string | number>>({})


const entityConfigs: CrmAdminEntityConfig[] = [
  {
    key: 'companies',
    label: 'Companies',
    icon: 'mdi-domain',
    idKey: 'id',
    titleKey: 'name',
    subtitleKeys: ['industry', 'contactEmail', 'phone'],
    fields: [
      { key: 'crmId', label: 'CRM ID', type: 'text', required: true },
      { key: 'name', label: 'Company name', type: 'text', required: true },
      { key: 'industry', label: 'Industry', type: 'text', required: true },
      {
        key: 'website',
        label: 'Website',
        type: 'url',
        placeholder: 'https://...',
      },
      { key: 'contactEmail', label: 'Contact email', type: 'email' },
      { key: 'phone', label: 'Phone', type: 'text' },
    ],
  },
  {
    key: 'projects',
    label: 'Projects',
    icon: 'mdi-folder-outline',
    idKey: 'id',
    titleKey: 'name',
    subtitleKeys: ['status', 'code', 'companyId'],
    fields: [
      { key: 'companyId', label: 'Company ID', type: 'text', required: true },
      { key: 'name', label: 'Project name', type: 'text', required: true },
      { key: 'code', label: 'Code', type: 'text' },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'status', label: 'Status', type: 'text' },
      { key: 'startedAt', label: 'Started at (ISO)', type: 'text' },
      { key: 'dueAt', label: 'Due at (ISO)', type: 'text' },
    ],
  },
  {
    key: 'tasks',
    label: 'Tasks',
    icon: 'mdi-format-list-checks',
    idKey: 'id',
    titleKey: 'title',
    subtitleKeys: ['status', 'priority', 'projectId'],
    fields: [
      { key: 'projectId', label: 'Project ID', type: 'text', required: true },
      { key: 'title', label: 'Task title', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'status', label: 'Status', type: 'text' },
      { key: 'priority', label: 'Priority', type: 'text' },
      { key: 'dueAt', label: 'Due at (ISO)', type: 'text' },
      { key: 'estimatedHours', label: 'Estimated hours', type: 'number' },
      { key: 'sprintId', label: 'Sprint ID', type: 'text' },
      { key: 'parentTaskId', label: 'Parent Task ID', type: 'text' },
    ],
  },
  {
    key: 'task-requests',
    label: 'Task requests',
    icon: 'mdi-file-document-edit-outline',
    idKey: 'id',
    titleKey: 'title',
    subtitleKeys: ['status', 'taskId', 'repositoryId'],
    fields: [
      { key: 'taskId', label: 'Task ID', type: 'text', required: true },
      {
        key: 'repositoryId',
        label: 'Repository ID',
        type: 'text',
        required: true,
      },
      { key: 'title', label: 'Request title', type: 'text', required: true },
      { key: 'description', label: 'Description', type: 'textarea' },
      { key: 'status', label: 'Status', type: 'text' },
      { key: 'requestedAt', label: 'Requested at (ISO)', type: 'text' },
      { key: 'resolvedAt', label: 'Resolved at (ISO)', type: 'text' },
    ],
  },
  {
    key: 'sprints',
    label: 'Sprints',
    icon: 'mdi-run-fast',
    idKey: 'id',
    titleKey: 'name',
    subtitleKeys: ['status', 'startDate', 'endDate'],
    fields: [
      { key: 'projectId', label: 'Project ID', type: 'text', required: true },
      { key: 'name', label: 'Sprint name', type: 'text', required: true },
      { key: 'goal', label: 'Goal', type: 'textarea' },
      { key: 'status', label: 'Status', type: 'text' },
      {
        key: 'startDate',
        label: 'Start date',
        type: 'text',
        placeholder: 'YYYY-MM-DD',
      },
      {
        key: 'endDate',
        label: 'End date',
        type: 'text',
        placeholder: 'YYYY-MM-DD',
      },
    ],
  },
]

const tabToEntityKind: Record<
  Extract<
    CrmAdminTab,
    'companies' | 'projects' | 'tasks' | 'taskRequests' | 'sprints'
  >,
  CrmGeneralEntityKind
> = {
  companies: 'companies',
  projects: 'projects',
  tasks: 'tasks',
  taskRequests: 'task-requests',
  sprints: 'sprints',
}

const entityCollections = reactive<
  Record<CrmGeneralEntityKind, Record<string, unknown>[]>
>({
  companies: [],
  projects: [],
  tasks: [],
  'task-requests': [],
  sprints: [],
})

const entityPending = reactive<Record<CrmGeneralEntityKind, boolean>>({
  companies: false,
  projects: false,
  tasks: false,
  'task-requests': false,
  sprints: false,
})

const { data: dashboardData, pending: dashboardPending } =
  await useFetch<CrmDashboardResponse>('/api/crm/general/dashboard')
const { data: billingsData, pending: billingsPending } = await useFetch<
  CrmGeneralCollectionResponse<Record<string, unknown>>
>('/api/crm/general/billings')
const { data: contactsData, pending: contactsPending } = await useFetch<
  CrmGeneralCollectionResponse<CrmContactItem>
>('/api/crm/general/contacts')
const { data: reportsData, pending: reportsPending } =
  await useFetch<CrmReportsResponse>('/api/crm/general/reports', {
    query: { format: 'json' },
  })

const adminTabs = [
  {
    value: 'dashboard',
    label: 'Dashboard',
    icon: 'mdi-view-dashboard-outline',
  },
  { value: 'companies', label: 'Companies', icon: 'mdi-domain' },
  { value: 'projects', label: 'Projects', icon: 'mdi-folder-outline' },
  { value: 'tasks', label: 'Tasks', icon: 'mdi-format-list-checks' },
  {
    value: 'taskRequests',
    label: 'Task requests',
    icon: 'mdi-file-document-edit-outline',
  },
  { value: 'sprints', label: 'Sprints', icon: 'mdi-run-fast' },
  { value: 'billings', label: 'Billings', icon: 'mdi-receipt-text-outline' },
  {
    value: 'contacts',
    label: 'Contacts',
    icon: 'mdi-account-box-multiple-outline',
  },
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

const activeEntityConfig = computed(() => {
  return (
    entityConfigs.find((config) => config.key === activeEntityKind.value) ??
    entityConfigs[0]
  )
})

const modalTitle = computed(() => {
  return modalMode.value === 'create'
    ? `Create ${activeEntityConfig.value.label}`
    : `Edit ${activeEntityConfig.value.label}`
})

function mapFieldType(fieldType: string) {
  return fieldType === 'number' ? 'number' : 'text'
}

function getEntityKindByTab(tab: string): CrmGeneralEntityKind {
  return tabToEntityKind[tab as keyof typeof tabToEntityKind]
}

function getConfigByTab(tab: string): CrmAdminEntityConfig {
  const kind = getEntityKindByTab(tab)
  return entityConfigs.find((config) => config.key === kind) ?? entityConfigs[0]
}

function getItemsByTab(tab: string): Record<string, unknown>[] {
  return entityCollections[getEntityKindByTab(tab)]
}

function isTabPending(tab: string) {
  return entityPending[getEntityKindByTab(tab)]
}

function getEntityKey(
  item: Record<string, unknown>,
  config: CrmAdminEntityConfig,
) {
  return String(item[config.idKey] ?? item[config.titleKey] ?? 'unknown-item')
}

function getEntityTitle(
  item: Record<string, unknown>,
  config: CrmAdminEntityConfig,
) {
  return String(item[config.titleKey] ?? item[config.idKey] ?? 'Untitled')
}

function getEntitySubtitle(
  item: Record<string, unknown>,
  config: CrmAdminEntityConfig,
) {
  return config.subtitleKeys
    .map((key) => item[key])
    .filter(
      (value) =>
        value !== undefined &&
        value !== null &&
        String(value).trim().length > 0,
    )
    .map((value) => String(value))
    .slice(0, 3)
    .join(' · ')
}

function sanitizeBody(config: CrmAdminEntityConfig): Record<string, unknown> {
  return config.fields.reduce<Record<string, unknown>>((acc, field) => {
    const value = formState[field.key]

    if (value === undefined || value === null || String(value).trim() === '') {
      return acc
    }

    acc[field.key] = field.type === 'number' ? Number(value) : value
    return acc
  }, {})
}

async function fetchEntityList(kind: CrmGeneralEntityKind) {
  entityPending[kind] = true

  try {
    const response = await $fetch<
      CrmGeneralCollectionResponse<Record<string, unknown>>
    >(`/api/crm/general/${kind}`)

    entityCollections[kind] = response.items ?? []
  } catch {
    entityCollections[kind] = []
  } finally {
    entityPending[kind] = false
  }
}

async function refreshAllCrudLists() {
  await Promise.all(entityConfigs.map((config) => fetchEntityList(config.key)))
}

function initializeForm(
  config: CrmAdminEntityConfig,
  item?: Record<string, unknown>,
) {
  config.fields.forEach((field) => {
    const rawValue = item?.[field.key]
    formState[field.key] =
      rawValue === undefined || rawValue === null ? '' : String(rawValue)
  })
}

function openCreateDialog(kind: CrmGeneralEntityKind) {
  const config = entityConfigs.find((candidate) => candidate.key === kind)

  if (!config) return

  activeEntityKind.value = kind
  modalMode.value = 'create'
  editingEntityId.value = ''
  submitError.value = null
  initializeForm(config)
  modalOpen.value = true
}

function openEditDialog(
  kind: CrmGeneralEntityKind,
  item: Record<string, unknown>,
) {
  const config = entityConfigs.find((candidate) => candidate.key === kind)

  if (!config) return

  const entityId = item[config.idKey]

  if (!entityId) return

  activeEntityKind.value = kind
  modalMode.value = 'edit'
  editingEntityId.value = String(entityId)
  submitError.value = null
  initializeForm(config, item)
  modalOpen.value = true
}

async function submitCrudForm() {
  const config = activeEntityConfig.value
  const payload = sanitizeBody(config)

  if (config.fields.some((field) => field.required && !payload[field.key])) {
    submitError.value = 'Merci de remplir tous les champs obligatoires.'
    return
  }

  modalPending.value = true
  submitError.value = null

  try {
    const endpoint =
      modalMode.value === 'create'
        ? `/api/crm/general/${config.key}`
        : `/api/crm/general/${config.key}/${editingEntityId.value}`

    const method = modalMode.value === 'create' ? 'POST' : 'PATCH'

    await $fetch<CrmGeneralMutationResponse<Record<string, unknown>>>(
      endpoint,
      {
        method,
        body: payload,
      },
    )

    await fetchEntityList(config.key)

    toastColor.value = 'success'
    toastMessage.value =
      modalMode.value === 'create'
        ? `${config.label} created successfully`
        : `${config.label} updated successfully`
    toastVisible.value = true
    modalOpen.value = false
  } catch (error) {
    submitError.value =
      error instanceof Error
        ? error.message
        : 'Impossible de sauvegarder les données.'
    toastColor.value = 'error'
    toastMessage.value = 'Action failed. Please retry.'
    toastVisible.value = true
  } finally {
    modalPending.value = false
  }
}

async function deleteEntity(
  kind: CrmGeneralEntityKind,
  item: Record<string, unknown>,
) {
  const config = entityConfigs.find((candidate) => candidate.key === kind)

  if (!config) return

  const entityId = item[config.idKey]

  if (!entityId) return

  try {
    await $fetch(`/api/crm/general/${kind}/${String(entityId)}`, {
      method: 'DELETE',
    })

    await fetchEntityList(kind)

    toastColor.value = 'success'
    toastMessage.value = `${config.label} deleted successfully`
    toastVisible.value = true
  } catch {
    toastColor.value = 'error'
    toastMessage.value = `Unable to delete ${config.label}`
    toastVisible.value = true
  }
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function formatMoney(value: number) {
  return new Intl.NumberFormat(locale.value, {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value)
}

await refreshAllCrudLists()
</script>

<template>
  <div>
    <WorldModuleDrawers
      module-title="CRM"
      module-icon="mdi-account-group-outline"
      module-description="Admin CRM: CRUD companies/projects/tasks/task-requests/sprints + dashboard & reports."
      :nav-items="crmNavItems"
      action-label="Refresh CRM data"
      action-icon="mdi-refresh"
      @action="refreshAllCrudLists"
    />

    <v-container fluid>
      <v-card rounded="xl" class="pa-4 mb-4 postcard-gradient-card">
        <h2 class="text-h5 mb-2">CRM Admin center</h2>
        <p class="text-body-2 text-medium-emphasis mb-0">
          Vue centralisée des endpoints CRM avec actions create / patch / delete
          pour les entités clés.
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
          <v-alert
            v-if="dashboardPending"
            type="info"
            variant="tonal"
            class="mb-4"
          >
            Chargement du dashboard CRM...
          </v-alert>
          <v-row v-else>
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
        </v-window-item>

        <v-window-item
          v-for="tab in [
            'companies',
            'projects',
            'tasks',
            'taskRequests',
            'sprints',
          ]"
          :key="tab"
          :value="tab"
        >
          <div
            class="d-flex align-center justify-space-between mb-4 flex-wrap ga-2"
          >
            <div>
              <h3 class="text-h6 mb-1">{{ getConfigByTab(tab).label }}</h3>
              <p class="text-body-2 text-medium-emphasis mb-0">
                Administration rapide avec formulaires structurés et actions
                CRUD.
              </p>
            </div>
            <v-btn
              color="primary"
              prepend-icon="mdi-plus"
              @click="openCreateDialog(getEntityKindByTab(tab))"
            >
              Create
            </v-btn>
          </div>

          <v-alert
            v-if="isTabPending(tab)"
            type="info"
            variant="tonal"
            class="mb-4"
          >
            Chargement en cours...
          </v-alert>

          <v-row v-else>
            <v-col
              v-for="item in getItemsByTab(tab)"
              :key="getEntityKey(item, getConfigByTab(tab))"
              cols="12"
              md="6"
              xl="4"
            >
              <v-card rounded="xl" class="pa-4 postcard-gradient-card h-100">
                <div class="d-flex justify-space-between align-start mb-3 ga-2">
                  <div>
                    <p class="text-subtitle-1 mb-1 font-weight-bold">
                      {{ getEntityTitle(item, getConfigByTab(tab)) }}
                    </p>
                    <p class="text-body-2 text-medium-emphasis mb-0">
                      {{
                        getEntitySubtitle(item, getConfigByTab(tab)) ||
                        'No metadata'
                      }}
                    </p>
                  </div>
                  <v-chip size="small" color="primary" variant="tonal">
                    {{ String(item[getConfigByTab(tab).idKey] ?? 'n/a') }}
                  </v-chip>
                </div>

                <v-divider class="mb-3" />

                <div class="d-flex ga-2">
                  <v-btn
                    color="primary"
                    variant="tonal"
                    prepend-icon="mdi-pencil-outline"
                    @click="openEditDialog(getEntityKindByTab(tab), item)"
                  >
                    Edit
                  </v-btn>
                  <v-btn
                    color="error"
                    variant="tonal"
                    prepend-icon="mdi-delete-outline"
                    @click="deleteEntity(getEntityKindByTab(tab), item)"
                  >
                    Delete
                  </v-btn>
                </div>
              </v-card>
            </v-col>

            <v-col v-if="getItemsByTab(tab).length === 0" cols="12">
              <v-alert type="info" variant="tonal">
                Aucun enregistrement trouvé pour cet endpoint.
              </v-alert>
            </v-col>
          </v-row>
        </v-window-item>

        <v-window-item value="billings">
          <v-alert
            v-if="billingsPending"
            type="info"
            variant="tonal"
            class="mb-4"
          >
            Chargement des billings...
          </v-alert>
          <v-row v-else>
            <v-col cols="12" md="6">
              <v-card rounded="xl" class="pa-4 postcard-gradient-card">
                <p class="text-caption text-medium-emphasis mb-1">
                  Billing items
                </p>
                <p class="text-h5 mb-0">
                  {{ billingsData?.items?.length ?? 0 }}
                </p>
              </v-card>
            </v-col>
            <v-col cols="12" md="6">
              <v-card rounded="xl" class="pa-4 postcard-gradient-card">
                <p class="text-caption text-medium-emphasis mb-1">
                  Reports billings count
                </p>
                <p class="text-h5 mb-0">
                  {{ reportsData?.counts?.billings ?? 0 }}
                </p>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>

        <v-window-item value="contacts">
          <v-alert
            v-if="contactsPending"
            type="info"
            variant="tonal"
            class="mb-4"
          >
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
                  <v-chip color="secondary" size="small" variant="tonal"
                    >Score {{ contact.score }}</v-chip
                  >
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
          <v-alert
            v-if="reportsPending"
            type="info"
            variant="tonal"
            class="mb-4"
          >
            Chargement des reports...
          </v-alert>
          <template v-else>
            <v-row class="mb-2">
              <v-col cols="12" sm="6" lg="3">
                <v-card rounded="xl" class="pa-4 postcard-gradient-card">
                  <p class="text-caption text-medium-emphasis mb-1">Pipeline</p>
                  <p class="text-h6 mb-0">
                    {{ formatMoney(reportsData?.kpis?.pipeline ?? 0) }}
                  </p>
                </v-card>
              </v-col>
              <v-col cols="12" sm="6" lg="3">
                <v-card rounded="xl" class="pa-4 postcard-gradient-card">
                  <p class="text-caption text-medium-emphasis mb-1">
                    Deals won
                  </p>
                  <p class="text-h6 mb-0">
                    {{ reportsData?.kpis?.dealsWon ?? 0 }}
                  </p>
                </v-card>
              </v-col>
              <v-col cols="12" sm="6" lg="3">
                <v-card rounded="xl" class="pa-4 postcard-gradient-card">
                  <p class="text-caption text-medium-emphasis mb-1">
                    Cycle days
                  </p>
                  <p class="text-h6 mb-0">
                    {{ reportsData?.kpis?.cycleDays ?? 0 }}
                  </p>
                </v-card>
              </v-col>
              <v-col cols="12" sm="6" lg="3">
                <v-card rounded="xl" class="pa-4 postcard-gradient-card">
                  <p class="text-caption text-medium-emphasis mb-1">
                    NPS clients
                  </p>
                  <p class="text-h6 mb-0">
                    {{ reportsData?.kpis?.npsClients ?? 0 }}
                  </p>
                </v-card>
              </v-col>
            </v-row>

            <v-card rounded="xl" class="pa-4 postcard-gradient-card mb-4">
              <p class="text-caption text-medium-emphasis mb-1">Metadata</p>
              <p class="text-body-2 mb-1">
                Period: {{ reportsData?.metadata?.period ?? '—' }}
              </p>
              <p class="text-body-2 mb-1">
                Timezone: {{ reportsData?.metadata?.timezone ?? '—' }}
              </p>
              <p class="text-body-2 mb-0">
                Generated:
                {{
                  formatDateTime(
                    reportsData?.metadata?.generatedAt ??
                      new Date().toISOString(),
                  )
                }}
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
                    <v-chip size="small" color="warning" variant="outlined">{{
                      action.priority
                    }}</v-chip>
                    <span class="text-caption text-medium-emphasis"
                      >ETA {{ action.etaDays }} jours</span
                    >
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

    <AppModal v-model="modalOpen" :title="modalTitle" :max-width="720">
      <v-alert v-if="submitError" type="error" variant="tonal" class="mb-4">
        {{ submitError }}
      </v-alert>

      <v-row>
        <v-col
          v-for="field in activeEntityConfig.fields"
          :key="field.key"
          cols="12"
          :md="field.type === 'textarea' ? 12 : 6"
        >
          <v-textarea
            v-if="field.type === 'textarea'"
            v-model="formState[field.key]"
            :label="field.label"
            :placeholder="field.placeholder"
            :required="field.required"
            variant="outlined"
            rows="3"
          />

          <v-text-field
            v-else
            v-model="formState[field.key]"
            :label="field.label"
            :placeholder="field.placeholder"
            :required="field.required"
            :type="mapFieldType(field.type)"
            variant="outlined"
          />
        </v-col>
      </v-row>

      <template #actions>
        <v-spacer />
        <v-btn
          variant="text"
          :disabled="modalPending"
          @click="modalOpen = false"
          >Cancel</v-btn
        >
        <v-btn color="primary" :loading="modalPending" @click="submitCrudForm">
          {{ modalMode === 'create' ? 'Create' : 'Update' }}
        </v-btn>
      </template>
    </AppModal>

    <v-snackbar v-model="toastVisible" :color="toastColor" timeout="3500">
      {{ toastMessage }}
    </v-snackbar>
  </div>
</template>
