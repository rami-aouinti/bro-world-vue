<script setup lang="ts">
import type {
  CrmIdResponse,
  CrmSubtaskCreatePayload,
  CrmTaskItem,
  CrmTaskUpdatePayload,
} from '~~/server/types/api/crm-general'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const taskId = computed(() => String(route.params.task ?? ''))

definePageMeta({ title: 'CRM Task Detail' })

const payload = reactive<CrmTaskUpdatePayload>({})
const assigneeId = ref('')
const subtaskToAttach = ref('')
const sprintToAttach = ref('')
const pendingSave = ref(false)
const newSubtask = reactive<CrmSubtaskCreatePayload>({
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
})

const { data, pending, error, refresh } = await useFetch<CrmTaskItem>(
  () => `/api/crm/general/tasks/${taskId.value}`,
)
const { data: usersData } = await useFetch<Record<string, any>>('/api/public/users')
const { data: tasksData } = await useFetch<{ items?: Array<{ id: string; title?: string }> }>('/api/crm/general/tasks')
const { data: sprintsData } = await useFetch<{ items?: Array<{ id: string; name?: string }> }>('/api/crm/general/sprints')

const publicUserOptions = computed(() => {
  const list = usersData.value?.users ?? usersData.value?.items ?? []
  if (!Array.isArray(list)) return []

  return list
    .map((user: any) => ({
      title: user.username ?? user.fullName ?? user.name ?? user.email ?? user.id,
      value: String(user.id ?? ''),
    }))
    .filter((item: { value: string }) => item.value)
})

const taskOptions = computed(() =>
  (tasksData.value?.items ?? []).map((task) => ({
    title: task.title ? `${task.title} (${task.id})` : task.id,
    value: task.id,
  })),
)

const sprintOptions = computed(() =>
  (sprintsData.value?.items ?? []).map((sprint) => ({
    title: sprint.name ? `${sprint.name} (${sprint.id})` : sprint.id,
    value: sprint.id,
  })),
)

watchEffect(() => {
  if (!data.value) return
  Object.assign(payload, {
    title: data.value.title,
    description: data.value.description,
    status: data.value.status,
    priority: data.value.priority,
    dueAt: data.value.dueAt,
    estimatedHours: data.value.estimatedHours,
    projectId: data.value.projectId,
    parentTaskId: data.value.parentTaskId,
  })
})

async function save() {
  pendingSave.value = true
  try {
    await $fetch<CrmIdResponse>(`/api/crm/general/tasks/${taskId.value}`, {
      method: 'PATCH',
      body: payload,
    })
    await refresh()
  } finally {
    pendingSave.value = false
  }
}

async function remove() {
  await $fetch(`/api/crm/general/tasks/${taskId.value}`, { method: 'DELETE' })
  await router.push('/world/crm/tasks')
}

async function attachAssignee() {
  if (!assigneeId.value.trim()) return
  await $fetch(`/api/crm/general/tasks/${taskId.value}/assignees/${encodeURIComponent(assigneeId.value.trim())}`, { method: 'PUT' })
  assigneeId.value = ''
  await refresh()
}

async function detachAssignee(userId: string) {
  await $fetch(`/api/crm/general/tasks/${taskId.value}/assignees/${encodeURIComponent(userId)}`, { method: 'DELETE' })
  await refresh()
}

async function createSubtask() {
  await $fetch<CrmIdResponse>(`/api/crm/general/tasks/${taskId.value}/subtasks`, {
    method: 'POST',
    body: newSubtask,
  })
  await refresh()
}

async function attachSubtask() {
  if (!subtaskToAttach.value.trim()) return
  await $fetch(`/api/crm/general/tasks/${taskId.value}/subtasks/${encodeURIComponent(subtaskToAttach.value.trim())}`, { method: 'PUT' })
  subtaskToAttach.value = ''
  await refresh()
}

async function detachSubtask(subtaskId: string) {
  await $fetch(`/api/crm/general/tasks/${taskId.value}/subtasks/${encodeURIComponent(subtaskId)}`, { method: 'DELETE' })
  await refresh()
}

async function attachToSprint() {
  if (!sprintToAttach.value) return
  await $fetch(`/api/crm/general/sprints/${encodeURIComponent(sprintToAttach.value)}/tasks/${encodeURIComponent(taskId.value)}`, { method: 'PUT' })
  await refresh()
}
</script>

