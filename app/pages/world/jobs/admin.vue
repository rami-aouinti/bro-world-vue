<script setup lang="ts">
import type {
  JobAccessRole,
  JobPermissionMatrix,
  JobsDataRetentionPolicy,
} from '~~/server/types/api/jobs'
import { useWorldJobsStore } from '~/stores/worldJobs'
import type { SessionUser } from '~/types/session'

definePageMeta({ title: 'Jobs Admin' })

const { t } = useI18n()
const { user } = useUserSession()
const sessionUser = computed(() => user.value as SessionUser | null)
const isRoot = computed(
  () => sessionUser.value?.roles?.includes('ROLE_ROOT') ?? false,
)

const jobsNavItems = [
  {
    title: t('world.jobs.nav.overview'),
    to: '/world/jobs',
    icon: 'mdi-view-dashboard-outline',
  },
  {
    title: t('world.jobs.nav.offers'),
    to: '/world/jobs/offers',
    icon: 'mdi-briefcase-outline',
  },
  {
    title: t('world.jobs.nav.myOffers'),
    to: '/world/jobs/my-offers',
    icon: 'mdi-account-tie-outline',
  },
  {
    title: t('world.jobs.nav.applications'),
    to: '/world/jobs/applications',
    icon: 'mdi-file-document-outline',
  },
  {
    title: t('world.jobs.nav.apply'),
    to: '/world/jobs/apply',
    icon: 'mdi-send-outline',
  },
  {
    title: t('world.jobs.nav.admin'),
    to: '/world/jobs/admin',
    icon: 'mdi-shield-crown-outline',
    rootOnly: true,
  },
]

const jobsStore = useWorldJobsStore()
await Promise.all([
  jobsStore.fetchAdminPolicy(),
  jobsStore.fetchAdminDashboard(),
])
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

watch(
  policyResponse,
  (value) => {
    if (!value?.policy) {
      return
    }

    Object.assign(editablePolicy, value.policy)
  },
  { immediate: true },
)

const roleOrder: JobAccessRole[] = [
  'recruiter',
  'hiring_manager',
  'interviewer',
  'admin',
]
const roleLabels: Record<JobAccessRole, string> = {
  recruiter: t('world.jobs.admin.roles.recruiter'),
  hiring_manager: t('world.jobs.admin.roles.hiringManager'),
  interviewer: t('world.jobs.admin.roles.interviewer'),
  admin: t('world.jobs.admin.roles.admin'),
}

const permissionItems = [
  {
    key: 'canViewPii',
    label: t('world.jobs.admin.permissions.viewPii'),
    icon: 'mdi-account-key-outline',
  },
  {
    key: 'canViewCompensation',
    label: t('world.jobs.admin.permissions.viewCompensation'),
    icon: 'mdi-cash-multiple',
  },
  {
    key: 'canTransitionStage',
    label: t('world.jobs.admin.permissions.transitionStage'),
    icon: 'mdi-transit-connection-variant',
  },
  {
    key: 'canEditNotes',
    label: t('world.jobs.admin.permissions.editNotes'),
    icon: 'mdi-note-edit-outline',
  },
  {
    key: 'canViewDiversity',
    label: t('world.jobs.admin.permissions.viewDiversity'),
    icon: 'mdi-account-group-outline',
  },
  {
    key: 'canManagePolicy',
    label: t('world.jobs.admin.permissions.managePolicy'),
    icon: 'mdi-shield-crown-outline',
  },
] as const

const savePolicy = async () => {
  await jobsStore.updateAdminPolicy(
    editablePolicy as unknown as Record<string, unknown>,
  )
  await refreshPolicy()
}

