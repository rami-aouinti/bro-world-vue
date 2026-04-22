<script setup lang="ts">
import type { CrmGithubListResponse } from '~/types/world/crmGithub'
import RepositoryItemDetailModal from '~/components/crm/repositories/RepositoryItemDetailModal.vue'

interface GithubPullRequest {
  id?: string | number
  number?: number
  title?: string
  state?: string
  user?: { login?: string }
  createdAt?: string
  updatedAt?: string
  mergedAt?: string | null
  [key: string]: unknown
}

definePageMeta({ layout: 'crm', title: 'CRM Repository Pull Requests' })

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { crmNavItems } = useWorldCrmNavItems()
const githubStore = useWorldCrmGithubStore()

const projectId = computed(() => String(route.params.project ?? ''))
const repository = computed(() => decodeURIComponent(String(route.params.repository ?? '')))
const applicationSlug = ref<string>(typeof route.query.applicationSlug === 'string' ? route.query.applicationSlug : '')
const stateFilter = ref<string>(typeof route.query.state === 'string' ? route.query.state : '')
const selectedPrNumber = ref<string>('')
const detailModalOpen = ref(false)

const query = computed(() => ({
  repository: repository.value,
  repo: repository.value,
  ...(stateFilter.value ? { state: stateFilter.value } : {}),
}))

const { data, pending, error } = await useAsyncData<CrmGithubListResponse<GithubPullRequest>>(
  () => `crm-repository-pr-page-${projectId.value}-${repository.value}-${applicationSlug.value}-${stateFilter.value}`,
  () => githubStore.getScopedPullRequests(projectId.value, query.value, applicationSlug.value || undefined),
  { watch: [projectId, repository, applicationSlug, stateFilter] },
)

const pullRequests = computed(() => data.value?.items ?? [])

const { data: selectedPrDetail, pending: pendingDetail, error: detailError } = await useAsyncData<Record<string, unknown> | null>(
  () => `crm-repository-pr-detail-page-${projectId.value}-${selectedPrNumber.value}-${detailModalOpen.value}-${applicationSlug.value}`,
  async () => {
    if (!selectedPrNumber.value || !detailModalOpen.value) return null
    return await githubStore.getScopedPullRequestDetail(
      projectId.value,
      selectedPrNumber.value,
      { repo: repository.value },
      applicationSlug.value || undefined,
    ) as Record<string, unknown>
  },
  { watch: [projectId, repository, selectedPrNumber, detailModalOpen, applicationSlug] },
)

function openPrDetail(number: string | number | undefined) {
  selectedPrNumber.value = String(number ?? '')
  if (!selectedPrNumber.value) return
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
      :action-label="t('world.crm.repositories.sections.pullRequests', { count: pullRequests.length })"
      action-icon="mdi-source-pull"
    >
      <template #right>
        <AppSelect v-model="stateFilter" :items="['open', 'closed']" :label="t('world.crm.repositories.filters.state')" clearable class="mb-2" />
      </template>
    </WorldModuleShell>

    <v-container fluid>
      <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="router.push(`/world/crm/repositories/${projectId}/${encodeURIComponent(repository)}`)">
        {{ t('world.crm.repositories.actions.backToRepository') }}
      </v-btn>

      <v-text-field v-model="applicationSlug" :label="t('world.crm.repositories.fields.applicationSlugOptional')" variant="outlined" density="comfortable" class="mb-4" />

      <CrmPageSkeleton v-if="pending" variant="dashboard" />
      <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4">{{ t('world.crm.repositories.alerts.loadingPullRequestsError') }}</v-alert>

      <v-card v-else class="pa-4 postcard-gradient-card" rounded="xl">
        <h2 class="text-subtitle-1 mb-3">{{ t('world.crm.repositories.sections.pullRequests', { count: pullRequests.length }) }}</h2>
        <v-list lines="two" density="compact" class="bg-transparent">
          <v-list-item
            v-for="pullRequest in pullRequests"
            :key="String(pullRequest.id ?? pullRequest.number)"
            :active="String(pullRequest.number ?? '') === selectedPrNumber"
            :title="pullRequest.title ?? `#${pullRequest.number}`"
            :subtitle="`${pullRequest.state ?? '-'} • #${pullRequest.number ?? '-'} • ${pullRequest.user?.login ?? '-'}`"
            @click="openPrDetail(pullRequest.number)"
          />
        </v-list>
      </v-card>
    </v-container>

    <RepositoryItemDetailModal
      v-model="detailModalOpen"
      :title="t('world.crm.repositories.modal.prDetailsTitle', { number: selectedPrNumber || '' })"
      :payload="selectedPrDetail"
      :loading="pendingDetail"
      :error="detailError ? t('world.crm.repositories.alerts.loadingPullRequestDetailsError') : null"
    >
      <template #summary="{ payload }">
        <v-row>
          <v-col cols="12" md="6"><strong>{{ t('world.crm.repositories.modal.pr') }}:</strong> #{{ payload?.number ?? '-' }}</v-col>
          <v-col cols="12" md="6"><strong>{{ t('world.crm.repositories.labels.state') }}:</strong> {{ payload?.state ?? '-' }}</v-col>
          <v-col cols="12"><strong>{{ t('world.crm.repositories.modal.title') }}:</strong> {{ payload?.title ?? '-' }}</v-col>
          <v-col cols="12" md="6"><strong>{{ t('world.crm.repositories.modal.author') }}:</strong> {{ payload?.user && typeof payload.user === 'object' ? (payload.user as Record<string, unknown>).login : '-' }}</v-col>
          <v-col cols="12" md="6"><strong>{{ t('world.crm.repositories.modal.createdAt') }}:</strong> {{ payload?.createdAt ? new Date(String(payload.createdAt)).toLocaleString() : '-' }}</v-col>
          <v-col cols="12" md="6"><strong>{{ t('world.crm.repositories.modal.updatedAt') }}:</strong> {{ payload?.updatedAt ? new Date(String(payload.updatedAt)).toLocaleString() : '-' }}</v-col>
          <v-col cols="12" md="6"><strong>{{ t('world.crm.repositories.modal.mergedAt') }}:</strong> {{ payload?.mergedAt ? new Date(String(payload.mergedAt)).toLocaleString() : t('common.no') }}</v-col>
        </v-row>
      </template>
    </RepositoryItemDetailModal>
  </div>
</template>
