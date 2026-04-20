<script setup lang="ts">
import type {
  CrmIdResponse,
  CrmProjectItem,
  CrmTaskCreatePayload,
  CrmTaskItem,
} from '~~/server/types/api/crm-general'

interface CrmTaskResponse {
  items: CrmTaskItem[]
}

definePageMeta({ title: 'CRM Tasks' })

const { locale, t } = useI18n()
const router = useRouter()
const { crmNavItems } = useWorldCrmNavItems()
const { sessionUser } = useCrmPermissions()
const isRootAdmin = computed(() =>
  (sessionUser.value?.roles ?? []).includes('ROLE_ROOT'),
)
const isAdminOrRoot = computed(() => {
  const roles = sessionUser.value?.roles ?? []
  return roles.includes('ROLE_ROOT') || roles.includes('ROLE_ADMIN')
})
const createDialog = ref(false)
const pendingCreate = ref(false)
const search = ref('')
const currentPage = ref(1)
const itemsPerPage = 9
const projectModalOpen = ref(false)
const projectModalLoading = ref(false)
const selectedProject = ref<CrmProjectItem | null>(null)
const createPayload = reactive<CrmTaskCreatePayload>({
  projectId: '',
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
})

const { data, pending, error } = await useFetch<CrmTaskResponse>(
  '/api/crm/general/tasks',
)

const filteredTasks = computed(() => {
  const query = search.value.trim().toLowerCase()
  const items = data.value?.items ?? []

  if (!query) return items

  return items.filter((task) =>
    [task.title, task.status, task.priority, task.projectName, task.id]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query)),
  )
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredTasks.value.length / itemsPerPage)),
)

const paginatedTasks = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredTasks.value.slice(start, start + itemsPerPage)
})

watch([search, filteredTasks], () => {
  currentPage.value = 1
})

function formatDate(value: string | null) {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: 'medium',
  }).format(new Date(value))
}

function taskStatusColor(status: string) {
  if (status === 'done') return 'success'
  if (status === 'review') return 'info'
  if (status === 'in_progress' || status === 'progress') return 'warning'
  if (status === 'pending' || status === 'todo') return 'secondary'
  return 'primary'
}

function taskPriorityColor(priority: string) {
  if (priority === 'high') return 'error'
  if (priority === 'medium') return 'warning'
  if (priority === 'low') return 'success'
  return 'primary'
}

async function openProject(projectId: string | null) {
  if (!projectId) return

  projectModalLoading.value = true
  projectModalOpen.value = true

  try {
    selectedProject.value = await $fetch<CrmProjectItem>(`/api/crm/general/projects/${projectId}`)
  } finally {
    projectModalLoading.value = false
  }
}

async function createTask() {
  if (!isRootAdmin.value) return
  pendingCreate.value = true
  try {
    await $fetch<CrmIdResponse>('/api/crm/general/tasks', {
      method: 'POST',
      body: createPayload,
    })
    createDialog.value = false
    await refreshNuxtData('/api/crm/general/tasks')
  } finally {
    pendingCreate.value = false
  }
}
</script>

