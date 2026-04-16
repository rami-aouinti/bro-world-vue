<script setup lang="ts">
import type { RecruitMyJobsResponse } from '~/types/world/jobs'

definePageMeta({ title: 'Jobs Applications' })

const jobsNavItems = [
  {
    title: 'Overview Jobs',
    to: '/world/jobs',
    icon: 'mdi-view-dashboard-outline',
  },
  { title: 'Offers', to: '/world/jobs/offers', icon: 'mdi-briefcase-outline' },
  {
    title: 'My Offers',
    to: '/world/jobs/my-offers',
    icon: 'mdi-account-tie-outline',
  },
  {
    title: 'Applications',
    to: '/world/jobs/applications',
    icon: 'mdi-file-document-outline',
  },
  { title: 'Apply', to: '/world/jobs/apply', icon: 'mdi-send-outline' },
  {
    title: 'Admin',
    to: '/world/jobs/admin',
    icon: 'mdi-shield-crown-outline',
    rootOnly: true,
  },
]

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
    const response = await $fetch<RecruitMyJobsResponse>(
      '/api/recruit/general/private/me/jobs',
    )
    appliedJobs.value = response.appliedJobs.filter((entry) => entry.job.apply)
  } catch (error) {
    console.error(error)
    errorMessage.value = 'Impossible de charger vos candidatures.'
  } finally {
    loading.value = false
  }
}

await fetchAppliedJobs()
</script>

<template>
  <div>
    <WorldModuleDrawers
      module-title="Jobs"
      module-icon="mdi-briefcase-search-outline"
      module-description="Navigation complète du module Jobs."
      :nav-items="jobsNavItems"
      action-label="Create Applications"
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
          <span>Mes candidatures (apply=true)</span>
          <v-btn
            size="small"
            prepend-icon="mdi-refresh"
            variant="tonal"
            :loading="loading"
            @click="fetchAppliedJobs"
          >
            Refresh
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
                <th>Job</th>
                <th>Entreprise</th>
                <th>Lieu</th>
                <th>Application ID</th>
                <th>Status</th>
                <th>Date</th>
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
                  Aucune candidature trouvée.
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>
