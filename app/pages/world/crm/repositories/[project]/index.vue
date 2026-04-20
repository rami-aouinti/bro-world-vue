<script setup lang="ts">
import type { CrmProjectItem } from '~~/server/types/api/crm-general'

interface ProjectDashboardRepository {
  fullName: string
  defaultBranch?: string
}

interface ProjectDashboardResponse {
  repositories?: ProjectDashboardRepository[]
  pullRequests?: {
    open?: number
    closed?: number
    merged?: number
  }
}

definePageMeta({ title: 'CRM Project Repositories' })

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { crmNavItems } = useWorldCrmNavItems()
const githubStore = useWorldCrmGithubStore()

const projectId = computed(() => String(route.params.project ?? ''))

const { data: project, pending: pendingProject, error: projectError } = await useFetch<CrmProjectItem>(
  () => `/api/crm/general/projects/${projectId.value}`,
)

const { data: dashboard, pending: pendingDashboard, error: dashboardError } = await useAsyncData<ProjectDashboardResponse>(
  () => `crm-project-dashboard-${projectId.value}`,
  () => githubStore.getProjectDashboard(projectId.value) as Promise<ProjectDashboardResponse>,
  {
    watch: [projectId],
  },
)

const repositories = computed(() => dashboard.value?.repositories ?? [])
const pullRequestSummary = computed(() => dashboard.value?.pullRequests ?? {})
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
      <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="router.push('/world/crm/repositories')">
        {{ t('world.crm.repositories.actions.backToProjects', 'Back to projects') }}
      </v-btn>

      <v-alert v-if="pendingProject || pendingDashboard" type="info" variant="tonal" class="mb-4">
        {{ t('world.crm.repositories.alerts.loadingRepositories', 'Loading repositories...') }}
      </v-alert>
      <v-alert v-else-if="projectError || dashboardError" type="error" variant="tonal" class="mb-4">
        {{ t('world.crm.repositories.alerts.loadingRepositoriesError', 'Unable to load repositories.') }}
      </v-alert>

      <template v-else>
        <h1 class="text-h5 mb-1">{{ project?.name ?? projectId }}</h1>
        <p class="text-body-2 text-medium-emphasis mb-4">{{ t('world.crm.repositories.repositoryListTitle', 'Repositories') }}</p>

        <v-row class="mb-1">
          <v-col cols="12" md="4">
            <v-card variant="tonal" class="pa-4">
              <div class="text-caption text-medium-emphasis">Open PRs</div>
              <div class="text-h5">{{ pullRequestSummary.open ?? 0 }}</div>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card variant="tonal" class="pa-4">
              <div class="text-caption text-medium-emphasis">Closed PRs</div>
              <div class="text-h5">{{ pullRequestSummary.closed ?? 0 }}</div>
            </v-card>
          </v-col>
          <v-col cols="12" md="4">
            <v-card variant="tonal" class="pa-4">
              <div class="text-caption text-medium-emphasis">Merged PRs</div>
              <div class="text-h5">{{ pullRequestSummary.merged ?? 0 }}</div>
            </v-card>
          </v-col>
        </v-row>

        <v-row>
          <v-col v-for="repository in repositories" :key="repository.fullName" cols="12" md="6" xl="4">
            <v-card
              rounded="xl"
              class="pa-4 postcard-gradient-card h-100 d-flex flex-column"
              hover
              @click="router.push(`/world/crm/repositories/${projectId}/${encodeURIComponent(repository.fullName)}`)"
            >
              <h3 class="text-subtitle-1 mb-2">{{ repository.fullName }}</h3>
              <p class="text-body-2 mb-4">
                {{ t('world.crm.repositories.repositoryCard.defaultBranch', 'Default branch') }}: {{ repository.defaultBranch ?? '-' }}
              </p>
              <v-spacer />
              <v-btn
                color="primary"
                variant="tonal"
                prepend-icon="mdi-view-dashboard-outline"
                @click.stop="router.push(`/world/crm/repositories/${projectId}/${encodeURIComponent(repository.fullName)}`)"
              >
                {{ t('world.crm.repositories.actions.viewDashboard', 'View dashboard') }}
              </v-btn>
            </v-card>
          </v-col>

          <v-col v-if="repositories.length === 0" cols="12">
            <v-alert type="info" variant="tonal">
              {{ t('world.crm.repositories.alerts.emptyRepositories', 'No repositories found for this project.') }}
            </v-alert>
          </v-col>
        </v-row>
      </template>
    </v-container>
  </div>
</template>
