<script setup lang="ts">
import { useWorldCrmAdminNavItems } from '~/composables/useWorldCrmAdminNavItems'
import type {
  CrmGeneralCollectionResponse,
  CrmGeneralMutationResponse,
} from '~/types/world/crmGeneral'
import type { CrmEndpointCatalogResponse } from '~/types/world/crmEndpoints'

const props = defineProps<{
  section:
    | 'companies'
    | 'projects'
    | 'tasks'
    | 'task-requests'
    | 'sprints'
    | 'billings'
    | 'contacts'
    | 'employees'
}>()

type SectionKey =
  | 'companies'
  | 'projects'
  | 'tasks'
  | 'task-requests'
  | 'sprints'
  | 'billings'
  | 'contacts'
  | 'employees'
type GenericItem = Record<string, unknown>

type FieldType = 'text' | 'email' | 'number' | 'url' | 'textarea' | 'datetime'

interface SectionField {
  key: string
  label: string
  type: FieldType
  required?: boolean
}

interface EndpointAction {
  id: string
  title: string
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  path: string
  defaultBody?: Record<string, unknown>
}

const router = useRouter()
const { t } = useI18n()
const { crmNavItems } = useWorldCrmNavItems()
const { adminRightNavItems } = useWorldCrmAdminNavItems()

const sectionMap = {
  companies: { title: 'Companies', icon: 'mdi-domain', endpoint: 'companies' },
  projects: {
    title: 'Projects',
    icon: 'mdi-folder-outline',
    endpoint: 'projects',
  },
  tasks: { title: 'Tasks', icon: 'mdi-format-list-checks', endpoint: 'tasks' },
  'task-requests': {
    title: 'Task requests',
    icon: 'mdi-file-document-edit-outline',
    endpoint: 'task-requests',
  },
  sprints: { title: 'Sprints', icon: 'mdi-run-fast', endpoint: 'sprints' },
  billings: {
    title: 'Billings',
    icon: 'mdi-receipt-text-outline',
    endpoint: 'billings',
  },
  contacts: {
    title: 'Contacts',
    icon: 'mdi-account-box-multiple-outline',
    endpoint: 'contacts',
  },
  employees: {
    title: 'Employees',
    icon: 'mdi-account-tie-outline',
    endpoint: 'employees',
  },
} as const

const sectionFields: Record<SectionKey, SectionField[]> = {
  companies: [
    { key: 'crmId', label: 'CRM ID', type: 'text', required: true },
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'industry', label: 'Industry', type: 'text' },
    { key: 'website', label: 'Website', type: 'url' },
    { key: 'contactEmail', label: 'Contact email', type: 'email' },
    { key: 'phone', label: 'Phone', type: 'text' },
  ],
  projects: [
    { key: 'companyId', label: 'Company', type: 'text', required: true },
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'code', label: 'Code', type: 'text' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'status', label: 'Status', type: 'text' },
    { key: 'startedAt', label: 'Started at', type: 'datetime' },
    { key: 'dueAt', label: 'Due at', type: 'datetime' },
  ],
  tasks: [
    { key: 'projectId', label: 'Project', type: 'text', required: true },
    { key: 'sprintId', label: 'Sprint', type: 'text' },
    { key: 'parentTaskId', label: 'Parent task', type: 'text' },
    { key: 'title', label: 'Title', type: 'text', required: true },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'status', label: 'Status', type: 'text' },
    { key: 'priority', label: 'Priority', type: 'text' },
    { key: 'dueAt', label: 'Due at', type: 'datetime' },
    { key: 'estimatedHours', label: 'Estimated hours', type: 'number' },
  ],
  'task-requests': [
    { key: 'taskId', label: 'Task', type: 'text', required: true },
    { key: 'repositoryId', label: 'Repository ID', type: 'text' },
    { key: 'title', label: 'Title', type: 'text', required: true },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'status', label: 'Status', type: 'text' },
    { key: 'requestedAt', label: 'Requested at', type: 'datetime' },
    { key: 'resolvedAt', label: 'Resolved at', type: 'datetime' },
  ],
  sprints: [
    { key: 'projectId', label: 'Project', type: 'text', required: true },
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'goal', label: 'Goal', type: 'textarea' },
    { key: 'status', label: 'Status', type: 'text' },
    { key: 'startDate', label: 'Start date', type: 'datetime' },
    { key: 'endDate', label: 'End date', type: 'datetime' },
  ],
  billings: [
    { key: 'companyId', label: 'Company', type: 'text', required: true },
    { key: 'label', label: 'Label', type: 'text', required: true },
    { key: 'amount', label: 'Amount', type: 'number', required: true },
    { key: 'currency', label: 'Currency', type: 'text', required: true },
    { key: 'status', label: 'Status', type: 'text' },
    { key: 'dueAt', label: 'Due at', type: 'datetime' },
    { key: 'paidAt', label: 'Paid at', type: 'datetime' },
  ],
  contacts: [],
  employees: [
    { key: 'firstName', label: 'First name', type: 'text', required: true },
    { key: 'lastName', label: 'Last name', type: 'text', required: true },
    { key: 'email', label: 'Email', type: 'email', required: true },
    { key: 'userId', label: 'User ID', type: 'text', required: true },
    { key: 'positionName', label: 'Position', type: 'text' },
    { key: 'roleName', label: 'Role', type: 'text' },
    { key: 'photo', label: 'Photo URL', type: 'url' },
  ],
}