<template>
  <div>
    <WorldModuleDrawers
      :module-title="t('world.crm.label')"
      module-icon="mdi-account-group-outline"
      :module-description="t('world.crm.tasks.moduleDescription')"
      :nav-items="crmNavItems"
      :show-action="isRootAdmin"
      :action-label="t('world.crm.tasks.actions.create')"
      action-icon="mdi-plus"
      @action="isRootAdmin ? (createDialog = true) : undefined"
    />

    <v-container fluid>
      <CrmPageSkeleton v-if="pending" variant="list" :cards="6" />
      <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4"
        >{{ t('world.crm.tasks.alerts.loadListError') }}</v-alert
      >

      <template v-else>
        <v-text-field
          v-model="search"
          class="mb-4"
          prepend-inner-icon="mdi-magnify"
          label="Rechercher une tâche"
          clearable
          variant="outlined"
        />

        <v-row>
          <v-col
            v-for="task in paginatedTasks"
            :key="task.id"
            cols="12"
            md="4"
          >
            <v-card rounded="xl" class="pa-4 postcard-gradient-card crm-list-card h-100">
              <div class="d-flex align-start justify-space-between ga-2 mb-2">
                <h3 class="text-subtitle-1 mb-0">{{ task.title }}</h3>
                <v-chip size="small" :color="taskStatusColor(task.status)" variant="tonal">
                  {{ task.status }}
                </v-chip>
              </div>
              <div class="d-flex flex-wrap ga-2 mb-2">
                <v-chip size="small" color="primary" variant="outlined" @click="openProject(task.projectId)">
                  {{ task.projectName || 'Project' }}
                </v-chip>
                <v-chip size="small" :color="taskPriorityColor(task.priority)" variant="tonal">
                  {{ task.priority }}
                </v-chip>
              </div>
              <p class="text-body-2 mb-1">{{ t('world.crm.tasks.list.due') }}: {{ formatDate(task.dueAt) }}</p>
              <p class="text-body-2 mb-0">
                {{ task.estimatedHours }}h ·
                {{ task.attachments.length }} {{ t('world.crm.tasks.list.attachments') }} ·
                {{ task.children.length }} {{ t('world.crm.tasks.list.subtasks') }}
              </p>
              <v-btn
                v-if="isAdminOrRoot"
                class="mt-3"
                color="primary"
                variant="tonal"
                prepend-icon="mdi-arrow-right"
                @click="router.push(`/world/crm/tasks/${task.id}`)"
              >
                {{ t('world.crm.tasks.actions.viewDetails') }}
              </v-btn>
            </v-card>
          </v-col>

          <v-col v-if="paginatedTasks.length === 0" cols="12">
            <v-alert type="info" variant="tonal">Aucune tâche trouvée.</v-alert>
          </v-col>
        </v-row>

        <div v-if="totalPages > 1" class="d-flex justify-center mt-6">
          <v-pagination v-model="currentPage" :length="totalPages" rounded="circle" />
        </div>
      </template>
    </v-container>

    <AppModal v-if="isRootAdmin" v-model="createDialog" :title="t('world.crm.tasks.modal.createTitle')" :max-width="720">
      <v-row>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.projectId" :label="t('world.crm.tasks.form.projectId')" required /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.title" :label="t('world.crm.tasks.form.title')" required /></v-col>
        <v-col cols="12"><v-textarea v-model="createPayload.description" :label="t('world.crm.tasks.form.description')" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.status" :label="t('world.crm.tasks.form.status')" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.priority" :label="t('world.crm.tasks.form.priority')" /></v-col>
      </v-row>
      <template #actions>
        <v-btn variant="text" @click="createDialog = false">{{ t('world.crm.tasks.actions.cancel') }}</v-btn>
        <v-btn color="primary" :loading="pendingCreate" @click="createTask">{{ t('world.crm.tasks.actions.create') }}</v-btn>
      </template>
    </AppModal>

    <AppModal v-model="projectModalOpen" title="Project details" :max-width="720">
      <v-progress-linear v-if="projectModalLoading" indeterminate color="primary" class="mb-4" />
      <template v-else-if="selectedProject">
        <p><strong>{{ t('world.crm.projects.form.name') }}:</strong> {{ selectedProject.name }}</p>
        <p><strong>{{ t('world.crm.projects.form.status') }}:</strong> {{ selectedProject.status }}</p>
        <p><strong>{{ t('world.crm.projects.list.githubRepos') }}:</strong> {{ selectedProject.githubRepositoriesCount }}</p>
        <p><strong>{{ t('world.crm.projects.list.provisioning') }}:</strong> {{ selectedProject.provisioning?.state || '—' }}</p>
        <p><strong>{{ t('world.crm.projects.form.description') }}:</strong> {{ selectedProject.description || '—' }}</p>
      </template>
    </AppModal>
  </div>
</template>
