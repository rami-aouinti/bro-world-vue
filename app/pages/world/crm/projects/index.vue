<script setup lang="ts">
import type {
  ApiListResponse,
  CrmCompanyItem,
  CrmIdResponse,
  CrmProjectCreatePayload,
  CrmProjectItem,
  CrmProjectListItem,
} from '~~/server/types/api/crm-general'

definePageMeta({ layout: 'crm', title: 'CRM Projects' })

const router = useRouter()
const { t } = useI18n()
const { crmNavItems } = useWorldCrmNavItems()
const { sessionUser } = useCrmPermissions()
const isRootAdmin = computed(() =>
  (sessionUser.value?.roles ?? []).includes('ROLE_ROOT'),
)
const isAdminOrRoot = computed(() => {
  const roles = sessionUser.value?.roles ?? []
  return roles.includes('ROLE_ROOT') || roles.includes('ROLE_ADMIN')
})

function provisioningColor(state: string | null | undefined) {
  const normalized = String(state ?? '').toLowerCase()
  if (normalized === 'ready') return 'success'
  if (normalized === 'pending') return 'warning'
  if (normalized === 'error') return 'error'
  return 'secondary'
}

const createDialog = ref(false)
const pendingCreate = ref(false)
const pendingDelete = ref(false)
const deleteDialog = ref(false)
const projectToDelete = ref<string | null>(null)
const search = ref('')
const statusFilter = ref<string | null>(null)
const provisioningFilter = ref<string | null>(null)
const startedAfter = ref<string | null>(null)
const dueBefore = ref<string | null>(null)
const currentPage = ref(1)
const itemsPerPage = 9
const createPayload = reactive<CrmProjectCreatePayload>({
  companyId: '',
  name: '',
  code: '',
  description: '',
  status: 'planned',
  startedAt: '',
  dueAt: '',
})

const { data, pending, error, refresh } = useFetch<
  ApiListResponse<CrmProjectListItem>
>('/api/crm/general/projects')
const { data: companiesData } = useFetch<ApiListResponse<CrmCompanyItem>>(
  '/api/crm/general/companies',
)

const filteredProjects = computed(() => {
  const query = search.value.trim().toLowerCase()
  const items = data.value?.items ?? []

  return items.filter((project) => {
    const detailedProject = project as CrmProjectListItem &
      Partial<CrmProjectItem>
    const matchesSearch =
      !query ||
      [project.name, project.status, detailedProject.code, project.id]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query))
    const matchesStatus =
      !statusFilter.value || project.status === statusFilter.value
    const matchesStartDate =
      !startedAfter.value ||
      !detailedProject.startedAt ||
      new Date(detailedProject.startedAt) >= new Date(startedAfter.value)
    const matchesDueDate =
      !dueBefore.value ||
      !detailedProject.dueAt ||
      new Date(detailedProject.dueAt) <= new Date(dueBefore.value)
    const matchesProvisioning =
      !provisioningFilter.value ||
      detailedProject.provisioning?.state === provisioningFilter.value

    return (
      matchesSearch &&
      matchesStatus &&
      matchesStartDate &&
      matchesDueDate &&
      matchesProvisioning
    )
  })
})

const projectStatusOptions = computed(() =>
  Array.from(
    new Set(
      (data.value?.items ?? [])
        .map((project) => project.status)
        .filter(Boolean),
    ),
  ),
)
const provisioningOptions = computed(() =>
  Array.from(
    new Set(
      (data.value?.items ?? [])
        .map((project) => project.provisioning?.state)
        .filter(Boolean),
    ),
  ),
)
const projectCreateStatusOptions = computed(() =>
  Array.from(
    new Set([
      'planned',
      'in_progress',
      'on_hold',
      'completed',
      ...projectStatusOptions.value,
    ]),
  ),
)
const companyOptions = computed(() =>
  (companiesData.value?.items ?? []).map((company) => ({
    title: company.name,
    value: company.id,
  })),
)

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredProjects.value.length / itemsPerPage)),
)

const paginatedProjects = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredProjects.value.slice(start, start + itemsPerPage)
})

watch(
  [
    search,
    statusFilter,
    provisioningFilter,
    startedAfter,
    dueBefore,
    filteredProjects,
  ],
  () => {
    currentPage.value = 1
  },
)

async function createProject() {
  if (!isRootAdmin.value) return
  pendingCreate.value = true
  try {
    await $fetch<CrmIdResponse>('/api/crm/general/projects', {
      method: 'POST',
      body: {
        ...createPayload,
        startedAt: createPayload.startedAt || undefined,
        dueAt: createPayload.dueAt || undefined,
      },
    })
    createDialog.value = false
    await refresh()
  } finally {
    pendingCreate.value = false
  }
}

function openDeleteDialog(projectId: string) {
  projectToDelete.value = projectId
  deleteDialog.value = true
}

async function deleteProject() {
  if (!projectToDelete.value) return
  pendingDelete.value = true
  try {
    await $fetch(`/api/crm/general/projects/${projectToDelete.value}`, {
      method: 'DELETE',
    })
    deleteDialog.value = false
    projectToDelete.value = null
    await refresh()
  } finally {
    pendingDelete.value = false
  }
}
</script>