const togglePermission = async (
  role: JobAccessRole,
  key: keyof JobPermissionMatrix,
  value: boolean,
) => {
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
      title: t('world.jobs.admin.dashboard.timeToHire.title'),
      value: t('world.jobs.admin.dashboard.timeToHire.value', {
        days: value.timeToHireDays.average,
      }),
      subtitle: t('world.jobs.admin.dashboard.timeToHire.subtitle', {
        median: value.timeToHireDays.median,
        target: value.timeToHireDays.target,
      }),
      icon: 'mdi-timer-outline',
    },
    {
      title: t('world.jobs.admin.dashboard.offerAcceptance.title'),
      value: t('world.jobs.admin.dashboard.offerAcceptance.value', {
        rate: value.offerAcceptanceRate.rate,
      }),
      subtitle: t('world.jobs.admin.dashboard.offerAcceptance.subtitle', {
        accepted: value.offerAcceptanceRate.accepted,
        declined: value.offerAcceptanceRate.declined,
      }),
      icon: 'mdi-check-decagram-outline',
    },
    {
      title: t('world.jobs.admin.dashboard.diversity.title'),
      value: t('world.jobs.admin.dashboard.diversity.value', {
        ratio: value.diversityPipeline.ratio,
      }),
      subtitle: t('world.jobs.admin.dashboard.diversity.subtitle', {
        selfIdentified: value.diversityPipeline.selfIdentified,
        totalCandidates: value.diversityPipeline.totalCandidates,
      }),
      icon: 'mdi-account-group',
    },
  ]
})
const hasError = computed(() => !!jobsStore.error)
const isLoading = computed(() => policyPending.value || dashboardPending.value)
const isEmpty = computed(
  () =>
    !isLoading.value && !hasError.value && dashboardCards.value.length === 0,
)

const reloadDashboard = async () => {
  await Promise.all([refreshPolicy(), refreshDashboard()])
}
</script>

