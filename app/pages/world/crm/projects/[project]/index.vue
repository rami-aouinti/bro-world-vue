<script setup lang="ts">
import type {
  CrmIdResponse,
  CrmProjectItem,
  CrmProjectUpdatePayload,
} from '~~/server/types/api/crm-general'

type ProjectTask = {
  id: string
  title?: string
  TITLE?: string
  description?: string
  status?: string
  dueAt?: string | null
}

type ProjectRepository = {
  id: string
  owner?: string
  name?: string
  fullName?: string
  defaultBranch?: string
  syncStatus?: string
}

type ProjectWikiPage = {
  id: string
  title?: string
  content?: string
  createdAt?: string | null
}

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { crmNavItems } = useWorldCrmNavItems()
const { sessionUser } = useCrmPermissions()
const isRootAdmin = computed(() =>
  (sessionUser.value?.roles ?? []).includes('ROLE_ROOT'),
)
const projectId = computed(() => String(route.params.project ?? ''))
const isViewMode = computed(() => route.query.mode === 'view')

definePageMeta({ layout: 'crm', title: 'CRM Project Detail' })

const editPayload = reactive<CrmProjectUpdatePayload>({})
const assigneeId = ref('')
const pendingSave = ref(false)
const statusOptions = ['planned', 'in_progress', 'on_hold', 'completed']
const { data: usersData } = await useFetch<Record<string, any>>('/api/public/users')

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

const { data, pending, error, refresh } = await useFetch<CrmProjectItem>(
  () => `/api/crm/general/projects/${projectId.value}`,
)

const projectTasks = computed<ProjectTask[]>(() =>
  Array.isArray(data.value?.tasks) ? (data.value?.tasks as ProjectTask[]) : [],
)
const projectRepositories = computed<ProjectRepository[]>(() =>
  Array.isArray(data.value?.githubRepositories) ? (data.value?.githubRepositories as ProjectRepository[]) : [],
)
const projectWikiPages = computed<ProjectWikiPage[]>(() =>
  Array.isArray(data.value?.wikiPages) ? (data.value?.wikiPages as ProjectWikiPage[]) : [],
)

function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString()
}

function toTaskLabel(task: ProjectTask) {
  return task.title || task.TITLE || task.id
}

function repositoryRoute(repository: ProjectRepository) {
  const rawName = repository.fullName || repository.name || repository.id
  return `/world/crm/repositories/${projectId.value}/${encodeURIComponent(rawName)}`
}

watchEffect(() => {
  if (!data.value) return
  Object.assign(editPayload, {
    name: data.value.name,
    code: data.value.code,
    description: data.value.description,
    status: data.value.status,
    startedAt: data.value.startedAt ?? undefined,
    dueAt: data.value.dueAt ?? undefined,
  })
})

async function saveProject() {
  if (!isRootAdmin.value) return
  pendingSave.value = true
  try {
    await $fetch<CrmIdResponse>(`/api/crm/general/projects/${projectId.value}`, {
      method: 'PATCH',
      body: editPayload,
    })
    await refresh()
  } finally {
    pendingSave.value = false
  }
}

async function deleteProject() {
  if (!isRootAdmin.value) return
  await $fetch(`/api/crm/general/projects/${projectId.value}`, { method: 'DELETE' })
  await router.push('/world/crm/projects')
}

async function attachAssignee() {
  if (!isRootAdmin.value) return
  if (!assigneeId.value.trim()) return
  await $fetch(`/api/crm/general/projects/${projectId.value}/assignees/${encodeURIComponent(assigneeId.value.trim())}`, { method: 'PUT' })
  assigneeId.value = ''
  await refresh()
}

