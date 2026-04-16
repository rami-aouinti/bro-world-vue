<script setup lang="ts">
import type { RecruitMyJobsResponse } from '~/types/world/jobs'
import { privateApi } from '~/utils/http/privateApi'

definePageMeta({ title: 'Jobs My Offers' })

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
const createdJobs = ref<RecruitMyJobsResponse['createdJobs']>([])

async function fetchMyJobs() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await privateApi.request<RecruitMyJobsResponse>(
      '/api/recruit/general/private/me/jobs',
    )
    createdJobs.value = response.createdJobs.filter((job) => job.owner)
  } catch (error) {
    console.error(error)
    errorMessage.value = 'Impossible de charger vos offres créées.'
  } finally {
    loading.value = false
  }
}

await fetchMyJobs()
</script>

<template>
  <div>
    <WorldModuleDrawers
      module-title="Jobs"
      module-icon="mdi-briefcase-search-outline"
      module-description="Navigation complète du module Jobs."
      :nav-items="jobsNavItems"
      action-label="Create My Offers"
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
          <span>Mes offres créées</span>
          <v-btn
            size="small"
            prepend-icon="mdi-refresh"
            variant="tonal"
            :loading="loading"
            @click="fetchMyJobs"
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
                <th>Titre</th>
                <th>Entreprise</th>
                <th>Lieu</th>
                <th>Type</th>
                <th>Mode</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="job in createdJobs" :key="job.id">
                <td>{{ job.title }}</td>
                <td>{{ job.company }}</td>
                <td>{{ job.location }}</td>
                <td>{{ job.contractType }}</td>
                <td>{{ job.workMode }}</td>
                <td>
                  <v-chip
                    size="small"
                    color="success"
                    variant="tonal"
                    class="mr-1"
                  >
                    owner
                  </v-chip>
                  <v-btn
                    size="x-small"
                    variant="text"
                    icon="mdi-pencil"
                    disabled
                  />
                  <v-btn
                    size="x-small"
                    variant="text"
                    icon="mdi-delete"
                    disabled
                  />
                </td>
              </tr>
              <tr v-if="!createdJobs.length">
                <td colspan="6" class="text-center text-medium-emphasis py-6">
                  Aucune offre créée pour le moment.
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>
