<script setup lang="ts">
import type {
  RecruitContractType,
  RecruitExperienceLevel,
  RecruitJob,
  RecruitJobsListResponse,
  RecruitWorkMode,
} from '~/types/world/jobs'

definePageMeta({
  layout: 'job',
  title: 'Jobs Offers',
  description:
    'Search Bro World Jobs offers by role, contract, experience level, work mode, and recruitment criteria.',
  keywords:
    'Bro World Jobs offers, job board, recruitment, job search, contract jobs, remote jobs',
  robots: { index: true, follow: true, 'max-image-preview': 'large' },
  sitemap: { changefreq: 'daily', priority: 0.7 },
})

const { t } = useI18n()
const { scopedRecruitPath } = useRecruitScopedApi()

const jobsNavItems = [
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
const filterMenuProps = {
  contentClass: 'jobs-offers-filter-menu',
}

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
      scopedRecruitPath('/public/jobs'),
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
    errorMessage.value = t('world.jobs.offers.errors.loading')
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

function applyFilters() {
  page.value = 1
  fetchJobs()
}

watch(page, () => fetchJobs())

await fetchJobs()
</script>

<template>
  <div>
    <WorldModuleShell
      :module-title="t('world.jobs.title')"
      module-path="/world/jobs"
      module-icon="mdi-briefcase-search-outline"
      :module-description="t('world.jobs.description')"
      :nav-items="jobsNavItems"
      :action-label="t('world.jobs.offers.actions.create')"
    >
      <template #right>
        <h3 class="text-subtitle-1 font-weight-bold mb-3">
          {{ t('world.jobs.offers.filters.title') }}
        </h3>
        <div class="d-flex flex-column ga-3">
          <AppSelect
            v-model="workMode"
            :items="workModeOptions"
            :label="t('world.jobs.offers.filters.workMode')"
            :menu-props="filterMenuProps"
            clearable
            hide-details
          />
          <AppSelect
            v-model="contractType"
            :items="contractTypeOptions"
            :label="t('world.jobs.offers.filters.contractType')"
            :menu-props="filterMenuProps"
            clearable
            hide-details
          />
          <AppSelect
            v-model="experienceLevel"
            :items="experienceOptions"
            :label="t('world.jobs.offers.filters.experience')"
            :menu-props="filterMenuProps"
            clearable
            hide-details
          />
          <v-btn color="primary" block @click="applyFilters">
            {{ t('world.jobs.offers.filters.apply') }}
          </v-btn>
          <v-btn variant="tonal" block @click="resetFilters">
            {{ t('world.jobs.offers.filters.reset') }}
          </v-btn>
        </div>
      </template>
    </WorldModuleShell>

    <v-container fluid>
      <WorldCard extra-class="mb-4 pa-4">
        <v-text-field
          v-model="q"
          :label="t('world.jobs.offers.search.label')"
          prepend-inner-icon="mdi-magnify"
          clearable
          hide-details
          @keyup.enter="applyFilters"
        />
      </WorldCard>

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
          <WorldCard extra-class="h-100">
            <div class="d-flex align-start ga-4 pa-4 pb-0">
              <v-avatar
                size="72"
                rounded="lg"
                color="surface-variant"
                class="job-company-logo"
              >
                <v-img
                  v-if="job.company.logo"
                  :src="job.company.logo"
                  :alt="`${job.company.name} logo`"
                  cover
                />
                <v-icon v-else icon="mdi-domain" size="34" />
              </v-avatar>
              <div class="flex-grow-1">
                <v-card-title class="text-wrap pb-1 px-0 pt-0">
                  {{ job.title }}
                </v-card-title>
                <v-card-subtitle class="pb-0 px-0">
                  {{ job.company.name }} • {{ job.location }} •
                  {{ job.postedAtLabel }}
                </v-card-subtitle>
              </div>
            </div>
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
                {{ t('world.jobs.offers.actions.viewDetails') }}
              </v-btn>
            </v-card-actions>
          </WorldCard>
        </v-col>
      </v-row>

      <v-card
        v-if="!loading && !jobs.length"
        rounded="xl"
        class="pa-6 text-center"
      >
        {{ t('world.jobs.offers.empty') }}
      </v-card>

      <div class="d-flex justify-center py-4">
        <WorldPagination v-model="page" :length="totalPages" />
      </div>

      <div class="text-center text-caption text-medium-emphasis pb-6">
        {{ t('world.jobs.offers.total', { count: totalItems }) }}
      </div>
    </v-container>
  </div>
</template>

<style scoped>
:deep(.jobs-offers-filter-menu) {
  border-radius: 14px;
  border: 1px solid rgba(var(--v-border-color), 0.32);
  background:
    linear-gradient(
      240deg,
      rgba(var(--v-theme-primary), 0.12) 0%,
      transparent 28%
    ),
    color-mix(in srgb, rgb(var(--v-theme-surface)) 88%, transparent);
  box-shadow:
    0 18px 42px rgba(0, 0, 0, 0.3),
    0 0 0 1px rgba(var(--v-theme-primary), 0.14) inset;
  backdrop-filter: blur(32px);
  -webkit-backdrop-filter: blur(32px);
}

:deep(.jobs-offers-filter-menu .v-list) {
  background: transparent !important;
}

.job-company-logo {
  border: 1px solid rgba(var(--v-border-color), 0.28);
  flex-shrink: 0;
}
</style>
