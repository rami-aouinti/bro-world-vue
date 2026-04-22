<script setup lang="ts">
import type { RecruitMyJobsResponse } from '~/types/world/jobs'
import { privateApi } from '~/utils/http/privateApi'

definePageMeta({ layout: 'job', title: 'Jobs My Offers' })

const { t } = useI18n()

const jobsNavItems = computed(() => [
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
    errorMessage.value = t('world.jobs.myOffers.errors.loading')
  } finally {
    loading.value = false
  }
}

await fetchMyJobs()
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
          <span>{{ t('world.jobs.myOffers.title') }}</span>
          <v-btn
            size="small"
            prepend-icon="mdi-refresh"
            variant="tonal"
            :loading="loading"
            @click="fetchMyJobs"
          >
            {{ t('world.jobs.myOffers.actions.refresh') }}
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
                <th>{{ t('world.jobs.myOffers.table.title') }}</th>
                <th>{{ t('world.jobs.myOffers.table.company') }}</th>
                <th>{{ t('world.jobs.myOffers.table.location') }}</th>
                <th>{{ t('world.jobs.myOffers.table.contractType') }}</th>
                <th>{{ t('world.jobs.myOffers.table.workMode') }}</th>
                <th>{{ t('world.jobs.myOffers.table.actions') }}</th>
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
                    {{ t('world.jobs.myOffers.owner') }}
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
                  {{ t('world.jobs.myOffers.empty') }}
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card-text>
      </v-card>
    </v-container>
  </div>
</template>
