<script setup lang="ts">
import type {
  ApiListResponse,
  CrmIdResponse,
  CrmTaskItem,
  CrmTaskRequestCreatePayload,
  CrmTaskRequestItem,
} from '~~/server/types/api/crm-general'

const router = useRouter()
const { t } = useI18n()
const { crmNavItems } = useWorldCrmNavItems()
const { sessionUser } = useCrmPermissions()
definePageMeta({ layout: 'crm', title: 'CRM Task Requests' })

const isRootAdmin = computed(() =>
  (sessionUser.value?.roles ?? []).includes('ROLE_ROOT'),
)
const isAdminOrRoot = computed(() => {
  const roles = sessionUser.value?.roles ?? []
  return roles.includes('ROLE_ROOT') || roles.includes('ROLE_ADMIN')
})

const createDialog = ref(false)
const pendingDelete = ref(false)
const deleteDialog = ref(false)
const requestToDelete = ref<string | null>(null)
const taskModalOpen = ref(false)
const taskModalLoading = ref(false)
const search = ref('')
const statusFilter = ref<string | null>(null)
const repositoryFilter = ref<string | null>(null)
const taskFilter = ref<string | null>(null)
const taskRequestFilter = ref<string | null>(null)
const requestedAfter = ref<string | null>(null)
const resolvedBefore = ref<string | null>(null)
const currentPage = ref(1)
const itemsPerPage = 9
const selectedTask = ref<CrmTaskItem | null>(null)
const payload = reactive<CrmTaskRequestCreatePayload>({
  taskId: '',
  repositoryId: '',
  title: '',
  description: '',
  status: 'pending',
})
const crmReferencesStore = useCrmReferenceOptionsStore()

const { data, pending, error, refresh } = useFetch<
  ApiListResponse<CrmTaskRequestItem>
>('/api/crm/general/task-requests')
await Promise.all([
  crmReferencesStore.fetchTasks(),
  crmReferencesStore.fetchTaskRequests(),
])

const filteredRequests = computed(() => {
  const query = search.value.trim().toLowerCase()
  const items = data.value?.items ?? []

  return items.filter((request) => {
    const matchesSearch =
      !query ||
      [
        request.title,
        request.status,
        request.taskId,
        request.repositoryId,
        request.id,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    const matchesStatus =
      !statusFilter.value || request.status === statusFilter.value
    const matchesRepository =
      !repositoryFilter.value || request.repositoryId === repositoryFilter.value
    const matchesTask = !taskFilter.value || request.taskId === taskFilter.value
    const matchesTaskRequest =
      !taskRequestFilter.value || request.id === taskRequestFilter.value
    const matchesRequestedDate =
      !requestedAfter.value ||
      new Date(request.requestedAt) >= new Date(requestedAfter.value)
    const matchesResolvedDate =
      !resolvedBefore.value ||
      !request.resolvedAt ||
      new Date(request.resolvedAt) <= new Date(resolvedBefore.value)

    return (
      matchesSearch &&
      matchesStatus &&
      matchesRepository &&
      matchesTask &&
      matchesTaskRequest &&
      matchesRequestedDate &&
      matchesResolvedDate
    )
  })
})

const taskRequestStatusOptions = computed(() =>
  Array.from(
    new Set(
      (data.value?.items ?? [])
        .map((request) => request.status)
        .filter(Boolean),
    ),
  ),
)
const taskRequestRepositoryOptions = computed(() =>
  Array.from(
    new Set(
      (data.value?.items ?? [])
        .map((request) => request.repositoryId)
        .filter(Boolean),
    ),
  ),
)
const taskRequestTaskOptions = computed(() => crmReferencesStore.taskOptions)
const taskRequestTitleOptions = computed(
  () => crmReferencesStore.taskRequestOptions,
)
const taskRequestCreateStatusOptions = computed(() =>
  Array.from(
    new Set([
      'pending',
      'in_progress',
      'approved',
      'rejected',
      ...taskRequestStatusOptions.value,
    ]),
  ),
)
const taskRequestCreateTaskOptions = computed(
  () => crmReferencesStore.taskOptions,
)
const taskTitleById = computed<Record<string, string>>(() =>
  Object.fromEntries(
    crmReferencesStore.tasks.map((task) => [task.id, task.title]),
  ),
)

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredRequests.value.length / itemsPerPage)),
)

const paginatedRequests = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredRequests.value.slice(start, start + itemsPerPage)
})

