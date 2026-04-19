<script setup lang="ts">
import { useWorldCrmGithubStore } from '~/stores/worldCrmGithub'
import type { CrmGithubSyncJobStatus } from '~/types/world/crmGithub'

definePageMeta({ title: 'CRM GitHub Sync' })

const { t } = useI18n()
const githubStore = useWorldCrmGithubStore()

const projectId = ref('')
const syncJobId = ref('')
const bootstrapPayload = reactive({
  token: '',
  owner: '',
  issueTarget: 'task',
  createPublicProject: true,
  dryRun: false,
})

const dashboard = ref<Record<string, unknown> | null>(null)
const repositories = ref<Array<Record<string, unknown>>>([])
const syncJob = ref<CrmGithubSyncJobStatus | null>(null)
const bootstrapResponse = ref<{ jobId: string; status: string } | null>(null)
const { data: projectsResponse } = await useAsyncData(
  '/api/crm/general/projects',
  () => $fetch<{ items?: Array<{ id: string; name: string }> }>('/api/crm/general/projects'),
)
const projectItems = computed(() => projectsResponse.value?.items ?? [])

watch(
  projectItems,
  (items) => {
    if (projectId.value || !items.length) return
    projectId.value = items[0].id
  },
  { immediate: true },
)

async function loadDashboard() {
  if (!projectId.value) return
  dashboard.value = await githubStore.getProjectDashboard(projectId.value)
}

async function loadRepositories() {
  if (!projectId.value) return
  const response = await githubStore.getProjectRepositories(projectId.value)
  repositories.value = response.items ?? []
}

async function runBootstrap() {
  bootstrapResponse.value = await githubStore.bootstrapSync(bootstrapPayload)
  syncJobId.value = bootstrapResponse.value.jobId
  await loadSyncJob()
}

async function loadSyncJob() {
  if (!syncJobId.value) return
  syncJob.value = await githubStore.getSyncJobStatus(syncJobId.value)
  bootstrapPayload.owner = syncJob.value.owner
}
</script>

<template>
  <v-container fluid>
    <v-card rounded="xl" class="pa-4 mb-4 postcard-gradient-card">
      <h2 class="text-h6 mb-4">{{ t('world.crm.nav.githubSync', 'GitHub Sync') }}</h2>
      <v-row>
        <v-col cols="12" md="6">
          <v-select
            v-model="projectId"
            :items="projectItems"
            item-title="name"
            item-value="id"
            label="Project"
            :placeholder="t('world.crm.projects.list.empty', 'Select a project')"
          />
        </v-col>
        <v-col cols="12" md="6" class="d-flex align-center ga-2">
          <v-btn color="primary" :loading="githubStore.pending" @click="loadDashboard">Load dashboard</v-btn>
          <v-btn color="secondary" :loading="githubStore.pending" @click="loadRepositories">Load repositories</v-btn>
        </v-col>
      </v-row>
      <v-alert v-if="githubStore.error" type="error" variant="tonal" class="mb-3">{{ githubStore.error }}</v-alert>
      <v-card v-if="dashboard" variant="tonal" class="mb-3 pa-3">
        <pre class="text-caption">{{ JSON.stringify(dashboard, null, 2) }}</pre>
      </v-card>
      <v-card v-if="repositories.length" variant="tonal" class="pa-3">
        <pre class="text-caption">{{ JSON.stringify(repositories, null, 2) }}</pre>
      </v-card>
    </v-card>

    <v-card rounded="xl" class="pa-4 mb-4 postcard-gradient-card">
      <h3 class="text-subtitle-1 mb-4">Bootstrap sync</h3>
      <v-row>
        <v-col cols="12" md="6"><v-text-field v-model="bootstrapPayload.owner" label="Owner" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="bootstrapPayload.token" label="GitHub token" type="password" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="bootstrapPayload.issueTarget" label="Issue target" /></v-col>
      </v-row>
      <div class="d-flex ga-2">
        <v-switch v-model="bootstrapPayload.createPublicProject" label="Create public project" hide-details />
        <v-switch v-model="bootstrapPayload.dryRun" label="Dry run" hide-details />
      </div>
      <v-btn color="primary" :loading="githubStore.pending" @click="runBootstrap">Run bootstrap</v-btn>
      <v-alert
        v-if="bootstrapResponse"
        class="mt-3"
        type="info"
        variant="tonal"
      >
        Job {{ bootstrapResponse.jobId }} is {{ bootstrapResponse.status }}.
      </v-alert>
    </v-card>

    <v-card rounded="xl" class="pa-4 postcard-gradient-card">
      <h3 class="text-subtitle-1 mb-4">Sync job status</h3>
      <v-row>
        <v-col cols="12" md="8"><v-text-field v-model="syncJobId" label="Sync Job ID" /></v-col>
        <v-col cols="12" md="4" class="d-flex align-center"><v-btn color="primary" :loading="githubStore.pending" @click="loadSyncJob">Load status</v-btn></v-col>
      </v-row>
      <v-card v-if="syncJob" variant="tonal" class="pa-3">
        <div class="text-caption mb-2">
          Next calls can reuse:
          <strong>applicationSlug={{ syncJob.applicationSlug }}</strong>
          and
          <strong>owner={{ syncJob.owner }}</strong>
        </div>
        <pre class="text-caption">{{ JSON.stringify(syncJob, null, 2) }}</pre>
      </v-card>
    </v-card>
  </v-container>
</template>
