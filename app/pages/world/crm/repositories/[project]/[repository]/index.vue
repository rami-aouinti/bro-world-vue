<script setup lang="ts">
import type {
  CrmGithubCollaborator,
  CrmGithubCommitSummary,
  CrmGithubListResponse,
  CrmGithubWorkflow,
} from '~/types/world/crmGithub'

type GithubBranch = {
  name?: string
  protected?: boolean
  [key: string]: unknown
}

type GithubPullRequest = {
  id?: string | number
  number?: number
  title?: string
  state?: string
  user?: { login?: string }
  [key: string]: unknown
}

definePageMeta({ layout: 'crm', title: 'CRM Repository Detail' })

const route = useRoute()
const { t } = useI18n()
const { crmNavItems } = useWorldCrmNavItems()
const githubStore = useWorldCrmGithubStore()

const projectId = computed(() => String(route.params.project ?? ''))
const repository = computed(() => decodeURIComponent(String(route.params.repository ?? '')))
const encodedRepository = computed(() => encodeURIComponent(repository.value))
const applicationSlugInput = ref<string>(typeof route.query.applicationSlug === 'string' ? route.query.applicationSlug : '')
const applicationSlug = ref(applicationSlugInput.value)

let applicationSlugDebounce: ReturnType<typeof setTimeout> | null = null
watch(applicationSlugInput, (value) => {
  if (applicationSlugDebounce) clearTimeout(applicationSlugDebounce)
  applicationSlugDebounce = setTimeout(() => {
    applicationSlug.value = value.trim()
  }, 350)
})

const scopedQuery = computed(() => ({
  repository: repository.value,
  repo: repository.value,
}))

const repositoryRouteQuery = computed(() =>
  applicationSlug.value.trim()
    ? { applicationSlug: applicationSlug.value.trim() }
    : undefined,
)

const { data, pending, error } = useAsyncData(
  () => `crm-repository-dashboard-${projectId.value}-${repository.value}-${applicationSlug.value}`,
  async () => {
    await githubStore.preloadRepositoryCriticalDatasets(
      projectId.value,
      repository.value,
      applicationSlug.value || undefined,
    )

    const [
      collaboratorsResponse,
      branchesResponse,
      commitsResponse,
      pullRequestsResponse,
      workflowsResponse,
    ] = await Promise.all([
      githubStore.getCollaborators(projectId.value, scopedQuery.value),
      githubStore.getBranches(projectId.value, scopedQuery.value),
      githubStore.getScopedCommits(projectId.value, scopedQuery.value, applicationSlug.value || undefined),
      githubStore.getScopedPullRequests(projectId.value, scopedQuery.value, applicationSlug.value || undefined),
      githubStore.getScopedActionsWorkflows(projectId.value, scopedQuery.value, applicationSlug.value || undefined),
    ])

    return {
      collaborators: (collaboratorsResponse as CrmGithubListResponse<CrmGithubCollaborator>).items ?? [],
      branches: (branchesResponse as CrmGithubListResponse<GithubBranch>).items ?? [],
      commits: (commitsResponse as CrmGithubListResponse<CrmGithubCommitSummary>).items ?? [],
      pullRequests: (pullRequestsResponse as CrmGithubListResponse<GithubPullRequest>).items ?? [],
      workflows: (workflowsResponse as CrmGithubListResponse<CrmGithubWorkflow>).items ?? [],
    }
  },
  {
    watch: [projectId, repository, applicationSlug],
    lazy: true,
    server: false,
    default: () => ({ collaborators: [], branches: [], commits: [], pullRequests: [], workflows: [] }),
  },
)

const collaborators = computed(() => data.value?.collaborators ?? [])
const branches = computed(() => data.value?.branches ?? [])
const commits = computed(() => data.value?.commits ?? [])
const pullRequests = computed(() => data.value?.pullRequests ?? [])
const workflows = computed(() => data.value?.workflows ?? [])

const actionsRoute = computed(() =>
  `/world/crm/repositories/${projectId.value}/${encodedRepository.value}/actions`,
)

const hasData = computed(() => (
  collaborators.value.length + branches.value.length + commits.value.length + pullRequests.value.length + workflows.value.length
) > 0)
const showInitialSkeleton = computed(() => pending.value && !hasData.value)
const showStaleOverlay = computed(() => pending.value && hasData.value)

