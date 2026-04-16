<script setup lang="ts">
import type {
  RecruitContractType,
  RecruitExperienceLevel,
  RecruitJob,
  RecruitJobsListResponse,
  RecruitWorkMode,
} from '~/types/world/jobs'

definePageMeta({ title: 'Jobs Offers' })

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

const page = ref(1)
const limit = ref(20)
const q = ref('')
const workMode = ref<RecruitWorkMode | undefined>()
const contractType = ref<RecruitContractType | undefined>()
const experienceLevel = ref<RecruitExperienceLevel | undefined>()

const jobs = ref<RecruitJob[]>([])
const totalItems = ref(0)
const totalPages = ref(1)
const loading = ref(false)
const errorMessage = ref('')

const workModeOptions: RecruitWorkMode[] = ['Onsite', 'Remote', 'Hybrid']
const contractTypeOptions: RecruitContractType[] = [
  'CDI',
  'CDD',
  'Freelance',
  'Internship',
]
const experienceOptions: RecruitExperienceLevel[] = [
  'Junior',
  'Mid',
  'Senior',
  'Lead',
]

async function fetchJobs() {
  loading.value = true
  errorMessage.value = ''

  try {
    const response = await $fetch<RecruitJobsListResponse>(
      '/api/recruit/general/jobs',
      {
        query: {
          page: page.value,
          limit: limit.value,
          q: q.value || undefined,
          workMode: workMode.value,
          contractType: contractType.value,
          experienceLevel: experienceLevel.value,
        },
      },
    )
    jobs.value = response.items || []
    totalItems.value = response.pagination?.totalItems || 0
    totalPages.value = response.pagination?.totalPages || 1
  } catch (error) {
    console.error(error)
    errorMessage.value = 'Impossible de charger les offres.'
  } finally {
    loading.value = false
  }
}

function resetFilters() {
  q.value = ''
  workMode.value = undefined
  contractType.value = undefined
  experienceLevel.value = undefined
  page.value = 1
  fetchJobs()
}

watch(page, () => fetchJobs())

await fetchJobs()
</script>

<template>
  <div>
    <WorldModuleDrawers
      module-title="Jobs"
      module-icon="mdi-briefcase-search-outline"
      module-description="Navigation complète du module Jobs."
      :nav-items="jobsNavItems"
      action-label="Create Offers"
    >
      <template #right>
        <h3 class="text-subtitle-1 font-weight-bold mb-3">Filters</h3>
        <div class="d-flex flex-column ga-3">
          <v-select
            v-model="workMode"
            :items="workModeOptions"
            label="Work mode"
            clearable
            hide-details
          />
          <v-select
            v-model="contractType"
            :items="contractTypeOptions"
            label="Contract type"
            clearable
            hide-details
          />
          <v-select
            v-model="experienceLevel"
            :items="experienceOptions"
            label="Experience"
            clearable
            hide-details
          />
          <v-btn
            color="primary"
            block
            @click="
              page = 1
              fetchJobs()
            "
          >
            Filter
          </v-btn>
          <v-btn variant="tonal" block @click="resetFilters">Reset</v-btn>
        </div>
      </template>
    </WorldModuleDrawers>

    <v-container fluid>
      <v-card rounded="xl" class="mb-4 pa-4 postcard-gradient-card">
        <v-text-field
          v-model="q"
          label="Recherche"
          prepend-inner-icon="mdi-magnify"
          clearable
          hide-details
          @keyup.enter="
            page = 1
            fetchJobs()
          "
        />
      </v-card>

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

      <v-row>
        <v-col v-for="job in jobs" :key="job.id" cols="12">
          <v-card rounded="xl" class="h-100 postcard-gradient-card">
            <v-card-title class="text-wrap pb-1">{{ job.title }}</v-card-title>
            <v-card-subtitle class="pb-0">
              {{ job.company.name }} • {{ job.location }} •
              {{ job.postedAtLabel }}
            </v-card-subtitle>
            <v-card-text>
              <div class="d-flex ga-2 flex-wrap mb-2">
                <v-chip size="small" color="primary" variant="tonal">
                  {{ job.workMode }}
                </v-chip>
                <v-chip size="small" color="secondary" variant="tonal">
                  {{ job.contractType }}
                </v-chip>
                <v-chip size="small" color="info" variant="tonal">
                  {{ job.experienceLevel }}
                </v-chip>
              </div>
              <div class="text-caption text-medium-emphasis">
                {{ job.salary.min }} - {{ job.salary.max }}
                {{ job.salary.currency }}
              </div>
            </v-card-text>
            <v-card-actions>
              <v-btn
                color="primary"
                variant="flat"
                prepend-icon="mdi-file-document-outline"
                :to="`/world/jobs/offers/${job.slug}`"
              >
                Voir détail
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-card
        v-if="!loading && !jobs.length"
        rounded="xl"
        class="pa-6 text-center"
      >
        Aucune offre trouvée avec ces filtres.
      </v-card>

      <div class="d-flex justify-center py-4">
        <v-pagination v-model="page" :length="totalPages" :total-visible="7" />
      </div>

      <div class="text-center text-caption text-medium-emphasis pb-6">
        {{ totalItems }} offres
      </div>
    </v-container>
  </div>
</template>
