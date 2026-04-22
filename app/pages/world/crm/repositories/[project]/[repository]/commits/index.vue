<script setup lang="ts">
import type { CrmGithubCommitDetail, CrmGithubCommitSummary, CrmGithubListResponse } from '~/types/world/crmGithub'
import RepositoryCommitsCard from '~/components/crm/repositories/RepositoryCommitsCard.vue'
import RepositoryItemDetailModal from '~/components/crm/repositories/RepositoryItemDetailModal.vue'

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
const detailModalOpen = ref(false)

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

const { data: commitDetailData, pending: pendingCommitDetail, error: commitDetailError } = await useAsyncData<CrmGithubCommitDetail | null>(
  () => `crm-repository-commit-page-${projectId.value}-${repository.value}-${selectedCommitSha.value}-${detailModalOpen.value}`,
  async () => {
    if (!selectedCommitSha.value || !detailModalOpen.value) return null
    return await githubStore.getScopedCommitDetail(projectId.value, selectedCommitSha.value, { repo: repository.value }, applicationSlug.value || undefined)
  },
  { watch: [projectId, repository, selectedCommitSha, applicationSlug, detailModalOpen] },
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

function openCommitDetail(sha: string) {
  selectedCommitSha.value = sha
  detailModalOpen.value = true
}
</script>

<template>
  <div>
    <WorldModuleShell
      :module-title="t('world.crm.label')"
      module-icon="mdi-account-group-outline"
      :module-description="t('world.crm.repositories.moduleDescription')"
      :nav-items="crmNavItems"
      :action-label="t('world.crm.repositories.sections.commits', { count: commits.length })"
      action-icon="mdi-source-commit"
    >
      <template #right>
        <AppSelect
          v-model="branch"
          :items="branchOptions"
          item-title="title"
          item-value="value"
          :label="t('world.crm.repositories.filters.branch')"
          clearable
          class="mb-2"
        />
      </template>
    </WorldModuleShell>

    <v-container fluid>
      <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="router.push(`/world/crm/repositories/${projectId}/${encodeURIComponent(repository)}`)">
        {{ t('world.crm.repositories.actions.backToRepository') }}
      </v-btn>

      <v-text-field v-model="applicationSlug" :label="t('world.crm.repositories.fields.applicationSlugOptional')" variant="outlined" density="comfortable" class="mb-4" />

      <CrmPageSkeleton v-if="pending" variant="dashboard" />
      <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4">{{ t('world.crm.repositories.alerts.loadingCommitsError') }}</v-alert>

      <RepositoryCommitsCard
        v-else
        :commits="commits"
        :selected-sha="selectedCommitSha"
        @select="openCommitDetail"
      />
    </v-container>

    <RepositoryItemDetailModal
      v-model="detailModalOpen"
      :title="t('world.crm.repositories.modal.commitDetailsTitle', { sha: selectedCommitSha || '' })"
      :payload="commitDetailData"
      :loading="pendingCommitDetail"
      :error="commitDetailError ? t('world.crm.repositories.alerts.loadingCommitDetails') : null"
    >
      <template #summary="{ payload }">
        <v-row dense>
          <v-col cols="12" md="6"><strong>{{ t('world.crm.repositories.modal.sha') }}:</strong> {{ payload?.sha }}</v-col>
          <v-col cols="12" md="6"><strong>{{ t('world.crm.repositories.modal.author') }}:</strong> {{ payload?.author }}</v-col>
          <v-col cols="12"><strong>{{ t('world.crm.repositories.modal.message') }}:</strong> {{ payload?.message }}</v-col>
          <v-col cols="12" md="6"><strong>{{ t('world.crm.repositories.modal.date') }}:</strong> {{ payload?.date ? new Date(String(payload.date)).toLocaleString() : '-' }}</v-col>
          <v-col cols="12" md="6"><strong>{{ t('world.crm.repositories.modal.changedFiles') }}:</strong> {{ Array.isArray(payload?.files) ? payload.files.length : 0 }}</v-col>
        </v-row>

        <v-divider class="my-3" />

        <v-list lines="two" density="compact" class="bg-transparent">
          <v-list-item
            v-for="file in Array.isArray(payload?.files) ? payload.files : []"
            :key="String((file as Record<string, unknown>).filename ?? '')"
            :title="String((file as Record<string, unknown>).filename ?? '-')"
            :subtitle="`${String((file as Record<string, unknown>).status ?? '-')} • +${String((file as Record<string, unknown>).additions ?? 0)} / -${String((file as Record<string, unknown>).deletions ?? 0)}`"
          />
        </v-list>
      </template>
    </RepositoryItemDetailModal>
  </div>
</template>