const pageCards = computed(() => [
  {
    key: 'branches',
    title: t('world.crm.repositories.sections.branches', 'Branches'),
    icon: 'mdi-source-branch',
    to: `/world/crm/repositories/${projectId.value}/${encodedRepository.value}/branches`,
    query: repositoryRouteQuery.value,
    items: branches.value.slice(0, 4).map(branch => ({
      primary: branch.name || '-',
      secondary: branch.protected
        ? t('world.crm.repositories.labels.branchProtected')
        : t('world.crm.repositories.labels.branchStandard'),
    })),
  },
  {
    key: 'commits',
    title: t('world.crm.repositories.sections.commits', 'Commits'),
    icon: 'mdi-source-commit',
    to: `/world/crm/repositories/${projectId.value}/${encodedRepository.value}/commits`,
    query: repositoryRouteQuery.value,
    items: commits.value.slice(0, 4).map(commit => ({
      primary: commit.message || commit.sha,
      secondary: `${commit.author || '-'} • ${(commit.sha || '').slice(0, 7)}`,
    })),
  },
  {
    key: 'pull-requests',
    title: t('world.crm.repositories.sections.pullRequests', 'Pull requests'),
    icon: 'mdi-source-pull',
    to: `/world/crm/repositories/${projectId.value}/${encodedRepository.value}/pull-requests`,
    query: repositoryRouteQuery.value,
    items: pullRequests.value.slice(0, 4).map(pullRequest => ({
      primary: pullRequest.title || `#${pullRequest.number ?? '-'}`,
      secondary: `${pullRequest.state || '-'} • @${pullRequest.user?.login || '-'}`,
    })),
  },
  {
    key: 'workflows',
    title: t('world.crm.repositories.sections.workflows', 'Workflows'),
    icon: 'mdi-robot',
    to: `/world/crm/repositories/${projectId.value}/${encodedRepository.value}/workflows`,
    query: repositoryRouteQuery.value,
    items: workflows.value.slice(0, 4).map(workflow => ({
      primary: workflow.name || '-',
      secondary: `${workflow.state || '-'} • ${workflow.path || '-'}`,
    })),
  },
  {
    key: 'actions',
    title: t('world.crm.repositories.sections.itemActions'),
    icon: 'mdi-playlist-check',
    to: actionsRoute.value,
    query: repositoryRouteQuery.value,
    items: collaborators.value.slice(0, 4).map(collaborator => ({
      primary: collaborator.login || '-',
      secondary: collaborator.type || t('world.crm.repositories.labels.user'),
    })),
  },
])

const kpis = computed(() => [
  { key: 'collaborators', label: t('world.crm.repositories.labels.collaborators'), value: collaborators.value.length, icon: 'mdi-account-multiple-outline' },
  { key: 'branches', label: t('world.crm.repositories.labels.branches'), value: branches.value.length, icon: 'mdi-source-branch' },
  { key: 'commits', label: t('world.crm.repositories.labels.commits'), value: commits.value.length, icon: 'mdi-source-commit' },
  { key: 'pullRequests', label: t('world.crm.repositories.labels.pullRequests'), value: pullRequests.value.length, icon: 'mdi-source-pull' },
  { key: 'workflows', label: t('world.crm.repositories.labels.workflows'), value: workflows.value.length, icon: 'mdi-robot' },
])
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
    >
      <template #right>
        <v-text-field
          v-model="applicationSlugInput"
          label="Application slug (optional)"
          variant="outlined"
          density="comfortable"
          hide-details
        />
      </template>
    </WorldModuleShell>

    <v-container fluid>
      <CrmPageSkeleton v-if="showInitialSkeleton" variant="dashboard" />
      <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4">
        {{ t('world.crm.repositories.alerts.loadingDashboardError') }}
      </v-alert>

      <div v-else class="position-relative">
        <v-card class="pa-4 mb-4 postcard-gradient-card" rounded="xl">
          <h1 class="text-h5 mb-1">{{ repository }}</h1>
          <p class="text-body-2 text-medium-emphasis mb-0">
            {{ t('world.crm.repositories.labels.repositoryDashboardDescription') }}
          </p>
        </v-card>

        <v-row class="mb-1">
          <v-col
            v-for="kpi in kpis"
            :key="kpi.key"
            cols="12"
            sm="6"
            md="4"
            lg="2"
          >
            <v-card class="pa-3 h-100" variant="tonal" rounded="xl">
              <div class="d-flex align-center justify-space-between ga-2">
                <span class="text-body-2 text-medium-emphasis">{{ kpi.label }}</span>
                <v-icon :icon="kpi.icon" size="18" />
              </div>
              <p class="text-h5 mt-2 mb-0">{{ kpi.value }}</p>
            </v-card>
          </v-col>
        </v-row>

        <v-row>
          <v-col v-for="card in pageCards" :key="card.key" cols="12" md="6" lg="4">
            <WorldCard extra-class="pa-4 platform-style-card h-100 d-flex flex-column">
              <div class="d-flex align-center ga-2 mb-2">
                <v-icon :icon="card.icon" />
                <p class="text-subtitle-1 mb-0">{{ card.title }}</p>
              </div>

              <v-list class="bg-transparent py-0 mb-2" density="compact" lines="two">
                <v-list-item
                  v-for="(item, index) in card.items"
                  :key="`${card.key}-${index}`"
                  :title="item.primary"
                  :subtitle="item.secondary"
                  class="px-0"
                />
                <v-list-item
                  v-if="!card.items.length"
                  :title="t('world.crm.repositories.labels.noData')"
                  :subtitle="t('world.crm.repositories.labels.noItemsAvailable')"
                  class="px-0"
                />
              </v-list>

              <v-spacer />

              <v-btn
                :to="{ path: card.to, query: card.query }"
                color="primary"
                variant="tonal"
                append-icon="mdi-arrow-right"
              >
                {{ t('world.crm.repositories.actions.viewMore') }}
              </v-btn>
            </WorldCard>
          </v-col>
        </v-row>

        <v-fade-transition>
          <div v-if="showStaleOverlay" class="stale-overlay pa-3 rounded-xl">
            <v-progress-linear indeterminate color="primary" class="mb-2" />
            <p class="text-caption mb-0 text-medium-emphasis">{{ t('common.loading', 'Refreshing data...') }}</p>
          </div>
        </v-fade-transition>
      </div>
    </v-container>
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
