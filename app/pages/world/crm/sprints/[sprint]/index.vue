<script setup lang="ts">
import type {
  CrmIdResponse,
  CrmSprintItem,
  CrmSprintUpdatePayload,
} from '~~/server/types/api/crm-general'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { crmNavItems, hasBlogPlugin } = useWorldCrmNavItems()
const { sessionUser } = useCrmPermissions()
const isRootAdmin = computed(() =>
  (sessionUser.value?.roles ?? []).includes('ROLE_ROOT'),
)
const sprintId = computed(() => String(route.params.sprint ?? ''))
const isViewMode = computed(() => route.query.mode === 'view')

definePageMeta({ layout: 'crm', title: 'CRM Sprint Detail' })

const payload = reactive<CrmSprintUpdatePayload>({})
const assigneeId = ref('')
const taskId = ref('')
const crmReferencesStore = useCrmReferenceOptionsStore()
await Promise.all([
  crmReferencesStore.fetchEmployees(),
  crmReferencesStore.fetchTasks(),
  crmReferencesStore.fetchProjects(),
])
const statusOptions = ['planned', 'in_progress', 'completed']

const publicUserOptions = computed(
  () => crmReferencesStore.employeeAssigneeOptions,
)
const taskOptions = computed(() => crmReferencesStore.taskOptions)
const projectOptions = computed(() => crmReferencesStore.projectOptions)
const projectNameById = computed<Record<string, string>>(() =>
  Object.fromEntries(
    crmReferencesStore.projects.map((project) => [project.id, project.name]),
  ),
)

function assigneeDisplayName(assignee: any) {
  const firstName = String(
    assignee?.firstName ?? assignee?.userFirstName ?? '',
  ).trim()
  const lastName = String(
    assignee?.lastName ?? assignee?.userLastName ?? '',
  ).trim()
  const fullName = `${firstName} ${lastName}`.trim()
  return (
    fullName ||
    String(
      assignee?.username ?? assignee?.email ?? assignee?.id ?? assignee ?? '—',
    )
  )
}

const { data, pending, error, refresh } = useFetch<CrmSprintItem>(
  () => `/api/crm/general/sprints/${sprintId.value}`,
)