async function detachAssignee(userId: string) {
  if (!isRootAdmin.value) return
  await $fetch(`/api/crm/general/projects/${projectId.value}/assignees/${encodeURIComponent(userId)}`, {
    method: 'DELETE',
  })
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
        <div v-if="isViewMode">
          <p class="text-caption mb-1">{{ t('world.crm.projects.form.description') }}</p>
          <p class="text-body-2 mb-4">{{ data.description || '—' }}</p>

          <div class="d-flex align-center justify-space-between mb-2">
            <h3 class="text-subtitle-2 mb-0">Wiki</h3>
            <v-btn
              size="small"
              variant="text"
              color="primary"
              :to="`/world/crm/projects/${projectId}/wiki`"
            >
              Voir tout
            </v-btn>
          </div>
          <v-list v-if="projectWikiPages.length" density="compact" bg-color="transparent" class="py-0">
            <v-list-item
              v-for="wiki in projectWikiPages"
              :key="wiki.id"
              :title="wiki.title || wiki.id"
              :subtitle="formatDate(wiki.createdAt)"
              :to="`/world/crm/projects/${projectId}/wiki?wiki=${encodeURIComponent(wiki.id)}`"
            />
          </v-list>
          <p v-else class="text-body-2 text-medium-emphasis mb-0">Aucune page wiki.</p>
        </div>
        <div v-else>
          <h3 class="text-subtitle-1 mb-3">{{ t('world.crm.projects.sections.assignees') }}</h3>
          <AppSelect
            v-model="assigneeId"
            :items="publicUserOptions"
            item-title="title"
            item-value="value"
            :label="t('world.crm.projects.form.userId')"
            class="mb-2"
            :disabled="!isRootAdmin || isViewMode"
          />
          <v-btn v-if="isRootAdmin && !isViewMode" color="secondary" variant="tonal" class="mb-4" @click="attachAssignee">{{ t('world.crm.projects.actions.attach') }}</v-btn>
          <v-list density="compact" bg-color="transparent">
            <v-list-item
              v-for="assignee in data.assignees"
              :key="String((assignee as any).id ?? assignee)"
              :title="String((assignee as any).username ?? (assignee as any).id ?? assignee)"
            >
              <template v-if="isRootAdmin && !isViewMode" #append>
                <v-btn
                  size="small"
                  color="error"
                  variant="text"
                  icon="mdi-close"
                  @click="detachAssignee(String((assignee as any).id ?? assignee))"
                />
              </template>
            </v-list-item>
          </v-list>
        </div>
      </template>
    </WorldModuleShell>
    <v-container fluid>

    <CrmPageSkeleton v-if="pending" variant="detail" />
    <v-alert v-else-if="error" type="error" variant="tonal">{{ t('world.crm.projects.alerts.notFound') }}</v-alert>

    <v-row v-else-if="data">
      <v-card rounded="xl" class="pa-4 postcard-gradient-card mb-4">
          <template v-if="isViewMode">
            <div class="d-flex justify-space-between align-start ga-2 mb-4">
              <h2 class="text-h6 mb-0">{{ data.name }}</h2>
              <v-chip color="primary" variant="tonal">{{ data.status }}</v-chip>
            </div>
            <v-row>
              <v-col cols="12" md="6">
                <v-card variant="tonal" color="primary" class="pa-3 h-100">
                  <p class="text-caption mb-1">Code</p>
                  <p class="text-body-1 mb-0">{{ data.code || '—' }}</p>
                </v-card>
              </v-col>
              <v-col cols="12" md="6">
                <v-card variant="tonal" color="info" class="pa-3 h-100">
                  <p class="text-caption mb-1">Provisioning</p>
                  <p class="text-body-1 mb-0">{{ data.provisioning?.state || '—' }}</p>
                </v-card>
              </v-col>
              <v-col cols="12" md="6">
                <v-card variant="text" class="pa-3 h-100">
                  <p class="text-caption mb-1">Start date</p>
                  <p class="text-body-1 mb-0">{{ data.startedAt || '—' }}</p>
                </v-card>
              </v-col>
              <v-col cols="12" md="6">
                <v-card variant="text" class="pa-3 h-100">
                  <p class="text-caption mb-1">Due date</p>
                  <p class="text-body-1 mb-0">{{ data.dueAt || '—' }}</p>
                </v-card>
              </v-col>
            </v-row>
          </template>
          <template v-else>
            <h2 class="text-h6 mb-4">{{ data.name }}</h2>
            <v-row>
              <v-col cols="12" md="6"><v-text-field v-model="editPayload.name" :label="t('world.crm.projects.form.name')" :readonly="!isRootAdmin" /></v-col>
              <v-col cols="12" md="6"><v-text-field v-model="editPayload.code" :label="t('world.crm.projects.form.code')" :readonly="!isRootAdmin" /></v-col>
              <v-col cols="12" md="6"><AppSelect v-model="editPayload.status" :items="statusOptions" :label="t('world.crm.projects.form.status')" :disabled="!isRootAdmin" /></v-col>
              <v-col cols="12" md="6"><v-text-field v-model="editPayload.startedAt" :label="t('world.crm.projects.form.startedAt')" type="date" :readonly="!isRootAdmin" /></v-col>
              <v-col cols="12" md="6"><v-text-field v-model="editPayload.dueAt" :label="t('world.crm.projects.form.dueAt')" type="date" :readonly="!isRootAdmin" /></v-col>
              <v-col cols="12"><v-textarea v-model="editPayload.description" :label="t('world.crm.projects.form.description')" :readonly="!isRootAdmin" /></v-col>
            </v-row>
            <div v-if="isRootAdmin" class="d-flex ga-2">
              <v-btn color="primary" :loading="pendingSave" @click="saveProject">{{ t('world.crm.projects.actions.save') }}</v-btn>
              <v-btn color="error" variant="tonal" @click="deleteProject">{{ t('world.crm.projects.actions.delete') }}</v-btn>
            </div>
          </template>
        </v-card>

        <v-col v-if="isViewMode" cols="12" md="6">
          <v-card rounded="xl" class="pa-4 h-100">
            <div class="d-flex align-center justify-space-between mb-3">
              <h3 class="text-subtitle-1 mb-0">Tasks</h3>
              <v-chip size="small" color="primary" variant="tonal">{{ projectTasks.length }}</v-chip>
            </div>
            <v-row v-if="projectTasks.length">
              <v-col v-for="task in projectTasks" :key="task.id" cols="12">
                <v-card
                  variant="tonal"
                  color="primary"
                  class="pa-3 cursor-pointer"
                  :to="`/world/crm/tasks/${task.id}?mode=view`"
                >
                  <div class="d-flex justify-space-between ga-2">
                    <p class="text-body-1 mb-1">{{ toTaskLabel(task) }}</p>
                    <v-chip size="x-small" variant="flat">{{ task.status || '—' }}</v-chip>
                  </div>
                  <p class="text-caption mb-0 text-medium-emphasis">
                    Due: {{ formatDate(task.dueAt) }}
                  </p>
                </v-card>
              </v-col>
            </v-row>
            <p v-else class="text-body-2 text-medium-emphasis mb-0">Aucune task liée à ce projet.</p>
          </v-card>
        </v-col>

        <v-col v-if="isViewMode" cols="12" md="6">
          <v-card rounded="xl" class="pa-4 h-100">
            <div class="d-flex align-center justify-space-between mb-3">
              <h3 class="text-subtitle-1 mb-0">Repositories</h3>
              <v-chip size="small" color="info" variant="tonal">{{ projectRepositories.length }}</v-chip>
            </div>
            <v-row v-if="projectRepositories.length">
              <v-col v-for="repository in projectRepositories" :key="repository.id" cols="12">
                <v-card
                  variant="tonal"
                  color="info"
                  class="pa-3 cursor-pointer"
                  :to="repositoryRoute(repository)"
                >
                  <p class="text-body-1 mb-1">{{ repository.fullName || repository.name || repository.id }}</p>
                  <p class="text-caption mb-0 text-medium-emphasis">
                    {{ repository.defaultBranch || '—' }} · {{ repository.syncStatus || '—' }}
                  </p>
                </v-card>
              </v-col>
            </v-row>
            <p v-else class="text-body-2 text-medium-emphasis mb-0">Aucun repository lié à ce projet.</p>
          </v-card>
        </v-col>
    </v-row>
    </v-container>
  </div>
</template>
