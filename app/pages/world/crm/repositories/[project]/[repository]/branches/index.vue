<script setup lang="ts">
import type { CrmGithubListResponse } from '~/types/world/crmGithub'

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
const selectedBranch = ref<string>('')

const { data, pending, error } = await useAsyncData<CrmGithubListResponse<GithubBranch>>(
  () => `crm-repository-branches-page-${projectId.value}-${repository.value}`,
  () => githubStore.getBranches(projectId.value, { repository: repository.value, repo: repository.value }),
  { watch: [projectId, repository] },
)

const branches = computed(() => data.value?.items ?? [])
const branchOptions = computed(() => branches.value.map(branch => ({ title: branch.name ?? '-', value: branch.name ?? '' })).filter(item => item.value))
const selectedBranchDetail = computed(() => branches.value.find(branch => branch.name === selectedBranch.value) ?? null)

watch(
  branches,
  (items) => {
    if (!items.length) {
      selectedBranch.value = ''
      return
    }
    if (!selectedBranch.value || !items.some(item => item.name === selectedBranch.value)) {
      selectedBranch.value = items[0]?.name ?? ''
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
      action-label="Branches"
      action-icon="mdi-source-branch"
    >
      <template #right>
        <AppSelect
          v-model="selectedBranch"
          :items="branchOptions"
          item-title="title"
          item-value="value"
          label="Select branch"
          clearable
        />
      </template>
    </WorldModuleShell>

    <v-container fluid>
      <v-btn variant="text" prepend-icon="mdi-arrow-left" class="mb-4" @click="router.push(`/world/crm/repositories/${projectId}/${encodeURIComponent(repository)}`)">
        Retour au repository
      </v-btn>

      <CrmPageSkeleton v-if="pending" variant="dashboard" />
      <v-alert v-else-if="error" type="error" variant="tonal" class="mb-4">Impossible de charger les branches.</v-alert>

      <v-row v-else>
        <v-col cols="12" md="6">
          <v-card class="pa-4 h-100 postcard-gradient-card" rounded="xl">
            <h2 class="text-subtitle-1 mb-3">Branches ({{ branches.length }})</h2>
            <v-list lines="one" density="compact" class="bg-transparent">
              <v-list-item
                v-for="branch in branches"
                :key="String(branch.name)"
                :active="branch.name === selectedBranch"
                :title="branch.name ?? '-'"
                @click="selectedBranch = branch.name ?? ''"
              />
            </v-list>
          </v-card>
        </v-col>

        <v-col cols="12" md="6">
          <v-card class="pa-4 h-100 postcard-gradient-card" rounded="xl">
            <h2 class="text-subtitle-1 mb-3">Détails branche</h2>
            <v-alert v-if="!selectedBranchDetail" type="info" variant="tonal">Sélectionnez une branche.</v-alert>
            <v-table v-else density="compact">
              <tbody>
                <tr v-for="(value, key) in selectedBranchDetail" :key="String(key)">
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
