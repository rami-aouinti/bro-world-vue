<script setup lang="ts">
import type { CrmGithubListResponse } from '~/types/world/crmGithub'

interface GithubPullRequest {
  id?: string | number
  number?: number
  title?: string
  state?: string
  user?: { login?: string }
  createdAt?: string
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
const pullRequestOptions = computed(() =>
  pullRequests.value.map(pr => ({ title: `#${pr.number ?? '-'} · ${pr.title ?? 'Untitled'}`, value: String(pr.number ?? '') })).filter(item => item.value),
)

const { data: selectedPrDetail, pending: pendingDetail } = await useAsyncData<Record<string, unknown> | null>(
  () => `crm-repository-pr-detail-page-${projectId.value}-${selectedPrNumber.value}`,
  async () => {
    if (!selectedPrNumber.value) return null
    return await githubStore.getPullRequestDetail(projectId.value, selectedPrNumber.value, { repo: repository.value }) as Record<string, unknown>
  },
  { watch: [projectId, repository, selectedPrNumber] },
)

watch(
  pullRequests,
  (items) => {
    if (!items.length) {
      selectedPrNumber.value = ''
      return
    }
    const next = String(items[0]?.number ?? '')
    if (!selectedPrNumber.value || !items.some(item => String(item.number ?? '') === selectedPrNumber.value)) {
      selectedPrNumber.value = next
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
      action-label="Pull requests"
      action-icon="mdi-source-pull"
    >
      <template #right>
        <AppSelect v-model="stateFilter" :items="['open', 'closed']" label="Filter by state" clearable class="mb-2" />
        <AppSelect
          v-model="selectedPrNumber"
          :items="pullRequestOptions"
          item-title="title"
          item-value="value"
          label="Select pull request"
          clearable
        />
      </template>
    </WorldModuleShell>

    <v-container fluid>
      <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="router.push(`/world/crm/repositories/${projectId}/${encodeURIComponent(repository)}`)">
        Retour au repository
      </v-btn>

      <v-text-field v-model="applicationSlug" label="Application slug (optional)" variant="outlined" density="comfortable" class="mb-4" />

      <CrmPageSkeleton v-if="pending" variant="dashboard" />
      <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4">Impossible de charger les pull requests.</v-alert>

      <v-row v-else>
        <v-col cols="12" md="6">
          <v-card class="pa-4 h-100 postcard-gradient-card" rounded="xl">
            <h2 class="text-subtitle-1 mb-3">Pull requests ({{ pullRequests.length }})</h2>
            <v-list lines="two" density="compact" class="bg-transparent">
              <v-list-item
                v-for="pullRequest in pullRequests"
                :key="String(pullRequest.id ?? pullRequest.number)"
                :active="String(pullRequest.number ?? '') === selectedPrNumber"
                :title="pullRequest.title ?? `#${pullRequest.number}`"
                :subtitle="`${pullRequest.state ?? '-'} • #${pullRequest.number ?? '-'} • ${pullRequest.user?.login ?? '-'}`"
                @click="selectedPrNumber = String(pullRequest.number ?? '')"
              />
            </v-list>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="pa-4 h-100 postcard-gradient-card" rounded="xl">
            <h2 class="text-subtitle-1 mb-3">Détails PR</h2>
            <div v-if="pendingDetail" class="text-medium-emphasis">Chargement des détails…</div>
            <v-alert v-else-if="!selectedPrDetail" type="info" variant="tonal">Sélectionnez une pull request.</v-alert>
            <v-table v-else density="compact">
              <tbody>
                <tr v-for="(value, key) in selectedPrDetail" :key="String(key)">
                  <td class="text-medium-emphasis">{{ key }}</td>
                  <td>{{ typeof value === 'object' ? JSON.stringify(value) : String(value) }}</td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>
