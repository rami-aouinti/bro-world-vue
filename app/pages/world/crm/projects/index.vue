<script setup lang="ts">
import type {
  ApiListResponse,
  CrmIdResponse,
  CrmProjectCreatePayload,
  CrmProjectListItem,
} from '~~/server/types/api/crm-general'

definePageMeta({ title: 'CRM Projects' })

const router = useRouter()
const { t } = useI18n()
const { crmNavItems } = useWorldCrmNavItems()
const { sessionUser } = useCrmPermissions()
const isRootAdmin = computed(() =>
  (sessionUser.value?.roles ?? []).includes('ROLE_ROOT'),
)

const createDialog = ref(false)
const pendingCreate = ref(false)
const search = ref('')
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

const { data, pending, error, refresh } = await useFetch<ApiListResponse<CrmProjectListItem>>(
  '/api/crm/general/projects',
)

const filteredProjects = computed(() => {
  const query = search.value.trim().toLowerCase()
  const items = data.value?.items ?? []

  if (!query) return items

  return items.filter((project) =>
    [project.name, project.status, project.code, project.id]
      .filter(Boolean)
      .some((value) => String(value).toLowerCase().includes(query)),
  )
})

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredProjects.value.length / itemsPerPage)),
)

const paginatedProjects = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredProjects.value.slice(start, start + itemsPerPage)
})

watch([search, filteredProjects], () => {
  currentPage.value = 1
})

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
</script>

<template>
  <div>
    <WorldModuleDrawers
      :module-title="t('world.crm.label')"
      module-icon="mdi-account-group-outline"
      :module-description="t('world.crm.projects.moduleDescription')"
      :nav-items="crmNavItems"
      :show-action="isRootAdmin"
      :action-label="t('world.crm.projects.actions.newProject')"
      action-icon="mdi-folder-plus-outline"
      @action="isRootAdmin ? (createDialog = true) : undefined"
    />

    <v-container fluid>
      <CrmPageSkeleton v-if="pending" variant="list" :cards="6" />
      <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4">{{ t('world.crm.projects.alerts.loadListError') }}</v-alert>

      <template v-else>
        <v-text-field
          v-model="search"
          class="mb-4"
          prepend-inner-icon="mdi-magnify"
          label="Rechercher un projet"
          clearable
          variant="outlined"
        />

        <v-row>
          <v-col v-for="project in paginatedProjects" :key="project.id" cols="12" md="6" xl="4">
            <v-card rounded="xl" class="pa-4 postcard-gradient-card h-100 d-flex flex-column">
              <div class="d-flex justify-space-between align-start ga-2 mb-2">
                <h3 class="text-subtitle-1 mb-0">{{ project.name }}</h3>
                <v-chip size="small" color="primary" variant="tonal">{{ project.status }}</v-chip>
              </div>
              <p class="text-body-2 mb-1">{{ t('world.crm.projects.list.githubRepos') }}: {{ project.githubRepositoriesCount }}</p>
              <p class="text-body-2 mb-4">{{ t('world.crm.projects.list.provisioning') }}: {{ project.provisioning.state }}</p>
              <v-spacer />
              <v-btn color="primary" variant="tonal" prepend-icon="mdi-arrow-right" @click="router.push(`/world/crm/projects/${project.id}`)">
                {{ t('world.crm.projects.actions.viewDetails') }}
              </v-btn>
            </v-card>
          </v-col>

          <v-col v-if="paginatedProjects.length === 0" cols="12">
            <v-alert type="info" variant="tonal">Aucun projet trouvé.</v-alert>
          </v-col>
        </v-row>

        <div v-if="totalPages > 1" class="d-flex justify-center mt-6">
          <v-pagination v-model="currentPage" :length="totalPages" rounded="circle" />
        </div>
      </template>
    </v-container>

    <AppModal v-if="isRootAdmin" v-model="createDialog" :title="t('world.crm.projects.modal.createTitle')" :max-width="720">
      <v-row>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.companyId" :label="t('world.crm.projects.form.companyId')" required /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.name" :label="t('world.crm.projects.form.name')" required /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.code" :label="t('world.crm.projects.form.code')" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.status" :label="t('world.crm.projects.form.status')" /></v-col>
        <v-col cols="12"><v-textarea v-model="createPayload.description" :label="t('world.crm.projects.form.description')" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.startedAt" :label="t('world.crm.projects.form.startedAt')" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.dueAt" :label="t('world.crm.projects.form.dueAt')" /></v-col>
      </v-row>
      <template #actions>
        <v-btn variant="text" @click="createDialog = false">{{ t('world.crm.projects.actions.cancel') }}</v-btn>
        <v-btn color="primary" :loading="pendingCreate" @click="createProject">{{ t('world.crm.projects.actions.create') }}</v-btn>
      </template>
    </AppModal>
  </div>
</template>
