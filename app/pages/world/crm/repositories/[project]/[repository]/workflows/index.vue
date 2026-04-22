<script setup lang="ts">
import type { CrmGithubListResponse, CrmGithubWorkflow, CrmGithubWorkflowRun } from '~/types/world/crmGithub'
import RepositoryItemDetailModal from '~/components/crm/repositories/RepositoryItemDetailModal.vue'

definePageMeta({ layout: 'crm', title: 'CRM Repository Workflows' })

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { crmNavItems } = useWorldCrmNavItems()
const githubStore = useWorldCrmGithubStore()

const projectId = computed(() => String(route.params.project ?? ''))
const repository = computed(() => decodeURIComponent(String(route.params.repository ?? '')))
const applicationSlug = ref<string>(typeof route.query.applicationSlug === 'string' ? route.query.applicationSlug : '')
const selectedWorkflowId = ref<string>('')
const detailModalOpen = ref(false)
const statusFilter = ref<string>('')

const baseQuery = computed(() => ({ repository: repository.value, repo: repository.value }))
const runsQuery = computed(() => ({
  ...baseQuery.value,
  ...(selectedWorkflowId.value ? { workflowId: selectedWorkflowId.value } : {}),
  ...(statusFilter.value ? { status: statusFilter.value } : {}),
}))

const { data: workflowsData, pending: pendingWorkflows, error: workflowsError } = await useAsyncData<CrmGithubListResponse<CrmGithubWorkflow>>(
  () => `crm-repository-workflows-page-${projectId.value}-${repository.value}-${applicationSlug.value}`,
  () => githubStore.getScopedActionsWorkflows(projectId.value, baseQuery.value, applicationSlug.value || undefined),
  { watch: [projectId, repository, applicationSlug] },
)

const { data: runsData, pending: pendingRuns, error: runsError } = await useAsyncData<CrmGithubListResponse<CrmGithubWorkflowRun>>(
  () => `crm-repository-workflow-runs-page-${projectId.value}-${repository.value}-${selectedWorkflowId.value}-${statusFilter.value}-${applicationSlug.value}-${detailModalOpen.value}`,
  async () => {
    if (!selectedWorkflowId.value || !detailModalOpen.value) return { items: [] }
    return await githubStore.getScopedActionsRuns(projectId.value, runsQuery.value, applicationSlug.value || undefined)
  },
  { watch: [projectId, repository, selectedWorkflowId, statusFilter, applicationSlug, detailModalOpen] },
)

const workflows = computed(() => workflowsData.value?.items ?? [])
const runs = computed(() => runsData.value?.items ?? [])
const selectedWorkflowDetail = computed(() => workflows.value.find(item => String(item.id) === selectedWorkflowId.value) ?? null)

const workflowModalPayload = computed<Record<string, unknown> | null>(() => {
  if (!selectedWorkflowDetail.value) return null
  return {
    ...selectedWorkflowDetail.value,
    runs: runs.value,
  }
})

function openWorkflowDetail(workflowId: string | number) {
  selectedWorkflowId.value = String(workflowId)
  detailModalOpen.value = true
}
</script>

<template>
  <div>
    <WorldModuleShell
      :module-title="t('world.crm.label')"
      module-icon="mdi-account-group-outline"
      :module-description="t('world.crm.repositories.moduleDescription')"
      :nav-items="crmNavItems"
      :action-label="t('world.crm.repositories.sections.workflows', { count: workflows.length })"
      action-icon="mdi-robot"
    >
      <template #right>
        <AppSelect v-model="statusFilter" :items="['queued', 'in_progress', 'completed']" :label="t('world.crm.repositories.filters.runStatus')" clearable />
      </template>
    </WorldModuleShell>

    <v-container fluid>
      <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="router.push(`/world/crm/repositories/${projectId}/${encodeURIComponent(repository)}`)">
        {{ t('world.crm.repositories.actions.backToRepository') }}
      </v-btn>

      <v-text-field v-model="applicationSlug" :label="t('world.crm.repositories.fields.applicationSlugOptional')" variant="outlined" density="comfortable" class="mb-4" />

      <CrmPageSkeleton v-if="pendingWorkflows" variant="dashboard" />
      <v-alert v-else-if="workflowsError" type="error" variant="tonal" class="mb-4">{{ t('world.crm.repositories.alerts.loadingWorkflowsError') }}</v-alert>

      <v-card v-else class="pa-4 postcard-gradient-card" rounded="xl">
        <h2 class="text-subtitle-1 mb-3">{{ t('world.crm.repositories.sections.workflows', { count: workflows.length }) }}</h2>
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
    </v-container>

    <RepositoryItemDetailModal
      v-model="detailModalOpen"
      :title="t('world.crm.repositories.modal.workflowDetailsTitle', { id: selectedWorkflowId || '' })"
      :payload="workflowModalPayload"
      :loading="pendingRuns"
      :error="runsError ? t('world.crm.repositories.alerts.loadingWorkflowDetailsError') : null"
    >
      <template #summary="{ payload }">
        <v-row>
          <v-col cols="12" md="6"><strong>{{ t('world.crm.repositories.modal.id') }}:</strong> {{ payload?.id ?? '-' }}</v-col>
          <v-col cols="12" md="6"><strong>{{ t('world.crm.repositories.labels.state') }}:</strong> {{ payload?.state ?? '-' }}</v-col>
          <v-col cols="12"><strong>{{ t('world.crm.repositories.modal.name') }}:</strong> {{ payload?.name ?? '-' }}</v-col>
          <v-col cols="12"><strong>{{ t('world.crm.repositories.modal.path') }}:</strong> {{ payload?.path ?? '-' }}</v-col>
          <v-col cols="12" md="6"><strong>{{ t('world.crm.repositories.modal.createdAt') }}:</strong> {{ payload?.createdAt ? new Date(String(payload.createdAt)).toLocaleString() : '-' }}</v-col>
          <v-col cols="12" md="6"><strong>{{ t('world.crm.repositories.modal.updatedAt') }}:</strong> {{ payload?.updatedAt ? new Date(String(payload.updatedAt)).toLocaleString() : '-' }}</v-col>
        </v-row>

        <v-divider class="my-3" />
        <h3 class="text-subtitle-2 mb-2">{{ t('world.crm.repositories.sections.workflowRuns', { count: Array.isArray(payload?.runs) ? payload.runs.length : 0 }) }}</h3>
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
