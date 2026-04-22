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
const repository = computed(() => decodeURIComponent(String(route.params.repository ?? '')))
const selectedBranch = ref<GithubBranch | null>(null)
const detailModalOpen = ref(false)

const { data, pending, error } = await useAsyncData<CrmGithubListResponse<GithubBranch>>(
  () => `crm-repository-branches-page-${projectId.value}-${repository.value}`,
  () => githubStore.getBranches(projectId.value, { repository: repository.value, repo: repository.value }),
  { watch: [projectId, repository] },
)

const branches = computed(() => data.value?.items ?? [])

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
      :action-label="t('world.crm.repositories.sections.branches', { count: branches.length })"
      action-icon="mdi-source-branch"
    />

    <v-container fluid>
      <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="router.push(`/world/crm/repositories/${projectId}/${encodeURIComponent(repository)}`)">
        {{ t('world.crm.repositories.actions.backToRepository') }}
      </v-btn>

      <CrmPageSkeleton v-if="pending" variant="dashboard" />
      <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4">{{ t('world.crm.repositories.alerts.loadingBranchesError') }}</v-alert>

      <v-card v-else class="pa-4 postcard-gradient-card" rounded="xl">
        <h2 class="text-subtitle-1 mb-3">{{ t('world.crm.repositories.sections.branches', { count: branches.length }) }}</h2>
        <v-list lines="one" density="compact" class="bg-transparent">
          <v-list-item
            v-for="branch in branches"
            :key="String(branch.name)"
            :title="branch.name ?? '-'"
            :subtitle="`${t('world.crm.repositories.modal.sha')}: ${branch.commit?.sha ?? '-'} • ${branch.protected ? t('world.crm.repositories.labels.branchProtected') : t('world.crm.repositories.labels.branchUnprotected')}`"
            @click="openBranchDetail(branch)"
          />
        </v-list>
      </v-card>
    </v-container>

    <RepositoryItemDetailModal
      v-model="detailModalOpen"
      :title="t('world.crm.repositories.modal.branchDetailsTitle', { name: selectedBranch?.name ?? '' })"
      :payload="selectedBranch"
    >
      <template #summary="{ payload }">
        <v-row>
          <v-col cols="12" md="6"><strong>{{ t('world.crm.repositories.modal.name') }}:</strong> {{ payload?.name ?? '-' }}</v-col>
          <v-col cols="12" md="6"><strong>{{ t('world.crm.repositories.modal.protection') }}:</strong> {{ payload?.protected ? t('common.yes') : t('common.no') }}</v-col>
          <v-col cols="12"><strong>{{ t('world.crm.repositories.modal.lastSha') }}:</strong> {{ payload?.commit?.sha ?? '-' }}</v-col>
        </v-row>
      </template>
    </RepositoryItemDetailModal>
  </div>
</template>
