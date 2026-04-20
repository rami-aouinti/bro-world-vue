<script setup lang="ts">
import type { RecruitMyJobsResponse } from '~/types/world/jobs'
import { privateApi } from '~/utils/http/privateApi'

definePageMeta({ layout: 'job', title: 'Jobs Applications' })

const { t } = useI18n()

const jobsNavItems = computed(() => [
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
])

const loading = ref(false)
const errorMessage = ref('')
const appliedJobs = ref<RecruitMyJobsResponse['appliedJobs']>([])

const statusColor: Record<string, string> = {
  WAITING: 'warning',
  SCREENING: 'info',
  INTERVIEW_PLANNED: 'primary',
  INTERVIEW_DONE: 'indigo',
  OFFER_SENT: 'secondary',
  HIRED: 'success',
  REJECTED: 'error',
}

async function fetchAppliedJobs() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await privateApi.request<RecruitMyJobsResponse>(
      '/api/recruit/general/private/me/jobs',
    )
    appliedJobs.value = response.appliedJobs.filter((entry) => entry.job.apply)
  } catch (error) {
    console.error(error)
    errorMessage.value = t('world.jobs.applications.errors.loading')
  } finally {
    loading.value = false
  }
}

await fetchAppliedJobs()
</script>

<template>
  <div>
    <WorldModuleDrawers
      :module-title="t('world.jobs.label')"
      module-icon="mdi-briefcase-search-outline"
      :module-description="t('world.jobs.moduleDescription')"
      :nav-items="jobsNavItems"
      :action-label="t('world.jobs.applications.actions.create')"
    />

    <v-container fluid>
      <v-alert
        v-if="errorMessage"
        type="error"
        variant="tonal"
        class="mb-4"
        closable
        @click:close="errorMessage = ''"
      >
        {{ errorMessage }}
      </v-alert>

      <v-card rounded="xl" class="postcard-gradient-card">
        <v-card-title class="d-flex align-center justify-space-between">
          <span>{{ t('world.jobs.applications.title') }}</span>
          <v-btn
            size="small"
            prepend-icon="mdi-refresh"
            variant="tonal"
            :loading="loading"
            @click="fetchAppliedJobs"
          >
            {{ t('world.jobs.applications.actions.refresh') }}
          </v-btn>
        </v-card-title>

        <v-card-text>
          <v-progress-linear
            v-if="loading"
            indeterminate
            color="primary"
            class="mb-4"
          />

          <v-table v-else>
            <thead>
              <tr>
                <th>{{ t('world.jobs.applications.table.job') }}</th>
                <th>{{ t('world.jobs.applications.table.company') }}</th>
                <th>{{ t('world.jobs.applications.table.location') }}</th>
                <th>{{ t('world.jobs.applications.table.applicationId') }}</th>
                <th>{{ t('world.jobs.applications.table.status') }}</th>
                <th>{{ t('world.jobs.applications.table.date') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="entry in appliedJobs" :key="entry.applicationId">
                <td>{{ entry.job.title }}</td>
                <td>{{ entry.job.company }}</td>
                <td>{{ entry.job.location }}</td>
                <td class="text-caption">{{ entry.applicationId }}</td>
                <td>
                  <v-chip
                    size="small"
                    :color="statusColor[entry.status] || 'default'"
                    variant="tonal"
                  >
                    {{ entry.status }}
                  </v-chip>
                </td>
                <td>{{ entry.appliedAt }}</td>
              </tr>
              <tr v-if="!appliedJobs.length">
                <td colspan="6" class="text-center text-medium-emphasis py-6">
                  {{ t('world.jobs.applications.empty') }}
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>

      <RecruitApplicationEndpointConsole class="mt-4" />
    </v-container>
  </div>
</template>
