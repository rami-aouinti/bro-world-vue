<script setup lang="ts">
import type { ApiListResponse, CrmProjectListItem } from '~~/server/types/api/crm-general'

definePageMeta({ layout: 'crm', title: 'CRM Repositories' })

const router = useRouter()
const { t } = useI18n()
const { crmNavItems } = useWorldCrmNavItems()
const githubStore = useWorldCrmGithubStore()

interface ProjectDashboardRepository {
  fullName: string
  defaultBranch?: string
}

interface RepositoryListItem extends ProjectDashboardRepository {
  projectId: string
  projectName: string
  projectStatus: string
}

const privateProjectsState = await useFetch<ApiListResponse<CrmProjectListItem>>(
  '/api/crm/general/projects',
)

const publicProjectsState = await useFetch<ApiListResponse<CrmProjectListItem>>(
  '/api/world/crm/general/projects',
)

const pendingProjects = computed(() => privateProjectsState.pending.value || publicProjectsState.pending.value)
const projectsError = computed(() => privateProjectsState.error.value || publicProjectsState.error.value)

const allProjects = computed(() => {
  const merged = new Map<string, CrmProjectListItem>()

  for (const project of [...(privateProjectsState.data.value?.items ?? []), ...(publicProjectsState.data.value?.items ?? [])]) {
    if (!merged.has(project.id)) {
      merged.set(project.id, project)
    }
  }

  return Array.from(merged.values())
})

const eligibleProjects = computed(() =>
  allProjects.value.filter(
    project =>
      project.provisioning?.state?.toLowerCase() === 'ready' && project.githubRepositoriesCount > 0,
  ),
)

const { data: repositoriesData, pending: pendingRepositories, error: repositoriesError } = await useAsyncData(
  'crm-repositories-ready-projects',
  async () => {
    const dashboards = await Promise.allSettled(
      eligibleProjects.value.map(async (project) => {
        const repositoriesResponse = await githubStore.getProjectRepositories(project.id, {
          limit: 100,
        }) as { items?: ProjectDashboardRepository[] }

        return { project, repositories: repositoriesResponse.items ?? [] }
      }),
    )

    const items: RepositoryListItem[] = []

    dashboards.forEach((dashboard) => {
      if (dashboard.status !== 'fulfilled') return

      dashboard.value.repositories.forEach((repository) => {
        items.push({
          ...repository,
          projectId: dashboard.value.project.id,
          projectName: dashboard.value.project.name,
          projectStatus: dashboard.value.project.status,
        })
      })
    })

    return items
  },
  {
    watch: [eligibleProjects],
    default: () => [],
  },
)

const pending = computed(() => pendingProjects.value || pendingRepositories.value)
const error = computed(() => projectsError.value || repositoriesError.value)
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
      <h1 class="text-h5 mb-4">{{ t('world.crm.nav.repositories', 'Repositories') }}</h1>

      <CrmPageSkeleton v-if="pending" variant="list" :cards="6" />
      <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4">
        {{ t('world.crm.repositories.alerts.loadingRepositoriesError', 'Unable to load repositories.') }}
      </v-alert>

      <v-row v-else>
        <v-col v-for="repository in repositoriesData" :key="`${repository.projectId}-${repository.fullName}`" cols="12" md="4">
          <v-card rounded="xl" class="pa-4 postcard-gradient-card crm-list-card h-100 d-flex flex-column" hover @click="router.push(`/world/crm/repositories/${repository.projectId}/${encodeURIComponent(repository.fullName)}`)">
            <div class="d-flex justify-space-between align-start ga-2 mb-2">
              <p class="text-subtitle-1 text-truncate mb-0">{{ repository.fullName }}</p>
              <v-chip size="small" color="primary" variant="tonal">{{ repository.projectStatus }}</v-chip>
            </div>
            <p class="text-body-2 mb-1">
              {{ t('world.crm.repositories.repositoryCard.defaultBranch', 'Default branch') }}: {{ repository.defaultBranch ?? '-' }}
            </p>
            <p class="text-body-2 mb-4">
              {{ t('world.crm.projects.form.name', 'Project name') }}: {{ repository.projectName }}
            </p>
            <v-spacer />
            <v-btn color="primary" variant="tonal" prepend-icon="mdi-view-dashboard-outline" @click.stop="router.push(`/world/crm/repositories/${repository.projectId}/${encodeURIComponent(repository.fullName)}`)">
              {{ t('world.crm.repositories.actions.viewDashboard', 'View dashboard') }}
            </v-btn>
          </v-card>
        </v-col>

        <v-col v-if="repositoriesData.length === 0" cols="12">
          <v-alert type="info" variant="tonal">
            {{ t('world.crm.repositories.alerts.emptyRepositories', 'No repositories found for projects with GitHub repos > 0 and provisioning ready.') }}
          </v-alert>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
