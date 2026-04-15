<script setup lang="ts">
import type { SessionUser } from '~/types/session'

definePageMeta({ title: 'Jobs' })

const { t } = useI18n()
const { user } = useUserSession()
const sessionUser = computed(() => user.value as SessionUser | null)
const isRoot = computed(
  () => sessionUser.value?.roles?.includes('ROLE_ROOT') ?? false,
)

const jobsNavItems = computed(() => [
  {
    title: t('world.jobs.nav.overview', 'Overview Jobs'),
    to: '/world/jobs',
    icon: 'mdi-view-dashboard-outline',
  },
  {
    title: t('world.jobs.nav.offers', 'Offers'),
    to: '/world/jobs/offers',
    icon: 'mdi-briefcase-outline',
  },
  {
    title: t('world.jobs.nav.myOffers', 'My Offers'),
    to: '/world/jobs/my-offers',
    icon: 'mdi-account-tie-outline',
  },
  {
    title: t('world.jobs.nav.applications', 'Applications'),
    to: '/world/jobs/applications',
    icon: 'mdi-file-document-outline',
  },
  {
    title: t('world.jobs.nav.apply', 'Apply'),
    to: '/world/jobs/apply',
    icon: 'mdi-send-outline',
  },
  ...(isRoot.value
    ? [
        {
          title: t('world.jobs.nav.admin', 'Admin'),
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
    role: 'Senior Vue Engineer',
    team: 'Platform',
    applicants: 62,
    status: 'Open',
  },
  {
    id: 'J-101',
    role: 'Product Designer',
    team: 'Experience',
    applicants: 24,
    status: 'Interview',
  },
  {
    id: 'J-102',
    role: 'DevOps Specialist',
    team: 'Infra',
    applicants: 15,
    status: 'Closed',
  },
]
</script>

<template>
  <div>
    <WorldModuleDrawers
      :module-title="t('world.jobs.label', 'Jobs')"
      module-icon="mdi-briefcase-search-outline"
      :module-description="
        t(
          'world.jobs.moduleDescription',
          'ATS complet: offres, candidatures, suivi pipeline recrutement.',
        )
      "
      :nav-items="jobsNavItems"
      :action-label="t('world.jobs.actions.publishOffer', 'Publish new offer')"
      action-icon="mdi-briefcase-plus-outline"
    />

    <v-container fluid>
      <v-row class="mb-4">
        <v-col cols="12" md="3"
          ><v-card class="pa-3 postcard-gradient-card" rounded="xl"
            ><p class="text-caption mb-1">
              {{ t('world.jobs.kpis.openOffers', 'Open offers') }}
            </p>
            <h3 class="text-h5">18</h3></v-card
          ></v-col
        >
        <v-col cols="12" md="3"
          ><v-card class="pa-3 postcard-gradient-card" rounded="xl"
            ><p class="text-caption mb-1">
              {{ t('world.jobs.kpis.newApplications', 'New applications') }}
            </p>
            <h3 class="text-h5">94</h3></v-card
          ></v-col
        >
        <v-col cols="12" md="3"
          ><v-card class="pa-3 postcard-gradient-card" rounded="xl"
            ><p class="text-caption mb-1">
              {{ t('world.jobs.kpis.interviewsWeek', 'Interviews this week') }}
            </p>
            <h3 class="text-h5">27</h3></v-card
          ></v-col
        >
        <v-col cols="12" md="3"
          ><v-card class="pa-3 postcard-gradient-card" rounded="xl"
            ><p class="text-caption mb-1">
              {{ t('world.jobs.kpis.offerAcceptance', 'Offer acceptance') }}
            </p>
            <h3 class="text-h5">68%</h3></v-card
          ></v-col
        >
      </v-row>

      <WorldFeatureScaffold
        :title="t('world.jobs.home.title', 'Hiring Command Center')"
        :subtitle="
          t(
            'world.jobs.home.subtitle',
            'Gestion professionnelle des offres et candidatures comme un vrai ATS.',
          )
        "
        :form-title="t('world.jobs.home.formTitle', 'Create job offer')"
        :form-description="
          t(
            'world.jobs.home.formDescription',
            'Définis le poste, niveau, mode de travail et rémunération cible.',
          )
        "
        :fields="[
          {
            key: 'title',
            label: t('world.jobs.form.jobTitle', 'Job title'),
            type: 'text',
          },
          {
            key: 'department',
            label: t('world.jobs.form.department', 'Department'),
            type: 'text',
          },
          {
            key: 'seniority',
            label: t('world.jobs.form.seniority', 'Seniority'),
            type: 'select',
            options: [
              {
                title: t('world.jobs.seniority.junior', 'Junior'),
                value: 'junior',
              },
              { title: t('world.jobs.seniority.mid', 'Mid'), value: 'mid' },
              {
                title: t('world.jobs.seniority.senior', 'Senior'),
                value: 'senior',
              },
            ],
          },
          {
            key: 'salary',
            label: t('world.jobs.form.salary', 'Salary (annual)'),
            type: 'number',
          },
          {
            key: 'deadline',
            label: t('world.jobs.form.deadline', 'Application deadline'),
            type: 'date',
          },
          {
            key: 'description',
            label: t('world.jobs.form.roleDescription', 'Role description'),
            type: 'textarea',
          },
        ]"
        :headers="[
          { title: t('world.common.table.id', 'ID'), key: 'id' },
          { title: t('world.jobs.table.role', 'Role'), key: 'role' },
          { title: t('world.jobs.table.team', 'Team'), key: 'team' },
          {
            title: t('world.jobs.table.applicants', 'Applicants'),
            key: 'applicants',
          },
          { title: t('world.jobs.table.status', 'Status'), key: 'status' },
        ]"
        :rows="rows"
        :create-label="t('world.jobs.actions.publish', 'Publish offer')"
      />
    </v-container>
  </div>
</template>
