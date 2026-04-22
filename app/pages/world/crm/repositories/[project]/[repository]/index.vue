<script setup lang="ts">
import type {
  CrmGithubCommitDetail,
  CrmGithubCommitSummary,
  CrmGithubCollaborator,
  CrmGithubListResponse,
  CrmGithubWorkflow,
  CrmGithubWorkflowRun,
} from '~/types/world/crmGithub'

interface GithubBoard {
  id?: string | number
  title?: string
  name?: string
  [key: string]: unknown
}

interface GithubIssue {
  id?: string | number
  number?: number
  title?: string
  state?: string
  [key: string]: unknown
}

interface GithubPullRequest {
  id?: string | number
  number?: number
  title?: string
  state?: string
  [key: string]: unknown
}

interface GithubBranch {
  name?: string
  [key: string]: unknown
}

definePageMeta({ layout: 'crm', title: 'CRM Repository Dashboard' })

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { crmNavItems } = useWorldCrmNavItems()
const githubStore = useWorldCrmGithubStore()

const projectId = computed(() => String(route.params.project ?? ''))
const repository = computed(() => decodeURIComponent(String(route.params.repository ?? '')))
const jobId = ref<string>(typeof route.query.jobId === 'string' ? route.query.jobId : '')
const applicationSlug = ref<string>(typeof route.query.applicationSlug === 'string' ? route.query.applicationSlug : '')
const branch = ref<string>(typeof route.query.branch === 'string' ? route.query.branch : '')
const workflowId = ref<string>(typeof route.query.workflowId === 'string' ? route.query.workflowId : '')
const runStatus = ref<string>(typeof route.query.status === 'string' ? route.query.status : '')
const page = ref<number>(Number(route.query.page ?? 1) || 1)
const limit = ref<number>(Number(route.query.limit ?? 20) || 20)
const selectedCommitSha = ref('')

const query = computed(() => ({
  repository: repository.value,
  repo: repository.value,
  page: page.value,
  limit: limit.value,
  ...(branch.value ? { branch: branch.value } : {}),
  ...(jobId.value ? { jobId: jobId.value } : {}),
}))

const { data: issuesData, pending: pendingIssues, error: issuesError, refresh: refreshIssues } = await useAsyncData<CrmGithubListResponse<GithubIssue>>(
  () => `crm-repository-issues-${projectId.value}-${repository.value}-${jobId.value}`,
  () => githubStore.getIssues(projectId.value, query.value),
  { watch: [projectId, repository, jobId] },
)

const { data: pullRequestsData, pending: pendingPullRequests, error: pullRequestsError, refresh: refreshPullRequests } = await useAsyncData<CrmGithubListResponse<GithubPullRequest>>(
  () => `crm-repository-prs-${projectId.value}-${repository.value}-${jobId.value}`,
  () => githubStore.getPullRequests(projectId.value, query.value),
  { watch: [projectId, repository, jobId] },
)

const { data: branchesData, pending: pendingBranches, error: branchesError, refresh: refreshBranches } = await useAsyncData<CrmGithubListResponse<GithubBranch>>(
  () => `crm-repository-branches-${projectId.value}-${repository.value}-${jobId.value}`,
  () => githubStore.getBranches(projectId.value, query.value),
  { watch: [projectId, repository, jobId] },
)

const { data: boardsData, pending: pendingBoards, error: boardsError, refresh: refreshBoards } = await useAsyncData<CrmGithubListResponse<GithubBoard>>(
  () => `crm-repository-boards-${projectId.value}-${repository.value}-${jobId.value}`,
  () => githubStore.getProjectsBoards(projectId.value, query.value),
  { watch: [projectId, repository, jobId] },
)

const { data: commitsData, pending: pendingCommits, error: commitsError, refresh: refreshCommits } = await useAsyncData<CrmGithubListResponse<CrmGithubCommitSummary>>(
  () => `crm-repository-commits-${projectId.value}-${repository.value}-${branch.value}-${page.value}-${limit.value}-${jobId.value}`,
  () => githubStore.getCommits(projectId.value, query.value),
  { watch: [projectId, repository, branch, page, limit, jobId] },
)

const commitDetailQuery = computed(() => ({
  repo: repository.value,
}))

const { data: commitDetailData, pending: pendingCommitDetail, error: commitDetailError, refresh: refreshCommitDetail } = await useAsyncData<CrmGithubCommitDetail | null>(
  () => `crm-repository-commit-${projectId.value}-${repository.value}-${selectedCommitSha.value}`,
  async () => {
    if (!selectedCommitSha.value) {
      return null
    }
    return await githubStore.getCommitDetail(projectId.value, selectedCommitSha.value, commitDetailQuery.value)
  },
  { watch: [projectId, repository, selectedCommitSha] },
)

