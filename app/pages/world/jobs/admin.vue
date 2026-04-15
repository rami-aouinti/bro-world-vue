<script setup lang="ts">
import type {
  JobAccessRole,
  JobPermissionMatrix,
  JobsDataRetentionPolicy,
} from '~~/server/types/api/jobs'
import { useWorldJobsStore } from '~/stores/worldJobs'
import type { SessionUser } from '~/types/session'

definePageMeta({ title: 'Jobs Admin' })

const { user } = useUserSession()
const sessionUser = computed(() => user.value as SessionUser | null)
const isRoot = computed(() => sessionUser.value?.roles?.includes('ROLE_ROOT') ?? false)

const jobsNavItems = [
  { title: 'Overview Jobs', to: '/world/jobs', icon: 'mdi-view-dashboard-outline' },
  { title: 'Offers', to: '/world/jobs/offers', icon: 'mdi-briefcase-outline' },
  { title: 'My Offers', to: '/world/jobs/my-offers', icon: 'mdi-account-tie-outline' },
  { title: 'Applications', to: '/world/jobs/applications', icon: 'mdi-file-document-outline' },
  { title: 'Apply', to: '/world/jobs/apply', icon: 'mdi-send-outline' },
  { title: 'Admin', to: '/world/jobs/admin', icon: 'mdi-shield-crown-outline', rootOnly: true },
]

const jobsStore = useWorldJobsStore()
await Promise.all([jobsStore.fetchAdminPolicy(), jobsStore.fetchAdminDashboard()])
const policyResponse = computed(() => jobsStore.policy)
const dashboard = computed(() => jobsStore.dashboard)
const policyPending = computed(() => jobsStore.pending)
const dashboardPending = computed(() => jobsStore.pending)
const refreshPolicy = () => jobsStore.fetchAdminPolicy({ force: true })
const refreshDashboard = () => jobsStore.fetchAdminDashboard({ force: true })

const editablePolicy = reactive<JobsDataRetentionPolicy>({
  retentionDays: 365,
  anonymizeAfterDays: 90,
  restrictedAccessEnabled: true,
  autoDeleteRejectedAfterDays: 365,
  legalHoldEnabled: true,
})

watch(policyResponse, (value) => {
  if (!value?.policy) {
    return
  }

  Object.assign(editablePolicy, value.policy)
}, { immediate: true })

const roleOrder: JobAccessRole[] = ['recruiter', 'hiring_manager', 'interviewer', 'admin']
const roleLabels: Record<JobAccessRole, string> = {
  recruiter: 'Recruiter',
  hiring_manager: 'Hiring manager',
  interviewer: 'Interviewer',
  admin: 'Admin RH',
}

const permissionItems = [
  { key: 'canViewPii', label: 'Voir données personnelles', icon: 'mdi-account-key-outline' },
  { key: 'canViewCompensation', label: 'Voir rémunération', icon: 'mdi-cash-multiple' },
  { key: 'canTransitionStage', label: 'Changer les étapes', icon: 'mdi-transit-connection-variant' },
  { key: 'canEditNotes', label: 'Éditer notes recruteur', icon: 'mdi-note-edit-outline' },
  { key: 'canViewDiversity', label: 'Voir données diversité', icon: 'mdi-account-group-outline' },
  { key: 'canManagePolicy', label: 'Administrer politiques', icon: 'mdi-shield-crown-outline' },
] as const

const savePolicy = async () => {
  await jobsStore.updateAdminPolicy(editablePolicy as unknown as Record<string, unknown>)
  await refreshPolicy()
}

const togglePermission = async (role: JobAccessRole, key: keyof JobPermissionMatrix, value: boolean) => {
  await jobsStore.updateRolePermission(role, key, value)
  await refreshPolicy()
}

const dashboardCards = computed(() => {
  const value = dashboard.value

  if (!value) {
    return []
  }

  return [
    {
      title: 'Time-to-hire moyen',
      value: `${value.timeToHireDays.average} jours`,
      subtitle: `Médiane ${value.timeToHireDays.median} jours • Cible ${value.timeToHireDays.target} jours`,
      icon: 'mdi-timer-outline',
    },
    {
      title: 'Taux acceptation offre',
      value: `${value.offerAcceptanceRate.rate}%`,
      subtitle: `${value.offerAcceptanceRate.accepted} acceptées / ${value.offerAcceptanceRate.declined} refusées`,
      icon: 'mdi-check-decagram-outline',
    },
    {
      title: 'Diversité pipeline',
      value: `${value.diversityPipeline.ratio}%`,
      subtitle: `${value.diversityPipeline.selfIdentified}/${value.diversityPipeline.totalCandidates} auto-déclarés`,
      icon: 'mdi-account-group',
    },
  ]
})