watch(
  [
    search,
    statusFilter,
    repositoryFilter,
    taskFilter,
    taskRequestFilter,
    requestedAfter,
    resolvedBefore,
    filteredRequests,
  ],
  () => {
    currentPage.value = 1
  },
)

function requestStatusColor(status: string) {
  if (status === 'done' || status === 'approved') return 'success'
  if (status === 'review') return 'info'
  if (status === 'progress' || status === 'in_progress') return 'warning'
  if (status === 'pending') return 'secondary'
  if (status === 'rejected') return 'error'
  return 'primary'
}

async function openTask(taskId: string | null) {
  if (!taskId) return

  taskModalLoading.value = true
  taskModalOpen.value = true

  try {
    selectedTask.value = await $fetch<CrmTaskItem>(
      `/api/crm/general/tasks/${taskId}`,
    )
  } finally {
    taskModalLoading.value = false
  }
}

async function createRequest() {
  if (!isRootAdmin.value) return

  await $fetch<CrmIdResponse>('/api/crm/general/task-requests', {
    method: 'POST',
    body: payload,
  })
  createDialog.value = false
  await refresh()
}

function openDeleteDialog(requestId: string) {
  requestToDelete.value = requestId
  deleteDialog.value = true
}

async function deleteRequest() {
  if (!requestToDelete.value) return
  pendingDelete.value = true
  try {
    await $fetch(`/api/crm/general/task-requests/${requestToDelete.value}`, {
      method: 'DELETE',
    })
    deleteDialog.value = false
    requestToDelete.value = null
    await refresh()
  } finally {
    pendingDelete.value = false
  }
}
</script>