const { data: collaboratorsData, pending: pendingCollaborators, error: collaboratorsError, refresh: refreshCollaborators } = await useAsyncData<CrmGithubListResponse<CrmGithubCollaborator>>(
  () => `crm-repository-collaborators-${projectId.value}-${repository.value}-${page.value}-${limit.value}-${jobId.value}`,
  () => githubStore.getCollaborators(projectId.value, query.value),
  { watch: [projectId, repository, page, limit, jobId] },
)

const { data: applicationCollaboratorsData, pending: pendingApplicationCollaborators, error: applicationCollaboratorsError, refresh: refreshApplicationCollaborators } = await useAsyncData<CrmGithubListResponse<CrmGithubCollaborator> | null>(
  () => `crm-repository-application-collaborators-${applicationSlug.value}-${projectId.value}-${repository.value}-${page.value}-${limit.value}`,
  async () => {
    if (!applicationSlug.value) {
      return null
    }
    return await githubStore.getApplicationCollaborators(applicationSlug.value, projectId.value, query.value)
  },
  { watch: [applicationSlug, projectId, repository, page, limit, jobId] },
)

const actionsRunsQuery = computed(() => ({
  ...query.value,
  ...(workflowId.value ? { workflowId: workflowId.value } : {}),
  ...(runStatus.value ? { status: runStatus.value } : {}),
}))

const { data: workflowsData, pending: pendingWorkflows, error: workflowsError, refresh: refreshWorkflows } = await useAsyncData<CrmGithubListResponse<CrmGithubWorkflow>>(
  () => `crm-repository-workflows-${projectId.value}-${repository.value}-${page.value}-${limit.value}-${jobId.value}`,
  () => githubStore.getActionsWorkflows(projectId.value, query.value),
  { watch: [projectId, repository, page, limit, jobId] },
)

const { data: workflowRunsData, pending: pendingWorkflowRuns, error: workflowRunsError, refresh: refreshWorkflowRuns } = await useAsyncData<CrmGithubListResponse<CrmGithubWorkflowRun>>(
  () => `crm-repository-workflow-runs-${projectId.value}-${repository.value}-${workflowId.value}-${runStatus.value}-${page.value}-${limit.value}-${jobId.value}`,
  () => githubStore.getActionsRuns(projectId.value, actionsRunsQuery.value),
  { watch: [projectId, repository, workflowId, runStatus, page, limit, jobId] },
)

const isLoading = computed(() =>
  pendingIssues.value
  || pendingPullRequests.value
  || pendingBranches.value
  || pendingBoards.value
  || pendingCommits.value
  || pendingCollaborators.value
  || pendingApplicationCollaborators.value
  || pendingWorkflows.value
  || pendingWorkflowRuns.value
  || pendingCommitDetail.value,
)

const hasError = computed(() =>
  issuesError.value
  || pullRequestsError.value
  || branchesError.value
  || boardsError.value
  || commitsError.value
  || collaboratorsError.value
  || applicationCollaboratorsError.value
  || workflowsError.value
  || workflowRunsError.value
  || commitDetailError.value,
)

const issues = computed(() => issuesData.value?.items ?? [])
const pullRequests = computed(() => pullRequestsData.value?.items ?? [])
const branches = computed(() => branchesData.value?.items ?? [])
const boards = computed(() => boardsData.value?.items ?? [])
const commits = computed(() => commitsData.value?.items ?? [])
const collaborators = computed(() => collaboratorsData.value?.items ?? [])
const applicationCollaborators = computed(() => applicationCollaboratorsData.value?.items ?? [])
const workflows = computed(() => workflowsData.value?.items ?? [])
const workflowRuns = computed(() => workflowRunsData.value?.items ?? [])
const commitDetail = computed(() => commitDetailData.value)

watch(
  commits,
  (nextCommits) => {
    if (!nextCommits.length) {
      selectedCommitSha.value = ''
      return
    }
    if (!selectedCommitSha.value || !nextCommits.some((commit) => commit.sha === selectedCommitSha.value)) {
      selectedCommitSha.value = nextCommits[0]?.sha ?? ''
    }
  },
  { immediate: true },
)

async function refreshAll() {
  await Promise.all([
    refreshIssues(),
    refreshPullRequests(),
    refreshBranches(),
    refreshBoards(),
    refreshCommits(),
    refreshCommitDetail(),
    refreshCollaborators(),
    refreshApplicationCollaborators(),
    refreshWorkflows(),
    refreshWorkflowRuns(),
  ])
}
</script>

