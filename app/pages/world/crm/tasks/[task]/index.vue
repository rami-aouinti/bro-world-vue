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
const { crmNavItems, hasBlogPlugin } = useWorldCrmNavItems()
const { sessionUser } = useCrmPermissions()
const isRootAdmin = computed(() =>
  (sessionUser.value?.roles ?? []).includes('ROLE_ROOT'),
)
const taskId = computed(() => String(route.params.task ?? ''))
const isViewMode = computed(() => route.query.mode === 'view')

definePageMeta({ layout: 'crm', title: 'CRM Task Detail' })
function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString()
}
const payload = reactive<CrmTaskUpdatePayload>({})
const assigneeId = ref('')
const subtaskToAttach = ref('')
const sprintToAttach = ref('')
const pendingSave = ref(false)
const crmReferencesStore = useCrmReferenceOptionsStore()
const newSubtask = reactive<CrmSubtaskCreatePayload>({
  title: '',
  description: '',
  status: 'todo',
  priority: 'medium',
})

const { data, pending, error, refresh } = useFetch<CrmTaskItem>(
  () => `/api/crm/general/tasks/${taskId.value}`,
)
await Promise.all([
  crmReferencesStore.fetchEmployees(),
  crmReferencesStore.fetchTasks(),
  crmReferencesStore.fetchSprints(),
  crmReferencesStore.fetchProjects(),
])

const publicUserOptions = computed(
  () => crmReferencesStore.employeeAssigneeOptions,
)

const taskOptions = computed(() => crmReferencesStore.taskOptions)
const sprintOptions = computed(() => crmReferencesStore.sprintOptions)
const projectOptions = computed(() => crmReferencesStore.projectOptions)

const statusOptions = ['todo', 'in_progress', 'review', 'done']
const priorityOptions = ['low', 'medium', 'high']

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
  if (!isRootAdmin.value) return
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
  if (!isRootAdmin.value) return
  await $fetch(`/api/crm/general/tasks/${taskId.value}`, { method: 'DELETE' })
  await router.push('/world/crm/tasks')
}

async function attachAssignee() {
  if (!isRootAdmin.value) return
  if (!assigneeId.value.trim()) return
  await $fetch(
    `/api/crm/general/tasks/${taskId.value}/assignees/${encodeURIComponent(assigneeId.value.trim())}`,
    { method: 'PUT' },
  )
  assigneeId.value = ''
  await refresh()
}

async function detachAssignee(userId: string) {
  if (!isRootAdmin.value) return
  await $fetch(
    `/api/crm/general/tasks/${taskId.value}/assignees/${encodeURIComponent(userId)}`,
    { method: 'DELETE' },
  )
  await refresh()
}

async function createSubtask() {
  if (!isRootAdmin.value) return
  await $fetch<CrmIdResponse>(
    `/api/crm/general/tasks/${taskId.value}/subtasks`,
    {
      method: 'POST',
      body: newSubtask,
    },
  )
  await refresh()
}

async function attachSubtask() {
  if (!isRootAdmin.value) return
  if (!subtaskToAttach.value.trim()) return
  await $fetch(
    `/api/crm/general/tasks/${taskId.value}/subtasks/${encodeURIComponent(subtaskToAttach.value.trim())}`,
    { method: 'PUT' },
  )
  subtaskToAttach.value = ''
  await refresh()
}

async function detachSubtask(subtaskId: string) {
  if (!isRootAdmin.value) return
  await $fetch(
    `/api/crm/general/tasks/${taskId.value}/subtasks/${encodeURIComponent(subtaskId)}`,
    { method: 'DELETE' },
  )
  await refresh()
}

