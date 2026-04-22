<script setup lang="ts">
import type { CrmGithubListResponse, CrmGithubWorkflow, CrmGithubWorkflowRun } from '~/types/world/crmGithub'

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
  () => `crm-repository-workflow-runs-page-${projectId.value}-${repository.value}-${selectedWorkflowId.value}-${statusFilter.value}-${applicationSlug.value}`,
  () => githubStore.getScopedActionsRuns(projectId.value, runsQuery.value, applicationSlug.value || undefined),
  { watch: [projectId, repository, selectedWorkflowId, statusFilter, applicationSlug] },
)

const workflows = computed(() => workflowsData.value?.items ?? [])
const runs = computed(() => runsData.value?.items ?? [])
const workflowOptions = computed(() => workflows.value.map(item => ({ title: item.name, value: String(item.id) })))
const selectedWorkflowDetail = computed(() => workflows.value.find(item => String(item.id) === selectedWorkflowId.value) ?? null)

watch(
  workflows,
  (items) => {
    if (!items.length) {
      selectedWorkflowId.value = ''
      return
    }
    if (!selectedWorkflowId.value || !items.some(item => String(item.id) === selectedWorkflowId.value)) {
      selectedWorkflowId.value = String(items[0]?.id ?? '')
    }
  },
  { immediate: true },
)
</script>

<template>
  <div>
    <WorldModuleShell
      :module-title="t('world.crm.label')"
      module-icon="mdi-account-group-outline"
      :module-description="t('world.crm.repositories.moduleDescription', 'Repository sections')"
      :nav-items="crmNavItems"
      action-label="Workflows"
      action-icon="mdi-robot"
    >
      <template #right>
        <AppSelect
          v-model="selectedWorkflowId"
          :items="workflowOptions"
          item-title="title"
          item-value="value"
          label="Select workflow"
          clearable
          class="mb-2"
        />
        <AppSelect v-model="statusFilter" :items="['queued', 'in_progress', 'completed']" label="Filter run status" clearable />
      </template>
    </WorldModuleShell>

    <v-container fluid>
      <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="router.push(`/world/crm/repositories/${projectId}/${encodeURIComponent(repository)}`)">
        Retour au repository
      </v-btn>

      <v-text-field v-model="applicationSlug" label="Application slug (optional)" variant="outlined" density="comfortable" class="mb-4" />

      <CrmPageSkeleton v-if="pendingWorkflows || pendingRuns" variant="dashboard" />
      <v-alert v-else-if="workflowsError || runsError" type="error" variant="tonal" class="mb-4">Impossible de charger les workflows.</v-alert>

      <v-row v-else>
        <v-col cols="12" md="6">
          <v-card class="pa-4 h-100 postcard-gradient-card" rounded="xl">
            <h2 class="text-subtitle-1 mb-3">Workflows ({{ workflows.length }})</h2>
            <v-list lines="two" density="compact" class="bg-transparent">
              <v-list-item
                v-for="workflow in workflows"
                :key="workflow.id"
                :active="String(workflow.id) === selectedWorkflowId"
                :title="workflow.name"
                :subtitle="`${workflow.state} • ${workflow.path}`"
                @click="selectedWorkflowId = String(workflow.id)"
              />
            </v-list>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="pa-4 h-100 postcard-gradient-card" rounded="xl">
            <h2 class="text-subtitle-1 mb-3">Détails workflow</h2>
            <v-alert v-if="!selectedWorkflowDetail" type="info" variant="tonal" class="mb-3">Sélectionnez un workflow.</v-alert>
            <v-table v-else density="compact" class="mb-3">
              <tbody>
                <tr v-for="(value, key) in selectedWorkflowDetail" :key="String(key)">
                  <td class="text-medium-emphasis">{{ key }}</td>
                  <td>{{ typeof value === 'object' ? JSON.stringify(value) : String(value) }}</td>
                </tr>
              </tbody>
            </v-table>

            <h3 class="text-subtitle-2 mb-2">Runs ({{ runs.length }})</h3>
            <v-list lines="two" density="compact" class="bg-transparent">
              <v-list-item
                v-for="run in runs"
                :key="run.id"
                :title="run.name"
                :subtitle="`${run.status} • ${run.conclusion ?? '-'} • ${run.event}`"
              />
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