<template>
  <div>
    <WorldModuleShell
      :module-title="t('world.crm.label')"
      module-icon="mdi-account-group-outline"
      :module-description="t('world.crm.repositories.moduleDescription', 'Browse project repositories and GitHub dashboard data.')"
      :nav-items="crmNavItems"
      :action-label="t('world.crm.nav.repositories', 'Repositories')"
      action-icon="mdi-source-repository"
    />

    <v-container fluid>
      <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="router.push('/world/crm/repositories')">
        {{ t('world.crm.repositories.actions.backToRepositories', 'Back to repositories') }}
      </v-btn>

      <div class="d-flex flex-wrap align-center ga-3 mb-4">
        <h1 class="text-h5 mb-0">{{ repository }}</h1>
        <v-spacer />
        <v-text-field
          v-model="jobId"
          density="comfortable"
          variant="outlined"
          hide-details
          class="repository-job-id"
          :label="t('world.crm.repositories.fields.jobId', 'Job ID (optional)')"
        />
        <v-text-field
          v-model="applicationSlug"
          density="comfortable"
          variant="outlined"
          hide-details
          class="repository-job-id"
          :label="t('world.crm.repositories.fields.applicationSlug', 'Application slug (optional)')"
        />
        <v-text-field
          v-model="branch"
          density="comfortable"
          variant="outlined"
          hide-details
          class="repository-job-id"
          :label="t('world.crm.repositories.fields.branch', 'Branch (optional)')"
        />
        <v-text-field
          v-model="workflowId"
          density="comfortable"
          variant="outlined"
          hide-details
          class="repository-job-id"
          :label="t('world.crm.repositories.fields.workflowId', 'Workflow ID (optional)')"
        />
        <v-text-field
          v-model="runStatus"
          density="comfortable"
          variant="outlined"
          hide-details
          class="repository-job-id"
          :label="t('world.crm.repositories.fields.status', 'Run status (optional)')"
        />
        <v-btn color="primary" variant="tonal" prepend-icon="mdi-refresh" :loading="isLoading" @click="refreshAll">
          {{ t('world.crm.repositories.actions.refresh', 'Refresh') }}
        </v-btn>
      </div>

      <CrmPageSkeleton v-if="isLoading" variant="dashboard" />
      <v-alert v-else-if="hasError" type="error" variant="tonal" class="mb-4">
        {{ t('world.crm.repositories.alerts.loadingDashboardError', 'Unable to load one or more dashboard sections.') }}
      </v-alert>

      <v-row>
        <v-col cols="12" md="6">
          <RepositoryCommitsCard
            :commits="commits"
            :selected-sha="selectedCommitSha"
            :commit-detail="commitDetail"
            :loading="pendingCommitDetail"
            @select="selectedCommitSha = $event"
          />
        </v-col>

        <v-col cols="12" md="6">
          <RepositoryCollaboratorsCard :collaborators="collaborators" />
        </v-col>

        <v-col v-if="applicationSlug" cols="12" md="6">
          <RepositoryCollaboratorsCard :collaborators="applicationCollaborators" />
        </v-col>

        <v-col cols="12" md="6">
          <RepositoryWorkflowsCard :workflows="workflows" />
        </v-col>

        <v-col cols="12" md="6">
          <RepositoryWorkflowRunsCard :runs="workflowRuns" />
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="pa-4 h-100 postcard-gradient-card" rounded="xl">
            <h2 class="text-subtitle-1 mb-3">{{ t('world.crm.repositories.sections.issues', { count: issues.length }) }}</h2>
            <v-list lines="two" density="compact" class="bg-transparent">
              <v-list-item v-for="issue in issues" :key="String(issue.id ?? issue.number)" :title="issue.title ?? `#${issue.number}`" :subtitle="`${t('world.crm.repositories.labels.state', 'State')}: ${issue.state ?? '-'}`" />
            </v-list>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="pa-4 h-100 postcard-gradient-card" rounded="xl">
            <h2 class="text-subtitle-1 mb-3">{{ t('world.crm.repositories.sections.pullRequests', { count: pullRequests.length }) }}</h2>
            <v-list lines="two" density="compact" class="bg-transparent">
              <v-list-item
                v-for="pullRequest in pullRequests"
                :key="String(pullRequest.id ?? pullRequest.number)"
                :title="pullRequest.title ?? `#${pullRequest.number}`"
                :subtitle="`${t('world.crm.repositories.labels.state', 'State')}: ${pullRequest.state ?? '-'}`"
              />
            </v-list>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="pa-4 h-100 postcard-gradient-card" rounded="xl">
            <h2 class="text-subtitle-1 mb-3">{{ t('world.crm.repositories.sections.projects', { count: boards.length }) }}</h2>
            <v-list lines="one" density="compact" class="bg-transparent">
              <v-list-item v-for="board in boards" :key="String(board.id ?? board.title ?? board.name)" :title="board.title ?? board.name ?? String(board.id)" />
            </v-list>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="pa-4 h-100 postcard-gradient-card" rounded="xl">
            <h2 class="text-subtitle-1 mb-3">{{ t('world.crm.repositories.sections.branches', { count: branches.length }) }}</h2>
            <v-list lines="one" density="compact" class="bg-transparent">
              <v-list-item
                v-for="repoBranch in branches"
                :key="String(repoBranch.name)"
                :title="repoBranch.name ?? '-'"
              />
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<style scoped>
.repository-job-id {
  min-width: 280px;
}
</style>