const relationConfig: Record<string, keyof typeof sectionMap> = {
  companyId: 'companies',
  projectId: 'projects',
  sprintId: 'sprints',
  taskId: 'tasks',
  parentTaskId: 'tasks',
}

const pathParamSection: Record<string, keyof typeof sectionMap> = {
  company: 'companies',
  project: 'projects',
  sprint: 'sprints',
  task: 'tasks',
  taskRequest: 'task-requests',
  billing: 'billings',
  contact: 'contacts',
  subtask: 'tasks',
}

const search = ref('')
const currentPage = ref(1)
const itemsPerPage = 12

const createDialog = ref(false)
const editDialog = ref(false)
const showDialog = ref(false)
const nestedDialog = ref(false)
const apiActionDialog = ref(false)
const deletePendingId = ref<string | null>(null)

const currentItem = ref<GenericItem | null>(null)
const nestedValue = ref<unknown>(null)
const nestedTitle = ref('Details')

const formModel = ref<Record<string, unknown>>({})
const formPending = ref(false)
const formError = ref('')

const actionParamValues = reactive<Record<string, string>>({})
const actionBody = ref('{}')
const actionPending = ref(false)
const actionFeedback = ref('')
const selectedAction = ref<EndpointAction | null>(null)

const sectionConfig = computed(() => sectionMap[props.section])

const endpoint = computed(
  () => `/api/crm/general/${sectionConfig.value.endpoint}`,
)
const fetchKey = computed(
  () => `crm-admin-section-${sectionConfig.value.endpoint}`,
)

const { data, pending, error, refresh } = useFetch<
  CrmGeneralCollectionResponse<GenericItem>
>(endpoint, {
  key: fetchKey,
  watch: [endpoint],
})

const { data: endpointCatalog, pending: endpointCatalogPending } =
  useFetch<CrmEndpointCatalogResponse>('/api/world/crm/endpoints')

const isLoading = computed(() => pending.value || endpointCatalogPending.value)

const relationCache = reactive<Partial<Record<SectionKey, GenericItem[]>>>({})

const rawActions = computed(
  () =>
    endpointCatalog.value?.groups?.find((group) => group.key === props.section)
      ?.endpoints ?? [],
)

const createAction = computed(
  () =>
    rawActions.value.find(
      (action) => action.method === 'POST' && action.path === endpoint.value,
    ) ?? null,
)
const updateAction = computed(
  () =>
    rawActions.value.find(
      (action) =>
        action.method === 'PATCH' &&
        action.path.startsWith(`${endpoint.value}/`) &&
        pathParams(action.path).length === 1,
    ) ?? null,
)
const deleteAction = computed(
  () =>
    rawActions.value.find(
      (action) =>
        action.method === 'DELETE' &&
        action.path.startsWith(`${endpoint.value}/`) &&
        pathParams(action.path).length === 1,
    ) ?? null,
)

