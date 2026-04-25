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
const { data: usersData } = useFetch<Record<string, any>>('/api/public/users')
const assigneeId = ref('')
const selectedFile = ref<File | null>(null)
const branchProvider = ref<'github' | 'gitlab'>('github')
const branchName = ref('')
const sourceBranch = ref('develop')
const branches = ref<Array<Record<string, unknown>>>([])
const loadingBranches = ref(false)

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
            <h3 class="text-subtitle-1 mb-3">Assignees</h3>
            <AppSelect
              v-model="assigneeId"
              :items="publicUserOptions"
              item-title="title"
              item-value="value"
              label="Employee"
              class="mb-2"
              :disabled="!isRootAdmin"
            />
            <v-btn
              color="secondary"
              variant="tonal"
              class="mb-2"
              :disabled="!isRootAdmin"
              @click="attachAssignee"
            >
              Assign user
            </v-btn>
            <v-list density="compact" bg-color="transparent">
              <v-list-item
                v-for="assignee in data?.assignees ?? []"
                :key="String(assignee.id)"
                :title="String(assignee.username ?? assignee.email ?? assignee.id)"
                :subtitle="String(assignee.email ?? '')"
              >
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
