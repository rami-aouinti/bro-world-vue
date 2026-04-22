<script setup lang="ts">
import type { CrmGithubListResponse } from '~/types/world/crmGithub'
import RepositoryItemActionsCard
  from "~/components/crm/repositories/RepositoryItemActionsCard.vue";

interface GithubIssue {
  id?: string | number
  number?: number
  title?: string
}

interface GithubPullRequest {
  id?: string | number
  number?: number
  title?: string
}

definePageMeta({ layout: 'crm', title: 'CRM Repository Actions' })

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { crmNavItems } = useWorldCrmNavItems()
const githubStore = useWorldCrmGithubStore()

const projectId = computed(() => String(route.params.project ?? ''))
const repository = computed(() => decodeURIComponent(String(route.params.repository ?? '')))
const applicationSlug = ref<string>(typeof route.query.applicationSlug === 'string' ? route.query.applicationSlug : '')

const query = computed(() => ({
  repository: repository.value,
  repo: repository.value,
}))

const { data: pullRequestsData, pending: pendingPullRequests } = await useAsyncData<CrmGithubListResponse<GithubPullRequest>>(
  () => `crm-repository-actions-pr-options-${projectId.value}-${repository.value}-${applicationSlug.value}`,
  () => githubStore.getScopedPullRequests(projectId.value, query.value, applicationSlug.value || undefined),
  { watch: [projectId, repository, applicationSlug] },
)

const { data: issuesData, pending: pendingIssues } = await useAsyncData<CrmGithubListResponse<GithubIssue>>(
  () => `crm-repository-actions-issue-options-${projectId.value}-${repository.value}`,
  () => githubStore.getIssues(projectId.value, query.value),
  { watch: [projectId, repository] },
)

const pullRequestOptions = computed(() =>
  (pullRequestsData.value?.items ?? [])
    .map(item => ({ title: `#${item.number ?? '-'} · ${item.title ?? 'Untitled'}`, value: String(item.number ?? '') }))
    .filter(item => item.value),
)

const issueOptions = computed(() =>
  (issuesData.value?.items ?? [])
    .map(item => ({ title: `#${item.number ?? '-'} · ${item.title ?? 'Untitled'}`, value: String(item.number ?? '') }))
    .filter(item => item.value),
)
</script>

<template>
  <div>
    <WorldModuleShell
      :module-title="t('world.crm.label')"
      module-icon="mdi-account-group-outline"
      :module-description="t('world.crm.repositories.moduleDescription')"
      :nav-items="crmNavItems"
      :action-label="t('world.crm.repositories.sections.itemActions')"
      action-icon="mdi-playlist-check"
    >
      <template #right>
        <p class="text-caption mb-1">{{ t('world.crm.repositories.labels.availableFilters') }}</p>
        <p class="text-body-2 mb-0">{{ t('world.crm.repositories.labels.actionsHint') }}</p>
      </template>
    </WorldModuleShell>

    <v-container fluid>
      <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="router.push(`/world/crm/repositories/${projectId}/${encodeURIComponent(repository)}`)">
        {{ t('world.crm.repositories.actions.backToRepository') }}
      </v-btn>

      <v-text-field v-model="applicationSlug" :label="t('world.crm.repositories.fields.applicationSlugOptional')" variant="outlined" density="comfortable" class="mb-4" />

      <CrmPageSkeleton v-if="pendingPullRequests || pendingIssues" variant="dashboard" />

      <RepositoryItemActionsCard
        v-else
        :project-id="projectId"
        :repository="repository"
        :application-slug="applicationSlug || undefined"
        :pull-request-options="pullRequestOptions"
        :issue-options="issueOptions"
      />
    </v-container>
  </div>
</template>