<template>
  <v-container fluid>
    <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="router.push('/world/crm/tasks')">{{ t('world.crm.tasks.actions.backToList') }}</v-btn>
    <v-alert v-if="pending" type="info" variant="tonal">{{ t('world.crm.tasks.alerts.loadingDetail') }}</v-alert>
    <v-alert v-else-if="error" type="error" variant="tonal">{{ t('world.crm.tasks.alerts.notFound') }}</v-alert>

    <v-row v-else-if="data">
      <v-col cols="12" lg="8">
        <v-card rounded="xl" class="pa-4 postcard-gradient-card mb-4">
          <h2 class="text-h6 mb-4">{{ data.title }}</h2>
          <v-row>
            <v-col cols="12" md="6"><v-text-field v-model="payload.projectId" :label="t('world.crm.tasks.form.projectId')" /></v-col>
            <v-col cols="12" md="6"><v-text-field v-model="payload.title" :label="t('world.crm.tasks.form.title')" /></v-col>
            <v-col cols="12" md="6"><v-text-field v-model="payload.status" :label="t('world.crm.tasks.form.status')" /></v-col>
            <v-col cols="12" md="6"><v-text-field v-model="payload.priority" :label="t('world.crm.tasks.form.priority')" /></v-col>
            <v-col cols="12" md="6"><v-text-field v-model="payload.dueAt" :label="t('world.crm.tasks.form.dueAt')" /></v-col>
            <v-col cols="12" md="6"><v-text-field v-model="payload.estimatedHours" :label="t('world.crm.tasks.form.estimatedHours')" type="number" /></v-col>
            <v-col cols="12"><v-textarea v-model="payload.description" :label="t('world.crm.tasks.form.description')" /></v-col>
          </v-row>
          <div class="d-flex ga-2">
            <v-btn color="primary" :loading="pendingSave" @click="save">{{ t('world.crm.tasks.actions.save') }}</v-btn>
            <v-btn color="error" variant="tonal" @click="remove">{{ t('world.crm.tasks.actions.delete') }}</v-btn>
          </div>
        </v-card>

        <v-card rounded="xl" class="pa-4 postcard-gradient-card">
          <h3 class="text-subtitle-1 mb-3">{{ t('world.crm.tasks.sections.subtasks') }}</h3>
          <v-row>
            <v-col cols="12" md="6"><v-text-field v-model="newSubtask.title" :label="t('world.crm.tasks.form.subtaskTitle')" /></v-col>
            <v-col cols="12" md="6"><v-text-field v-model="newSubtask.status" :label="t('world.crm.tasks.form.status')" /></v-col>
            <v-col cols="12"><v-textarea v-model="newSubtask.description" :label="t('world.crm.tasks.form.description')" /></v-col>
          </v-row>
          <v-btn color="secondary" variant="tonal" class="mb-3" @click="createSubtask">{{ t('world.crm.tasks.actions.createSubtask') }}</v-btn>

          <v-select
            v-model="subtaskToAttach"
            :items="taskOptions"
            item-title="title"
            item-value="value"
            :label="t('world.crm.tasks.form.subtaskIdToAttach')"
            class="mb-2"
          />
          <v-btn color="secondary" variant="tonal" class="mb-3" @click="attachSubtask">{{ t('world.crm.tasks.actions.attachSubtask') }}</v-btn>

          <v-list density="compact" bg-color="transparent">
            <v-list-item
              v-for="subtask in data.subTasks"
              :key="subtask.id"
              :title="subtask.title"
              :subtitle="subtask.status"
            >
              <template #append>
                <v-btn size="small" icon="mdi-link-off" variant="text" color="error" @click="detachSubtask(subtask.id)" />
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card rounded="xl" class="pa-4 postcard-gradient-card">
          <h3 class="text-subtitle-1 mb-3">{{ t('world.crm.tasks.sections.assignees') }}</h3>
          <v-select
            v-model="assigneeId"
            :items="publicUserOptions"
            item-title="title"
            item-value="value"
            :label="t('world.crm.tasks.form.userId')"
            class="mb-2"
          />
          <v-btn color="secondary" variant="tonal" class="mb-4" @click="attachAssignee">{{ t('world.crm.tasks.actions.attach') }}</v-btn>
          <v-list density="compact" bg-color="transparent">
            <v-list-item
              v-for="assignee in data.assignees"
              :key="String((assignee as any).id ?? assignee)"
              :title="String((assignee as any).username ?? (assignee as any).id ?? assignee)"
            >
              <template #append>
                <v-btn size="small" color="error" variant="text" icon="mdi-close" @click="detachAssignee(String((assignee as any).id ?? assignee))" />
              </template>
            </v-list-item>
          </v-list>

          <h3 class="text-subtitle-1 mt-4 mb-3">Attach to sprint</h3>
          <v-select
            v-model="sprintToAttach"
            :items="sprintOptions"
            item-title="title"
            item-value="value"
            label="Sprint"
            class="mb-2"
          />
          <v-btn color="secondary" variant="tonal" class="mb-4" @click="attachToSprint">Attach sprint</v-btn>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>
