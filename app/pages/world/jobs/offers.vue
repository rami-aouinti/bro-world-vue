<script setup lang="ts">
import type {
  RecruitContractType,
  RecruitExperienceLevel,
  RecruitJob,
  RecruitJobDetailResponse,
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

const selectedSlug = ref('')
const selectedJob = ref<RecruitJob | null>(null)
const selectedJobLoading = ref(false)
const detailsOpen = ref(false)

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
    const response = await $fetch<RecruitJobsListResponse>('/api/recruit/general/jobs', {
      query: {
        page: page.value,
        limit: limit.value,
        q: q.value || undefined,
        workMode: workMode.value,
        contractType: contractType.value,
        experienceLevel: experienceLevel.value,
      },
    })
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

async function openDetail(job: RecruitJob) {
  selectedSlug.value = job.slug
  selectedJobLoading.value = true
  detailsOpen.value = true

  try {
    const response = await $fetch<RecruitJobDetailResponse>(
      `/api/recruit/general/jobs/${encodeURIComponent(job.slug)}`,
    )
    selectedJob.value = response.job
  } catch (error) {
    console.error(error)
    selectedJob.value = job
  } finally {
    selectedJobLoading.value = false
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
    />

    <v-container fluid>
      <v-card rounded="xl" class="mb-4 pa-4 postcard-gradient-card">
        <v-row>
          <v-col cols="12" md="4">
            <v-text-field
              v-model="q"
              label="Recherche"
              prepend-inner-icon="mdi-magnify"
              clearable
              hide-details
              @keyup.enter="page = 1; fetchJobs()"
            />
          </v-col>
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="workMode"
              :items="workModeOptions"
              label="Work mode"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="contractType"
              :items="contractTypeOptions"
              label="Contract type"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="6" md="2">
            <v-select
              v-model="experienceLevel"
              :items="experienceOptions"
              label="Experience"
              clearable
              hide-details
            />
          </v-col>
          <v-col cols="12" sm="6" md="2" class="d-flex ga-2">
            <v-btn color="primary" block @click="page = 1; fetchJobs()">
              Filter
            </v-btn>
            <v-btn variant="tonal" block @click="resetFilters">Reset</v-btn>
          </v-col>
        </v-row>
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
        <v-col v-for="job in jobs" :key="job.id" cols="12" md="6" lg="4">
          <v-card rounded="xl" class="h-100">
            <v-card-title class="text-wrap">{{ job.title }}</v-card-title>
            <v-card-subtitle>
              {{ job.company.name }} • {{ job.location }}
            </v-card-subtitle>
            <v-card-text>
              <div class="d-flex ga-2 flex-wrap mb-3">
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
              <p class="text-medium-emphasis mb-2">{{ job.summary }}</p>
              <div class="text-caption">
                {{ job.salary.min }} - {{ job.salary.max }} {{ job.salary.currency }}
              </div>
            </v-card-text>
            <v-card-actions>
              <v-btn
                color="primary"
                variant="flat"
                prepend-icon="mdi-file-document-outline"
                @click="openDetail(job)"
              >
                Voir détail
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>

      <v-card v-if="!loading && !jobs.length" rounded="xl" class="pa-6 text-center">
        Aucune offre trouvée avec ces filtres.
      </v-card>

      <div class="d-flex justify-center py-4">
        <v-pagination v-model="page" :length="totalPages" :total-visible="7" />
      </div>

      <div class="text-center text-caption text-medium-emphasis pb-6">
        {{ totalItems }} offres
      </div>
    </v-container>

    <v-dialog v-model="detailsOpen" max-width="880">
      <v-card rounded="xl">
        <v-card-title class="text-wrap">
          {{ selectedJob?.title || selectedSlug }}
        </v-card-title>
        <v-card-subtitle v-if="selectedJob">
          {{ selectedJob.company.name }} • {{ selectedJob.location }}
        </v-card-subtitle>
        <v-card-text>
          <v-progress-linear
            v-if="selectedJobLoading"
            indeterminate
            color="primary"
            class="mb-4"
          />
          <template v-else-if="selectedJob">
            <p class="mb-3">{{ selectedJob.summary }}</p>

            <h4 class="text-subtitle-1 mb-2">Responsabilités</h4>
            <ul class="pl-5 mb-3">
              <li v-for="item in selectedJob.responsibilities || []" :key="item">
                {{ item }}
              </li>
            </ul>

            <h4 class="text-subtitle-1 mb-2">Profil</h4>
            <ul class="pl-5 mb-3">
              <li v-for="item in selectedJob.profile || []" :key="item">
                {{ item }}
              </li>
            </ul>

            <h4 class="text-subtitle-1 mb-2">Bénéfices</h4>
            <ul class="pl-5 mb-0">
              <li v-for="item in selectedJob.benefits || []" :key="item">
                {{ item }}
              </li>
            </ul>
          </template>
        </v-card-text>
        <v-card-actions class="justify-end">
          <v-btn variant="text" @click="detailsOpen = false">Fermer</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>
