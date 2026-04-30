<script setup lang="ts">
import { useWorldCrmGitlabStore } from '~/stores/worldCrmGitlab'
import type { CrmGithubSyncJobStatus } from '~/types/world/crmGithub'

definePageMeta({ layout: 'crm', title: 'CRM GitLab Sync' })

const { t } = useI18n()
const { crmNavItems } = useWorldCrmNavItems()
const gitlabStore = useWorldCrmGitlabStore()

const projectId = ref('')
const syncJobId = ref('')
const bootstrapPayload = reactive({
  token: '',
  owner: '',
  issueTarget: 'task',
  createPublicProject: true,
  dryRun: false,
})
const createIssuePayload = reactive({
  title: '',
  body: '',
})
const createProjectPayload = reactive({
  title: '',
})

const dashboard = ref<Record<string, unknown> | null>(null)
const repositories = ref<Array<Record<string, unknown>>>([])
const activeRepository = ref('')
const issues = ref<Array<Record<string, unknown>>>([])
const pullRequests = ref<Array<Record<string, unknown>>>([])
const branches = ref<Array<Record<string, unknown>>>([])
const projectBoards = ref<Array<Record<string, unknown>>>([])
const accountRepositories = ref<Array<Record<string, unknown>>>([])
const syncJob = ref<CrmGithubSyncJobStatus | null>(null)
const bootstrapResponse = ref<{ jobId: string; status: string } | null>(null)
const actionFeedback = ref<{
  type: 'success' | 'error'
  message: string
} | null>(null)
const { data: projectsResponse } = await useAsyncData(
  '/api/crm/general/projects',
  () =>
    $fetch<{ items?: Array<{ id: string; name: string }> }>(
      '/api/crm/general/projects',
    ),
)
const projectItems = computed(() => projectsResponse.value?.items ?? [])
const dashboardPullRequests = computed(() => {
  if (
    !dashboard.value ||
    typeof dashboard.value.pullRequests !== 'object' ||
    !dashboard.value.pullRequests
  ) {
    return { open: 0, closed: 0, merged: 0 }
  }

  const pullRequestSummary = dashboard.value.pullRequests as Record<
    string,
    unknown
  >
  return {
    open: Number(pullRequestSummary.open ?? 0),
    closed: Number(pullRequestSummary.closed ?? 0),
    merged: Number(pullRequestSummary.merged ?? 0),
  }
})
const dashboardRepositories = computed<Array<Record<string, unknown>>>(() => {
  if (!dashboard.value || !Array.isArray(dashboard.value.repositories))
    return []
  return dashboard.value.repositories as Array<Record<string, unknown>>
})

watch(
  projectItems,
  (items) => {
    if (projectId.value || !items.length) return
    projectId.value = items[0].id
  },
  { immediate: true },
)

onMounted(async () => {
  const cachedContext = await gitlabStore.loadSyncContext({ force: true })
  if (!cachedContext) return

  if (!syncJobId.value && cachedContext.jobId) {
    syncJobId.value = cachedContext.jobId
    await loadSyncJob({ force: true })
  }

  if (!bootstrapPayload.owner && cachedContext.owner) {
    bootstrapPayload.owner = cachedContext.owner
  }
})

async function loadDashboard() {
  if (!projectId.value) return
  dashboard.value = await gitlabStore.getProjectDashboard(projectId.value)
}

async function loadRepositories() {
  if (!projectId.value) return
  const response = await gitlabStore.getProjectRepositories(projectId.value)
  repositories.value = response.items ?? []
  if (!activeRepository.value && repositories.value.length) {
    const firstRepo = repositories.value[0]
    const fullName =
      typeof firstRepo?.fullName === 'string' ? firstRepo.fullName : ''
    if (fullName) activeRepository.value = fullName
  }
}

async function resolveRepositoryQuery() {
  if (!projectId.value) return undefined

  if (!activeRepository.value) {
    await loadRepositories()
  }

  if (!activeRepository.value) {
    return undefined
  }

  return {
    repository: activeRepository.value,
    repo: activeRepository.value,
  }
}

async function loadIssues() {
  if (!projectId.value) return
  const query = await resolveRepositoryQuery()
  const response = await gitlabStore.getIssues(projectId.value, query)
  issues.value = response.items ?? []
}

async function loadPullRequests() {
  if (!projectId.value) return
  const query = await resolveRepositoryQuery()
  const response = await gitlabStore.getPullRequests(projectId.value, query)
  pullRequests.value = response.items ?? []
}

async function loadBranches() {
  if (!projectId.value) return
  const query = await resolveRepositoryQuery()
  const response = await gitlabStore.getBranches(projectId.value, query)
  branches.value = response.items ?? []
}

