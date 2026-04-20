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

const createDialog = ref(false)
const taskModalOpen = ref(false)
const taskModalLoading = ref(false)
const selectedTask = ref<CrmTaskItem | null>(null)
const payload = reactive<CrmTaskRequestCreatePayload>({
  taskId: '',
  repositoryId: '',
  title: '',
  description: '',
  status: 'pending',
})

const { data, pending, error, refresh } = await useFetch<ApiListResponse<CrmTaskRequestItem>>('/api/crm/general/task-requests')

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
      :action-label="t('world.crm.taskRequests.actions.new')"
      action-icon="mdi-plus"
      @action="createDialog = true"
    />
    <v-container fluid>
      <div class="d-flex align-center justify-space-between mb-4">
        <h1 class="text-h5">{{ t('world.crm.taskRequests.list.title') }}</h1>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="createDialog = true">{{ t('world.crm.taskRequests.actions.new') }}</v-btn>
      </div>

      <CrmPageSkeleton v-if="pending" variant="list" :cards="6" />
      <v-alert v-else-if="error" type="error" variant="tonal">{{ t('world.crm.taskRequests.alerts.loadListError') }}</v-alert>
      <v-row v-else>
        <v-col v-for="request in data?.items ?? []" :key="request.id" cols="12" md="6" lg="4">
          <v-card rounded="xl" class="pa-4 postcard-gradient-card h-100 d-flex flex-column">
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
              v-if="isRootAdmin"
              color="primary"
              variant="tonal"
              @click="router.push(`/world/crm/task-requests/${request.id}`)"
            >
              {{ t('world.crm.taskRequests.actions.viewDetails') }}
            </v-btn>
          </v-card>
        </v-col>
      </v-row>

      <AppModal v-model="createDialog" :title="t('world.crm.taskRequests.modal.createTitle')" :max-width="720">
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