const extraItemActions = computed<EndpointAction[]>(() =>
  rawActions.value.filter((action) => {
    if (
      action.id === createAction.value?.id ||
      action.id === updateAction.value?.id ||
      action.id === deleteAction.value?.id
    ) {
      return false
    }
    return action.path.includes('{')
  }),
)

const filteredItems = computed(() => {
  const query = search.value.trim().toLowerCase()
  const items = data.value?.items ?? []

  if (!query) return items

  return items.filter((item) =>
    Object.values(item)
      .filter((value) => typeof value !== 'object' && value !== null)
      .some((value) => String(value).toLowerCase().includes(query)),
  )
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredItems.value.length / itemsPerPage)),
)

const paginatedItems = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredItems.value.slice(start, start + itemsPerPage)
})

const formFields = computed(() => sectionFields[props.section])

watch([search, filteredItems], () => {
  currentPage.value = 1
})

watch(
  () => props.section,
  () => {
    search.value = ''
    currentPage.value = 1
  },
)

function itemKey(item: Record<string, unknown>) {
  return String(item.id ?? item.crmId ?? JSON.stringify(item))
}

function itemTitle(item: Record<string, unknown>) {
  return String(
    item.name ?? item.title ?? item.label ?? item.id ?? 'Sans titre',
  )
}

function previewEntries(item: Record<string, unknown>) {
  return Object.entries(item)
    .filter(([key, value]) => key !== 'id' && value !== null)
    .slice(0, 5)
}

function isComplexValue(value: unknown) {
  return typeof value === 'object' && value !== null
}

function formatPrimitive(value: unknown) {
  if (value === null || value === undefined) return '—'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  return String(value)
}

function getItemId(item: GenericItem) {
  const value = item.id ?? item.crmId
  return value ? String(value) : ''
}

function resetForm(item?: GenericItem) {
  formError.value = ''
  formModel.value = {}

  for (const field of formFields.value) {
    const value = item?.[field.key]
    formModel.value[field.key] = value === undefined ? '' : value
  }
}

async function loadRelationOptions(fieldKey: string) {
  const relationSection = relationConfig[fieldKey]
  if (!relationSection) return
  if (relationCache[relationSection]) return

  const response = await $fetch<CrmGeneralCollectionResponse<GenericItem>>(
    `/api/crm/general/${sectionMap[relationSection].endpoint}`,
  )
  relationCache[relationSection] = response.items ?? []
}

const relationOptions = computed(() => (fieldKey: string) => {
  const relationSection = relationConfig[fieldKey]
  if (!relationSection) return []

  const items = relationCache[relationSection] ?? []
  return items.map((item) => ({
    title: itemTitle(item),
    value: getItemId(item),
  }))
})

function openCreateDialog() {
  resetForm(createAction.value?.defaultBody)
  createDialog.value = true

  for (const field of formFields.value) {
    loadRelationOptions(field.key)
  }
}

function openEditDialog(item: GenericItem) {
  currentItem.value = item
  resetForm(item)
  editDialog.value = true

  for (const field of formFields.value) {
    loadRelationOptions(field.key)
  }
}

function openShowDialog(item: GenericItem) {
  currentItem.value = item
  showDialog.value = true
}

function openNested(value: unknown, key: string) {
  nestedTitle.value = key
  nestedValue.value = value
  nestedDialog.value = true
}

function pathParams(path: string) {
  return Array.from(path.matchAll(/\{([^}]+)\}/g))
    .map((match) => match[1] ?? '')
    .filter(Boolean)
}

function paramOptions(param: string) {
  const relationSection = pathParamSection[param]
  if (!relationSection) return []

  const items = relationCache[relationSection] ?? []
  return items.map((item) => ({
    title: itemTitle(item),
    value: getItemId(item),
  }))
}

async function loadParamContext(path: string) {
  const params = pathParams(path)
  for (const param of params) {
    const relationSection = pathParamSection[param]
    if (!relationSection || relationCache[relationSection]) continue
    const response = await $fetch<CrmGeneralCollectionResponse<GenericItem>>(
      `/api/crm/general/${sectionMap[relationSection].endpoint}`,
    )
    relationCache[relationSection] = response.items ?? []
  }
}

function resolvePath(path: string, payload: Record<string, string>) {
  return path.replace(/\{([^}]+)\}/g, (_, key: string) =>
    encodeURIComponent(payload[key] ?? ''),
  )
}

