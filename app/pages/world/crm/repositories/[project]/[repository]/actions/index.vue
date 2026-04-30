<script setup lang="ts">
import type { CrmGithubListResponse } from '~/types/world/crmGithub'
import RepositoryItemActionsCard from '~/components/crm/repositories/RepositoryItemActionsCard.vue'

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
const _router = useRouter()
const { t } = useI18n()
const { crmNavItems } = useWorldCrmNavItems()
const githubStore = useWorldCrmGithubStore()

const projectId = computed(() => String(route.params.project ?? ''))
const repository = computed(() =>
  decodeURIComponent(String(route.params.repository ?? '')),
)
const applicationSlugInput = ref<string>(
  typeof route.query.applicationSlug === 'string'
    ? route.query.applicationSlug
    : '',
)
const applicationSlug = ref(applicationSlugInput.value)

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
}))

const {
  data: pullRequestsData,
  pending: pendingPullRequests,
  error: pullRequestsError,
} = useAsyncData<CrmGithubListResponse<GithubPullRequest>>(
  () =>
    `crm-repository-actions-pr-options-${projectId.value}-${repository.value}-${applicationSlug.value}`,
  () =>
    githubStore.getScopedPullRequests(
      projectId.value,
      query.value,
      applicationSlug.value || undefined,
    ),
  {
    watch: [projectId, repository, applicationSlug],
    lazy: true,
    server: false,
    default: () => ({ items: [] }),
  },
)

const {
  data: issuesData,
  pending: pendingIssues,
  error: issuesError,
} = useAsyncData<CrmGithubListResponse<GithubIssue>>(
  () =>
    `crm-repository-actions-issue-options-${projectId.value}-${repository.value}`,
  () => githubStore.getIssues(projectId.value, query.value),
  {
    watch: [projectId, repository],
    lazy: true,
    server: false,
    default: () => ({ items: [] }),
  },
)

const pullRequestOptions = computed(() =>
  (pullRequestsData.value?.items ?? [])
    .map((item) => ({
      title: `#${item.number ?? '-'} · ${item.title ?? 'Untitled'}`,
      value: String(item.number ?? ''),
    }))
    .filter((item) => item.value),
)

const issueOptions = computed(() =>
  (issuesData.value?.items ?? [])
    .map((item) => ({
      title: `#${item.number ?? '-'} · ${item.title ?? 'Untitled'}`,
      value: String(item.number ?? ''),
    }))
    .filter((item) => item.value),
)

const hasOptions = computed(
  () => pullRequestOptions.value.length > 0 || issueOptions.value.length > 0,
)
const pending = computed(() => pendingPullRequests.value || pendingIssues.value)
const error = computed(() => pullRequestsError.value || issuesError.value)
const showInitialSkeleton = computed(() => pending.value && !hasOptions.value)
const showStaleOverlay = computed(() => pending.value && hasOptions.value)
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
        <p class="text-caption mb-1">
          {{ t('world.crm.repositories.labels.availableFilters') }}
        </p>
        <p class="text-body-2 mb-0">
          {{ t('world.crm.repositories.labels.actionsHint') }}
        </p>
      </template>
    </WorldModuleShell>

    <v-container fluid>
      <CrmPageSkeleton v-if="showInitialSkeleton" variant="dashboard" />
      <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4"
        >Impossible de charger les options d'actions.</v-alert
      >

      <div v-else class="position-relative">
        <RepositoryItemActionsCard
          :project-id="projectId"
          :repository="repository"
          :application-slug="applicationSlug || undefined"
          :pull-request-options="pullRequestOptions"
          :issue-options="issueOptions"
        />

        <v-fade-transition>
          <div v-if="showStaleOverlay" class="stale-overlay pa-3 rounded-xl">
            <v-progress-linear indeterminate color="primary" class="mb-2" />
            <p class="text-caption mb-0 text-medium-emphasis">
              {{ t('common.loading', 'Refreshing data...') }}
            </p>
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