async function loadProjectBoards() {
  if (!projectId.value) return
  const query = await resolveRepositoryQuery()
  const response = await gitlabStore.getProjectsBoards(projectId.value, query)
  projectBoards.value = response.items ?? []
}

async function loadAccountRepositories() {
  if (!projectId.value) return
  const response = await gitlabStore.getAccountRepositories(projectId.value)
  accountRepositories.value = response.items ?? []
}

async function loadGitlabOverview() {
  await Promise.all([
    loadDashboard(),
    loadRepositories(),
    loadIssues(),
    loadPullRequests(),
    loadBranches(),
    loadProjectBoards(),
    loadAccountRepositories(),
  ])
}

async function createIssue() {
  if (
    !projectId.value ||
    !activeRepository.value ||
    !createIssuePayload.title.trim()
  )
    return

  actionFeedback.value = null
  await gitlabStore.createIssue(projectId.value, {
    repository: activeRepository.value,
    title: createIssuePayload.title.trim(),
    body: createIssuePayload.body.trim() || undefined,
  })
  createIssuePayload.title = ''
  createIssuePayload.body = ''
  actionFeedback.value = {
    type: 'success',
    message: 'Issue created successfully.',
  }
  await loadIssues()
}

async function createProjectBoard() {
  if (
    !projectId.value ||
    !bootstrapPayload.owner.trim() ||
    !createProjectPayload.title.trim()
  )
    return

  actionFeedback.value = null
  await gitlabStore.createProjectBoard(projectId.value, {
    owner: bootstrapPayload.owner.trim(),
    title: createProjectPayload.title.trim(),
  })
  createProjectPayload.title = ''
  actionFeedback.value = {
    type: 'success',
    message: 'GitLab project created successfully.',
  }
  await loadProjectBoards()
}

async function runBootstrap() {
  bootstrapResponse.value = await gitlabStore.bootstrapSync(bootstrapPayload)
  syncJobId.value = bootstrapResponse.value.jobId
  await loadSyncJob()
}

async function loadSyncJob(options?: { force?: boolean }) {
  if (!syncJobId.value) return
  syncJob.value = await gitlabStore.getSyncJobStatus(syncJobId.value, options)
  bootstrapPayload.owner = syncJob.value.owner
}

watch(projectId, async (nextProjectId, previousProjectId) => {
  if (!nextProjectId || nextProjectId === previousProjectId) return
  activeRepository.value = ''
  await loadGitlabOverview()
})
</script>