async function submitCreate() {
  if (!createAction.value) return

  formPending.value = true
  formError.value = ''

  try {
    await $fetch<CrmGeneralMutationResponse<GenericItem>>(endpoint.value, {
      method: 'POST',
      body: formModel.value,
    })
    createDialog.value = false
    await refresh()
  } catch (err) {
    formError.value =
      err instanceof Error ? err.message : 'Unable to create item.'
  } finally {
    formPending.value = false
  }
}

async function submitEdit() {
  if (!currentItem.value || !updateAction.value) return

  formPending.value = true
  formError.value = ''

  try {
    await $fetch<CrmGeneralMutationResponse<GenericItem>>(
      `${endpoint.value}/${getItemId(currentItem.value)}`,
      {
        method: 'PATCH',
        body: formModel.value,
      },
    )
    editDialog.value = false
    await refresh()
  } catch (err) {
    formError.value =
      err instanceof Error ? err.message : 'Unable to update item.'
  } finally {
    formPending.value = false
  }
}

async function submitDelete(item: GenericItem) {
  if (!deleteAction.value) return

  const itemId = getItemId(item)
  deletePendingId.value = itemId
  try {
    await $fetch(`${endpoint.value}/${itemId}`, { method: 'DELETE' })
    if (currentItem.value && getItemId(currentItem.value) === itemId) {
      showDialog.value = false
    }
    await refresh()
  } finally {
    deletePendingId.value = null
  }
}

function openActionDialog(action: EndpointAction, item: GenericItem) {
  selectedAction.value = action
  actionFeedback.value = ''
  currentItem.value = item
  actionBody.value = JSON.stringify(action.defaultBody ?? {}, null, 2)

  for (const param of pathParams(action.path)) {
    actionParamValues[param] = ''
  }

  const currentId = getItemId(item)
  const currentParam = Object.keys(pathParamSection).find(
    (key) => pathParamSection[key] === props.section,
  )
  if (currentParam && currentId) {
    actionParamValues[currentParam] = currentId
  }

  loadParamContext(action.path)
  apiActionDialog.value = true
}

async function submitApiAction() {
  if (!selectedAction.value) return

  actionPending.value = true
  actionFeedback.value = ''

  try {
    const body = ['POST', 'PUT', 'PATCH'].includes(selectedAction.value.method)
      ? JSON.parse(actionBody.value || '{}')
      : undefined

    const path = resolvePath(selectedAction.value.path, actionParamValues)
    const response = await $fetch(path, {
      method: selectedAction.value.method,
      body,
    })

    actionFeedback.value = `Action executed successfully.${response ? ' Response received.' : ''}`
    await refresh()
  } catch (err) {
    actionFeedback.value = err instanceof Error ? err.message : 'Action failed.'
  } finally {
    actionPending.value = false
  }
}
</script>