<template>
  <div>
    <WorldModuleShell
      :module-title="t('world.crm.label')"
      module-icon="mdi-account-group-outline"
      :module-description="t('world.crm.taskRequests.list.title')"
      :nav-items="crmNavItems"
      activate-right-drawer
    >
      <template #right>
        <div class="d-flex flex-column ga-3">
          <v-btn
            v-if="isRootAdmin"
            color="primary"
            prepend-icon="mdi-plus"
            block
            @click="createDialog = true"
          >
            {{ t('world.crm.taskRequests.actions.new') }}
          </v-btn>
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            :label="t('world.crm.filters.searchRequest')"
            clearable
            variant="outlined"
            hide-details
          />
          <AppSelect
            v-model="statusFilter"
            :items="taskRequestStatusOptions"
            :label="t('world.crm.filters.status')"
            clearable
          />
          <AppSelect
            v-model="repositoryFilter"
            :items="taskRequestRepositoryOptions"
            :label="t('world.crm.filters.repository')"
            clearable
          />
          <AppSelect
            v-model="taskFilter"
            :items="taskRequestTaskOptions"
            :label="t('world.crm.filters.task')"
            clearable
          />
          <AppSelect
            v-model="taskRequestFilter"
            :items="taskRequestTitleOptions"
            :label="t('world.crm.taskRequests.form.title')"
            clearable
          />
          <v-text-field
            v-model="requestedAfter"
            type="date"
            :label="t('world.crm.filters.requestedAfter')"
            variant="outlined"
            hide-details
            clearable
          />
          <v-text-field
            v-model="resolvedBefore"
            type="date"
            :label="t('world.crm.filters.resolvedBefore')"
            variant="outlined"
            hide-details
            clearable
          />
        </div>
      </template>
    </WorldModuleShell>

    <v-container fluid>
      <CrmPageSkeleton v-if="pending" variant="list" :cards="6" />
      <v-alert v-else-if="error" type="error" variant="tonal">{{
        t('world.crm.taskRequests.alerts.loadListError')
      }}</v-alert>
      <v-row v-else>
        <v-col
          v-for="request in paginatedRequests"
          :key="request.id"
          cols="12"
          md="4"
        >
          <WorldCard
            extra-class="pa-4 h-100 d-flex flex-column platform-style-card"
          >
            <div class="text-end">
              <v-chip
                size="small"
                :color="requestStatusColor(request.status)"
                variant="tonal"
              >{{ request.status }}</v-chip>
            </div>
            <div class="d-flex align-start justify-space-between ga-2 mb-2">
              <div class="d-flex align-center ga-2 min-w-0">
                <CrmEntityAvatar :label="request.title" :size="36" />
                <p class="text-subtitle-1 text-truncate">
                  {{ request.title }}
                </p>
              </div>
            </div>

            <div class="mb-4">
              <span class="text-body-2 text-medium-emphasis mr-2"
                >{{ t('world.crm.taskRequests.list.task') }}:</span
              >
              <v-chip
                size="small"
                color="primary"
                variant="outlined"
                @click="openTask(request.taskId)"
              >
                <span class="d-flex align-center ga-2">
                  <CrmEntityAvatar
                    :label="taskTitleById[request.taskId] || request.taskId"
                    :size="18"
                  />
                  {{ taskTitleById[request.taskId] || request.taskId }}
                </span>
              </v-chip>
            </div>
            <v-spacer />
            <div v-if="isAdminOrRoot" class="d-flex justify-center ga-1 mt-2">
              <v-btn
                icon="mdi-eye-outline"
                color="info"
                variant="text"
                class="mx-1"
                size="x-small"
                @click="
                  router.push(
                    `/world/crm/task-requests/${request.id}?mode=view`,
                  )
                "
              />
              <v-btn
                icon="mdi-pencil-outline"
                color="primary"
                variant="text"
                class="mx-1"
                size="x-small"
                @click="router.push(`/world/crm/task-requests/${request.id}`)"
              />
              <v-btn
                icon="mdi-delete-outline"
                color="error"
                variant="text"
                class="mx-1"
                size="x-small"
                @click="openDeleteDialog(request.id)"
              />
            </div>
          </WorldCard>
        </v-col>

        <v-col v-if="paginatedRequests.length === 0" cols="12">
          <v-alert type="info" variant="tonal">{{
            t('world.crm.taskRequests.alerts.empty')
          }}</v-alert>
        </v-col>
      </v-row>

      <div
        v-if="!pending && !error && totalPages > 1"
        class="d-flex justify-center mt-6 app-pagination"
      >
        <WorldPagination v-model="currentPage" :length="totalPages" />
      </div>

      <AppModal
        v-if="isRootAdmin"
        v-model="createDialog"
        :title="t('world.crm.taskRequests.modal.createTitle')"
        :max-width="720"
      >
        <v-row>
          <v-col cols="12" md="6">
            <AppSelect
              v-model="payload.taskId"
              :items="taskRequestCreateTaskOptions"
              :label="t('world.crm.taskRequests.form.taskId')"
              required
            />
          </v-col>
          <v-col cols="12" md="6">
            <AppSelect
              v-model="payload.repositoryId"
              :items="taskRequestRepositoryOptions"
              :label="t('world.crm.taskRequests.form.repositoryId')"
              required
            />
          </v-col>
          <v-col cols="12"
            ><v-text-field
              v-model="payload.title"
              :label="t('world.crm.taskRequests.form.title')"
              required
          /></v-col>
          <v-col cols="12"
            ><v-textarea
              v-model="payload.description"
              :label="t('world.crm.taskRequests.form.description')"
          /></v-col>
          <v-col cols="12" md="6">
            <AppSelect
              v-model="payload.status"
              :items="taskRequestCreateStatusOptions"
              :label="t('world.crm.taskRequests.form.status')"
            />
          </v-col>
        </v-row>
        <template #actions>
          <v-btn variant="text" @click="createDialog = false">{{
            t('world.crm.taskRequests.actions.cancel')
          }}</v-btn>
          <v-btn color="primary" @click="createRequest">{{
            t('world.crm.taskRequests.actions.create')
          }}</v-btn>
        </template>
      </AppModal>

      <AppModal v-model="taskModalOpen" title="Task details" :max-width="720">
        <v-progress-linear
          v-if="taskModalLoading"
          indeterminate
          color="primary"
          class="mb-4"
        />
        <template v-else-if="selectedTask">
          <p>
            <strong>{{ t('world.crm.tasks.form.title') }}:</strong>
            {{ selectedTask.title }}
          </p>
          <p>
            <strong>{{ t('world.crm.tasks.form.status') }}:</strong>
            {{ selectedTask.status }}
          </p>
          <p>
            <strong>{{ t('world.crm.tasks.form.priority') }}:</strong>
            {{ selectedTask.priority }}
          </p>
          <p>
            <strong>{{ t('world.crm.tasks.list.project') }}:</strong>
            {{ selectedTask.projectName || '—' }}
          </p>
          <p>
            <strong>{{ t('world.crm.tasks.form.description') }}:</strong>
            {{ selectedTask.description || '—' }}
          </p>
        </template>
      </AppModal>

      <AppModal
        v-model="deleteDialog"
        title="Delete task request"
        :max-width="460"
      >
        <p>Are you sure you want to delete this task request?</p>
        <template #actions>
          <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
          <v-btn color="error" :loading="pendingDelete" @click="deleteRequest"
            >Delete</v-btn
          >
        </template>
      </AppModal>
    </v-container>
  </div>
</template>
