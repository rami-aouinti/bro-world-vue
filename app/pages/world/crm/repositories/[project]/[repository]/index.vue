<script setup lang="ts">
import type { CrmGithubListResponse } from '~/types/world/crmGithub'

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

definePageMeta({ title: 'CRM Repository Dashboard' })

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { crmNavItems } = useWorldCrmNavItems()
const githubStore = useWorldCrmGithubStore()

const projectId = computed(() => String(route.params.project ?? ''))
const repository = computed(() => decodeURIComponent(String(route.params.repository ?? '')))
const jobId = ref<string>(typeof route.query.jobId === 'string' ? route.query.jobId : '')

const query = computed(() => ({
  repository: repository.value,
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

const isLoading = computed(() =>
  pendingIssues.value || pendingPullRequests.value || pendingBranches.value || pendingBoards.value,
)

const hasError = computed(() =>
  issuesError.value || pullRequestsError.value || branchesError.value || boardsError.value,
)

const issues = computed(() => issuesData.value?.items ?? [])
const pullRequests = computed(() => pullRequestsData.value?.items ?? [])
const branches = computed(() => branchesData.value?.items ?? [])
const boards = computed(() => boardsData.value?.items ?? [])

async function refreshAll() {
  await Promise.all([
    refreshIssues(),
    refreshPullRequests(),
    refreshBranches(),
    refreshBoards(),
  ])
}
</script>

<template>
  <div>
    <WorldModuleDrawers
      :module-title="t('world.crm.label')"
      module-icon="mdi-account-group-outline"
      :module-description="t('world.crm.repositories.moduleDescription', 'Browse project repositories and GitHub dashboard data.')"
      :nav-items="crmNavItems"
      :action-label="t('world.crm.nav.repositories', 'Repositories')"
      action-icon="mdi-source-repository"
    />

    <v-container fluid>
      <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="router.push(`/world/crm/repositories/${projectId}`)">
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
        <v-btn color="primary" variant="tonal" prepend-icon="mdi-refresh" :loading="isLoading" @click="refreshAll">
          {{ t('world.crm.repositories.actions.refresh', 'Refresh') }}
        </v-btn>
      </div>

      <v-alert v-if="isLoading" type="info" variant="tonal" class="mb-4">
        {{ t('world.crm.repositories.alerts.loadingDashboard', 'Loading repository dashboard...') }}
      </v-alert>
      <v-alert v-else-if="hasError" type="error" variant="tonal" class="mb-4">
        {{ t('world.crm.repositories.alerts.loadingDashboardError', 'Unable to load one or more dashboard sections.') }}
      </v-alert>

      <v-row>
        <v-col cols="12" md="6">
          <v-card class="pa-4 h-100" rounded="xl">
            <h2 class="text-subtitle-1 mb-3">Issues ({{ issues.length }})</h2>
            <v-list lines="two" density="compact">
              <v-list-item v-for="issue in issues" :key="String(issue.id ?? issue.number)" :title="issue.title ?? `#${issue.number}`" :subtitle="`${t('world.crm.repositories.labels.state', 'State')}: ${issue.state ?? '-'}`" />
            </v-list>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="pa-4 h-100" rounded="xl">
            <h2 class="text-subtitle-1 mb-3">Pull requests ({{ pullRequests.length }})</h2>
            <v-list lines="two" density="compact">
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
          <v-card class="pa-4 h-100" rounded="xl">
            <h2 class="text-subtitle-1 mb-3">Projects ({{ boards.length }})</h2>
            <v-list lines="one" density="compact">
              <v-list-item v-for="board in boards" :key="String(board.id ?? board.title ?? board.name)" :title="board.title ?? board.name ?? String(board.id)" />
            </v-list>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="pa-4 h-100" rounded="xl">
            <h2 class="text-subtitle-1 mb-3">Branches ({{ branches.length }})</h2>
            <v-list lines="one" density="compact">
              <v-list-item v-for="branch in branches" :key="String(branch.name)" :title="branch.name ?? '-'" />
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