<template>
  <div>
    <WorldModuleShell
      :module-title="t('world.crm.label')"
      module-key="crm"
      module-path="/world/crm"
      module-icon="mdi-account-group-outline"
      :module-description="`Admin ${sectionConfig.title}`"
      :nav-items="crmNavItems"
      action-label="Refresh"
      action-icon="mdi-refresh"
      @action="refresh"
    >
      <template #right>
        <v-list density="comfortable" bg-color="transparent" nav>
          <v-list-item
            v-for="item in adminRightNavItems"
            :key="item.to"
            :prepend-icon="item.icon"
            :title="item.title"
            :to="item.to"
            rounded="lg"
            color="primary"
          />
        </v-list>
      </template>
    </WorldModuleShell>

    <v-container fluid>
      <div
        class="d-flex align-center justify-space-between mb-4 ga-3 flex-wrap"
      >
        <div class="d-flex align-center ga-2">
          <v-btn
            icon="mdi-arrow-left"
            variant="text"
            @click="router.push('/world/crm/admin')"
          />
          <h2 class="text-h5 mb-0">{{ sectionConfig.title }}</h2>
        </div>

        <v-btn
          v-if="createAction"
          color="primary"
          prepend-icon="mdi-plus"
          @click="openCreateDialog"
        >
          New
        </v-btn>
      </div>

      <v-text-field
        v-model="search"
        class="mb-4"
        prepend-inner-icon="mdi-magnify"
        :label="`Search in ${sectionConfig.title}`"
        clearable
        variant="outlined"
        :disabled="isLoading"
      />

      <CrmPageSkeleton v-if="isLoading" variant="list" :cards="6" />
      <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4">
        Error while loading.
      </v-alert>

      <v-row v-else>
        <v-col
          v-for="item in paginatedItems"
          :key="itemKey(item)"
          cols="12"
          md="6"
          xl="4"
        >
          <v-card rounded="xl" class="pa-4 postcard-gradient-card h-100">
            <div class="d-flex align-start justify-space-between ga-2 mb-3">
              <h3 class="text-subtitle-1 mb-0">{{ itemTitle(item) }}</h3>
              <v-chip size="small" color="primary" variant="tonal">{{
                item.id ?? 'n/a'
              }}</v-chip>
            </div>

            <p
              v-for="[key, value] in previewEntries(item)"
              :key="key"
              class="text-body-2 mb-1"
            >
              <template v-if="isComplexValue(value)">
                <span class="font-weight-medium">{{ key }}:</span>
                <v-btn
                  size="x-small"
                  variant="tonal"
                  class="ml-1"
                  @click="openNested(value, key)"
                >
                  View JSON
                </v-btn>
              </template>
              <template v-else>
                <span class="font-weight-medium">{{ key }}:</span>
                {{ formatPrimitive(value) }}
              </template>
            </p>

            <div class="d-flex flex-wrap ga-2 mt-4">
              <v-btn
                size="small"
                variant="tonal"
                prepend-icon="mdi-eye-outline"
                @click="openShowDialog(item)"
              >
                Show
              </v-btn>
              <v-btn
                v-if="updateAction"
                size="small"
                variant="tonal"
                color="info"
                prepend-icon="mdi-pencil-outline"
                @click="openEditDialog(item)"
              >
                Edit
              </v-btn>
              <v-btn
                v-if="deleteAction"
                size="small"
                variant="tonal"
                color="error"
                prepend-icon="mdi-delete-outline"
                :loading="deletePendingId === getItemId(item)"
                @click="submitDelete(item)"
              >
                Delete
              </v-btn>
            </div>

            <div
              v-if="extraItemActions.length"
              class="d-flex flex-wrap ga-2 mt-2"
            >
              <v-btn
                v-for="action in extraItemActions"
                :key="action.id"
                size="x-small"
                variant="outlined"
                @click="openActionDialog(action, item)"
              >
                {{ action.method }} · {{ action.title }}
              </v-btn>
            </div>
          </v-card>
        </v-col>

        <v-col v-if="paginatedItems.length === 0" cols="12">
          <v-alert type="info" variant="tonal">No results.</v-alert>
        </v-col>
      </v-row>

      <div v-if="totalPages > 1" class="d-flex justify-center mt-6">
        <WorldPagination
          v-model="currentPage"
          :length="totalPages"
        />
      </div>
    </v-container>

    <AppModal
      v-model="createDialog"
      :title="`New ${sectionConfig.title.slice(0, -1)}`"
      :max-width="840"
    >
      <v-alert v-if="formError" type="error" variant="tonal" class="mb-3">{{
        formError
      }}</v-alert>
      <v-row>
        <v-col v-for="field in formFields" :key="field.key" cols="12" md="6">
          <AppSelect
            v-if="relationConfig[field.key]"
            v-model="formModel[field.key]"
            :items="relationOptions(field.key)"
            item-title="title"
            item-value="value"
            :label="field.label"
            clearable
          />
          <v-textarea
            v-else-if="field.type === 'textarea'"
            v-model="formModel[field.key]"
            :label="field.label"
            variant="outlined"
            rows="3"
          />
          <v-text-field
            v-else
            v-model="formModel[field.key]"
            :label="field.label"
            variant="outlined"
            :type="field.type === 'datetime' ? 'datetime-local' : field.type"
          />
        </v-col>
      </v-row>
      <template #actions>
        <v-spacer />
        <v-btn variant="text" @click="createDialog = false">Cancel</v-btn>
        <v-btn color="primary" :loading="formPending" @click="submitCreate"
          >Create</v-btn
        >
      </template>
    </AppModal>

    <AppModal
      v-model="editDialog"
      :title="`Edit ${sectionConfig.title.slice(0, -1)}`"
      :max-width="840"
    >
      <v-alert v-if="formError" type="error" variant="tonal" class="mb-3">{{
        formError
      }}</v-alert>
      <v-row>
        <v-col v-for="field in formFields" :key="field.key" cols="12" md="6">
          <AppSelect
            v-if="relationConfig[field.key]"
            v-model="formModel[field.key]"
            :items="relationOptions(field.key)"
            item-title="title"
            item-value="value"
            :label="field.label"
            clearable
          />
          <v-textarea
            v-else-if="field.type === 'textarea'"
            v-model="formModel[field.key]"
            :label="field.label"
            variant="outlined"
            rows="3"
          />
          <v-text-field
            v-else
            v-model="formModel[field.key]"
            :label="field.label"
            variant="outlined"
            :type="field.type === 'datetime' ? 'datetime-local' : field.type"
          />
        </v-col>
      </v-row>
      <template #actions>
        <v-spacer />
        <v-btn variant="text" @click="editDialog = false">Cancel</v-btn>
        <v-btn color="primary" :loading="formPending" @click="submitEdit"
          >Save</v-btn
        >
      </template>
    </AppModal>

    <AppModal v-model="showDialog" title="Details" :max-width="900">
      <v-row v-if="currentItem">
        <v-col
          v-for="[key, value] in Object.entries(currentItem)"
          :key="key"
          cols="12"
          md="6"
        >
          <v-card variant="tonal" class="pa-3 h-100">
            <p class="text-caption text-medium-emphasis mb-1">{{ key }}</p>
            <template v-if="isComplexValue(value)">
              <v-btn
                size="small"
                variant="outlined"
                @click="openNested(value, key)"
                >{{ t('world.crm.admin.actions.viewContent') }}</v-btn
              >
            </template>
            <template v-else>
              <p class="text-body-2 mb-0">{{ formatPrimitive(value) }}</p>
            </template>
          </v-card>
        </v-col>
      </v-row>
      <template #actions>
        <v-spacer />
        <v-btn color="primary" variant="tonal" @click="showDialog = false"
          >Close</v-btn
        >
      </template>
    </AppModal>

    <AppModal v-model="nestedDialog" :title="nestedTitle" :max-width="980">
      <v-sheet
        class="pa-3 rounded-lg bg-grey-darken-4 overflow-auto"
        min-height="120"
      >
        <pre class="text-body-2 mb-0">{{
          JSON.stringify(nestedValue, null, 2)
        }}</pre>
      </v-sheet>
    </AppModal>

    <AppModal
      v-model="apiActionDialog"
      :title="
        selectedAction
          ? `${selectedAction.method} · ${selectedAction.title}`
          : 'Action API'
      "
      :max-width="900"
    >
      <div v-if="selectedAction" class="d-flex flex-column ga-3">
        <v-alert type="info" variant="tonal">{{ selectedAction.path }}</v-alert>

        <v-row>
          <v-col
            v-for="param in pathParams(selectedAction.path)"
            :key="param"
            cols="12"
            md="6"
          >
            <AppSelect
              v-if="paramOptions(param).length"
              v-model="actionParamValues[param]"
              :items="paramOptions(param)"
              :label="param"
              item-title="title"
              item-value="value"
            />
            <v-text-field
              v-else
              v-model="actionParamValues[param]"
              :label="param"
              variant="outlined"
            />
          </v-col>
        </v-row>

        <v-textarea
          v-if="['POST', 'PUT', 'PATCH'].includes(selectedAction.method)"
          v-model="actionBody"
          label="JSON body"
          variant="outlined"
          rows="7"
          auto-grow
        />

        <v-alert v-if="actionFeedback" type="info" variant="tonal">{{
          actionFeedback
        }}</v-alert>
      </div>

      <template #actions>
        <v-spacer />
        <v-btn variant="text" @click="apiActionDialog = false">Cancel</v-btn>
        <v-btn color="primary" :loading="actionPending" @click="submitApiAction"
          >Execute</v-btn
        >
      </template>
    </AppModal>
  </div>
</template>