const reloadDashboard = async () => {
  await Promise.all([refreshPolicy(), refreshDashboard()])
}
</script>

<template>
  <div>
    <WorldModuleDrawers
      module-title="Jobs"
      module-icon="mdi-briefcase-search-outline"
      module-description="Navigation complète du module Jobs."
      :nav-items="jobsNavItems"
      action-label="Refresh HR data"
      action-icon="mdi-refresh"
    />

    <v-container fluid class="pt-0">
      <v-card rounded="xl" class="pa-5 postcard-gradient-card">
        <template v-if="isRoot">
          <h2 class="text-h5 mb-2">Jobs Admin center</h2>
          <p class="text-medium-emphasis mb-4">Politiques de conservation, anonymisation candidats, accès restreint et pilotage RH.</p>
          <v-btn size="small" variant="tonal" prepend-icon="mdi-refresh" class="mb-4" @click="reloadDashboard">
            Actualiser KPI RH
          </v-btn>

          <v-row>
            <v-col v-for="item in dashboardCards" :key="item.title" cols="12" md="4">
              <v-card rounded="xl" variant="outlined" class="pa-4 h-100">
                <div class="d-flex align-center justify-space-between mb-2">
                  <h3 class="text-subtitle-1">{{ item.title }}</h3>
                  <v-icon :icon="item.icon" color="primary" />
                </div>
                <div class="text-h5 mb-1">{{ item.value }}</div>
                <p class="text-body-2 text-medium-emphasis mb-0">{{ item.subtitle }}</p>
              </v-card>
            </v-col>
          </v-row>

          <v-row class="mt-1">
            <v-col cols="12" md="7">
              <v-card rounded="xl" variant="outlined" class="pa-4 h-100">
                <h3 class="text-h6 mb-3">Data retention & anonymisation</h3>
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-text-field v-model.number="editablePolicy.retentionDays" label="Retention candidats (jours)" type="number" variant="outlined" density="comfortable" />
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field v-model.number="editablePolicy.anonymizeAfterDays" label="Anonymiser après (jours)" type="number" variant="outlined" density="comfortable" />
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field v-model.number="editablePolicy.autoDeleteRejectedAfterDays" label="Suppression rejetés après (jours)" type="number" variant="outlined" density="comfortable" />
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-switch v-model="editablePolicy.restrictedAccessEnabled" label="Accès restreint activé" color="primary" inset hide-details class="mt-2" />
                    <v-switch v-model="editablePolicy.legalHoldEnabled" label="Legal hold actif" color="primary" inset hide-details class="mt-2" />
                  </v-col>
                </v-row>
                <v-btn color="primary" prepend-icon="mdi-content-save-outline" :loading="policyPending" @click="savePolicy">Save retention policy</v-btn>
              </v-card>
            </v-col>

            <v-col cols="12" md="5">
              <v-card rounded="xl" variant="outlined" class="pa-4 h-100">
                <h3 class="text-h6 mb-3">Source de candidats</h3>
                <v-list v-if="dashboard?.candidateSources.length" class="bg-transparent px-0">
                  <v-list-item
                    v-for="source in dashboard.candidateSources"
                    :key="source.source"
                    class="px-0"
                    :title="source.source"
                    :subtitle="`${source.count} candidats`"
                  >
                    <template #append>
                      <v-chip color="primary" size="small" variant="tonal">{{ source.ratio }}%</v-chip>
                    </template>
                  </v-list-item>
                </v-list>
                <p v-else class="text-medium-emphasis mb-0">No source data yet.</p>
              </v-card>
            </v-col>
          </v-row>

          <v-card rounded="xl" variant="outlined" class="pa-4 mt-4">
            <h3 class="text-h6 mb-3">Permissions fines (UI + API)</h3>
            <v-table density="comfortable">
              <thead>
                <tr>
                  <th>Role</th>
                  <th v-for="permission in permissionItems" :key="permission.key">{{ permission.label }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="role in roleOrder" :key="role">
                  <td class="font-weight-medium">{{ roleLabels[role] }}</td>
                  <td v-for="permission in permissionItems" :key="permission.key">
                    <v-switch
                      color="primary"
                      inset
                      hide-details
                      density="compact"
                      :model-value="Boolean(policyResponse?.permissions?.[role]?.[permission.key])"
                      @update:model-value="(value) => togglePermission(role, permission.key, Boolean(value))"
                    />
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card>

          <v-alert type="info" variant="tonal" class="mt-4" :loading="dashboardPending">
            Les endpoints API appliquent ces droits lors de la lecture des candidats et transitions pipeline.
          </v-alert>
        </template>
        <p v-else class="text-error mb-0">Access denied. This page requires ROLE_ROOT.</p>
      </v-card>
    </v-container>
  </div>
</template>