<template>
  <div>
    <WorldModuleDrawers
      :module-title="t('world.jobs.label')"
      module-icon="mdi-briefcase-search-outline"
      :module-description="t('world.jobs.moduleDescription')"
      :nav-items="jobsNavItems"
      :action-label="t('world.jobs.admin.actions.refreshHrData')"
      action-icon="mdi-refresh"
    />

    <v-container fluid>
      <v-alert
        v-if="isLoading"
        data-testid="jobs-admin-loading"
        type="info"
        variant="tonal"
        class="mb-4"
        :text="t('world.jobs.admin.loading')"
      />
      <v-alert
        v-else-if="hasError"
        data-testid="jobs-admin-error"
        type="error"
        variant="tonal"
        class="mb-4"
        :text="jobsStore.error ?? undefined"
      />
      <v-alert
        v-else-if="isEmpty"
        data-testid="jobs-admin-empty"
        type="warning"
        variant="tonal"
        class="mb-4"
        :text="t('world.jobs.admin.empty')"
      />

      <v-card rounded="xl" class="pa-5 postcard-gradient-card">
        <template v-if="isRoot">
          <h2 class="text-h5 mb-2">{{ t('world.jobs.admin.title') }}</h2>
          <p class="text-medium-emphasis mb-4">
            {{ t('world.jobs.admin.subtitle') }}
          </p>
          <v-btn
            size="small"
            variant="tonal"
            prepend-icon="mdi-refresh"
            class="mb-4"
            @click="reloadDashboard"
          >
            {{ t('world.jobs.admin.actions.refreshKpis') }}
          </v-btn>

          <v-row>
            <v-col
              v-for="item in dashboardCards"
              :key="item.title"
              cols="12"
              md="4"
            >
              <v-card rounded="xl" variant="outlined" class="pa-4 h-100">
                <div class="d-flex align-center justify-space-between mb-2">
                  <h3 class="text-subtitle-1">{{ item.title }}</h3>
                  <v-icon :icon="item.icon" color="primary" />
                </div>
                <div class="text-h5 mb-1">{{ item.value }}</div>
                <p class="text-body-2 text-medium-emphasis mb-0">
                  {{ item.subtitle }}
                </p>
              </v-card>
            </v-col>
          </v-row>

          <v-row class="mt-1">
            <v-col cols="12" md="7">
              <v-card rounded="xl" variant="outlined" class="pa-4 h-100">
                <h3 class="text-h6 mb-3">
                  {{ t('world.jobs.admin.sections.retention') }}
                </h3>
                <v-row>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model.number="editablePolicy.retentionDays"
                      :label="t('world.jobs.admin.fields.retentionDays')"
                      type="number"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model.number="editablePolicy.anonymizeAfterDays"
                      :label="t('world.jobs.admin.fields.anonymizeAfterDays')"
                      type="number"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-text-field
                      v-model.number="
                        editablePolicy.autoDeleteRejectedAfterDays
                      "
                      :label="
                        t('world.jobs.admin.fields.autoDeleteRejectedAfterDays')
                      "
                      type="number"
                      variant="outlined"
                      density="comfortable"
                    />
                  </v-col>
                  <v-col cols="12" sm="6">
                    <v-switch
                      v-model="editablePolicy.restrictedAccessEnabled"
                      :label="
                        t('world.jobs.admin.fields.restrictedAccessEnabled')
                      "
                      color="primary"
                      inset
                      hide-details
                      class="mt-2"
                    />
                    <v-switch
                      v-model="editablePolicy.legalHoldEnabled"
                      :label="t('world.jobs.admin.fields.legalHoldEnabled')"
                      color="primary"
                      inset
                      hide-details
                      class="mt-2"
                    />
                  </v-col>
                </v-row>
                <v-btn
                  color="primary"
                  prepend-icon="mdi-content-save-outline"
                  :loading="policyPending"
                  @click="savePolicy"
                  >{{
                    t('world.jobs.admin.actions.saveRetentionPolicy')
                  }}</v-btn
                >
              </v-card>
            </v-col>

            <v-col cols="12" md="5">
              <v-card rounded="xl" variant="outlined" class="pa-4 h-100">
                <h3 class="text-h6 mb-3">
                  {{ t('world.jobs.admin.sections.candidateSources') }}
                </h3>
                <v-list
                  v-if="dashboard?.candidateSources.length"
                  class="bg-transparent px-0"
                >
                  <v-list-item
                    v-for="source in dashboard.candidateSources"
                    :key="source.source"
                    class="px-0"
                    :title="source.source"
                    :subtitle="
                      t('world.jobs.admin.candidateSources.count', {
                        count: source.count,
                      })
                    "
                  >
                    <template #append>
                      <v-chip color="primary" size="small" variant="tonal"
                        >{{ source.ratio }}%</v-chip
                      >
                    </template>
                  </v-list-item>
                </v-list>
                <p v-else class="text-medium-emphasis mb-0">
                  {{ t('world.jobs.admin.candidateSources.empty') }}
                </p>
              </v-card>
            </v-col>
          </v-row>

          <v-card rounded="xl" variant="outlined" class="pa-4 mt-4">
            <h3 class="text-h6 mb-3">
              {{ t('world.jobs.admin.sections.permissions') }}
            </h3>
            <v-table density="comfortable">
              <thead>
                <tr>
                  <th>{{ t('world.jobs.admin.table.role') }}</th>
                  <th
                    v-for="permission in permissionItems"
                    :key="permission.key"
                  >
                    {{ permission.label }}
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="role in roleOrder" :key="role">
                  <td class="font-weight-medium">{{ roleLabels[role] }}</td>
                  <td
                    v-for="permission in permissionItems"
                    :key="permission.key"
                  >
                    <v-switch
                      color="primary"
                      inset
                      hide-details
                      density="compact"
                      :model-value="
                        Boolean(
                          policyResponse?.permissions?.[role]?.[permission.key],
                        )
                      "
                      @update:model-value="
                        (value) =>
                          togglePermission(role, permission.key, Boolean(value))
                      "
                    />
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card>

          <v-alert
            type="info"
            variant="tonal"
            class="mt-4"
            :loading="dashboardPending"
          >
            {{ t('world.jobs.admin.info') }}
          </v-alert>
        </template>
        <p v-else class="text-error mb-0">
          {{ t('world.jobs.admin.accessDenied') }}
        </p>
      </v-card>
    </v-container>
  </div>
</template>
