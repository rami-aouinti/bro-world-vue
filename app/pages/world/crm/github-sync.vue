<script setup lang="ts">
import { useWorldCrmGithubStore } from '~/stores/worldCrmGithub'

definePageMeta({ title: 'CRM GitHub Sync' })

const { t } = useI18n()
const githubStore = useWorldCrmGithubStore()

const projectId = ref('')
const syncJobId = ref('')
const bootstrapPayload = reactive({
  applicationSlug: '',
  token: '',
  owner: '',
  issueTarget: 'task',
  createPublicProject: true,
  dryRun: false,
})

const dashboard = ref<Record<string, unknown> | null>(null)
const repositories = ref<Array<Record<string, unknown>>>([])
const syncJob = ref<Record<string, unknown> | null>(null)

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
  syncJob.value = await githubStore.bootstrapSync(bootstrapPayload)
}

async function loadSyncJob() {
  if (!syncJobId.value) return
  syncJob.value = await githubStore.getSyncJobStatus(syncJobId.value)
}
</script>

<template>
  <v-container fluid>
    <v-card rounded="xl" class="pa-4 mb-4 postcard-gradient-card">
      <h2 class="text-h6 mb-4">{{ t('world.crm.nav.githubSync', 'GitHub Sync') }}</h2>
      <v-row>
        <v-col cols="12" md="6">
          <v-text-field v-model="projectId" label="Project ID" />
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
        <v-col cols="12" md="6"><v-text-field v-model="bootstrapPayload.applicationSlug" label="Application slug" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="bootstrapPayload.owner" label="Owner" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="bootstrapPayload.token" label="GitHub token" type="password" /></v-col>
        <v-col cols="12" md="6"><v-text-field v-model="bootstrapPayload.issueTarget" label="Issue target" /></v-col>
      </v-row>
      <div class="d-flex ga-2">
        <v-switch v-model="bootstrapPayload.createPublicProject" label="Create public project" hide-details />
        <v-switch v-model="bootstrapPayload.dryRun" label="Dry run" hide-details />
      </div>
      <v-btn color="primary" :loading="githubStore.pending" @click="runBootstrap">Run bootstrap</v-btn>
    </v-card>

    <v-card rounded="xl" class="pa-4 postcard-gradient-card">
      <h3 class="text-subtitle-1 mb-4">Sync job status</h3>
      <v-row>
        <v-col cols="12" md="8"><v-text-field v-model="syncJobId" label="Sync Job ID" /></v-col>
        <v-col cols="12" md="4" class="d-flex align-center"><v-btn color="primary" :loading="githubStore.pending" @click="loadSyncJob">Load status</v-btn></v-col>
      </v-row>
      <v-card v-if="syncJob" variant="tonal" class="pa-3">
        <pre class="text-caption">{{ JSON.stringify(syncJob, null, 2) }}</pre>
      </v-card>
    </v-card>
  </v-container>
</template>
