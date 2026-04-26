<script setup lang="ts">
import type { CrmTaskRequestItem, CrmTaskRequestUpdatePayload } from '~~/server/types/api/crm-general'

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { crmNavItems, hasBlogPlugin } = useWorldCrmNavItems()
const { sessionUser } = useCrmPermissions()
const isRootAdmin = computed(() =>
  (sessionUser.value?.roles ?? []).includes('ROLE_ROOT'),
)
const id = computed(() => String(route.params.taskRequest ?? ''))
const isViewMode = computed(() => route.query.mode === 'view')

definePageMeta({ layout: 'crm', title: 'CRM Task Request Detail' })

const payload = reactive<CrmTaskRequestUpdatePayload>({})
const statusOptions = ['pending', 'in_progress', 'approved', 'rejected']
const { data, pending, error, refresh } = useFetch<CrmTaskRequestItem>(() => `/api/crm/general/task-requests/${id.value}`)
const isAssignedEmployee = computed(() =>
  Boolean(
    data.value?.assignees?.some((assignee) => String(assignee.id) === String(sessionUser.value?.id ?? '')),
  ),
)
const canTrackWork = computed(() => isRootAdmin.value || isAssignedEmployee.value)
const crmReferencesStore = useCrmReferenceOptionsStore()
await crmReferencesStore.fetchEmployees()
const assigneeId = ref('')
const selectedFile = ref<File | null>(null)
const branchProvider = ref<'github' | 'gitlab'>('github')
const branchName = ref('')
const sourceBranch = ref('develop')
const branches = ref<Array<Record<string, unknown>>>([])
const loadingBranches = ref(false)
const timerElapsedSeconds = ref(0)
const timerRunning = ref(false)
const timerAnchor = ref<number | null>(null)
const timerInterval = ref<ReturnType<typeof setInterval> | null>(null)
const worklogPending = ref(false)
const worklogError = ref('')
const worklogSuccess = ref('')

