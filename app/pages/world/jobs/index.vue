<script setup lang="ts">
import type { SessionUser } from '~/types/session'

definePageMeta({ title: 'world.jobs.label' })

const { t } = useI18n()
const { user } = useUserSession()
const sessionUser = computed(() => user.value as SessionUser | null)
const isRoot = computed(
  () => sessionUser.value?.roles?.includes('ROLE_ROOT') ?? false,
)

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
  ...(isRoot.value
    ? [
        {
          title: t('world.jobs.nav.admin'),
          to: '/world/jobs/admin',
          icon: 'mdi-shield-crown-outline',
          rootOnly: true,
        },
      ]
    : []),
])

const rows = [
  {
    id: 'J-100',
    role: t('world.jobs.sampleRows.j100.role'),
    team: t('world.jobs.sampleRows.j100.team'),
    applicants: 62,
    status: t('world.jobs.sampleRows.j100.status'),
  },
  {
    id: 'J-101',
    role: t('world.jobs.sampleRows.j101.role'),
    team: t('world.jobs.sampleRows.j101.team'),
    applicants: 24,
    status: t('world.jobs.sampleRows.j101.status'),
  },
  {
    id: 'J-102',
    role: t('world.jobs.sampleRows.j102.role'),
    team: t('world.jobs.sampleRows.j102.team'),
    applicants: 15,
    status: t('world.jobs.sampleRows.j102.status'),
  },
]
</script>

<template>
  <div>
    <WorldModuleDrawers
      :module-title="t('world.jobs.label')"
      module-icon="mdi-briefcase-search-outline"
      :module-description="t('world.jobs.moduleDescription')"
      :nav-items="jobsNavItems"
      :action-label="t('world.jobs.actions.publishOffer')"
      action-icon="mdi-briefcase-plus-outline"
    />

    <v-container fluid>
      <v-row class="mb-4">
        <v-col cols="12" md="3"
          ><v-card class="pa-3 postcard-gradient-card" rounded="xl"
            ><p class="text-caption mb-1">
              {{ t('world.jobs.kpis.openOffers') }}
            </p>
            <h3 class="text-h5">18</h3></v-card
          ></v-col
        >
        <v-col cols="12" md="3"
          ><v-card class="pa-3 postcard-gradient-card" rounded="xl"
            ><p class="text-caption mb-1">
              {{ t('world.jobs.kpis.newApplications') }}
            </p>
            <h3 class="text-h5">94</h3></v-card
          ></v-col
        >
        <v-col cols="12" md="3"
          ><v-card class="pa-3 postcard-gradient-card" rounded="xl"
            ><p class="text-caption mb-1">
              {{ t('world.jobs.kpis.interviewsWeek') }}
            </p>
            <h3 class="text-h5">27</h3></v-card
          ></v-col
        >
        <v-col cols="12" md="3"
          ><v-card class="pa-3 postcard-gradient-card" rounded="xl"
            ><p class="text-caption mb-1">
              {{ t('world.jobs.kpis.offerAcceptance') }}
            </p>
            <h3 class="text-h5">68%</h3></v-card
          ></v-col
        >
      </v-row>

      <WorldFeatureScaffold
        :title="t('world.jobs.home.title')"
        :subtitle="t('world.jobs.home.subtitle')"
        :form-title="t('world.jobs.home.formTitle')"
        :form-description="t('world.jobs.home.formDescription')"
        :fields="[
          {
            key: 'title',
            label: t('world.jobs.form.jobTitle'),
            type: 'text',
          },
          {
            key: 'department',
            label: t('world.jobs.form.department'),
            type: 'text',
          },
          {
            key: 'seniority',
            label: t('world.jobs.form.seniority'),
            type: 'select',
            options: [
              {
                title: t('world.jobs.seniority.junior'),
                value: 'junior',
              },
              { title: t('world.jobs.seniority.mid'), value: 'mid' },
              {
                title: t('world.jobs.seniority.senior'),
                value: 'senior',
              },
            ],
          },
          {
            key: 'salary',
            label: t('world.jobs.form.salary'),
            type: 'number',
          },
          {
            key: 'deadline',
            label: t('world.jobs.form.deadline'),
            type: 'date',
          },
          {
            key: 'description',
            label: t('world.jobs.form.roleDescription'),
            type: 'textarea',
          },
        ]"
        :headers="[
          { title: t('world.common.table.id'), key: 'id' },
          { title: t('world.jobs.table.role'), key: 'role' },
          { title: t('world.jobs.table.team'), key: 'team' },
          {
            title: t('world.jobs.table.applicants'),
            key: 'applicants',
          },
          { title: t('world.jobs.table.status'), key: 'status' },
        ]"
        :rows="rows"
        :create-label="t('world.jobs.actions.publish')"
      />
    </v-container>
  </div>
</template>
