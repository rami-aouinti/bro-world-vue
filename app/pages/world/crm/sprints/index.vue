<script setup lang="ts">
import type { CrmIdResponse, CrmSprintCreatePayload } from '~~/server/types/api/crm-general'

interface CrmSprintItem {
  id: string
  name: string
  status: string
  startDate: string
  endDate: string
  projectId: string
}

interface CrmSprintResponse {
  items: CrmSprintItem[]
}

definePageMeta({ title: 'CRM Sprints' })

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
const statusFilter = ref<string | null>(null)
const startAfter = ref<string | null>(null)
const endBefore = ref<string | null>(null)
const currentPage = ref(1)
const itemsPerPage = 9
const createPayload = reactive<CrmSprintCreatePayload>({
  projectId: '',
  name: '',
  goal: '',
  status: 'planned',
})

const { data, pending, error } = await useFetch<CrmSprintResponse>(
  '/api/crm/general/sprints',
)

const filteredSprints = computed(() => {
  const query = search.value.trim().toLowerCase()
  const items = data.value?.items ?? []

  return items.filter((sprint) => {
    const matchesSearch
      = !query
        || [sprint.name, sprint.status, sprint.projectId, sprint.id]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query))
    const matchesStatus = !statusFilter.value || sprint.status === statusFilter.value
    const matchesStartDate = !startAfter.value || new Date(sprint.startDate) >= new Date(startAfter.value)
    const matchesEndDate = !endBefore.value || new Date(sprint.endDate) <= new Date(endBefore.value)

    return matchesSearch && matchesStatus && matchesStartDate && matchesEndDate
  })
})

const sprintStatusOptions = computed(() =>
  Array.from(new Set((data.value?.items ?? []).map((sprint) => sprint.status).filter(Boolean))),
)

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredSprints.value.length / itemsPerPage)),
)

const paginatedSprints = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredSprints.value.slice(start, start + itemsPerPage)
})

watch([search, statusFilter, startAfter, endBefore, filteredSprints], () => {
  currentPage.value = 1
})

function formatDate(value: string) {
  return new Intl.DateTimeFormat(locale.value, {
    dateStyle: 'medium',
  }).format(new Date(value))
}

async function createSprint() {
  if (!isRootAdmin.value) return
  pendingCreate.value = true
  try {
    await $fetch<CrmIdResponse>('/api/crm/general/sprints', {
      method: 'POST',
      body: createPayload,
    })
    createDialog.value = false
    await refreshNuxtData('/api/crm/general/sprints')
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
      :module-description="t('world.crm.sprints.moduleDescription')"
      :nav-items="crmNavItems"
      :show-action="isRootAdmin"
      activate-right-drawer
      :action-label="t('world.crm.sprints.actions.create')"
      action-icon="mdi-plus"
      @action="isRootAdmin ? (createDialog = true) : undefined"
    >
      <template #right>
        <div class="d-flex flex-column ga-3">
          <v-text-field
            v-model="search"
            prepend-inner-icon="mdi-magnify"
            label="Rechercher un sprint"
            clearable
            variant="outlined"
            hide-details
          />
          <v-select v-model="statusFilter" :items="sprintStatusOptions" label="Statut" variant="outlined" clearable hide-details />
          <v-text-field v-model="startAfter" type="date" label="Début après" variant="outlined" hide-details clearable />
          <v-text-field v-model="endBefore" type="date" label="Fin avant" variant="outlined" hide-details clearable />
        </div>
      </template>
    </WorldModuleDrawers>

    <v-container fluid>
      <CrmPageSkeleton v-if="pending" variant="list" :cards="6" />
      <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4"
        >{{ t('world.crm.sprints.alerts.loadListError') }}</v-alert
      >

      <template v-else>
        <v-row>
          <v-col
            v-for="sprint in paginatedSprints"
            :key="sprint.id"
            cols="12"
            md="4"
          >
            <v-card rounded="xl" class="pa-4 postcard-gradient-card crm-list-card h-100">
              <div class="d-flex align-start justify-space-between ga-2 mb-2">
                <h3 class="text-subtitle-1 mb-0">{{ sprint.name }}</h3>
                <v-chip size="small" color="secondary" variant="tonal">{{
                  sprint.status
                }}</v-chip>
              </div>
              <p class="text-caption text-medium-emphasis mb-0 mt-3">
                {{ t('world.crm.sprints.list.start') }}: {{ formatDate(sprint.startDate) }} ·
                {{ t('world.crm.sprints.list.end') }}: {{ formatDate(sprint.endDate) }}
              </p>
              <v-btn
                v-if="isAdminOrRoot"
                class="mt-3"
                color="primary"
                variant="tonal"
                prepend-icon="mdi-arrow-right"
                @click="router.push(`/world/crm/sprints/${sprint.id}`)"
              >
                {{ t('world.crm.sprints.actions.viewDetails') }}
              </v-btn>
            </v-card>
          </v-col>

          <v-col v-if="paginatedSprints.length === 0" cols="12">
            <v-alert type="info" variant="tonal">{{ t('world.crm.sprints.alerts.empty') }}</v-alert>
          </v-col>
        </v-row>

        <div v-if="totalPages > 1" class="d-flex justify-center mt-6">
          <v-pagination v-model="currentPage" :length="totalPages" rounded="circle" />
        </div>
      </template>
    </v-container>

    <AppModal v-if="isRootAdmin" v-model="createDialog" :title="t('world.crm.sprints.modal.createTitle')" :max-width="720">
      <v-row>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.projectId" :label="t('world.crm.sprints.form.projectId')" required /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.name" :label="t('world.crm.sprints.form.name')" required /></v-col>
        <v-col cols="12"><v-textarea v-model="createPayload.goal" :label="t('world.crm.sprints.form.goal')" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.status" :label="t('world.crm.sprints.form.status')" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.startDate" :label="t('world.crm.sprints.form.startDate')" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="createPayload.endDate" :label="t('world.crm.sprints.form.endDate')" /></v-col>
      </v-row>
      <template #actions>
        <v-btn variant="text" @click="createDialog = false">{{ t('world.crm.sprints.actions.cancel') }}</v-btn>
        <v-btn color="primary" :loading="pendingCreate" @click="createSprint">{{ t('world.crm.sprints.actions.create') }}</v-btn>
      </template>
    </AppModal>
  </div>
</template>
