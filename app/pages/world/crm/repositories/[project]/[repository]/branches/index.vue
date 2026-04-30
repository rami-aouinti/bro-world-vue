<script setup lang="ts">
import type { CrmGithubListResponse } from '~/types/world/crmGithub'
import RepositoryItemDetailModal from '~/components/crm/repositories/RepositoryItemDetailModal.vue'

interface GithubBranch {
  name?: string
  protected?: boolean
  commit?: { sha?: string }
  [key: string]: unknown
}

definePageMeta({ layout: 'crm', title: 'CRM Repository Branches' })

const route = useRoute()
const router = useRouter()
const { t } = useI18n()
const { crmNavItems } = useWorldCrmNavItems()
const githubStore = useWorldCrmGithubStore()

const projectId = computed(() => String(route.params.project ?? ''))
const repository = computed(() =>
  decodeURIComponent(String(route.params.repository ?? '')),
)
const selectedBranch = ref<GithubBranch | null>(null)
const detailModalOpen = ref(false)

const { data, pending, error } = useAsyncData<
  CrmGithubListResponse<GithubBranch>
>(
  () => `crm-repository-branches-page-${projectId.value}-${repository.value}`,
  () =>
    githubStore.getBranches(projectId.value, {
      repository: repository.value,
      repo: repository.value,
    }),
  {
    watch: [projectId, repository],
    lazy: true,
    server: false,
    default: () => ({ items: [] }),
  },
)

const branches = computed(() => data.value?.items ?? [])
const hasBranches = computed(() => branches.value.length > 0)
const showInitialSkeleton = computed(() => pending.value && !hasBranches.value)
const showStaleOverlay = computed(() => pending.value && hasBranches.value)

function openBranchDetail(branch: GithubBranch) {
  selectedBranch.value = branch
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
      :action-label="
        t('world.crm.repositories.sections.branches', {
          count: branches.length,
        })
      "
      action-icon="mdi-source-branch"
    />

    <v-container fluid>
      <CrmPageSkeleton v-if="showInitialSkeleton" variant="dashboard" />
      <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4"
        >Impossible de charger les branches.</v-alert
      >

      <div v-else class="position-relative">
        <v-card class="pa-4 postcard-gradient-card" rounded="xl">
          <h2 class="text-subtitle-1 mb-3">Branches ({{ branches.length }})</h2>
          <v-list lines="one" density="compact" class="bg-transparent">
            <v-list-item
              v-for="branch in branches"
              :key="String(branch.name)"
              :title="branch.name ?? '-'"
              :subtitle="`SHA: ${branch.commit?.sha ?? '-'} • ${branch.protected ? 'Protected' : 'Unprotected'}`"
              @click="openBranchDetail(branch)"
            />
          </v-list>
        </v-card>

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

    <RepositoryItemDetailModal
      v-model="detailModalOpen"
      :title="
        t('world.crm.repositories.modal.branchDetailsTitle', {
          name: selectedBranch?.name ?? '',
        })
      "
      :payload="selectedBranch"
    >
      <template #summary="{ payload }">
        <v-row>
          <v-col cols="12" md="6"
            ><strong>{{ t('world.crm.repositories.modal.name') }}:</strong>
            {{ payload?.name ?? '-' }}</v-col
          >
          <v-col cols="12" md="6"
            ><strong
              >{{ t('world.crm.repositories.modal.protection') }}:</strong
            >
            {{ payload?.protected ? t('common.yes') : t('common.no') }}</v-col
          >
          <v-col cols="12"
            ><strong>{{ t('world.crm.repositories.modal.lastSha') }}:</strong>
            {{ payload?.commit?.sha ?? '-' }}</v-col
          >
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