<template>
  <div>
    <WorldModuleShell
      :module-title="t('world.crm.label')"
      module-icon="mdi-account-group-outline"
      :module-description="t('world.crm.projects.moduleDescription')"
      :nav-items="crmNavItems"
      activate-right-drawer
    >
      <template #right>
        <div class="d-flex flex-column ga-3">
          <v-btn
            v-if="isRootAdmin"
            color="primary"
            prepend-icon="mdi-folder-plus-outline"
            block
            @click="createDialog = true"
          >
            {{ t('world.crm.projects.actions.newProject') }}
          </v-btn>
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            :label="t('world.crm.filters.search')"
            clearable
            variant="outlined"
            hide-details
          />
          <AppSelect
            v-model="statusFilter"
            :items="projectStatusOptions"
            :label="t('world.crm.filters.status')"
            clearable
          />
          <AppSelect
            v-model="provisioningFilter"
            :items="provisioningOptions"
            :label="t('world.crm.filters.provisioning')"
            clearable
          />
          <v-text-field
            v-model="startedAfter"
            type="date"
            :label="t('world.crm.filters.startAfter')"
            variant="outlined"
            hide-details
            clearable
          />
          <v-text-field
            v-model="dueBefore"
            type="date"
            :label="t('world.crm.filters.endBefore')"
            variant="outlined"
            hide-details
            clearable
          />
        </div>
      </template>
    </WorldModuleShell>

    <v-container fluid>
      <CrmPageSkeleton v-if="pending" variant="list" :cards="6" />
      <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4">{{
        t('world.crm.projects.alerts.loadListError')
      }}</v-alert>

      <template v-else>
        <v-row>
          <v-col
            v-for="project in paginatedProjects"
            :key="project.id"
            cols="12"
            md="4"
          >
            <WorldCard
              extra-class="pa-4 platform-style-card h-100 d-flex flex-column"
            >
              <div class="d-flex justify-space-between align-start ga-2 mb-2">
                <div class="d-flex align-center ga-2">
                  <CrmEntityAvatar :label="project.name" :size="24" />
                  <p class="text-subtitle-1 text-truncate mb-0">
                    {{ project.name }}
                  </p>
                </div>
                <v-chip size="small" color="primary" variant="tonal">{{
                  project.status
                }}</v-chip>
              </div>
              <div class="d-flex flex-wrap ga-2 mb-4">
                <v-chip size="small" color="info" variant="tonal">
                  {{ t('world.crm.projects.list.githubRepos') }}:
                  {{ project.githubRepositoriesCount }}
                </v-chip>
                <v-chip
                  size="small"
                  :color="provisioningColor(project.provisioning?.state)"
                  variant="tonal"
                >
                  {{ project.provisioning.state }}
                </v-chip>
              </div>
              <v-spacer />
              <div v-if="isAdminOrRoot" class="d-flex justify-center ga-2 mt-3">
                <v-btn
                  icon="mdi-eye-outline"
                  color="info"
                  variant="text"
                  size="small"
                  @click="
                    router.push(`/world/crm/projects/${project.id}?mode=view`)
                  "
                />
                <v-btn
                  icon="mdi-pencil-outline"
                  color="primary"
                  variant="text"
                  size="small"
                  @click="router.push(`/world/crm/projects/${project.id}`)"
                />
                <v-btn
                  icon="mdi-delete-outline"
                  color="error"
                  variant="text"
                  size="small"
                  @click="openDeleteDialog(project.id)"
                />
              </div>
            </WorldCard>
          </v-col>

          <v-col v-if="paginatedProjects.length === 0" cols="12">
            <v-alert type="info" variant="tonal">{{
              t('world.crm.projects.alerts.empty')
            }}</v-alert>
          </v-col>
        </v-row>

        <div
          v-if="totalPages > 1"
          class="d-flex justify-center mt-6 app-pagination"
        >
          <WorldPagination v-model="currentPage" :length="totalPages" />
        </div>
      </template>
    </v-container>

    <AppModal
      v-if="isRootAdmin"
      v-model="createDialog"
      :title="t('world.crm.projects.modal.createTitle')"
      :max-width="720"
    >
      <v-row>
        <v-col cols="12" md="6">
          <AppSelect
            v-model="createPayload.companyId"
            :items="companyOptions"
            :label="t('world.crm.projects.form.companyId')"
            required
          />
        </v-col>
        <v-col cols="12" md="6"
          ><v-text-field
            v-model="createPayload.name"
            :label="t('world.crm.projects.form.name')"
            required
        /></v-col>
        <v-col cols="12" md="6"
          ><v-text-field
            v-model="createPayload.code"
            :label="t('world.crm.projects.form.code')"
        /></v-col>
        <v-col cols="12" md="6">
          <AppSelect
            v-model="createPayload.status"
            :items="projectCreateStatusOptions"
            :label="t('world.crm.projects.form.status')"
          />
        </v-col>
        <v-col cols="12"
          ><v-textarea
            v-model="createPayload.description"
            :label="t('world.crm.projects.form.description')"
        /></v-col>
        <v-col cols="12" md="6"
          ><v-text-field
            v-model="createPayload.startedAt"
            :label="t('world.crm.projects.form.startedAt')"
            type="date"
        /></v-col>
        <v-col cols="12" md="6"
          ><v-text-field
            v-model="createPayload.dueAt"
            :label="t('world.crm.projects.form.dueAt')"
            type="date"
        /></v-col>
      </v-row>
      <template #actions>
        <v-btn variant="text" @click="createDialog = false">{{
          t('world.crm.projects.actions.cancel')
        }}</v-btn>
        <v-btn
          color="primary"
          :loading="pendingCreate"
          @click="createProject"
          >{{ t('world.crm.projects.actions.create') }}</v-btn
        >
      </template>
    </AppModal>

    <AppModal v-model="deleteDialog" title="Delete project" :max-width="460">
      <p>Are you sure you want to delete this project?</p>
      <template #actions>
        <v-btn variant="text" @click="deleteDialog = false">Cancel</v-btn>
        <v-btn color="error" :loading="pendingDelete" @click="deleteProject"
          >Delete</v-btn
        >
      </template>
    </AppModal>
  </div>
</template>
