<script setup lang="ts">
import type {
  CrmGithubListResponse,
  CrmGithubWorkflow,
  CrmGithubWorkflowRun,
} from '~/types/world/crmGithub'
import RepositoryItemDetailModal from '~/components/crm/repositories/RepositoryItemDetailModal.vue'

definePageMeta({ layout: 'crm', title: 'CRM Repository Workflows' })

const route = useRoute()
const _router = useRouter()
const { t } = useI18n()
const { crmNavItems } = useWorldCrmNavItems()
const githubStore = useWorldCrmGithubStore()

const projectId = computed(() => String(route.params.project ?? ''))
const repository = computed(() =>
  decodeURIComponent(String(route.params.repository ?? '')),
)
const applicationSlugInput = ref<string>(
  typeof route.query.applicationSlug === 'string'
    ? route.query.applicationSlug
    : '',
)
const applicationSlug = ref(applicationSlugInput.value)
const selectedWorkflowId = ref<string>('')
const detailModalOpen = ref(false)
const statusFilter = ref<string>('')
const runsData = ref<CrmGithubListResponse<CrmGithubWorkflowRun>>({ items: [] })
const pendingRuns = ref(false)
const runsError = ref<unknown>(null)

let applicationSlugDebounce: ReturnType<typeof setTimeout> | null = null
watch(applicationSlugInput, (value) => {
  if (applicationSlugDebounce) clearTimeout(applicationSlugDebounce)
  applicationSlugDebounce = setTimeout(() => {
    applicationSlug.value = value.trim()
  }, 350)
})

const baseQuery = computed(() => ({
  repository: repository.value,
  repo: repository.value,
}))
const runsQuery = computed(() => ({
  ...baseQuery.value,
  ...(selectedWorkflowId.value ? { workflowId: selectedWorkflowId.value } : {}),
  ...(statusFilter.value.trim() ? { status: statusFilter.value.trim() } : {}),
}))

const {
  data: workflowsData,
  pending: pendingWorkflows,
  error: workflowsError,
} = useAsyncData<CrmGithubListResponse<CrmGithubWorkflow>>(
  () =>
    `crm-repository-workflows-page-${projectId.value}-${repository.value}-${applicationSlug.value}`,
  () =>
    githubStore.getScopedActionsWorkflows(
      projectId.value,
      baseQuery.value,
      applicationSlug.value || undefined,
    ),
  {
    watch: [projectId, repository, applicationSlug],
    lazy: true,
    server: false,
    default: () => ({ items: [] }),
  },
)

const workflows = computed(() => workflowsData.value?.items ?? [])
const runs = computed(() => runsData.value?.items ?? [])
const hasWorkflows = computed(() => workflows.value.length > 0)
const showInitialSkeleton = computed(
  () => pendingWorkflows.value && !hasWorkflows.value,
)
const showStaleOverlay = computed(
  () => pendingWorkflows.value && hasWorkflows.value,
)
const selectedWorkflowDetail = computed(
  () =>
    workflows.value.find(
      (item) => String(item.id) === selectedWorkflowId.value,
    ) ?? null,
)

const workflowModalPayload = computed<Record<string, unknown> | null>(() => {
  if (!selectedWorkflowDetail.value) return null
  return {
    ...selectedWorkflowDetail.value,
    runs: runs.value,
  }
})

async function loadWorkflowRuns() {
  if (!selectedWorkflowId.value || !detailModalOpen.value) return
  pendingRuns.value = true
  runsError.value = null

  try {
    runsData.value = await githubStore.getScopedActionsRuns(
      projectId.value,
      runsQuery.value,
      applicationSlug.value || undefined,
    )
  } catch (err) {
    runsError.value = err
  } finally {
    pendingRuns.value = false
  }
}

function openWorkflowDetail(workflowId: string | number) {
  selectedWorkflowId.value = String(workflowId)
  detailModalOpen.value = true
  loadWorkflowRuns()
}

watch([statusFilter, applicationSlug], () => {
  if (detailModalOpen.value) loadWorkflowRuns()
})
watch(detailModalOpen, (open) => {
  if (!open) {
    runsData.value = { items: [] }
    runsError.value = null
  }
})
</script>

