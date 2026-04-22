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
const applicationSlugInput = ref<string>(typeof route.query.applicationSlug === 'string' ? route.query.applicationSlug : '')
const applicationSlug = ref(applicationSlugInput.value)
const stateFilter = ref<string>(typeof route.query.state === 'string' ? route.query.state.trim() : '')
const selectedPrNumber = ref<string>('')
const detailModalOpen = ref(false)
const selectedPrDetail = ref<Record<string, unknown> | null>(null)
const pendingDetail = ref(false)
const detailError = ref<unknown>(null)

let applicationSlugDebounce: ReturnType<typeof setTimeout> | null = null
watch(applicationSlugInput, (value) => {
  if (applicationSlugDebounce) clearTimeout(applicationSlugDebounce)
  applicationSlugDebounce = setTimeout(() => {
    applicationSlug.value = value.trim()
  }, 350)
})

const query = computed(() => ({
  repository: repository.value,
  repo: repository.value,
  ...(stateFilter.value.trim() ? { state: stateFilter.value.trim() } : {}),
}))

const { data, pending, error } = useAsyncData<CrmGithubListResponse<GithubPullRequest>>(
  () => `crm-repository-pr-page-${projectId.value}-${repository.value}-${applicationSlug.value}-${stateFilter.value}`,
  () => githubStore.getScopedPullRequests(projectId.value, query.value, applicationSlug.value || undefined),
  {
    watch: [projectId, repository, query, applicationSlug],
    lazy: true,
    server: false,
    default: () => ({ items: [] }),
  },
)

const pullRequests = computed(() => data.value?.items ?? [])
const hasPullRequests = computed(() => pullRequests.value.length > 0)
const showInitialSkeleton = computed(() => pending.value && !hasPullRequests.value)
const showStaleOverlay = computed(() => pending.value && hasPullRequests.value)

async function loadPrDetail() {
  if (!selectedPrNumber.value || !detailModalOpen.value) return
  pendingDetail.value = true
  detailError.value = null

  try {
    selectedPrDetail.value = await githubStore.getScopedPullRequestDetail(
      projectId.value,
      selectedPrNumber.value,
      { repo: repository.value },
      applicationSlug.value || undefined,
    ) as Record<string, unknown>
  }
  catch (err) {
    detailError.value = err
  }
  finally {
    pendingDetail.value = false
  }
}

function openPrDetail(number: string | number | undefined) {
  selectedPrNumber.value = String(number ?? '')
  if (!selectedPrNumber.value) return
  detailModalOpen.value = true
  loadPrDetail()
}

watch([applicationSlug, stateFilter], () => {
  if (detailModalOpen.value) loadPrDetail()
})
watch(detailModalOpen, (open) => {
  if (!open) {
    selectedPrDetail.value = null
    detailError.value = null
  }
})
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
      </template>
    </WorldModuleShell>

    <v-container fluid>
      <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="router.push(`/world/crm/repositories/${projectId}/${encodeURIComponent(repository)}`)">
        Retour au repository
      </v-btn>

      <v-text-field v-model="applicationSlugInput" label="Application slug (optional)" variant="outlined" density="comfortable" class="mb-4" />

      <CrmPageSkeleton v-if="showInitialSkeleton" variant="dashboard" />
      <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4">Impossible de charger les pull requests.</v-alert>

      <div v-else class="position-relative">
        <v-card class="pa-4 postcard-gradient-card" rounded="xl">
          <h2 class="text-subtitle-1 mb-3">Pull requests ({{ pullRequests.length }})</h2>
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

        <v-fade-transition>
          <div v-if="showStaleOverlay" class="stale-overlay pa-3 rounded-xl">
            <v-progress-linear indeterminate color="primary" class="mb-2" />
            <p class="text-caption mb-0 text-medium-emphasis">{{ t('common.loading', 'Refreshing data...') }}</p>
          </div>
        </v-fade-transition>
      </div>
    </v-container>

    <RepositoryItemDetailModal
      v-model="detailModalOpen"
      :title="`Détails PR #${selectedPrNumber || ''}`"
      :payload="selectedPrDetail"
      :loading="pendingDetail"
      :error="detailError ? 'Impossible de charger le détail de la PR.' : null"
    >
      <template #summary="{ payload }">
        <v-row>
          <v-col cols="12" md="6"><strong>PR:</strong> #{{ payload?.number ?? '-' }}</v-col>
          <v-col cols="12" md="6"><strong>État:</strong> {{ payload?.state ?? '-' }}</v-col>
          <v-col cols="12"><strong>Titre:</strong> {{ payload?.title ?? '-' }}</v-col>
          <v-col cols="12" md="6"><strong>Auteur:</strong> {{ payload?.user && typeof payload.user === 'object' ? (payload.user as Record<string, unknown>).login : '-' }}</v-col>
          <v-col cols="12" md="6"><strong>Créée le:</strong> {{ payload?.createdAt ? new Date(String(payload.createdAt)).toLocaleString() : '-' }}</v-col>
          <v-col cols="12" md="6"><strong>Mise à jour:</strong> {{ payload?.updatedAt ? new Date(String(payload.updatedAt)).toLocaleString() : '-' }}</v-col>
          <v-col cols="12" md="6"><strong>Merge:</strong> {{ payload?.mergedAt ? new Date(String(payload.mergedAt)).toLocaleString() : 'Non' }}</v-col>
        </v-row>
      </template>
    </RepositoryItemDetailModal>
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
