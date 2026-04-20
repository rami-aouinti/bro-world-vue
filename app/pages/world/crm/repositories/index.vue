<script setup lang="ts">
import type { ApiListResponse, CrmProjectListItem } from '~~/server/types/api/crm-general'

definePageMeta({ title: 'CRM Repositories' })

const router = useRouter()
const { t } = useI18n()
const { crmNavItems } = useWorldCrmNavItems()

const { data, pending, error } = await useFetch<ApiListResponse<CrmProjectListItem>>(
  '/api/crm/general/projects',
)
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
      <h1 class="text-h5 mb-4">{{ t('world.crm.repositories.projectsTitle', 'Projects') }}</h1>

      <v-alert v-if="pending" type="info" variant="tonal" class="mb-4">
        {{ t('world.crm.repositories.alerts.loadingProjects', 'Loading projects...') }}
      </v-alert>
      <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4">
        {{ t('world.crm.repositories.alerts.loadingProjectsError', 'Unable to load projects.') }}
      </v-alert>

      <v-row v-else>
        <v-col v-for="project in data?.items ?? []" :key="project.id" cols="12" md="6" xl="4">
          <v-card rounded="xl" class="pa-4 postcard-gradient-card h-100 d-flex flex-column" hover @click="router.push(`/world/crm/repositories/${project.id}`)">
            <div class="d-flex justify-space-between align-start ga-2 mb-2">
              <h3 class="text-subtitle-1 mb-0">{{ project.name }}</h3>
              <v-chip size="small" color="primary" variant="tonal">{{ project.status }}</v-chip>
            </div>
            <p class="text-body-2 mb-1">
              {{ t('world.crm.repositories.projectCard.githubRepos', 'Linked repositories') }}: {{ project.githubRepositoriesCount }}
            </p>
            <p class="text-body-2 mb-4">
              {{ t('world.crm.repositories.projectCard.provisioning', 'Provisioning') }}: {{ project.provisioning.state }}
            </p>
            <v-spacer />
            <v-btn color="primary" variant="tonal" prepend-icon="mdi-arrow-right" @click.stop="router.push(`/world/crm/repositories/${project.id}`)">
              {{ t('world.crm.repositories.actions.viewRepositories', 'View repositories') }}
            </v-btn>
          </v-card>
        </v-col>

        <v-col v-if="(data?.items?.length ?? 0) === 0" cols="12">
          <v-alert type="info" variant="tonal">
            {{ t('world.crm.repositories.alerts.emptyProjects', 'No projects found.') }}
          </v-alert>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