const timerLabel = computed(() => {
  const total = timerElapsedSeconds.value
  const hours = String(Math.floor(total / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((total % 3600) / 60)).padStart(2, '0')
  const seconds = String(total % 60).padStart(2, '0')
  return `${hours}:${minutes}:${seconds}`
})

const activeEmployeeId = computed(() => {
  if (!data.value?.assignees?.length) return ''
  const currentUserAssignee = data.value.assignees.find((assignee) =>
    String(assignee.id) === String(sessionUser.value?.id ?? ''),
  )
  if (currentUserAssignee?.employeeId) return String(currentUserAssignee.employeeId)

  if (isRootAdmin.value) {
    const assigneeWithEmployee = data.value.assignees.find((assignee) => assignee.employeeId)
    return String(assigneeWithEmployee?.employeeId ?? '')
  }

  return ''
})

const publicUserOptions = computed(() => crmReferencesStore.employeeAssigneeOptions)

function assigneeDisplayName(assignee: any) {
  const firstName = String(assignee?.firstName ?? assignee?.userFirstName ?? '').trim()
  const lastName = String(assignee?.lastName ?? assignee?.userLastName ?? '').trim()
  const fullName = `${firstName} ${lastName}`.trim()
  return fullName || String(assignee?.username ?? assignee?.email ?? assignee?.id ?? assignee ?? '—')
}

watchEffect(() => {
  if (!data.value) return
  Object.assign(payload, {
    title: data.value.title,
    description: data.value.description,
    status: data.value.status,
    resolvedAt: data.value.resolvedAt,
  })
})

async function save() {
  await $fetch(`/api/crm/general/task-requests/${id.value}`, { method: 'PATCH', body: payload })
  await refresh()
}

async function attachAssignee() {
  if (!isRootAdmin.value) return
  if (!assigneeId.value.trim()) return
  await $fetch(`/api/crm/general/task-requests/${id.value}/assignees/${encodeURIComponent(assigneeId.value.trim())}`, { method: 'PUT' })
  assigneeId.value = ''
  await refresh()
}

async function detachAssignee(userId: string) {
  if (!isRootAdmin.value) return
  await $fetch(`/api/crm/general/task-requests/${id.value}/assignees/${encodeURIComponent(userId)}`, { method: 'DELETE' })
  await refresh()
}

async function uploadFile() {
  if (!isRootAdmin.value) return
  if (!selectedFile.value) return

  const formData = new FormData()
  formData.append('files', selectedFile.value)
  await $fetch(`/api/crm/general/task-requests/${id.value}/files`, {
    method: 'POST',
    body: formData,
  })
  selectedFile.value = null
  await refresh()
}

async function removeAttachment(index: number) {
  if (!isRootAdmin.value || !data.value?.attachments) return
  const nextAttachments = data.value.attachments.filter((_, currentIndex) => currentIndex !== index)
  await $fetch(`/api/crm/general/task-requests/${id.value}`, {
    method: 'PATCH',
    body: {
      attachments: nextAttachments,
    },
  })
  await refresh()
}

function branchRecordId(branch: Record<string, unknown>) {
  return String(branch.id ?? branch.name ?? branch.branch ?? branch.ref ?? '')
}

function branchRecordLabel(branch: Record<string, unknown>) {
  return String(branch.name ?? branch.branch ?? branch.ref ?? branch.id ?? 'Unknown branch')
}

async function loadBranches() {
  if (!id.value) return
  loadingBranches.value = true
  try {
    const response = await $fetch<{ items?: Array<Record<string, unknown>> }>(
      `/api/crm/general/task-requests/${id.value}/${branchProvider.value}/branches`,
    )
    branches.value = response.items ?? []
  } finally {
    loadingBranches.value = false
  }
}

async function createBranch() {
  if (!isRootAdmin.value) return
  if (!branchName.value.trim()) return
  await $fetch(`/api/crm/general/task-requests/${id.value}/${branchProvider.value}/branches`, {
    method: 'POST',
    body: {
      name: branchName.value.trim(),
      sourceBranch: sourceBranch.value.trim() || undefined,
      postCommentOnIssue: true,
    },
  })
  branchName.value = ''
  await loadBranches()
  await refresh()
}

async function deleteBranch(branch: Record<string, unknown>) {
  if (!isRootAdmin.value) return
  const branchId = branchRecordId(branch)
  if (!branchId) return
  await $fetch(`/api/crm/general/task-requests/${id.value}/${branchProvider.value}/branches/${encodeURIComponent(branchId)}`, {
    method: 'DELETE',
  })
  await loadBranches()
  await refresh()
}

watch(branchProvider, () => {
  loadBranches()
})

watch(id, () => {
  loadBranches()
}, { immediate: true })

async function remove() {
  await $fetch(`/api/crm/general/task-requests/${id.value}`, { method: 'DELETE' })
  await router.push('/world/crm/task-requests')
}

function clearTimerInterval() {
  if (!timerInterval.value) return
  clearInterval(timerInterval.value)
  timerInterval.value = null
}

function syncTimerElapsed() {
  if (!timerAnchor.value) return
  const diffSeconds = Math.floor((Date.now() - timerAnchor.value) / 1000)
  timerElapsedSeconds.value = Math.max(0, diffSeconds)
}

function startTimer() {
  if (!canTrackWork.value || worklogPending.value) return
  if (!activeEmployeeId.value) {
    worklogError.value = 'No employeeId available for this user.'
    return
  }
  if (timerRunning.value) return
  worklogError.value = ''
  worklogSuccess.value = ''
  timerRunning.value = true
  timerAnchor.value = Date.now() - (timerElapsedSeconds.value * 1000)
  clearTimerInterval()
  timerInterval.value = setInterval(syncTimerElapsed, 1000)
}

async function submitWorklog(reason: 'pause' | 'stop') {
  if (!canTrackWork.value || worklogPending.value) return
  if (!activeEmployeeId.value) {
    worklogError.value = 'No employeeId available for this user.'
    return
  }

  syncTimerElapsed()
  if (!timerElapsedSeconds.value) {
    timerRunning.value = false
    clearTimerInterval()
    return
  }

  worklogPending.value = true
  worklogError.value = ''
  worklogSuccess.value = ''

  try {
    await $fetch(`/api/crm/general/task-requests/${id.value}/worklogs`, {
      method: 'POST',
      body: {
        employeeId: activeEmployeeId.value,
        hours: Number((timerElapsedSeconds.value / 3600).toFixed(4)),
        comment: `Worklog from timer (${reason})`,
      },
    })
    worklogSuccess.value = `Worklog saved (${reason}).`
    timerRunning.value = false
    clearTimerInterval()
    if (reason === 'stop') {
      timerElapsedSeconds.value = 0
      timerAnchor.value = null
    }
    await refresh()
  } catch {
    worklogError.value = 'Unable to save worklog.'
  } finally {
    worklogPending.value = false
  }
}

onBeforeUnmount(() => {
  clearTimerInterval()
})
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
        <div class="d-flex flex-column ga-4">
          <div>
            <h3 class="text-subtitle-1 mb-3">Work timer</h3>
            <v-alert
              v-if="!canTrackWork"
              type="info"
              variant="tonal"
              density="comfortable"
              class="mb-2"
            >
              Only root or assigned employee can track time.
            </v-alert>
            <p class="text-body-2 mb-2">Timer: <strong>{{ timerLabel }}</strong></p>
            <v-chip size="small" variant="tonal" class="mb-2">
              Employee ID: {{ activeEmployeeId || '—' }}
            </v-chip>
            <div class="d-flex flex-wrap ga-2 mb-2">
              <v-btn
                color="success"
                prepend-icon="mdi-play"
                :disabled="!canTrackWork || timerRunning || worklogPending"
                @click="startTimer"
              >
                Play
              </v-btn>
              <v-btn
                color="warning"
                variant="tonal"
                prepend-icon="mdi-pause"
                :disabled="!canTrackWork || !timerRunning || worklogPending"
                :loading="worklogPending"
                @click="submitWorklog('pause')"
              >
                Pause
              </v-btn>
              <v-btn
                color="error"
                variant="tonal"
                prepend-icon="mdi-stop"
                :disabled="!canTrackWork || (!timerRunning && timerElapsedSeconds === 0) || worklogPending"
                :loading="worklogPending"
                @click="submitWorklog('stop')"
              >
                Stop
              </v-btn>
            </div>
            <v-alert
              v-if="worklogError"
              type="error"
              variant="tonal"
              density="comfortable"
              class="mb-2"
            >
              {{ worklogError }}
            </v-alert>
            <v-alert
              v-if="worklogSuccess"
              type="success"
              variant="tonal"
              density="comfortable"
              class="mb-2"
            >
              {{ worklogSuccess }}
            </v-alert>
          </div>

          <div>
            <h3 class="text-subtitle-1 mb-3">Assignees</h3>
            <AppSelect
              v-model="assigneeId"
              :items="publicUserOptions"
              item-title="title"
              item-value="value"
              label="Employee"
              class="mb-2"
              :disabled="!isRootAdmin"
            >
              <template #item="{ props, item }">
                <v-list-item v-bind="props" :title="item?.raw?.title || undefined" :subtitle="item?.raw?.subtitle || undefined">
                  <template #prepend>
                    <v-avatar size="24">
                      <v-img :src="item?.raw?.avatar || '/img/avatar_default.svg'" :alt="item?.raw?.title || 'Employee avatar'" />
                    </v-avatar>
                  </template>
                </v-list-item>
              </template>
              <template #selection="{ item }">
                <div class="d-flex align-center ga-2">
                  <v-avatar size="20">
                    <v-img :src="item?.raw?.avatar || '/img/avatar_default.svg'" :alt="item?.raw?.title || 'Employee avatar'" />
                  </v-avatar>
                  <span v-if="item?.raw?.title">{{ item?.raw?.title }}</span>
                </div>
              </template>
            </AppSelect>
            <v-btn
              color="secondary"
              variant="tonal"
              class="mb-2"
              :disabled="!isRootAdmin"
              @click="attachAssignee"
            >
              Assign employee
            </v-btn>
            <v-list density="compact" bg-color="transparent">
              <v-list-item
                v-for="assignee in data?.assignees ?? []"
                :key="String(assignee.id)"
                :title="assigneeDisplayName(assignee)"
                :subtitle="String(assignee.email ?? '')"
              >
                <template #prepend>
                  <v-avatar size="24">
                    <v-img :src="String(assignee.photo ?? '/img/avatar_default.svg')" :alt="assigneeDisplayName(assignee)" />
                  </v-avatar>
                </template>
                <template v-if="isRootAdmin" #append>
                  <v-btn
                    size="small"
                    color="error"
                    variant="text"
                    icon="mdi-close"
                    @click="detachAssignee(String(assignee.id))"
                  />
                </template>
              </v-list-item>
            </v-list>
          </div>

          <div>
            <h3 class="text-subtitle-1 mb-3">Files</h3>
            <v-file-input
              v-model="selectedFile"
              label="Add file"
              prepend-icon="mdi-paperclip"
              density="comfortable"
              clearable
              show-size
              :disabled="!isRootAdmin"
            />
            <v-btn
              color="secondary"
              variant="tonal"
              class="mb-2"
              :disabled="!isRootAdmin || !selectedFile"
              @click="uploadFile"
            >
              Upload file
            </v-btn>
            <v-list density="compact" bg-color="transparent">
              <v-list-item
                v-for="(attachment, index) in data?.attachments ?? []"
                :key="attachment.id || attachment.url || attachment.name || index"
                :title="String(attachment.originalName ?? attachment.name ?? attachment.url ?? `Attachment ${index + 1}`)"
                :subtitle="String(attachment.mimeType ?? '')"
              >
                <template #append>
                  <div class="d-flex align-center ga-1">
                    <v-btn
                      v-if="attachment.url"
                      size="small"
                      variant="text"
                      icon="mdi-open-in-new"
                      :href="attachment.url"
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                    <v-btn
                      v-if="isRootAdmin"
                      size="small"
                      color="error"
                      variant="text"
                      icon="mdi-delete-outline"
                      @click="removeAttachment(index)"
                    />
                  </div>
                </template>
              </v-list-item>
            </v-list>
          </div>

          <div>
            <h3 class="text-subtitle-1 mb-3">Branches</h3>
            <AppSelect
              v-model="branchProvider"
              :items="[
                { title: 'GitHub', value: 'github' },
                { title: 'GitLab', value: 'gitlab' },
              ]"
              item-title="title"
              item-value="value"
              label="Provider"
              class="mb-2"
              :disabled="!isRootAdmin"
            />
            <v-text-field
              v-model="branchName"
              label="Branch name"
              density="comfortable"
              class="mb-2"
              :readonly="!isRootAdmin"
            />
            <v-text-field
              v-model="sourceBranch"
              label="Source branch"
              density="comfortable"
              class="mb-2"
              :readonly="!isRootAdmin"
            />
            <v-btn
              color="secondary"
              variant="tonal"
              class="mb-2"
              :loading="loadingBranches"
              :disabled="!isRootAdmin || !branchName.trim()"
              @click="createBranch"
            >
              Add branch
            </v-btn>
            <v-list density="compact" bg-color="transparent">
              <v-list-item
                v-for="branch in branches"
                :key="branchRecordId(branch)"
                :title="branchRecordLabel(branch)"
                :subtitle="branchRecordId(branch)"
              >
                <template v-if="isRootAdmin" #append>
                  <v-btn
                    size="small"
                    color="error"
                    variant="text"
                    icon="mdi-source-branch-remove"
                    @click="deleteBranch(branch)"
                  />
                </template>
              </v-list-item>
            </v-list>
          </div>

          <div v-if="isViewMode && data">
          <p class="text-caption mb-1">{{ t('world.crm.taskRequests.form.description') }}</p>
          <p class="text-body-2 mb-0">{{ data.description || '—' }}</p>
          </div>
        </div>
      </template>
    </WorldModuleShell>
    <v-container fluid>
      <CrmPageSkeleton v-if="pending" variant="detail" />
      <v-alert v-else-if="error" type="error" variant="tonal">{{ t('world.crm.taskRequests.alerts.notFound') }}</v-alert>
      <v-row v-else-if="data">
        <v-col cols="12">
          <v-card rounded="xl" class="pa-4 postcard-gradient-card">
            <template v-if="isViewMode && data">
              <div class="d-flex justify-space-between align-start ga-2 mb-4">
                <h2 class="text-h6 mb-0">{{ data.title }}</h2>
                <v-chip color="info" variant="tonal">{{ data.status }}</v-chip>
              </div>
              <div class="d-flex flex-wrap ga-2 mb-4">
                <v-chip color="primary" variant="outlined">Task: {{ data.taskId }}</v-chip>
                <v-chip color="secondary" variant="outlined">Repo: {{ data.repositoryId }}</v-chip>
                <v-chip variant="tonal">Resolved: {{ data.resolvedAt || '—' }}</v-chip>
                <v-chip variant="tonal">Assignees: {{ data.assignees?.length || 0 }}</v-chip>
                <v-chip variant="tonal">Files: {{ data.attachments?.length || 0 }}</v-chip>
                <v-chip variant="tonal">Planned: {{ data.plannedHours ?? 0 }} h</v-chip>
                <v-chip variant="tonal">Consumed: {{ data.consumedHours ?? 0 }} h</v-chip>
                <v-chip variant="tonal">Remaining: {{ data.remainingHours ?? 0 }} h</v-chip>
              </div>
              <div class="mb-4">
                <h3 class="text-subtitle-1 mb-2">Attachments</h3>
                <v-list
                  v-if="data.attachments?.length"
                  density="compact"
                  class="bg-transparent pa-0"
                >
                  <v-list-item
                    v-for="(attachment, index) in data.attachments || []"
                    :key="attachment.id || attachment.url || attachment.name || index"
                    :title="attachment.originalName || attachment.name || attachment.url || `Attachment ${index + 1}`"
                    :subtitle="attachment.mimeType || ''"
                    :href="attachment.url"
                    target="_blank"
                    rel="noopener noreferrer"
                    prepend-icon="mdi-download"
                    class="px-0"
                  />
                </v-list>
                <v-alert v-else type="info" variant="tonal" density="comfortable">
                  No attachments
                </v-alert>
              </div>
              <v-divider class="my-4" />
              <div>
                <h3 class="text-subtitle-1 mb-2">Blog</h3>
                <p class="text-body-2 mb-3">
                  {{ data.blog?.title || '—' }}
                </p>
                <div v-if="data.blog?.posts?.length" class="d-flex flex-column ga-3">
                  <v-card
                    v-for="post in data.blog.posts"
                    :key="post.id"
                    variant="outlined"
                    rounded="lg"
                    class="pa-3"
                  >
                    <p class="text-subtitle-2 mb-2">{{ post.title }}</p>
                    <v-list density="compact" class="bg-transparent pa-0">
                      <v-list-item
                        v-for="comment in post.comments || []"
                        :key="comment.id"
                        class="px-0"
                      >
                        <template #title>
                          <span class="text-body-2">{{ comment.content }}</span>
                        </template>
                      </v-list-item>
                    </v-list>
                  </v-card>
                </div>
                <v-alert v-else type="info" variant="tonal" density="comfortable">
                  No blog post yet for this task request.
                </v-alert>
              </div>
            </template>
            <template v-else-if="data">
              <v-row>
                <v-col cols="12"><v-text-field v-model="payload.title" :label="t('world.crm.taskRequests.form.title')" /></v-col>
                <v-col cols="12"><v-textarea v-model="payload.description" :label="t('world.crm.taskRequests.form.description')" /></v-col>
                <v-col cols="12" md="6"><AppSelect v-model="payload.status" :items="statusOptions" :label="t('world.crm.taskRequests.form.status')" /></v-col>
                <v-col cols="12" md="6"><v-text-field v-model="payload.resolvedAt" :label="t('world.crm.taskRequests.form.resolvedAt')" type="date" /></v-col>
              </v-row>
              <div class="d-flex ga-2">
                <v-btn color="primary" @click="save">{{ t('world.crm.taskRequests.actions.save') }}</v-btn>
                <v-btn color="error" variant="tonal" @click="remove">{{ t('world.crm.taskRequests.actions.delete') }}</v-btn>
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