watchEffect(() => {
  if (!data.value) return
  Object.assign(payload, {
    projectId: data.value.projectId,
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
  await $fetch(`/api/crm/general/sprints/${sprintId.value}`, {
    method: 'DELETE',
  })
  await router.push('/world/crm/sprints')
}

async function attachAssignee() {
  if (!isRootAdmin.value) return
  if (!assigneeId.value.trim()) return
  await $fetch(
    `/api/crm/general/sprints/${sprintId.value}/assignees/${encodeURIComponent(assigneeId.value.trim())}`,
    { method: 'PUT' },
  )
  assigneeId.value = ''
}

async function detachAssignee() {
  if (!isRootAdmin.value) return
  if (!assigneeId.value.trim()) return
  await $fetch(
    `/api/crm/general/sprints/${sprintId.value}/assignees/${encodeURIComponent(assigneeId.value.trim())}`,
    { method: 'DELETE' },
  )
  assigneeId.value = ''
}

async function attachTask() {
  if (!isRootAdmin.value) return
  if (!taskId.value.trim()) return
  await $fetch(
    `/api/crm/general/sprints/${sprintId.value}/tasks/${encodeURIComponent(taskId.value.trim())}`,
    { method: 'PUT' },
  )
  taskId.value = ''
}

async function detachTask() {
  if (!isRootAdmin.value) return
  if (!taskId.value.trim()) return
  await $fetch(
    `/api/crm/general/sprints/${sprintId.value}/tasks/${encodeURIComponent(taskId.value.trim())}`,
    { method: 'DELETE' },
  )
  taskId.value = ''
}
</script>

<template>
  <div>
    <WorldModuleShell
      :module-title="t('world.crm.label')"
      module-key="crm"
      module-path="/world/crm"
      module-icon="mdi-account-group-outline"
      :module-description="t('world.crm.moduleDescription')"
      :nav-items="crmNavItems"
      :action-label="t('world.crm.actions.createLead')"
      action-icon="mdi-account-plus-outline"
    >
      <template #right>
        <h3 class="text-subtitle-1 mb-3">
          {{ t('world.crm.sprints.sections.assignees') }}
        </h3>
        <AppSelect
          v-model="assigneeId"
          :items="publicUserOptions"
          item-title="title"
          item-value="value"
          :label="t('world.crm.sprints.form.userId')"
          :disabled="!isRootAdmin"
        >
          <template #item="{ props, item }">
            <v-list-item
              v-bind="props"
              :title="item?.raw?.title || undefined"
              :subtitle="item?.raw?.subtitle || undefined"
            >
              <template #prepend>
                <v-avatar size="24">
                  <v-img
                    :src="item?.raw?.avatar || '/img/avatar_default.svg'"
                    :alt="item?.raw?.title || 'Employee avatar'"
                  />
                </v-avatar>
              </template>
            </v-list-item>
          </template>
          <template #selection="{ item }">
            <div class="d-flex align-center ga-2">
              <v-avatar size="20">
                <v-img
                  :src="item?.raw?.avatar || '/img/avatar_default.svg'"
                  :alt="item?.raw?.title || 'Employee avatar'"
                />
              </v-avatar>
              <span v-if="item?.raw?.title">{{ item?.raw?.title }}</span>
            </div>
          </template>
        </AppSelect>
        <div v-if="isRootAdmin" class="d-flex ga-2">
          <v-btn
            size="small"
            color="secondary"
            variant="tonal"
            @click="attachAssignee"
            >{{ t('world.crm.sprints.actions.attach') }}</v-btn
          >
          <v-btn
            size="small"
            color="error"
            variant="tonal"
            @click="detachAssignee"
            >{{ t('world.crm.sprints.actions.detach') }}</v-btn
          >
        </div>
        <v-list density="compact" bg-color="transparent">
          <v-list-item
            v-for="assignee in data?.assignees ?? []"
            :key="String((assignee as any).id ?? assignee)"
            :title="assigneeDisplayName(assignee)"
          >
            <template #prepend>
              <v-avatar size="24">
                <v-img
                  :src="
                    String((assignee as any).photo ?? '/img/avatar_default.svg')
                  "
                  :alt="assigneeDisplayName(assignee)"
                />
              </v-avatar>
            </template>
          </v-list-item>
        </v-list>

        <h3 class="text-subtitle-1 mb-3">
          {{ t('world.crm.sprints.sections.tasks') }}
        </h3>
        <AppSelect
          v-model="taskId"
          :items="taskOptions"
          item-title="title"
          item-value="value"
          :label="t('world.crm.sprints.form.taskId')"
          :disabled="!isRootAdmin"
        />
        <div v-if="isRootAdmin" class="d-flex ga-2">
          <v-btn
            size="small"
            color="secondary"
            variant="tonal"
            @click="attachTask"
            >{{ t('world.crm.sprints.actions.attach') }}</v-btn
          >
          <v-btn
            size="small"
            color="error"
            variant="tonal"
            @click="detachTask"
            >{{ t('world.crm.sprints.actions.detach') }}</v-btn
          >
        </div>
      </template>
    </WorldModuleShell>
    <v-container fluid>
      <CrmPageSkeleton v-if="pending" variant="detail" />
      <v-alert v-else-if="error" type="error" variant="tonal">{{
        t('world.crm.sprints.alerts.notFound')
      }}</v-alert>

      <v-row v-else-if="data">
        <v-col cols="12">
          <v-card rounded="xl" class="pa-4 postcard-gradient-card">
            <template v-if="isViewMode">
              <div class="d-flex justify-space-between align-start ga-2 mb-4">
                <h2 class="text-h6 mb-0">{{ data.name }}</h2>
                <v-chip color="secondary" variant="tonal">{{
                  data.status
                }}</v-chip>
              </div>
              <div class="d-flex flex-wrap ga-2 mb-4">
                <v-chip color="primary" variant="outlined">
                  <span class="d-flex align-center ga-2">
                    <CrmEntityAvatar
                      :label="projectNameById[data.projectId] || data.projectId"
                      :size="18"
                    />
                    {{ projectNameById[data.projectId] || data.projectId }}
                  </span>
                </v-chip>
                <v-chip variant="tonal"
                  >Start: {{ data.startDate || '—' }}</v-chip
                >
                <v-chip variant="tonal">End: {{ data.endDate || '—' }}</v-chip>
              </div>
              <v-card variant="outlined" class="pa-3">
                <p class="text-caption mb-1">
                  {{ t('world.crm.sprints.form.goal') }}
                </p>
                <p class="text-body-2 mb-0">{{ data.goal || '—' }}</p>
              </v-card>
            </template>
            <template v-else>
              <h2 class="text-h6 mb-4">{{ data.name }}</h2>
              <v-row>
                <v-col cols="12" md="6"
                  ><v-text-field
                    v-model="payload.name"
                    :label="t('world.crm.sprints.form.name')"
                    :readonly="!isRootAdmin"
                /></v-col>
                <v-col cols="12" md="6">
                  <AppSelect
                    v-model="payload.projectId"
                    :items="projectOptions"
                    item-title="title"
                    item-value="value"
                    :label="t('world.crm.sprints.form.projectId')"
                    :disabled="!isRootAdmin"
                  />
                </v-col>
                <v-col cols="12" md="6"
                  ><AppSelect
                    v-model="payload.status"
                    :items="statusOptions"
                    :label="t('world.crm.sprints.form.status')"
                    :disabled="!isRootAdmin"
                /></v-col>
                <v-col cols="12" md="6"
                  ><v-text-field
                    v-model="payload.startDate"
                    :label="t('world.crm.sprints.form.startDate')"
                    type="date"
                    :readonly="!isRootAdmin"
                /></v-col>
                <v-col cols="12" md="6"
                  ><v-text-field
                    v-model="payload.endDate"
                    :label="t('world.crm.sprints.form.endDate')"
                    type="date"
                    :readonly="!isRootAdmin"
                /></v-col>
                <v-col cols="12"
                  ><v-textarea
                    v-model="payload.goal"
                    :label="t('world.crm.sprints.form.goal')"
                    :readonly="!isRootAdmin"
                /></v-col>
              </v-row>
              <div v-if="isRootAdmin" class="d-flex ga-2">
                <v-btn color="primary" @click="save">{{
                  t('world.crm.sprints.actions.save')
                }}</v-btn>
                <v-btn color="error" variant="tonal" @click="remove">{{
                  t('world.crm.sprints.actions.delete')
                }}</v-btn>
              </div>
            </template>
          </v-card>
        </v-col>

        <v-col v-if="hasBlogPlugin" cols="12">
          <CrmBlogCard />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