async function attachToSprint() {
  if (!isRootAdmin.value) return
  if (!sprintToAttach.value) return
  await $fetch(
    `/api/crm/general/sprints/${encodeURIComponent(sprintToAttach.value)}/tasks/${encodeURIComponent(taskId.value)}`,
    { method: 'PUT' },
  )
  await refresh()
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
        <div v-if="isViewMode && isRootAdmin" class="d-flex ga-2 mb-4">
          <v-btn color="primary" @click="router.push(`/world/crm/tasks/${taskId}`)">
            Edit
          </v-btn>
          <v-btn color="error" variant="tonal" @click="remove">
            Delete
          </v-btn>
        </div>
        <h3 class="text-subtitle-1 mb-3">
          {{ t('world.crm.tasks.sections.assignees') }}
        </h3>
        <AppSelect
          v-model="assigneeId"
          :items="publicUserOptions"
          item-title="title"
          item-value="value"
          :label="t('world.crm.tasks.form.userId')"
          class="mb-2"
          :disabled="!isRootAdmin || isViewMode"
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
        <v-btn
          v-if="isRootAdmin && !isViewMode"
          color="secondary"
          variant="tonal"
          class="mb-4"
          @click="attachAssignee"
          >{{ t('world.crm.tasks.actions.attach') }}</v-btn
        >
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
            <template v-if="isRootAdmin && !isViewMode" #append>
              <v-btn
                size="small"
                color="error"
                variant="text"
                icon="mdi-close"
                @click="
                  detachAssignee(String((assignee as any).id ?? assignee))
                "
              />
            </template>
          </v-list-item>
        </v-list>

        <template v-if="!isViewMode">
          <h3 class="text-subtitle-1 mt-4 mb-3">Attach to sprint</h3>
          <AppSelect
            v-model="sprintToAttach"
            :items="sprintOptions"
            item-title="title"
            item-value="value"
            label="Sprint"
            class="mb-2"
            :disabled="!isRootAdmin"
          />
          <v-btn
            v-if="isRootAdmin"
            color="secondary"
            variant="tonal"
            class="mb-4"
            @click="attachToSprint"
            >Attach sprint</v-btn
          >
        </template>
      </template>
    </WorldModuleShell>
    <v-container fluid>
      <CrmPageSkeleton v-if="pending" variant="detail" />
      <v-alert v-else-if="error" type="error" variant="tonal">{{
        t('world.crm.tasks.alerts.notFound')
      }}</v-alert>

      <v-row v-else-if="data">
        <v-col cols="12">
          <v-card rounded="xl" class="pa-4 postcard-gradient-card mb-4">
            <template v-if="isViewMode">
              <div class="d-flex justify-space-between align-start ga-2 mb-4">
                <h2 class="text-h6 mb-0">{{ data.title }}</h2>
                <v-chip color="info" variant="tonal">{{ data.status }}</v-chip>
              </div>
              <div class="d-flex flex-wrap ga-2 mb-4">
                <v-chip color="warning" variant="tonal">{{
                  data.priority
                }}</v-chip>
                <v-chip color="primary" variant="outlined">
                  <span class="d-flex align-center ga-2">
                    <CrmEntityAvatar
                      :label="data.projectName || data.projectId"
                      :size="36"
                    />
                    {{ data.projectName || data.projectId }}
                  </span>
                </v-chip>
                <v-chip variant="tonal"
                  >Due: {{ formatDate(data.dueAt) || '—' }}</v-chip
                >
              </div>
              <v-card variant="outlined" class="pa-3 mb-3">
                <p class="text-caption mb-1">
                  {{ t('world.crm.tasks.form.description') }}
                </p>
                <p class="text-body-2 mb-0">{{ data.description || '—' }}</p>
              </v-card>
              <div class="mb-4">
                <h3 class="text-subtitle-1 mb-2">Attachments</h3>
                <v-list
                  v-if="data.attachments?.length"
                  density="compact"
                  class="bg-transparent pa-0"
                >
                  <v-list-item
                    v-for="(attachment, index) in data.attachments"
                    :key="
                      attachment.id ||
                      attachment.url ||
                      attachment.name ||
                      index
                    "
                    :title="
                      String(
                        attachment.originalName ??
                          attachment.name ??
                          attachment.url ??
                          `Attachment ${index + 1}`,
                      )
                    "
                    :subtitle="String(attachment.mimeType ?? '')"
                    :href="attachment.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    prepend-icon="mdi-download"
                    class="px-0"
                  />
                </v-list>
                <v-alert
                  v-else
                  type="info"
                  variant="tonal"
                  density="comfortable"
                >
                  No attachments
                </v-alert>
              </div>
              <p class="text-body-2 mb-0">
                {{ data.estimatedHours || 0 }}h ·
                {{ data.attachments?.length || 0 }} attachments ·
                {{ data.children?.length || 0 }} subtasks
              </p>
            </template>
            <template v-else>
              <h2 class="text-h6 mb-4">{{ data.title }}</h2>
              <v-row>
                <v-col cols="12" md="6">
                  <AppSelect
                    v-model="payload.projectId"
                    :items="projectOptions"
                    item-title="title"
                    item-value="value"
                    :label="t('world.crm.tasks.form.projectId')"
                    :disabled="!isRootAdmin"
                  />
                </v-col>
                <v-col cols="12" md="6"
                  ><v-text-field
                    v-model="payload.title"
                    :label="t('world.crm.tasks.form.title')"
                    :readonly="!isRootAdmin"
                /></v-col>
                <v-col cols="12" md="6"
                  ><AppSelect
                    v-model="payload.status"
                    :items="statusOptions"
                    :label="t('world.crm.tasks.form.status')"
                    :disabled="!isRootAdmin"
                /></v-col>
                <v-col cols="12" md="6"
                  ><AppSelect
                    v-model="payload.priority"
                    :items="priorityOptions"
                    :label="t('world.crm.tasks.form.priority')"
                    :disabled="!isRootAdmin"
                /></v-col>
                <v-col cols="12" md="6"
                  ><v-text-field
                    v-model="payload.dueAt"
                    :label="t('world.crm.tasks.form.dueAt')"
                    type="date"
                    :readonly="!isRootAdmin"
                /></v-col>
                <v-col cols="12" md="6"
                  ><v-text-field
                    v-model="payload.estimatedHours"
                    :label="t('world.crm.tasks.form.estimatedHours')"
                    type="number"
                    :readonly="!isRootAdmin"
                /></v-col>
                <v-col cols="12"
                  ><v-textarea
                    v-model="payload.description"
                    :label="t('world.crm.tasks.form.description')"
                    :readonly="!isRootAdmin"
                /></v-col>
              </v-row>
              <div v-if="isRootAdmin" class="d-flex ga-2">
                <v-btn color="primary" :loading="pendingSave" @click="save">{{
                  t('world.crm.tasks.actions.save')
                }}</v-btn>
                <v-btn color="error" variant="tonal" @click="remove">{{
                  t('world.crm.tasks.actions.delete')
                }}</v-btn>
              </div>
            </template>
          </v-card>

          <v-card
            v-if="!isViewMode"
            rounded="xl"
            class="pa-4 postcard-gradient-card"
          >
            <h3 class="text-subtitle-1 mb-3">
              {{ t('world.crm.tasks.sections.subtasks') }}
            </h3>
            <v-row>
              <v-col cols="12" md="6"
                ><v-text-field
                  v-model="newSubtask.title"
                  :label="t('world.crm.tasks.form.subtaskTitle')"
                  :readonly="!isRootAdmin"
              /></v-col>
              <v-col cols="12" md="6"
                ><v-text-field
                  v-model="newSubtask.status"
                  :label="t('world.crm.tasks.form.status')"
                  :readonly="!isRootAdmin"
              /></v-col>
              <v-col cols="12"
                ><v-textarea
                  v-model="newSubtask.description"
                  :label="t('world.crm.tasks.form.description')"
                  :readonly="!isRootAdmin"
              /></v-col>
            </v-row>
            <v-btn
              v-if="isRootAdmin"
              color="secondary"
              variant="tonal"
              class="mb-3"
              @click="createSubtask"
              >{{ t('world.crm.tasks.actions.createSubtask') }}</v-btn
            >

            <AppSelect
              v-model="subtaskToAttach"
              :items="taskOptions"
              item-title="title"
              item-value="value"
              :label="t('world.crm.tasks.form.subtaskIdToAttach')"
              class="mb-2"
              :disabled="!isRootAdmin"
            />
            <v-btn
              v-if="isRootAdmin"
              color="secondary"
              variant="tonal"
              class="mb-3"
              @click="attachSubtask"
              >{{ t('world.crm.tasks.actions.attachSubtask') }}</v-btn
            >

            <v-list density="compact" class="bg-transparent">
              <v-list-item
                v-for="subtask in data.subTasks"
                :key="subtask.id"
                :title="subtask.title"
                :subtitle="subtask.status"
              >
                <template v-if="isRootAdmin" #append>
                  <v-btn
                    size="small"
                    icon="mdi-link-off"
                    variant="text"
                    color="error"
                    @click="detachSubtask(subtask.id)"
                  />
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>

        <v-col v-if="hasBlogPlugin" cols="12">
          <CrmBlogCard />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