<template>
  <div>
    <WorldModuleShell
      :module-title="t('world.crm.label')"
      module-icon="mdi-account-group-outline"
      :module-description="t('world.crm.repositories.moduleDescription')"
      :nav-items="crmNavItems"
      :action-label="
        t('world.crm.repositories.sections.workflows', {
          count: workflows.length,
        })
      "
      action-icon="mdi-robot"
    >
      <template #right>
        <AppSelect
          v-model="statusFilter"
          :items="['queued', 'in_progress', 'completed']"
          :label="t('world.crm.repositories.filters.runStatus')"
          clearable
        />
      </template>
    </WorldModuleShell>

    <v-container fluid>
      <CrmPageSkeleton v-if="showInitialSkeleton" variant="dashboard" />
      <v-alert
        v-else-if="workflowsError"
        type="error"
        variant="tonal"
        class="mb-4"
        >Impossible de charger les workflows.</v-alert
      >

      <div v-else class="position-relative">
        <v-card class="pa-4 postcard-gradient-card" rounded="xl">
          <h2 class="text-subtitle-1 mb-3">
            Workflows ({{ workflows.length }})
          </h2>
          <v-list lines="two" density="compact" class="bg-transparent">
            <v-list-item
              v-for="workflow in workflows"
              :key="workflow.id"
              :active="String(workflow.id) === selectedWorkflowId"
              :title="workflow.name"
              :subtitle="`${workflow.state} • ${workflow.path}`"
              @click="openWorkflowDetail(workflow.id)"
            />
          </v-list>
        </v-card>

        <v-fade-transition>
          <div v-if="showStaleOverlay" class="stale-overlay pa-3 rounded-xl">
            <v-progress-linear indeterminate color="primary" class="mb-2" />
            <p class="text-caption mb-0 text-medium-emphasis">
              {{ t('common.loading', 'Refreshing data...') }}
            </p>
          </div>
        </v-fade-transition>
      </div>
    </v-container>

    <RepositoryItemDetailModal
      v-model="detailModalOpen"
      :title="
        t('world.crm.repositories.modal.workflowDetailsTitle', {
          id: selectedWorkflowId || '',
        })
      "
      :payload="workflowModalPayload"
      :loading="pendingRuns"
      :error="
        runsError
          ? t('world.crm.repositories.alerts.loadingWorkflowDetailsError')
          : null
      "
    >
      <template #summary="{ payload }">
        <v-row>
          <v-col cols="12" md="6"
            ><strong>{{ t('world.crm.repositories.modal.id') }}:</strong>
            {{ payload?.id ?? '-' }}</v-col
          >
          <v-col cols="12" md="6"
            ><strong>{{ t('world.crm.repositories.labels.state') }}:</strong>
            {{ payload?.state ?? '-' }}</v-col
          >
          <v-col cols="12"
            ><strong>{{ t('world.crm.repositories.modal.name') }}:</strong>
            {{ payload?.name ?? '-' }}</v-col
          >
          <v-col cols="12"
            ><strong>{{ t('world.crm.repositories.modal.path') }}:</strong>
            {{ payload?.path ?? '-' }}</v-col
          >
          <v-col cols="12" md="6"
            ><strong>{{ t('world.crm.repositories.modal.createdAt') }}:</strong>
            {{
              payload?.createdAt
                ? new Date(String(payload.createdAt)).toLocaleString()
                : '-'
            }}</v-col
          >
          <v-col cols="12" md="6"
            ><strong>{{ t('world.crm.repositories.modal.updatedAt') }}:</strong>
            {{
              payload?.updatedAt
                ? new Date(String(payload.updatedAt)).toLocaleString()
                : '-'
            }}</v-col
          >
        </v-row>

        <v-divider class="my-3" />
        <h3 class="text-subtitle-2 mb-2">
          {{
            t('world.crm.repositories.sections.workflowRuns', {
              count: Array.isArray(payload?.runs) ? payload.runs.length : 0,
            })
          }}
        </h3>
        <v-list lines="two" density="compact" class="bg-transparent">
          <v-list-item
            v-for="run in Array.isArray(payload?.runs) ? payload.runs : []"
            :key="String((run as Record<string, unknown>).id ?? '')"
            :title="String((run as Record<string, unknown>).name ?? '-')"
            :subtitle="`${String((run as Record<string, unknown>).status ?? '-')} • ${String((run as Record<string, unknown>).conclusion ?? '-')} • ${String((run as Record<string, unknown>).event ?? '-')}`"
          />
        </v-list>
      </template>
    </RepositoryItemDetailModal>
  </div>
</template>

<style scoped>
.stale-overlay {
  position: absolute;
  top: 0;
  right: 0;
  min-width: 220px;
  background: rgb(var(--v-theme-surface));
  border: 1px solid rgba(var(--v-theme-on-surface), 0.08);
}
</style>
