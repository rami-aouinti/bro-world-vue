<script setup lang="ts">
import type { CrmGithubCommitDetail, CrmGithubCommitSummary, CrmGithubListResponse } from '~/types/world/crmGithub'

definePageMeta({ layout: 'crm', title: 'CRM Repository Commits' })

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { crmNavItems } = useWorldCrmNavItems()
const githubStore = useWorldCrmGithubStore()

const projectId = computed(() => String(route.params.project ?? ''))
const repository = computed(() => decodeURIComponent(String(route.params.repository ?? '')))
const applicationSlug = ref<string>(typeof route.query.applicationSlug === 'string' ? route.query.applicationSlug : '')
const branch = ref<string>(typeof route.query.branch === 'string' ? route.query.branch : '')
const selectedCommitSha = ref('')

const query = computed(() => ({
  repository: repository.value,
  repo: repository.value,
  ...(branch.value ? { branch: branch.value } : {}),
}))

const { data: commitsData, pending, error } = await useAsyncData<CrmGithubListResponse<CrmGithubCommitSummary>>(
  () => `crm-repository-commits-page-${projectId.value}-${repository.value}-${branch.value}-${applicationSlug.value}`,
  () => githubStore.getScopedCommits(projectId.value, query.value, applicationSlug.value || undefined),
  { watch: [projectId, repository, branch, applicationSlug] },
)

const { data: commitDetailData, pending: pendingCommitDetail } = await useAsyncData<CrmGithubCommitDetail | null>(
  () => `crm-repository-commit-page-${projectId.value}-${repository.value}-${selectedCommitSha.value}`,
  async () => {
    if (!selectedCommitSha.value) return null
    return await githubStore.getScopedCommitDetail(projectId.value, selectedCommitSha.value, { repo: repository.value }, applicationSlug.value || undefined)
  },
  { watch: [projectId, repository, selectedCommitSha, applicationSlug] },
)

const commits = computed(() => commitsData.value?.items ?? [])
const branchOptions = computed(() => {
  const values = new Set(
    commits.value
      .map(commit => String((commit as Record<string, unknown>).branch ?? ''))
      .filter(Boolean),
  )
  return Array.from(values).map(value => ({ title: value, value }))
})

watch(
  commits,
  (items) => {
    if (!items.length) {
      selectedCommitSha.value = ''
      return
    }
    if (!selectedCommitSha.value || !items.some(item => item.sha === selectedCommitSha.value)) {
      selectedCommitSha.value = items[0]?.sha ?? ''
    }
  },
  { immediate: true },
)
</script>

<template>
  <div>
    <WorldModuleShell
      :module-title="t('world.crm.label')"
      module-icon="mdi-account-group-outline"
      :module-description="t('world.crm.repositories.moduleDescription', 'Repository sections')"
      :nav-items="crmNavItems"
      :action-label="'Commits'"
      action-icon="mdi-source-commit"
    >
      <template #right>
        <AppSelect
          v-model="branch"
          :items="branchOptions"
          item-title="title"
          item-value="value"
          label="Filter by branch"
          clearable
          class="mb-2"
        />
      </template>
    </WorldModuleShell>

    <v-container fluid>
      <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="router.push(`/world/crm/repositories/${projectId}/${encodeURIComponent(repository)}`)">
        Retour au repository
      </v-btn>

      <v-text-field v-model="applicationSlug" label="Application slug (optional)" variant="outlined" density="comfortable" class="mb-4" />

      <CrmPageSkeleton v-if="pending" variant="dashboard" />
      <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4">Impossible de charger les commits.</v-alert>

      <RepositoryCommitsCard
        v-else
        :commits="commits"
        :selected-sha="selectedCommitSha"
        :commit-detail="commitDetailData"
        :loading="pendingCommitDetail"
        @select="selectedCommitSha = $event"
      />

    </v-container>
  </div>
</template>
