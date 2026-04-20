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
definePageMeta({ title: 'CRM Task Requests' })

const isRootAdmin = computed(() =>
  (sessionUser.value?.roles ?? []).includes('ROLE_ROOT'),
)
const isAdminOrRoot = computed(() => {
  const roles = sessionUser.value?.roles ?? []
  return roles.includes('ROLE_ROOT') || roles.includes('ROLE_ADMIN')
})

const createDialog = ref(false)
const taskModalOpen = ref(false)
const taskModalLoading = ref(false)
const search = ref('')
const statusFilter = ref<string | null>(null)
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

const { data, pending, error, refresh } = await useFetch<ApiListResponse<CrmTaskRequestItem>>('/api/crm/general/task-requests')

const filteredRequests = computed(() => {
  const query = search.value.trim().toLowerCase()
  const items = data.value?.items ?? []

  return items.filter((request) => {
    const matchesSearch
      = !query
        || [request.title, request.status, request.taskId, request.repositoryId, request.id]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query))
    const matchesStatus = !statusFilter.value || request.status === statusFilter.value
    const matchesRequestedDate
      = !requestedAfter.value
        || new Date(request.requestedAt) >= new Date(requestedAfter.value)
    const matchesResolvedDate
      = !resolvedBefore.value
        || !request.resolvedAt
        || new Date(request.resolvedAt) <= new Date(resolvedBefore.value)

    return matchesSearch && matchesStatus && matchesRequestedDate && matchesResolvedDate
  })
})

const taskRequestStatusOptions = computed(() =>
  Array.from(new Set((data.value?.items ?? []).map((request) => request.status).filter(Boolean))),
)

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredRequests.value.length / itemsPerPage)),
)

const paginatedRequests = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredRequests.value.slice(start, start + itemsPerPage)
})

watch([search, statusFilter, requestedAfter, resolvedBefore, filteredRequests], () => {
  currentPage.value = 1
})

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
    selectedTask.value = await $fetch<CrmTaskItem>(`/api/crm/general/tasks/${taskId}`)
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
</script>

<template>
  <div>
    <WorldModuleDrawers
      :module-title="t('world.crm.label')"
      module-icon="mdi-account-group-outline"
      :module-description="t('world.crm.taskRequests.list.title')"
      :nav-items="crmNavItems"
      activate-right-drawer
      :show-action="isRootAdmin"
      :action-label="t('world.crm.taskRequests.actions.new')"
      action-icon="mdi-plus"
      @action="isRootAdmin ? (createDialog = true) : undefined"
    >
      <template #right>
        <div class="d-flex flex-column ga-3">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            label="Rechercher une demande"
            clearable
            variant="outlined"
            hide-details
          />
          <v-select
            v-model="statusFilter"
            :items="taskRequestStatusOptions"
            label="Statut"
            variant="outlined"
            clearable
            hide-details
          />
          <v-text-field v-model="requestedAfter" type="date" label="Demandée après" variant="outlined" hide-details clearable />
          <v-text-field v-model="resolvedBefore" type="date" label="Résolue avant" variant="outlined" hide-details clearable />
        </div>
      </template>
    </WorldModuleDrawers>

    <v-container fluid>
      <CrmPageSkeleton v-if="pending" variant="list" :cards="6" />
      <v-alert v-else-if="error" type="error" variant="tonal">{{ t('world.crm.taskRequests.alerts.loadListError') }}</v-alert>
      <v-row v-else>
        <v-col v-for="request in paginatedRequests" :key="request.id" cols="12" md="4">
          <v-card rounded="xl" class="pa-4 postcard-gradient-card h-100 d-flex flex-column crm-list-card">
            <p class="text-subtitle-1 mb-2">{{ request.title }}</p>
            <v-chip size="small" :color="requestStatusColor(request.status)" variant="tonal" class="mb-2">{{ request.status }}</v-chip>
            <div class="mb-4">
              <span class="text-body-2 text-medium-emphasis mr-2">{{ t('world.crm.taskRequests.list.task') }}:</span>
              <v-chip size="small" color="primary" variant="outlined" @click="openTask(request.taskId)">
                Task
              </v-chip>
            </div>
            <v-spacer />
            <v-btn
              v-if="isAdminOrRoot"
              color="primary"
              variant="tonal"
              @click="router.push(`/world/crm/task-requests/${request.id}`)"
            >
              {{ t('world.crm.taskRequests.actions.viewDetails') }}
            </v-btn>
          </v-card>
        </v-col>

        <v-col v-if="paginatedRequests.length === 0" cols="12">
          <v-alert type="info" variant="tonal">{{ t('world.crm.taskRequests.alerts.empty') }}</v-alert>
        </v-col>
      </v-row>

      <div v-if="!pending && !error && totalPages > 1" class="d-flex justify-center mt-6">
        <v-pagination v-model="currentPage" :length="totalPages" rounded="circle" />
      </div>

      <AppModal v-if="isRootAdmin" v-model="createDialog" :title="t('world.crm.taskRequests.modal.createTitle')" :max-width="720">
        <v-row>
          <v-col cols="12" md="6"><v-text-field v-model="payload.taskId" :label="t('world.crm.taskRequests.form.taskId')" required /></v-col>
          <v-col cols="12" md="6"><v-text-field v-model="payload.repositoryId" :label="t('world.crm.taskRequests.form.repositoryId')" required /></v-col>
          <v-col cols="12"><v-text-field v-model="payload.title" :label="t('world.crm.taskRequests.form.title')" required /></v-col>
          <v-col cols="12"><v-textarea v-model="payload.description" :label="t('world.crm.taskRequests.form.description')" /></v-col>
        </v-row>
        <template #actions>
          <v-btn variant="text" @click="createDialog = false">{{ t('world.crm.taskRequests.actions.cancel') }}</v-btn>
          <v-btn color="primary" @click="createRequest">{{ t('world.crm.taskRequests.actions.create') }}</v-btn>
        </template>
      </AppModal>

      <AppModal v-model="taskModalOpen" title="Task details" :max-width="720">
        <v-progress-linear v-if="taskModalLoading" indeterminate color="primary" class="mb-4" />
        <template v-else-if="selectedTask">
          <p><strong>{{ t('world.crm.tasks.form.title') }}:</strong> {{ selectedTask.title }}</p>
          <p><strong>{{ t('world.crm.tasks.form.status') }}:</strong> {{ selectedTask.status }}</p>
          <p><strong>{{ t('world.crm.tasks.form.priority') }}:</strong> {{ selectedTask.priority }}</p>
          <p><strong>{{ t('world.crm.tasks.list.project') }}:</strong> {{ selectedTask.projectName || '—' }}</p>
          <p><strong>{{ t('world.crm.tasks.form.description') }}:</strong> {{ selectedTask.description || '—' }}</p>
        </template>
      </AppModal>
    </v-container>
  </div>
</template>
