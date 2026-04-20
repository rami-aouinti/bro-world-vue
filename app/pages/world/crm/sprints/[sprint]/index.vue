<script setup lang="ts">
import type {
  CrmIdResponse,
  CrmSprintItem,
  CrmSprintUpdatePayload,
} from '~~/server/types/api/crm-general'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { crmNavItems } = useWorldCrmNavItems()
const { sessionUser } = useCrmPermissions()
const isRootAdmin = computed(() =>
  (sessionUser.value?.roles ?? []).includes('ROLE_ROOT'),
)
const sprintId = computed(() => String(route.params.sprint ?? ''))

definePageMeta({ title: 'CRM Sprint Detail' })

const payload = reactive<CrmSprintUpdatePayload>({})
const assigneeId = ref('')
const taskId = ref('')
const { data: usersData } = await useFetch<Record<string, any>>('/api/public/users')
const { data: tasksData } = await useFetch<{ items?: Array<{ id: string; title?: string }> }>('/api/crm/general/tasks')

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

const { data, pending, error, refresh } = await useFetch<CrmSprintItem>(
  () => `/api/crm/general/sprints/${sprintId.value}`,
)

watchEffect(() => {
  if (!data.value) return
  Object.assign(payload, {
    name: data.value.name,
    goal: data.value.goal,
    status: data.value.status,
    startDate: data.value.startDate,
    endDate: data.value.endDate,
  })
})

async function save() {
  if (!isRootAdmin.value) return
  await $fetch<CrmIdResponse>(`/api/crm/general/sprints/${sprintId.value}`, {
    method: 'PATCH',
    body: payload,
  })
  await refresh()
}

async function remove() {
  if (!isRootAdmin.value) return
  await $fetch(`/api/crm/general/sprints/${sprintId.value}`, { method: 'DELETE' })
  await router.push('/world/crm/sprints')
}

async function attachAssignee() {
  if (!isRootAdmin.value) return
  if (!assigneeId.value.trim()) return
  await $fetch(`/api/crm/general/sprints/${sprintId.value}/assignees/${encodeURIComponent(assigneeId.value.trim())}`, { method: 'PUT' })
  assigneeId.value = ''
}

async function detachAssignee() {
  if (!isRootAdmin.value) return
  if (!assigneeId.value.trim()) return
  await $fetch(`/api/crm/general/sprints/${sprintId.value}/assignees/${encodeURIComponent(assigneeId.value.trim())}`, { method: 'DELETE' })
  assigneeId.value = ''
}

async function attachTask() {
  if (!isRootAdmin.value) return
  if (!taskId.value.trim()) return
  await $fetch(`/api/crm/general/sprints/${sprintId.value}/tasks/${encodeURIComponent(taskId.value.trim())}`, { method: 'PUT' })
  taskId.value = ''
}

async function detachTask() {
  if (!isRootAdmin.value) return
  if (!taskId.value.trim()) return
  await $fetch(`/api/crm/general/sprints/${sprintId.value}/tasks/${encodeURIComponent(taskId.value.trim())}`, { method: 'DELETE' })
  taskId.value = ''
}
</script>

<template>
  <div>
    <WorldModuleDrawers
      :module-title="t('world.crm.label')"
      module-key="crm"
      module-path="/world/crm"
      module-icon="mdi-account-group-outline"
      :module-description="t('world.crm.moduleDescription')"
      :nav-items="crmNavItems"
      :action-label="t('world.crm.actions.createLead')"
      action-icon="mdi-account-plus-outline"
    >
      <template #right />
    </WorldModuleDrawers>
    <v-container fluid>
      <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="router.push('/world/crm/sprints')">{{ t('world.crm.sprints.actions.backToList') }}</v-btn>
      <CrmPageSkeleton v-if="pending" variant="detail" />
      <v-alert v-else-if="error" type="error" variant="tonal">{{ t('world.crm.sprints.alerts.notFound') }}</v-alert>

    <v-row v-else-if="data">
      <v-col cols="12" lg="8">
        <v-card rounded="xl" class="pa-4 postcard-gradient-card">
          <h2 class="text-h6 mb-4">{{ data.name }}</h2>
          <v-row>
            <v-col cols="12" md="6"><v-text-field v-model="payload.name" :label="t('world.crm.sprints.form.name')" :readonly="!isRootAdmin" /></v-col>
            <v-col cols="12" md="6"><v-text-field v-model="payload.status" :label="t('world.crm.sprints.form.status')" :readonly="!isRootAdmin" /></v-col>
            <v-col cols="12" md="6"><v-text-field v-model="payload.startDate" :label="t('world.crm.sprints.form.startDate')" :readonly="!isRootAdmin" /></v-col>
            <v-col cols="12" md="6"><v-text-field v-model="payload.endDate" :label="t('world.crm.sprints.form.endDate')" :readonly="!isRootAdmin" /></v-col>
            <v-col cols="12"><v-textarea v-model="payload.goal" :label="t('world.crm.sprints.form.goal')" :readonly="!isRootAdmin" /></v-col>
          </v-row>
          <div v-if="isRootAdmin" class="d-flex ga-2">
            <v-btn color="primary" @click="save">{{ t('world.crm.sprints.actions.save') }}</v-btn>
            <v-btn color="error" variant="tonal" @click="remove">{{ t('world.crm.sprints.actions.delete') }}</v-btn>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" lg="4">
        <v-card rounded="xl" class="pa-4 postcard-gradient-card mb-4">
          <h3 class="text-subtitle-1 mb-3">{{ t('world.crm.sprints.sections.assignees') }}</h3>
          <AppSelect
            v-model="assigneeId"
            :items="publicUserOptions"
            item-title="title"
            item-value="value"
            :label="t('world.crm.sprints.form.userId')"
            :disabled="!isRootAdmin"
          />
          <div v-if="isRootAdmin" class="d-flex ga-2">
            <v-btn size="small" color="secondary" variant="tonal" @click="attachAssignee">{{ t('world.crm.sprints.actions.attach') }}</v-btn>
            <v-btn size="small" color="error" variant="tonal" @click="detachAssignee">{{ t('world.crm.sprints.actions.detach') }}</v-btn>
          </div>
        </v-card>

        <v-card rounded="xl" class="pa-4 postcard-gradient-card">
          <h3 class="text-subtitle-1 mb-3">{{ t('world.crm.sprints.sections.tasks') }}</h3>
          <AppSelect
            v-model="taskId"
            :items="taskOptions"
            item-title="title"
            item-value="value"
            :label="t('world.crm.sprints.form.taskId')"
            :disabled="!isRootAdmin"
          />
          <div v-if="isRootAdmin" class="d-flex ga-2">
            <v-btn size="small" color="secondary" variant="tonal" @click="attachTask">{{ t('world.crm.sprints.actions.attach') }}</v-btn>
            <v-btn size="small" color="error" variant="tonal" @click="detachTask">{{ t('world.crm.sprints.actions.detach') }}</v-btn>
          </div>
        </v-card>
      </v-col>
    </v-row>
    </v-container>
  </div>
</template>