<template>
  <div>
    <WorldModuleShell
      :module-title="t('world.crm.label')"
      module-icon="mdi-account-group-outline"
      :module-description="t('world.crm.nav.githubSync', 'GitLab Sync')"
      :nav-items="crmNavItems"
      :action-label="t('world.crm.nav.githubSync', 'GitLab Sync')"
      action-icon="mdi-gitlab"
    />
    <v-container fluid>
      <v-card rounded="xl" class="pa-4 mb-4 postcard-gradient-card">
        <h2 class="text-h6 mb-4">
          {{ t('world.crm.nav.githubSync', 'GitLab Sync') }}
        </h2>
        <v-row>
          <v-col cols="12" md="6">
            <AppSelect
              v-model="projectId"
              :items="projectItems"
              item-title="name"
              item-value="id"
              label="Project"
              :placeholder="
                t('world.crm.projects.list.empty', 'Select a project')
              "
              class="gitlab-sync__project-select"
            />
          </v-col>
          <v-col cols="12" md="6" class="d-flex align-center flex-wrap ga-2">
            <v-btn
              color="primary"
              :loading="gitlabStore.pending"
              @click="loadDashboard"
              >Load dashboard</v-btn
            >
            <v-btn
              color="secondary"
              :loading="gitlabStore.pending"
              @click="loadRepositories"
              >Load repositories</v-btn
            >
            <v-btn
              color="info"
              :loading="gitlabStore.pending"
              @click="loadGitlabOverview"
              >Load all endpoints</v-btn
            >
          </v-col>
        </v-row>
        <v-row class="mb-1">
          <v-col cols="12" class="d-flex flex-wrap ga-2">
            <v-btn
              size="small"
              variant="tonal"
              :loading="gitlabStore.pending"
              @click="loadIssues"
              >Load issues</v-btn
            >
            <v-btn
              size="small"
              variant="tonal"
              :loading="gitlabStore.pending"
              @click="loadPullRequests"
              >Load pull requests</v-btn
            >
            <v-btn
              size="small"
              variant="tonal"
              :loading="gitlabStore.pending"
              @click="loadBranches"
              >Load branches</v-btn
            >
            <v-btn
              size="small"
              variant="tonal"
              :loading="gitlabStore.pending"
              @click="loadProjectBoards"
              >Load projects</v-btn
            >
            <v-btn
              size="small"
              variant="tonal"
              :loading="gitlabStore.pending"
              @click="loadAccountRepositories"
              >Load account repositories</v-btn
            >
            <v-btn
              size="small"
              color="info"
              :loading="gitlabStore.pending"
              @click="loadGitlabOverview"
              >Load all endpoints</v-btn
            >
          </v-col>
        </v-row>
        <v-alert
          v-if="gitlabStore.error"
          type="error"
          variant="tonal"
          class="mb-3"
          >{{ gitlabStore.error }}</v-alert
        >
        <v-alert
          v-if="actionFeedback"
          :type="actionFeedback.type"
          variant="tonal"
          class="mb-3"
        >
          {{ actionFeedback.message }}
        </v-alert>
        <v-row class="mb-1">
          <v-col cols="12" lg="6">
            <v-card variant="tonal" class="pa-3 h-100">
              <h3 class="text-subtitle-1 mb-2">Create issue</h3>
              <v-text-field
                v-model="createIssuePayload.title"
                label="Issue title"
                density="comfortable"
                class="mb-2"
              />
              <v-textarea
                v-model="createIssuePayload.body"
                label="Issue body"
                auto-grow
                rows="2"
                density="comfortable"
                class="mb-2"
              />
              <v-btn
                color="primary"
                :loading="gitlabStore.pending"
                :disabled="
                  !activeRepository || !createIssuePayload.title.trim()
                "
                @click="createIssue"
              >
                Create issue
              </v-btn>
            </v-card>
          </v-col>
          <v-col cols="12" lg="6">
            <v-card variant="tonal" class="pa-3 h-100">
              <h3 class="text-subtitle-1 mb-2">Create project</h3>
              <v-text-field
                v-model="createProjectPayload.title"
                label="Project title"
                density="comfortable"
                class="mb-2"
              />
              <v-btn
                color="secondary"
                :loading="gitlabStore.pending"
                :disabled="
                  !bootstrapPayload.owner.trim() ||
                  !createProjectPayload.title.trim()
                "
                @click="createProjectBoard"
              >
                Create project
              </v-btn>
            </v-card>
          </v-col>
        </v-row>
        <v-row>
          <v-col cols="12" lg="6">
            <v-card v-if="dashboard" variant="tonal" class="mb-3 pa-3">
              <h3 class="text-subtitle-1 mb-2">Dashboard overview</h3>
              <v-row dense>
                <v-col cols="12" sm="4">
                  <v-sheet rounded="lg" class="pa-3 gitlab-sync-stat">
                    <div class="text-caption text-medium-emphasis">
                      Open PRs
                    </div>
                    <div class="text-h5">{{ dashboardPullRequests.open }}</div>
                  </v-sheet>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-sheet rounded="lg" class="pa-3 gitlab-sync-stat">
                    <div class="text-caption text-medium-emphasis">
                      Closed PRs
                    </div>
                    <div class="text-h5">
                      {{ dashboardPullRequests.closed }}
                    </div>
                  </v-sheet>
                </v-col>
                <v-col cols="12" sm="4">
                  <v-sheet rounded="lg" class="pa-3 gitlab-sync-stat">
                    <div class="text-caption text-medium-emphasis">
                      Merged PRs
                    </div>
                    <div class="text-h5">
                      {{ dashboardPullRequests.merged }}
                    </div>
                  </v-sheet>
                </v-col>
              </v-row>
              <v-list
                v-if="dashboardRepositories.length"
                class="bg-transparent mt-3"
              >
                <v-list-subheader>Linked repositories</v-list-subheader>
                <v-list-item
                  v-for="repository in dashboardRepositories"
                  :key="String(repository.fullName ?? repository.id)"
                  :title="String(repository.fullName ?? 'Unknown repository')"
                  :subtitle="`Default branch: ${String(repository.defaultBranch ?? 'n/a')}`"
                />
              </v-list>
            </v-card>
          </v-col>

          <v-col cols="12" lg="6">
            <v-card
              v-if="repositories.length"
              variant="tonal"
              class="mb-3 pa-3"
            >
              <h3 class="text-subtitle-1 mb-2">
                Project repositories ({{ repositories.length }})
              </h3>
              <v-list class="bg-transparent">
                <v-list-item
                  v-for="repository in repositories"
                  :key="String(repository.fullName ?? repository.id)"
                  :title="String(repository.fullName ?? 'Unknown repository')"
                  :subtitle="`Default branch: ${String(repository.defaultBranch ?? 'n/a')}`"
                />
              </v-list>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card v-if="issues.length" variant="tonal" class="pa-3">
              <h3 class="text-subtitle-1 mb-2">Issues ({{ issues.length }})</h3>
              <v-list class="bg-transparent">
                <v-list-item
                  v-for="issue in issues"
                  :key="String(issue.id ?? issue.number)"
                  :title="`#${String(issue.number ?? '?')} • ${String(issue.title ?? 'Untitled issue')}`"
                  :subtitle="`State: ${String(issue.state ?? 'unknown')}`"
                />
              </v-list>
            </v-card>
          </v-col>

          <v-col cols="12" md="6">
            <v-card v-if="pullRequests.length" variant="tonal" class="pa-3">
              <h3 class="text-subtitle-1 mb-2">
                Pull requests ({{ pullRequests.length }})
              </h3>
              <v-list class="bg-transparent">
                <v-list-item
                  v-for="pullRequest in pullRequests"
                  :key="String(pullRequest.id ?? pullRequest.number)"
                  :title="`#${String(pullRequest.number ?? '?')} • ${String(pullRequest.title ?? 'Untitled pull request')}`"
                  :subtitle="`State: ${String(pullRequest.state ?? 'unknown')}`"
                />
              </v-list>
            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <v-card v-if="branches.length" variant="tonal" class="pa-3">
              <h3 class="text-subtitle-1 mb-2">
                Branches ({{ branches.length }})
              </h3>
              <v-list class="bg-transparent">
                <v-list-item
                  v-for="branch in branches"
                  :key="String(branch.id ?? branch.name)"
                  :title="String(branch.name ?? 'Unnamed branch')"
                  :subtitle="`Protected: ${String(branch.protected ?? false)}`"
                />
              </v-list>
            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <v-card v-if="projectBoards.length" variant="tonal" class="pa-3">
              <h3 class="text-subtitle-1 mb-2">
                GitLab projects ({{ projectBoards.length }})
              </h3>
              <v-list class="bg-transparent">
                <v-list-item
                  v-for="board in projectBoards"
                  :key="String(board.id ?? board.number)"
                  :title="
                    String(board.title ?? board.name ?? 'Untitled project')
                  "
                  :subtitle="`Status: ${String(board.state ?? 'active')}`"
                />
              </v-list>
            </v-card>
          </v-col>

          <v-col cols="12" md="4">
            <v-card
              v-if="accountRepositories.length"
              variant="tonal"
              class="pa-3"
            >
              <h3 class="text-subtitle-1 mb-2">
                Account repositories ({{ accountRepositories.length }})
              </h3>
              <v-list class="bg-transparent">
                <v-list-item
                  v-for="repository in accountRepositories"
                  :key="String(repository.id ?? repository.fullName)"
                  :title="
                    String(
                      repository.fullName ??
                        repository.name ??
                        'Unknown repository',
                    )
                  "
                  :subtitle="`Default branch: ${String(repository.defaultBranch ?? 'n/a')}`"
                />
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </v-card>

      <v-card rounded="xl" class="pa-4 mb-4 postcard-gradient-card">
        <h3 class="text-subtitle-1 mb-4">Bootstrap sync</h3>
        <v-row>
          <v-col cols="12" md="6"
            ><v-text-field v-model="bootstrapPayload.owner" label="Owner"
          /></v-col>
          <v-col cols="12" md="6"
            ><v-text-field
              v-model="bootstrapPayload.token"
              label="GitLab token"
              type="password"
          /></v-col>
          <v-col cols="12" md="6"
            ><v-text-field
              v-model="bootstrapPayload.issueTarget"
              label="Issue target"
          /></v-col>
        </v-row>
        <div class="d-flex ga-2">
          <v-switch
            v-model="bootstrapPayload.createPublicProject"
            label="Create public project"
            hide-details
          />
          <v-switch
            v-model="bootstrapPayload.dryRun"
            label="Dry run"
            hide-details
          />
        </div>
        <v-btn
          color="primary"
          :loading="gitlabStore.pending"
          @click="runBootstrap"
          >Run bootstrap</v-btn
        >
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
          <v-col cols="12" md="8"
            ><v-text-field v-model="syncJobId" label="Sync Job ID"
          /></v-col>
          <v-col cols="12" md="4" class="d-flex align-center"
            ><v-btn
              color="primary"
              :loading="gitlabStore.pending"
              @click="loadSyncJob"
              >Load status</v-btn
            ></v-col
          >
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
  </div>
</template>

<style scoped>
.gitlab-sync__project-select {
  max-width: 520px;
}

.gitlab-sync-stat {
  background: color-mix(in srgb, rgb(var(--v-theme-surface)) 84%, #000 16%);
  border: 1px solid rgba(var(--v-theme-primary), 0.25);
}
</style>
